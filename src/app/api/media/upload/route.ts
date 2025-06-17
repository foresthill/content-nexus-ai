import { NextRequest, NextResponse } from 'next/server';
import { MediaProcessor } from '@/lib/media/processor';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const mediaProcessor = new MediaProcessor();

export async function POST(request: NextRequest) {
  try {
    // マルチパートフォームデータを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const platform = formData.get('platform') as string;
    const type = formData.get('type') as string || 'feed';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // ファイルの基本検証
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // アップロードディレクトリの初期化
    await mediaProcessor.initializeUploadDir();

    // 一時ファイルとして保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const tempFileName = `${crypto.randomUUID()}_${file.name}`;
    const tempPath = path.join(process.cwd(), 'uploads', 'temp', tempFileName);
    
    await writeFile(tempPath, buffer);

    // プラットフォーム別の最適化
    let optimizedResult;
    if (platform && ['twitter', 'instagram', 'tiktok'].includes(platform)) {
      // プラットフォーム固有の最適化
      optimizedResult = await mediaProcessor.optimizeForPlatform(
        tempPath,
        platform as 'twitter' | 'instagram' | 'tiktok',
        type as 'feed' | 'story' | 'image'
      );

      // 画像の検証
      const validation = await mediaProcessor.validateImage(
        optimizedResult.path,
        platform as 'twitter' | 'instagram' | 'tiktok'
      );

      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Image validation failed', errors: validation.errors },
          { status: 400 }
        );
      }
    } else {
      // 汎用的な最適化
      const outputPath = path.join(
        process.cwd(),
        'uploads',
        'processed',
        `optimized_${tempFileName}`
      );
      
      optimizedResult = await mediaProcessor.optimizeImage(tempPath, outputPath);
    }

    // サムネイル生成
    const thumbnailPath = await mediaProcessor.generateThumbnail(optimizedResult.path);

    // レスポンスデータ
    const response = {
      id: crypto.randomUUID(),
      originalName: file.name,
      size: optimizedResult.metadata.size || 0,
      dimensions: {
        width: optimizedResult.metadata.width || 0,
        height: optimizedResult.metadata.height || 0
      },
      format: optimizedResult.metadata.format,
      url: `/uploads/processed/${path.basename(optimizedResult.path)}`,
      thumbnailUrl: `/uploads/processed/${path.basename(thumbnailPath)}`,
      platform,
      type,
      uploadedAt: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}