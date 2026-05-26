const fs = require('fs');
const path = require('path');

// .env.localから環境変数を読み込み
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const schemaSQL = fs.readFileSync(
  path.join(__dirname, '../supabase/schema.sql'),
  'utf8'
);

// プロジェクトIDを抽出
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

async function applySchemaViaManagementAPI() {
  try {
    console.log('🔧 Supabase Management APIを使ってスキーマを適用します...');
    console.log('📍 Project:', projectRef);

    // Management APIエンドポイント
    const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

    console.log('\n⚠️  Management APIにはアクセストークンが必要です');
    console.log('現在のSERVICE_ROLE_KEYではアクセスできません\n');

    console.log('📝 代わりに、以下の手順で手動でスキーマを適用してください:\n');
    console.log('1. https://supabase.com/dashboard/project/' + projectRef + ' にアクセス');
    console.log('2. 左サイドバーから「SQL Editor」をクリック');
    console.log('3. 「New query」ボタンをクリック');
    console.log('4. 以下のファイルの内容をコピー＆ペースト:');
    console.log('   📄 supabase/schema.sql');
    console.log('5. 「Run」ボタン（または Cmd/Ctrl + Enter）で実行');
    console.log('\n6. その後、Realtimeを有効化:');
    console.log('   - 左サイドバーから「Database」→「Replication」');
    console.log('   - 「game_sessions」テーブルを探して「Enable」\n');

    console.log('💡 ブラウザで上記のURLを開きますか？');
    console.log('   (手動で開く場合は Ctrl+C で中断してください)');

    // 5秒待ってからブラウザで開く
    await new Promise(resolve => setTimeout(resolve, 3000));

    // URLをクリップボードにコピー（可能なら）
    const url = `https://supabase.com/dashboard/project/${projectRef}/editor`;
    console.log('\n🌐 SQL Editor URL:', url);

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

applySchemaViaManagementAPI();
