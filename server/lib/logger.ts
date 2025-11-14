// Simple Structured Logging (Console-based)

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'http';

const isDevelopment = process.env.NODE_ENV === 'development';

interface LogContext {
  [key: string]: unknown;
}

// Simple console logger with structured format
class SimpleLogger {
  private logLevel: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'http', 'debug'];
    const currentLevel = levels.indexOf(this.logLevel);
    const messageLevel = levels.indexOf(level);
    return messageLevel <= currentLevel;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${contextStr}`;
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const fullContext = {
        ...context,
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : undefined,
      };
      console.error(this.formatMessage('error', message, fullContext));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  http(message: string, context?: LogContext): void {
    if (this.shouldLog('http')) {
      console.log(this.formatMessage('http', message, context));
    }
  }
}

// Create logger instance
export const logger = new SimpleLogger(
  (process.env.LOG_LEVEL as LogLevel) || (isDevelopment ? 'debug' : 'info')
);

// Logging methods with context
export const log = {
  error: (message: string, errorOrContext?: Error | LogContext, context?: LogContext) => {
    if (errorOrContext && 'message' in errorOrContext && 'stack' in errorOrContext) {
      // It's an Error object
      logger.error(message, errorOrContext as Error, context);
    } else {
      // It's a context object
      logger.error(message, undefined, errorOrContext as LogContext);
    }
  },

  warn: (message: string, context?: LogContext) => {
    logger.warn(message, context);
  },

  info: (message: string, context?: LogContext) => {
    logger.info(message, context);
  },

  debug: (message: string, context?: LogContext) => {
    logger.debug(message, context);
  },

  http: (message: string, context?: LogContext) => {
    logger.http(message, context);
  },
};

// Request logging middleware
interface RequestLike {
  method: string;
  originalUrl?: string;
  url: string;
  ip?: string;
  user?: { id: string };
}

interface ResponseLike {
  statusCode: number;
  on: (event: string, callback: () => void) => void;
}

export function requestLogger(req: RequestLike, res: ResponseLike, next: () => void) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, url, ip } = req;
    const { statusCode } = res;

    const context: LogContext = {
      method,
      url: originalUrl || url,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userId: req.user?.id,
    };

    const message = `${method} ${originalUrl || url}`;

    // Use explicit method calls to avoid type issues
    if (statusCode >= 500) {
      log.error(message, context);
    } else if (statusCode >= 400) {
      log.warn(message, context);
    } else {
      log.info(message, context);
    }
  });

  next();
}

// Error logging
export function logError(error: Error, context?: LogContext) {
  log.error(error.message, error, {
    name: error.name,
    ...context,
  });
}

// Database query logging
export function logQuery(query: string, duration: number, context?: LogContext) {
  const level = duration > 1000 ? 'warn' : 'debug';
  log[level]('Database query', {
    query,
    duration: `${duration}ms`,
    ...context,
  });
}

// AI API logging
export function logAIRequest(
  userId: string,
  workspaceId: string,
  prompt: string,
  response: string,
  duration: number,
  tokensUsed?: number
) {
  log.info('AI API request', {
    userId,
    workspaceId,
    promptLength: prompt.length,
    responseLength: response.length,
    duration: `${duration}ms`,
    tokensUsed,
  });
}

// Security event logging
export function logSecurityEvent(
  event: string,
  userId?: string,
  ip?: string,
  context?: LogContext
) {
  log.warn('Security event', {
    event,
    userId,
    ip,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

// Performance logging
export function logPerformance(
  operation: string,
  duration: number,
  context?: LogContext
) {
  const level = duration > 5000 ? 'warn' : 'info';
  log[level]('Performance metric', {
    operation,
    duration: `${duration}ms`,
    ...context,
  });
}

