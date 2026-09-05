/** Drawing parameters only: never substitute a normal rate for a measured
 * zero. These are simplified training traces, not a sensor model. */
function positive(value: number | undefined): number {
  return value != null && Number.isFinite(value) && value > 0 ? value : 0;
}

export function plethSignal(pulse: number, spo2: number) {
  const rate = positive(pulse);
  const saturation = positive(spo2);
  return {
    cyclesPerSecond: rate / 60,
    amplitude: rate && saturation ? Math.max(0.4, Math.min(0.85, saturation / 100 * 0.85)) : 0,
  };
}

export function capnographySignal(respiration: number, etco2: number | undefined) {
  const rate = positive(respiration);
  return {
    cyclesPerSecond: rate / 60,
    amplitude: rate ? Math.min(1, positive(etco2) / 50) * 0.75 : 0,
  };
}
