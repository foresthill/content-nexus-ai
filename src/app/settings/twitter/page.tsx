import { TwitterConfigPanel } from '@/components/twitter/TwitterConfigPanel';

export default function TwitterSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Twitter/X API設定</h1>
          <p className="mt-2 text-gray-600">
            Twitter Developer Portalから取得したAPIキーを設定して、X(Twitter)への投稿機能を有効にします。
          </p>
        </div>

        <TwitterConfigPanel />

        {/* 使用方法ガイド */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📖 使用方法</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-medium text-gray-900">1. Twitter Developer Portalでアプリを作成</h3>
              <p>
                <a
                  href="https://developer.twitter.com/en/portal/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Twitter Developer Portal
                </a>
                にアクセスし、新しいアプリを作成してください。
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">2. APIキーとトークンを取得</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Consumer Keys</strong>: API Key と API Secret Key</li>
                <li><strong>Authentication Tokens</strong>: Access Token と Access Token Secret</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">3. アプリの権限設定</h3>
              <p>アプリの設定で「Read and Write」権限を有効にしてください。</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">4. 設定完了後</h3>
              <p>
                設定が完了したら、
                <a
                  href="/x-post"
                  className="text-blue-600 hover:text-blue-800 underline ml-1"
                >
                  X投稿ページ
                </a>
                で投稿機能をお試しください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
