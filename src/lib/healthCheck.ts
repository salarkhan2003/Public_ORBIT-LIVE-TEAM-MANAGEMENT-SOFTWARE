// Health Check and System Status Utilities

export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    checks: {
        database: boolean;
        authentication: boolean;
        storage: boolean;
        api: boolean;
    };
    errors: string[];
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
    const result: HealthCheckResult = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
            database: false,
            authentication: false,
            storage: false,
            api: false,
        },
        errors: [],
    };

    // Check database connection
    try {
        const { supabase } = await import('./supabase');
        const { error } = await supabase.from('users').select('count').limit(1).single();
        result.checks.database = !error;
        if (error) result.errors.push(`Database: ${error.message}`);
    } catch (error) {
        result.checks.database = false;
        result.errors.push(`Database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check authentication
    try {
        const { supabase } = await import('./supabase');
        const { error } = await supabase.auth.getSession();
        result.checks.authentication = !error;
        if (error) result.errors.push(`Auth: ${error.message}`);
    } catch (error) {
        result.checks.authentication = false;
        result.errors.push(`Auth: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check storage
    try {
        const { supabase } = await import('./supabase');
        const { error } = await supabase.storage.listBuckets();
        result.checks.storage = !error;
        if (error) result.errors.push(`Storage: ${error.message}`);
    } catch (error) {
        result.checks.storage = false;
        result.errors.push(`Storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check API (if backend is configured)
    try {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (apiUrl) {
            const response = await fetch(`${apiUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            result.checks.api = response.ok;
            if (!response.ok) result.errors.push(`API: HTTP ${response.status}`);
        } else {
            result.checks.api = true; // No API configured, skip check
        }
    } catch (error) {
        result.checks.api = false;
        result.errors.push(`API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Determine overall status
    const checkValues = Object.values(result.checks);
    const healthyCount = checkValues.filter(Boolean).length;

    if (healthyCount === checkValues.length) {
        result.status = 'healthy';
    } else if (healthyCount >= checkValues.length / 2) {
        result.status = 'degraded';
    } else {
        result.status = 'unhealthy';
    }

    return result;
}

/**
 * Get system information
 */
export function getSystemInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        online: navigator.onLine,
        cookiesEnabled: navigator.cookieEnabled,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        memory: (performance as any).memory ? {
            usedJSHeapSize: ((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
            totalJSHeapSize: ((performance as any).memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        } : null,
    };
}

/**
 * Monitor performance metrics
 */
export function getPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!navigation) {
        return null;
    }

    return {
        dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
        tcp: Math.round(navigation.connectEnd - navigation.connectStart),
        request: Math.round(navigation.responseStart - navigation.requestStart),
        response: Math.round(navigation.responseEnd - navigation.responseStart),
        dom: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        load: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        total: Math.round(navigation.loadEventEnd - navigation.fetchStart),
    };
}

/**
 * Check if environment variables are properly configured
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
    const required = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
    ];

    const missing = required.filter(key => !import.meta.env[key]);

    return {
        valid: missing.length === 0,
        missing,
    };
}

/**
 * Log health check to console (development only)
 */
export async function logHealthStatus() {
    if (import.meta.env.MODE !== 'development') return;

    const health = await performHealthCheck();
    const system = getSystemInfo();
    const performance = getPerformanceMetrics();
    const env = validateEnvironment();

    console.group('🏥 System Health Check');
    console.log('Status:', health.status.toUpperCase());
    console.log('Timestamp:', health.timestamp);
    console.table(health.checks);
    if (health.errors.length > 0) {
        console.error('Errors:', health.errors);
    }
    console.groupEnd();

    console.group('💻 System Information');
    console.table(system);
    console.groupEnd();

    if (performance) {
        console.group('⚡ Performance Metrics');
        console.table(performance);
        console.groupEnd();
    }

    console.group('🔧 Environment');
    console.log('Valid:', env.valid);
    if (!env.valid) {
        console.error('Missing variables:', env.missing);
    }
    console.groupEnd();
}
