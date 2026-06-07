import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.CHECK_BASE_URL || 'http://localhost:3000';
const OUT_DIR = process.env.CHECK_OUT_DIR || '/private/tmp/game-lounge-full-audit';
const WAIT = Number(process.env.CHECK_WAIT_MS || 220);

const viewports = [
  { name: 'mobile', width: 390, height: 844, maxPlayOverflow: 24, maxSetupOverflow: 80 },
  { name: 'desktop', width: 1440, height: 900, maxPlayOverflow: 0, maxSetupOverflow: 40 },
];

const games = [
  'geister',
  'connect4',
  'xiangqi',
  'emperor',
  'island-settlers',
  'texas-holdem',
  'tiger-dragon',
  'indian-poker',
];

const gameRoutes = games.flatMap((game) => {
  const routes = [
    { name: `${game}-mode`, path: `/games/${game}`, kind: 'setup' },
    { name: `${game}-rules`, path: `/games/${game}/rules`, kind: 'content' },
  ];
  if (game !== 'texas-holdem') {
    routes.push(
      { name: `${game}-local-entry`, path: `/games/${game}/local`, kind: 'setup' },
      { name: `${game}-online-entry`, path: `/games/${game}/online`, kind: 'setup' }
    );
  }
  routes.push({ name: `${game}-cpu-entry`, path: `/games/${game}/cpu`, kind: 'setup' });
  return routes;
});

const cases = [
  { name: 'home', path: '/', kind: 'setup' },
  { name: 'games-index', path: '/games', kind: 'setup' },
  ...gameRoutes,
  {
    name: 'texas-cpu-playing',
    path: '/games/texas-holdem/cpu',
    kind: 'play',
    steps: [{ text: 'ゲーム開始' }],
  },
  {
    name: 'indian-cpu-player-count',
    path: '/games/indian-poker/cpu',
    kind: 'setup',
    steps: [{ text: '3人' }],
  },
  {
    name: 'indian-cpu-playing',
    path: '/games/indian-poker/cpu',
    kind: 'play',
    steps: [{ text: '3人' }, { text: '普通' }],
  },
  {
    name: 'indian-local-name-input',
    path: '/games/indian-poker/local',
    kind: 'setup',
    steps: [{ text: '3人' }],
  },
  {
    name: 'indian-local-playing',
    path: '/games/indian-poker/local',
    kind: 'play',
    steps: [{ text: '3人' }, { text: 'ゲーム開始' }],
  },
  {
    name: 'tiger-cpu-difficulty',
    path: '/games/tiger-dragon/cpu',
    kind: 'setup',
    steps: [{ text: '2人' }],
  },
  {
    name: 'tiger-cpu-playing',
    path: '/games/tiger-dragon/cpu',
    kind: 'play',
    steps: [{ text: '2人' }, { text: 'ノーマル' }],
  },
  {
    name: 'tiger-local-playing',
    path: '/games/tiger-dragon/local',
    kind: 'play',
    steps: [{ text: 'ゲーム開始' }],
  },
  {
    name: 'connect4-cpu-order',
    path: '/games/connect4/cpu',
    kind: 'setup',
    steps: [{ text: '中級' }],
  },
  {
    name: 'connect4-cpu-playing',
    path: '/games/connect4/cpu',
    kind: 'play',
    steps: [{ text: '中級' }, { text: '先攻' }],
  },
  {
    name: 'connect4-local-playing',
    path: '/games/connect4/local',
    kind: 'play',
  },
  {
    name: 'xiangqi-cpu-order',
    path: '/games/xiangqi/cpu',
    kind: 'setup',
    steps: [{ text: '中級' }],
  },
  {
    name: 'xiangqi-cpu-playing',
    path: '/games/xiangqi/cpu',
    kind: 'play',
    steps: [{ text: '中級' }, { text: '紅（先攻）' }],
  },
  {
    name: 'xiangqi-local-playing',
    path: '/games/xiangqi/local',
    kind: 'play',
  },
  {
    name: 'island-cpu-difficulty',
    path: '/games/island-settlers/cpu',
    kind: 'setup',
    steps: [{ text: '3人' }],
  },
  {
    name: 'island-cpu-start',
    path: '/games/island-settlers/cpu',
    kind: 'setup',
    steps: [{ text: '3人' }, { text: '普通' }],
  },
  {
    name: 'island-cpu-playing',
    path: '/games/island-settlers/cpu',
    kind: 'play',
    steps: [{ text: '3人' }, { text: '普通' }, { text: 'ゲーム開始' }],
  },
  {
    name: 'island-local-playing',
    path: '/games/island-settlers/local',
    kind: 'play',
    steps: [{ text: 'ゲーム開始' }],
  },
  {
    name: 'geister-cpu-setup',
    path: '/games/geister/cpu',
    kind: 'setup',
    steps: [{ text: '先攻' }],
  },
  {
    name: 'geister-cpu-playing',
    path: '/games/geister/cpu',
    kind: 'play',
    steps: [{ text: '先攻' }, { text: 'ランダム' }, { text: '配置完了' }],
  },
  {
    name: 'geister-local-p2-ready',
    path: '/games/geister/local',
    kind: 'setup',
    steps: [{ text: 'ランダム' }, { text: '配置完了' }],
  },
  {
    name: 'geister-local-playing',
    path: '/games/geister/local',
    kind: 'play',
    steps: [
      { text: 'ランダム' },
      { text: '配置完了' },
      { text: '準備完了' },
      { text: 'ランダム' },
      { text: '配置完了' },
    ],
  },
  {
    name: 'emperor-cpu-playing',
    path: '/games/emperor/cpu',
    kind: 'play',
    steps: [{ text: 'ゲーム開始' }],
  },
];

function sanitize(name) {
  return name.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
}

async function clickByText(page, text) {
  const clicked = await page.evaluate((target) => {
    const candidates = [...document.querySelectorAll('button, a, [role="button"]')].filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && !el.disabled;
    });
    const match = candidates.find((el) => (el.textContent || '').replace(/\s+/g, ' ').trim().includes(target));
    if (!match) return false;
    match.click();
    return true;
  }, text);
  if (!clicked) {
    throw new Error(`Could not click "${text}"`);
  }
  await new Promise((resolve) => setTimeout(resolve, WAIT));
}

async function runSteps(page, steps = []) {
  for (const step of steps) {
    if (step.text) await clickByText(page, step.text);
    if (step.wait) await new Promise((resolve) => setTimeout(resolve, step.wait));
  }
}

async function collectMetrics(page, kind, viewport) {
  return page.evaluate(
    ({ kind, viewport }) => {
      const rectOf = (element) => {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          bottom: Math.round(rect.bottom),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      };

      const intersects = (a, b) =>
        !!a &&
        !!b &&
        a.left < b.right &&
        a.right > b.left &&
        a.top < b.bottom &&
        a.bottom > b.top;

      const isVisible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      };

      const buttons = [...document.querySelectorAll('button, a, input, select, textarea')].filter(isVisible);
      const smallTargets = buttons
        .map((el) => ({ text: (el.textContent || el.getAttribute('aria-label') || el.getAttribute('placeholder') || '').trim().slice(0, 80), rect: rectOf(el) }))
        .filter(({ rect }) => rect && (rect.width < 40 || rect.height < 40));

      const offscreenTargets = buttons
        .map((el) => ({ text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 80), rect: rectOf(el) }))
        .filter(({ rect }) => rect && (rect.left < -1 || rect.right > window.innerWidth + 1 || rect.top < -1 || rect.bottom > window.innerHeight + 1));

      const action = rectOf(document.querySelector('[data-game-action-area]'));
      const ownHand = rectOf(document.querySelector('[data-own-hand]'));
      const board = rectOf(document.querySelector('[role="grid"], canvas, [data-game-board]'));

      const actionOverlapsOwnHand = intersects(action, ownHand);
      const actionOverlapsBoard = intersects(action, board);
      const verticalOverflow = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const horizontalOverflow = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
      const bodyText = document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 220);
      const maxOverflow = kind === 'content' ? 9999 : kind === 'play' ? viewport.maxPlayOverflow : viewport.maxSetupOverflow;

      const issues = [];
      if (horizontalOverflow > 0) issues.push(`horizontal-overflow:${horizontalOverflow}`);
      if (verticalOverflow > maxOverflow) issues.push(`vertical-overflow:${verticalOverflow}>${maxOverflow}`);
      if (actionOverlapsOwnHand) issues.push('action-overlaps-own-hand');
      if (actionOverlapsBoard) issues.push('action-overlaps-board');
      if (smallTargets.length > 0) issues.push(`small-targets:${smallTargets.length}`);
      if (offscreenTargets.length > 0 && kind !== 'content') issues.push(`offscreen-targets:${offscreenTargets.length}`);

      return {
        kind,
        url: location.pathname,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        verticalOverflow,
        horizontalOverflow,
        maxOverflow,
        action,
        ownHand,
        board,
        actionOverlapsOwnHand,
        actionOverlapsBoard,
        buttonCount: buttons.length,
        smallTargets: smallTargets.slice(0, 12),
        offscreenTargets: offscreenTargets.slice(0, 12),
        bodyText,
        issues,
      };
    },
    { kind, viewport }
  );
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];

  try {
    for (const viewport of viewports) {
      for (const [caseIndex, testCase] of cases.entries()) {
        console.log(`[${viewport.name}] ${caseIndex + 1}/${cases.length} ${testCase.name}`);
        const page = await browser.newPage();
        const consoleErrors = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });
        page.on('pageerror', (error) => consoleErrors.push(error.message));
        await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: viewport.name === 'mobile' ? 2 : 1 });

        const entry = {
          name: testCase.name,
          path: testCase.path,
          kind: testCase.kind,
          viewport: viewport.name,
          ok: true,
          errors: [],
        };

        try {
          await page.goto(`${BASE_URL}${testCase.path}`, { waitUntil: 'domcontentloaded', timeout: 12000 });
          await page.waitForSelector('body', { timeout: 5000 });
          await new Promise((resolve) => setTimeout(resolve, WAIT));
          await runSteps(page, testCase.steps);
          const metrics = await collectMetrics(page, testCase.kind, viewport);
          const screenshot = path.join(OUT_DIR, `${viewport.name}-${sanitize(testCase.name)}.png`);
          await page.screenshot({ path: screenshot, fullPage: false });
          entry.metrics = metrics;
          entry.screenshot = screenshot;
          entry.consoleErrors = consoleErrors.slice(0, 8);
          if (metrics.issues.length || consoleErrors.length) {
            entry.ok = false;
            entry.errors.push(...metrics.issues, ...consoleErrors.map((e) => `console:${e.slice(0, 120)}`));
          }
        } catch (error) {
          entry.ok = false;
          entry.errors.push(error.message);
        } finally {
          results.push(entry);
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }

  const out = path.join(OUT_DIR, 'results.json');
  fs.writeFileSync(out, JSON.stringify(results, null, 2));

  const failed = results.filter((result) => !result.ok);
  console.log(`Full screen audit: ${results.length - failed.length}/${results.length} passed`);
  console.log(`Results: ${out}`);
  for (const result of failed) {
    console.log(`FAIL ${result.viewport} ${result.name} ${result.path}`);
    for (const error of result.errors.slice(0, 6)) console.log(`  - ${error}`);
    if (result.screenshot) console.log(`  screenshot: ${result.screenshot}`);
  }

  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
