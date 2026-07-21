import { test, expect } from '@playwright/test';

/**
 * Smoke test for the full student case flow:
 * landing → case select → briefing → scene survey → treatment bay →
 * apply treatment → transport wizard → debrief.
 *
 * Selectors are text/role-based (resilient to styling churn).
 */

test.beforeEach(async ({ page }) => {
  // Skip the onboarding tour — same mechanism the app itself uses.
  await page.addInitScript(() => {
    window.localStorage.setItem('paramedic-studio-tour-completed', 'true');
  });
});

test('full case flow: landing → treatment → debrief', async ({ page }) => {
  // ── Landing page ──
  await page.goto('/');
  const start = page.getByRole('button', { name: /Start Training/i }).first();
  await expect(start).toBeVisible();
  await start.click();

  // ── Case selection (mission board) ──
  await expect(page.getByText(/Training mission board/i)).toBeVisible();
  await page.getByRole('button', { name: /Launch smart case/i }).click();

  // ── Briefing ──
  const beginSurvey = page.getByRole('button', { name: /Begin Scene Survey/i });
  await expect(beginSurvey).toBeVisible({ timeout: 15_000 });
  await beginSurvey.click();

  // ── Scene survey: approach → hazards → enter ──
  await page.getByRole('button', { name: /^Next$/ }).click();
  await page.getByRole('button', { name: /None identified/i }).click();
  await page.getByRole('button', { name: /Scene is safe/i }).click();
  await page.getByRole('button', { name: /Enter Scene/i }).click();

  // ── Treatment bay: 3D canvas + monitor ──
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByRole('button', { name: /power the monitor|Monitor is on/i }),
  ).toBeVisible();

  // ── Open a jump bag, apply the first available treatment ──
  await page.getByRole('button', { name: /Open Airway Bag/i }).click();
  await page.getByRole('button', { name: 'Apply', exact: true }).first().click();

  // Treatment registers: "Given" badge + live care feed has entries.
  await expect(page.getByText('Given').first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Live care feed/i)).toBeVisible();

  // ── End case: transport & handover wizard ──
  await page.getByRole('button', { name: 'Transport', exact: true }).click();
  await page.getByRole('button', { name: /Lights & Sirens/i }).click();
  await page.getByRole('button', { name: /^Supine/ }).click();
  await page.getByRole('button', { name: /Yes — Pre-Alert/i }).click();
  await page.getByRole('button', { name: /Nearest ED/i }).click();
  await page.getByRole('button', { name: /^Next$/ }).click();
  await page.getByRole('button', { name: /Other \/ Undifferentiated/i }).click();
  await page.getByRole('button', { name: /Confirm & End Case/i }).click();

  // ── Debrief: session summary with a score ──
  await expect(page.getByText('Case Complete')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/^\d+%$/).first()).toBeVisible();
});
