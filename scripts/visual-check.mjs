import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const baseUrl = process.env.CHECK_BASE_URL || 'http://localhost:3000';
const outDir = '/private/tmp/game-lounge-visual-check';
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
];

const cases = [
  {
    name: 'texas',
    path: '/games/texas-holdem/cpu',
    clicks: ['ゲーム開始'],
    waitText: 'ポット',
  },
  {
    name: 'indian',
    path: '/games/indian-poker/cpu',
    clicks: ['3人', '普通'],
    waitText: 'ポット',
  },
  {
    name: 'tiger',
    path: '/games/tiger-dragon/cpu',
    clicks: ['2人', 'ノーマル'],
    waitText: 'あなたの手牌',
  },
  {
    name: 'connect4',
    path: '/games/connect4/cpu',
    clicks: ['中級', '先攻'],
    waitText: 'あなたの番',
  },
  {
    name: 'emperor',
    path: '/games/emperor/cpu',
    clicks: ['ゲーム開始'],
    waitText: 'あなたの手札',
  },
  {
    name: 'xiangqi',
    path: '/games/xiangqi/cpu',
    clicks: ['中級', '紅（先攻）'],
    waitText: 'あなたの番',
  },
  {
    name: 'island',
    path: '/games/island-settlers/cpu',
    clicks: ['3人', '普通', 'ゲーム開始'],
    waitText: 'あなたのターン',
  },
];

async function clickByText(page, text) {
  await page.waitForFunction(
    (label) =>
      [...document.querySelectorAll('button,a')].some((el) =>
        (el.textContent || '').replace(/\s+/g, ' ').trim().includes(label)
      ),
    {},
    text
  );
  await page.evaluate((label) => {
    const target = [...document.querySelectorAll('button,a')].find((el) =>
      (el.textContent || '').replace(/\s+/g, ' ').trim().includes(label)
    );
    target?.click();
  }, text);
  await new Promise((resolve) => setTimeout(resolve, 900));
}

const browser = await puppeteer.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    for (const testCase of cases) {
      const page = await browser.newPage();
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          results.push({ case: testCase.name, viewport: viewport.name, consoleError: msg.text() });
        }
      });
      try {
        console.log(`checking ${testCase.name} ${viewport.name}`);
        await page.setViewport(viewport);
        await page.goto(`${baseUrl}${testCase.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
        for (const click of testCase.clicks) {
          await clickByText(page, click);
        }
        if (testCase.waitText) {
          await page.waitForFunction(
            (label) => document.body.innerText.includes(label),
            { timeout: 15000 },
            testCase.waitText
          ).catch(() => {});
        }
        await new Promise((resolve) => setTimeout(resolve, 1200));
      } catch (error) {
        const screenshot = path.join(outDir, `${testCase.name}-${viewport.name}-failed.png`);
        await page.screenshot({ path: screenshot, fullPage: false }).catch(() => {});
        results.push({
          case: testCase.name,
          viewport: viewport.name,
          error: error.message,
          screenshot,
        });
        await page.close();
        continue;
      }

      const metrics = await page.evaluate(() => {
        const actionLabels = [...document.querySelectorAll('button')]
          .map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim())
          .filter(Boolean)
          .slice(-12);
        const actionArea = document.querySelector('[data-game-action-area]');
        const ownHand = document.querySelector('[data-own-hand]');
        const rectOf = (el) => {
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return {
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          };
        };
        const intersects = (a, b) => {
          if (!a || !b) return false;
          return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        };
        const actionRect = rectOf(actionArea);
        const ownHandRect = rectOf(ownHand);
        return {
          url: location.pathname,
          innerHeight,
          scrollHeight: document.documentElement.scrollHeight,
          bodyText: document.body.innerText.slice(0, 500),
          actionLabels,
          actionRect,
          ownHandRect,
          actionOverlapsOwnHand: intersects(actionRect, ownHandRect),
        };
      });
      const screenshot = path.join(outDir, `${testCase.name}-${viewport.name}.png`);
      await page.screenshot({ path: screenshot, fullPage: false });
      results.push({
        case: testCase.name,
        viewport: viewport.name,
        screenshot,
        overflow: metrics.scrollHeight - metrics.innerHeight,
        actionOverlapsOwnHand: metrics.actionOverlapsOwnHand,
        actionRect: metrics.actionRect,
        ownHandRect: metrics.ownHandRect,
        labels: metrics.actionLabels,
      });
      await page.close();
    }
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
