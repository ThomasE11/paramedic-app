import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Health/config probe. The client uses `ok` to decide whether to route
 * narration through /api/tts. Reports which engines are CONFIGURED (keys
 * present and plausibly-shaped) without ever returning secret material.
 */
export default function handler(_req: IncomingMessage, res: ServerResponse) {
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY?.trim() || '';
  // Do not route narration into an account/key ID accidentally pasted into
  // the secret slot. ElevenLabs secret keys use the documented sk_ prefix.
  const elevenlabs = /^sk_[A-Za-z0-9_-]{20,}$/.test(elevenLabsKey);

  const gatewayKey = process.env.AI_GATEWAY_API_KEY?.trim() || '';
  const gateway = gatewayKey.length > 0;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({
    // ok means AT LEAST ONE upstream engine can serve /api/tts.
    ok: elevenlabs || gateway,
    provider: elevenlabs ? 'elevenlabs' : gateway ? 'ai-gateway' : 'none',
    model: process.env.ELEVENLABS_MODEL || 'eleven_turbo_v2_5',
    // Per-engine configuration flags — no secrets, just reachability hints.
    engines: {
      elevenlabs,
      // ai-gateway is the Vercel AI Gateway OpenAI speech mid-tier.
      'ai-gateway': gateway,
    },
    gatewayModel: gateway ? (process.env.AI_GATEWAY_TTS_MODEL || 'openai/tts-1') : undefined,
  }));
}
