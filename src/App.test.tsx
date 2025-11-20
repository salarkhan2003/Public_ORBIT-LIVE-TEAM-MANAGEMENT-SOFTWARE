import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import App from './App';

// Mock the supabase client to avoid environment variable issues and network calls
vi.mock('./lib/supabase', () => {
    const mockSelectReturn = {
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        order: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((callback) => Promise.resolve({ data: [], error: null }).then(callback)),
    };

    // Fix the mock chain to support chained calls properly
    mockSelectReturn.eq.mockReturnValue(mockSelectReturn);
    mockSelectReturn.neq.mockReturnValue(mockSelectReturn);
    mockSelectReturn.ilike.mockReturnValue(mockSelectReturn);
    mockSelectReturn.in.mockReturnValue(mockSelectReturn);
    mockSelectReturn.limit.mockReturnValue(mockSelectReturn);
    mockSelectReturn.order.mockReturnValue(mockSelectReturn);

    return {
        supabase: {
            auth: {
                getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
                onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
                getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
                signInWithPassword: vi.fn(),
                signOut: vi.fn(),
                signInWithOAuth: vi.fn(),
                signUp: vi.fn(),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue(mockSelectReturn),
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                        single: vi.fn().mockResolvedValue({ data: null, error: null })
                    })
                }),
                upsert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: null, error: null })
                    })
                }),
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null })
                    })
                })
            }),
            channel: vi.fn().mockReturnValue({
                on: vi.fn().mockReturnThis(),
                subscribe: vi.fn().mockReturnThis(),
                unsubscribe: vi.fn(),
            })
        },
    };
});

// Mock matchMedia for responsive design hooks
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

describe('App', () => {
    // Mock timers to handle timeouts
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        // Wrap render in act to handle state updates
        await act(async () => {
            render(<App />);
            // Advance timers to handle any timeouts
            vi.advanceTimersByTime(1000);
        });

        // The app shows "Loading ORBIT LIVE..." initially while checking auth
        await waitFor(() => {
            expect(screen.getByText(/Loading ORBIT LIVE/i)).toBeInTheDocument();
        });
    });
});
