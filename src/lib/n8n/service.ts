import { N8nClient } from './client';
import { 
  N8nEventType, 
  N8nWebhookPayload, 
  N8nWorkflowConfig,
  N8nTriggerData,
  N8nConnectionConfig 
} from '@/types/n8n';
import { Content } from '@/types/content';
import { SocialPost } from '@/types/social';

export class N8nService {
  private client: N8nClient | null = null;
  private workflows: Map<string, N8nWorkflowConfig> = new Map();

  /**
   * Initialize n8n service with configuration
   */
  initialize(config: N8nConnectionConfig) {
    this.client = new N8nClient(config);
  }

  /**
   * Register a workflow for specific events
   */
  registerWorkflow(workflow: N8nWorkflowConfig) {
    this.workflows.set(workflow.id, workflow);
  }

  /**
   * Unregister a workflow
   */
  unregisterWorkflow(workflowId: string) {
    this.workflows.delete(workflowId);
  }

  /**
   * Get all registered workflows
   */
  getWorkflows(): N8nWorkflowConfig[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Trigger workflows for a specific event
   */
  async triggerEvent(event: N8nEventType, data: N8nTriggerData) {
    if (!this.client) {
      console.error('n8n client not initialized');
      return;
    }

    // Find workflows subscribed to this event
    const subscribedWorkflows = Array.from(this.workflows.values())
      .filter(workflow => workflow.active && workflow.events.includes(event));

    // Trigger each workflow
    const results = await Promise.allSettled(
      subscribedWorkflows.map(workflow => 
        this.triggerWorkflow(workflow, event, data)
      )
    );

    // Log results
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Failed to trigger workflow ${subscribedWorkflows[index].name}:`,
          result.reason
        );
      }
    });
  }

  /**
   * Trigger a specific workflow
   */
  private async triggerWorkflow(
    workflow: N8nWorkflowConfig,
    event: N8nEventType,
    data: N8nTriggerData
  ) {
    if (!this.client) {
      throw new Error('n8n client not initialized');
    }

    const payload: N8nWebhookPayload = {
      workflowId: workflow.id,
      workflowName: workflow.name,
      executionId: `${workflow.id}-${Date.now()}`,
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    // Extract webhook path from URL
    const webhookPath = workflow.webhookUrl.split('/webhook/').pop() || '';
    
    return this.client.triggerWebhook(webhookPath, payload);
  }

  /**
   * Content lifecycle events
   */
  async onContentCreated(content: Content) {
    await this.triggerEvent(N8nEventType.CONTENT_CREATED, {
      content: {
        id: content.id,
        title: content.title,
        content: content.content,
        status: content.status,
      }
    });
  }

  async onContentUpdated(content: Content) {
    await this.triggerEvent(N8nEventType.CONTENT_UPDATED, {
      content: {
        id: content.id,
        title: content.title,
        content: content.content,
        status: content.status,
      }
    });
  }

  async onContentPublished(content: Content) {
    await this.triggerEvent(N8nEventType.CONTENT_PUBLISHED, {
      content: {
        id: content.id,
        title: content.title,
        content: content.content,
        status: content.status,
      }
    });
  }

  /**
   * Social media post events
   */
  async onPostPublished(post: SocialPost) {
    // SocialPost has platforms array, so we'll trigger event for each platform
    for (const platformContent of post.platforms) {
      await this.triggerEvent(N8nEventType.POST_PUBLISHED, {
        post: {
          id: post.id,
          platform: platformContent.platform,
          content: platformContent.text,
          publishedAt: post.publishedAt,
          metrics: {
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
          }
        }
      });
    }
  }

  async onPostFailed(post: SocialPost, error: string) {
    // Trigger event for all platforms since we don't know which one failed
    for (const platformContent of post.platforms) {
      await this.triggerEvent(N8nEventType.POST_FAILED, {
        post: {
          id: post.id,
          platform: platformContent.platform,
          content: platformContent.text,
          scheduledAt: post.scheduledAt,
        },
        custom: { error }
      });
    }
  }

  async onPostScheduled(post: any) {
    // This receives a different structure from the API route, not a SocialPost
    await this.triggerEvent(N8nEventType.POST_SCHEDULED, {
      post: {
        id: post.id,
        platform: post.platform,
        content: post.content,
        scheduledAt: post.scheduledFor,
      }
    });
  }

  /**
   * Analytics events
   */
  async onAnalyticsUpdated(platform: string, metrics: any) {
    await this.triggerEvent(N8nEventType.ANALYTICS_UPDATED, {
      analytics: {
        platform,
        period: 'daily',
        metrics: {
          engagement: metrics.engagement || 0,
          reach: metrics.reach || 0,
          followers: metrics.followers || 0,
          growth: metrics.growth || 0,
        }
      }
    });
  }

  async onEngagementThreshold(platform: string, threshold: number, current: number) {
    await this.triggerEvent(N8nEventType.ENGAGEMENT_THRESHOLD, {
      analytics: {
        platform,
        period: 'realtime',
        metrics: {
          engagement: current,
          reach: 0,
          followers: 0,
          growth: 0,
        }
      },
      custom: {
        threshold,
        exceeded: current > threshold,
      }
    });
  }

  /**
   * Custom event trigger
   */
  async triggerCustomEvent(eventName: string, data: any) {
    await this.triggerEvent(N8nEventType.CUSTOM, {
      custom: {
        eventName,
        ...data,
      }
    });
  }

  /**
   * Test connection to n8n
   */
  async testConnection(webhookPath: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('n8n client not initialized');
    }
    
    return this.client.testWebhookConnection(webhookPath);
  }
}

// Singleton instance
export const n8nService = new N8nService();