import { NextRequest, NextResponse } from 'next/server';
import { DifyKnowledgeService } from '@/lib/dify/knowledge-service';
import { getDifyConfig } from '@/lib/dify/config';

// GET: ナレッジベース一覧の取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Dify設定を取得
    const difyConfig = await getDifyConfig();

    // データセットAPIキーを優先的に使用
    const apiKey = difyConfig?.datasetApiKey || difyConfig?.apiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません。データセットAPI Keyを設定してください。' },
        { status: 401 }
      );
    }

    const knowledgeService = new DifyKnowledgeService({
      apiKey: apiKey,
      baseUrl: difyConfig.baseUrl,
    });

    const result = await knowledgeService.listDatasets(page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Knowledge fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ナレッジベースの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 新しいナレッジベースの作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, indexing_technique, permission } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name パラメータが必要です' },
        { status: 400 }
      );
    }

    // Dify設定を取得
    const difyConfig = await getDifyConfig();

    // データセットAPIキーを優先的に使用
    const apiKey = difyConfig?.datasetApiKey || difyConfig?.apiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません。データセットAPI Keyを設定してください。' },
        { status: 401 }
      );
    }

    const knowledgeService = new DifyKnowledgeService({
      apiKey: apiKey,
      baseUrl: difyConfig.baseUrl,
    });

    const dataset = await knowledgeService.createDataset({
      name,
      description,
      indexing_technique,
      permission,
    });

    return NextResponse.json({
      success: true,
      dataset,
    });
  } catch (error) {
    console.error('Knowledge creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ナレッジベースの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: ナレッジベースの削除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const datasetId = searchParams.get('id');

    if (!datasetId) {
      return NextResponse.json(
        { error: 'id パラメータが必要です' },
        { status: 400 }
      );
    }

    // Dify設定を取得
    const difyConfig = await getDifyConfig();

    // データセットAPIキーを優先的に使用
    const apiKey = difyConfig?.datasetApiKey || difyConfig?.apiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません。データセットAPI Keyを設定してください。' },
        { status: 401 }
      );
    }

    const knowledgeService = new DifyKnowledgeService({
      apiKey: apiKey,
      baseUrl: difyConfig.baseUrl,
    });

    await knowledgeService.deleteDataset(datasetId);

    return NextResponse.json({
      success: true,
      message: `ナレッジベース ${datasetId} を削除しました`,
    });
  } catch (error) {
    console.error('Knowledge deletion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ナレッジベースの削除に失敗しました' },
      { status: 500 }
    );
  }
}
