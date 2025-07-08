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