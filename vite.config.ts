import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/paramedic-app/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Bump the warning threshold — the big chunk is intentional (case data
    // bundle + engine) and the split below already peels off the obvious
    // vendor wins. Keep the warning enabled but at a less noisy level.
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        // Split the vendor code into stable, cache-friendly chunks. Before
        // this, one 1.78 MB index chunk held React, three.js, Radix-UI,
        // Supabase realtime, framer-motion, and recharts — a single line
        // change anywhere invalidated the entire vendor bundle for
        // returning students on 4G. These groupings cache independently
        // and load lazily when their route actually uses them.
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-dom') || id.match(/\/react\//) || id.includes('scheduler')) return 'vendor-react';
          if (id.includes('three')) return 'vendor-three';
          if (id.includes('@radix-ui')) return 'vendor-radix';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-recharts';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
          return 'vendor-other';
        },
      },
    },
  },
});
