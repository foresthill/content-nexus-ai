import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OpenrouterConfig {
  apiKey: string;
  selectedModel: string;
}

interface OpenrouterStore {
  config: OpenrouterConfig | null;
  isConfigured: boolean;
  selectedModel: string;

  setConfig: (config: OpenrouterConfig) => void;
  clearConfig: () => void;
  setSelectedModel: (model: string) => void;
  loadConfig: () => Promise<void>;
}

export const useOpenrouterStore = create<OpenrouterStore>()(
  persist(
    (set) => ({
      config: null,
      isConfigured: false,
      selectedModel: 'anthropic/claude-sonnet-4.6',

      setConfig: (config) => {
        set({
          config,
          isConfigured: true,
          selectedModel: config.selectedModel || 'anthropic/claude-sonnet-4.6',
        });
      },

      clearConfig: () => {
        set({
          config: null,
          isConfigured: false,
          selectedModel: 'anthropic/claude-sonnet-4.6',
        });
      },

      setSelectedModel: (model) => {
        set((state) => ({
          selectedModel: model,
          config: state.config ? { ...state.config, selectedModel: model } : null,
        }));
      },

      loadConfig: async () => {
        try {
          const response = await fetch('/api/openrouter/config');
          if (response.ok) {
            const data = await response.json();
            if (data.config) {
              set({
                config: data.config,
                isConfigured: true,
                selectedModel: data.config.selectedModel || 'anthropic/claude-sonnet-4.6',
              });
            }
          }
        } catch (error) {
          console.error('Failed to load OpenRouter config:', error);
        }
      },
    }),
    {
      name: 'openrouter-config',
      // APIキー(config)は localStorage に保持しない（サーバの暗号化DBが正）。
      // 表示用の選択モデルと設定済みフラグのみ永続化する。
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        isConfigured: state.isConfigured,
      }),
    }
  )
);