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
          // UI framework
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-accordion'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // Charts & data viz
          'vendor-charts': ['recharts'],
          // Query
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
    // Raise chunk size warning limit (default 500kB)
    chunkSizeWarningLimit: 800,
  },
}));
