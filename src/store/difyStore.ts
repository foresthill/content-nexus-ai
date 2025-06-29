import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DifyConfig, DifyApplication } from '@/types/dify';

interface DifyStore {
  // Configuration
  config: DifyConfig | null;
  isConfigured: boolean;
  
  // Applications
  applications: DifyApplication[];
  selectedAppId: string | null;
  
  // Connection Status
  isConnected: boolean;
  connectionError: string | null;
  
  // Actions
  setConfig: (config: DifyConfig) => void;
  updateConfig: (updates: Partial<DifyConfig>) => void;
  clearConfig: () => void;
  
  setApplications: (apps: DifyApplication[]) => void;
  selectApplication: (appId: string) => void;
  
  setConnectionStatus: (status: boolean, error?: string) => void;
  testConnection: () => Promise<boolean>;
}

export const useDifyStore = create<DifyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      config: null,
      isConfigured: false,
      applications: [],
      selectedAppId: null,
      isConnected: false,
      connectionError: null,

      // Configuration actions
      setConfig: (config) => {
        set({
          config,
          isConfigured: true,
          connectionError: null,
        });
      },

      updateConfig: (updates) => {
        const currentConfig = get().config;
        if (currentConfig) {
          set({
            config: { ...currentConfig, ...updates },
          });
        }
      },

      clearConfig: () => {
        set({
          config: null,
          isConfigured: false,
          applications: [],
          selectedAppId: null,
          isConnected: false,
          connectionError: null,
        });
      },

      // Application actions
      setApplications: (apps) => {
        set({ applications: apps });
      },

      selectApplication: (appId) => {
        set({ selectedAppId: appId });
      },

      // Connection actions
      setConnectionStatus: (status, error) => {
        set({
          isConnected: status,
          connectionError: error || null,
        });
      },

      testConnection: async () => {
        const { config } = get();
        if (!config) {
          set({
            isConnected: false,
            connectionError: 'No configuration found',
          });
          return false;
        }

        try {
          // サーバーサイドAPIを通じて接続テスト
          const response = await fetch('/api/dify/test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              apiKey: config.apiKey,
              baseUrl: config.baseUrl,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            set({
              isConnected: true,
              connectionError: null,
            });
            return true;
          } else {
            set({
              isConnected: false,
              connectionError: data.error || `Connection failed: ${response.statusText}`,
            });
            return false;
          }
        } catch (error) {
          set({
            isConnected: false,
            connectionError: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
          return false;
        }
      },
    }),
    {
      name: 'dify-config',
      partialize: (state) => ({
        config: state.config,
        selectedAppId: state.selectedAppId,
      }),
    }
  )
);