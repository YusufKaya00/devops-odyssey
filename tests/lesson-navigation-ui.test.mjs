import test from 'node:test';
import assert from 'node:assert/strict';

// Opt in with LESSON_UI_URL and optionally PLAYWRIGHT_MODULE / PLAYWRIGHT_CHANNEL.
// Only the terminal boundary and backend are mocked; navigation and notes use App.
test('focused lesson navigation in the browser', { skip: !process.env.LESSON_UI_URL }, async t => {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '@playwright/test');
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  t.after(() => browser.close());

  async function setup(seed = {}, viewport = { width: 1440, height: 1000 }) {
    const context = await browser.newContext({ viewport });
    t.after(() => context.close());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const progress = {
      completedQuests: [], completedSteps: [], experiencePoints: 0, streak: 0,
      lastActiveDate: null, levelInfo: { level: 1, title: 'DevOps Novice', nextLevelXp: 350 },
      stepNotes: {}, ...seed,
    };
    const requests = [];
    await page.route('**/src/components/TerminalSimulator.tsx*', route => route.fulfill({
      contentType: 'application/javascript',
      body: `import React from '/node_modules/.vite/deps/react.js';
        const { createElement: h } = React;
        export class TerminalSimulator extends React.Component {
          session = Math.random().toString(36);
          render() {
          const props = this.props;
          const index = props.activeStepIndexOverride ?? -1;
          return h('section', {},
            h('output', { 'aria-label': 'Terminal selected step' }, index),
            h('output', { 'aria-label': 'Terminal session' }, this.session),
            h('button', { onClick: () => {
              if (!props.isReviewMode) props.onStepComplete(index);
              props.onStepChange?.(Math.min(index + 1, props.interactiveSteps.length - 1));
            } }, 'Complete selected step'));
          }
        }`,
    }));
    await page.route('http://localhost:5001/**', async route => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      const body = request.postDataJSON();
      if (request.method() === 'POST') requests.push({ path, ...body });
      if (path === '/api/verify') {
        if (Number.isInteger(body.stepIndex)) {
          const key = `${body.validatorKey}:${body.stepIndex}`;
          if (!progress.completedSteps.includes(key)) {
            progress.completedSteps.push(key);
            progress.experiencePoints += 20;
          }
        } else if (!progress.completedQuests.includes(body.validatorKey)) {
          progress.completedQuests.push(body.validatorKey);
          progress.experiencePoints += 100;
        }
        // Capture stale notes in a delayed progress response to test draft protection.
        const snapshot = structuredClone(progress);
        await new Promise(resolve => setTimeout(resolve, 150));
        return route.fulfill({ json: { success: true, message: 'Verified', data: snapshot } });
      }
      if (path === '/api/notes') progress.stepNotes[`${body.validatorKey}:${body.stepIndex}`] = body.notes;
      await route.fulfill({ json: path === '/api/status' ? progress : { success: true } });
    });
    await page.goto(process.env.LESSON_UI_URL);
    await page.locator('.app-container').waitFor({ timeout: 10000 }).catch(error => {
      throw new Error(`${error.message}; page errors: ${errors.join('; ')}`);
    });
    await page.locator('.nav-item').filter({ hasText: /^1\. Git/ }).click();
    await page.locator('.quest-item').first().click();
    await page.getByRole('combobox', { name: 'Lesson step', exact: true }).waitFor({ timeout: 10000 }).catch(error => {
      throw new Error(`${error.message}; page errors: ${errors.join('; ')}`);
    });
    return { page, requests, errors };
  }

  async function savedProgress(page) {
    return page.evaluate(() => JSON.parse(localStorage.getItem('devops_odyssey_progress')));
  }

  async function select(page, index) {
    await page.getByRole('combobox', { name: 'Lesson step', exact: true }).selectOption(String(index));
    assert.equal(await page.getByLabel('Terminal selected step').textContent(), String(index));
  }

  await t.test('free navigation retains independent note drafts, terminal session, and module exit', async () => {
    const { page, requests, errors } = await setup();
    const session = await page.getByLabel('Terminal session').textContent();
    assert.equal(await page.getByRole('button', { name: 'Previous step', exact: true }).isDisabled(), true);
    await page.getByLabel('Notes for step 1', { exact: true }).fill('draft zero');
    await page.getByRole('button', { name: 'Next step', exact: true }).click();
    assert.equal(await page.getByLabel('Terminal selected step').textContent(), '1');
    await page.getByLabel('Notes for step 2', { exact: true }).fill('draft one');
    await select(page, 4);
    assert.equal(await page.getByRole('button', { name: 'Next step', exact: true }).isDisabled(), true);
    await page.getByLabel('Notes for step 5', { exact: true }).fill('draft last');
    await page.getByRole('button', { name: /^Step 1:/ }).focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.getByLabel('Notes for step 1', { exact: true }).inputValue(), 'draft zero');
    assert.equal(await page.getByLabel('Terminal session').textContent(), session);
    await page.getByTitle('Maximize Notes').click();
    assert.equal(await page.getByLabel('Expanded notes for step 1').inputValue(), 'draft zero');
    await page.getByLabel('Expanded notes for step 1').fill('edited in expanded notes');
    await page.getByRole('button', { name: /Close/ }).click();
    assert.equal(await page.getByLabel('Notes for step 1', { exact: true }).inputValue(), 'edited in expanded notes');
    const saved = await savedProgress(page);
    assert.deepEqual(saved.completedSteps, []);
    assert.equal(saved.experiencePoints, 0);
    assert.deepEqual(saved.stepNotes, { 'git_init:0': 'edited in expanded notes', 'git_init:1': 'draft one', 'git_init:4': 'draft last' });
    await page.getByRole('combobox', { name: 'Quest', exact: true }).selectOption('git_status_diff');
    assert.equal(await page.getByLabel('Notes for step 1', { exact: true }).inputValue(), '');
    await page.getByRole('combobox', { name: 'Quest', exact: true }).selectOption('git_init');
    assert.equal(await page.getByLabel('Notes for step 1', { exact: true }).inputValue(), 'edited in expanded notes');
    await page.getByRole('button', { name: 'Exit Quest', exact: true }).click();
    assert.equal(await page.getByRole('heading', { name: 'Practical Quests' }).isVisible(), true);
    assert.equal(requests.filter(request => request.path === '/api/verify').length, 0);
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('devops_odyssey_progress')).stepNotes['git_init:4'] === 'draft last');
    await page.reload();
    await page.locator('.nav-item').filter({ hasText: /^1\. Git/ }).click();
    await page.locator('.quest-item').first().click();
    await select(page, 4);
    assert.equal(await page.getByLabel('Notes for step 5', { exact: true }).inputValue(), 'draft last');
    assert.deepEqual(errors, []);
  });

  await t.test('out-of-order successes complete only actual steps and preserve notes through delayed responses', async () => {
    const { page, requests, errors } = await setup();
    await select(page, 4);
    await page.getByRole('button', { name: 'Complete selected step' }).click();
    await page.getByLabel('Notes for step 5', { exact: true }).fill('typed while verify is pending');
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('devops_odyssey_progress')).completedSteps.includes('git_init:4'));
    assert.deepEqual((await savedProgress(page)).completedSteps, ['git_init:4']);
    assert.equal(requests.some(request => request.isSimulated), false);
    await select(page, 0);
    for (let index = 0; index < 4; index++) {
      assert.equal(await page.getByLabel('Terminal selected step').textContent(), String(index));
      await page.getByRole('button', { name: 'Complete selected step' }).click();
    }
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('devops_odyssey_progress')).completedQuests.includes('git_init'));
    const saved = await savedProgress(page);
    assert.equal(new Set(saved.completedSteps).size, 5);
    assert.equal(saved.experiencePoints, 200);
    assert.equal(saved.stepNotes['git_init:4'], 'typed while verify is pending');
    assert.equal(requests.filter(request => request.isSimulated).length, 1);
    const count = requests.filter(request => request.path === '/api/verify').length;
    await select(page, 1);
    await page.getByRole('button', { name: 'Complete selected step' }).click();
    assert.equal(await page.getByLabel('Terminal selected step').textContent(), '2');
    assert.equal(requests.filter(request => request.path === '/api/verify').length, count);
    assert.deepEqual(errors, []);
  });

  await t.test('completed legacy quests remain selectable without awarding progress', async () => {
    const { page, requests } = await setup({ completedQuests: ['git_init'], experiencePoints: 100 });
    assert.equal(await page.locator('.lesson-progress-summary').textContent(), '5/5 completed');
    await select(page, 3);
    await page.getByRole('button', { name: 'Previous step', exact: true }).click();
    assert.equal(await page.getByLabel('Terminal selected step').textContent(), '2');
    assert.equal((await savedProgress(page)).experiencePoints, 100);
    assert.equal(requests.length, 0);
  });

  await t.test('navigation stays within desktop and narrow viewport bounds', async () => {
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      const { page, errors } = await setup({}, viewport);
      const rectangles = await page.locator('.lesson-step-navigation > button, .lesson-step-navigation > select').evaluateAll(elements =>
        elements.map(element => { const rect = element.getBoundingClientRect(); return { left: rect.left, right: rect.right, width: rect.width }; }),
      );
      assert.equal(rectangles.length, 3);
      rectangles.forEach(rect => assert.ok(rect.left >= 0 && rect.right <= viewport.width && rect.width > 0));
      assert.ok(rectangles[0].right <= rectangles[1].left);
      assert.ok(rectangles[1].right <= rectangles[2].left);
      assert.equal(await page.locator('.focused-lab-layout').evaluate(element => element.scrollWidth <= element.clientWidth), true);
      const screenshot = await page.screenshot({ type: 'jpeg', quality: 45 });
      assert.ok(screenshot.length > 10000);
      if (process.env.LESSON_UI_SCREENSHOTS) console.log(`SCREENSHOT:${viewport.width}:${screenshot.toString('base64')}`);
      assert.deepEqual(errors, []);
    }
  });
});
