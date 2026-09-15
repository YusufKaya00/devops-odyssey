import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function assertLayout(page: Page) {
  const bounds = await page.evaluate(() => {
    const sidebar = document.querySelector('.sidebar')!.getBoundingClientRect();
    const main = document.querySelector('.main-content')!.getBoundingClientRect();
    const narrow = matchMedia('(max-width: 1024px)').matches;
    return {
      separate: narrow ? sidebar.bottom <= main.top + 1 : sidebar.right <= main.left + 1,
      mainInside: main.left >= 0 && main.right <= innerWidth + 1,
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  expect(bounds.separate).toBe(true);
  expect(bounds.mainInside).toBe(true);
  expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.width + 1);
}

test('roadmap, quest list, and Exit Quest stay usable without sidebar overlap', async ({ page }, testInfo) => {
  await page.route('http://localhost:5001/**', route => route.fulfill({ json: {
    completedQuests: [], completedSteps: [], stepNotes: {}, experiencePoints: 0,
    streak: 0, lastActiveDate: null, storageMode: 'Test',
    levelInfo: { level: 1, title: 'DevOps Novice', nextLevelXp: 350 },
  } }));
  await page.route('https://accounts.google.com/**', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Command Center', exact: true })).toBeVisible();
  await assertLayout(page);
  await page.getByText('1. Git', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Git & Version Control', exact: true })).toBeVisible();
  await assertLayout(page);
  const firstQuest = page.locator('.quest-item').first();
  await firstQuest.scrollIntoViewIfNeeded();
  const box = await firstQuest.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  const advancedQuest = page.locator('.quest-item').filter({ has: page.locator('.diff-Advanced') }).first();
  await expect(advancedQuest).toContainText('+ 300 XP');
  await firstQuest.click();
  await expect(page.getByRole('combobox', { name: 'Lesson step', exact: true })).toBeVisible();
  const example = page.locator('.command-example');
  await expect(example).not.toHaveAttribute('open');
  await expect(page.locator('.objective-block .cmd-highlight')).not.toBeVisible();
  await page.getByText('Example command', { exact: true }).click();
  await expect(page.locator('.objective-block .cmd-highlight')).toBeVisible();
  await page.getByRole('combobox', { name: 'Lesson step', exact: true }).selectOption('1');
  await expect(example).not.toHaveAttribute('open');
  await page.getByRole('combobox', { name: 'Quest', exact: true }).selectOption('git_remote');
  await expect(page.getByText('Type the following command in the terminal prompt:', { exact: true })).toBeVisible();
  await expect(page.locator('.objective-block .cmd-highlight')).toBeVisible();
  await page.getByRole('button', { name: 'Exit Quest', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Git & Version Control', exact: true })).toBeVisible();
  await assertLayout(page);
  await firstQuest.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('roadmap-quest-list.png') });
  await page.getByText('12. Software', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Software Engineering Practices', exact: true })).toBeVisible();
  await assertLayout(page);
  await page.getByRole('button', { name: /^1\. Git/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Git & Version Control', exact: true })).toBeVisible();
});

test('roadmap layout remains bounded when resizing across sidebar breakpoints', async ({ page }) => {
  await page.route('http://localhost:5001/**', route => route.fulfill({ json: {
    completedQuests: [], completedSteps: [], stepNotes: {}, experiencePoints: 0,
    streak: 0, lastActiveDate: null, levelInfo: { level: 1, title: 'DevOps Novice', nextLevelXp: 350 },
  } }));
  await page.goto('/');
  for (const width of [320, 390, 768, 1024, 1025, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
    await assertLayout(page);
    await page.getByText('1. Git', { exact: true }).click();
    await assertLayout(page);
    await page.locator('.quest-item').first().click();
    await expect(page.getByRole('combobox', { name: 'Lesson step', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Exit Quest', exact: true }).click();
  }
});
