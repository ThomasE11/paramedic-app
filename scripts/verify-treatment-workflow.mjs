import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:5173';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

try {
  await page.goto(`${base}/?devLiveCase=trauma-001&capture`, {
    waitUntil: 'networkidle',
    timeout: 60_000,
  });
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(4_500);

  await page.getByRole('button', { name: 'Examine Chest' }).click();
  await page.waitForTimeout(700);

  const dock = page.locator('.patient-first-exam-dock');
  await dock.waitFor({ state: 'visible' });
  const dockBox = await dock.boundingBox();
  if (!dockBox || dockBox.y < 0 || dockBox.y + dockBox.height > 900) {
    throw new Error(`Hands-on dock is outside the desktop viewport: ${JSON.stringify(dockBox)}`);
  }

  const expose = page.getByRole('button', { name: /^Expose$/ });
  await expose.click();
  await page.getByRole('button', { name: /^Re-dress$/ }).waitFor({ state: 'visible' });

  await page.getByRole('button', { name: /^Inspect$/ }).click();
  await page.waitForTimeout(450);
  const inspectText = await dock.getByRole('button', { name: /Inspect/ }).first().innerText();
  if (!/1\s*\/\s*1/.test(inspectText)) {
    throw new Error(`Chest inspection did not complete: ${inspectText}`);
  }

  await page.getByRole('button', { name: /^Listen$/ }).click();
  await page.waitForTimeout(450);
  const listenText = await dock.getByRole('button', { name: /Listen/ }).first().innerText();
  if (!/1\s*\/\s*6/.test(listenText)) {
    throw new Error(`Chest auscultation did not begin: ${listenText}`);
  }

  await page.getByRole('button', { name: /Back to full body/i }).click();
  await page.waitForTimeout(500);
  const radial = page.getByRole('button', { name: /Radial/i }).first();
  await radial.click();
  await page.waitForTimeout(2_600);
  const feedback = await page.locator('[data-sonner-toast], [role="status"], [role="alert"]')
    .allTextContents();
  if (!feedback.some(text => /radial pulse (?:present|absent)/i.test(text))) {
    throw new Error(`Pulse feedback missing: ${feedback.join(' | ')}`);
  }

  await page.screenshot({ path: 'test-results/treatment-workflow-verified.png' });
  const result = {
    dockInViewport: true,
    chestExposed: true,
    inspection: inspectText.trim().replace(/\s+/g, ' '),
    auscultation: listenText.trim().replace(/\s+/g, ' '),
    pulseFeedback: feedback.find(text => /radial pulse/i.test(text))?.trim().replace(/\s+/g, ' '),
    errors,
  };
  console.log(JSON.stringify(result, null, 2));
  if (errors.length) throw new Error(errors.join('\n'));
} finally {
  await browser.close();
}
