// Rate Limiting Middleware
import { Response, NextFunction } from 'express';

// Use AuthenticatedRequest from auth.ts
interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  ip?: string;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
}

interface RateLimitOptions {
  points: number; // Number of requests
  duration: number; // Per duration in seconds
  blockDuration?: number; // Block duration in seconds if exceeded
  keyGenerator?: (req: AuthenticatedRequest) => string;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
  blockUntil?: number;
}

// Simple in-memory rate limiter
class SimpleRateLimiter {
  private storage: Map<string, RateLimitRecord> = new Map();

  constructor(
    private points: number,
    private duration: number,
    private blockDuration: number = 0
  ) {}

  async consume(key: string): Promise<{ remainingPoints: number; msBeforeNext: number }> {
    const now = Date.now();
    const record = this.storage.get(key);

    // Check if blocked
    if (record?.blockUntil && record.blockUntil > now) {
      const msBeforeNext = record.blockUntil - now;
      throw { remainingPoints: 0, msBeforeNext };
    }

    // Reset if duration passed
    if (!record || record.resetTime < now) {
      this.storage.set(key, {
        count: 1,
        resetTime: now + this.duration * 1000,
      });
      return {
        remainingPoints: this.points - 1,
        msBeforeNext: this.duration * 1000,
      };
    }

    // Increment count
    record.count++;

    // Check if limit exceeded
    if (record.count > this.points) {
      if (this.blockDuration > 0) {
        record.blockUntil = now + this.blockDuration * 1000;
      }
      const msBeforeNext = record.resetTime - now;
      throw { remainingPoints: 0, msBeforeNext };
    }

    this.storage.set(key, record);

    return {
      remainingPoints: this.points - record.count,
      msBeforeNext: record.resetTime - now,
    };
  }

  // Cleanup old entries periodically
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.storage.entries());
    for (const [key, record] of entries) {
      if (record.resetTime < now && (!record.blockUntil || record.blockUntil < now)) {
        this.storage.delete(key);
      }
    }
  }
}

// Store rate limiters
const rateLimiters = new Map<string, SimpleRateLimiter>();

/**
 * Create rate limiter middleware
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    points,
    duration,
    blockDuration = 0,
    keyGenerator = (req) => req.ip || 'unknown',
  } = options;

  const limiterKey = `${points}-${duration}`;

  if (!rateLimiters.has(limiterKey)) {
    rateLimiters.set(limiterKey, new SimpleRateLimiter(points, duration, blockDuration));
  }

  const rateLimiter = rateLimiters.get(limiterKey)!;

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const key = keyGenerator(req);

    try {
      const result = await rateLimiter.consume(key);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', points);
      res.setHeader('X-RateLimit-Remaining', result.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + result.msBeforeNext).toISOString());

      next();
    } catch (error) {
      const rejectRes = error as { remainingPoints: number; msBeforeNext: number };

      res.setHeader('X-RateLimit-Limit', points);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rejectRes.msBeforeNext).toISOString());
      res.setHeader('Retry-After', Math.ceil(rejectRes.msBeforeNext / 1000));

      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil(rejectRes.msBeforeNext / 1000)} seconds`,
        retryAfter: Math.ceil(rejectRes.msBeforeNext / 1000),
      });
    }
  };
}

/**
 * General API rate limiter - 100 requests per 15 minutes
 */
export const generalRateLimiter = createRateLimiter({
  points: 100,
  duration: 15 * 60, // 15 minutes
});

/**
 * Strict rate limiter - 10 requests per minute
 */
export const strictRateLimiter = createRateLimiter({
  points: 10,
  duration: 60, // 1 minute
  blockDuration: 60, // Block for 1 minute if exceeded
});

/**
 * Auth rate limiter - 5 requests per 5 minutes per IP
 */
export const authRateLimiter = createRateLimiter({
  points: 5,
  duration: 5 * 60,
  blockDuration: 15 * 60, // Block for 15 minutes if exceeded
  keyGenerator: (req) => req.ip || 'unknown',
});

/**
 * AI API rate limiter - per user
 */
export const aiRateLimiter = createRateLimiter({
  points: 100, // 100 requests per day per user
  duration: 24 * 60 * 60,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
});

/**
 * File upload rate limiter - 20 uploads per hour per user
 */
export const uploadRateLimiter = createRateLimiter({
  points: 20,
  duration: 60 * 60,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
});

/**
 * Per-workspace rate limiter
 */
export function createWorkspaceRateLimiter(options: Omit<RateLimitOptions, 'keyGenerator'>) {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => {
      const workspaceId = req.params?.workspaceId || req.body?.workspace_id || req.body?.group_id;
      return `workspace:${workspaceId}`;
    },
  });
}

// Cleanup function - call periodically
setInterval(() => {
  const limiters = Array.from(rateLimiters.values());
  for (const limiter of limiters) {
    limiter.cleanup();
  }
}, 60000); // Every minute

