// Sentry Configuration and Error Tracking
import * as Sentry from '@sentry/react';
import React from 'react';

/**
 * Initialize Sentry for error tracking
 */
// eslint-disable-next-line react-refresh/only-export-components
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;

  if (!dsn) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || 'unknown',

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data
      if (event.request) {
        delete event.request.cookies;

        // Remove auth tokens from headers
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.Authorization;
        }
      }

      // Filter out certain errors
      if (hint.originalException) {
        const error = hint.originalException as Error;

        // Ignore network errors in development
        if (environment === 'development' && error.message.includes('NetworkError')) {
          return null;
        }

        // Ignore auth errors (expected behavior)
        if (error.message.includes('Invalid token') || error.message.includes('Unauthorized')) {
          return null;
        }
      }

      return event;
    },

    // User context
    beforeBreadcrumb(breadcrumb) {
      // Filter out console.log breadcrumbs in production
      if (environment === 'production' && breadcrumb.category === 'console') {
        return null;
      }
      return breadcrumb;
    },
  });

  console.log(`✅ Sentry initialized (${environment})`);
}

/**
 * Set user context for error tracking
 */
// eslint-disable-next-line react-refresh/only-export-components
export function setUserContext(user: {
  id: string;
  email: string;
  name?: string;
  role?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
    role: user.role,
  });
}

/**
 * Clear user context (on logout)
 */
// eslint-disable-next-line react-refresh/only-export-components
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add custom context
 */
// eslint-disable-next-line react-refresh/only-export-components
export function addContext(key: string, value: Record<string, unknown>) {
  Sentry.setContext(key, value);
}

/**
 * Capture custom error
 */
// eslint-disable-next-line react-refresh/only-export-components
export function captureError(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  }
) {
  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level || 'error',
  });
}

/**
 * Capture custom message
 */
// eslint-disable-next-line react-refresh/only-export-components
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
) {
  Sentry.captureMessage(message, {
    level,
    tags: context?.tags,
    extra: context?.extra,
  });
}

/**
 * Add breadcrumb for debugging
 */
// eslint-disable-next-line react-refresh/only-export-components
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Performance monitoring
 */
// eslint-disable-next-line react-refresh/only-export-components
export function startTransaction(name: string, operation: string) {
  return Sentry.startSpan({
    name,
    op: operation,
  }, () => {
    // Span logic here
  });
}

/**
 * Error boundary component
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

/**
 * HOC for error boundaries
 */
// eslint-disable-next-line react-refresh/only-export-components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  const FallbackComponent = fallbackComponent || DefaultErrorFallback;

  return (props: P) => (
    <Sentry.ErrorBoundary
      fallback={(fallbackProps: { error: unknown; componentStack: string; eventId: string; resetError: () => void }) =>
        <FallbackComponent
          error={fallbackProps.error as Error}
          resetError={fallbackProps.resetError}
        />
      }
    >
      <Component {...props} />
    </Sentry.ErrorBoundary>
  );
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

/**
 * Profiler for performance monitoring
 * Note: Use startSpan instead of Profiler in newer Sentry versions
 */
export function SentryProfiler({ children, name }: { children: React.ReactNode; name: string }) {
  // For newer Sentry versions, just return children wrapped in a span
  React.useEffect(() => {
    return Sentry.startSpan({ name, op: 'react.render' }, () => {
      // Span active during render
    });
  }, [name]);

  return <>{children}</>;
}

