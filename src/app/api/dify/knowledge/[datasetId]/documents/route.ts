import { NextRequest, NextResponse } from 'next/server';
import { DifyKnowledgeService } from '@/lib/dify/knowledge-service';
import { getDifyConfig } from '@/lib/dify/config';

// GET: ドキュメント一覧の取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ datasetId: string }> }
) {
  try {
    const { datasetId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const keyword = searchParams.get('keyword') || undefined;

    const difyConfig = await getDifyConfig();

    if (!difyConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません' },
        { status: 401 }
      );
    }

    const knowledgeService = new DifyKnowledgeService({
      apiKey: difyConfig.apiKey,
      baseUrl: difyConfig.baseUrl,
    });

    const result = await knowledgeService.listDocuments(datasetId, page, limit, keyword);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ドキュメントの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 新しいドキュメントの作成（テキスト）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ datasetId: string }> }
) {
  try {
    const { datasetId } = await params;
    const body = await request.json();
    const { name, text, indexing_technique, process_rule } = body;

    if (!name || !text) {
      return NextResponse.json(
        { error: 'name と text パラメータが必要です' },
        { status: 400 }
      );
    }

    const difyConfig = await getDifyConfig();

    if (!difyConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません' },
        { status: 401 }
      );
    }

    const knowledgeService = new DifyKnowledgeService({
      apiKey: difyConfig.apiKey,
      baseUrl: difyConfig.baseUrl,
    });

    const result = await knowledgeService.createDocumentByText(datasetId, {
      name,
      text,
      indexing_technique,
      process_rule,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Document creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ドキュメントの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: ドキュメントの削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ datasetId: string }> }
) {
  try {
    const { datasetId } = await params;
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId パラメータが必要です' },
        { status: 400 }
      );
    }

    const difyConfig = await getDifyConfig();

    if (!difyConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません' },
        { status: 401 }
      );
    }

    const knowledgeService = new DifyKnowledgeService({
      apiKey: difyConfig.apiKey,
      baseUrl: difyConfig.baseUrl,
    });

    await knowledgeService.deleteDocument(datasetId, documentId);

    return NextResponse.json({
      success: true,
      message: `ドキュメント ${documentId} を削除しました`,
    });
  } catch (error) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ドキュメントの削除に失敗しました' },
      { status: 500 }
    );
  }
}
