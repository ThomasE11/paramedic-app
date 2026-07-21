import { describe, it, expect } from 'vitest';
import { loadAllCases } from './caseLibrary';

describe('caseLibrary loader cache', () => {
  it('resolves once and returns the same array reference', async () => {
    const a = await loadAllCases();
    const b = await loadAllCases();
    expect(a).toBe(b); // same reference => cached, not re-imported
    expect(a.length).toBeGreaterThan(0);
  });
});
