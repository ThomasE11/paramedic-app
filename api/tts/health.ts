import type { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({
    ok: !!process.env.ELEVENLABS_API_KEY,
    provider: 'elevenlabs',
    model: process.env.ELEVENLABS_MODEL || 'eleven_turbo_v2_5',
  }));
}
