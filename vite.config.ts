
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
  },
  // Optimize dependencies to avoid issues with PDF.js
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist'],
  },
  // Add worker configuration for better PDF.js support
  worker: {
    format: 'es',
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
  // Add build configuration for better PDF.js compatibility
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'pdf-viewer': ['react-pdf', 'pdfjs-dist'],
        },
      },
    },
  },
}));
