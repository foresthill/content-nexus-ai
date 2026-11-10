import { test, expect } from '@playwright/test';

/**
 * E2E スモークテスト（DB書き込みなし・公開ページのみ）。
 * アプリが起動し、主要公開ページが描画されることを確認する最小セット。
 */

test('トップページが表示される', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status() ?? 200).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
});

test('サインインページにログインフォームが描画される', async ({ page }) => {
  await page.goto('/auth/signin');
  // パスワード入力欄があること（Credentialsログインフォーム）
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test('未ログインで保護ページへ行くとサインインへリダイレクト', async ({ page }) => {
  await page.goto('/settings/openrouter');
  // middleware により /auth/signin へ飛ばされる
  await expect(page).toHaveURL(/\/auth\/signin/);
});
