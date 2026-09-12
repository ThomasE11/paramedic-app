import { expect, test, type Page } from '@playwright/test';
import type * as THREE from 'three';

test.use({ video: 'on', viewport: { width: 1440, height: 960 } });

async function jaw(page: Page) {
  return page.evaluate(() => {
    const scene = (window as unknown as { __r3f?: { scene: THREE.Scene } }).__r3f?.scene;
    const mesh = scene?.getObjectByName('Patient') as THREE.Mesh | undefined;
    const index = mesh?.morphTargetDictionary?.viseme_open;
    return index === undefined ? -1 : mesh!.morphTargetInfluences![index];
  });
}

// A controlled sound/silence fixture tests real AudioContext -> mesh wiring,
// not provider voice quality. No clinical audio or external service required.
function speechEnvelopeWav() {
  const rate = 16000, seconds = 5;
  const out = Buffer.alloc(44 + rate * seconds * 2);
  out.write('RIFF'); out.writeUInt32LE(out.length - 8, 4); out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28);
  out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36); out.writeUInt32LE(out.length - 44, 40);
  for (let i = 0; i < rate * seconds; i++) {
    const t = i / rate;
    const value = t >= 1 && t < 3 ? Math.sin(t * Math.PI * 2 * 180) * 8000 : 0;
    out.writeInt16LE(Math.round(value), 44 + i * 2);
  }
  return out;
}

test('patient jaw follows audible audio, not synthesis, silence or dispatch', async ({ page }, info) => {
  test.setTimeout(120_000);
  let requestedProfile: unknown;
  await page.route('**/api/tts/health', route => route.fulfill({ json: { ok: true } }));
  await page.route('**/api/tts', async route => {
    requestedProfile = route.request().postDataJSON();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await route.fulfill({ contentType: 'audio/wav', body: speechEnvelopeWav() });
  });
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => jaw(page), { timeout: 30_000 }).toBe(0);
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  const panel = page.locator('.bedside-history-panel');
  await panel.getByRole('textbox').fill('What happened?');
  await panel.getByRole('button', { name: 'Send question', exact: true }).click();
  await expect(panel.getByRole('status')).toContainText('Preparing');
  expect(await jaw(page)).toBeLessThan(.01);
  await expect(panel.getByRole('status')).toContainText('Patient speaking');
  expect(requestedProfile).toMatchObject({ role: 'patient', patientVoice: { gender: 'male' } });
  expect(await jaw(page)).toBeLessThan(.02); // first second is genuinely silent
  await expect.poll(() => jaw(page)).toBeGreaterThan(.2);
  await page.screenshot({ path: info.outputPath('patient-speaking.png') });
  await expect.poll(() => jaw(page)).toBeLessThan(.01); // closes during trailing silence
  await expect(panel.getByRole('status')).toContainText('Ready for a question');
  await page.getByRole('button', { name: 'Replay dispatch briefing', exact: true }).click();
  await page.waitForTimeout(2600); // audible section of dispatcher fixture
  expect(await jaw(page)).toBeLessThan(.01);
  await panel.getByRole('button', { name: 'Replay last answer', exact: true }).click();
  await expect.poll(() => jaw(page)).toBeGreaterThan(.2);
  await panel.getByRole('button', { name: 'Mute patient voice', exact: true }).click();
  await expect.poll(() => jaw(page)).toBeLessThan(.01);
  await expect(panel.getByRole('status')).toContainText('Voice muted');
});

async function cyanosis(page: Page) {
  return page.evaluate(() => {
    const scene = (window as unknown as { __r3f?: { scene: THREE.Scene } }).__r3f?.scene;
    const body = scene?.getObjectByName('Patient') as THREE.Mesh | undefined;
    if (!body) return null;
    const material = (Array.isArray(body.material) ? body.material[0] : body.material) as THREE.MeshStandardMaterial;
    return !!body.userData.cyanosisOpenTex && (material.map === body.userData.cyanosisOpenTex || material.map === body.userData.cyanosisClosedTex);
  });
}

test('deliberate measurements and respiratory care change the same patient', async ({ page }, info) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  await page.clock.install();
  await page.goto('/?devLiveCase=resp-001');
  const monitor = page.getByRole('region', { name: 'Vital signs monitor', exact: true });
  await expect(monitor.getByText('MONITOR OFF', { exact: true })).toBeVisible();
  await expect.poll(() => cyanosis(page), { timeout: 30_000 }).toBe(true);
  await monitor.getByRole('button', { name: 'Press ON to power the monitor' }).click();
  await page.clock.fastForward(4000);
  const saturation = monitor.getByRole('button', { name: 'Measure oxygen saturation', exact: true });
  await expect(saturation).toContainText('--');
  for (const name of ['oxygen saturation', 'respiratory rate', 'heart rate']) {
    await monitor.getByRole('button', { name: `Measure ${name}`, exact: true }).click();
  }
  await page.clock.fastForward(10_000);
  await expect(saturation).not.toContainText('--');
  await expect(monitor.getByRole('button', { name: 'Measure blood glucose', exact: true })).toContainText('--');
  await page.getByRole('tab', { name: 'Treat', exact: true }).click();
  await page.getByRole('button', { name: 'Select Non-rebreather', exact: true }).click();
  const oxygen = page.getByRole('dialog', { name: /Apply non-rebreather mask/i });
  await expect(page.locator('[data-applied-equipment="nonrebreather"]')).toHaveCount(0);
  for (const step of ['Connect oxygen tubing', 'Pre-inflate reservoir', 'Seat the mask', 'Set prescribed flow', 'Confirm response']) {
    await oxygen.getByRole('button', { name: `Perform: ${step}` }).click();
  }
  await oxygen.getByRole('button', { name: /Oxygen running — reassess SpO₂/i }).click();
  await page.clock.fastForward(90_000);
  await expect.poll(() => cyanosis(page)).toBe(false);
  await expect(page.locator('[data-applied-equipment="nonrebreather"]')).toBeVisible();
  await expect(monitor.getByText('RR 28', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Select Nebuliser Mask', exact: true }).click();
  const nebuliser = page.getByRole('dialog', { name: 'Apply nebuliser mask', exact: true });
  for (const step of ['Assemble and connect', 'Explain and coach', 'Fit the mask', 'Start aerosol flow', 'Reassess response']) {
    await nebuliser.getByRole('button', { name: `Perform: ${step}` }).click();
  }
  await nebuliser.getByRole('button', { name: 'Aerosol flowing — reassess wheeze', exact: true }).click();
  await page.clock.fastForward(15_000);
  await expect(monitor.getByText('RR 14', { exact: true })).toBeVisible();
  await expect(page.locator('[data-applied-equipment="nonrebreather"]')).toHaveCount(0);
  await expect(page.locator('[data-applied-equipment="nebulizer"]')).toBeVisible();
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  await page.getByRole('textbox', { name: 'Your question to the patient' }).fill('How do you feel?');
  await page.getByRole('button', { name: 'Send question', exact: true }).click();
  await expect(page.getByRole('log')).toContainText('Breathing feels easier now. I can talk more comfortably.');
  await page.screenshot({ path: info.outputPath('after-care.png') });
  expect(errors).toEqual([]);
});
