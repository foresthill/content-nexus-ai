import { N8nConfigPanel, N8nWorkflowManager } from '@/components/n8n';

export default function N8nSettingsPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">n8n Integration</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect Content Nexus AI with n8n to automate workflows and integrate with external services.
        </p>
      </div>

      <N8nConfigPanel />
      
      <N8nWorkflowManager />
    </div>
  );
}