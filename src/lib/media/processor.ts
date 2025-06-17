import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

interface MediaOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface PlatformMediaSpecs {
  twitter: {
    image: { maxWidth: number; maxHeight: number; maxSize: number };
    video: { maxSize: number; maxDuration: number };
  };
  instagram: {
    feed: { minWidth: number; maxWidth: number; aspectRatio: [number, number] };
    story: { width: number; height: number; maxSize: number };
    reel: { maxSize: number; maxDuration: number };
  };
  tiktok: {
    video: { maxSize: number; maxDuration: number };
  };
}

export class MediaProcessor {
  private uploadDir: string;
  private specs: PlatformMediaSpecs;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.specs = {
      twitter: {
        image: { maxWidth: 1200, maxHeight: 675, maxSize: 5 * 1024 * 1024 },
        video: { maxSize: 512 * 1024 * 1024, maxDuration: 140 }
      },
      instagram: {
        feed: { minWidth: 320, maxWidth: 1080, aspectRatio: [1, 1.91] },
        story: { width: 1080, height: 1920, maxSize: 4 * 1024 * 1024 },
        reel: { maxSize: 4 * 1024 * 1024, maxDuration: 60 }
      },
      tiktok: {
        video: { maxSize: 287 * 1024 * 1024, maxDuration: 60 }
      }
    };
  }

  // ディレクトリの初期化
  async initializeUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'temp'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'processed'), { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directories:', error);
    }
  }

  // 画像の最適化
  async optimizeImage(
    inputPath: string,
    outputPath: string,
    options: MediaOptions = {}
  ): Promise<{ path: string; metadata: sharp.Metadata }> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 85,
      format = 'jpeg'
    } = options;

    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // リサイズが必要かチェック
      let pipeline = image;
      if (metadata.width && metadata.width > maxWidth || 
          metadata.height && metadata.height > maxHeight) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // フォーマット変換と品質設定
      switch (format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({ quality, progressive: true });
          break;
        case 'png':
          pipeline = pipeline.png({ quality, compressionLevel: 9 });
          break;
        case 'webp':
          pipeline = pipeline.webp({ quality });
          break;
      }

      // 保存
      await pipeline.toFile(outputPath);

      return {
        path: outputPath,
        metadata: await sharp(outputPath).metadata()
      };
    } catch (error) {
      console.error('Image optimization error:', error);
      throw new Error('Failed to optimize image');
    }
  }

  // プラットフォーム別画像最適化
  async optimizeForPlatform(
    inputPath: string,
    platform: 'twitter' | 'instagram' | 'tiktok',
    type: 'feed' | 'story' | 'image' = 'feed'
  ): Promise<{ path: string; metadata: sharp.Metadata }> {
    const filename = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(
      this.uploadDir,
      'processed',
      `${filename}_${platform}_${type}.jpg`
    );

    let options: MediaOptions = {};

    switch (platform) {
      case 'twitter':
        options = {
          maxWidth: this.specs.twitter.image.maxWidth,
          maxHeight: this.specs.twitter.image.maxHeight,
          quality: 90,
          format: 'jpeg'
        };
        break;
      
      case 'instagram':
        if (type === 'story') {
          options = {
            maxWidth: this.specs.instagram.story.width,
            maxHeight: this.specs.instagram.story.height,
            quality: 90,
            format: 'jpeg'
          };
        } else {
          options = {
            maxWidth: this.specs.instagram.feed.maxWidth,
            quality: 90,
            format: 'jpeg'
          };
        }
        break;
      
      case 'tiktok':
        // TikTokは主に動画なので、サムネイル用の画像を生成
        options = {
          maxWidth: 720,
          maxHeight: 1280,
          quality: 85,
          format: 'jpeg'
        };
        break;
    }

    return this.optimizeImage(inputPath, outputPath, options);
  }

  // 画像のバッチ処理
  async batchOptimizeImages(
    inputPaths: string[],
    options: MediaOptions = {}
  ): Promise<Array<{ path: string; metadata: sharp.Metadata }>> {
    const results = await Promise.all(
      inputPaths.map(async (inputPath, index) => {
        const filename = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(
          this.uploadDir,
          'processed',
          `${filename}_optimized_${index}.jpg`
        );
        return this.optimizeImage(inputPath, outputPath, options);
      })
    );

    return results;
  }

  // 画像メタデータの取得
  async getImageMetadata(imagePath: string): Promise<sharp.Metadata> {
    try {
      return await sharp(imagePath).metadata();
    } catch (error) {
      console.error('Failed to get image metadata:', error);
      throw new Error('Failed to get image metadata');
    }
  }

  // サムネイル生成
  async generateThumbnail(
    inputPath: string,
    size: number = 200
  ): Promise<string> {
    const filename = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(
      this.uploadDir,
      'processed',
      `${filename}_thumb.jpg`
    );

    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'centre'
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  // 画像の検証
  async validateImage(
    imagePath: string,
    platform: 'twitter' | 'instagram' | 'tiktok'
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const metadata = await sharp(imagePath).metadata();
      const stats = await fs.stat(imagePath);

      // プラットフォーム別の検証
      switch (platform) {
        case 'twitter':
          if (stats.size > this.specs.twitter.image.maxSize) {
            errors.push(`画像サイズが${this.specs.twitter.image.maxSize / 1024 / 1024}MBを超えています`);
          }
          break;
        
        case 'instagram':
          if (metadata.width && metadata.width < this.specs.instagram.feed.minWidth) {
            errors.push(`画像幅が${this.specs.instagram.feed.minWidth}px未満です`);
          }
          if (stats.size > this.specs.instagram.story.maxSize) {
            errors.push(`画像サイズが${this.specs.instagram.story.maxSize / 1024 / 1024}MBを超えています`);
          }
          break;
      }

      // 共通の検証
      if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
        errors.push('サポートされていない画像形式です');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        valid: false,
        errors: ['画像の検証に失敗しました']
      };
    }
  }

  // 一時ファイルのクリーンアップ
  async cleanupTempFiles(olderThanHours: number = 24): Promise<void> {
    const tempDir = path.join(this.uploadDir, 'temp');
    const now = Date.now();
    const maxAge = olderThanHours * 60 * 60 * 1000;

    try {
      const files = await fs.readdir(tempDir);
      
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}