import { NextRequest, NextResponse } from 'next/server';
import { DifyService } from '@/lib/dify/service';
import { getDifyConfig } from '@/lib/dify/config';

// ナレッジの型定義
interface DifyKnowledge {
  id: string;
  name: string;
  description?: string;
  type: 'text' | 'file' | 'url';
  content?: string;
  fileUrl?: string;
  url?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// GET: ナレッジ一覧の取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const knowledgeId = searchParams.get('id');
    
    // Dify設定を取得
    const difyConfig = await getDifyConfig();
    
    if (!difyConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません' },
        { status: 401 }
      );
    }

    // 現在のところ、Difyは直接的なナレッジ管理APIを提供していないため、
    // ローカルストレージまたはデータベースで管理し、
    // ワークフロー実行時に参照する形になります
    
    // モックデータを返す（実際の実装では、データベースから取得）
    const mockKnowledgeList: DifyKnowledge[] = [
      {
        id: '1',
        name: 'マーケティング基礎知識',
        description: 'デジタルマーケティングの基本的な概念と戦略',
        type: 'text',
        content: 'デジタルマーケティングは...',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: '製品仕様書',
        description: '当社製品の詳細な仕様と特徴',
        type: 'file',
        fileUrl: '/knowledge/product-spec.pdf',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    if (knowledgeId) {
      const knowledge = mockKnowledgeList.find(k => k.id === knowledgeId);
      if (!knowledge) {
        return NextResponse.json(
          { error: 'ナレッジが見つかりません' },
          { status: 404 }
        );
      }
      return NextResponse.json(knowledge);
    }

    return NextResponse.json({
      knowledgeList: mockKnowledgeList,
      total: mockKnowledgeList.length,
    });

  } catch (error) {
    console.error('Knowledge fetch error:', error);
    return NextResponse.json(
      { error: 'ナレッジの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 新しいナレッジの追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, content, fileUrl, url, metadata } = body;

    // 必須パラメータのチェック
    if (!name || !type) {
      return NextResponse.json(
        { error: 'name と type パラメータが必要です' },
        { status: 400 }
      );
    }

    // タイプ別の必須フィールドチェック
    if (type === 'text' && !content) {
      return NextResponse.json(
        { error: 'text タイプの場合、content が必要です' },
        { status: 400 }
      );
    }
    if (type === 'file' && !fileUrl) {
      return NextResponse.json(
        { error: 'file タイプの場合、fileUrl が必要です' },
        { status: 400 }
      );
    }
    if (type === 'url' && !url) {
      return NextResponse.json(
        { error: 'url タイプの場合、url が必要です' },
        { status: 400 }
      );
    }

    // Dify設定を取得
    const difyConfig = await getDifyConfig();
    
    if (!difyConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません' },
        { status: 401 }
      );
    }

    // 新しいナレッジを作成（実際の実装では、データベースに保存）
    const newKnowledge: DifyKnowledge = {
      id: Date.now().toString(),
      name,
      description,
      type,
      content,
      fileUrl,
      url,
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: データベースに保存
    // await saveKnowledgeToDatabase(newKnowledge);

    return NextResponse.json({
      success: true,
      knowledge: newKnowledge,
    });

  } catch (error) {
    console.error('Knowledge creation error:', error);
    return NextResponse.json(
      { error: 'ナレッジの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: ナレッジの更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, content, fileUrl, url, metadata } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id パラメータが必要です' },
        { status: 400 }
      );
    }

    // TODO: データベースから既存のナレッジを取得して更新
    const updatedKnowledge: Partial<DifyKnowledge> = {
      id,
      name,
      description,
      content,
      fileUrl,
      url,
      metadata,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      knowledge: updatedKnowledge,
    });

  } catch (error) {
    console.error('Knowledge update error:', error);
    return NextResponse.json(
      { error: 'ナレッジの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: ナレッジの削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const knowledgeId = searchParams.get('id');

    if (!knowledgeId) {
      return NextResponse.json(
        { error: 'id パラメータが必要です' },
        { status: 400 }
      );
    }

    // TODO: データベースからナレッジを削除
    // await deleteKnowledgeFromDatabase(knowledgeId);

    return NextResponse.json({
      success: true,
      message: `ナレッジ ${knowledgeId} を削除しました`,
    });

  } catch (error) {
    console.error('Knowledge deletion error:', error);
    return NextResponse.json(
      { error: 'ナレッジの削除に失敗しました' },
      { status: 500 }
    );
  }
}