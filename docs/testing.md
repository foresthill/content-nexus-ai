# テスト基盤ガイド

本プロジェクトのテストは **単体 / 結合 / E2E** の3層で構成する。

| 層 | ランナー | 環境 | 対象 | 実行コマンド |
|---|---|---|---|---|
| 単体 (unit) | Jest (jsdom) | 外部依存なし | 純粋ロジック・コンポーネント | `npm test` |
| 結合 (integration) | Jest (node) | 実DB + 暗号化 | サービス層×DB（ApiKeyService 等） | `npm run test:integration` |
| E2E (統合) | Playwright | 実アプリ起動 | ブラウザ操作・画面遷移・認証 | `npm run test:e2e` |

## 単体テスト
- 命名: `*.test.ts(x)` または `__tests__/`。`jsdom` 環境、`@testing-library/*` 利用可。
- **外部依存（DB・ネットワーク）を持たないこと**。必要ならモックする。
- 例: `src/lib/openrouter/__tests__/user-config.test.ts`（`isMaskedKey` 等の純粋関数）。

```bash
npm test                 # 全単体
npm run test:watch       # ウォッチ
npm run test:coverage    # カバレッジ
```

## 結合テスト（実DB）
- 命名: `*.integration.test.ts`。`node` 環境、`jest.integration.config.js` で実行。
- **既定の `npm test` からは除外**（`jest.config.js` の `testPathIgnorePatterns`）。
- `.env` の `DATABASE_URL` / `DIRECT_URL` / `ENCRYPTION_KEY` を使用。**env が無い環境では `describe.skip` で自動スキップ**。
- テスト専用ユーザー/レコードを作成し、`afterAll` でクリーンアップ（直列実行 `maxWorkers: 1`）。
- 例: `src/lib/apikey/__tests__/service.integration.test.ts`（暗号化保存→復号の往復を実DBで検証）。

```bash
npm run test:integration
```

## E2E（統合テスト）
- `e2e/*.spec.ts`。`playwright.config.ts` の `webServer` が `npm run dev` を自動起動（起動済みなら再利用）。
- 事前に一度だけブラウザ取得が必要:
  ```bash
  npx playwright install chromium
  ```
- 実行:
  ```bash
  npm run test:e2e        # ヘッドレス実行
  npm run test:e2e:ui     # UIモード
  npx playwright show-report
  ```
- スモーク例: `e2e/smoke.spec.ts`（トップ表示・サインインフォーム・未ログイン時の保護リダイレクト。**DB書き込みなし**）。
- 認証が必要なフローの E2E は Credentials（メール/パスワード）サインアップを使う。Google OAuth は外部依存のため E2E では避ける。**DB に書き込むE2Eを足す場合はユニークなメール＋後始末**を徹底する。

## CI の方針（推奨）
- 単体は常時実行。
- 結合は DB 接続情報がある環境でのみ（env 無しは自動スキップ）。
- E2E は `npx playwright install --with-deps chromium` 後に実行。
