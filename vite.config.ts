import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), viteSingleFile()],
    base: './', // Force relative paths for Power Pages compatibility
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: undefined, // Disable code splitting for single file output
            },
        },
        chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
    },
    server: {
        port: 3000,
        host: true,
        open: true,
    },
    preview: {
        port: 3000,
        host: true,
    },
    define: {
        // Ensure environment variables are available at build time
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
})


