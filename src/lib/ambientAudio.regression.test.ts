import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const audioMocks = vi.hoisted(() => {
  class FakeVector3 {
    x = 0;
    y = 0;
    z = 0;

    set(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }

    toArray() {
      return [this.x, this.y, this.z];
    }
  }

  class FakeAudio {
    buffer: unknown = null;
    isPlaying = false;
    position = new FakeVector3();
    name = '';
    userData: Record<string, unknown> = {};
    volume = 1;
    disconnected = false;
    removed = false;

    setBuffer(buffer: unknown) { this.buffer = buffer; return this; }
    setLoop() { return this; }
    setVolume(volume: number) { this.volume = volume; return this; }
    getVolume() { return this.volume; }
    setRefDistance() { return this; }
    setRolloffFactor() { return this; }
    setDistanceModel() { return this; }
    setMaxDistance() { return this; }
    play() { this.isPlaying = true; return this; }
    stop() { this.isPlaying = false; return this; }
    disconnect() { this.disconnected = true; return this; }
    removeFromParent() { this.removed = true; return this; }
  }

  const makeContext = () => ({
    sampleRate: 100,
    state: 'running',
    createBuffer: (_channels: number, length: number) => {
      const data = new Float32Array(length);
      return { getChannelData: () => data };
    },
    suspend: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
  });

  class FakeAudioListener {
    context = makeContext();
    removed = false;
    removeFromParent() { this.removed = true; }
  }

  return { FakeAudio, FakeAudioListener };
});

vi.mock('three', () => ({
  Audio: audioMocks.FakeAudio,
  PositionalAudio: audioMocks.FakeAudio,
  AudioListener: audioMocks.FakeAudioListener,
}));

vi.mock('@/data/clinicalSounds', () => ({
  registerAudioContextForUnlock: vi.fn(),
}));

import { createAmbientAudio } from './ambientAudio';

describe('ambient WebAudio state', () => {
  beforeEach(() => {
    vi.stubGlobal('document', {
      hidden: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates muted nodes that become audible when enabled later', () => {
    const state = createAmbientAudio({ enabled: false });
    state.setPatientBreath('wheeze', 32);

    expect(state.roomTone.isPlaying).toBe(true);
    expect(state.ac.isPlaying).toBe(true);
    expect(state.patient.isPlaying).toBe(true);
    expect(state.roomTone.getVolume()).toBe(0);
    expect(state.ac.getVolume()).toBe(0);
    expect(state.patient.getVolume()).toBe(0);

    state.setEnabled(true);
    expect(state.roomTone.getVolume()).toBeGreaterThan(0);
    expect(state.ac.getVolume()).toBeGreaterThan(0);
    expect(state.patient.getVolume()).toBeGreaterThan(0);

    state.setEnabled(false);
    expect(state.roomTone.getVolume()).toBe(0);
    expect(state.ac.getVolume()).toBe(0);
    expect(state.patient.getVolume()).toBe(0);
  });

  it('positions the patient emitter at the supplied chest coordinate and updates it live', () => {
    const state = createAmbientAudio({ patientPosition: [0, 0.99, 0.78] });

    expect(state.patient.position.toArray()).toEqual([0, 0.99, 0.78]);

    state.setPatientPosition([0.1, 0.82, 0.44]);
    expect(state.patient.position.toArray()).toEqual([0.1, 0.82, 0.44]);
  });
});
