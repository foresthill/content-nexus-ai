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
      comment: 'ToolPlusの導入でコンテンツ作成時間が80%削減。AI分析機能によりエンゲージメント率が3倍に向上しました。',
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
      {/* ヒーローセクション */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 py-12 sm:py-16 md:py-20 lg:py-28 lg:max-w-2xl lg:w-full">
            <div className="px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">AIツールを使って</span>
                <span className="block mt-1">効率的に</span>
                <span className="block mt-1 text-yellow-300">コンテンツビジネスを拡大</span>
              </h1>
              <p className="mt-6 max-w-lg text-xl text-indigo-100 sm:max-w-3xl">
                ToolPlusはAIを活用したコンテンツ作成・管理プラットフォーム。効率的なコンテンツビジネスの構築を実現します。
              </p>
              <div className="mt-8 sm:flex">
                <div className="rounded-md shadow">
                  <Link 
                    href="/dashboard" 
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    無料で始める
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link 
                    href="#features" 
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-700 bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10"
                  >
                    詳しく見る
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-indigo-800 bg-opacity-50 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/window.svg" 
              alt="デモ画面" 
              className="w-full h-full object-contain p-8" 
            />
          </div>
        </div>
      </div>

      {/* 特徴セクション */}
      <div id="features" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">特徴</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              ToolPlusがビジネスの成長をサポート
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
              ToolPlusを導入した企業やフリーランサーが、ビジネスの成長を実現しています。
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
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
            <span className="block">ToolPlusを今すぐ始めませんか？</span>
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