import {
  DifyConfig,
  DifyChatRequest,
  DifyChatResponse,
  DifyWorkflowRequest,
  DifyWorkflowResponse,
  DifyCompletionRequest,
  DifyCompletionResponse,
  DifyFileUploadResponse,
  DifyError
} from '@/types/dify';

export class DifyClient {
  private config: DifyConfig;

  constructor(config: DifyConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: DifyError = {
        code: `HTTP_${response.status}`,
        message: response.statusText,
        status: response.status,
      };

      try {
        const errorData = await response.json();
        if (errorData.message) {
          error.message = errorData.message;
        }
        if (errorData.code) {
          error.code = errorData.code;
        }
      } catch {
        // Use default error if JSON parsing fails
      }

      throw error;
    }

    return response.json();
  }

  // Chat API
  async chat(request: DifyChatRequest): Promise<DifyChatResponse> {
    return this.request<DifyChatResponse>('/chat-messages', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Streaming Chat API
  async *chatStream(request: DifyChatRequest): AsyncGenerator<DifyChatResponse> {
    const response = await fetch(`${this.config.baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, response_mode: 'streaming' }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data) as DifyChatResponse;
            yield parsed;
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  }

  // Workflow API
  async runWorkflow(request: DifyWorkflowRequest): Promise<DifyWorkflowResponse> {
    return this.request<DifyWorkflowResponse>('/workflows/run', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Completion API
  async complete(request: DifyCompletionRequest): Promise<DifyCompletionResponse> {
    return this.request<DifyCompletionResponse>('/completion-messages', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // File Upload API
  async uploadFile(file: File | Blob): Promise<DifyFileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.config.baseUrl}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Stop Chat
  async stopChat(taskId: string): Promise<void> {
    await this.request(`/chat-messages/${taskId}/stop`, {
      method: 'POST',
    });
  }

  // Get Conversations
  async getConversations(user: string, limit = 20, lastId?: string) {
    const params = new URLSearchParams({
      user,
      limit: limit.toString(),
    });
    if (lastId) params.append('last_id', lastId);

    return this.request(`/conversations?${params.toString()}`);
  }

  // Get Messages
  async getMessages(conversationId: string, user: string, limit = 20, firstId?: string) {
    const params = new URLSearchParams({
      user,
      limit: limit.toString(),
    });
    if (firstId) params.append('first_id', firstId);

    return this.request(`/messages?conversation_id=${conversationId}&${params.toString()}`);
  }

  // Submit Feedback
  async submitFeedback(messageId: string, rating: 'like' | 'dislike', user: string) {
    return this.request(`/messages/${messageId}/feedbacks`, {
      method: 'POST',
      body: JSON.stringify({ rating, user }),
    });
  }
}