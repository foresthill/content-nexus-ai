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
          // 実際のAPIでは、ここでアバターデータを取得
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
          // 実際のAPIでは、ここで利用可能なモデルを取得
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
          
          set(state => ({
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
          set(state => ({
            avatars: state.avatars.filter(a => a.id !== id),
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
      selectAvatar: (id) => {
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
      getModelById: (id) => {
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