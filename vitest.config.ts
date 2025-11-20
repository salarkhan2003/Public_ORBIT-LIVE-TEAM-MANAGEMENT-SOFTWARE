/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        css: true,
        // Mock Framer Motion
        server: {
            deps: {
                inline: ['framer-motion'],
            },
        },
        // Mock window.matchMedia
        environmentOptions: {
            jsdom: {
                url: 'http://localhost',
            },
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/dist/**',
                '**/__mocks__/**',
                '**/*.stories.*',
            ],
        },
    },
    // Add module name mapper for Framer Motion
    resolve: {
        alias: {
            'framer-motion': '/src/__mocks__/framer-motion',
        },
    },
    // Ensure test environment is properly set up
    testEnvironment: 'jsdom',
});
