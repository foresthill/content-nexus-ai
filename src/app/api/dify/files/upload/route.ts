import { NextRequest, NextResponse } from 'next/server';
import { DifyClient } from '@/lib/dify/client';
import { getDifyConfig } from '@/lib/dify/config';

export async function POST(request: NextRequest) {
  try {
    // FormDataからファイルを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（10MBまで）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      );
    }

    // 許可されるファイルタイプ
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '対応していないファイル形式です。PDF、テキスト、CSV、Excel、Word、Markdownファイルのみアップロード可能です。' },
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

    // DifyClientを初期化
    const difyClient = new DifyClient(difyConfig);
    
    try {
      // Difyにファイルをアップロード
      const uploadResult = await difyClient.uploadFile(file);
      
      // アップロード結果を返す
      return NextResponse.json({
        success: true,
        file: {
          id: uploadResult.id,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          difyFileId: uploadResult.id,
          difyUrl: uploadResult.url,
        },
        message: 'ファイルが正常にアップロードされました',
      });
      
    } catch (uploadError) {
      console.error('Dify file upload error:', uploadError);
      
      // Difyのエラーを処理
      if (uploadError instanceof Error) {
        return NextResponse.json(
          { 
            error: 'ファイルのアップロードに失敗しました',
            details: uploadError.message,
          },
          { status: 500 }
        );
      }
      
      throw uploadError;
    }

  } catch (error) {
    console.error('File upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'ファイルアップロード処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

// ファイル一覧を取得（モック実装）
export async function GET(request: NextRequest) {
  try {
    // TODO: 実際の実装では、データベースからアップロード済みファイル一覧を取得
    
    const mockFiles = [
      {
        id: '1',
        name: 'marketing-guide.pdf',
        size: 1024000,
        type: 'application/pdf',
        uploadedAt: '2024-01-01T00:00:00Z',
        difyFileId: 'dify-file-1',
      },
      {
        id: '2',
        name: 'product-specs.docx',
        size: 512000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedAt: '2024-01-02T00:00:00Z',
        difyFileId: 'dify-file-2',
      },
    ];

    return NextResponse.json({
      files: mockFiles,
      total: mockFiles.length,
    });

  } catch (error) {
    console.error('File list error:', error);
    return NextResponse.json(
      { error: 'ファイル一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}