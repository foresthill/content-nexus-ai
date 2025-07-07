import { N8nClient } from '../client';
import { N8nEventType } from '@/types/n8n';

// Mock fetch
global.fetch = jest.fn();

describe('N8nClient', () => {
  let client: N8nClient;
  const mockConfig = {
    baseUrl: 'https://n8n.example.com',
    apiKey: 'test-api-key',
    timeout: 5000
  };

  beforeEach(() => {
    client = new N8nClient(mockConfig);
    jest.clearAllMocks();
  });

  describe('triggerWebhook', () => {
    it('should successfully trigger a webhook', async () => {
      const mockResponse = {
        executionId: 'exec-123',
        workflowId: 'wf-123',
        data: { success: true }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.triggerWebhook('test-webhook', {
        workflowId: 'wf-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-123',
        event: N8nEventType.CONTENT_CREATED,
        data: { test: true },
        timestamp: new Date().toISOString()
      });

      expect(result.success).toBe(true);
      expect(result.executionId).toBe('exec-123');
      expect(result.workflowId).toBe('wf-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://n8n.example.com/webhook/test-webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': 'test-api-key'
          })
        })
      );
    });

    it('should handle webhook trigger failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await client.triggerWebhook('invalid-webhook', {
        workflowId: 'wf-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-123',
        event: N8nEventType.CONTENT_CREATED,
        data: { test: true },
        timestamp: new Date().toISOString()
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('404 Not Found');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await client.triggerWebhook('test-webhook', {
        workflowId: 'wf-123',
        workflowName: 'Test Workflow',
        executionId: 'exec-123',
        event: N8nEventType.CONTENT_CREATED,
        data: { test: true },
        timestamp: new Date().toISOString()
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('triggerWorkflow', () => {
    it('should trigger workflow with basic auth', async () => {
      const clientWithAuth = new N8nClient({
        ...mockConfig,
        username: 'testuser',
        password: 'testpass'
      });

      const mockResponse = {
        data: {
          executionId: 'exec-456'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await clientWithAuth.triggerWorkflow('wf-456', { test: true });

      expect(result.success).toBe(true);
      expect(result.executionId).toBe('exec-456');

      const authHeader = Buffer.from('testuser:testpass').toString('base64');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Basic ${authHeader}`
          })
        })
      );
    });
  });

  describe('testWebhookConnection', () => {
    it('should return true for successful connection test', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await client.testWebhookConnection('test-webhook');
      expect(result).toBe(true);
    });

    it('should return false for failed connection test', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const result = await client.testWebhookConnection('test-webhook');
      expect(result).toBe(false);
    });
  });

  describe('getExecutionStatus', () => {
    it('should get execution status successfully', async () => {
      const mockStatus = {
        id: 'exec-123',
        finished: true,
        status: 'success'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus
      });

      const result = await client.getExecutionStatus('exec-123');
      expect(result).toEqual(mockStatus);
    });

    it('should throw error on failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(client.getExecutionStatus('exec-123')).rejects.toThrow();
    });
  });
});