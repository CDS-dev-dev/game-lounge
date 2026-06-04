const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // next.config.ts のパスを指定
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  // テスト環境
  testEnvironment: 'jest-environment-jsdom',

  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // モジュール名マッピング（@/* のエイリアス）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // テスト対象のファイルパターン
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // カバレッジ設定
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  // カバレッジ閾値
  coverageThreshold: {
    global: {
      statements: 20,
      branches: 15,
      functions: 20,
      lines: 20,
    },
  },
}

module.exports = createJestConfig(config)
