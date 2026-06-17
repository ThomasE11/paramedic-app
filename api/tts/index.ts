import type { IncomingMessage, ServerResponse } from 'node:http';

type VoiceRole = 'dispatcher' | 'patient' | 'narrator';

type TtsRequestBody = {
  text?: string;
  role?: VoiceRole;
};

const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_turbo_v2_5';
const MAX_TEXT_CHARS = 1800;
const VOICES: Record<VoiceRole, string> = {
  dispatcher: process.env.ELEVENLABS_VOICE_DISPATCHER || 'pNInz6obpgDQGcFmaJgB',
  patient: process.env.ELEVENLABS_VOICE_PATIENT || '21m00Tcm4TlvDq8ikWAM',
  narrator: process.env.ELEVENLABS_VOICE_NARRATOR || 'EXAVITQu4vr4xnSDxMaL',
};

type BodyCarrier = IncomingMessage & {
  body?: unknown;
};

function sendText(res: ServerResponse, statusCode: number, text: string) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(text);
}

function normaliseRole(role: unknown): VoiceRole {
  return role === 'dispatcher' || role === 'patient' || role === 'narrator'
    ? role
    : 'narrator';
}

async function readBody(req: BodyCarrier): Promise<TtsRequestBody> {
  if (req.body && typeof req.body === 'object') return req.body as TtsRequestBody;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}') as TtsRequestBody;

  let raw = '';
  for await (const chunk of req) {
    raw += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    if (raw.length > MAX_TEXT_CHARS + 500) break;
  }
  return JSON.parse(raw || '{}') as TtsRequestBody;
}

export default async function handler(req: BodyCarrier, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendText(res, 405, 'Method Not Allowed');
    return;
  }

  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    sendText(res, 503, 'ELEVENLABS_API_KEY not configured');
    return;
  }

  let body: TtsRequestBody;
  try {
    body = await readBody(req);
  } catch {
    sendText(res, 400, 'Invalid JSON body');
    return;
  }

  const text = String(body.text || '').trim();
  if (!text) {
    sendText(res, 400, 'No text provided');
    return;
  }

  if (text.length > MAX_TEXT_CHARS) {
    sendText(res, 413, `Text too long. Maximum is ${MAX_TEXT_CHARS} characters.`);
    return;
  }

  const role = normaliseRole(body.role);
  const voiceId = VOICES[role];

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=2`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': key,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: MODEL,
          voice_settings: {
            stability: role === 'dispatcher' ? 0.52 : 0.44,
            similarity_boost: 0.82,
            style: role === 'patient' ? 0.18 : 0.08,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      sendText(res, upstream.status || 502, `elevenlabs error: ${errText.slice(0, 400)}`);
      return;
    }

    const audio = Buffer.from(await upstream.arrayBuffer());
    if (audio.byteLength < 64) {
      sendText(res, 502, 'Empty audio returned from ElevenLabs');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Length', String(audio.byteLength));
    res.end(audio);
  } catch (error) {
    sendText(res, 500, `tts proxy error: ${(error as Error).message}`);
  }
}
