import { describe, expect, it, vi } from 'vitest';

import { requestGatewaySpeech } from '../../api/tts/gatewaySpeech';

const audio = Buffer.alloc(128, 7);

describe('Vercel AI Gateway speech adapter', () => {
  it('uses the official native speech protocol and decodes base64 audio', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ audio: audio.toString('base64') }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ));

    const result = await requestGatewaySpeech({
      baseUrl: 'https://ai-gateway.vercel.sh/v1',
      apiKey: 'test-key',
      model: 'openai/tts-1',
      voice: 'onyx',
      text: 'I cannot catch my breath.',
      fetchImpl,
    });

    expect(result).toEqual(audio);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://ai-gateway.vercel.sh/v4/ai/speech-model');
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer test-key',
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'ai-gateway-protocol-version': '0.0.1',
      'ai-speech-model-specification-version': '4',
      'ai-model-id': 'openai/tts-1',
    });
    expect(JSON.parse(String(init.body))).toEqual({
      text: 'I cannot catch my breath.',
      voice: 'onyx',
      outputFormat: 'mp3',
    });
  });

  it('preserves custom OpenAI-compatible speech endpoints and binary responses', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(audio, { status: 200 }));

    const result = await requestGatewaySpeech({
      baseUrl: 'https://speech.example.test/v1/',
      apiKey: 'custom-key',
      model: 'tts-custom',
      voice: 'custom-voice',
      text: 'Hello',
      fetchImpl,
    });

    expect(result).toEqual(audio);
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://speech.example.test/v1/audio/speech');
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer custom-key',
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    });
    expect(JSON.parse(String(init.body))).toEqual({
      model: 'tts-custom',
      voice: 'custom-voice',
      input: 'Hello',
      response_format: 'mp3',
    });
  });

  it.each([
    ['non-2xx response', vi.fn().mockResolvedValue(new Response('not found', { status: 404 }))],
    ['missing native audio', vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))],
    ['invalid native audio', vi.fn().mockResolvedValue(new Response('{"audio":"%%%"}', { status: 200 }))],
    ['network failure', vi.fn().mockRejectedValue(new Error('offline'))],
  ])('returns null for %s', async (_label, fetchImpl) => {
    await expect(requestGatewaySpeech({
      baseUrl: 'https://ai-gateway.vercel.sh/v1',
      apiKey: 'test-key',
      model: 'openai/tts-1',
      voice: 'onyx',
      text: 'Hello',
      fetchImpl,
    })).resolves.toBeNull();
  });

  it('does not treat lookalike hosts as the official Gateway', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(audio, { status: 200 }));

    await requestGatewaySpeech({
      baseUrl: 'https://ai-gateway.vercel.sh.example.test/v1',
      apiKey: 'test-key',
      model: 'tts-custom',
      voice: 'voice',
      text: 'Hello',
      fetchImpl,
    });

    expect(fetchImpl.mock.calls[0][0]).toBe(
      'https://ai-gateway.vercel.sh.example.test/v1/audio/speech',
    );
  });
});
