'use client';

import { useState, useEffect } from 'react';
import {
  FolderIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { DifyDataset, DifyDocument } from '@/types/dify';

interface DifyKnowledgeManagerProps {
  onSelectDataset?: (dataset: DifyDataset) => void;
}

export default function DifyKnowledgeManager({ onSelectDataset }: DifyKnowledgeManagerProps) {
  const [datasets, setDatasets] = useState<DifyDataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<DifyDataset | null>(null);
  const [documents, setDocuments] = useState<DifyDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);

  // ナレッジベース一覧を取得
  const fetchDatasets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dify/knowledge');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ナレッジベースの取得に失敗しました');
      }

      setDatasets(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // ドキュメント一覧を取得
  const fetchDocuments = async (datasetId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dify/knowledge/${datasetId}/documents`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ドキュメントの取得に失敗しました');
      }

      setDocuments(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // ナレッジベースを作成
  const createDataset = async (name: string, description: string) => {
    try {
      const response = await fetch('/api/dify/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ナレッジベースの作成に失敗しました');
      }

      await fetchDatasets();
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  // ナレッジベースを削除
  const deleteDataset = async (datasetId: string) => {
    if (!confirm('このナレッジベースを削除しますか？')) return;

    try {
      const response = await fetch(`/api/dify/knowledge?id=${datasetId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ナレッジベースの削除に失敗しました');
      }

      if (selectedDataset?.id === datasetId) {
        setSelectedDataset(null);
        setDocuments([]);
      }
      await fetchDatasets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  // ドキュメントを追加
  const addDocument = async (name: string, text: string) => {
    if (!selectedDataset) return;

    try {
      const response = await fetch(`/api/dify/knowledge/${selectedDataset.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ドキュメントの追加に失敗しました');
      }

      await fetchDocuments(selectedDataset.id);
      setShowAddDocumentModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  // ドキュメントを削除
  const deleteDocument = async (documentId: string) => {
    if (!selectedDataset) return;
    if (!confirm('このドキュメントを削除しますか？')) return;

    try {
      const response = await fetch(
        `/api/dify/knowledge/${selectedDataset.id}/documents?documentId=${documentId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ドキュメントの削除に失敗しました');
      }

      await fetchDocuments(selectedDataset.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    if (selectedDataset) {
      fetchDocuments(selectedDataset.id);
      onSelectDataset?.(selectedDataset);
    }
  }, [selectedDataset, onSelectDataset]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'indexing':
      case 'parsing':
      case 'splitting':
        return <ClockIcon className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <ExclamationCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex h-full">
      {/* 左サイドバー: ナレッジベース一覧 */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">ナレッジベース</h2>
            <div className="flex gap-1">
              <button
                onClick={() => fetchDatasets()}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
                title="更新"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-1.5 text-indigo-600 hover:text-indigo-700 rounded"
                title="新規作成"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading && datasets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">読み込み中...</div>
          ) : datasets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ナレッジベースがありません
            </div>
          ) : (
            <div className="space-y-1">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedDataset?.id === dataset.id
                      ? 'bg-indigo-100 border border-indigo-300'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedDataset(dataset)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="h-5 w-5 text-indigo-500" />
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {dataset.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDataset(dataset.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 pl-7">
                    {dataset.document_count} ドキュメント • {dataset.word_count.toLocaleString()} 文字
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* メインコンテンツ: ドキュメント一覧 */}
      <div className="flex-1 flex flex-col">
        {selectedDataset ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedDataset.name}
                  </h3>
                  {selectedDataset.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedDataset.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowAddDocumentModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  ドキュメント追加
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  ドキュメントがありません
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {doc.name}
                              </span>
                              {getStatusIcon(doc.indexing_status)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {doc.word_count.toLocaleString()} 文字 •{' '}
                              {new Date(doc.created_at * 1000).toLocaleDateString('ja-JP')}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            ナレッジベースを選択してください
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <ExclamationCircleIcon className="h-5 w-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-2 font-bold">
              ×
            </button>
          </div>
        </div>
      )}

      {/* ナレッジベース作成モーダル */}
      {showCreateModal && (
        <CreateDatasetModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createDataset}
        />
      )}

      {/* ドキュメント追加モーダル */}
      {showAddDocumentModal && (
        <AddDocumentModal
          onClose={() => setShowAddDocumentModal(false)}
          onAdd={addDocument}
        />
      )}
    </div>
  );
}

// ナレッジベース作成モーダル
function CreateDatasetModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          新しいナレッジベースを作成
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="例: マーケティング資料"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="このナレッジベースの説明..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ドキュメント追加モーダル
function AddDocumentModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (name: string, text: string) => void;
}) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && text.trim()) {
      onAdd(name.trim(), text.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ドキュメントを追加
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ドキュメント名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="例: 製品ガイドライン"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                テキスト内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={12}
                placeholder="ナレッジベースに追加するテキストを入力..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {text.length.toLocaleString()} 文字
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
