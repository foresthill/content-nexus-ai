'use client';

import React from 'react';
import { useAvatarStore } from '@/store/avatarStore';
import ModelPicker from './ModelPicker';

interface AvatarViewerProps {
  className?: string;
  showModelPicker?: boolean;
  showControls?: boolean;
}

const AvatarViewer: React.FC<AvatarViewerProps> = ({
  className = '',
  showModelPicker = true,
  showControls = true
}) => {
  const {
    getSelectedAvatar,
    getModelById,
    changeAvatarModel,
    selectedAvatarId,
    selectAvatar,
    avatars,
    isLoading
  } = useAvatarStore();

  const selectedAvatar = getSelectedAvatar();
  const currentModel = selectedAvatar ? getModelById(selectedAvatar.modelId) : null;

  // モデル変更ハンドラー
  const handleModelChange = async (modelId: string) => {
    if (selectedAvatar) {
      try {
        await changeAvatarModel(selectedAvatar.id, modelId);
      } catch (error) {
        console.error('モデルの変更に失敗しました:', error);
      }
    }
  };

  // アバター選択ハンドラー
  const handleAvatarSelect = (avatarId: string) => {
    selectAvatar(avatarId);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AIアバター</h2>
            <p className="text-sm text-gray-600 mt-1">アバターとAIモデルの管理</p>
          </div>
          {showControls && (
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              新規作成
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* アバター選択 */}
        {avatars.length > 1 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">アバター選択</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar.id)}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedAvatarId === avatar.id
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    {/* アバター画像 */}
                    <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{avatar.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 選択されたアバター情報 */}
        {selectedAvatar && (
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                {/* アバター画像 */}
                <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                
                {/* アバター情報 */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{selectedAvatar.name}</h3>
                  {selectedAvatar.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedAvatar.description}</p>
                  )}
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>作成日: {new Date(selectedAvatar.createdAt).toLocaleDateString()}</span>
                    {currentModel && (
                      <span className="flex items-center">
                        <span className="mr-1">{currentModel.icon}</span>
                        {currentModel.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* モデルピッカー */}
        {showModelPicker && selectedAvatar && (
          <div className="mb-6">
            <ModelPicker
              currentModelId={selectedAvatar.modelId}
              onModelSelect={handleModelChange}
              showDescription={true}
            />
          </div>
        )}

        {/* アバター操作 */}
        {showControls && selectedAvatar && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">アバター操作</h3>
            <div className="space-y-3">
              {/* アバターとの会話 */}
              <button className="w-full flex items-center p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                <svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div className="text-left">
                  <div className="font-medium text-indigo-900">アバターと会話する</div>
                  <div className="text-sm text-indigo-700">AIアバターとチャットを開始</div>
                </div>
              </button>

              {/* 設定 */}
              <button className="w-full flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-left">
                  <div className="font-medium text-gray-900">アバター設定</div>
                  <div className="text-sm text-gray-600">外観や音声の設定を変更</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarViewer;