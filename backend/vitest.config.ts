import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,      
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
        testTimeout: 10000, 
        exclude: ['node_modules', 'dist'],
        fileParallelism: false,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});