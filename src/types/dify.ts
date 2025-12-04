// Dify API Types

// Base Types
export type DifyModel = 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-opus' | 'claude-3-sonnet' | string;

export interface DifyConfig {
  apiKey: string;
  baseUrl: string;
  appId?: string;
  datasetApiKey?: string; // Knowledge Base API用のデータセットAPIキー
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

// Knowledge Base Types
export interface DifyDataset {
  id: string;
  name: string;
  description: string;
  permission: 'only_me' | 'all_team_members';
  data_source_type: 'upload_file' | 'notion_import' | 'website_crawl';
  indexing_technique: 'high_quality' | 'economy';
  app_count: number;
  document_count: number;
  word_count: number;
  created_by: string;
  created_at: number;
  updated_by: string;
  updated_at: number;
  embedding_model: string;
  embedding_model_provider: string;
  embedding_available: boolean;
}

export interface DifyDatasetListResponse {
  data: DifyDataset[];
  has_more: boolean;
  limit: number;
  total: number;
  page: number;
}

export interface DifyDocument {
  id: string;
  position: number;
  data_source_type: 'upload_file' | 'notion_import' | 'website_crawl';
  data_source_info: {
    upload_file_id?: string;
    notion_page_id?: string;
    url?: string;
  };
  dataset_process_rule_id: string;
  name: string;
  created_from: string;
  created_by: string;
  created_at: number;
  tokens: number;
  indexing_status: 'waiting' | 'parsing' | 'cleaning' | 'splitting' | 'indexing' | 'paused' | 'error' | 'completed';
  error?: string;
  enabled: boolean;
  disabled_at?: number;
  disabled_by?: string;
  archived: boolean;
  display_status: string;
  word_count: number;
  hit_count: number;
  doc_form: 'text_model' | 'qa_model';
}

export interface DifyDocumentListResponse {
  data: DifyDocument[];
  has_more: boolean;
  limit: number;
  total: number;
  page: number;
}

export interface DifySegment {
  id: string;
  position: number;
  document_id: string;
  content: string;
  answer?: string;
  word_count: number;
  tokens: number;
  keywords: string[];
  index_node_id: string;
  index_node_hash: string;
  hit_count: number;
  enabled: boolean;
  disabled_at?: number;
  disabled_by?: string;
  status: 'waiting' | 'completed' | 'error' | 'indexing';
  created_by: string;
  created_at: number;
  indexing_at?: number;
  completed_at?: number;
  error?: string;
  stopped_at?: number;
}

export interface DifySegmentListResponse {
  data: DifySegment[];
  has_more: boolean;
  limit: number;
  total: number;
}

export interface DifyCreateDatasetRequest {
  name: string;
  description?: string;
  indexing_technique?: 'high_quality' | 'economy';
  permission?: 'only_me' | 'all_team_members';
}

export interface DifyCreateDocumentRequest {
  name: string;
  text: string;
  indexing_technique?: 'high_quality' | 'economy';
  process_rule?: {
    mode: 'automatic' | 'custom';
    rules?: {
      pre_processing_rules?: Array<{
        id: string;
        enabled: boolean;
      }>;
      segmentation?: {
        separator: string;
        max_tokens: number;
      };
    };
  };
}

export interface DifyCreateSegmentRequest {
  segments: Array<{
    content: string;
    answer?: string;
    keywords?: string[];
  }>;
}

export interface DifyRetrievalRequest {
  query: string;
  retrieval_model?: {
    search_method: 'keyword_search' | 'semantic_search' | 'full_text_search' | 'hybrid_search';
    reranking_enable?: boolean;
    reranking_model?: {
      reranking_provider_name: string;
      reranking_model_name: string;
    };
    top_k?: number;
    score_threshold_enabled?: boolean;
    score_threshold?: number;
  };
}

export interface DifyRetrievalResponse {
  query: {
    content: string;
  };
  records: Array<{
    segment: DifySegment;
    score: number;
    tsne_position?: {
      x: number;
      y: number;
    };
  }>;
}