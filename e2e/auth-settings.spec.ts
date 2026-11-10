import { test, expect } from '@playwright/test';

/**
 * フルスタック E2E:
 *   サインアップ → ログイン状態で /dashboard → OpenRouter設定でAPIキー保存 →
 *   リロードしてマスク表示（＝サーバDBに暗号化保存され、マスクで復元される）を確認。
 *
 * - 認証は Credentials（メール/パスワード）。Google OAuth は外部依存のため使わない。
 * - 保存するキーは `sk-or-` 形式のダミー（保存時に外部APIは呼ばれない）。
 * - 作成したテストユーザーは global-teardown でメールパターン(e2e+)により削除。
 */

// 一意なメールで実行ごとの衝突を回避（teardown が e2e+ プレフィックスで掃除）
const email = `e2e+${Date.now()}@example.test`;
const password = 'E2ePassw0rd!';

test('サインアップ→ログイン→OpenRouterキー保存→マスク復元', async ({ page }) => {
  // --- サインアップ ---
  await page.goto('/auth/signup');
  await page.fill('input[name="name"]', 'E2E User');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  const terms = page.locator('input[name="terms"]');
  if (await terms.count()) await terms.check();
  await page.click('button[type="submit"]');

  // 登録成功で /dashboard にログイン状態で遷移
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });

  // --- 保護ページに入れる（認証が効いている） ---
  await page.goto('/settings/openrouter');
  await expect(page).toHaveURL(/\/settings\/openrouter/);
  // 初期の loadConfig/loadModels が入力を上書きしないよう完了を待つ
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#apiKey')).toBeVisible();

  // --- APIキーを保存 ---
  const fakeKey = 'sk-or-v1-e2e-fake-key-1234567890abcdef';
  await page.fill('#apiKey', fakeKey);
  await page.click('button:has-text("設定を保存")');
  // 保存成功メッセージ
  await expect(page.getByText('設定が保存されました')).toBeVisible({ timeout: 15000 });

  // --- リロードしてマスク表示を確認（サーバから復元） ---
  await page.reload();
  // GET がマスク済みキー(●...)を返し、input に反映される
  await expect(page.locator('#apiKey')).toHaveValue(/●/, { timeout: 15000 });
  // 平文は復元されない
  await expect(page.locator('#apiKey')).not.toHaveValue(fakeKey);
});
