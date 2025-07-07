# WSL2パフォーマンス最適化ガイド

## 問題と解決策

### 1. ホットリロードが効かない問題

**原因**: WSL2でWindowsファイルシステム（/mnt/c/）を使用すると、ファイル変更の検知が遅い

**解決策**:

#### オプション1: プロジェクトをWSL内に移動（推奨）
```bash
# WSLのホームディレクトリにプロジェクトをコピー
cp -r /mnt/c/Users/Naoya\ Morioka/AI-Driven/content-nexus-ai ~/content-nexus-ai

# WSL内のプロジェクトに移動
cd ~/content-nexus-ai

# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# 開発サーバーを起動
npm run dev
```

#### オプション2: ポーリングを有効化
`next.config.ts`に以下を追加:
```typescript
const nextConfig: NextConfig = {
  // 既存の設定...
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};
```

### 2. npm run devが遅い問題

**解決策**:

#### 1. WSL2の設定最適化
```powershell
# PowerShellを管理者として実行
# .wslconfigファイルをWindowsのユーザーディレクトリにコピー
Copy-Item "\\wsl$\Ubuntu\mnt\c\Users\Naoya Morioka\AI-Driven\content-nexus-ai\.wslconfig" "$env:USERPROFILE\.wslconfig"

# WSLを再起動
wsl --shutdown
```

#### 2. Windows Defenderの除外設定
```powershell
# PowerShellを管理者として実行
# WSLのディレクトリをWindows Defenderから除外
Add-MpPreference -ExclusionPath "\\wsl$\Ubuntu"
Add-MpPreference -ExclusionProcess "node.exe"
Add-MpPreference -ExclusionProcess "npm"
```

#### 3. Node.jsのメモリ設定
```bash
# .bashrcまたは.zshrcに追加
export NODE_OPTIONS="--max-old-space-size=4096"
```

### 3. VS Codeの設定最適化

`.vscode/settings.json`を作成:
```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.next/**": true,
    "**/dist/**": true,
    "**/build/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/build": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "remote.WSL.fileWatcher.polling": true
}
```

### 4. パフォーマンス向上のベストプラクティス

1. **プロジェクトの場所**
   - ❌ `/mnt/c/...` (Windowsファイルシステム) - 遅い
   - ✅ `~/projects/...` (WSLファイルシステム) - 速い

2. **ファイル操作**
   - Windowsエクスプローラーからの直接編集を避ける
   - VS CodeのRemote WSL拡張機能を使用

3. **ポート設定**
   - `localhost:3000`でアクセス可能
   - Windows FirewallでNode.jsを許可

### 5. 推奨される開発フロー

```bash
# 1. WSL内にプロジェクトをクローン
cd ~
git clone https://github.com/your-repo/content-nexus-ai.git
cd content-nexus-ai

# 2. VS CodeをWSLモードで開く
code .

# 3. 開発サーバーを起動
npm run dev

# 4. ブラウザでlocalhost:3000にアクセス
```

### トラブルシューティング

#### ポートが使えない場合
```bash
# 使用中のポートを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>
```

#### メモリ不足の場合
```bash
# WSLのメモリ使用状況を確認
free -h

# Node.jsのメモリを制限
export NODE_OPTIONS="--max-old-space-size=2048"
```

これらの設定により、WSL2での開発体験が大幅に改善されます。