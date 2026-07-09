import { describe, it, expect } from 'vitest';
import { drawWheal } from './urticariaSprite';

/**
 * Spec-as-tests for the urticaria wheal art (anaphylaxis rash — realism
 * directive scenario 2). Same recording-stub approach as woundSprites: verify
 * drawing BEHAVIOUR (real work, balanced save/restore, determinism, bounds) in
 * node; visual quality is judged from capture renders. One wheal = a raised,
 * erythematous ring with a paler blanched centre.
 *
 * Contract:
 *   drawWheal(ctx, cx, cy, r, seed): void
 *     - draws one urticarial wheal centred at (cx, cy), roughly radius r
 *     - MUST NOT depend on Math.random (deterministic from `seed` only —
 *       BodyMesh needs the same rash every reload, like wounds)
 *     - balances every save() with a restore()
 *     - all positional drawing stays within ~2.2r of the centre
 */
type Call = { method: string; args: number[] };

function makeRecordingCtx() {
  const calls: Call[] = [];
  const gradientStub = { addColorStop: () => {} };
  const record = (method: string) => (...args: unknown[]) => {
    calls.push({ method, args: args.filter((a): a is number => typeof a === 'number') });
    if (method === 'createRadialGradient' || method === 'createLinearGradient') return gradientStub;
    return undefined;
  };
  const ctx = new Proxy({}, {
    get(_t, prop: string) {
      if (prop === '__calls') return calls;
      return record(prop);
    },
    set() { return true; },
  }) as unknown as CanvasRenderingContext2D & { __calls: Call[] };
  return ctx;
}

const DRAW_OPS = new Set(['fill', 'stroke', 'arc', 'ellipse', 'lineTo', 'fillRect']);

describe('drawWheal', () => {
  it('draws real work and balances save/restore', () => {
    const ctx = makeRecordingCtx();
    expect(() => drawWheal(ctx, 512, 400, 60, 12345)).not.toThrow();
    const calls = ctx.__calls;
    const saves = calls.filter(c => c.method === 'save').length;
    const restores = calls.filter(c => c.method === 'restore').length;
    expect(saves, 'save() count').toBeGreaterThan(0);
    expect(restores, 'restore() must balance save()').toBe(saves);
    const drawing = calls.filter(c => DRAW_OPS.has(c.method));
    expect(drawing.length, 'expected real drawing work').toBeGreaterThanOrEqual(4);
  });

  it('is deterministic from the seed (no Math.random)', () => {
    const a = makeRecordingCtx(); drawWheal(a, 300, 300, 50, 999);
    const b = makeRecordingCtx(); drawWheal(b, 300, 300, 50, 999);
    expect(JSON.stringify(a.__calls)).toBe(JSON.stringify(b.__calls));
  });

  it('different seeds vary the shape', () => {
    const a = makeRecordingCtx(); drawWheal(a, 300, 300, 50, 1);
    const b = makeRecordingCtx(); drawWheal(b, 300, 300, 50, 2);
    expect(JSON.stringify(a.__calls)).not.toBe(JSON.stringify(b.__calls));
  });

  it('stays within ~2.2r of the anchor', () => {
    const ctx = makeRecordingCtx();
    const cx = 512, cy = 400, r = 60;
    drawWheal(ctx, cx, cy, r, 7);
    const limit = 2.2 * r;
    for (const c of ctx.__calls) {
      // arc(x,y,radius,...) and ellipse(x,y,rx,ry,...) start with a centre
      if ((c.method === 'arc' || c.method === 'ellipse') && c.args.length >= 2) {
        expect(Math.abs(c.args[0] - cx), `${c.method} x within bounds`).toBeLessThanOrEqual(limit);
        expect(Math.abs(c.args[1] - cy), `${c.method} y within bounds`).toBeLessThanOrEqual(limit);
      }
    }
  });
});
