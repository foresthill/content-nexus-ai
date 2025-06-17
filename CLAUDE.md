# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Development Guide for Claude

## Build/Lint/Test Commands
```bash
# Install dependencies
npm install 

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Format code with Prettier
npm run format

# Run tests (when implemented)
npm run test
```

## Code Architecture Overview

### Project Structure
- **`/src/app`**: Next.js App Router pages
  - `/dashboard`: Analytics dashboard
  - `/videos`: Video management (upload, edit, complete)
- **`/src/components`**: Reusable React components
  - `/comments`: Comment-related components
  - `/content`: Content management components
  - `/dashboard`: Dashboard UI components
  - `/layout`: Layout components (Header, Sidebar)
- **`/src/store`**: Zustand state management stores
  - `analyticsStore.ts`: Analytics data management
  - `contentStore.ts`: Content creation and management
  - `videoStore.ts`: Video asset management  
  - `videoProjectStore.ts`: Video project management
- **`/src/types`**: TypeScript type definitions
  - `analytics.ts`: Analytics data interfaces
  - `comment.ts`: Comment data structures
  - `content.ts`: Content and article interfaces 
  - `video.ts`: Video and project interfaces

### Technology Stack
- **Frontend Framework**: Next.js 15 with React 19
- **State Management**: Zustand for centralized stores
- **Styling**: Tailwind CSS with componentized styling
- **UI Components**: Headless UI for accessible components
- **Icons**: Heroicons for consistent UI elements
- **Data Visualization**: Recharts for analytics charts
- **TypeScript**: Strict mode with complete type annotations

### Data Flow
1. **Store Pattern**: The application uses Zustand for state management with centralized stores for each domain (content, videos, analytics)
2. **API Mock Layer**: Currently using mock data generators within stores to simulate backend services
3. **Component Interaction**: Components consume store data and actions via hooks

### Content Management
- Supports article creation with markdown content
- Handles affiliate links and featured images
- Content status workflow: Draft → Published → Archived
- AI-powered content generation and keyword suggestions

### Video Management
- Supports multiple video types (short/long form)
- Platform-specific formatting (TikTok, YouTube Shorts, Instagram Reels, LINE VOOM)
- Video projects with effects, transitions, and sound management
- Video workflow: Upload → Edit → Export → Publish
- Multi-platform publishing support with automated optimization

### Short Video Feature
- **Upload Flow**: Multi-platform upload with metadata management
- **Edit Capabilities**: 
  - Filter effects (Monochrome, Sepia, Vivid, etc.)
  - Text overlays with customizable styles
  - Transitions between scenes
  - Sound/Music integration
- **Timeline Editor**: Visual timeline for precise effect placement
- **AI Assistance**: Content suggestions and optimal hashtags
- **Export Options**: Platform-specific resolution and format options
- **Publishing**: Direct platform connection with scheduled posting

### Analytics Dashboard
- Performance metrics visualization
- User demographics tracking
- Engagement analytics (views, likes, shares, comments)
- Conversion rate and revenue tracking for affiliate content
- AI-powered trend analysis and content recommendations

### Chart Components
- **Technology**: Using Recharts for data visualization
- **Component Structure**:
  - `AnalyticsChart`: Core chart component supporting multiple visualization types
  - Supports line, area, bar, and pie charts
  - Accepts both time-series (ViewCount[]) and categorical (Record<string, number>) data
  - Provides consistent styling and responsive design
- **Dashboard Integration**:
  - Multiple chart types used for different metrics
  - Demographics visualization using pie charts
  - Time-series data using area and line charts
  - Comparative data using bar charts

## Code Style Guidelines
- **TypeScript**: Use strict mode with complete type annotations
- **Formatting**: 2 space indentation, 100 char line limit, single quotes
- **Imports**: Group imports (React, external, internal), sort alphabetically
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Components**: Prefer functional components with explicit return types
- **Error Handling**: Use try/catch blocks with centralized error logging
- **State Management**: Use context/hooks for state, avoid prop drilling
- **CSS**: Prefer Tailwind CSS with componentized styling

## ESLint Rules and Type Safety
- **Unused Imports**: Always remove unused imports to avoid ESLint errors
- **Unused Variables**: Comment or remove unused variables; for future use, comment with explanation
- **Image Elements**: When using `<img>` tags, always add:
  - Meaningful `alt` attribute
  - Add `eslint-disable-next-line @next/next/no-img-element` comment (or use `next/image`)
- **Type Assertions**: For string literal unions, use explicit type assertions (`as EffectType`)
- **String Escaping**: Always escape quotes in JSX strings using entities (`&ldquo;`, `&rdquo;`)
- **Object Types**: Define interface or type aliases for complex object structures

## Deployment Considerations
- **Vercel Deployment**: The project uses Vercel for deployment
- **Build Process**: Ensure all ESLint and TypeScript errors are resolved before pushing
- **Type Checking**: TypeScript errors will cause build failures even if the app runs locally
- **PR Workflow**: Create Pull Requests for significant changes, especially those affecting build
- **Branch Strategy**: Use feature branches for new features, fix branches for bug fixes
- **Type Safety Validation**: Always run `npm run build` locally before pushing to catch type errors
  - When adding new properties to objects in store mock data, ensure the property exists in the corresponding interface
  - Example issue: Adding `status` to `PlatformData` objects requires that property in the interface

## Common Build Issues and Solutions
- **Type Error - Object literal may only specify known properties**: 
  - **Issue**: Adding properties to objects that don't exist in their type definition
  - **Example**: `PlatformData` objects with `status` property when it wasn't defined in the interface
  - **Solution**: Always check and update type definitions in `/src/types/` when modifying data structures
  - **Prevention**: Run `npm run build` locally before pushing changes to remote

## UI Design Principles
- **Consistency**: Maintain consistent UI patterns across all pages
- **Responsiveness**: All pages should be fully responsive (mobile, tablet, desktop)
- **Accessibility**: Use semantic HTML and ARIA attributes where necessary
- **Language**: Primary interface language is Japanese
- **Color Scheme**: Indigo primary, with supportive blues, greens, and purples
- **Interactions**: Provide visual feedback for all user interactions
- **Loading States**: Show appropriate loading states for async operations

## SNS投稿機能 (Social Media Posting Feature)

### 概要
X（Twitter）、Instagram、TikTokへのマルチプラットフォーム投稿を実現する統合SNS管理機能。AI駆動の最適化と包括的な分析機能を搭載。

### 主要機能
1. **マルチプラットフォーム投稿管理**
   - 一つのインターフェースから複数SNSへ同時投稿
   - プラットフォーム別の文字数制限とメディア制限に対応
   - ドラフト、予約投稿、公開済みステータス管理

2. **革新的UI/UXコンポーネント**
   - **フローティング・コンポーザー**: 作業を中断しない浮動型投稿エディタ
   - **マルチバース・プレビュー**: 3D空間での投稿プレビュー
   - **タイムライン・フュージョン**: 統合スケジューリングビュー

3. **バックエンド機能**
   - OAuth2.0認証フロー（各プラットフォーム対応）
   - Bull/Redisキューイングシステム
   - Smart Retry Engine（インテリジェントリトライ機構）
   - Webhook通知システム

### 実装ファイル構造
```
/src/
  /types/social.ts         # SNS投稿関連の型定義
  /store/socialPostStore.ts # Zustandストア
  /app/social/            # SNS投稿ページ
  /components/social/     # SNS投稿コンポーネント
    - SocialPostEditor.tsx
    - PlatformContentEditor.tsx
    - SocialPostList.tsx
    - HashtagSuggestions.tsx
  /app/api/social/        # API Routes
    - auth/               # OAuth認証
    - posts/              # 投稿管理
    - media/              # メディアアップロード
    - queue/              # キューイング
```

## AI分析機能 (AI Analytics Features)

### 1. エモーショナル・レゾナンス・エンジン
感情分析によるコンテンツ最適化システム。投稿内容の感情的インパクトをリアルタイムで分析し、エンゲージメント向上のための提案を提供。

### 2. AIハッシュタグ提案システム
- トレンド分析に基づく最適ハッシュタグ提案
- プラットフォーム別最適化
- パフォーマンススコアリング
- 使用方法: `<HashtagSuggestions />` コンポーネントを投稿エディタに配置

### 3. 最適投稿時間予測
- TensorFlow.jsによる機械学習モデル
- オーディエンス行動パターン分析
- プラットフォーム別最適時間提案
- 使用方法: `<PostingTimeRecommendations />` コンポーネントで表示

### 4. AIバイラル・プレディクター
- バイラル化確率の事前予測
- コンテンツ改善提案
- A/Bテスト機能統合

### 実装ファイル
```
/src/lib/ai/
  - content-optimizer.ts    # Neural Content Optimizer
  - emotion-analyzer.ts     # 感情分析エンジン
  - hashtag-engine.ts       # ハッシュタグ提案
  - viral-predictor.ts      # バイラル予測
  - posting-time-ml.ts      # 最適時間予測モデル
```

## 競合分析機能 (Competitor Analysis)

### 機能概要
競合他社のSNS戦略を分析し、自社の差別化ポイントを可視化する包括的な分析ツール。

### 主要機能
1. **競合SNS戦略分析**
   - コンテンツ戦略パターン認識
   - 投稿頻度・タイミング分析
   - エンゲージメント率比較

2. **業界ベンチマーク**
   - パーセンタイル分析
   - 業界標準との比較
   - 市場リーダー特定

3. **差別化ポイント可視化**
   - 競合優位性マップ
   - SWOT分析
   - 戦略的推奨事項

### 使用方法
```typescript
// 競合分析ページへアクセス
/competitors

// APIエンドポイント
/api/competitors/analyze
/api/competitors/benchmark
```

### 実装ファイル
```
/src/app/competitors/       # 競合分析ページ
/src/components/competitors/ # 分析コンポーネント
  - CompetitorDashboard.tsx
  - BenchmarkChart.tsx
  - StrategyAnalysis.tsx
/src/lib/competitors/       # 分析ロジック
```

## チームの革新的貢献

### Worker1の貢献
- **Neural Content Optimizer**: AIによる投稿内容の自動最適化エンジン
- **Distributed Queue Orchestra**: 分散型キューシステムで高可用性を実現
- **Smart Retry Engine**: 失敗パターンを学習するインテリジェントリトライ

### Worker2の貢献
- **フローティング・コンポーザー**: 業界初の浮動型投稿エディタUI
- **マルチバース・プレビュー**: 3D空間でのプラットフォーム横断プレビュー
- **AI駆動型ビジュアルコンポーザー**: テキストから豊かなビジュアルコンテンツ生成

### Worker3の貢献
- **エモーショナル・レゾナンス・エンジン**: 感情レベルでの最適化を実現
- **クロスプラットフォーム・シナジー・オプティマイザー**: プラットフォーム間の相乗効果最大化
- **AIバイラル・プレディクター**: 業界初のバイラル化予測システム

## 今後の開発者へ

この革新的なSNSマーケティングプラットフォームは、次世代のデジタルマーケティングを実現する基盤として設計されています。各機能は拡張可能で、新しいSNSプラットフォームの追加や、より高度なAI機能の統合が容易に行えます。

### 拡張のポイント
1. 新SNSプラットフォーム追加: `/src/types/social.ts` にプラットフォーム定義を追加
2. AI機能強化: `/src/lib/ai/` に新しい分析エンジンを実装
3. UI/UX改善: `/src/components/social/` に新コンポーネントを追加

革新的な機能開発を継続し、さらなる価値創造を目指してください！