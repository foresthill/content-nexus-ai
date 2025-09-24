import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface SaveContentRequest {
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  metadata?: any;
}

// インメモリストレージ (本番環境ではデータベースを使用)
const savedContents: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body: SaveContentRequest = await request.json();

    // バリデーション
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'タイトルとコンテンツは必須です' },
        { status: 400 }
      );
    }

    // コンテンツIDを生成
    const contentId = `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // コンテンツを保存（インメモリ）
    const content = {
      id: contentId,
      title: body.title,
      content: body.content,
      summary: body.summary || body.content.substring(0, 200) + '...',
      tags: body.tags || [],
      metadata: {
        ...body.metadata,
        source: 'openrouter',
        generatedAt: new Date().toISOString(),
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    savedContents.set(contentId, content);

    // クッキーに最新のコンテンツIDを保存（オプション）
    const cookieStore = await cookies();
    cookieStore.set('last-saved-content', contentId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7日間
    });

    console.log('Content saved successfully:', {
      id: content.id,
      title: content.title,
      status: content.status,
    });

    return NextResponse.json({
      success: true,
      content: {
        id: content.id,
        title: content.title,
        status: content.status,
        createdAt: content.createdAt,
      },
      message: 'コンテンツが正常に保存されました',
    });

  } catch (error) {
    console.error('Content save error:', error);

    return NextResponse.json(
      {
        error: 'コンテンツの保存に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}

// 保存されたコンテンツを取得（デバッグ用）
export async function GET(request: NextRequest) {
  const contentArray = Array.from(savedContents.values());

  return NextResponse.json({
    success: true,
    contents: contentArray,
    total: contentArray.length,
  });
}