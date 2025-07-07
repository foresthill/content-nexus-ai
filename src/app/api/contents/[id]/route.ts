import { NextRequest, NextResponse } from 'next/server';
import { ContentService } from '@/lib/content/content-service';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { ContentStatus } from '@prisma/client';
import { z } from 'zod';

// コンテンツ更新のバリデーションスキーマ
const updateContentSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.nativeEnum(ContentStatus).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.any().optional(),
});

// コンテンツ取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id } = await params;
      const content = await ContentService.getContent(id);
      
      if (!content) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }
      
      // 権限チェック（作成者またはチームメンバーのみアクセス可）
      if (content.userId !== req.user!.userId) {
        // TODO: チームメンバーチェックを追加
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(content);
    } catch (error) {
      console.error('Get content error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch content' },
        { status: 500 }
      );
    }
  });
}

// コンテンツ更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id } = await params;
      const body = await request.json();
      
      // バリデーション
      const validationResult = updateContentSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: validationResult.error.errors[0].message },
          { status: 400 }
        );
      }

      // 権限チェック
      const existingContent = await ContentService.getContent(id);
      if (!existingContent) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }
      
      if (existingContent.userId !== req.user!.userId) {
        // TODO: チームメンバーチェックを追加
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      const content = await ContentService.updateContent(
        id,
        req.user!.userId,
        validationResult.data
      );
      
      return NextResponse.json(content);
    } catch (error) {
      console.error('Update content error:', error);
      return NextResponse.json(
        { error: 'Failed to update content' },
        { status: 500 }
      );
    }
  });
}

// コンテンツ削除（アーカイブ）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { id } = await params;
      // 権限チェック
      const existingContent = await ContentService.getContent(id);
      if (!existingContent) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }
      
      if (existingContent.userId !== req.user!.userId) {
        // TODO: チームメンバーチェックを追加
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      await ContentService.deleteContent(id);
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Delete content error:', error);
      return NextResponse.json(
        { error: 'Failed to delete content' },
        { status: 500 }
      );
    }
  });
}