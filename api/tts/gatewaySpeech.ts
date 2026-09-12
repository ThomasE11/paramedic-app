import { Buffer } from 'node:buffer';

type Fetch = typeof fetch;

export type GatewaySpeechOptions = {
  baseUrl: string;
  apiKey: string;
  model: string;
  voice: string;
  text: string;
  fetchImpl?: Fetch;
};

const VERCEL_GATEWAY_HOST = 'ai-gateway.vercel.sh';
const VERCEL_GATEWAY_SPEECH_URL =
  'https://ai-gateway.vercel.sh/v4/ai/speech-model';

function isOfficialVercelGateway(baseUrl: string): boolean {
  return new URL(baseUrl).hostname.toLowerCase() === VERCEL_GATEWAY_HOST;
}

function decodeBase64Audio(value: unknown): Buffer | null {
  if (typeof value !== 'string') return null;
  const encoded = value.trim();
  if (!encoded || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    return null;
  }

  const audio = Buffer.from(encoded, 'base64');
  return audio.byteLength >= 64 ? audio : null;
}

/**
 * Requests speech from either Vercel's native AI Gateway speech endpoint or
 * a custom OpenAI-compatible base URL. Provider failures deliberately return
 * null so the caller can continue through its existing fallback chain.
 * Native protocol reference: vercel/ai packages/gateway/src/gateway-speech-model.ts.
 */
export async function requestGatewaySpeech({
  baseUrl,
  apiKey,
  model,
  voice,
  text,
  fetchImpl = fetch,
}: GatewaySpeechOptions): Promise<Buffer | null> {
  if (!apiKey.trim()) return null;

  try {
    if (isOfficialVercelGateway(baseUrl)) {
      const upstream = await fetchImpl(VERCEL_GATEWAY_SPEECH_URL, {
        method: 'POST',
        signal: AbortSignal.timeout(20_000),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'ai-gateway-protocol-version': '0.0.1',
          'ai-speech-model-specification-version': '4',
          'ai-model-id': model,
        },
        body: JSON.stringify({
          text,
          voice,
          outputFormat: 'mp3',
        }),
      });

      if (!upstream.ok) return null;
      const payload = await upstream.json() as { audio?: unknown };
      return decodeBase64Audio(payload.audio);
    }

    const upstream = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/audio/speech`, {
      method: 'POST',
      signal: AbortSignal.timeout(20_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        model,
        voice,
        input: text,
        response_format: 'mp3',
      }),
    });

    if (!upstream.ok) return null;
    const audio = Buffer.from(await upstream.arrayBuffer());
    return audio.byteLength >= 64 ? audio : null;
  } catch {
    return null;
  }
}
