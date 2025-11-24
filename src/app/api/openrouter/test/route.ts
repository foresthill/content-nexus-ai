import { NextRequest, NextResponse } from 'next/server';
import { OpenrouterClient } from '@/lib/openrouter/client';

export async function POST(request: NextRequest) {
  let body: any = null;

  try {
    body = await request.json();
    const { apiKey, model } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // OpenRouter API Keyの形式チェック（sk-or-v1-などの形式に対応）
    if (!apiKey.startsWith('sk-or-') && !apiKey.startsWith('sk-') && apiKey.length < 32) {
      console.warn('Potentially invalid Openrouter API key format:', apiKey.substring(0, 10) + '...');
      // 警告のみで、処理は続行
    }

    // Openrouterクライアントで接続テスト
    const client = new OpenrouterClient(apiKey);
    const result = await client.testConnection(model);

    return NextResponse.json({
      success: true,
      message: 'Connection successful',
      model: result.model,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Openrouter connection test error:', {
      message: error.message,
      stack: error.stack,
      body: body,
    });

    let errorMessage = 'Connection test failed';
    let statusCode = 500;

    if (error.message?.includes('401')) {
      errorMessage = 'Invalid API key. Please check your OpenRouter API key.';
      statusCode = 401;
    } else if (error.message?.includes('403')) {
      errorMessage = 'API key does not have sufficient permissions';
      statusCode = 403;
    } else if (error.message?.includes('404')) {
      errorMessage = 'API endpoint not found. This might be due to an invalid model or endpoint issue.';
      statusCode = 404;
    } else if (error.message?.includes('429')) {
      errorMessage = 'Rate limit exceeded. Please try again later';
      statusCode = 429;
    } else if (error.message?.includes('model')) {
      errorMessage = 'Selected model is not available';
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message || 'Unknown error occurred',
        debug: {
          apiKeyPrefix: body?.apiKey?.substring(0, 10),
          model: body?.model,
        }
      },
      { status: statusCode }
    );
  }
}