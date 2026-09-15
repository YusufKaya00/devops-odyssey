import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { gitDeepDiveQuests } from '../../src/data/gitTraining';
import { programmingModule } from '../../src/data/training/programming';

async function setup(page: Page) {
  const state = {
    completedQuests: [] as string[], completedSteps: [] as string[], stepNotes: {} as Record<string, string>,
    experiencePoints: 0, streak: 0, lastActiveDate: null, hostOS: 'linux', storageMode: 'Test',
    levelInfo: { level: 1, title: 'DevOps Novice', nextLevelXp: 350 },
  };
  // Isolate browser QA from the learner's real database and saved progress.
  await page.route('http://localhost:5001/**', async route => {
    const request = route.request();
    const body = request.method() === 'POST' ? request.postDataJSON() : {};
    if (request.url().endsWith('/verify')) {
      if (Number.isInteger(body.stepIndex)) {
        const key = `${body.validatorKey}:${body.stepIndex}`;
        if (!state.completedSteps.includes(key)) { state.completedSteps.push(key); state.experiencePoints += 20; }
      } else if (body.isSimulated && !state.completedQuests.includes(body.validatorKey)) {
        state.completedQuests.push(body.validatorKey); state.experiencePoints += 100;
      }
    }
    if (request.url().endsWith('/notes')) state.stepNotes = { ...state.stepNotes, ...body.stepNotes };
    await route.fulfill({ json: request.url().endsWith('/status') ? state : { success: true, data: state, message: 'Verified' } });
  });
  await page.route('https://accounts.google.com/**', route => route.abort());
  await page.goto('/');
  await page.getByText('1. Git', { exact: true }).click();
  await page.getByText(gitDeepDiveQuests[0].title, { exact: true }).click();
  await expect(page.getByLabel('Terminal command', { exact: true })).toBeEnabled();
  return state;
}

async function command(page: Page, value: string) {
  const input = page.getByLabel('Terminal command', { exact: true });
  await input.fill(value);
  await page.getByRole('button', { name: 'Run command', exact: true }).click();
  await expect(input).toBeEnabled();
  await expect(page.getByText('Saved on this browser', { exact: true })).toBeVisible();
}

async function noHorizontalOverflow(page: Page) {
  const bounds = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1);
}

test('free navigation, real snapshots, notes, and post-completion practice', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const state = await setup(page);
  const selector = page.getByRole('combobox', { name: 'Lesson step', exact: true });
  await selector.selectOption('3');
  await command(page, 'git commit -m "Too soon"');
  await expect(page.getByRole('log')).toContainText('not a git repository');
  expect(state.completedSteps).toEqual([]);
  await expect(page.getByText('0/5 completed', { exact: true })).toBeVisible();
  const notes = page.getByRole('textbox', { name: 'Notes for step 4', exact: true });
  if (!await notes.isVisible()) await page.getByText('Personal Notes', { exact: false }).first().click();
  await notes.fill('Commit only the staged snapshot.');
  await page.getByRole('button', { name: 'Previous step', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Notes for step 3', exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(notes).toHaveValue('Commit only the staged snapshot.');

  await selector.selectOption('0');
  await command(page, 'git init');
  await expect(selector).toHaveValue('1');
  await command(page, 'git status');
  await command(page, 'git add .');
  await expect(selector).toHaveValue('3');
  await command(page, 'echo "Edited after staging" > README.md');
  await expect(page.getByRole('table', { name: 'Repository files' })).toContainText('staged + unstaged');
  await command(page, 'git commit -m "My first real snapshot"');
  await expect(selector).toHaveValue('4');
  await command(page, 'git log --decorate --oneline');
  await expect(page.getByText('5/5 completed', { exact: true })).toBeVisible();
  await expect.poll(() => state.completedQuests).toContain('git_init');
  await command(page, 'git show HEAD:README.md');
  await expect(page.getByRole('log')).toContainText('Practice Git without changing your computer files.');
  await command(page, 'git status');
  await expect(page.getByRole('log')).toContainText('unstaged');
  await expect(page.getByRole('table', { name: 'Repository files' })).not.toContainText('.git/');
  await noHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('git-lab.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('repository survives Exit Quest and page reload without replaying steps', async ({ page }) => {
  await setup(page);
  await command(page, 'git init');
  await command(page, 'echo "saved draft" > draft.txt');
  await page.getByRole('button', { name: 'Exit Quest' }).click();
  await expect(page.getByRole('heading', { name: 'Git & Version Control', exact: true })).toBeVisible();
  await expect(page.getByText(gitDeepDiveQuests[5].title, { exact: true })).toBeVisible();
  await page.reload();
  await page.getByText('1. Git', { exact: true }).click();
  await page.getByText(gitDeepDiveQuests[0].title, { exact: true }).click();
  await command(page, 'cat draft.txt');
  await expect(page.getByRole('log')).toContainText('saved draft');
  await expect(page.getByText('1/5 completed', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset lab repository' }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await command(page, 'cat draft.txt');
  await expect(page.getByRole('log')).toContainText('saved draft');
});

test('lessons two through five run, including an unresolved merge rejection', async ({ page }, testInfo) => {
  await setup(page);
  for (const quest of gitDeepDiveQuests.slice(1, 5)) {
    await page.getByRole('combobox', { name: 'Quest', exact: true }).selectOption(quest.validatorKey);
    await expect(page.getByLabel('Terminal command', { exact: true })).toBeEnabled();
    for (const [index, step] of quest.interactiveSteps.entries()) {
      await command(page, step.expectedCommand);
      await expect(page.getByText(`${index + 1}/${quest.interactiveSteps.length} completed`, { exact: true })).toBeVisible();
      if (quest.validatorKey === 'git_conflict' && index === 6) {
        await command(page, 'git commit -m "Unresolved"');
        await expect(page.getByRole('log')).toContainText('Unmerged paths');
        await expect(page.getByText('7/10 completed', { exact: true })).toBeVisible();
        await noHorizontalOverflow(page);
        await page.screenshot({ path: testInfo.outputPath('git-conflict.png'), fullPage: true });
      }
    }
  }
  await command(page, 'git log --oneline --graph --all --decorate');
  await expect(page.getByRole('log')).toContainText('Resolve deployment port conflict');
});

test('guided labs accept multiline text without completing skipped steps', async ({ page }) => {
  const state = await setup(page);
  await page.getByRole('button', { name: 'Exit Quest' }).click();
  await page.getByText('2. Programming', { exact: true }).click();
  const quest = programmingModule.quests.find(quest => quest.id === 'prog_log_parser')!;
  await page.getByText(quest.title, { exact: true }).click();
  await page.getByRole('combobox', { name: 'Quest', exact: true }).selectOption(quest.validatorKey);
  const index = 0;
  await page.getByRole('combobox', { name: 'Lesson step', exact: true }).selectOption(String(index));
  const input = page.getByLabel('Terminal command', { exact: true });
  expect(quest.interactiveSteps[index].expectedCommand).toContain('\n');
  await input.fill(quest.interactiveSteps[index].expectedCommand);
  await input.press('Enter');
  await expect(page.getByText(`1/${quest.interactiveSteps.length} completed`, { exact: true })).toBeVisible();
  expect(state.completedQuests).toEqual([]);
  await noHorizontalOverflow(page);
});
