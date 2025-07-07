import { DifyClient } from './client';
import {
  DifyConfig,
  DifyContentImprovement,
  DifyContentGeneration,
  DifyAnalysisResult,
  DifyChatMessage,
  DifyWorkflowRequest,
} from '@/types/dify';

export class DifyService {
  client: DifyClient; // publicに変更してAPIから直接アクセス可能に

  constructor(config: DifyConfig) {
    this.client = new DifyClient(config);
  }

  // Content Improvement using Dify
  async improveContent(content: string, options?: {
    tone?: 'professional' | 'casual' | 'friendly';
    platform?: string;
    targetAudience?: string;
  }): Promise<DifyContentImprovement> {
    const prompt = this.buildContentImprovementPrompt(content, options);
    
    const response = await this.client.chat({
      query: prompt,
      user: 'content-nexus',
    });

    return {
      originalContent: content,
      improvedContent: response.answer || content,
      suggestions: this.extractSuggestions(response.answer || ''),
      confidence: 0.85, // This could be calculated based on response metadata
      model: 'gpt-4', // This should come from response metadata
    };
  }

  // Generate Content using Dify
  async generateContent(
    topic: string,
    options?: {
      length?: 'short' | 'medium' | 'long';
      style?: string;
      keywords?: string[];
    }
  ): Promise<DifyContentGeneration> {
    const prompt = this.buildContentGenerationPrompt(topic, options);
    const startTime = Date.now();

    const response = await this.client.complete({
      inputs: {
        prompt,
        topic,
        keywords: options?.keywords?.join(', ') || '',
      },
      user: 'content-nexus',
    });

    return {
      prompt,
      generatedContent: response.answer,
      metadata: {
        model: 'gpt-4',
        tokens: response.metadata?.usage?.total_tokens || 0,
        duration: Date.now() - startTime,
      },
    };
  }

  // Analyze Content using Dify
  async analyzeContent(content: string): Promise<DifyAnalysisResult> {
    const response = await this.client.runWorkflow({
      inputs: {
        content,
        analysis_type: 'comprehensive',
      },
      user: 'content-nexus',
    });

    // Parse workflow output
    const outputs = response.data.outputs || {};
    
    return {
      content,
      analysis: {
        sentiment: outputs.sentiment || 'neutral',
        keywords: outputs.keywords || [],
        summary: outputs.summary || '',
        topics: outputs.topics || [],
        readabilityScore: outputs.readability_score || 0,
      },
    };
  }

  // Interactive Chat for Content Creation
  async *chatForContent(
    messages: DifyChatMessage[],
    context?: {
      projectId?: string;
      contentType?: string;
    }
  ): AsyncGenerator<string> {
    const systemMessage = this.buildSystemMessage(context);
    const conversationMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages,
    ];

    const stream = this.client.chatStream({
      query: messages[messages.length - 1].content,
      conversation_id: context?.projectId,
      user: 'content-nexus',
    });

    for await (const response of stream) {
      if (response.answer) {
        yield response.answer;
      }
    }
  }

  // Execute Custom Workflow
  async executeWorkflow(
    workflowId: string,
    inputs: Record<string, any>
  ) {
    return this.client.runWorkflow({
      inputs: {
        ...inputs,
        workflow_id: workflowId,
      },
      user: 'content-nexus',
    });
  }

  // Private helper methods
  private buildContentImprovementPrompt(
    content: string,
    options?: {
      tone?: string;
      platform?: string;
      targetAudience?: string;
    }
  ): string {
    let prompt = `Please improve the following content:\n\n${content}\n\n`;
    
    if (options?.tone) {
      prompt += `Tone: ${options.tone}\n`;
    }
    if (options?.platform) {
      prompt += `Platform: ${options.platform}\n`;
    }
    if (options?.targetAudience) {
      prompt += `Target Audience: ${options.targetAudience}\n`;
    }

    prompt += '\nProvide the improved version and explain the key changes made.';
    return prompt;
  }

  private buildContentGenerationPrompt(
    topic: string,
    options?: {
      length?: string;
      style?: string;
      keywords?: string[];
    }
  ): string {
    let prompt = `Generate content about: ${topic}\n\n`;
    
    if (options?.length) {
      const lengths = {
        short: '200-300 words',
        medium: '500-700 words',
        long: '1000+ words',
      };
      prompt += `Length: ${lengths[options.length as keyof typeof lengths] || options.length}\n`;
    }
    if (options?.style) {
      prompt += `Style: ${options.style}\n`;
    }
    if (options?.keywords?.length) {
      prompt += `Keywords to include: ${options.keywords.join(', ')}\n`;
    }

    return prompt;
  }

  private buildSystemMessage(context?: {
    projectId?: string;
    contentType?: string;
  }): string {
    let message = 'You are an AI assistant helping to create and improve content for Content Nexus AI platform.';
    
    if (context?.contentType) {
      message += ` The content type is ${context.contentType}.`;
    }
    if (context?.projectId) {
      message += ` This is for project ${context.projectId}.`;
    }

    message += ' Provide helpful, accurate, and creative assistance.';
    return message;
  }

  private extractSuggestions(response: string): string[] {
    // Simple extraction logic - could be improved with better parsing
    const suggestions: string[] = [];
    const lines = response.split('\n');
    
    let inSuggestions = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('suggestion') || line.toLowerCase().includes('improvement')) {
        inSuggestions = true;
        continue;
      }
      
      if (inSuggestions && line.trim().startsWith('-') || line.trim().startsWith('•')) {
        suggestions.push(line.trim().substring(1).trim());
      } else if (inSuggestions && line.trim() === '') {
        inSuggestions = false;
      }
    }

    return suggestions.length > 0 ? suggestions : ['Content has been improved'];
  }
}