import Link from 'next/link';

export default function HomePage() {
  // 主要機能
  const features = [
    {
      name: 'AIコンテンツ作成',
      description: 'Dify連携による高度なAIコンテンツ生成。SEO対策済みの記事を短時間で作成できます。',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      ),
    },
    {
      name: 'キーワード分析',
      description: '最適なキーワードを自動提案。検索上位を獲得しやすいニッチなキーワードを発掘します。',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      ),
    },
    {
      name: 'マルチSNS投稿',
      description: 'X、Instagram、TikTokなど複数のSNSに一括投稿。n8n連携でワークフローを自動化。',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      ),
    },
    {
      name: 'AI分析機能',
      description: 'エンゲージメント分析、競合分析、バイラル予測など、AIによる高度な分析機能を提供。',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
    },
  ];

  // 使い方ステップ
  const steps = [
    {
      number: '01',
      title: 'API設定',
      description: 'Difyやn8nのAPIキーを設定。各プラットフォームとの連携を簡単に設定できます。',
    },
    {
      number: '02',
      title: 'コンテンツ作成',
      description: 'AIを使って高品質なコンテンツを生成。テーマを入力するだけでSEO最適化された記事が完成。',
    },
    {
      number: '03',
      title: 'SNS投稿',
      description: '作成したコンテンツを複数のSNSに一括投稿。最適な投稿時間をAIが提案します。',
    },
    {
      number: '04',
      title: '分析・最適化',
      description: '投稿のパフォーマンスをリアルタイム分析。AIが次の改善点を自動提案します。',
    },
  ];

  // 成功事例
  const testimonials = [
    {
      name: '株式会社テックソリューション',
      age: 'マーケティング担当',
      occupation: '',
      comment: 'ContentNexusの導入でコンテンツ作成時間が80%削減。AI分析機能によりエンゲージメント率が3倍に向上しました。',
      image: '/window.svg', // 実際の画像に置き換えてください
    },
    {
      name: 'フリーランスマーケター 田中氏',
      age: '35歳',
      occupation: '',
      comment: 'Difyとn8nの連携機能が素晴らしい。複雑なワークフローを自動化でき、クライアント対応に集中できるようになりました。',
      image: '/file.svg', // 実際の画像に置き換えてください
    },
    {
      name: 'ECショップ運営 山本氏',
      age: '',
      occupation: '',
      comment: '競合分析機能で市場の動向を把握。SNS投稿の最適化により、売上が前年比150%に成長しました。',
      image: '/globe.svg', // 実際の画像に置き換えてください
    },
  ];

  return (
    <div className="bg-white">
      {/* ヒーローセクション - Opera Neon/Cohere/ChatGPT風モダンデザイン */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-white to-orange-50">
        {/* 背景のアニメーション要素 */}
        <div className="absolute inset-0">
          {/* メインのグラデーション円 */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse delay-2000"></div>
          
          {/* 動的な粒子効果 */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-float opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* プリタイトル */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-8">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-gray-700 text-sm font-medium">Introducing ContentNexus AI</span>
          </div>

          {/* メインタイトル */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
            <span className="block bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent leading-tight">
              AIが創る、
            </span>
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent leading-tight mt-2">
              新しいコンテンツ体験
            </span>
          </h1>

          {/* サブタイトル */}
          <p className="max-w-3xl mx-auto text-xl text-gray-600 mb-12 leading-relaxed">
            次世代AIプラットフォームで、コンテンツ作成から配信、分析まで。
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-medium">
              一つのプラットフォームですべてを完結させましょう。
            </span>
          </p>

          {/* CTA ボタン */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/dashboard" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl min-w-48"
            >
              <span className="relative z-10">無料で始める</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 filter blur transition-opacity duration-300"></div>
              <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <button className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl hover:bg-white/90 hover:shadow-lg transition-all duration-300 min-w-48">
              <svg className="mr-2 w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              デモを見る
            </button>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">10,000+</div>
              <div className="text-gray-600">アクティブユーザー</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">500M+</div>
              <div className="text-gray-600">生成コンテンツ</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">99.9%</div>
              <div className="text-gray-600">アップタイム</div>
            </div>
          </div>
        </div>

        {/* スクロールインジケーター */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* 特徴セクション */}
      <div id="features" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">特徴</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              ContentNexusがビジネスの成長をサポート
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              AIを活用したコンテンツ作成からSNS投稿、分析まで、ビジネスの成長に必要な全ての機能を提供します。
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.name} className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-md shadow-lg">
                          <div className="text-white">{feature.icon}</div>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.name}</h3>
                      <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 使い方セクション */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">簡単ステップ</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              たった4ステップで収益化
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              専門知識は不要。シンプルな操作だけで誰でも始められます。
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 lg:gap-x-8">
              {steps.map((step) => (
                <div key={step.number} className="relative">
                  <div className="text-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-600 text-white text-2xl font-bold mx-auto">
                      {step.number}
                    </div>
                    <h3 className="mt-6 text-lg font-medium text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-base text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 成功事例セクション */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">導入事例</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              多くの企業・個人が成果を出しています
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              ContentNexusを導入した企業やフリーランサーが、ビジネスの成長を実現しています。
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden">
                        <img src={testimonial.image} alt={testimonial.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                        <p className="text-sm text-gray-500">{testimonial.age} | {testimonial.occupation}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-base text-gray-600 italic">&ldquo;{testimonial.comment}&rdquo;</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA セクション */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">ContentNexusを今すぐ始めませんか？</span>
            <span className="block text-indigo-200">無料トライアルで全機能をお試しいただけます。</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                今すぐ始める
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800"
              >
                詳細を見る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}