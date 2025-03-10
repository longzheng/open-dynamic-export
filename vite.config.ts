import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: './dist/ui',
    },
    plugins: [
        TanStackRouterVite({
            routesDirectory: './src/ui/routes',
        }),
        react(),
        tsconfigPaths(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, `./src/ui`),
        },
    },
});
