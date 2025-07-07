'use client';

import { useDifyStore } from '@/store/difyStore';

export default function DifyDebugStore() {
  const store = useDifyStore();
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Dify Store Debug Info:</h3>
      <pre className="text-sm overflow-auto">
        {JSON.stringify({
          hasConfig: !!store.config,
          isConfigured: store.isConfigured,
          hasApiKey: !!store.config?.apiKey,
          apiKeyLength: store.config?.apiKey?.length || 0,
          apiKeyPrefix: store.config?.apiKey?.substring(0, 10) || 'none',
          baseUrl: store.config?.baseUrl || 'not set',
          appId: store.config?.appId || 'not set',
          isConnected: store.isConnected,
          connectionError: store.connectionError,
        }, null, 2)}
      </pre>
    </div>
  );
}