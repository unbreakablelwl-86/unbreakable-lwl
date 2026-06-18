import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React + Router
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI framework (all Radix primitives)
          'vendor-ui': [
            '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs', '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion', '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar', '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible', '@radix-ui/react-popover',
            '@radix-ui/react-select', '@radix-ui/react-switch',
            '@radix-ui/react-toggle', '@radix-ui/react-toggle-group',
            '@radix-ui/react-scroll-area', '@radix-ui/react-slider',
            '@radix-ui/react-progress', '@radix-ui/react-radio-group',
            '@radix-ui/react-toast', '@radix-ui/react-label',
            '@radix-ui/react-separator', '@radix-ui/react-slot',
          ],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // Charts & data viz
          'vendor-charts': ['recharts'],
          // Query
          'vendor-query': ['@tanstack/react-query'],
          // Animation
          'vendor-motion': ['framer-motion'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // Forms
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Markdown
          'vendor-markdown': ['react-markdown'],
        },
      },
    },
    // Raise chunk size warning limit (default 500kB)
    chunkSizeWarningLimit: 800,
  },
}));
