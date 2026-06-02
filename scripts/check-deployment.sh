#!/bin/bash
# Vercelデプロイ状況を確認するスクリプト

PROJECT_URL="https://game-lounge-pi.vercel.app"
MAX_WAIT=600  # 最大10分待機
INTERVAL=30   # 30秒ごとにチェック

echo "🚀 Checking deployment status for: $PROJECT_URL"
echo "⏰ Started at: $(date)"
echo ""

elapsed=0
while [ $elapsed -lt $MAX_WAIT ]; do
  # 新しいゲームページが存在するかチェック
  status=$(curl -sk "$PROJECT_URL/games/indian-poker" -o /dev/null -w '%{http_code}' 2>/dev/null)

  if [ "$status" = "200" ]; then
    echo "✅ Deployment successful!"
    echo "⏱️  Time taken: ${elapsed} seconds"
    echo "🌐 Site is live at: $PROJECT_URL"
    exit 0
  elif [ "$status" = "404" ]; then
    echo "⏳ Still deploying... (${elapsed}s elapsed, HTTP $status)"
  else
    echo "⚠️  Unexpected status: HTTP $status (${elapsed}s elapsed)"
  fi

  sleep $INTERVAL
  elapsed=$((elapsed + INTERVAL))
done

echo "❌ Deployment check timed out after ${MAX_WAIT} seconds"
echo "Please check Vercel dashboard: https://vercel.com/cds-dev-devs-projects/game-lounge"
exit 1
