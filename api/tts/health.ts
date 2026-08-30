import type { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  const key = process.env.ELEVENLABS_API_KEY?.trim() || '';
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({
    // Do not route narration into an account/key ID accidentally pasted into
    // the secret slot. ElevenLabs secret keys use the documented sk_ prefix.
    ok: /^sk_[A-Za-z0-9_-]{20,}$/.test(key),
    provider: 'elevenlabs',
    model: process.env.ELEVENLABS_MODEL || 'eleven_turbo_v2_5',
  }));
}
