import { NextRequest, NextResponse } from 'next/server';
import { ContentService } from '@/lib/content/content-service';
import { ContentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // テスト用のデフォルトユーザーID
    const defaultUserId = 'dify-user-001';
    
    // 検索パラメータを取得
    const params = {
      userId: defaultUserId,
      status: searchParams.get('status') as ContentStatus | undefined,
      search: searchParams.get('search') || undefined,
      tags: searchParams.getAll('tags').filter(Boolean),
      skip: parseInt(searchParams.get('skip') || '0'),
      take: parseInt(searchParams.get('take') || '10'),
    };

    console.log('Fetching contents with params:', params);

    const result = await ContentService.searchContents(params);
    
    console.log('Content search result:', {
      totalFound: result.total,
      contentCount: result.contents.length,
      firstContent: result.contents[0] ? {
        id: result.contents[0].id,
        title: result.contents[0].title,
        status: result.contents[0].status,
      } : null,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get dify contents error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch contents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}