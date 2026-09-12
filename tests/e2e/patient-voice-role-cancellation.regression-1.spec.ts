import { expect, test } from '@playwright/test';

function waveform() {
  const out = Buffer.alloc(44 + 16000 * 10 * 2);
  out.write('RIFF'); out.writeUInt32LE(out.length - 8, 4); out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(16000, 24); out.writeUInt32LE(32000, 28);
  out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36); out.writeUInt32LE(out.length - 44, 40);
  for (let i = 0; i < 160000; i++) out.writeInt16LE(Math.round(Math.sin(i * Math.PI * 2 * 180 / 16000) * 8000), 44 + i * 2);
  return out;
}

for (const role of ['patient', 'dispatcher', 'narrator']) {
  for (const phase of ['loading', 'speaking']) {
    test(`deterioration during ${role} ${phase} cancels only patient audio`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'true'));
      await page.route('**/voice-lifecycle-test', route => route.fulfill({ contentType: 'text/html', body:
        '<div id="voice-test-root"></div><script type="module" src="/tests/e2e/fixtures/patient-voice-lifecycle.tsx"></script>' }));
      await page.route('**/api/tts/health', route => route.fulfill({ json: { ok: true } }));
      let release!: () => void;
      const responseAllowed = new Promise<void>(resolve => { release = resolve; });
      let received!: () => void;
      const requestReceived = new Promise<void>(resolve => { received = resolve; });
      await page.route('**/api/tts', async route => {
        received();
        await responseAllowed;
        await route.fulfill({ contentType: 'audio/wav', body: waveform() });
      });
      await page.goto('/voice-lifecycle-test');
      await page.getByRole('button', { name: `Start ${role}`, exact: true }).click();
      await requestReceived;
      const playback = page.getByTestId('playback');
      if (phase === 'speaking') release();
      await expect(playback).toHaveText(`${role}: ${phase}`);
      if (role === 'patient' && phase === 'speaking') {
        await expect.poll(async () => Number(await page.getByTestId('mouth').textContent())).toBeGreaterThan(.05);
      }
      await page.getByRole('button', { name: 'Reduce responsiveness', exact: true }).click();
      await expect(page.getByTestId('communication')).toHaveText('Cannot answer');
      // Let the changed communication state commit and its passive effect run
      // before asserting preservation, which otherwise can pass on stale DOM.
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      await expect(playback).toHaveText(role === 'patient' ? 'none: idle' : `${role}: ${phase}`);
      await expect.poll(async () => Number(await page.getByTestId('mouth').textContent())).toBe(0);
      release();
      if (role !== 'patient') {
        await expect(playback).toHaveText(`${role}: speaking`);
        // Patient-only stop must check the live lane, not a stale role captured
        // when the hook mounted. Explicit global Stop still remains available.
        await page.getByRole('button', { name: 'Stop patient', exact: true }).click();
        await expect(playback).toHaveText(`${role}: speaking`);
      } else {
        await page.waitForTimeout(300);
        await expect(playback).toHaveText('none: idle');
      }
      await page.getByRole('button', { name: 'Stop all narration', exact: true }).click();
      await expect(playback).toHaveText('none: idle');
    });
  }
}
