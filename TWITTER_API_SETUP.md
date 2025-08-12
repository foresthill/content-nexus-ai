# Twitter API 設定ガイド

X投稿機能を使用するために必要なTwitter API設定の詳細ガイドです。

## 🔧 必要な環境変数

以下の4つの環境変数を設定する必要があります：

```bash
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

## 📝 Twitter Developer Portal での設定手順

### 1. アカウント準備
1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) にアクセス
2. Twitterアカウントでログイン
3. 開発者申請が必要な場合は申請を完了

### 2. アプリケーション作成
1. **"Create App"** または **"+ Create App"** をクリック
2. アプリケーション情報を入力：
   - **App name**: `ToolPlus X Poster` (任意の名前)
   - **Description**: X投稿自動化アプリケーション
   - **Website URL**: `https://your-domain.com` (必須)
   - **Use case**: Content publishing/curation

### 3. アプリケーション権限設定
1. 作成したアプリをクリック
2. **"App permissions"** タブに移動
3. **"Read and Write"** を選択（重要！）
4. **"Save"** をクリック

### 4. API Keys の取得

#### API Key と API Secret
1. **"Keys and tokens"** タブに移動
2. **"API Key and Secret"** セクションで：
   - **API Key** をコピー → `TWITTER_API_KEY`
   - **API Key Secret** をコピー → `TWITTER_API_SECRET`

#### Access Token と Access Token Secret
1. 同じページの **"Access Token and Secret"** セクションで：
2. **"Generate"** ボタンをクリック（初回のみ）
3. 生成された値をコピー：
   - **Access Token** → `TWITTER_ACCESS_TOKEN`
   - **Access Token Secret** → `TWITTER_ACCESS_TOKEN_SECRET`

## 🔒 セキュリティ設定

### Callback URLs（重要）
1. **"App details"** タブに移動
2. **"Edit"** ボタンをクリック
3. **Callback URLs** に以下を追加：
   ```
   http://localhost:3000/api/auth/callback/twitter
   https://your-domain.com/api/auth/callback/twitter
   ```

### Website URL
- 本番環境のドメインを設定
- 開発時は `http://localhost:3000` でも可

## 📁 環境変数ファイル設定

### .env.local の作成
プロジェクトルートに `.env.local` ファイルを作成：

```bash
# Twitter API 設定
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here

# データベース設定（既存）
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### Vercel環境変数設定
本番環境（Vercel）では：

1. Vercelダッシュボードにアクセス
2. プロジェクト → **Settings** → **Environment Variables**
3. 上記4つの環境変数を追加

## ✅ 設定確認方法

### 1. API接続テスト
X投稿ページ（`/x-post`）にアクセスして：
- 右側のサイドバーで「API設定」状況を確認
- 黄色い警告が表示されていなければOK

### 2. 実際の投稿テスト
1. 簡単なテストメッセージを入力
2. 「ポスト」ボタンをクリック
3. 成功メッセージとTwitterリンクが表示されるか確認

## 🚨 よくあるエラーと解決方法

### 「認証に失敗しました」エラー
- **原因**: API KeyまたはAccess Tokenが間違っている
- **解決**: Twitter Developer Portalで値を再確認

### 「アクセスが拒否されました」エラー
- **原因**: アプリの権限が「Read and Write」になっていない
- **解決**: App permissions で「Read and Write」を選択

### 「同じ内容のツイートが既に投稿されています」エラー
- **原因**: Twitterの重複投稿防止機能
- **解決**: 異なる内容で投稿するか、時間をおいて再試行

### 「使用制限に達しました」エラー
- **原因**: APIのレート制限（15分間の投稿回数制限）
- **解決**: 15分待ってから再試行

## 📊 利用制限

### Basic プラン（無料）
- **投稿**: 月1,500ツイート
- **レート制限**: 15分間に最大300リクエスト
- **追加機能**: 基本的な投稿のみ

### Pro プラン（有料）
- **投稿**: 月300,000ツイート
- **レート制限**: より高い制限
- **追加機能**: 高度な分析、スケジュール投稿など

## 🔄 定期的なメンテナンス

### トークンの更新
- Access TokenとSecretは基本的に無期限
- セキュリティ上、定期的な再生成を推奨（3-6ヶ月ごと）

### 使用量監視
- [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) で使用量を定期確認
- 制限に近づいた場合はアラート設定

## 📞 サポート

設定で困った場合：
1. [Twitter Developer Documentation](https://developer.twitter.com/en/docs)
2. [Twitter Developer Community](https://twittercommunity.com/)
3. ToolPlusサポート（プロジェクト内Issue）

---

⚠️ **重要**: API KeyやTokenは絶対に公開リポジトリにコミットしないでください。`.env.local` は `.gitignore` に含まれていることを確認してください。