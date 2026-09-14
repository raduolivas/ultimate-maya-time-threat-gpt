import { expect, test, type Page } from '@playwright/test';

async function coordinate(page: Page, axis: number) {
  const raw = await page.locator('#game').getAttribute('data-position');
  return Number(raw?.split(',')[axis]);
}
async function axisTo(page: Page, axis: 0 | 2, destination: number) {
  const start = await coordinate(page, axis);
  if (Math.abs(start - destination) < .3) return;
  const positive = destination > start;
  const key = axis === 0 ? (positive ? 'd' : 'a') : (positive ? 'w' : 's');
  await page.keyboard.down(key);
  try {
    await expect.poll(async () => {
      const value = await coordinate(page, axis);
      return positive ? value >= destination - .2 : value <= destination + .2;
    }, { timeout: 12000, intervals: [50] }).toBe(true);
  } finally {
    await page.keyboard.up(key);
    console.log('NAVIGATION', JSON.stringify({axis,destination,position:await page.locator('#game').getAttribute('data-position'),camera:await page.locator('#game').getAttribute('data-camera'),motion:await page.locator('#game').getAttribute('data-motion')}));
  }
  await expect(page.locator('#game')).toHaveAttribute('data-motion', 'idle');
}
async function act(page: Page, prompt: string) {
  await expect(page.locator('#prompt')).toContainText(prompt);
  await page.keyboard.press('e');
}
test('walk, jump, enter doors, follow dialogue, plant and discover a future consequence', async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Begin in 1200 · The Lantern Age' }).click();
  await expect(page.locator('#game')).toHaveAttribute('data-motion', 'idle');
  const ground = await coordinate(page, 1);
  await page.keyboard.press('Space');
  await expect.poll(() => coordinate(page, 1), { intervals: [30] }).toBeGreaterThan(ground + .3);
  await expect(page.locator('#game')).toHaveAttribute('data-motion', 'idle');

  await axisTo(page, 0, -10);
  await axisTo(page, 2, 4);
  await act(page, 'Enter the library');
  await expect(page.locator('#game')).toHaveAttribute('data-room', 'library');
  await axisTo(page, 2, -.3);
  await act(page, 'Elian');
  await page.getByRole('button', { name: 'I want to understand myself.' }).click();
  await page.getByRole('button', { name: 'Read and reflect.' }).click();
  await expect(page.locator('#status')).toContainText('20 XP');
  await axisTo(page, 2, -5.8);
  await act(page, 'Return to the square');
  await expect(page.locator('#game')).toHaveAttribute('data-room', 'village');

  await axisTo(page, 2, -2);
  await axisTo(page, 0, -5.5);
  await act(page, 'Mira');
  await page.getByRole('button', { name: 'Contribute 10 gold.' }).click();
  await expect(page.locator('#status')).toContainText('40 XP');

  // Route south of the well and crate to the garden patch.
  await axisTo(page, 2, -3.5);
  await axisTo(page, 0, 5);
  await act(page, 'Plant the Moonseed');
  await page.getByRole('button', { name: 'Plant the Moonseed', exact: true }).click();
  await expect(page.locator('#status')).toContainText('55 XP');

  await axisTo(page, 0, 10);
  await axisTo(page, 2, 4);
  await act(page, 'Enter the clocktower');
  await expect(page.locator('#game')).toHaveAttribute('data-room', 'tower');
  await axisTo(page, 2, .3);
  await act(page, 'Cross the time gate');
  await page.getByRole('button', { name: 'Cross the threshold' }).click();
  await expect(page.locator('#status')).toContainText('2080');
  await expect(page.locator('#game')).toHaveAttribute('data-room', 'village');

  await axisTo(page, 0, 5);
  await axisTo(page, 2, -3.5);
  await act(page, 'garden inscription');
  await expect(page.locator('#dialog-body')).toContainText('you once planted');
  await page.getByRole('button', { name: 'Read the inscription', exact: true }).click();
  await expect(page.locator('#status')).toContainText('85 XP');
  await page.getByRole('button', { name: 'Quests', exact: true }).click();
  await expect(page.locator('#dialog-body')).toContainText('✓ What the roots remember');
  await page.getByRole('button', { name: 'Return to the world' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Continue saved journey' }).click();
  await page.getByRole('button', { name: 'Inventory', exact: true }).click();
  await expect(page.locator('#dialog-body')).toContainText('Memory of the Moon Tree');
  expect(errors).toEqual([]);
});

test('sprint is available and movement pauses while a journal is open', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Begin in 1200 · The Lantern Age' }).click();
  await page.keyboard.down('Shift');
  await page.keyboard.down('w');
  await expect(page.locator('#game')).toHaveAttribute('data-motion', 'run');
  await page.keyboard.up('w');
  await page.keyboard.up('Shift');
  await expect(page.locator('#game')).toHaveAttribute('data-motion', 'idle');
  await page.getByRole('button', { name: 'Quests', exact: true }).click();
  const position = await page.locator('#game').getAttribute('data-position');
  await page.keyboard.down('w');
  await page.waitForTimeout(250);
  await page.keyboard.up('w');
  expect(await page.locator('#game').getAttribute('data-position')).toBe(position);
});
