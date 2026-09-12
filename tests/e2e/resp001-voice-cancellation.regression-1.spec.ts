import { expect, test } from '@playwright/test';

test.use({ video: 'on' });

function shortAudio() {
  const data = Buffer.alloc(44 + 16000 * 2);
  data.write('RIFF'); data.writeUInt32LE(data.length - 8, 4); data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22);
  data.writeUInt32LE(16000, 24); data.writeUInt32LE(32000, 28);
  data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34);
  data.write('data', 36); data.writeUInt32LE(data.length - 44, 40);
  for (let i = 0; i < 16000; i++) data.writeInt16LE(Math.round(Math.sin(i * Math.PI * 2 * 180 / 16000) * 8000), 44 + i * 2);
  return data;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'true');
    const pending = new Set<string>();
    let created = 0;
    const connected = new Set<MediaElementAudioSourceNode>();
    let sourceCount = 0;
    const createSource = AudioContext.prototype.createMediaElementSource;
    AudioContext.prototype.createMediaElementSource = function (element) {
      const source = createSource.call(this, element);
      sourceCount++;
      const connect = source.connect.bind(source);
      const disconnect = source.disconnect.bind(source);
      source.connect = ((...args: Parameters<typeof connect>) => {
        connected.add(source);
        return connect(...args);
      }) as typeof source.connect;
      source.disconnect = (() => { connected.delete(source); disconnect(); }) as typeof source.disconnect;
      return source;
    };
    const create = URL.createObjectURL.bind(URL);
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = blob => {
      const url = create(blob);
      if (blob instanceof Blob && blob.type.startsWith('audio/')) { pending.add(url); created++; }
      return url;
    };
    URL.revokeObjectURL = url => { pending.delete(url); revoke(url); };
    Object.assign(window, { voiceResourceProbe: () => ({ created, pending: pending.size, connected: connected.size, sourceCount }) });
  });
});

function resources(page: import('@playwright/test').Page) {
  return page.evaluate(() => (window as unknown as {
    voiceResourceProbe: () => { created: number; pending: number; connected: number; sourceCount: number };
  }).voiceResourceProbe());
}

test('muting a pending local patient answer releases its late audio without playback', async ({ page }, info) => {
  test.setTimeout(90_000);
  await page.route('**/api/tts/health', route => route.fulfill({ json: { ok: false } }));
  await page.route('**/api/supertonic/health', route => route.fulfill({ json: { ok: true } }));
  let resolveRequest!: () => void;
  const requested = new Promise<void>(resolve => { resolveRequest = resolve; });
  let releaseResponse!: () => void;
  const responseAllowed = new Promise<void>(resolve => { releaseResponse = resolve; });
  await page.route('http://127.0.0.1:7788/v1/tts', async route => {
    resolveRequest();
    await responseAllowed;
    await route.fulfill({ contentType: 'audio/wav', body: shortAudio(), headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  await page.goto('/?devLiveCase=resp-001');
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  const panel = page.locator('.bedside-history-panel');
  await panel.getByRole('textbox').fill('What happened?');
  await panel.getByRole('button', { name: 'Send question', exact: true }).click();
  await requested;
  await panel.getByRole('button', { name: 'Mute patient voice', exact: true }).click();
  releaseResponse();
  await expect.poll(async () => (await resources(page)).created).toBeGreaterThan(0);
  await expect.poll(async () => (await resources(page)).pending).toBe(0);
  expect((await resources(page)).sourceCount).toBe(0);
  await expect(panel.getByRole('status')).toContainText('Voice muted');
  await page.screenshot({ path: info.outputPath('cancelled-answer.png') });
});

for (const engine of ['cloud', 'local']) {
  test(`${engine} patient answers release media connections on completion and interruption`, async ({ page }, info) => {
    test.setTimeout(120_000);
    await page.route('**/api/tts/health', route => route.fulfill({ json: { ok: engine === 'cloud' } }));
    await page.route('**/api/supertonic/health', route => route.fulfill({ json: { ok: true } }));
    await page.route(engine === 'cloud' ? '**/api/tts' : 'http://127.0.0.1:7788/v1/tts', route =>
      route.fulfill({ contentType: 'audio/wav', body: shortAudio(), headers: { 'Access-Control-Allow-Origin': '*' } }));
    await page.goto('/?devLiveCase=resp-001');
    await page.getByRole('tab', { name: 'History', exact: true }).click();
    const panel = page.locator('.bedside-history-panel');
    for (let i = 0; i < 20; i++) {
      await panel.getByRole('textbox').fill('What happened?');
      await panel.getByRole('button', { name: 'Send question', exact: true }).click();
      await expect(panel.getByRole('status')).toContainText('Patient speaking');
      expect((await resources(page)).connected).toBe(1);
      if (i % 2 === 0) {
        await panel.getByRole('button', { name: 'Mute patient voice', exact: true }).click();
        await expect.poll(async () => (await resources(page)).connected).toBe(0);
        await panel.getByRole('button', { name: 'Enable patient voice', exact: true }).click();
      } else {
        await expect(panel.getByRole('status')).toContainText('Ready for a question');
      }
      await expect.poll(async () => (await resources(page)).pending).toBe(0);
      expect((await resources(page)).connected).toBe(0);
    }
    expect((await resources(page)).sourceCount).toBe(20);
    await info.attach('voice-resources.json', { body: JSON.stringify(await resources(page)), contentType: 'application/json' });
    await page.screenshot({ path: info.outputPath('repeated-interview.png') });
  });
}
