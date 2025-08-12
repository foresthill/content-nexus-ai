import { NextRequest, NextResponse } from 'next/server';
import { SocialPostService } from '@/lib/social/post-service';
import { SocialPlatform } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'temp-user-001';
    const platform = searchParams.get('platform') as SocialPlatform | null;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 投稿一覧を取得
    const { posts, total } = await SocialPostService.searchPosts({
      userId,
      platform: platform || undefined,
      take: limit,
      skip: offset,
    });

    // 今日の投稿統計も含める
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { posts: todayPosts } = await SocialPostService.searchPosts({
      userId,
      platform: platform || undefined,
      fromDate: today,
      toDate: tomorrow,
    });

    // 統計情報を計算
    const stats = {
      total: todayPosts.length,
      published: todayPosts.filter(p => p.status === 'PUBLISHED').length,
      failed: todayPosts.filter(p => p.status === 'FAILED').length,
      scheduled: todayPosts.filter(p => p.status === 'SCHEDULED').length,
    };

    const successRate = stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        posts: posts.map(post => ({
          id: post.id,
          content: post.content,
          platform: post.platform,
          status: post.status,
          platformPostId: post.platformPostId,
          createdAt: post.createdAt,
          publishedAt: post.publishedAt,
          failedAt: post.failedAt,
          failureReason: post.failureReason,
          hashtags: post.hashtags,
          url: post.platformPostId && post.platform === 'TWITTER' 
            ? `https://twitter.com/i/web/status/${post.platformPostId}`
            : null,
        })),
        stats: {
          ...stats,
          successRate,
        },
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });

  } catch (error) {
    console.error('❌ 投稿履歴取得エラー:', error);
    return NextResponse.json(
      { 
        error: '投稿履歴の取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}