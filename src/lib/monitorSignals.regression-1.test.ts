import { describe, expect, it } from 'vitest';
import { capnographySignal, plethSignal } from './monitorSignals';

// Regression: waveform loops substituted 16 breaths/min, 60 beats/min and
// EtCO2 35 when the measured value was zero, falsely drawing normal traces.
describe('monitor traces preserve absent physiology', () => {
  it.each([0, -1, Number.NaN])('has no pulsatile pleth at pulse %s', pulse => {
    expect(plethSignal(pulse, 98)).toEqual({ cyclesPerSecond: 0, amplitude: 0 });
  });

  it('does not turn an unavailable saturation into a normal pleth', () => {
    expect(plethSignal(80, 0).amplitude).toBe(0);
    expect(plethSignal(80, Number.NaN).amplitude).toBe(0);
  });

  it.each([0, -1, Number.NaN])('draws a capnography baseline at respiratory rate %s', rate => {
    expect(capnographySignal(rate, 35)).toEqual({ cyclesPerSecond: 0, amplitude: 0 });
  });

  it.each([0, undefined, Number.NaN])('does not invent a capnogram when EtCO2 is %s', etco2 => {
    expect(capnographySignal(16, etco2).amplitude).toBe(0);
  });

  it('restores traces as live circulation and ventilation return', () => {
    expect(plethSignal(120, 95)).toEqual({ cyclesPerSecond: 2, amplitude: 0.8075 });
    expect(capnographySignal(12, 40).cyclesPerSecond).toBe(0.2);
    expect(capnographySignal(12, 40).amplitude).toBeCloseTo(0.6);
  });
});
