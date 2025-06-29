'use client';

import { useState } from 'react';
import { useN8nStore } from '@/store/n8nStore';
import { N8nConnectionConfig } from '@/types/n8n';

export function N8nConfigPanel() {
  const { config, isConnected, connectionError, setConfig, testConnection, disconnect } = useN8nStore();
  
  const [formData, setFormData] = useState<N8nConnectionConfig>({
    baseUrl: config?.baseUrl || '',
    apiKey: config?.apiKey || '',
    username: config?.username || '',
    password: config?.password || '',
    timeout: config?.timeout || 30000,
  });
  
  const [webhookPath, setWebhookPath] = useState('');
  const [testing, setTesting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up base URL
    const cleanedConfig = {
      ...formData,
      baseUrl: formData.baseUrl.replace(/\/$/, ''), // Remove trailing slash
    };
    
    setConfig(cleanedConfig);
  };

  const handleTest = async () => {
    if (!webhookPath) {
      alert('Please enter a webhook path to test');
      return;
    }
    
    setTesting(true);
    const success = await testConnection(webhookPath);
    setTesting(false);
    
    if (success) {
      alert('Connection successful!');
    } else {
      alert(`Connection failed: ${connectionError || 'Unknown error'}`);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect from n8n?')) {
      disconnect();
      setFormData({
        baseUrl: '',
        apiKey: '',
        username: '',
        password: '',
        timeout: 30000,
      });
      setWebhookPath('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">n8n Configuration</h2>
      
      {isConnected && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-green-800 dark:text-green-200">
            ✓ Connected to n8n
          </p>
        </div>
      )}
      
      {connectionError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-800 dark:text-red-200">
            ✗ {connectionError}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            n8n Base URL
          </label>
          <input
            type="url"
            value={formData.baseUrl}
            onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
            placeholder="https://your-n8n-instance.com"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The base URL of your n8n instance (without /webhook)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              API Key (Optional)
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="Your n8n API key"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Timeout (ms)
            </label>
            <input
              type="number"
              value={formData.timeout}
              onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
              min="5000"
              max="120000"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Basic Authentication (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="n8n username"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="n8n password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Configuration
          </button>
          
          {isConnected && (
            <button
              type="button"
              onClick={handleDisconnect}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Disconnect
            </button>
          )}
        </div>
      </form>

      {config && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Test Connection</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Webhook Path
              </label>
              <input
                type="text"
                value={webhookPath}
                onChange={(e) => setWebhookPath(e.target.value)}
                placeholder="your-webhook-id"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                The webhook path from your n8n workflow (after /webhook/)
              </p>
            </div>
            <button
              onClick={handleTest}
              disabled={testing || !webhookPath}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}