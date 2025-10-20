'use client';

/**
 * Authentication Error Page
 *
 * 認証エラー表示ページ
 * NextAuthのエラーをユーザーフレンドリーに表示
 */

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * NextAuthエラーコードとメッセージのマッピング
 */
const errorMessages: Record<string, string> = {
  Configuration: 'サーバー設定に問題があります。管理者にお問い合わせください。',
  AccessDenied: 'アクセスが拒否されました。権限を確認してください。',
  Verification: '認証リンクの有効期限が切れているか、既に使用されています。',
  OAuthSignin: 'OAuth認証の開始に失敗しました。',
  OAuthCallback: 'OAuth認証のコールバック処理に失敗しました。',
  OAuthCreateAccount: 'OAuthアカウントの作成に失敗しました。',
  EmailCreateAccount: 'メールアカウントの作成に失敗しました。',
  Callback: '認証コールバックの処理中にエラーが発生しました。',
  OAuthAccountNotLinked:
    'このメールアドレスは既に別の認証方法で登録されています。元の方法でログインしてください。',
  EmailSignin: 'メール送信に失敗しました。',
  CredentialsSignin: 'メールアドレスまたはパスワードが正しくありません。',
  SessionRequired: 'このページにアクセスするにはログインが必要です。',
  Default: '認証中にエラーが発生しました。',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // エラーメッセージを取得
  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  // エラーの重要度を判定
  const isCritical = error && ['Configuration', 'OAuthCreateAccount'].includes(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">認証エラー</h1>
          <p className="text-gray-600">ログイン処理中に問題が発生しました</p>
        </div>

        {/* エラーメッセージ */}
        <div
          className={`rounded-2xl p-6 ${
            isCritical
              ? 'bg-red-50 border-2 border-red-200'
              : 'bg-orange-50 border-2 border-orange-200'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isCritical ? (
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3
                className={`text-sm font-medium ${
                  isCritical ? 'text-red-800' : 'text-orange-800'
                }`}
              >
                {isCritical ? '重大なエラー' : 'エラーが発生しました'}
              </h3>
              <p className={`mt-2 text-sm ${isCritical ? 'text-red-700' : 'text-orange-700'}`}>
                {errorMessage}
              </p>
              {error && (
                <p className="mt-2 text-xs text-gray-500">エラーコード: {error}</p>
              )}
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            ログインページに戻る
          </Link>

          {error === 'OAuthAccountNotLinked' && (
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              別の方法でログイン
            </Link>
          )}

          {isCritical && (
            <a
              href="mailto:support@toolplus.example.com"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              サポートに問い合わせる
            </a>
          )}
        </div>

        {/* トラブルシューティング */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            よくある解決方法
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span>ブラウザのキャッシュとCookieをクリアしてから再度お試しください</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span>別のブラウザまたはシークレットモードで試してみてください</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span>
                同じメールアドレスで複数の認証方法を使用している場合は、最初に使用した方法でログインしてください
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              <span>問題が解決しない場合は、サポートチームまでお問い合わせください</span>
            </li>
          </ul>
        </div>

        {/* ホームリンク */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
