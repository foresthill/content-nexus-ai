import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, baseUrl } = body;

    if (!apiKey || !baseUrl) {
      return NextResponse.json(
        { error: 'API Key and Base URL are required' },
        { status: 400 }
      );
    }

    // URLの正規化
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // まず、アプリケーションのメタ情報を取得して接続テスト
    const testUrl = `${normalizedBaseUrl}/meta`;

    // Dify APIへの接続テスト
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ 
        success: true, 
        message: 'Connection successful',
        data 
      });
    } else {
      const errorText = await response.text();
      let errorMessage = `Connection failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // テキストレスポンスの場合はそのまま使用
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          status: response.status 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Dify connection test error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Connection test failed',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}