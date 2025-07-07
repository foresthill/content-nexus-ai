// Dify API Types

// Base Types
export type DifyModel = 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-opus' | 'claude-3-sonnet' | string;

export interface DifyConfig {
  apiKey: string;
  baseUrl: string;
  appId?: string;
}

// Chat Types
export interface DifyChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DifyChatRequest {
  query: string;
  inputs?: Record<string, any>;
  response_mode?: 'streaming' | 'blocking';
  user?: string;
  conversation_id?: string;
  files?: DifyFile[];
}

export interface DifyChatResponse {
  event: 'message' | 'agent_message' | 'agent_thought' | 'message_end' | 'error';
  message_id: string;
  conversation_id: string;
  answer?: string;
  created_at?: number;
  metadata?: {
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

// Workflow Types
export interface DifyWorkflowRequest {
  inputs: Record<string, any>;
  response_mode?: 'streaming' | 'blocking';
  user?: string;
}

export interface DifyWorkflowResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: 'running' | 'succeeded' | 'failed' | 'stopped';
    outputs?: Record<string, any>;
    error?: string;
    elapsed_time?: number;
    total_steps?: number;
    created_at: number;
    finished_at?: number;
  };
}

// Completion Types
export interface DifyCompletionRequest {
  inputs: Record<string, any>;
  response_mode?: 'streaming' | 'blocking';
  user?: string;
  files?: DifyFile[];
}

export interface DifyCompletionResponse {
  id: string;
  answer: string;
  created_at: number;
  metadata?: {
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

// File Types
export interface DifyFile {
  type: 'image' | 'document';
  transfer_method: 'remote_url' | 'local_file';
  url?: string;
  upload_file_id?: string;
}

export interface DifyFileUploadResponse {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_by: string;
  created_at: number;
}

// Application Types
export interface DifyApplication {
  id: string;
  name: string;
  description?: string;
  mode: 'chat' | 'completion' | 'workflow';
  icon?: string;
  icon_background?: string;
}

// Error Types
export interface DifyError {
  code: string;
  message: string;
  status?: number;
}

// Integration Types for Content Nexus
export interface DifyContentImprovement {
  originalContent: string;
  improvedContent: string;
  suggestions: string[];
  confidence: number;
  model: DifyModel;
}

export interface DifyContentGeneration {
  prompt: string;
  generatedContent: string;
  metadata: {
    model: DifyModel;
    tokens: number;
    duration: number;
  };
}

export interface DifyAnalysisResult {
  content: string;
  analysis: {
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords: string[];
    summary: string;
    topics: string[];
    readabilityScore: number;
  };
}