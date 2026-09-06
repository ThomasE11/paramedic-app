import { describe, it, expect } from 'vitest';
import { drawWound, type WoundKind } from './woundSprites';

/**
 * Spec-as-tests for the wound decal art module. The implementation draws
 * procedural wounds onto a 2D canvas context; these tests run in node with a
 * recording stub, so they verify drawing BEHAVIOUR (calls, bounds,
 * determinism) — visual quality is judged from capture screenshots later.
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
    set() { return true; }, // fillStyle / globalAlpha / lineWidth etc.
  }) as unknown as CanvasRenderingContext2D & { __calls: Call[] };
  return ctx;
}

const KINDS: WoundKind[] = ['surgical-incision', 'infected-incision', 'laceration', 'abrasion', 'bruise', 'burn', 'urticaria'];
const DRAW_OPS = new Set(['fill', 'stroke', 'arc', 'ellipse', 'lineTo', 'fillRect']);

describe('drawWound', () => {
  for (const kind of KINDS) {
    it(`${kind}: draws, balances save/restore, stays near the anchor`, () => {
      const ctx = makeRecordingCtx();
      expect(() => drawWound(ctx, kind, 512, 400, 100)).not.toThrow();
      const calls = ctx.__calls;
      const saves = calls.filter(c => c.method === 'save').length;
      const restores = calls.filter(c => c.method === 'restore').length;
      expect(saves, 'save() count').toBeGreaterThan(0);
      expect(restores, 'restore() must balance save()').toBe(saves);
      const drawing = calls.filter(c => DRAW_OPS.has(c.method));
      expect(drawing.length, 'expected real drawing work').toBeGreaterThanOrEqual(5);
      // arc/ellipse centres must stay within 1.6*size of the anchor.
      // NOTE: implementations that translate(cx, cy) first draw in LOCAL
      // coords — accept either convention by checking against both origins.
      for (const c of calls) {
        if (c.method !== 'arc' && c.method !== 'ellipse') continue;
        const [x, y] = c.args;
        const nearAnchor = Math.hypot(x - 512, y - 400) <= 160;
        const nearLocalOrigin = Math.hypot(x, y) <= 160;
        expect(nearAnchor || nearLocalOrigin, `${c.method}(${x},${y}) strayed from the wound site`).toBe(true);
      }
    });
  }

  it('rotationRad triggers rotate()', () => {
    const ctx = makeRecordingCtx();
    drawWound(ctx, 'laceration', 100, 100, 60, Math.PI / 4);
    expect(ctx.__calls.some(c => c.method === 'rotate')).toBe(true);
  });

  it('is deterministic: identical inputs produce identical call sequences', () => {
    const a = makeRecordingCtx();
    const b = makeRecordingCtx();
    drawWound(a, 'laceration', 300, 250, 80);
    drawWound(b, 'laceration', 300, 250, 80);
    expect(JSON.stringify(a.__calls)).toBe(JSON.stringify(b.__calls));
  });

  it('different anchors produce different (seeded) lacerations', () => {
    const a = makeRecordingCtx();
    const b = makeRecordingCtx();
    drawWound(a, 'laceration', 300, 250, 80);
    drawWound(b, 'laceration', 600, 700, 80);
    expect(JSON.stringify(a.__calls)).not.toBe(JSON.stringify(b.__calls));
  });
});

describe('urticaria', () => {
  it('draws multiple discrete weals, not one flat patch', () => {
    const ctx = makeRecordingCtx();
    drawWound(ctx, 'urticaria', 256, 256, 80);
    const weals = ctx.__calls.filter(c => c.method === 'ellipse').length;
    expect(weals, 'expected a scatter of weals').toBeGreaterThanOrEqual(5);
  });

  it('lays the erythematous flare down before the weals sit on it', () => {
    const ctx = makeRecordingCtx();
    drawWound(ctx, 'urticaria', 256, 256, 80);
    const methods = ctx.__calls.map(c => c.method);
    expect(methods.indexOf('fillRect')).toBeLessThan(methods.indexOf('ellipse'));
  });
});
