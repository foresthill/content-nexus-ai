import { NextRequest, NextResponse } from 'next/server';
import { OpenrouterClient } from '@/lib/openrouter/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, model } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!apiKey.startsWith('sk-or-')) {
      return NextResponse.json(
        { error: 'Invalid Openrouter API key format' },
        { status: 400 }
      );
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
    console.error('Openrouter connection test error:', error);

    let errorMessage = 'Connection test failed';
    let statusCode = 500;

    if (error.message?.includes('401')) {
      errorMessage = 'Invalid API key';
      statusCode = 401;
    } else if (error.message?.includes('403')) {
      errorMessage = 'API key does not have sufficient permissions';
      statusCode = 403;
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
        details: error.message || 'Unknown error occurred'
      },
      { status: statusCode }
    );
  }
}