import { defineConfig, devices } from '@playwright/test';

/**
 * E2E(統合テスト)設定。
 * - testDir: ./e2e
 * - webServer: npm run dev を自動起動し、起動後にテスト実行
 *   （既に dev サーバが起動していれば再利用）
 * - 実行: npm run test:e2e / npm run test:e2e:ui
 * - 事前にブラウザ取得が必要: npx playwright install chromium
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
