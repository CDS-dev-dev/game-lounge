# コントラスト改善 設計

## 色使いの基本ルール

### 暗色背景（slate-900, purple-900など）
- 見出し：text-white
- 本文：text-gray-100 または text-gray-200
- 補助テキスト：text-gray-300（最低限）
- リンク：text-gray-200 hover:text-white

### 明色背景（white, gray-50など）
- 見出し：text-gray-900 または text-gray-800
- 本文：text-gray-700 または text-gray-600
- 補助テキスト：text-gray-500（最低限）
- リンク：text-indigo-600 hover:text-indigo-700

## 修正対象ファイル

1. app/page.tsx
   - text-gray-300 → text-gray-100
   - text-gray-400 → text-gray-200
   - text-gray-500 → text-gray-300

2. app/games/geister/online/page.tsx
   - text-gray-700 → text-gray-900（Card内なので濃く）
   - text-gray-500 → text-gray-600（Card内なので濃く）

3. globals.cssにコメント追加
