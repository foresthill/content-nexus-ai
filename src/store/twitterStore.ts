import { create } from 'zustand';

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
  username: string | null;
  platformUserId: string | null;
  isLoading: boolean;
  setConfig: (config: TwitterConfig) => void;
  saveConfig: (config: TwitterConfig) => Promise<void>;
  testConnection: () => Promise<void>;
  clearConfig: () => void;
  deleteConfig: () => Promise<void>;
  checkConnection: () => Promise<void>;
  loadFromDB: () => Promise<void>;
}

export const useTwitterStore = create<TwitterStore>((set, get) => ({
  config: null,
  isConfigured: false,
  isConnected: false,
  connectionError: null,
  username: null,
  platformUserId: null,
  isLoading: false,

  setConfig: (config: TwitterConfig) => {
    // ローカルステートのみ更新（DBへの保存は saveConfig で行う）
    set({
      config,
      isConfigured: true,
      isConnected: false,
      connectionError: null,
    });
  },

  saveConfig: async (config: TwitterConfig) => {
    set({ isLoading: true });
    try {
      // メモリストレージに保存（シンプルで確実な単一のAPI）
      const response = await fetch('/api/twitter/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();

      if (response.ok) {
        set({
          config,
          isConfigured: true,
          isConnected: result.isConnected,
          username: result.username,
          connectionError: null,
        });
      } else {
        set({
          connectionError: result.error || '設定の保存に失敗しました',
        });
        throw new Error(result.error);
      }
    } catch (error: any) {
      set({
        connectionError: error.message || '設定の保存中にエラーが発生しました',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  testConnection: async () => {
    const { config } = get();
    if (!config) {
      set({ connectionError: 'API設定が見つかりません' });
      return;
    }

    set({ isLoading: true });
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
          username: result.username,
          platformUserId: result.userId,
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
    } finally {
      set({ isLoading: false });
    }
  },

  clearConfig: () => {
    // ローカルステートのみクリア
    set({
      config: null,
      isConfigured: false,
      isConnected: false,
      connectionError: null,
      username: null,
      platformUserId: null,
    });
  },

  deleteConfig: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/twitter/settings', {
        method: 'DELETE',
      });

      if (response.ok) {
        set({
          config: null,
          isConfigured: false,
          isConnected: false,
          connectionError: null,
          username: null,
          platformUserId: null,
        });
      } else {
        const result = await response.json();
        throw new Error(result.error || '設定の削除に失敗しました');
      }
    } catch (error: any) {
      set({
        connectionError: error.message || '設定の削除中にエラーが発生しました',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  checkConnection: async () => {
    // まず環境変数からAPI設定を確認
    try {
      const response = await fetch('/api/twitter/check-env');
      if (response.ok) {
        const data = await response.json();
        if (data.isConfigured) {
          // 環境変数で設定されている場合
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

    // DBから設定を取得
    await get().loadFromDB();
  },

  loadFromDB: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/twitter/settings');

      if (response.ok) {
        const data = await response.json();

        if (data.isConfigured) {
          set({
            config: data.config || null,  // 認証情報も設定
            isConfigured: true,
            isConnected: data.isConnected,
            username: data.username,
            platformUserId: data.platformUserId,
            connectionError: null,
          });
        } else {
          set({
            config: null,
            isConfigured: false,
            isConnected: false,
            connectionError: 'Twitter API設定が見つかりません',
            username: null,
            platformUserId: null,
          });
        }
      } else {
        throw new Error('設定の取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Failed to load settings from DB:', error);
      set({
        isConfigured: false,
        isConnected: false,
        connectionError: '設定の取得中にエラーが発生しました',
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
