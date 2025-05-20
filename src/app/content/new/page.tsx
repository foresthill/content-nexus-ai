'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useContentStore from '@/store/contentStore';
import { ContentStatus } from '@/types/content';

// 記事タイプの定義
type ArticleType = 'howto' | 'review' | 'guide' | 'list' | 'opinion' | 'news';

// 記事タイプの情報
const articleTypes: Record<ArticleType, { label: string; description: string; icon: React.ReactNode }> = {
  howto: {
    label: 'ハウツー記事',
    description: '読者に特定のタスクの実行方法を教える記事',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    )
  },
  review: {
    label: 'レビュー記事',
    description: '製品やサービスの評価・比較レビュー',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    )
  },
  guide: {
    label: '完全ガイド',
    description: 'トピックに関する包括的なガイド記事',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    )
  },
  list: {
    label: 'リスト記事',
    description: 'アイテム・アイデアなどのリスト形式の記事',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    )
  },
  opinion: {
    label: '意見・論説記事',
    description: 'トピックに関する見解や意見を述べる記事',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    )
  },
  news: {
    label: 'ニュース・トレンド記事',
    description: '最新の情報やトレンドを伝える記事',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
      </svg>
    )
  }
};

// 文字数レベルの定義
type ContentLength = 'short' | 'medium' | 'long';

// 文字数レベルの情報
const contentLengths: Record<ContentLength, { label: string; description: string; wordCount: string }> = {
  short: {
    label: '基本 (800-1,200文字)',
    description: '短めの基本的なコンテンツ',
    wordCount: '800-1,200文字'
  },
  medium: {
    label: '標準 (1,500-2,500文字)',
    description: '標準的な長さのコンテンツ',
    wordCount: '1,500-2,500文字'
  },
  long: {
    label: '詳細 (3,000文字以上)',
    description: '詳細な長文コンテンツ',
    wordCount: '3,000文字以上'
  }
};

// モックの投稿プラットフォーム
const publishPlatforms = [
  { id: 'wordpress', name: 'WordPress', icon: '🌐' },
  { id: 'twitter', name: 'X (旧Twitter)', icon: '✖' },
  { id: 'facebook', name: 'Facebook', icon: '👍' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'note', name: 'note', icon: '📝' },
];

export default function NewContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createContent } = useContentStore();
  
  // フォーム状態
  const [title, setTitle] = useState('');
  const [keyword, setKeyword] = useState('');
  const [description, setDescription] = useState('');
  const [articleType, setArticleType] = useState<ArticleType>('howto');
  const [contentLength, setContentLength] = useState<ContentLength>('medium');
  const [category, setCategory] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeLinks, setIncludeLinks] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['wordpress']);
  
  // 生成状態
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // URLパラメータからキーワードを取得
  useEffect(() => {
    const keywordParam = searchParams.get('keyword');
    if (keywordParam) {
      setKeyword(keywordParam);
      
      // 自動的にタイトル候補を生成
      if (!title) {
        const titleSuggestions = [
          `初心者向け ${keywordParam} 完全ガイド: 始め方から活用法まで`,
          `【2025年版】${keywordParam} の基本と応用: 最新トレンドを解説`,
          `${keywordParam} とは？メリットとデメリットを徹底解説`,
          `【保存版】${keywordParam} 活用法: 成功するための7つのポイント`,
          `知っておくべき${keywordParam}の全て: 専門家が解説するポイント`
        ];
        
        setTitle(titleSuggestions[Math.floor(Math.random() * titleSuggestions.length)]);
      }
      
      // キーワードからタグを自動生成
      if (tags.length === 0) {
        const baseTags = ['初心者向け', '使い方', 'ポイント', 'ノウハウ', 'コツ', '方法'];
        setTags([...new Set([keywordParam, ...baseTags.slice(0, 3)])]);
      }
    }
  }, [searchParams, title, tags.length]);
  
  // カテゴリー追加処理
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!category.includes(value) && value !== '') {
      setCategory([...category, value]);
      e.target.value = ''; // 選択をリセット
    }
  };
  
  // カテゴリー削除処理
  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategory(category.filter(cat => cat !== categoryToRemove));
  };
  
  // タグ追加処理
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // タグ削除処理
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // 投稿プラットフォーム選択処理
  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(id => id !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };
  
  // コンテンツ生成処理
  const generateContent = () => {
    if (!title || !keyword) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // 生成進行状況のシミュレーション
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // モック生成コンテンツ
          const generatedText = `
# ${title}

## はじめに

${keyword}は現代のデジタル環境において非常に重要な役割を果たしています。本記事では、${keyword}の基本概念から実践的な活用方法まで、詳しく解説していきます。

## ${keyword}とは

${keyword}とは、テクノロジーとビジネスの交差点にある革新的なアプローチです。多くの企業や個人が${keyword}を活用して、業務効率の向上やコスト削減を実現しています。

${contentLength === 'long' ? `
### ${keyword}の歴史

${keyword}の概念自体は新しいものではありません。過去10年間で急速に発展し、現在の形になりました。初期の頃は単純な機能しか持っていませんでしたが、技術の進化と共に機能が拡張されてきました。

### ${keyword}の基本原理

${keyword}の基本原理は非常にシンプルです。ユーザーのニーズを理解し、最適な解決策を提供することを中心に設計されています。この原理を理解することで、${keyword}の真の価値が見えてきます。
` : ''}

## ${keyword}の主なメリット

${keyword}を活用することで、以下のようなメリットが得られます：

1. **効率性の向上**: 従来の方法と比較して、作業効率が30%以上向上します。
2. **コスト削減**: 長期的に見ると、運用コストが大幅に削減されます。
3. **品質の向上**: 一貫したクオリティを維持することが可能になります。
4. **スケーラビリティ**: ビジネスの成長に合わせて柔軟に拡張できます。
5. **競争優位性**: 市場での差別化要因となり、競争力が向上します。

${articleType === 'howto' ? `
## ${keyword}の始め方

${keyword}を始めるのは意外と簡単です。以下のステップに従って進めてみましょう：

### ステップ1: 目標を設定する

まず最初に、${keyword}を通じて何を達成したいのかを明確にしましょう。具体的で測定可能な目標を設定することが重要です。

### ステップ2: 適切なツールを選ぶ

目標に合わせて、最適なツールやプラットフォームを選択します。市場には様々なオプションがありますので、自分のニーズに合ったものを選びましょう。

### ステップ3: 基本的な使い方を学ぶ

選んだツールの基本的な使い方をマスターしましょう。多くのツールでは、初心者向けのチュートリアルや資料が提供されています。

### ステップ4: 実践してみる

実際に小規模なプロジェクトで${keyword}を試してみましょう。実践を通じて学ぶことが最も効果的です。

### ステップ5: 結果を分析し改善する

実践した結果を分析し、改善点を見つけましょう。このサイクルを繰り返すことで、スキルが向上していきます。
` : articleType === 'review' ? `
## ${keyword}ツールの比較

市場には様々な${keyword}ツールが存在します。ここでは主要なツールを比較してみましょう：

### ツールA

**価格**: ¥10,000/月
**特徴**: 高度な分析機能、カスタマイズ性の高さ
**メリット**: 大規模プロジェクトに最適、詳細なレポート機能
**デメリット**: 初心者には複雑、高コスト

評価: ★★★★☆ (4/5)

### ツールB

**価格**: ¥5,000/月
**特徴**: 使いやすいインターフェース、テンプレートが豊富
**メリット**: 初心者でも使いやすい、セットアップが簡単
**デメリット**: 高度な分析機能が限定的

評価: ★★★★★ (5/5)

### ツールC

**価格**: ¥3,000/月
**特徴**: 基本機能に特化、シンプルさを重視
**メリット**: コストパフォーマンスが良い、学習コストが低い
**デメリット**: 機能が限定的、拡張性に欠ける

評価: ★★★☆☆ (3/5)
` : articleType === 'list' ? `
## ${keyword}成功のための7つのポイント

${keyword}で成功するために押さえておくべきポイントを7つ紹介します：

### 1. 明確な戦略を立てる

${keyword}を活用する際には、明確な戦略が不可欠です。何を達成したいのか、どのように測定するのかを事前に決めておきましょう。

### 2. 継続的な学習を心がける

${keyword}の世界は常に進化しています。最新のトレンドや技術を学び続けることが重要です。

### 3. 適切なツールを選択する

自分のニーズに合ったツールを選ぶことが成功への近道です。使いやすさ、機能性、コストのバランスを考慮しましょう。

### 4. データを活用する

${keyword}の効果を最大化するには、データに基づいた意思決定が重要です。定期的にデータを分析し、改善に活かしましょう。

### 5. 専門家のアドバイスを求める

わからないことがあれば、遠慮なく専門家のアドバイスを求めましょう。コミュニティやフォーラムも良い情報源になります。

### 6. 小さく始めて徐々に拡大する

いきなり大規模なプロジェクトに取り組むのではなく、小さな成功を積み重ねていく方が効果的です。

### 7. 失敗を恐れない

${keyword}における失敗は学びの機会です。失敗を恐れずに新しいことにチャレンジしましょう。
` : ''}

${contentLength === 'long' ? `
## ${keyword}の応用例

${keyword}は様々な分野で応用されています。以下にいくつかの代表的な例を紹介します：

### ビジネス分野での応用

ビジネスにおいては、${keyword}を活用して顧客体験の向上やプロセスの最適化が行われています。特に、顧客データの分析や自動化による業務効率化が注目されています。

### 教育分野での応用

教育現場では、${keyword}を活用したパーソナライズされた学習体験の提供が進んでいます。学生一人ひとりのペースや理解度に合わせた教材の提供が可能になっています。

### 医療分野での応用

医療分野では、診断支援や治療計画の最適化に${keyword}が活用されています。患者データの分析により、より精度の高い治療が可能になっています。

### エンターテイメント分野での応用

エンターテイメント業界では、コンテンツのレコメンデーションやユーザー体験の向上に${keyword}が使われています。視聴者の好みを分析し、最適なコンテンツを提案するシステムが一般的になっています。
` : ''}

## ${keyword}導入時の注意点

${keyword}を導入する際には、以下の点に注意が必要です：

1. **目的の明確化**: 何のために${keyword}を導入するのかを明確にしましょう。
2. **適切なリソース配分**: 必要なリソース（人材、時間、予算）を適切に配分しましょう。
3. **段階的な導入**: 一度にすべてを変えるのではなく、段階的に導入することをおすすめします。
4. **トレーニングの実施**: 関係者全員が適切にツールを使えるよう、トレーニングを実施しましょう。
5. **定期的な評価**: 定期的に成果を評価し、必要に応じて戦略を調整しましょう。

## まとめ

${keyword}は、適切に活用することで大きな価値を生み出すことができます。本記事で紹介した基本知識と実践的なアドバイスを参考に、ぜひ${keyword}の導入・活用を検討してみてください。正しいアプローチとツールを選択することで、ビジネスの成長や個人のスキルアップに大きく貢献するでしょう。

${includeLinks ? `
## 参考リンク

- [${keyword}の公式ガイド](https://example.com/guide)
- [初心者向け${keyword}チュートリアル](https://example.com/tutorial)
- [${keyword}の最新トレンド2025](https://example.com/trends)
- [${keyword}コミュニティフォーラム](https://example.com/forum)
- [${keyword}事例集：成功企業の秘訣](https://example.com/casestudies)
` : ''}
`;
          
          setGeneratedContent(generatedText);
          setIsGenerating(false);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 300);
  };
  
  // コンテンツ保存処理
  const saveContent = async () => {
    if (!title || !generatedContent) return;
    
    setIsSaving(true);
    
    try {
      // 新規コンテンツの作成
      const newContent = {
        title,
        description: description || `${keyword}に関する記事です。`,
        content: generatedContent,
        author: 'AI Content Writer', // ユーザー名は実際のシステムから取得する
        category,
        tags,
        status: ContentStatus.DRAFT,
        affiliateLinks: [],
      };
      
      const createdContent = await createContent(newContent);
      
      // 保存成功後に詳細ページへリダイレクト
      router.push(`/content/${createdContent.id}`);
    } catch (error) {
      console.error('コンテンツの保存に失敗しました', error);
      setIsSaving(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">コンテンツ自動生成</h1>
          <p className="text-gray-600 mt-1">
            AIが高品質な記事を瞬時に生成します
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            href="/content" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            コンテンツ一覧へ戻る
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側フォーム */}
        <div className="lg:col-span-1 space-y-6">
          {/* 基本情報フォーム */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">基本情報</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="記事のタイトルを入力"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                  メインキーワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="メインキーワードを入力"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  記事の説明（メタディスクリプション）
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="記事の簡単な説明を入力"
                />
              </div>
            </div>
          </div>
          
          {/* 記事タイプ選択 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">記事タイプ</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {(Object.entries(articleTypes) as [ArticleType, typeof articleTypes[ArticleType]][]).map(([type, info]) => (
                <div
                  key={type}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    articleType === type
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setArticleType(type)}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                      articleType === type ? 'bg-indigo-600 text-white' : 'border border-gray-300'
                    }`}>
                      {articleType === type && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{info.label}</span>
                  </div>
                  <div className="flex items-center text-gray-500 ml-8">
                    <span className="text-xs">{info.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 文字数設定 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">文字数設定</h2>
            
            <div className="space-y-4">
              {(Object.entries(contentLengths) as [ContentLength, typeof contentLengths[ContentLength]][]).map(([length, info]) => (
                <div
                  key={length}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    contentLength === length
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setContentLength(length)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                      contentLength === length ? 'bg-indigo-600 text-white' : 'border border-gray-300'
                    }`}>
                      {contentLength === length && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{info.label}</span>
                      <div className="text-xs text-gray-500 mt-1">{info.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 中央フォーム */}
        <div className="lg:col-span-1 space-y-6">
          {/* カテゴリとタグ */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">カテゴリとタグ</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ
                </label>
                <select
                  id="category"
                  onChange={handleCategoryChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>カテゴリを選択</option>
                  <option value="マーケティング">マーケティング</option>
                  <option value="SEO">SEO</option>
                  <option value="コンテンツ戦略">コンテンツ戦略</option>
                  <option value="SNS活用">SNS活用</option>
                  <option value="ブログ運営">ブログ運営</option>
                  <option value="アフィリエイト">アフィリエイト</option>
                  <option value="デジタルマーケティング">デジタルマーケティング</option>
                  <option value="動画マーケティング">動画マーケティング</option>
                  <option value="メールマーケティング">メールマーケティング</option>
                  <option value="Webライティング">Webライティング</option>
                  <option value="Web集客">Web集客</option>
                </select>
                
                {category.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {category.map((cat) => (
                      <span key={cat} className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800">
                        {cat}
                        <button
                          type="button"
                          className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:bg-gray-500 focus:text-white"
                          onClick={() => handleRemoveCategory(cat)}
                        >
                          <svg className="h-2.5 w-2.5" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  タグ
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="タグを入力"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    追加
                  </button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800">
                        #{tag}
                        <button
                          type="button"
                          className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-900 focus:outline-none focus:bg-indigo-500 focus:text-white"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <svg className="h-2.5 w-2.5" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* オプション設定 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">オプション設定</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="include-images"
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="include-images" className="ml-2 block text-sm text-gray-700">
                  画像プレースホルダーを挿入
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="include-links"
                  type="checkbox"
                  checked={includeLinks}
                  onChange={(e) => setIncludeLinks(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="include-links" className="ml-2 block text-sm text-gray-700">
                  参考リンクを追加
                </label>
              </div>
            </div>
          </div>
          
          {/* 投稿先プラットフォーム */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">投稿先プラットフォーム</h2>
            
            <div className="space-y-2">
              {publishPlatforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                    selectedPlatforms.includes(platform.id) ? 'bg-indigo-600 text-white' : 'border border-gray-300'
                  }`}>
                    {selectedPlatforms.includes(platform.id) && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-lg mr-2">{platform.icon}</span>
                  <span className="font-medium text-gray-900">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 生成ボタン */}
          <div className="bg-white shadow rounded-lg p-6">
            <button
              type="button"
              onClick={generateContent}
              disabled={isGenerating || !title || !keyword}
              className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isGenerating || !title || !keyword
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  コンテンツ生成中... {Math.round(generationProgress)}%
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                  AIでコンテンツを生成
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* 右側プレビュー */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow rounded-lg p-6 h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">コンテンツプレビュー</h2>
              {generatedContent && (
                <button
                  onClick={saveContent}
                  disabled={isSaving}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    isSaving ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      保存中...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
                      </svg>
                      保存
                    </>
                  )}
                </button>
              )}
            </div>
            
            {!generatedContent ? (
              <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <p className="text-gray-500 mb-1">コンテンツはまだ生成されていません</p>
                <p className="text-gray-400 text-sm">左側のフォームに入力し、「AIでコンテンツを生成」ボタンをクリックしてください</p>
              </div>
            ) : (
              <div className="h-[70vh] overflow-y-auto border rounded-lg p-4 prose prose-indigo prose-sm sm:prose max-w-none">
                {generatedContent.split('\n').map((line, index) => {
                  // 見出しのスタイル適用
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-bold mt-3 mb-2">{line.replace('### ', '')}</h3>;
                  } else if (line.startsWith('- ') || line.startsWith('* ')) {
                    return <li key={index} className="ml-4">{line.replace(/^[*-] /, '')}</li>;
                  } else if (line.match(/^\d+\.\s/)) {
                    return <li key={index} className="ml-4">{line.replace(/^\d+\.\s/, '')}</li>;
                  } else if (line.trim() === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="my-2">{line}</p>;
                  }
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}