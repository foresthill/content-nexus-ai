# アバターAIモデルピッカー機能実装ガイド

このガイドでは、3d-avaterchat-aiリポジトリにアバターのAIモデル変更機能を実装する手順を説明します。

## 実装概要

- **AIモデルピッカー**: GPT-4o、Claude 3.5 Sonnet、Gemini Pro、Difyカスタムモデルから選択可能
- **アバター管理**: アバターの作成、選択、設定変更
- **リアルタイム更新**: モデル変更が即座に反映される
- **永続化**: ブラウザリロード後も設定が保持される

## 必要な依存関係

```json
{
  "dependencies": {
    "zustand": "^5.0.3"
  }
}
```

## 実装手順

### 1. 型定義ファイルの作成

**ファイル: `src/types/avatar.ts`**

```typescript
// アバター関連の型定義
export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  modelId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// AIモデル関連の型定義
export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'dify' | 'custom';
  description: string;
  capabilities: string[];
  isAvailable: boolean;
  modelVersion?: string;
  apiEndpoint?: string;
  icon?: string;
}

// アバター設定
export interface AvatarSettings {
  defaultModelId: string;
  voice?: {
    provider: string;
    voiceId: string;
  };
  appearance?: {
    style: 'realistic' | 'anime' | 'cartoon';
    gender: 'male' | 'female' | 'neutral';
  };
}

// モデルピッカーのプロパティ
export interface ModelPickerProps {
  currentModelId?: string;
  onModelSelect: (modelId: string) => void;
  availableModels?: AIModel[];
  showDescription?: boolean;
  className?: string;
}

// アバター操作のアクション
export interface AvatarActions {
  createAvatar: (data: Omit<Avatar, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Avatar>;
  updateAvatar: (id: string, data: Partial<Avatar>) => Promise<Avatar>;
  deleteAvatar: (id: string) => Promise<void>;
  changeModel: (avatarId: string, modelId: string) => Promise<void>;
}
```

### 2. アバター管理ストアの作成

**ファイル: `src/store/avatarStore.ts`**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Avatar, AIModel, AvatarSettings } from '@/types/avatar';

// 利用可能なAIモデルのモックデータ
const defaultAIModels: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: '最新のGPT-4 Omniモデル。高度な推論能力と多言語対応。',
    capabilities: ['テキスト生成', '翻訳', 'Q&A', 'コード生成'],
    isAvailable: true,
    modelVersion: '2024-05-13',
    icon: '🤖'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Anthropic社の最新モデル。優れた文章生成能力。',
    capabilities: ['テキスト生成', '分析', 'コーディング', '要約'],
    isAvailable: true,
    modelVersion: '20241022',
    icon: '🎭'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    description: 'Google の高性能マルチモーダルAIモデル。',
    capabilities: ['テキスト生成', '画像理解', '動画分析', 'コード生成'],
    isAvailable: true,
    modelVersion: '1.5',
    icon: '✨'
  },
  {
    id: 'dify-custom',
    name: 'Dify カスタムモデル',
    provider: 'dify',
    description: 'Dify プラットフォーム上で設定されたカスタムモデル。',
    capabilities: ['カスタム処理', 'ワークフロー', 'API連携'],
    isAvailable: true,
    icon: '🔧'
  }
];

// デフォルトアバター
const defaultAvatars: Avatar[] = [
  {
    id: 'avatar-1',
    name: 'AI アシスタント',
    imageUrl: '/avatars/ai-assistant.svg',
    modelId: 'gpt-4o',
    description: '汎用的なAIアシスタント',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

interface AvatarStore {
  // アバター関連
  avatars: Avatar[];
  selectedAvatarId: string | null;
  
  // AIモデル関連
  availableModels: AIModel[];
  
  // 設定
  settings: AvatarSettings;
  
  // ローディング状態
  isLoading: boolean;
  error: string | null;
  
  // アクション
  fetchAvatars: () => Promise<void>;
  fetchModels: () => Promise<void>;
  createAvatar: (data: Omit<Avatar, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Avatar>;
  updateAvatar: (id: string, data: Partial<Avatar>) => Promise<Avatar>;
  deleteAvatar: (id: string) => Promise<void>;
  selectAvatar: (id: string) => void;
  changeAvatarModel: (avatarId: string, modelId: string) => Promise<void>;
  updateSettings: (settings: Partial<AvatarSettings>) => void;
  
  // ヘルパー
  getSelectedAvatar: () => Avatar | null;
  getModelById: (id: string) => AIModel | null;
}

export const useAvatarStore = create<AvatarStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      avatars: defaultAvatars,
      selectedAvatarId: 'avatar-1',
      availableModels: defaultAIModels,
      settings: {
        defaultModelId: 'gpt-4o',
        appearance: {
          style: 'realistic',
          gender: 'neutral'
        }
      },
      isLoading: false,
      error: null,

      // アバター取得
      fetchAvatars: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ 
            avatars: defaultAvatars,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'アバターの取得に失敗しました',
            isLoading: false 
          });
        }
      },

      // モデル取得
      fetchModels: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          set({ 
            availableModels: defaultAIModels,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'モデルの取得に失敗しました',
            isLoading: false 
          });
        }
      },

      // アバター作成
      createAvatar: async (avatarData: Omit<Avatar, 'id' | 'createdAt' | 'updatedAt'>) => {
        set({ isLoading: true, error: null });
        try {
          const newAvatar: Avatar = {
            ...avatarData,
            id: `avatar-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          set((state: AvatarStore) => ({
            avatars: [...state.avatars, newAvatar],
            isLoading: false
          }));
          
          return newAvatar;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'アバターの作成に失敗しました',
            isLoading: false 
          });
          throw error;
        }
      },

      // アバター更新
      updateAvatar: async (id: string, updates: Partial<Avatar>) => {
        set({ isLoading: true, error: null });
        try {
          const avatars = get().avatars;
          const avatarIndex = avatars.findIndex((a: Avatar) => a.id === id);
          
          if (avatarIndex === -1) {
            throw new Error('アバターが見つかりません');
          }
          
          const updatedAvatar: Avatar = {
            ...avatars[avatarIndex],
            ...updates,
            updatedAt: new Date()
          };
          
          const newAvatars = [...avatars];
          newAvatars[avatarIndex] = updatedAvatar;
          
          set({ avatars: newAvatars, isLoading: false });
          return updatedAvatar;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'アバターの更新に失敗しました',
            isLoading: false 
          });
          throw error;
        }
      },

      // アバター削除
      deleteAvatar: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          set((state: AvatarStore) => ({
            avatars: state.avatars.filter((a: Avatar) => a.id !== id),
            selectedAvatarId: state.selectedAvatarId === id ? null : state.selectedAvatarId,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'アバターの削除に失敗しました',
            isLoading: false 
          });
          throw error;
        }
      },

      // アバター選択
      selectAvatar: (id: string) => {
        set({ selectedAvatarId: id });
      },

      // アバターのモデル変更
      changeAvatarModel: async (avatarId: string, modelId: string) => {
        try {
          await get().updateAvatar(avatarId, { modelId });
        } catch (error) {
          throw error;
        }
      },

      // 設定更新
      updateSettings: (newSettings: Partial<AvatarSettings>) => {
        set((state: AvatarStore) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      // 選択中のアバター取得
      getSelectedAvatar: () => {
        const { avatars, selectedAvatarId } = get();
        return avatars.find((a: Avatar) => a.id === selectedAvatarId) || null;
      },

      // モデル取得
      getModelById: (id: string) => {
        const { availableModels } = get();
        return availableModels.find((m: AIModel) => m.id === id) || null;
      }
    }),
    {
      name: 'avatar-store',
      partialize: (state: AvatarStore) => ({
        avatars: state.avatars,
        selectedAvatarId: state.selectedAvatarId,
        settings: state.settings
      })
    }
  )
);
```

### 3. AIモデルピッカーコンポーネントの作成

**ファイル: `src/components/avatar/ModelPicker.tsx`**

```typescript
'use client';

import React, { useState } from 'react';
import { AIModel, ModelPickerProps } from '@/types/avatar';
import { useAvatarStore } from '@/store/avatarStore';

const ModelPicker: React.FC<ModelPickerProps> = ({
  currentModelId,
  onModelSelect,
  availableModels,
  showDescription = true,
  className = ''
}) => {
  const { availableModels: storeModels, getModelById } = useAvatarStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // 使用可能なモデルリスト（propsまたはstore）
  const models = availableModels || storeModels;
  
  // 現在選択されているモデル
  const currentModel = currentModelId ? getModelById(currentModelId) : null;
  
  // モデル選択処理
  const handleModelSelect = (modelId: string) => {
    onModelSelect(modelId);
    setIsOpen(false);
  };

  // プロバイダーごとの色設定
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'anthropic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'google':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dify':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* ヘッダー */}
      <div className="mb-3">
        <h3 className="text-lg font-medium text-gray-900">AIモデル選択</h3>
        <p className="text-sm text-gray-600">アバターが使用するAIモデルを選択してください</p>
      </div>

      {/* 現在のモデル表示ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {currentModel ? (
            <>
              <span className="text-2xl">{currentModel.icon}</span>
              <div className="text-left">
                <div className="font-medium text-gray-900">{currentModel.name}</div>
                <div className="text-sm text-gray-500">{currentModel.provider}</div>
              </div>
              <div className={`px-2 py-1 rounded-full border text-xs font-medium ${getProviderColor(currentModel.provider)}`}>
                {currentModel.provider}
              </div>
            </>
          ) : (
            <div className="text-gray-500">モデルを選択してください</div>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* モデル選択ドロップダウン */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model.id)}
                className={`w-full flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                  currentModelId === model.id ? 'bg-indigo-50 ring-2 ring-indigo-500' : ''
                }`}
                disabled={!model.isAvailable}
              >
                <div className="flex-shrink-0 text-2xl mr-3">{model.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className={`px-2 py-1 rounded-full border text-xs font-medium ${getProviderColor(model.provider)}`}>
                      {model.provider}
                    </div>
                  </div>
                  
                  {showDescription && (
                    <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.slice(0, 3).map((capability, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {capability}
                      </span>
                    ))}
                    {model.capabilities.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        +{model.capabilities.length - 3}
                      </span>
                    )}
                  </div>
                  
                  {!model.isAvailable && (
                    <div className="mt-2 text-xs text-red-600">現在利用できません</div>
                  )}
                </div>
                
                {currentModelId === model.id && (
                  <div className="flex-shrink-0 ml-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 選択されたモデルの詳細情報 */}
      {currentModel && showDescription && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">選択中のモデル詳細</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">プロバイダー:</span>
              <span className="font-medium">{currentModel.provider}</span>
            </div>
            {currentModel.modelVersion && (
              <div className="flex justify-between">
                <span className="text-gray-600">バージョン:</span>
                <span className="font-medium">{currentModel.modelVersion}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">機能:</span>
              <span className="font-medium">{currentModel.capabilities.length}個</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelPicker;
```

### 4. アバタービューアーコンポーネントの作成

**ファイル: `src/components/avatar/AvatarViewer.tsx`**

```typescript
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
```

### 5. 既存ページにアバター機能を統合

**例: ダッシュボードページへの統合**

```typescript
// 必要なimportを追加
import { useAvatarStore } from '@/store/avatarStore';
import AvatarViewer from '@/components/avatar/AvatarViewer';

// コンポーネント内で
const { fetchAvatars, fetchModels } = useAvatarStore();

useEffect(() => {
  // 既存の処理...
  fetchAvatars();
  fetchModels();
}, [/* 依存配列に追加 */, fetchAvatars, fetchModels]);

// JSX内にアバターコンポーネントを追加
<AvatarViewer className="col-span-1 lg:col-span-2" />
```

## 使用方法

1. アプリケーションを起動
2. アバター管理セクションでモデルピッカーを使用
3. 希望するAIモデルを選択
4. リアルタイムでアバターのモデルが変更される

## カスタマイズ

- `defaultAIModels`配列を編集して利用可能なモデルを変更
- `getProviderColor`関数でプロバイダーの色をカスタマイズ
- `AvatarViewer`コンポーネントのプロパティで表示内容を制御

## 今後の拡張

- 3Dアバターとの統合
- リアルタイム会話機能
- アバターの外観カスタマイズ
- 音声合成の設定
- APIエンドポイントとの実際の連携