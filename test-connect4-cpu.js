// 立体四目並べCPU対戦のE2Eテスト

const puppeteer = require('puppeteer');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testConnect4Cpu() {
  console.log('立体四目並べ CPU対戦テスト開始...\n');

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
    await page.goto('http://localhost:3000/games/connect4/cpu', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    console.log('✅ ページ読み込み成功\n');
    testsPassed++;

    // テスト2: 難易度選択画面が表示されているか
    console.log('テスト2: 難易度選択画面表示');
    const difficultyTitle = await page.$eval('h2', el => el.textContent);
    if (difficultyTitle.includes('難易度')) {
      console.log('✅ 難易度選択画面表示成功\n');
      testsPassed++;
    } else {
      console.log('❌ 難易度選択画面が表示されていません\n');
      testsFailed++;
    }

    // テスト3: 中級を選択してゲーム開始
    console.log('テスト3: 難易度選択（中級）');
    const buttons = await page.$$('button');
    // 2番目のボタンが中級
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

    // テスト4: ボードが表示されているか
    console.log('テスト4: ボード表示確認');
    await sleep(1000);
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

    // テスト5: 現在のターン表示
    console.log('テスト5: ターン表示確認');
    const turnInfo = await page.evaluate(() => {
      const pTags = Array.from(document.querySelectorAll('p'));
      const turnTag = pTags.find(p => p.textContent.includes('あなた') || p.textContent.includes('CPU'));
      return turnTag?.textContent || '';
    });
    if (turnInfo.includes('あなた')) {
      console.log('✅ ターン表示成功: ' + turnInfo + '\n');
      testsPassed++;
    } else {
      console.log('❌ ターン表示が見つかりません\n');
      testsFailed++;
    }

    // テスト6: セルをクリックして駒を配置
    console.log('テスト6: 駒配置テスト');
    const cells = await page.$$('div[class*="cursor-pointer"]');
    if (cells.length > 0) {
      await cells[0].click();
      await sleep(2000); // CPUの思考待ち
      console.log('✅ 駒配置成功（プレイヤー + CPU）\n');
      testsPassed++;
    } else {
      console.log('❌ クリック可能なセルが見つかりません\n');
      testsFailed++;
    }

    // テスト7: 駒が表示されているか
    console.log('テスト7: 駒表示確認');
    const emojiCount = await page.evaluate(() => {
      const text = document.body.innerText;
      const blueCount = (text.match(/🔵/g) || []).length;
      const redCount = (text.match(/🔴/g) || []).length;
      return blueCount + redCount;
    });
    if (emojiCount >= 2) {
      console.log('✅ 駒表示成功（🔵🔴 合計' + emojiCount + '個）\n');
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
testConnect4Cpu().then(success => {
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
