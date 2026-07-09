/**
 * Urticaria wheal art (anaphylaxis rash — realism directive scenario 2).
 *
 * One wheal, drawn deterministically from `seed` so the same rash renders on
 * every reload (BodyMesh needs stability, like woundSprites). Clinically a
 * wheal is a pale, raised, oedematous centre surrounded by an erythematous
 * flare with an irregular border — so we draw a soft red flare, a few offset
 * border lobes for the ragged edge, then the blanched raised centre on top.
 * Worker-authored structure; PRNG + border treatment hand-patched.
 */
export function drawWheal(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, seed: number): void {
  ctx.save();
  const rnd = mulberry32(seed);

  // Erythematous flare — soft red halo that fades to nothing at the rim.
  const flare = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
  flare.addColorStop(0, 'rgba(206, 66, 55, 0.55)');
  flare.addColorStop(0.6, 'rgba(198, 74, 66, 0.34)');
  flare.addColorStop(1, 'rgba(198, 74, 66, 0)');
  ctx.fillStyle = flare;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Ragged border — a handful of small red lobes riding the flare edge, so
  // the wheal never reads as a perfect circle. Offsets stay well inside 2.2r.
  const lobes = 4 + Math.floor(rnd() * 3);
  ctx.fillStyle = 'rgba(200, 68, 60, 0.3)';
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2 + rnd() * 0.6;
    const dist = r * (0.7 + rnd() * 0.25);
    const lr = r * (0.18 + rnd() * 0.16);
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, lr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Blanched, raised centre — the pale oedematous wheal itself, on top.
  const centre = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.55);
  centre.addColorStop(0, 'rgba(238, 206, 196, 0.78)');
  centre.addColorStop(0.7, 'rgba(232, 190, 180, 0.5)');
  centre.addColorStop(1, 'rgba(226, 150, 140, 0)');
  ctx.fillStyle = centre;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** mulberry32 — small, fast, deterministic PRNG in [0, 1). */
function mulberry32(a: number): () => number {
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
