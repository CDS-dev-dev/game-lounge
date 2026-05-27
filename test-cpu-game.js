/**
 * CPU対戦機能のテストスクリプト
 * Node.jsで実行可能な簡易E2Eテスト
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// HTTPリクエストを送信
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function testCpuGamePage() {
  console.log('🧪 CPU対戦ページのテストを開始...\n');

  // テスト1: ページが正常にロードされるか
  console.log('✓ テスト1: ページロード確認');
  const pageRes = await makeRequest('/games/geister/cpu');
  if (pageRes.statusCode !== 200) {
    console.error(`❌ ページロードに失敗: ${pageRes.statusCode}`);
    return false;
  }
  console.log('  ✅ ページが正常にロードされました\n');

  // テスト2: 必要な要素が含まれているか
  console.log('✓ テスト2: ページ内容確認');
  const checks = [
    { name: 'タイトル', pattern: 'CPU対戦' },
    { name: '配置フェーズ', pattern: '駒の初期配置' },
    { name: '駒の説明', pattern: '青いお化け' },
    { name: '駒の説明', pattern: '赤い悪魔' },
    { name: '配置ボタン', pattern: '配置完了' },
  ];

  for (const check of checks) {
    if (pageRes.body.includes(check.pattern)) {
      console.log(`  ✅ ${check.name}: 見つかりました`);
    } else {
      console.error(`  ❌ ${check.name}: 見つかりません (期待: "${check.pattern}")`);
      return false;
    }
  }
  console.log('');

  // テスト3: JavaScriptエラーがないか（HTMLに含まれる初期データ）
  console.log('✓ テスト3: 初期状態確認');
  const hasScriptError = pageRes.body.includes('error') || pageRes.body.includes('Error');
  if (hasScriptError) {
    console.warn('  ⚠️  エラーメッセージが含まれている可能性があります');
  } else {
    console.log('  ✅ エラーメッセージは見つかりませんでした');
  }
  console.log('');

  return true;
}

async function testGameFlow() {
  console.log('🧪 ゲームフロー確認...\n');

  // テスト4: ゲーム選択からCPU対戦への導線確認
  console.log('✓ テスト4: 導線確認');

  const geisterModeRes = await makeRequest('/games/geister');
  if (geisterModeRes.body.includes('CPU対戦') && geisterModeRes.body.includes('/games/geister/cpu')) {
    console.log('  ✅ モード選択ページからCPU対戦へのリンクが存在します');
  } else {
    console.error('  ❌ モード選択ページにCPU対戦へのリンクがありません');
    return false;
  }

  const gamesRes = await makeRequest('/games');
  if (gamesRes.body.includes('ガイスター')) {
    console.log('  ✅ ゲーム選択ページにガイスターが表示されています');
  } else {
    console.error('  ❌ ゲーム選択ページにガイスターがありません');
    return false;
  }
  console.log('');

  return true;
}

async function runTests() {
  console.log('==========================================');
  console.log('  CPU対戦機能 テストスイート');
  console.log('==========================================\n');

  try {
    const pageTest = await testCpuGamePage();
    const flowTest = await testGameFlow();

    console.log('==========================================');
    if (pageTest && flowTest) {
      console.log('✅ すべてのテストが成功しました！');
      console.log('==========================================\n');
      process.exit(0);
    } else {
      console.log('❌ いくつかのテストが失敗しました');
      console.log('==========================================\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ テスト実行中にエラーが発生しました:', error.message);
    console.log('\nヒント: 開発サーバーが起動していることを確認してください');
    console.log('起動コマンド: PORT=3001 npm run dev\n');
    process.exit(1);
  }
}

// テスト実行
runTests();
