export interface N8nWebhookPayload {
  workflowId: string;
  workflowName: string;
  executionId: string;
  event: N8nEventType;
  data: any;
  timestamp: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

export enum N8nEventType {
  // Content Events
  CONTENT_CREATED = 'content.created',
  CONTENT_UPDATED = 'content.updated',
  CONTENT_PUBLISHED = 'content.published',
  CONTENT_SCHEDULED = 'content.scheduled',
  
  // Social Media Events
  POST_PUBLISHED = 'post.published',
  POST_FAILED = 'post.failed',
  POST_SCHEDULED = 'post.scheduled',
  
  // Analytics Events
  ANALYTICS_UPDATED = 'analytics.updated',
  ENGAGEMENT_THRESHOLD = 'engagement.threshold',
  
  // Workflow Events
  WORKFLOW_TRIGGERED = 'workflow.triggered',
  WORKFLOW_COMPLETED = 'workflow.completed',
  WORKFLOW_FAILED = 'workflow.failed',
  
  // Custom Events
  CUSTOM = 'custom'
}

export interface N8nWorkflowConfig {
  id: string;
  name: string;
  webhookUrl: string;
  description?: string;
  events: N8nEventType[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface N8nTriggerData {
  content?: {
    id: string;
    title: string;
    content: string;
    platform?: string;
    status?: string;
  };
  post?: {
    id: string;
    platform: string;
    content: string;
    mediaUrls?: string[];
    scheduledAt?: Date;
    publishedAt?: Date;
    metrics?: {
      likes: number;
      comments: number;
      shares: number;
      views: number;
    };
  };
  analytics?: {
    platform: string;
    period: string;
    metrics: {
      engagement: number;
      reach: number;
      followers: number;
      growth: number;
    };
  };
  custom?: Record<string, any>;
}

export interface N8nResponse {
  success: boolean;
  executionId?: string;
  workflowId?: string;
  data?: any;
  error?: string;
}

export interface N8nConnectionConfig {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
  timeout?: number;
}

export interface N8nWorkflowTrigger {
  type: 'webhook' | 'schedule' | 'manual';
  url?: string;
  schedule?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  authentication?: {
    type: 'none' | 'basic' | 'header' | 'query';
    credentials?: {
      headerName?: string;
      headerValue?: string;
      username?: string;
      password?: string;
    };
  };
}