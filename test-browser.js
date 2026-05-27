/**
 * ブラウザ自動テスト
 * Puppeteerを使用してCPU対戦を実際にプレイ
 */

const puppeteer = require('puppeteer');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3333';

async function testCpuGame() {
  console.log('🧪 CPU対戦ブラウザテスト開始...\n');
  console.log(`テスト対象: ${BASE_URL}/games/geister/cpu\n`);

  let browser;
  let page;

  try {
    // ブラウザ起動
    console.log('✓ ブラウザを起動中...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // コンソールログを監視
    const logs = [];
    const errors = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => errors.push(error.message));

    // ページ遷移
    console.log('✓ CPU対戦ページにアクセス中...');
    await page.goto(`${BASE_URL}/games/geister/cpu`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // タイトル確認
    const title = await page.title();
    console.log(`  ✅ ページタイトル: ${title}`);

    // CPU対戦のタイトルがあるか確認
    const cpuTitle = await page.$eval('h1', el => el.textContent);
    if (cpuTitle.includes('CPU対戦')) {
      console.log('  ✅ CPU対戦タイトルが表示されています\n');
    } else {
      throw new Error(`CPU対戦タイトルが見つかりません: ${cpuTitle}`);
    }

    // 配置完了ボタンを探す
    console.log('✓ 配置完了ボタンをクリック中...');
    await page.waitForSelector('button', { timeout: 5000 });

    const setupButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('配置完了'));
    });

    if (!setupButton) {
      throw new Error('配置完了ボタンが見つかりません');
    }

    // ボタンをクリック
    await page.evaluate(btn => btn.click(), setupButton);
    console.log('  ✅ 配置完了ボタンをクリックしました');

    // 少し待機（状態遷移のため）
    await new Promise(resolve => setTimeout(resolve, 1000));

    // エラーチェック
    if (errors.length > 0) {
      console.error('\n❌ ページエラーが検出されました:');
      errors.forEach(err => console.error(`  - ${err}`));
      throw new Error('ページエラーが発生しました');
    }

    // アラートやエラーメッセージがないか確認
    const errorMessages = await page.evaluate(() => {
      const body = document.body.textContent;
      if (body.includes('このゲームの参加者ではありません')) return 'ゲーム参加エラー';
      if (body.includes('エラー') || body.includes('Error')) return 'エラーメッセージ検出';
      return null;
    });

    if (errorMessages) {
      throw new Error(errorMessages);
    }

    console.log('  ✅ エラーメッセージは検出されませんでした\n');

    // ゲームボードが表示されているか確認
    console.log('✓ ゲームボード表示確認中...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const hasGameBoard = await page.evaluate(() => {
      const body = document.body.textContent;
      return body.includes('現在のターン') || body.includes('あなた');
    });

    if (hasGameBoard) {
      console.log('  ✅ ゲームボードが表示されました');
    } else {
      throw new Error('ゲームボードが表示されませんでした');
    }

    // 駒が表示されているか確認
    const pieceEmojis = await page.evaluate(() => {
      const body = document.body.innerHTML;
      return {
        hasGhost: body.includes('👻'),
        hasDevil: body.includes('😈'),
        hasOpponent: body.includes('👤'),
      };
    });

    console.log('\n✓ 駒の表示確認:');
    console.log(`  ${pieceEmojis.hasGhost ? '✅' : '❌'} 青いお化け👻`);
    console.log(`  ${pieceEmojis.hasDevil ? '✅' : '❌'} 赤い悪魔😈`);
    console.log(`  ${pieceEmojis.hasOpponent ? '✅' : '❌'} 相手の駒👤`);

    if (!pieceEmojis.hasGhost || !pieceEmojis.hasDevil) {
      throw new Error('駒が正しく表示されていません');
    }

    // コンソールログを出力
    console.log('\n✓ ブラウザコンソールログ:');
    const relevantLogs = logs.filter(log =>
      !log.includes('[HMR]') &&
      !log.includes('Download') &&
      !log.includes('webpack')
    );
    if (relevantLogs.length > 0) {
      relevantLogs.slice(0, 5).forEach(log => console.log(`  ${log}`));
    } else {
      console.log('  (関連するログなし)');
    }

    console.log('\n==========================================');
    console.log('✅ CPU対戦ブラウザテスト成功！');
    console.log('==========================================\n');

    return true;

  } catch (error) {
    console.error('\n❌ テスト失敗:', error.message);

    // スクリーンショット撮影
    if (page) {
      const screenshotPath = '/tmp/test-failure.png';
      await page.screenshot({ path: screenshotPath });
      console.log(`スクリーンショット保存: ${screenshotPath}`);
    }

    return false;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// テスト実行
(async () => {
  const success = await testCpuGame();
  process.exit(success ? 0 : 1);
})();
