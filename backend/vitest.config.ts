import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        globalSetup: ['./src/__tests__/setup/globalSetup.ts'],
        setupFiles: ['./src/__tests__/setup/setupFiles.ts'],
        hookTimeout: 60000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules',
                'dist',
                'src/db/migrations/**',
                '**/*.config.ts',
                'src/server.ts',
            ],
        },  
        testTimeout: 30000,
        exclude: ['node_modules', 'dist'],
        fileParallelism: false,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});