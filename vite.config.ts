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
    // Filter modulepreload: Vite's default preloads the *entire* lazy
    // dependency graph into the initial HTML — so even though StudentPanel
    // / pdf-export / three.js are lazy at runtime, the browser still
    // downloads them on first paint. For students on 4G joining a
    // classroom, we want the truly lazy chunks to stay lazy. Strip
    // heavy vendor/lazy chunks from the preload list; React / Supabase
    // / Radix still preload because every route needs them.
    modulePreload: {
      resolveDependencies: (_filename, deps) => deps.filter((dep) => {
        return !/vendor-(three|pdf|other|supabase)|cases-|StudentPanel|ClassroomHost|ClassroomVideoTiles|pdf-export|ClinicalReferenceDialog|CaseDisplay|SessionSummary|InstructorNotesPanel/.test(dep);
      }),
    },
    rollupOptions: {
      output: {
        // Split the vendor code into stable, cache-friendly chunks. Before
        // this, one 1.78 MB index chunk held React, three.js, Radix-UI,
        // Supabase realtime, framer-motion, and recharts — a single line
        // change anywhere invalidated the entire vendor bundle for
        // returning students on 4G. These groupings cache independently
        // and load lazily when their route actually uses them.
        manualChunks: (id: string) => {
          // Split the enormous case bundle + its satellite case files
          // into one 'cases' chunk. This gets loaded lazily by StudentPanel
          // / ClassroomLobby / App.tsx's loadCases() — without this manual
          // chunk, Rollup kept inlining case data into the entry chunk
          // because multiple lazy routes depend on it.
          if (id.includes('/src/data/cases.ts')
            || id.includes('/src/data/enhancedCases.ts')
            || id.includes('/src/data/additionalCases.ts')
            || id.includes('/src/data/firstYearCases.ts')
            || id.includes('/src/data/secondYearCases.ts')
            || id.includes('/src/data/litflCases.ts')
            || id.includes('/src/data/severityVariantCases.ts')) {
            return 'cases';
          }
          if (!id.includes('node_modules')) return undefined;
          // Merge React + Radix into one chunk. Radix components import
          // React hooks eagerly, and Rollup's split creates a circular
          // load order between the two chunks (vendor-radix trying to
          // read a React internal before vendor-react has finished
          // initialising its exports). Symptom was a fatal
          // "Cannot access 'xt' before initialization" on first paint.
          if (id.includes('react-dom') || id.match(/\/react\//) || id.includes('scheduler') || id.includes('@radix-ui')) return 'vendor-react';
          if (id.includes('three')) return 'vendor-three';
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
