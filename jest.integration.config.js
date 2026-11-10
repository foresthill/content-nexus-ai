const nextJest = require('next/jest');

// 結合テスト用の Jest 設定。
// - testEnvironment: node（DB/サーバ側ロジックを対象にするため jsdom ではない）
// - .env を next/jest 経由で読み込み、実DB(DATABASE_URL)・ENCRYPTION_KEY を使用
// - 対象は *.integration.test.ts のみ
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testMatch: ['<rootDir>/src/**/*.integration.test.{ts,tsx}'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  // 結合テストは実DBに繋ぐため直列実行（並列によるデータ競合を避ける）
  maxWorkers: 1,
  testTimeout: 30000,
};

module.exports = createJestConfig(customJestConfig);
