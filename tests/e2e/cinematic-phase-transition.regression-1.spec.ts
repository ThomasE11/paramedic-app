import { test, expect } from '@playwright/test';

async function openPilotBriefing(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('paramedic-studio-tour-completed', 'true');
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Start Training/i }).first().click();
  await page.getByRole('button', { name: '4th Year', exact: true }).click();
  await page.getByRole('button', { name: /Condition practice.*Search a diagnosis/i }).click();
  await page.getByPlaceholder('STEMI, asthma, pneumothorax, anaphylaxis...').fill('Life-threatening asthma');
  await page.getByRole('button', { name: /Life-threatening asthma.*1 case/i }).click();
  await expect(page.getByTestId('cinematic-phase')).toHaveAttribute('data-cinematic-phase', 'prebriefing');
}

test('briefing signs off before the scene survey arrives', async ({ page }) => {
  await openPilotBriefing(page);

  const briefing = page.getByTestId('cinematic-phase');
  await page.getByRole('button', { name: /Begin Scene Survey/i }).click();

  await expect.poll(async () => briefing.evaluate((element) => {
    const style = getComputedStyle(element);
    return style.filter !== 'none' && Number(style.opacity) < 1;
  })).toBe(true);

  const survey = page.getByTestId('cinematic-phase');
  await expect(survey).toHaveAttribute('data-cinematic-phase', 'scene-survey');
  await expect.poll(async () => Number(await survey.evaluate((element) => getComputedStyle(element).opacity))).toBe(1);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('switches phases without transform or blur', async ({ page }) => {
    await openPilotBriefing(page);
    await page.getByRole('button', { name: /Begin Scene Survey/i }).click();

    const survey = page.getByTestId('cinematic-phase');
    await expect(survey).toHaveAttribute('data-cinematic-phase', 'scene-survey');
    await expect.poll(async () => survey.evaluate((element) => {
      const style = getComputedStyle(element);
      return { filter: style.filter, opacity: style.opacity, transform: style.transform };
    })).toEqual({ filter: 'none', opacity: '1', transform: 'none' });
  });
});
