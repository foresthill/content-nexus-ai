import { NextRequest, NextResponse } from 'next/server';
import { ContentService } from '@/lib/content/content-service';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { ContentStatus } from '@prisma/client';
import { z } from 'zod';

// コンテンツ作成のバリデーションスキーマ
const createContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.any().optional(),
});

// コンテンツ一覧取得
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      
      // 検索パラメータを取得
      const params = {
        userId: req.user!.userId,
        status: searchParams.get('status') as ContentStatus | undefined,
        search: searchParams.get('search') || undefined,
        tags: searchParams.getAll('tags').filter(Boolean),
        skip: parseInt(searchParams.get('skip') || '0'),
        take: parseInt(searchParams.get('take') || '10'),
      };

      const result = await ContentService.searchContents(params);
      
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get contents error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contents' },
        { status: 500 }
      );
    }
  });
}

// コンテンツ作成
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      
      // バリデーション
      const validationResult = createContentSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: validationResult.error.errors[0].message },
          { status: 400 }
        );
      }

      const content = await ContentService.createContent({
        userId: req.user!.userId,
        ...validationResult.data,
      });
      
      return NextResponse.json(content, { status: 201 });
    } catch (error) {
      console.error('Create content error:', error);
      return NextResponse.json(
        { error: 'Failed to create content' },
        { status: 500 }
      );
    }
  });
}