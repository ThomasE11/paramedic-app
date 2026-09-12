import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import type * as THREE from 'three';

for (const site of ['Chest', 'RUQ', 'LUQ', 'RLQ', 'LLQ']) {
  test(`palpation reaches the moving skin at ${site}`, async ({ page }, info) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
    await page.goto('/?devLiveCase=resp-001');
    await page.getByRole('button', { name: `Examine ${site === 'Chest' ? 'Chest' : 'Abdomen'}`, exact: true }).click();
    await page.getByRole('button', { name: 'Expose', exact: true }).click();
    const dock = page.locator('.patient-first-exam-dock');
    await dock.getByRole('button', { name: 'Palpate', exact: true }).click();
    await dock.getByRole('button', { name: site === 'Chest' ? /Palpate expansion/ : new RegExp(`${site} light/deep palpation`) }).click();
    await expect(page.getByTestId('assessment-contact-label')).toContainText('Palpation');
    // Let the assessment's 500 ms focus transition finish before orbiting.
    await page.waitForTimeout(700);
    const result = await page.evaluate(async (side) => {
      const state = window.__r3f!.get();
      const tool = state.scene.getObjectByName('assessment-contact-tool')!;
      const hand = tool.getObjectByName('assessment-gloved-hand')!;
      const body = state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
      const Raycaster = state.raycaster.constructor as typeof THREE.Raycaster;
      const ray = new Raycaster(); ray.far = .08;
      const normal = state.camera.position.clone(), point = normal.clone();
      const samples: Array<{ release: number; gaps: (number | null)[] }> = [];
      const captures: Record<string, string> = {};
      let closest = Infinity, count = 0;
      // An oblique view makes an airborne glove easier to spot than a front view.
      const controls = state.controls as unknown as { target: THREE.Vector3; update: () => void };
      const offset = state.camera.position.clone().sub(controls.target);
      const { x, z } = offset;
      offset.x = (x + z * side) / Math.sqrt(2); offset.z = (z - x * side) / Math.sqrt(2);
      state.camera.position.copy(controls.target).add(offset); controls.update();
      const start = performance.now();
      await new Promise<void>(resolve => {
        const sample = () => {
          if (count++ % 4 === 0) {
            state.gl.render(state.scene, state.camera);
            body.computeBoundingSphere(); body.computeBoundingBox();
            const parts = ['assessment-palm', ...Array.from({ length: 4 }, (_, i) => `assessment-finger-${i}`)]
              .map(name => hand.getObjectByName(name)!);
            const gaps = parts.map((part, index) => {
              // Actual transformed undersurface: palm centre and distal finger pads.
              point.set(0, index === 0 ? 0 : (.032 - Math.abs(index - 1 - 1.5) * .005) / 2, index === 0 ? -1 : -.006);
              part.localToWorld(point);
              normal.set(0, 0, 1).transformDirection(part.matrixWorld);
              ray.set(point.clone().addScaledVector(normal, .04), normal.clone().negate());
              const hits: THREE.Intersection[] = [];
              Object.getPrototypeOf(body).raycast.call(body, ray, hits);
              hits.sort((a, b) => a.distance - b.distance);
              return hits[0] ? point.clone().sub(hits[0].point).dot(normal) : null;
            });
            samples.push({ release: hand.parent!.position.z, gaps });
            if (gaps[0] !== null && gaps[0] < closest) {
              closest = gaps[0]; captures.contact = state.gl.domElement.toDataURL('image/png');
            }
          }
          if (performance.now() - start >= 6000) resolve(); else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      return { samples, captures };
    }, site === 'LUQ' || site === 'LLQ' ? -1 : 1);
    await writeFile(info.outputPath('skin-contact.json'), JSON.stringify(result.samples, null, 2));
    for (const [name, data] of Object.entries(result.captures)) {
      await writeFile(info.outputPath(`${name}.png`), Buffer.from(data.split(',')[1], 'base64'));
    }
    expect(result.samples.length).toBeGreaterThan(20);
    expect(result.samples.every(sample => sample.gaps.every(gap => gap !== null))).toBe(true);
    const compressed = result.samples.filter(sample => sample.release < .0002);
    expect(compressed.length).toBeGreaterThan(2);
    for (const sample of compressed) {
      expect(sample.gaps[0]).toBeLessThan(.0015);
      expect(sample.gaps[0]).toBeGreaterThan(-.001);
      for (const gap of sample.gaps.slice(1)) {
        expect(gap).toBeLessThan(.003);
        expect(gap).toBeGreaterThan(-.001);
      }
    }
    expect(Math.max(...result.samples.map(sample => sample.release))).toBeGreaterThan(.0038);
    const released = result.samples.filter(sample => sample.release > .0038);
    expect(released.length).toBeGreaterThan(2);
    const meanGap = (rows: typeof result.samples) => rows.reduce((sum, row) => sum + row.gaps[0]!, 0) / rows.length;
    expect(meanGap(released) - meanGap(compressed)).toBeGreaterThan(.0035);
    expect(meanGap(released) - meanGap(compressed)).toBeLessThan(.0045);
  });
}
