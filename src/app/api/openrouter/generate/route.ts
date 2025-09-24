import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OpenrouterClient } from '@/lib/openrouter/client';

interface GenerateRequest {
  prompt: string;
  type: 'blog' | 'social' | 'general';
  options?: {
    tone?: string;
    length?: string;
    language?: string;
    keywords?: string[];
    model?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // リクエスト本文を解析
    const body: GenerateRequest = await request.json();
    const { prompt, type, options = {} } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // 設定をクッキーから取得
    const cookieStore = await cookies();
    const configCookie = cookieStore.get('openrouter-config');

    if (!configCookie) {
      return NextResponse.json(
        { error: 'Openrouter API not configured. Please configure in settings first.' },
        { status: 400 }
      );
    }

    const config = JSON.parse(configCookie.value);
    if (!config.apiKey || !config.isConfigured) {
      return NextResponse.json(
        { error: 'Openrouter API key not configured' },
        { status: 400 }
      );
    }

    // Openrouterクライアントを初期化
    const client = new OpenrouterClient(config.apiKey);
    const model = options.model || config.model;

    let result: any;

    // タイプに応じて異なる生成を実行
    if (type === 'blog') {
      result = await client.generateBlogPost(prompt, {
        model,
        tone: options.tone || 'professional',
        length: options.length || 'medium',
        keywords: options.keywords || [],
      });

      return NextResponse.json({
        success: true,
        type: 'blog',
        data: {
          title: result.title,
          content: result.content,
          summary: result.summary,
          keywords: result.keywords,
          metaDescription: result.metaDescription,
          metadata: {
            model,
            timestamp: new Date().toISOString(),
            wordCount: result.content.split(' ').length,
            characterCount: result.content.length,
          },
        },
      });

    } else if (type === 'social') {
      // SNS投稿用の生成
      const languageInstructions = {
        ja: '日本語で書いてください。',
        en: 'Write in English.',
        zh: '请用中文写。',
        ko: '한국어로 작성해주세요.',
        es: 'Escribe en español.',
        fr: 'Écris en français.',
        de: 'Schreibe auf Deutsch.'
      };

      const languageInstruction = languageInstructions[options.language as keyof typeof languageInstructions] || languageInstructions.ja;

      const systemPrompt = `You are a social media expert. Create engaging, platform-optimized content that drives engagement. Keep it concise and impactful. ${languageInstruction}`;

      const socialPrompt = `Create a social media post about: ${prompt}

Requirements:
- ${languageInstruction}
- Engaging and shareable content
- Include relevant hashtags (3-5)
- Keep it under 280 characters for Twitter compatibility
- Use emojis appropriately
- Include a call-to-action

${options.tone ? `Tone: ${options.tone}` : ''}
${options.keywords?.length ? `Keywords to include: ${options.keywords.join(', ')}` : ''}`;

      const content = await client.generateContent(socialPrompt, {
        model,
        systemPrompt,
        temperature: 0.8,
        maxTokens: 500,
      });

      return NextResponse.json({
        success: true,
        type: 'social',
        data: {
          content: content.trim(),
          characterCount: content.length,
          hashtags: extractHashtags(content),
          metadata: {
            model,
            timestamp: new Date().toISOString(),
            platform: 'universal',
          },
        },
      });

    } else {
      // 一般的なコンテンツ生成
      const languageInstructions = {
        ja: 'あなたの応答は日本語でお願いします。',
        en: 'Please respond in English.',
        zh: '请用中文回复。',
        ko: '한국어로 답변해주세요.',
        es: 'Por favor responde en español.',
        fr: 'Veuillez répondre en français.',
        de: 'Bitte antworten Sie auf Deutsch.'
      };

      const languageInstruction = languageInstructions[options.language as keyof typeof languageInstructions] || languageInstructions.ja;

      const systemPrompt = options.tone
        ? `You are a helpful AI assistant. Respond in a ${options.tone} tone. ${languageInstruction}`
        : `You are a helpful AI assistant that provides clear and informative responses. ${languageInstruction}`;

      const enhancedPrompt = `${prompt}\n\nIMPORTANT: ${languageInstruction}`;

      const content = await client.generateContent(enhancedPrompt, {
        model,
        systemPrompt,
        temperature: 0.7,
        maxTokens: options.length === 'short' ? 500 : options.length === 'long' ? 2000 : 1000,
      });

      return NextResponse.json({
        success: true,
        type: 'general',
        data: {
          content: content.trim(),
          wordCount: content.split(' ').length,
          characterCount: content.length,
          metadata: {
            model,
            timestamp: new Date().toISOString(),
            prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
          },
        },
      });
    }

  } catch (error: any) {
    console.error('Openrouter generate error:', error);

    let errorMessage = 'Content generation failed';
    let statusCode = 500;

    if (error.message?.includes('401')) {
      errorMessage = 'API key is invalid or expired';
      statusCode = 401;
    } else if (error.message?.includes('429')) {
      errorMessage = 'Rate limit exceeded. Please try again later';
      statusCode = 429;
    } else if (error.message?.includes('context_length')) {
      errorMessage = 'Prompt is too long for the selected model';
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}

// ハッシュタグを抽出するヘルパー関数
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? [...new Set(matches)] : [];
}