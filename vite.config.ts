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
        return !/vendor-(three|pdf)|cases-|StudentPanel|ClassroomHost|ClassroomVideoTiles|pdf-export|ClinicalReferenceDialog|CaseDisplay|SessionSummary|InstructorNotesPanel/.test(dep);
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
        // Keep the chunk strategy CONSERVATIVE: Rollup's default share-
        // graph handles React + everything that depends on React
        // correctly out of the box. Any attempt to carve React or its
        // peers (Radix, sonner, i18next, etc.) into separate chunks
        // created circular init orders and "Cannot access X before
        // initialization" crashes on first paint.
        //
        // Only split:
        //   (1) the big case bundle — purely static data, no deps on
        //       anything React-ish, safe to lazy-load.
        //   (2) three.js and jspdf+html2canvas — both are fully
        //       self-contained heavy libs that only run on specific
        //       screens (3D body, PDF export) and have no upstream
        //       React coupling.
        // Everything else stays in the single default vendor chunk so
        // the load graph is linear and deterministic.
        manualChunks: (id: string) => {
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
          if (id.includes('/three/') || id.includes('node_modules/three')) return 'vendor-three';
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
          return undefined;
        },
      },
    },
  },
});
