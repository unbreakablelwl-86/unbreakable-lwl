import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: mode === "production" ? "hidden" : true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
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
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-charts': ['recharts'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-markdown': ['react-markdown'],
          'vendor-sentry': ['@sentry/react'],
          'vendor-date': ['date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
}));
