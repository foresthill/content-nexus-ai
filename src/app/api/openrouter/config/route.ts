import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface OpenrouterConfig {
  apiKey: string;
  model: string;
  isConfigured: boolean;
}

// 設定を取得
export async function GET() {
  try {
    const cookieStore = await cookies();
    const configCookie = cookieStore.get('openrouter-config');
    
    if (!configCookie) {
      return NextResponse.json({
        apiKey: '',
        model: 'anthropic/claude-3-sonnet:beta',
        isConfigured: false,
      });
    }

    const config: OpenrouterConfig = JSON.parse(configCookie.value);
    
    // APIキーは部分的にマスク
    const maskedApiKey = config.apiKey 
      ? `${config.apiKey.substring(0, 8)}${'*'.repeat(20)}`
      : '';

    return NextResponse.json({
      apiKey: maskedApiKey,
      model: config.model,
      isConfigured: config.isConfigured,
    });
  } catch (error) {
    console.error('Openrouter config GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}

// 設定を保存
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, model } = body;

    if (!apiKey || !apiKey.startsWith('sk-or-')) {
      return NextResponse.json(
        { error: 'Valid Openrouter API key is required' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { error: 'Model selection is required' },
        { status: 400 }
      );
    }

    const config: OpenrouterConfig = {
      apiKey,
      model,
      isConfigured: true,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Configuration saved successfully',
    });

    // HTTPOnlyクッキーに設定を保存（セキュア）
    response.cookies.set('openrouter-config', JSON.stringify(config), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30日
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Openrouter config POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

// 設定を削除
export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Configuration deleted successfully',
    });

    response.cookies.delete('openrouter-config');

    return response;
  } catch (error) {
    console.error('Openrouter config DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}