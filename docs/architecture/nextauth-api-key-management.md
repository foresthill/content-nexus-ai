# NextAuth認証システムとユーザーごとのAPIキー管理 - アーキテクチャ設計書

## 📋 概要

本ドキュメントは、Content Nexus AI（ToolPlus）におけるNextAuth v5を使用したユーザー認証システムと、セキュアなAPIキー管理機能の包括的なアーキテクチャ設計を定義します。

### 🎯 設計目標

1. **セキュリティ第一**: 業界標準の暗号化とベストプラクティスに基づく実装
2. **ユーザー体験**: シームレスな認証フローと直感的なAPIキー管理
3. **スケーラビリティ**: ユーザー数増加とサービス拡張に対応
4. **互換性**: 既存システムとの共存と段階的な移行

---

## 🏗️ システムアーキテクチャ

### レイヤー構成

```
┌─────────────────────────────────────────────────────┐
│              プレゼンテーション層                      │
│  - 認証UI (SignIn/SignUp)                           │
│  - APIキー管理UI (Settings/API Keys)                │
│  - 保護されたページ (Dashboard, Social, etc.)        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              アプリケーション層                        │
│  - NextAuth認証ロジック                              │
│  - APIキー管理サービス                               │
│  - 暗号化/復号化サービス                             │
│  - 認可ミドルウェア                                  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              データアクセス層                         │
│  - Prisma ORM                                      │
│  - User, Account, Session, ApiKey モデル           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              データベース層                           │
│  - PostgreSQL (Neon)                               │
│  - 暗号化されたAPIキー保存                           │
└─────────────────────────────────────────────────────┘
```

---

## 🗄️ データベーススキーマ設計

### 新規追加モデル

#### 1. Account（NextAuth OAuth連携用）

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String  // oauth, email, credentials
  provider          String  // google, github, credentials
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}
```

#### 2. Session（データベースセッション用、JWT使用時はオプション）

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

#### 3. VerificationToken（メール認証用）

```prisma
model VerificationToken {
  identifier String   // メールアドレス
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

#### 4. ApiKey（汎用APIキー管理）

```prisma
model ApiKey {
  id            String        @id @default(cuid())
  userId        String
  serviceType   ServiceType
  name          String        // ユーザー定義の識別名

  // 暗号化されたキー情報
  encryptedKey  String        @db.Text
  iv            String        // 初期化ベクトル（16バイト、hex）
  authTag       String        // 認証タグ（16バイト、hex）

  // メタデータ
  metadata      Json?         // サービス固有の追加情報
  lastUsedAt    DateTime?
  expiresAt     DateTime?
  isActive      Boolean       @default(true)

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, serviceType])
  @@index([userId, isActive])
}

enum ServiceType {
  DIFY
  N8N
  TWITTER_API
  INSTAGRAM_API
  TIKTOK_API
  OPENAI
  ANTHROPIC
  CUSTOM
}
```

### 既存Userモデルの拡張

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?   // Credentials認証用（オプション）
  name          String?
  image         String?   // 新規追加（プロフィール画像URL）
  emailVerified DateTime? // 新規追加（メール認証日時）
  role          UserRole  @default(USER)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]      // 新規追加
  sessions      Session[]      // 新規追加
  apiKeys       ApiKey[]       // 新規追加
  contents      Content[]
  socialPosts   SocialPost[]
  // ... 既存リレーション
}
```

---

## 🔐 セキュリティアーキテクチャ

### 暗号化方式：AES-256-GCM

#### 暗号化プロセス

```typescript
// EncryptionService.encrypt()
Input: plaintext (APIキー)
  ↓
1. ランダムIV生成（16バイト）
  ↓
2. AES-256-GCM暗号化
   - Key: env.ENCRYPTION_KEY (32バイト)
   - IV: ランダム生成
   - Plaintext: APIキー
  ↓
3. 認証タグ取得（16バイト）
  ↓
Output: {
  encrypted: string (hex),
  iv: string (hex),
  authTag: string (hex)
}
```

#### 復号化プロセス

```typescript
// EncryptionService.decrypt()
Input: { encrypted, iv, authTag }
  ↓
1. IVと認証タグの検証
  ↓
2. AES-256-GCM復号化
   - Key: env.ENCRYPTION_KEY
   - IV: DB保存値
   - Auth Tag: DB保存値
  ↓
3. 改ざんチェック（GCMの認証機能）
  ↓
Output: plaintext (APIキー) | Error
```

### 環境変数要件

```env
# NextAuth設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<ランダム32文字以上の文字列>

# 暗号化キー（32バイト = 64文字のhex）
ENCRYPTION_KEY=<openssl rand -hex 32で生成>

# OAuth プロバイダー
GOOGLE_CLIENT_ID=<GoogleコンソールからのID>
GOOGLE_CLIENT_SECRET=<Googleシークレット>
GITHUB_CLIENT_ID=<GitHubからのID>
GITHUB_CLIENT_SECRET=<GitHubシークレット>
```

### セキュリティベストプラクティス

1. **暗号化キー管理**
   - 環境変数で管理（コードにハードコーディングしない）
   - 定期的なローテーション（年1回推奨）
   - 古いキーでの復号化サポート（移行期間）

2. **アクセス制御**
   - ユーザーは自分のAPIキーのみアクセス可能
   - ADMIN権限での全ユーザーキー閲覧（監査用）
   - 監査ログへの全アクセス記録

3. **通信セキュリティ**
   - HTTPS必須（本番環境）
   - SameSite Cookie（CSRF対策）
   - HTTPOnly Cookie（XSS対策）

4. **レート制限**
   - APIキー操作: 10回/分/ユーザー
   - 接続テスト: 5回/分/ユーザー
   - ログイン試行: 5回/15分/IP

---

## 🔑 認証フロー設計

### NextAuth v5 プロバイダー構成

```typescript
// auth.config.ts
export const authConfig = {
  providers: [
    // 1. Credentials（メール/パスワード）
    Credentials({
      async authorize(credentials) {
        // User.email + password でDB検証
        // bcryptでパスワード照合
        return user | null
      }
    }),

    // 2. Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // 3. GitHub OAuth
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],

  // セッション戦略（JWT推奨）
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },

  // コールバック
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },

  // ページ設定
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
}
```

### 認証フローダイアグラム

```
[未認証ユーザー]
    ↓
[保護されたページアクセス]
    ↓
[middleware.ts: JWTチェック] → 未認証 → [/auth/signin へリダイレクト]
    ↓ 認証済み
[ページ表示]

[サインインページ]
    ↓
[プロバイダー選択]
    ├─ Credentials → メール/パスワード入力 → DB検証
    ├─ Google OAuth → Google認証画面 → コールバック
    └─ GitHub OAuth → GitHub認証画面 → コールバック
    ↓
[NextAuth セッション確立（JWT）]
    ↓
[ダッシュボードへリダイレクト]
```

---

## 🔌 API設計

### エンドポイント一覧

#### 認証API

| Method | Endpoint | 説明 | 認証 |
|--------|----------|------|------|
| POST | `/api/auth/[...nextauth]` | NextAuthハンドラー | - |
| POST | `/api/auth/register` | 新規ユーザー登録 | - |
| GET | `/api/auth/session` | セッション情報取得 | 不要 |

#### APIキー管理API

| Method | Endpoint | 説明 | 認証 |
|--------|----------|------|------|
| GET | `/api/user/api-keys` | APIキー一覧取得 | 必須 |
| POST | `/api/user/api-keys` | 新規APIキー登録 | 必須 |
| PUT | `/api/user/api-keys/[id]` | APIキー更新 | 必須 |
| DELETE | `/api/user/api-keys/[id]` | APIキー削除 | 必須 |
| POST | `/api/user/api-keys/[id]/test` | 接続テスト | 必須 |
| POST | `/api/user/api-keys/[id]/rotate` | キーローテーション | 必須 |

### APIレスポンス例

#### GET `/api/user/api-keys`

```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "serviceType": "DIFY",
      "name": "本番環境用Difyキー",
      "maskedKey": "●●●●●●●●●●●●1234",
      "lastUsedAt": "2025-10-20T10:30:00Z",
      "expiresAt": null,
      "isActive": true,
      "createdAt": "2025-10-01T09:00:00Z"
    }
  ]
}
```

#### POST `/api/user/api-keys`

Request:
```json
{
  "serviceType": "N8N",
  "name": "n8nワークフロー用",
  "apiKey": "n8n_api_key_abc123xyz789",
  "metadata": {
    "baseUrl": "https://my-n8n.example.com"
  },
  "expiresAt": "2026-10-20T00:00:00Z"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "clx9876543210",
    "message": "APIキーが正常に登録されました"
  }
}
```

#### POST `/api/user/api-keys/[id]/test`

Response:
```json
{
  "success": true,
  "data": {
    "connected": true,
    "message": "接続に成功しました",
    "details": {
      "appId": "app-xyz123",
      "appType": "workflow"
    }
  }
}
```

---

## 🎨 UI/UXコンポーネント設計

### ページ構成

#### 新規ページ

1. **`/auth/signin`** - サインインページ
   - メール/パスワードフォーム
   - Google/GitHubログインボタン
   - 新規登録リンク
   - パスワードリセットリンク

2. **`/auth/signup`** - サインアップページ
   - メール、パスワード、名前入力
   - パスワード強度インジケーター
   - 利用規約同意チェックボックス

3. **`/auth/error`** - 認証エラーページ
   - エラーメッセージ表示
   - 再試行リンク

4. **`/settings/api-keys`** - APIキー管理ページ
   - サービス別タブ
   - APIキー一覧
   - 新規登録フォーム

#### 既存ページの保護

```typescript
// middleware.ts
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/social/:path*',
    '/videos/:path*',
    '/settings/:path*',
    '/dify/:path*',
  ],
}
```

### コンポーネント構成

#### 認証関連コンポーネント

```
/components/auth/
  ├── SignInForm.tsx          # メール/パスワードログインフォーム
  ├── SignUpForm.tsx          # 新規登録フォーム
  ├── OAuthButtons.tsx        # ソーシャルログインボタン群
  ├── PasswordStrength.tsx    # パスワード強度表示
  └── ProtectedRoute.tsx      # 認証チェックラッパー
```

#### APIキー管理コンポーネント

```
/components/api-keys/
  ├── ApiKeyManager.tsx       # メインコンテナ（タブ切り替え）
  ├── ApiKeyList.tsx          # APIキー一覧表示
  ├── ApiKeyCard.tsx          # 個別APIキー表示カード
  ├── ApiKeyForm.tsx          # 登録/編集フォーム
  ├── ConnectionTest.tsx      # 接続テストボタン
  ├── ApiKeyRotate.tsx        # ローテーションダイアログ
  └── MaskedInput.tsx         # マスキング入力フィールド
```

### UIフロー例

#### APIキー登録フロー

```
[APIキー管理ページ]
    ↓
[「新規APIキー追加」ボタンクリック]
    ↓
[ApiKeyForm モーダル表示]
    ├─ サービス選択（Dify, n8n, etc.）
    ├─ 識別名入力
    ├─ APIキー入力（type="password"）
    └─ 有効期限設定（オプション）
    ↓
[「接続テスト」ボタン（オプション）]
    ↓ 成功
[「保存」ボタンクリック]
    ↓
[POST /api/user/api-keys]
    ↓
[暗号化 → DB保存]
    ↓
[モーダル閉じる → 一覧更新]
    ↓
[成功通知表示]
```

---

## 📦 状態管理設計

### Zustand Store: `apiKeyStore`

```typescript
// /src/store/apiKeyStore.ts
interface ApiKeyStore {
  // 状態
  keys: ApiKey[]
  isLoading: boolean
  error: string | null

  // アクション
  fetchKeys: () => Promise<void>
  addKey: (data: CreateApiKeyData) => Promise<void>
  updateKey: (id: string, data: UpdateApiKeyData) => Promise<void>
  deleteKey: (id: string) => Promise<void>
  testConnection: (id: string) => Promise<TestResult>
  rotateKey: (id: string) => Promise<void>

  // ヘルパー
  getKeysByService: (serviceType: ServiceType) => ApiKey[]
  reset: () => void
}
```

### NextAuth Session管理

```typescript
// useSessionフック使用例
import { useSession } from 'next-auth/react'

function ProtectedComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <Spinner />
  if (status === 'unauthenticated') redirect('/auth/signin')

  return (
    <div>
      <p>ようこそ、{session.user.name}さん</p>
      <p>ロール: {session.user.role}</p>
    </div>
  )
}
```

---

## 🔄 既存システムとの統合

### 段階的移行戦略

#### Phase 1: 並行運用期間

- 既存の `DifyConfig` と `SocialAccount` モデルは保持
- 新規 `ApiKey` モデルを優先的に使用
- 両方のデータソースをチェックするハイブリッド実装

```typescript
// サービス取得例
async function getDifyApiKey(userId: string): Promise<string> {
  // 1. 新しいApiKeyテーブルをチェック
  const apiKey = await prisma.apiKey.findFirst({
    where: { userId, serviceType: 'DIFY', isActive: true }
  })

  if (apiKey) {
    return encryptionService.decrypt({
      encrypted: apiKey.encryptedKey,
      iv: apiKey.iv,
      authTag: apiKey.authTag,
    })
  }

  // 2. フォールバック: 既存のDifyConfigをチェック
  const difyConfig = await prisma.difyConfig.findUnique({
    where: { userId }
  })

  if (difyConfig) {
    return difyConfig.apiKey // 平文（要暗号化移行）
  }

  throw new Error('Dify APIキーが見つかりません')
}
```

#### Phase 2: データ移行

```typescript
// 移行スクリプト例
async function migrateDifyConfigToApiKey() {
  const configs = await prisma.difyConfig.findMany()

  for (const config of configs) {
    const encrypted = encryptionService.encrypt(config.apiKey)

    await prisma.apiKey.create({
      data: {
        userId: config.userId,
        serviceType: 'DIFY',
        name: 'Dify API（移行済み）',
        encryptedKey: encrypted.encrypted,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        metadata: {
          baseUrl: config.baseUrl,
          appId: config.appId,
        },
        isActive: config.isActive,
      }
    })
  }
}
```

#### Phase 3: 完全移行

- 既存テーブルのDEPRECATED化
- 新APIキーシステムへの完全移行
- 旧テーブルの削除（十分な移行期間後）

---

## 🚀 実装フェーズ

### Phase 1: 基盤構築（Week 1-2）

**優先度: 🔴 CRITICAL**

- [ ] Prismaスキーマ拡張
  - Account, Session, VerificationToken モデル追加
  - ApiKey モデル追加
  - User モデル拡張（emailVerified, image）
- [ ] マイグレーション実行
- [ ] 暗号化サービス実装（EncryptionService）
- [ ] NextAuth基本設定
  - Credentials プロバイダー
  - Google OAuth プロバイダー
- [ ] 環境変数設定

### Phase 2: 認証UI実装（Week 3-4）

**優先度: 🟡 HIGH**

- [ ] サインインページ（/auth/signin）
- [ ] サインアップページ（/auth/signup）
- [ ] エラーページ（/auth/error）
- [ ] ミドルウェアでページ保護
- [ ] セッション管理コンポーネント
- [ ] ロールベースアクセス制御

### Phase 3: APIキー管理実装（Week 5-6）

**優先度: 🟡 HIGH**

- [ ] APIキー管理API実装
  - GET /api/user/api-keys
  - POST /api/user/api-keys
  - PUT /api/user/api-keys/[id]
  - DELETE /api/user/api-keys/[id]
  - POST /api/user/api-keys/[id]/test
- [ ] Zustand apiKeyStore 実装
- [ ] APIキー管理UIコンポーネント
  - ApiKeyManager
  - ApiKeyForm
  - ApiKeyList
  - ApiKeyCard
- [ ] 接続テスト機能

### Phase 4: 統合とテスト（Week 7-8）

**優先度: 🟢 MEDIUM**

- [ ] 既存機能との統合
  - Dify連携の更新
  - n8n連携の更新
  - SNS連携の更新
- [ ] データ移行スクリプト
- [ ] E2Eテスト作成
- [ ] セキュリティ監査
- [ ] ドキュメント完成

---

## 📊 非機能要件

### パフォーマンス

- ログイン応答時間: < 500ms
- APIキー暗号化/復号化: < 50ms
- APIキー一覧取得: < 200ms（100件まで）
- データベースクエリ最適化: インデックス活用

### セキュリティ

- 暗号化アルゴリズム: AES-256-GCM
- パスワードハッシュ: bcrypt（ソルトラウンド10）
- セッション有効期間: 30日（自動延長）
- HTTPS必須（本番環境）
- CSRF対策: SameSite Cookie
- XSS対策: HTTPOnly Cookie

### 可用性

- アップタイム目標: 99.9%
- データベース冗長化（Neon自動）
- エラー時の適切なフォールバック
- 監査ログによるトレーサビリティ

### スケーラビリティ

- 想定ユーザー数: 10,000ユーザー
- ユーザーあたりAPIキー数: 最大20件
- データベースインデックス最適化
- 将来的なキャッシュ層導入の考慮

---

## 🔍 監視と監査

### 監査ログ記録対象

- ユーザー登録/ログイン/ログアウト
- APIキー作成/更新/削除
- APIキーアクセス（復号化時）
- 接続テスト実行
- 認証失敗試行

### ログフォーマット

```typescript
interface AuditLog {
  userId: string
  action: 'LOGIN' | 'LOGOUT' | 'API_KEY_CREATE' | 'API_KEY_ACCESS' | ...
  entityType: 'User' | 'ApiKey' | ...
  entityId: string
  changes?: Json
  ipAddress?: string
  userAgent?: string
  timestamp: DateTime
}
```

---

## 🎯 成功指標

### KPI

- ユーザー登録完了率: > 80%
- ログイン成功率: > 95%
- APIキー接続テスト成功率: > 90%
- 認証関連エラー率: < 1%
- セキュリティインシデント: 0件

### ユーザーフィードバック

- 認証フローの使いやすさ: 4.5/5.0以上
- APIキー管理の満足度: 4.0/5.0以上
- セキュリティへの信頼感: 4.5/5.0以上

---

## 📚 参考資料

### 公式ドキュメント

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)

### セキュリティ標準

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)

---

## 📝 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2025-10-20 | 1.0.0 | 初版作成 |

---

## 👥 承認

| 役割 | 氏名 | 承認日 |
|------|------|--------|
| アーキテクト | - | - |
| セキュリティレビュアー | - | - |
| プロダクトオーナー | - | - |

---

**Document End**
