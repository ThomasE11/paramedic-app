import type { Page } from '@playwright/test';

/** Read actual visible pixels: a mounted WebGL canvas can still be black. */
export async function renderedSceneFraction(page: Page) {
  const bounds = await page.evaluate(() => {
    const canvas = document.querySelector('.patient-model-canvas-stage canvas');
    canvas?.scrollIntoView({ block: 'center' });
    const r = canvas?.getBoundingClientRect();
    return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null;
  });
  if (!bounds) return 0;
  const viewport = page.viewportSize()!;
  const clip = {
    x: Math.max(0, bounds.x), y: Math.max(0, bounds.y),
    width: Math.min(bounds.x + bounds.width, viewport.width) - Math.max(0, bounds.x),
    height: Math.min(bounds.y + bounds.height, viewport.height) - Math.max(0, bounds.y),
  };
  if (clip.height < 150 || clip.width < 100) return 0;
  const screenshot = await page.screenshot({ clip });
  return page.evaluate(async png => {
    const image = new Image();
    image.src = `data:image/png;base64,${png}`;
    await image.decode();
    const sample = document.createElement('canvas');
    sample.width = 80;
    sample.height = 60;
    const ctx = sample.getContext('2d')!;
    ctx.drawImage(image, 0, 0, 80, 60);
    const pixels = ctx.getImageData(0, 0, 80, 60).data;
    let visible = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 0 && Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) > 20) visible++;
    }
    return visible / (80 * 60);
  }, screenshot.toString('base64'));
}
