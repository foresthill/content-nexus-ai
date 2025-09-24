import { NextRequest, NextResponse } from 'next/server';
import { ContentService } from '@/lib/content/content-service';
import { ContentStatus } from '@prisma/client';

interface SaveContentRequest {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  metadata?: any;
}

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

    // テスト用のデフォルトユーザーID (実際にはログイン機能から取得)
    const defaultUserId = 'dify-user-001';

    // コンテンツを作成
    const content = await ContentService.createContent({
      userId: defaultUserId,
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      tags: body.tags || [],
      metadata: {
        ...body.metadata,
        source: 'dify',
        generatedAt: new Date().toISOString(),
      },
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