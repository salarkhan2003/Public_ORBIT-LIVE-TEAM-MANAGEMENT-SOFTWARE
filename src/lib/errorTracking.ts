import * as Sentry from '@sentry/react';

// Initialize Sentry for production error tracking
export const initErrorTracking = () => {
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    const environment = import.meta.env.MODE || 'development';

    if (sentryDsn && environment === 'production') {
        Sentry.init({
            dsn: sentryDsn,
            environment,
            // Performance Monitoring
            tracesSampleRate: 0.1, // 10% of transactions

            beforeSend(event, hint) {
                // Filter out non-critical errors
                if (event.exception && hint.originalException) {
                    const error = hint.originalException;

                    // Don't send certain errors
                    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                        return null;
                    }
                }
                return event;
            },
        });

        console.log('✅ Error tracking initialized (Sentry)');
    } else {
        console.log('ℹ️ Error tracking disabled (no DSN or not in production)');
    }
};

// Capture custom error
export const captureError = (error: Error, context?: Record<string, any>) => {
    console.error('Error captured:', error, context);

    if (import.meta.env.MODE === 'production') {
        Sentry.captureException(error, {
            extra: context,
        });
    }
};

// Capture custom message
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    console.log(`[${level.toUpperCase()}]`, message);

    if (import.meta.env.MODE === 'production') {
        Sentry.captureMessage(message, level);
    }
};

// Set user context for error tracking
export const setUserContext = (user: { id: string; email?: string; name?: string }) => {
    if (import.meta.env.MODE === 'production') {
        Sentry.setUser({
            id: user.id,
            email: user.email,
            username: user.name,
        });
    }
};

// Clear user context (on logout)
export const clearUserContext = () => {
    if (import.meta.env.MODE === 'production') {
        Sentry.setUser(null);
    }
};

// Add breadcrumb for debugging
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
    if (import.meta.env.MODE === 'production') {
        Sentry.addBreadcrumb({
            message,
            category,
            data,
            level: 'info',
        });
    }
};
