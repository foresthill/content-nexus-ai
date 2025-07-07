import { N8nService } from '../service';
import { N8nClient } from '../client';
import { N8nEventType } from '@/types/n8n';

// Mock the client
jest.mock('../client');

describe('N8nService', () => {
  let service: N8nService;
  let mockClient: jest.Mocked<N8nClient>;

  beforeEach(() => {
    service = new N8nService();
    mockClient = new N8nClient({
      baseUrl: 'https://n8n.example.com'
    }) as jest.Mocked<N8nClient>;
    
    // Mock client methods
    mockClient.triggerWebhook = jest.fn().mockResolvedValue({
      success: true,
      executionId: 'exec-123'
    });
    mockClient.testWebhookConnection = jest.fn().mockResolvedValue(true);

    // Initialize service with mock config
    service.initialize({
      baseUrl: 'https://n8n.example.com'
    });
    
    // Replace client with mock
    (service as any).client = mockClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Workflow Management', () => {
    it('should register a workflow', () => {
      const workflow = {
        id: 'wf-1',
        name: 'Test Workflow',
        webhookUrl: 'https://n8n.example.com/webhook/abc123',
        events: [N8nEventType.CONTENT_CREATED],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.registerWorkflow(workflow);
      const workflows = service.getWorkflows();
      
      expect(workflows).toHaveLength(1);
      expect(workflows[0]).toEqual(workflow);
    });

    it('should unregister a workflow', () => {
      const workflow = {
        id: 'wf-1',
        name: 'Test Workflow',
        webhookUrl: 'https://n8n.example.com/webhook/abc123',
        events: [N8nEventType.CONTENT_CREATED],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.registerWorkflow(workflow);
      service.unregisterWorkflow('wf-1');
      
      const workflows = service.getWorkflows();
      expect(workflows).toHaveLength(0);
    });
  });

  describe('Event Triggering', () => {
    it('should trigger workflows for matching events', async () => {
      const workflow1 = {
        id: 'wf-1',
        name: 'Content Workflow',
        webhookUrl: 'https://n8n.example.com/webhook/content',
        events: [N8nEventType.CONTENT_CREATED, N8nEventType.CONTENT_UPDATED],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const workflow2 = {
        id: 'wf-2',
        name: 'Post Workflow',
        webhookUrl: 'https://n8n.example.com/webhook/post',
        events: [N8nEventType.POST_PUBLISHED],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.registerWorkflow(workflow1);
      service.registerWorkflow(workflow2);

      await service.triggerEvent(N8nEventType.CONTENT_CREATED, {
        content: {
          id: 'content-1',
          title: 'Test Content',
          content: 'Test content body',
          status: 'draft'
        }
      });

      expect(mockClient.triggerWebhook).toHaveBeenCalledTimes(1);
      expect(mockClient.triggerWebhook).toHaveBeenCalledWith(
        'content',
        expect.objectContaining({
          event: N8nEventType.CONTENT_CREATED,
          workflowId: 'wf-1'
        })
      );
    });

    it('should not trigger inactive workflows', async () => {
      const workflow = {
        id: 'wf-1',
        name: 'Inactive Workflow',
        webhookUrl: 'https://n8n.example.com/webhook/inactive',
        events: [N8nEventType.CONTENT_CREATED],
        active: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.registerWorkflow(workflow);

      await service.triggerEvent(N8nEventType.CONTENT_CREATED, {
        content: {
          id: 'content-1',
          title: 'Test Content',
          content: 'Test content body',
          status: 'draft'
        }
      });

      expect(mockClient.triggerWebhook).not.toHaveBeenCalled();
    });

    it('should handle client not initialized', async () => {
      const uninitializedService = new N8nService();
      
      // This should not throw but log an error
      await expect(
        uninitializedService.triggerEvent(N8nEventType.CONTENT_CREATED, {})
      ).resolves.toBeUndefined();
    });
  });

  describe('Content Events', () => {
    beforeEach(() => {
      const workflow = {
        id: 'wf-1',
        name: 'Content Workflow',
        webhookUrl: 'https://n8n.example.com/webhook/content',
        events: [
          N8nEventType.CONTENT_CREATED,
          N8nEventType.CONTENT_UPDATED,
          N8nEventType.CONTENT_PUBLISHED
        ],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      service.registerWorkflow(workflow);
    });

    it('should trigger onContentCreated', async () => {
      const content = {
        id: 'content-1',
        title: 'New Content',
        content: 'Content body',
        status: 'draft' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await service.onContentCreated(content);

      expect(mockClient.triggerWebhook).toHaveBeenCalledWith(
        'content',
        expect.objectContaining({
          event: N8nEventType.CONTENT_CREATED,
          data: expect.objectContaining({
            content: expect.objectContaining({
              id: 'content-1',
              title: 'New Content'
            })
          })
        })
      );
    });

    it('should trigger onContentUpdated', async () => {
      const content = {
        id: 'content-1',
        title: 'Updated Content',
        content: 'Updated body',
        status: 'draft' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await service.onContentUpdated(content);

      expect(mockClient.triggerWebhook).toHaveBeenCalledWith(
        'content',
        expect.objectContaining({
          event: N8nEventType.CONTENT_UPDATED
        })
      );
    });

    it('should trigger onContentPublished', async () => {
      const content = {
        id: 'content-1',
        title: 'Published Content',
        content: 'Published body',
        status: 'published' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await service.onContentPublished(content);

      expect(mockClient.triggerWebhook).toHaveBeenCalledWith(
        'content',
        expect.objectContaining({
          event: N8nEventType.CONTENT_PUBLISHED
        })
      );
    });
  });

  describe('Social Media Events', () => {
    beforeEach(() => {
      const workflow = {
        id: 'wf-2',
        name: 'Social Workflow',
        webhookUrl: 'https://n8n.example.com/webhook/social',
        events: [
          N8nEventType.POST_PUBLISHED,
          N8nEventType.POST_FAILED,
          N8nEventType.POST_SCHEDULED
        ],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      service.registerWorkflow(workflow);
    });

    it('should trigger onPostPublished', async () => {
      const post = {
        id: 'post-1',
        platform: 'twitter' as const,
        content: 'Test tweet',
        status: 'published' as const,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await service.onPostPublished(post);

      expect(mockClient.triggerWebhook).toHaveBeenCalledWith(
        'social',
        expect.objectContaining({
          event: N8nEventType.POST_PUBLISHED,
          data: expect.objectContaining({
            post: expect.objectContaining({
              id: 'post-1',
              platform: 'twitter'
            })
          })
        })
      );
    });

    it('should trigger onPostFailed', async () => {
      const post = {
        id: 'post-1',
        platform: 'instagram' as const,
        content: 'Failed post',
        status: 'failed' as const,
        scheduledFor: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await service.onPostFailed(post, 'Rate limit exceeded');

      expect(mockClient.triggerWebhook).toHaveBeenCalledWith(
        'social',
        expect.objectContaining({
          event: N8nEventType.POST_FAILED,
          data: expect.objectContaining({
            custom: expect.objectContaining({
              error: 'Rate limit exceeded'
            })
          })
        })
      );
    });
  });

  describe('Analytics Events', () => {
    beforeEach(() => {
      const workflow = {
        id: 'wf-3',
        name: 'Analytics Workflow',
        webhookUrl: 'https://n8n.example.com/webhook/analytics',
        events: [
          N8nEventType.ANALYTICS_UPDATED,
          N8nEventType.ENGAGEMENT_THRESHOLD
        ],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      service.registerWorkflow(workflow);
    });

    it('should trigger onAnalyticsUpdated', async () => {
      await service.onAnalyticsUpdated('twitter', {
        engagement: 150,
        reach: 5000,
        followers: 1200,
        growth: 50
      });

      expect(mockClient.triggerWebhook).toHaveBeenCalledWith(
        'analytics',
        expect.objectContaining({
          event: N8nEventType.ANALYTICS_UPDATED,
          data: expect.objectContaining({
            analytics: expect.objectContaining({
              platform: 'twitter',
              metrics: expect.objectContaining({
                engagement: 150,
                reach: 5000
              })
            })
          })
        })
      );
    });

    it('should trigger onEngagementThreshold', async () => {
      await service.onEngagementThreshold('instagram', 100, 150);

      expect(mockClient.triggerWebhook).toHaveBeenCalledWith(
        'analytics',
        expect.objectContaining({
          event: N8nEventType.ENGAGEMENT_THRESHOLD,
          data: expect.objectContaining({
            analytics: expect.objectContaining({
              platform: 'instagram'
            }),
            custom: expect.objectContaining({
              threshold: 100,
              exceeded: true
            })
          })
        })
      );
    });
  });

  describe('Connection Testing', () => {
    it('should test connection successfully', async () => {
      const result = await service.testConnection('test-webhook');
      expect(result).toBe(true);
      expect(mockClient.testWebhookConnection).toHaveBeenCalledWith('test-webhook');
    });

    it('should throw error when client not initialized', async () => {
      const uninitializedService = new N8nService();
      
      await expect(
        uninitializedService.testConnection('test-webhook')
      ).rejects.toThrow('n8n client not initialized');
    });
  });
});