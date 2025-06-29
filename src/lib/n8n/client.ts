import { N8nConnectionConfig, N8nWebhookPayload, N8nResponse, N8nWorkflowTrigger } from '@/types/n8n';

export class N8nClient {
  private config: N8nConnectionConfig;

  constructor(config: N8nConnectionConfig) {
    this.config = config;
  }

  /**
   * Trigger a webhook in n8n
   */
  async triggerWebhook(
    webhookPath: string,
    payload: N8nWebhookPayload,
    options?: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
    }
  ): Promise<N8nResponse> {
    try {
      const url = `${this.config.baseUrl}/webhook/${webhookPath}`;
      const method = options?.method || 'POST';
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options?.headers,
      };

      // Add authentication if configured
      if (this.config.apiKey) {
        headers['X-N8N-API-KEY'] = this.config.apiKey;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify(payload) : undefined,
        signal: AbortSignal.timeout(this.config.timeout || 30000),
      });

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        executionId: data.executionId,
        workflowId: data.workflowId,
        data: data.data,
      };
    } catch (error) {
      console.error('n8n webhook error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Trigger a workflow directly via n8n API
   */
  async triggerWorkflow(
    workflowId: string,
    data: any
  ): Promise<N8nResponse> {
    try {
      const url = `${this.config.baseUrl}/api/v1/workflows/${workflowId}/activate`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add basic auth if configured
      if (this.config.username && this.config.password) {
        const auth = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
      } else if (this.config.apiKey) {
        headers['X-N8N-API-KEY'] = this.config.apiKey;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ data }),
        signal: AbortSignal.timeout(this.config.timeout || 30000),
      });

      if (!response.ok) {
        throw new Error(`n8n workflow trigger failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        executionId: result.data?.executionId,
        workflowId,
        data: result.data,
      };
    } catch (error) {
      console.error('n8n workflow trigger error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test webhook connection
   */
  async testWebhookConnection(webhookPath: string): Promise<boolean> {
    try {
      const response = await this.triggerWebhook(webhookPath, {
        workflowId: 'test',
        workflowName: 'Connection Test',
        executionId: 'test-' + Date.now(),
        event: 'custom' as any,
        data: { test: true },
        timestamp: new Date().toISOString(),
      });
      
      return response.success;
    } catch (error) {
      console.error('n8n connection test failed:', error);
      return false;
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    try {
      const url = `${this.config.baseUrl}/api/v1/executions/${executionId}`;
      
      const headers: Record<string, string> = {};

      if (this.config.username && this.config.password) {
        const auth = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
      } else if (this.config.apiKey) {
        headers['X-N8N-API-KEY'] = this.config.apiKey;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(this.config.timeout || 30000),
      });

      if (!response.ok) {
        throw new Error(`Failed to get execution status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get execution status:', error);
      throw error;
    }
  }
}