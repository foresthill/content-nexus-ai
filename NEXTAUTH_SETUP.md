# NextAuth セットアップ手順

## 必要な依存関係のインストール

Phase 1の実装を完了するには、以下のパッケージをインストールしてください：

```bash
npm install next-auth@beta @auth/prisma-adapter
```

**注意**: NextAuth v5は現在beta版のため、`@beta`タグでインストールします。

## インストール後の作業

1. 依存関係をインストール後、以下のファイルが自動的に機能します：
   - `src/auth.config.ts` - NextAuth設定
   - `src/auth.ts` - NextAuth認証インスタンス
   - `src/app/api/auth/[...nextauth]/route.ts` - APIルートハンドラー

2. Prismaクライアントを再生成：
```bash
npm run db:generate
```

3. データベースマイグレーション実行：
```bash
npm run db:migrate
```

4. 環境変数を`.env`に追加（`.env.example`参照）

5. 開発サーバーを起動：
```bash
npm run dev
```

## 確認事項

- [ ] `next-auth@beta` がインストールされている
- [ ] `@auth/prisma-adapter` がインストールされている
- [ ] Prismaクライアントが再生成されている
- [ ] 環境変数が設定されている
- [ ] マイグレーションが実行されている

## トラブルシューティング

### "Cannot find module 'next-auth'" エラー
```bash
npm install next-auth@beta
```

### Prisma型エラー
```bash
npm run db:generate
```

### データベース接続エラー
`.env`ファイルの`DATABASE_URL`と`DIRECT_URL`を確認してください。
