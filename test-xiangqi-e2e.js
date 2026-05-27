// 中国象棋 E2Eテスト

const puppeteer = require('puppeteer');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testXiangqiE2E() {
  console.log('🎮 中国象棋 E2Eテスト開始...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // ========================================
    // CPU対戦テスト
    // ========================================
    console.log('=== CPU対戦テスト ===');

    console.log('テスト1: ページ読み込み');
    await page.goto('http://localhost:3000/games/xiangqi/cpu', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    console.log('✅ ページ読み込み成功\n');
    testsPassed++;

    console.log('テスト2: 難易度選択画面表示');
    const difficultyTitle = await page.$eval('h2', el => el.textContent);
    if (difficultyTitle.includes('難易度')) {
      console.log('✅ 難易度選択画面表示成功\n');
      testsPassed++;
    } else {
      console.log('❌ 難易度選択画面が表示されていません\n');
      testsFailed++;
    }

    console.log('テスト3: 難易度選択（中級）');
    const buttons = await page.$$('button');
    if (buttons.length >= 2) {
      await buttons[1].click();
      await sleep(1000);
      console.log('✅ 難易度選択成功\n');
      testsPassed++;
    } else {
      console.log('❌ 難易度選択ボタンが見つかりません\n');
      testsFailed++;
      throw new Error('テスト失敗');
    }

    console.log('テスト4: ボード表示確認');
    await sleep(1000);
    const boardText = await page.evaluate(() => document.body.innerText);
    if (boardText.includes('楚河') && boardText.includes('漢界')) {
      console.log('✅ ボード表示成功（楚河漢界表示）\n');
      testsPassed++;
    } else {
      console.log('❌ ボードが正しく表示されていません\n');
      testsFailed++;
    }

    console.log('テスト5: 駒の表示確認');
    const pieceCount = await page.evaluate(() => {
      const text = document.body.innerText;
      // 中国語の駒文字をカウント
      const pieces = ['帥', '将', '仕', '士', '相', '象', '馬', '車', '炮', '砲', '兵', '卒'];
      let count = 0;
      for (const piece of pieces) {
        const matches = text.match(new RegExp(piece, 'g'));
        if (matches) count += matches.length;
      }
      return count;
    });

    if (pieceCount >= 20) { // 初期配置で各陣営16個=32個のはず
      console.log(`✅ 駒表示成功（${pieceCount}個の駒）\n`);
      testsPassed++;
    } else {
      console.log(`❌ 駒の表示が不足（${pieceCount}個）\n`);
      testsFailed++;
    }

    console.log('テスト6: ターン表示確認');
    const turnInfo = await page.evaluate(() => {
      const pTags = Array.from(document.querySelectorAll('p'));
      return pTags.find(p => p.textContent.includes('あなた') || p.textContent.includes('紅'))?.textContent || '';
    });

    if (turnInfo.includes('あなた') || turnInfo.includes('紅')) {
      console.log('✅ ターン表示成功: ' + turnInfo + '\n');
      testsPassed++;
    } else {
      console.log('❌ ターン表示が見つかりません\n');
      testsFailed++;
    }

    // ========================================
    // ローカル対戦テスト
    // ========================================
    console.log('=== ローカル対戦テスト ===');

    console.log('テスト7: ローカル対戦ページ読み込み');
    await page.goto('http://localhost:3000/games/xiangqi/local', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    console.log('✅ ページ読み込み成功\n');
    testsPassed++;

    console.log('テスト8: ゲーム画面表示');
    const localTitle = await page.$eval('h1', el => el.textContent);
    if (localTitle.includes('ローカル対戦')) {
      console.log('✅ ゲーム画面表示成功\n');
      testsPassed++;
    } else {
      console.log('❌ ゲーム画面が表示されていません\n');
      testsFailed++;
    }

    console.log('テスト9: ボード表示（ローカル）');
    const localBoard = await page.evaluate(() => document.body.innerText);
    if (localBoard.includes('楚河') && localBoard.includes('漢界')) {
      console.log('✅ ボード表示成功\n');
      testsPassed++;
    } else {
      console.log('❌ ボードが表示されていません\n');
      testsFailed++;
    }

    // ========================================
    // モード選択・ルールページテスト
    // ========================================
    console.log('=== モード選択・ルールページテスト ===');

    console.log('テスト10: モード選択ページ');
    await page.goto('http://localhost:3000/games/xiangqi', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    const modeTitle = await page.$eval('h1', el => el.textContent);
    if (modeTitle.includes('中国象棋') || modeTitle.includes('シャンチー')) {
      console.log('✅ モード選択ページ表示成功\n');
      testsPassed++;
    } else {
      console.log('❌ モード選択ページが不正\n');
      testsFailed++;
    }

    console.log('テスト11: ルールページ');
    await page.goto('http://localhost:3000/games/xiangqi/rules', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    const rulesContent = await page.evaluate(() => document.body.innerText);
    if (rulesContent.includes('帥/将') &&
        rulesContent.includes('楚河漢界') &&
        rulesContent.includes('塞象眼') &&
        rulesContent.includes('蹩馬腿')) {
      console.log('✅ ルールページ表示成功（特殊ルール記載あり）\n');
      testsPassed++;
    } else {
      console.log('❌ ルールページの内容が不足\n');
      testsFailed++;
    }

    console.log('テスト12: ゲーム選択ページに追加');
    await page.goto('http://localhost:3000/games', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    const gamesPage = await page.evaluate(() => document.body.innerText);
    if (gamesPage.includes('中国象棋')) {
      console.log('✅ ゲーム選択ページに追加成功\n');
      testsPassed++;
    } else {
      console.log('❌ ゲーム選択ページに表示されていません\n');
      testsFailed++;
    }

    console.log('=== テスト結果 ===');
    console.log('✅ 成功: ' + testsPassed);
    console.log('❌ 失敗: ' + testsFailed);
    console.log('合計: ' + (testsPassed + testsFailed));

  } catch (error) {
    console.error('エラー発生:', error.message);
    testsFailed++;
  } finally {
    await browser.close();
  }

  return testsFailed === 0;
}

// メイン実行
testXiangqiE2E().then(success => {
  if (success) {
    console.log('\n🎉 全テスト成功！');
    process.exit(0);
  } else {
    console.log('\n❌ 一部テスト失敗');
    process.exit(1);
  }
}).catch(error => {
  console.error('テスト実行エラー:', error);
  process.exit(1);
});
