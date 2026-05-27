// 立体四目並べ 本番環境品質確認テスト

const puppeteer = require('puppeteer');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testConnect4Production() {
  console.log('🔍 立体四目並べ 本番環境品質確認開始...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list'
    ]
  });

  const page = await browser.newPage();
  let testsPassed = 0;
  let testsFailed = 0;
  const baseUrl = 'https://game-lounge-pi.vercel.app';

  try {
    // ========================================
    // 1. ゲーム選択ページ確認
    // ========================================
    console.log('=== 1. ゲーム選択ページ ===');
    await page.goto(`${baseUrl}/games`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const connect4Card = await page.evaluate(() => {
      const h2Tags = Array.from(document.querySelectorAll('h2'));
      return h2Tags.find(h => h.textContent.includes('立体四目並べ'))?.textContent;
    });

    if (connect4Card) {
      console.log('✅ 立体四目並べカード表示確認\n');
      testsPassed++;
    } else {
      console.log('❌ 立体四目並べカードが見つかりません\n');
      testsFailed++;
    }

    // ========================================
    // 2. モード選択ページ
    // ========================================
    console.log('=== 2. モード選択ページ ===');
    await page.goto(`${baseUrl}/games/connect4`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const modeTitle = await page.$eval('h1', el => el.textContent);
    if (modeTitle.includes('立体四目並べ')) {
      console.log('✅ モード選択ページ表示確認\n');
      testsPassed++;
    } else {
      console.log('❌ モード選択ページのタイトルが不正\n');
      testsFailed++;
    }

    const modes = await page.evaluate(() => {
      const h2Tags = Array.from(document.querySelectorAll('h2'));
      return h2Tags.map(h => h.textContent);
    });

    if (modes.some(m => m.includes('オンライン')) &&
        modes.some(m => m.includes('ローカル')) &&
        modes.some(m => m.includes('CPU'))) {
      console.log('✅ 3つのモードカード表示確認\n');
      testsPassed++;
    } else {
      console.log('❌ モードカードが不足しています\n');
      testsFailed++;
    }

    // ========================================
    // 3. ルールページ
    // ========================================
    console.log('=== 3. ルールページ ===');
    await page.goto(`${baseUrl}/games/connect4/rules`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const ruleTitle = await page.$eval('h1', el => el.textContent);
    if (ruleTitle.includes('ルール')) {
      console.log('✅ ルールページ表示確認\n');
      testsPassed++;
    } else {
      console.log('❌ ルールページのタイトルが不正\n');
      testsFailed++;
    }

    const ruleContent = await page.evaluate(() => document.body.innerText);
    if (ruleContent.includes('13種類') &&
        ruleContent.includes('重力') &&
        ruleContent.includes('4×4×4')) {
      console.log('✅ ルール内容の記載確認\n');
      testsPassed++;
    } else {
      console.log('❌ ルール内容が不足しています\n');
      testsFailed++;
    }

    // ========================================
    // 4. CPU対戦ページ
    // ========================================
    console.log('=== 4. CPU対戦ページ ===');
    await page.goto(`${baseUrl}/games/connect4/cpu`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const cpuTitle = await page.$eval('h1', el => el.textContent);
    if (cpuTitle.includes('CPU対戦')) {
      console.log('✅ CPU対戦ページ表示確認\n');
      testsPassed++;
    } else {
      console.log('❌ CPU対戦ページのタイトルが不正\n');
      testsFailed++;
    }

    // 難易度選択画面
    const difficultyOptions = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(b => b.textContent);
    });

    if (difficultyOptions.some(o => o.includes('初級')) &&
        difficultyOptions.some(o => o.includes('中級')) &&
        difficultyOptions.some(o => o.includes('上級'))) {
      console.log('✅ 難易度選択ボタン表示確認\n');
      testsPassed++;
    } else {
      console.log('❌ 難易度選択ボタンが不足しています\n');
      testsFailed++;
    }

    // 中級でゲーム開始
    const buttons = await page.$$('button');
    if (buttons.length >= 2) {
      await buttons[1].click(); // 中級
      await sleep(2000);

      // ボード表示確認
      const levelText = await page.evaluate(() => {
        const spans = Array.from(document.querySelectorAll('span'));
        return spans.find(s => s.textContent.includes('レベル'))?.textContent;
      });

      if (levelText) {
        console.log('✅ ゲームボード表示確認\n');
        testsPassed++;
      } else {
        console.log('❌ ゲームボードが表示されていません\n');
        testsFailed++;
      }

      // ターン表示確認
      const turnInfo = await page.evaluate(() => {
        const pTags = Array.from(document.querySelectorAll('p'));
        return pTags.find(p => p.textContent.includes('あなた') || p.textContent.includes('CPU'))?.textContent;
      });

      if (turnInfo) {
        console.log('✅ ターン表示確認: ' + turnInfo + '\n');
        testsPassed++;
      } else {
        console.log('❌ ターン表示が見つかりません\n');
        testsFailed++;
      }

      // ルール概要表示確認
      const rulesSummary = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('勝利条件') || text.includes('4つ揃える');
      });

      if (rulesSummary) {
        console.log('✅ ルール概要表示確認\n');
        testsPassed++;
      } else {
        console.log('❌ ルール概要が表示されていません\n');
        testsFailed++;
      }

      // 実際にゲームプレイ
      const cells = await page.$$('div[class*="cursor-pointer"]');
      if (cells.length > 0) {
        await cells[0].click();
        await sleep(2500); // CPU思考待ち

        const emojiCount = await page.evaluate(() => {
          const text = document.body.innerText;
          const blueCount = (text.match(/🔵/g) || []).length;
          const redCount = (text.match(/🔴/g) || []).length;
          return { blue: blueCount, red: redCount };
        });

        if (emojiCount.blue >= 1 && emojiCount.red >= 1) {
          console.log(`✅ ゲームプレイ動作確認（🔵${emojiCount.blue}個、🔴${emojiCount.red}個）\n`);
          testsPassed++;
        } else {
          console.log('❌ 駒が正しく配置されていません\n');
          testsFailed++;
        }
      }
    }

    // ========================================
    // 5. ローカル対戦ページ
    // ========================================
    console.log('=== 5. ローカル対戦ページ ===');
    await page.goto(`${baseUrl}/games/connect4/local`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const localTitle = await page.$eval('h1', el => el.textContent);
    if (localTitle.includes('ローカル対戦')) {
      console.log('✅ ローカル対戦ページ表示確認\n');
      testsPassed++;
    } else {
      console.log('❌ ローカル対戦ページのタイトルが不正\n');
      testsFailed++;
    }

    // ゲーム開始状態確認
    const player1Turn = await page.evaluate(() => {
      const pTags = Array.from(document.querySelectorAll('p'));
      return pTags.find(p => p.textContent.includes('Player 1'))?.textContent;
    });

    if (player1Turn) {
      console.log('✅ Player1のターン表示確認\n');
      testsPassed++;
    } else {
      console.log('❌ Player1のターン表示が見つかりません\n');
      testsFailed++;
    }

    // 駒配置テスト
    const localCells = await page.$$('div[class*="cursor-pointer"]');
    if (localCells.length > 0) {
      await localCells[0].click();
      await sleep(1000);

      // ターン交代画面
      const turnChange = await page.evaluate(() => {
        const h2Tags = Array.from(document.querySelectorAll('h2'));
        return h2Tags.find(h => h.textContent.includes('Player 2'))?.textContent;
      });

      if (turnChange) {
        console.log('✅ ターン交代画面表示確認\n');
        testsPassed++;
      } else {
        console.log('❌ ターン交代画面が表示されていません\n');
        testsFailed++;
      }
    }

    // ========================================
    // 6. UI/UX品質確認
    // ========================================
    console.log('=== 6. UI/UX品質確認 ===');

    // グローバルナビゲーション
    await page.goto(`${baseUrl}/games/connect4`, { waitUntil: 'networkidle2' });
    const hasHeader = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.some(l => l.textContent.includes('ゲームラウンジ'));
    });

    if (hasHeader) {
      console.log('✅ グローバルナビゲーション確認\n');
      testsPassed++;
    } else {
      console.log('❌ グローバルナビゲーションが見つかりません\n');
      testsFailed++;
    }

    // レスポンシブデザイン（モバイルビューポート）
    await page.setViewport({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(1000);

    const isMobileResponsive = await page.evaluate(() => {
      const body = document.body;
      return body.scrollHeight > 0 && body.scrollWidth <= 400;
    });

    if (isMobileResponsive) {
      console.log('✅ モバイルレスポンシブ確認\n');
      testsPassed++;
    } else {
      console.log('⚠️  モバイル表示要確認\n');
    }

    // ========================================
    // テスト結果サマリー
    // ========================================
    console.log('\n' + '='.repeat(50));
    console.log('📊 テスト結果サマリー');
    console.log('='.repeat(50));
    console.log(`✅ 成功: ${testsPassed}`);
    console.log(`❌ 失敗: ${testsFailed}`);
    console.log(`合計: ${testsPassed + testsFailed}`);
    console.log(`成功率: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));

    if (testsFailed === 0) {
      console.log('\n🎉 全ての品質確認テストに合格しました！');
    } else {
      console.log('\n⚠️  一部のテストで問題が見つかりました。');
    }

  } catch (error) {
    console.error('\n❌ テスト実行エラー:', error.message);
    testsFailed++;
  } finally {
    await browser.close();
  }

  return testsFailed === 0;
}

// メイン実行
testConnect4Production().then(success => {
  if (success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}).catch(error => {
  console.error('致命的エラー:', error);
  process.exit(1);
});
