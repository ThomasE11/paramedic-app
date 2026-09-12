import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 });

test('resp-001 uses a continuous topology-clipped lip cyanosis mask', async ({ page }, info) => {
  test.setTimeout(120_000);
  let cloudSpeechRequests = 0;
  page.on('request', request => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/tts') {
      cloudSpeechRequests += 1;
    }
  });
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('captureSpo2', '85');
    sessionStorage.setItem('capturePinQuality', '1');
  });

  await page.goto('/?devLiveCase=resp-001&spo2=85');
  await page.waitForFunction(() => {
    const scene = window.__r3f?.scene;
    let ready = false;
    scene?.traverse(object => {
      if ((object as import('three').Mesh).userData?.cyanosisOpenTex) ready = true;
    });
    return ready;
  });
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__r3f?.scene.userData.conversationFocus?.active))
    .toBe(true);
  await page.waitForTimeout(800);

  const topology = await page.evaluate(async () => {
    const scene = window.__r3f!.scene;
    let body: import('three').Mesh | null = null;
    scene.traverse(object => {
      const mesh = object as import('three').Mesh;
      if (!body && mesh.isMesh && mesh.userData?.cyanosisOpenTex) body = mesh;
    });
    if (!body) throw new Error('Patient cyanosis texture was not created');
    const module = await import('/src/components/Body3DModel/lipCyanosisMask.ts');
    const geometry = body.geometry as import('three').BufferGeometry;
    const triangles = module.collectContinuousLipUvTriangles(
      geometry.attributes.position,
      geometry.attributes.uv,
      geometry.index,
    );
    const coverage = triangles.map((triangle: { coverage: number }) => triangle.coverage);
    const base = body.userData.cyanosisBaseOpenTex;
    const tinted = body.userData.cyanosisOpenTex;
    const width = tinted.image.width;
    const height = tinted.image.height;
    const before = base.image.getContext('2d').getImageData(0, 0, width, height).data;
    const after = tinted.image.getContext('2d').getImageData(0, 0, width, height).data;
    const centres = triangles.filter(triangle => triangle.coverage > .5).map(triangle => {
      const u = triangle.points.reduce((sum, point) => sum + point[0], 0) / 3;
      const v = triangle.points.reduce((sum, point) => sum + point[1], 0) / 3;
      const x = Math.min(width - 1, Math.max(0, Math.floor(u * width)));
      const y = Math.min(height - 1, Math.max(0, Math.floor((tinted.flipY ? 1 - v : v) * height)));
      const offset = (y * width + x) * 4;
      return Math.abs(before[offset] - after[offset]) + Math.abs(before[offset + 1] - after[offset + 1])
        + Math.abs(before[offset + 2] - after[offset + 2]);
    });
    return {
      triangles: triangles.length,
      tintedLipFraction: centres.filter(delta => delta > 3).length / centres.length,
      minimumCoverage: Math.min(...coverage),
      meanCoverage: coverage.reduce((sum: number, value: number) => sum + value, 0) / coverage.length,
      maximumCoverage: Math.max(...coverage),
    };
  });

  expect(topology.triangles).toBeGreaterThan(8);
  expect(topology.tintedLipFraction).toBeGreaterThan(.9);
  expect(topology.minimumCoverage).toBeGreaterThan(0);
  expect(topology.minimumCoverage).toBeLessThan(topology.maximumCoverage);
  expect(topology.maximumCoverage).toBeLessThanOrEqual(1);
  expect(cloudSpeechRequests).toBe(0);
  console.log(`lip-cyanosis topology ${JSON.stringify(topology)}`);
  await page.screenshot({ path: info.outputPath('conversation-lip-cyanosis.png') });
});
