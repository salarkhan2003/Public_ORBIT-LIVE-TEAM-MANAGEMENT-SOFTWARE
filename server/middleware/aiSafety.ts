// AI Safety and Cost Control Middleware
import { Response, NextFunction } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

// Use AuthenticatedRequest interface
interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  supabase?: SupabaseClient;
  body?: Record<string, unknown>;
  aiUsage?: {
    daily: number;
    monthly: number;
    dailyRemaining: number;
    monthlyRemaining: number;
  };
}

interface AIQuotaConfig {
  dailyLimit: number;
  monthlyLimit: number;
  maxTokensPerRequest: number;
  cacheTTL: number;
}

const DEFAULT_QUOTA: AIQuotaConfig = {
  dailyLimit: parseInt(process.env.AI_DAILY_LIMIT || '100'),
  monthlyLimit: parseInt(process.env.AI_MONTHLY_LIMIT || '3000'),
  maxTokensPerRequest: parseInt(process.env.AI_MAX_TOKENS || '2000'),
  cacheTTL: parseInt(process.env.AI_CACHE_TTL || '86400'), // 24 hours
};

/**
 * Check AI API quota for workspace
 */
export async function checkAIQuota(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.supabase) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const workspaceId = (req.body?.workspace_id || req.body?.group_id) as string | undefined;

    if (!workspaceId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Workspace ID required',
      });
      return;
    }

    // Check daily quota
    const dailyCount = await getAIUsageCount(
      req.supabase,
      workspaceId,
      'daily'
    );

    if (dailyCount >= DEFAULT_QUOTA.dailyLimit) {
      console.warn('AI daily quota exceeded', {
        userId: req.user.id,
        workspaceId,
        dailyCount,
        limit: DEFAULT_QUOTA.dailyLimit,
      });

      res.status(429).json({
        error: 'Quota Exceeded',
        message: `Daily AI quota exceeded. Limit: ${DEFAULT_QUOTA.dailyLimit} requests/day`,
        usage: {
          daily: dailyCount,
          dailyLimit: DEFAULT_QUOTA.dailyLimit,
        },
        resetAt: getNextResetTime('daily'),
      });
      return;
    }

    // Check monthly quota
    const monthlyCount = await getAIUsageCount(
      req.supabase,
      workspaceId,
      'monthly'
    );

    if (monthlyCount >= DEFAULT_QUOTA.monthlyLimit) {
      console.warn('AI monthly quota exceeded', {
        userId: req.user.id,
        workspaceId,
        monthlyCount,
        limit: DEFAULT_QUOTA.monthlyLimit,
      });

      res.status(429).json({
        error: 'Quota Exceeded',
        message: `Monthly AI quota exceeded. Limit: ${DEFAULT_QUOTA.monthlyLimit} requests/month`,
        usage: {
          monthly: monthlyCount,
          monthlyLimit: DEFAULT_QUOTA.monthlyLimit,
        },
        resetAt: getNextResetTime('monthly'),
      });
      return;
    }

    // Attach usage info to request
    req.aiUsage = {
      daily: dailyCount,
      monthly: monthlyCount,
      dailyRemaining: DEFAULT_QUOTA.dailyLimit - dailyCount,
      monthlyRemaining: DEFAULT_QUOTA.monthlyLimit - monthlyCount,
    };

    next();
  } catch (error) {
    console.error('Error checking AI quota', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to check AI quota',
    });
  }
}

/**
 * Get AI usage count for period
 */
async function getAIUsageCount(
  supabase: SupabaseClient,
  workspaceId: string,
  period: 'daily' | 'monthly'
): Promise<number> {
  const startDate = new Date();

  if (period === 'daily') {
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  const { count, error } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .gte('created_at', startDate.toISOString());

  if (error) {
    console.error('Error fetching AI usage count', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get next quota reset time
 */
function getNextResetTime(period: 'daily' | 'monthly'): string {
  const now = new Date();

  if (period === 'daily') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  } else {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth.toISOString();
  }
}

/**
 * Mask PII in text before sending to AI
 */
export function maskPII(text: string): string {
  // Email addresses
  text = text.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '[EMAIL]');

  // Phone numbers (various formats)
  text = text.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE]');

  // SSN (US format)
  text = text.replace(/\d{3}-\d{2}-\d{4}/g, '[SSN]');

  // Credit card numbers
  text = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CREDIT_CARD]');

  // IP addresses
  text = text.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP_ADDRESS]');

  // Dates of birth (various formats)
  text = text.replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, '[DATE]');

  return text;
}

/**
 * Log AI request for audit
 */
export async function logAIRequest(
  supabase: SupabaseClient,
  data: {
    userId: string;
    workspaceId: string;
    prompt: string;
    response: string;
    model: string;
    tokensUsed?: number;
    duration: number;
    cached?: boolean;
  }
): Promise<void> {
  try {
    await supabase.from('ai_usage_logs').insert({
      user_id: data.userId,
      workspace_id: data.workspaceId,
      prompt_hash: hashString(data.prompt), // Store hash, not actual prompt
      prompt_length: data.prompt.length,
      response_length: data.response.length,
      model: data.model,
      tokens_used: data.tokensUsed,
      duration_ms: data.duration,
      cached: data.cached || false,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging AI request', error);
  }
}

/**
 * Hash string for storage
 */
function hashString(str: string): string {
  return createHash('sha256').update(str).digest('hex').substring(0, 16);
}

/**
 * Check if AI response is cached
 */
export async function checkAICache(
  supabase: SupabaseClient,
  promptHash: string,
  maxAge: number = DEFAULT_QUOTA.cacheTTL
): Promise<string | null> {
  try {
    const cutoff = new Date(Date.now() - maxAge * 1000);

    const { data, error } = await supabase
      .from('ai_response_cache')
      .select('response')
      .eq('prompt_hash', promptHash)
      .gte('created_at', cutoff.toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    return data.response;
  } catch {
    return null;
  }
}

/**
 * Cache AI response
 */
export async function cacheAIResponse(
  supabase: SupabaseClient,
  promptHash: string,
  response: string
): Promise<void> {
  try {
    await supabase.from('ai_response_cache').upsert({
      prompt_hash: promptHash,
      response,
      created_at: new Date().toISOString(),
    }, {
      onConflict: 'prompt_hash',
    });
  } catch (error) {
    console.error('Error caching AI response', error);
  }
}

/**
 * Validate AI request content
 */
export function validateAIContent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const body = req.body as { message?: string; prompt?: string };
  const { message, prompt } = body;
  const content = message || prompt;

  if (!content || typeof content !== 'string') {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Message or prompt required',
    });
    return;
  }

  if (content.length > 10000) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Message too long. Maximum 10,000 characters',
    });
    return;
  }

  // Check for malicious content
  if (containsMaliciousContent(content)) {
    console.warn('Malicious AI content detected', {
      userId: req.user?.id,
      contentLength: content.length,
    });

    res.status(400).json({
      error: 'Bad Request',
      message: 'Content contains prohibited patterns',
    });
    return;
  }

  next();
}

/**
 * Check for malicious content patterns
 */
function containsMaliciousContent(text: string): boolean {
  const maliciousPatterns = [
    /(<script|javascript:|onerror=|onclick=)/i,
    /(DROP\s+TABLE|DELETE\s+FROM|INSERT\s+INTO)/i,
    /(\.\.\/|\.\.\\)/g, // Path traversal
  ];

  return maliciousPatterns.some(pattern => pattern.test(text));
}

