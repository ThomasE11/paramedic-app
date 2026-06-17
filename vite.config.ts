import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"

/**
 * Dev-only ElevenLabs TTS proxy.
 *
 * The API key lives ONLY in the dev server's environment (read from .env via
 * loadEnv) and is NEVER bundled into the client. The browser calls the local
 * `/api/tts` endpoint; this middleware forwards to ElevenLabs with the key
 * attached server-side and streams the MP3 back. Production uses the matching
 * Vercel Functions in `api/tts/`. When no key is configured it returns 503 so
 * the client cleanly falls back to Supertonic → Web Speech.
 *
 * Configure by adding to `.env.local` (gitignored):
 *   ELEVENLABS_API_KEY=sk-...
 * Optional overrides:
 *   ELEVENLABS_MODEL=eleven_turbo_v2_5
 *   ELEVENLABS_VOICE_DISPATCHER=<voiceId>
 *   ELEVENLABS_VOICE_PATIENT=<voiceId>
 *   ELEVENLABS_VOICE_NARRATOR=<voiceId>
 */
function elevenLabsTtsProxy(env: Record<string, string>): Plugin {
  const KEY = env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY || ''
  const MODEL = env.ELEVENLABS_MODEL || process.env.ELEVENLABS_MODEL || 'eleven_turbo_v2_5'
  const VOICES: Record<string, string> = {
    // Long-standing ElevenLabs default voices (overridable via env).
    dispatcher: env.ELEVENLABS_VOICE_DISPATCHER || 'pNInz6obpgDQGcFmaJgB', // Adam — clear male
    patient: env.ELEVENLABS_VOICE_PATIENT || '21m00Tcm4TlvDq8ikWAM',       // Rachel — female
    narrator: env.ELEVENLABS_VOICE_NARRATOR || 'EXAVITQu4vr4xnSDxMaL',     // Sarah — neutral
  }

  return {
    name: 'elevenlabs-tts-proxy',
    configureServer(server) {
      // Health/config probe — the client uses this to decide whether to route
      // narration through ElevenLabs. Registered before /api/tts so the more
      // specific path wins.
      server.middlewares.use('/api/tts/health', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: !!KEY, provider: 'elevenlabs', model: MODEL }))
      })

      server.middlewares.use('/api/tts', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return }
        if (!KEY) { res.statusCode = 503; res.end('ELEVENLABS_API_KEY not set'); return }
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', async () => {
          try {
            const { text, role } = JSON.parse(body || '{}') as { text?: string; role?: string }
            if (!text || !text.trim()) { res.statusCode = 400; res.end('no text'); return }
            const voiceId = VOICES[role ?? 'narrator'] || VOICES.narrator
            const upstream = await fetch(
              `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=2`,
              {
                method: 'POST',
                headers: {
                  'xi-api-key': KEY,
                  'Content-Type': 'application/json',
                  Accept: 'audio/mpeg',
                },
                body: JSON.stringify({
                  text,
                  model_id: MODEL,
                  voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0, use_speaker_boost: true },
                }),
              },
            )
            if (!upstream.ok || !upstream.body) {
              const errTxt = await upstream.text().catch(() => '')
              res.statusCode = upstream.status || 502
              res.end(`elevenlabs error: ${errTxt.slice(0, 400)}`)
              return
            }
            res.statusCode = 200
            res.setHeader('Content-Type', 'audio/mpeg')
            res.setHeader('Cache-Control', 'no-store')
            const reader = (upstream.body as ReadableStream<Uint8Array>).getReader()
            for (;;) {
              const { done, value } = await reader.read()
              if (done) break
              if (value) res.write(Buffer.from(value))
            }
            res.end()
          } catch (e) {
            res.statusCode = 500
            res.end(`tts proxy error: ${(e as Error).message}`)
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (incl. non-VITE_ secrets like ELEVENLABS_API_KEY) for
  // server-side use only — they are not exposed to the client bundle.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: process.env.GITHUB_PAGES ? '/paramedic-app/' : '/',
    plugins: [react(), elevenLabsTtsProxy(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ['react-i18next', 'html-parse-stringify', 'void-elements'],
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
        resolveDependencies: (_filename: string, deps: string[]) => deps.filter((dep) => {
          return !/vendor-(three|pdf)|cases-|StudentPanel|ClassroomHost|ClassroomVideoTiles|pdf-export|ClinicalReferenceDialog|CaseDisplay|SessionSummary|InstructorNotesPanel/.test(dep)
        }),
      },
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('/src/data/cases.ts')
              || id.includes('/src/data/enhancedCases.ts')
              || id.includes('/src/data/additionalCases.ts')
              || id.includes('/src/data/firstYearCases.ts')
              || id.includes('/src/data/secondYearCases.ts')
              || id.includes('/src/data/litflCases.ts')
              || id.includes('/src/data/severityVariantCases.ts')) {
              return 'cases'
            }
            if (!id.includes('node_modules')) return undefined
            if (id.includes('/three/') || id.includes('node_modules/three')) return 'vendor-three'
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf'
            return undefined
          },
        },
      },
    },
  }
})
