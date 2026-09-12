import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => localStorage.setItem('paramedic-studio-tour-completed', 'true'));
});

// Preview-mode classroom (no Supabase) shares PIN + roster + case via
// localStorage + BroadcastChannel. Both pages must share one origin context.
test('educator PIN lets a second tab join and share a live case', async ({ page, context }, testInfo) => {
  const host = page;
  const student = await context.newPage();

  await host.goto('/');
  await host.getByRole('button', { name: 'Host a classroom' }).click();
  await expect(host.getByRole('button', { name: 'Open lobby', exact: true })).toBeVisible();
  await expect(host.getByText('Classroom mode unavailable')).toHaveCount(0);

  await host.getByPlaceholder(/Dr Hassan/i).fill('Dr Hassan');
  await host.getByRole('button', { name: 'Open lobby', exact: true }).click();
  await expect(host.getByText('Share this PIN with students')).toBeVisible();

  const pin = ((await host.getByTestId('classroom-pin').innerText()) || '').replace(/\s+/g, '');
  expect(pin).toMatch(/^\d{6}$/);
  await host.screenshot({ path: testInfo.outputPath('host-lobby.png'), fullPage: true });

  await student.goto('/');
  await student.getByRole('button', { name: 'Join a classroom', exact: true }).click();
  await expect(student.getByRole('heading', { name: /Join the case/i })).toBeVisible();
  await expect(student.getByText('Classroom mode unavailable')).toHaveCount(0);

  await student.getByLabel('Classroom PIN').fill(pin);
  await student.getByPlaceholder(/How you'll appear/i).fill('Aisha');
  await student.getByRole('button', { name: 'Join', exact: true }).click();
  await expect(student.getByText(/Waiting for case launch/i)).toBeVisible();
  await expect(host.getByText('Aisha')).toBeVisible();
  await student.screenshot({ path: testInfo.outputPath('student-waiting.png'), fullPage: true });

  await host.getByRole('button', { name: /Acute Anterior STEMI/i }).click();
  await host.getByRole('button', { name: 'Start case', exact: true }).click();

  await expect(host.getByText('Patient Bay').first()).toBeVisible({ timeout: 20_000 });
  await expect(host.getByText('Activity Timeline').first()).toBeVisible();

  const closeBay = host.getByRole('button', { name: 'Close Patient Bay' });
  if (await closeBay.count()) {
    await closeBay.click();
    await expect(host.getByText('Patient Bay').first()).toBeVisible();
  }
  await host.screenshot({ path: testInfo.outputPath('host-tower.png'), fullPage: true });

  await expect(student.getByText(/Acute Anterior STEMI|45yo Male/i).first()).toBeVisible({ timeout: 20_000 });
  await expect(student.getByText(/Waiting for case launch/i)).toHaveCount(0);
  await student.screenshot({ path: testInfo.outputPath('student-live.png'), fullPage: true });
});
