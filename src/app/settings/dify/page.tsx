import { DifyConfigPanel } from '@/components/dify';

export default function DifySettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI設定 - Dify統合</h1>
        
        <div className="mb-8">
          <p className="text-gray-600">
            Difyは、AIアプリケーション開発プラットフォームです。
            Content Nexus AIと統合することで、より高度なAI機能を利用できます。
          </p>
        </div>

        <DifyConfigPanel />

        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Dify統合のメリット</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">✓</span>
              <span>カスタムAIワークフローの作成と実行</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">✓</span>
              <span>複数のAIモデル（GPT-4、Claude等）の切り替え</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">✓</span>
              <span>プロンプトテンプレートの管理と最適化</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">✓</span>
              <span>コンテンツ生成・改善の品質向上</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}