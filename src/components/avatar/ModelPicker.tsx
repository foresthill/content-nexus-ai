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