
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add CORS headers to help with PDF.js worker loading
    cors: true,
    // Add headers for better PDF.js compatibility
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  // Optimize dependencies to avoid issues with PDF.js
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist'],
    exclude: ['pdfjs-dist/build/pdf.worker.js'],
  },
  // Add worker configuration for better PDF.js support
  worker: {
    format: 'es',
    plugins: () => [react()],
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Enhanced build configuration for better PDF.js compatibility
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'pdf-viewer': ['react-pdf', 'pdfjs-dist'],
        },
      },
    },
    // Increase chunk size warning limit for PDF.js
    chunkSizeWarningLimit: 1600,
  },
  // Define global constants for better PDF.js worker handling
  define: {
    global: 'globalThis',
  },
}));
