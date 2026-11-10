import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { N8nConnectionConfig, N8nWorkflowConfig } from '@/types/n8n';
import { n8nService } from '@/lib/n8n/service';

interface N8nStore {
  // Connection configuration
  config: N8nConnectionConfig | null;
  isConnected: boolean;
  connectionError: string | null;
  
  // Workflows
  workflows: N8nWorkflowConfig[];
  
  // Actions
  setConfig: (config: N8nConnectionConfig) => void;
  loadConfig: () => Promise<void>;
  testConnection: (webhookPath: string) => Promise<boolean>;
  disconnect: () => void;
  
  // Workflow management
  addWorkflow: (workflow: N8nWorkflowConfig) => void;
  updateWorkflow: (id: string, updates: Partial<N8nWorkflowConfig>) => void;
  removeWorkflow: (id: string) => void;
  toggleWorkflow: (id: string) => void;
}

export const useN8nStore = create<N8nStore>()(
  persist(
    (set, get) => ({
      // Initial state
      config: null,
      isConnected: false,
      connectionError: null,
      workflows: [],

      // Set configuration
      setConfig: (config) => {
        n8nService.initialize(config);
        set({ config, connectionError: null });
        // サーバの暗号化DBへ永続化(ユーザーごと)。localStorage に秘匿値は残さない。
        fetch('/api/n8n/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        }).catch((e) => console.error('n8n config save failed:', e));
      },

      // サーバの暗号化DBから設定を復元
      loadConfig: async () => {
        try {
          const res = await fetch('/api/n8n/config');
          if (!res.ok) return;
          const data = await res.json();
          if (data.hasConfig && data.config) {
            n8nService.initialize(data.config);
            set({ config: data.config, connectionError: null });
          }
        } catch (e) {
          console.error('n8n config load failed:', e);
        }
      },

      // Test connection
      testConnection: async (webhookPath) => {
        const { config } = get();
        if (!config) {
          set({ connectionError: 'No configuration provided' });
          return false;
        }

        try {
          const success = await n8nService.testConnection(webhookPath);
          
          if (success) {
            set({ isConnected: true, connectionError: null });
            
            // Register all active workflows
            const { workflows } = get();
            workflows.forEach(workflow => {
              if (workflow.active) {
                n8nService.registerWorkflow(workflow);
              }
            });
          } else {
            set({ 
              isConnected: false, 
              connectionError: 'Failed to connect to n8n webhook' 
            });
          }
          
          return success;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Connection failed';
          set({ 
            isConnected: false, 
            connectionError: errorMessage 
          });
          return false;
        }
      },

      // Disconnect
      disconnect: () => {
        set({
          config: null,
          isConnected: false,
          connectionError: null
        });
        fetch('/api/n8n/config', { method: 'DELETE' }).catch(() => {});
      },

      // Add workflow
      addWorkflow: (workflow) => {
        set((state) => ({
          workflows: [...state.workflows, workflow]
        }));
        
        if (workflow.active && get().isConnected) {
          n8nService.registerWorkflow(workflow);
        }
      },

      // Update workflow
      updateWorkflow: (id, updates) => {
        set((state) => ({
          workflows: state.workflows.map(w => 
            w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
          )
        }));
        
        const workflow = get().workflows.find(w => w.id === id);
        if (workflow && get().isConnected) {
          if (workflow.active) {
            n8nService.registerWorkflow(workflow);
          } else {
            n8nService.unregisterWorkflow(id);
          }
        }
      },

      // Remove workflow
      removeWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.filter(w => w.id !== id)
        }));
        
        n8nService.unregisterWorkflow(id);
      },

      // Toggle workflow active state
      toggleWorkflow: (id) => {
        const workflow = get().workflows.find(w => w.id === id);
        if (workflow) {
          get().updateWorkflow(id, { active: !workflow.active });
        }
      },
    }),
    {
      name: 'n8n-config',
      // 秘匿値(apiKey/password)を含む config は localStorage に残さない。
      // サーバの暗号化DBから loadConfig() で復元する。workflows(非秘匿)のみ保持。
      partialize: (state) => ({
        workflows: state.workflows,
      }),
    }
  )
);