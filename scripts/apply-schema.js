const fs = require('fs');
const path = require('path');

// .env.localから環境変数を読み込み
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '設定済み' : '未設定');
  process.exit(1);
}

const schemaSQL = fs.readFileSync(
  path.join(__dirname, '../supabase/schema.sql'),
  'utf8'
);

async function applySchema() {
  try {
    console.log('🔧 Supabaseスキーマを適用中...');
    console.log('📍 URL:', SUPABASE_URL);

    // Supabase REST APIを使ってSQLを実行
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        query: schemaSQL,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ スキーマ適用失敗:', response.status, errorText);

      // postgRESTの直接実行を試す
      console.log('\n🔄 別の方法でスキーマ適用を試みています...');
      await applySchemaDirectly();
      return;
    }

    const result = await response.json();
    console.log('✅ スキーマ適用成功！');
    console.log(result);
  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.log('\n📝 手動でスキーマを適用してください:');
    console.log('1. https://supabase.com/dashboard にアクセス');
    console.log('2. SQL Editorを開く');
    console.log('3. supabase/schema.sql の内容を貼り付けて実行');
    process.exit(1);
  }
}

// PostgreSQL直接接続を試みる
async function applySchemaDirectly() {
  try {
    // SQLを個別のステートメントに分割
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 ${statements.length}個のSQLステートメントを実行します\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      console.log(`[${i + 1}/${statements.length}] 実行中...`);

      // Supabase postgREST経由でSQL実行を試みる
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          sql: statement + ';',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️  [${i + 1}] スキップ: ${errorText.substring(0, 100)}`);
      } else {
        console.log(`✅ [${i + 1}] 成功`);
      }
    }

    console.log('\n✅ スキーマ適用完了（一部エラーがあった可能性があります）');
    console.log('\n📝 次のステップ:');
    console.log('1. https://supabase.com/dashboard でテーブルが作成されたか確認');
    console.log('2. Database → Replication で game_sessions テーブルのRealtimeを有効化');
  } catch (error) {
    console.error('❌ 直接適用も失敗:', error.message);
    console.log('\n📝 手動でスキーマを適用してください:');
    console.log('1. https://supabase.com/dashboard にアクセス');
    console.log('2. SQL Editorを開く');
    console.log('3. supabase/schema.sql の内容を貼り付けて実行');
    process.exit(1);
  }
}

applySchema();
