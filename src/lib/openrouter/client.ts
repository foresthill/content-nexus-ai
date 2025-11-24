interface OpenrouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenrouterChatRequest {
  model: string;
  messages: OpenrouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface OpenrouterChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenrouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens?: number;
  };
}

export class OpenrouterClient {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(request: OpenrouterChatRequest): Promise<OpenrouterChatResponse> {
    // デバッグログ
    console.log('OpenRouter API Request:', {
      url: `${this.baseUrl}/chat/completions`,
      apiKey: this.apiKey ? 'Set' : 'Not set',
      model: request.model,
    });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
        'X-Title': 'ContentNexus AI',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage = response.statusText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      console.error('OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        headers: Object.fromEntries(response.headers.entries()),
      });
      throw new Error(`Openrouter API error: ${response.status} - ${errorMessage}`);
    }

    return response.json();
  }

  async getModels(): Promise<{ data: OpenrouterModel[] }> {
    const response = await fetch(`${this.baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Failed to fetch models: ${response.status} - ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async testConnection(model: string = 'openai/gpt-3.5-turbo'): Promise<{ success: true; model: string }> {
    const testRequest: OpenrouterChatRequest = {
      model,
      messages: [
        {
          role: 'user',
          content: 'Hello! Please respond with just "Connection successful" to test the API.'
        }
      ],
      max_tokens: 50,
      temperature: 0.1,
    };

    const response = await this.chat(testRequest);
    
    if (response.choices && response.choices.length > 0) {
      return {
        success: true,
        model: response.model,
      };
    }

    throw new Error('Unexpected response format');
  }

  // コンテンツ生成用の便利メソッド
  async generateContent(prompt: string, options: {
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}): Promise<string> {
    const {
      model = 'anthropic/claude-3-sonnet:beta',
      systemPrompt = 'You are a helpful AI assistant that creates high-quality content.',
      temperature = 0.7,
      maxTokens = 2000,
    } = options;

    const messages: OpenrouterMessage[] = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const request: OpenrouterChatRequest = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    const response = await this.chat(request);

    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message.content;
    }

    throw new Error('No content generated');
  }

  // ブログ記事生成
  async generateBlogPost(topic: string, options: {
    model?: string;
    tone?: string;
    length?: string;
    keywords?: string[];
  } = {}): Promise<{
    title: string;
    content: string;
    summary: string;
    keywords: string[];
    metaDescription: string;
  }> {
    const {
      model = 'anthropic/claude-3-sonnet:beta',
      tone = 'professional',
      length = 'medium',
      keywords = [],
    } = options;

    const keywordText = keywords.length > 0 ? `\nInclude these keywords naturally: ${keywords.join(', ')}` : '';
    
    const prompt = `Write a ${length} blog post about "${topic}" in a ${tone} tone.

${keywordText}

Please format your response as JSON with the following structure:
{
  "title": "Blog post title",
  "content": "Full blog post content in markdown format",
  "summary": "Brief summary of the post",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "metaDescription": "SEO-friendly meta description (150-160 characters)"
}

Make sure the content is well-structured with headings, subheadings, and engaging content.`;

    const systemPrompt = `You are an expert content writer specializing in creating engaging, SEO-optimized blog posts. Always respond with valid JSON format.`;

    const content = await this.generateContent(prompt, {
      model,
      systemPrompt,
      temperature: 0.8,
      maxTokens: 3000,
    });

    try {
      return JSON.parse(content);
    } catch (error) {
      // JSONパースに失敗した場合は、テキストから必要な情報を抽出
      const lines = content.split('\n');
      const title = lines.find(line => line.includes('title') || line.startsWith('#'))?.replace(/[#"]/g, '').trim() || topic;
      
      return {
        title,
        content: content,
        summary: content.substring(0, 200) + '...',
        keywords: keywords,
        metaDescription: content.substring(0, 150) + '...',
      };
    }
  }
}