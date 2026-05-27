/**
 * CPU対戦の完全なブラウザE2Eテスト
 * 配置から対戦までテスト
 */

const puppeteer = require('puppeteer');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3333';

async function testCpuGameComplete() {
  console.log('🧪 CPU対戦 完全E2Eテスト開始...\n');
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

    // エラー監視
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`  [Browser Error] ${msg.text()}`);
      }
    });

    // ===============================
    // テスト1: ページロード
    // ===============================
    console.log('\n【テスト1】ページロード');
    await page.goto(`${BASE_URL}/games/geister/cpu`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const title = await page.title();
    console.log(`  ✅ ページタイトル: ${title}`);

    const cpuTitle = await page.$eval('h1', el => el.textContent);
    if (!cpuTitle.includes('CPU対戦')) {
      throw new Error(`CPU対戦タイトルが見つかりません: ${cpuTitle}`);
    }
    console.log('  ✅ CPU対戦タイトル確認');

    // ===============================
    // テスト2: 配置UI確認
    // ===============================
    console.log('\n【テスト2】配置UI確認');

    // Good駒/Bad駒ボタンがあるか確認
    const hasGoodButton = await page.evaluate(() => {
      return document.body.textContent.includes('Good駒');
    });
    const hasBadButton = await page.evaluate(() => {
      return document.body.textContent.includes('Bad駒');
    });

    if (!hasGoodButton || !hasBadButton) {
      throw new Error('駒選択ボタンが見つかりません');
    }
    console.log('  ✅ Good駒/Bad駒ボタン確認');

    // ランダム配置ボタンがあるか確認
    const hasRandomButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => btn.textContent.includes('ランダム配置'));
    });

    if (!hasRandomButton) {
      throw new Error('ランダム配置ボタンが見つかりません');
    }
    console.log('  ✅ ランダム配置ボタン確認');

    // ===============================
    // テスト3: ランダム配置を実行
    // ===============================
    console.log('\n【テスト3】ランダム配置実行');

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const randomBtn = buttons.find(btn => btn.textContent.includes('ランダム配置'));
      if (randomBtn) randomBtn.click();
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('  ✅ ランダム配置ボタンをクリック');

    // 駒が配置されたか確認
    const piecesPlaced = await page.evaluate(() => {
      const body = document.body.innerHTML;
      const ghostCount = (body.match(/👻/g) || []).length;
      const devilCount = (body.match(/😈/g) || []).length;
      return { ghost: ghostCount, devil: devilCount };
    });

    console.log(`  ✅ 配置確認: 👻×${piecesPlaced.ghost} 😈×${piecesPlaced.devil}`);

    if (piecesPlaced.ghost < 4 || piecesPlaced.devil < 4) {
      console.warn('  ⚠️  駒が不足している可能性があります');
    }

    // ===============================
    // テスト4: 配置完了
    // ===============================
    console.log('\n【テスト4】配置完了');

    const completeButtonExists = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => btn.textContent.includes('配置完了'));
    });

    if (!completeButtonExists) {
      throw new Error('配置完了ボタンが見つかりません');
    }

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const completeBtn = buttons.find(btn => btn.textContent.includes('配置完了'));
      if (completeBtn && !completeBtn.disabled) {
        completeBtn.click();
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('  ✅ 配置完了ボタンをクリック');

    // エラーチェック
    if (errors.length > 0) {
      console.error('\n❌ JavaScriptエラーが検出されました:');
      errors.forEach(err => console.error(`  - ${err}`));
      throw new Error('JavaScriptエラーが発生しました');
    }

    // ===============================
    // テスト5: ゲームボード表示確認
    // ===============================
    console.log('\n【テスト5】ゲームボード表示確認');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const gameInfo = await page.evaluate(() => {
      const body = document.body.textContent;
      return {
        hasTurn: body.includes('現在のターン'),
        hasYou: body.includes('あなた'),
        hasCaptured: body.includes('捕獲'),
      };
    });

    console.log(`  ${gameInfo.hasTurn ? '✅' : '❌'} 現在のターン表示`);
    console.log(`  ${gameInfo.hasYou ? '✅' : '❌'} プレイヤー表示`);
    console.log(`  ${gameInfo.hasCaptured ? '✅' : '❌'} 捕獲カウント表示`);

    if (!gameInfo.hasTurn) {
      throw new Error('ゲームボードが表示されていません');
    }

    // ===============================
    // テスト6: 駒の表示確認
    // ===============================
    console.log('\n【テスト6】駒の表示確認');

    const piecesOnBoard = await page.evaluate(() => {
      const body = document.body.innerHTML;
      return {
        hasGhost: body.includes('👻'),
        hasDevil: body.includes('😈'),
        hasOpponent: body.includes('👤'),
      };
    });

    console.log(`  ${piecesOnBoard.hasGhost ? '✅' : '❌'} 青いお化け👻`);
    console.log(`  ${piecesOnBoard.hasDevil ? '✅' : '❌'} 赤い悪魔😈`);
    console.log(`  ${piecesOnBoard.hasOpponent ? '✅' : '❌'} 相手の駒👤`);

    if (!piecesOnBoard.hasGhost || !piecesOnBoard.hasDevil) {
      throw new Error('駒が正しく表示されていません');
    }

    // ===============================
    // 完了
    // ===============================
    console.log('\n==========================================');
    console.log('✅ CPU対戦 完全E2Eテスト成功！');
    console.log('==========================================');
    console.log('\nテスト項目:');
    console.log('  ✅ ページロード');
    console.log('  ✅ 配置UI表示');
    console.log('  ✅ ランダム配置機能');
    console.log('  ✅ 配置完了機能');
    console.log('  ✅ ゲームボード表示');
    console.log('  ✅ 駒の表示\n');

    return true;

  } catch (error) {
    console.error('\n❌ テスト失敗:', error.message);

    // スクリーンショット撮影
    if (page) {
      const screenshotPath = '/tmp/test-failure.png';
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`\nスクリーンショット保存: ${screenshotPath}`);
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
  const success = await testCpuGameComplete();
  process.exit(success ? 0 : 1);
})();
