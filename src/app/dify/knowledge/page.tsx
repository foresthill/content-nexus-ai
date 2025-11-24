'use client';

import DifyKnowledgeManager from '@/components/dify/DifyKnowledgeManager';
import { BookOpenIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function DifyKnowledgePage() {
  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Dify ナレッジベース管理
              </h1>
              <p className="text-sm text-gray-500">
                RAGで使用するナレッジベースの作成・編集・削除
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
        <div className="flex items-start gap-2">
          <InformationCircleIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">重要: データセットAPIキーが必要です</p>
            <p className="mt-1">
              Knowledge Base APIは、アプリケーションAPIキー（app-xxx）ではなく、
              <strong>データセットAPIキー</strong>を使用します。
              Dify管理画面の「ナレッジベース」→「API」から取得してください。
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-hidden">
        <DifyKnowledgeManager />
      </div>
    </div>
  );
}
