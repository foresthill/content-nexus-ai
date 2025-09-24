import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

interface TwitterStore {
  config: TwitterConfig | null;
  isConfigured: boolean;
  isConnected: boolean;
  connectionError: string | null;
  setConfig: (config: TwitterConfig) => void;
  testConnection: () => Promise<void>;
  clearConfig: () => void;
  checkConnection: () => Promise<void>;
}

export const useTwitterStore = create<TwitterStore>()(
  persist(
    (set, get) => ({
      config: null,
      isConfigured: false,
      isConnected: false,
      connectionError: null,

      setConfig: (config: TwitterConfig) => {
        set({
          config,
          isConfigured: true,
          connectionError: null,
        });
      },

      testConnection: async () => {
        const { config } = get();
        if (!config) {
          set({ connectionError: 'API設定が見つかりません' });
          return;
        }

        try {
          const response = await fetch('/api/twitter/test-connection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(config),
          });

          const result = await response.json();

          if (response.ok) {
            set({
              isConnected: true,
              connectionError: null,
            });
          } else {
            set({
              isConnected: false,
              connectionError: result.error || '接続テストに失敗しました',
            });
          }
        } catch (error) {
          set({
            isConnected: false,
            connectionError: '接続テスト中にエラーが発生しました',
          });
        }
      },

      clearConfig: () => {
        set({
          config: null,
          isConfigured: false,
          isConnected: false,
          connectionError: null,
        });
      },

      checkConnection: async () => {
        // 環境変数からAPI設定を確認
        try {
          const response = await fetch('/api/twitter/check-env');
          if (response.ok) {
            const data = await response.json();
            if (data.isConfigured) {
              set({
                isConfigured: true,
                isConnected: data.isConnected || false,
                connectionError: data.error || null,
              });
              return;
            }
          }
        } catch (error) {
          console.error('Failed to check environment config:', error);
        }

        // ローカルストレージの設定を確認
        const { config } = get();
        if (config) {
          await get().testConnection();
        }
      },
    }),
    {
      name: 'twitter-config-storage',
      partialize: (state) => ({
        config: state.config,
        isConfigured: state.isConfigured,
      }),
    }
  )
);
