// 立体四目並べローカル対戦のE2Eテスト

const puppeteer = require('puppeteer');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testConnect4Local() {
  console.log('立体四目並べ ローカル対戦テスト開始...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // テスト1: ページ読み込み
    console.log('テスト1: ページ読み込み');
    await page.goto('http://localhost:3000/games/connect4/local', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    console.log('✅ ページ読み込み成功\n');
    testsPassed++;

    // テスト2: ゲームが開始しているか
    console.log('テスト2: ゲーム画面表示');
    const turnInfo = await page.evaluate(() => {
      const pTags = Array.from(document.querySelectorAll('p'));
      const turnTag = pTags.find(p => p.textContent.includes('Player 1'));
      return turnTag?.textContent || '';
    });
    if (turnInfo.includes('Player 1')) {
      console.log('✅ ゲーム画面表示成功: ' + turnInfo + '\n');
      testsPassed++;
    } else {
      console.log('❌ ゲーム画面が表示されていません\n');
      testsFailed++;
    }

    // テスト3: ボードが表示されているか
    console.log('テスト3: ボード表示確認');
    const levelText = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      return spans.find(s => s.textContent.includes('レベル'))?.textContent;
    });
    if (levelText && levelText.includes('レベル')) {
      console.log('✅ ボード表示成功（' + levelText + '）\n');
      testsPassed++;
    } else {
      console.log('❌ ボードが表示されていません\n');
      testsFailed++;
    }

    // テスト4: Player1が駒を配置
    console.log('テスト4: Player1の駒配置');
    const cells = await page.$$('div[class*="cursor-pointer"]');
    if (cells.length > 0) {
      await cells[0].click();
      await sleep(1000);
      console.log('✅ Player1の駒配置成功\n');
      testsPassed++;
    } else {
      console.log('❌ クリック可能なセルが見つかりません\n');
      testsFailed++;
    }

    // テスト5: ターン交代画面が表示されるか
    console.log('テスト5: ターン交代画面表示');
    await sleep(500);
    const turnChangeTitle = await page.evaluate(() => {
      const h2Tags = Array.from(document.querySelectorAll('h2'));
      return h2Tags.find(h => h.textContent.includes('Player 2'))?.textContent || '';
    });
    if (turnChangeTitle.includes('Player 2')) {
      console.log('✅ ターン交代画面表示成功: ' + turnChangeTitle + '\n');
      testsPassed++;
    } else {
      console.log('❌ ターン交代画面が表示されていません\n');
      testsFailed++;
    }

    // テスト6: 準備完了ボタンを押す
    console.log('テスト6: 準備完了ボタン');
    const readyButton = await page.$('button');
    if (readyButton) {
      await readyButton.click();
      await sleep(1000);
      console.log('✅ 準備完了ボタン押下成功\n');
      testsPassed++;
    } else {
      console.log('❌ 準備完了ボタンが見つかりません\n');
      testsFailed++;
    }

    // テスト7: Player2のターンになっているか
    console.log('テスト7: Player2のターン確認');
    const turnInfo2 = await page.evaluate(() => {
      const pTags = Array.from(document.querySelectorAll('p'));
      const turnTag = pTags.find(p => p.textContent.includes('Player 2'));
      return turnTag?.textContent || '';
    });
    if (turnInfo2.includes('Player 2')) {
      console.log('✅ Player2のターン表示成功: ' + turnInfo2 + '\n');
      testsPassed++;
    } else {
      console.log('❌ Player2のターン表示が見つかりません\n');
      testsFailed++;
    }

    // テスト8: 駒が表示されているか
    console.log('テスト8: 駒表示確認');
    const emojiCount = await page.evaluate(() => {
      const text = document.body.innerText;
      const blueCount = (text.match(/🔵/g) || []).length;
      return blueCount;
    });
    if (emojiCount >= 1) {
      console.log('✅ 駒表示成功（🔵 ' + emojiCount + '個）\n');
      testsPassed++;
    } else {
      console.log('❌ 駒が表示されていません\n');
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
testConnect4Local().then(success => {
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
