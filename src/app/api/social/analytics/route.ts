import { NextRequest, NextResponse } from 'next/server';
import { socialAnalyticsService } from '@/lib/social/analytics';
import jwt from 'jsonwebtoken';

// 認証トークンの検証
function verifyAuthToken(request: NextRequest, platform: string) {
  const token = request.cookies.get(`sns-auth-${platform}`)?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // 各プラットフォームの認証情報を取得
    const twitterAuth = verifyAuthToken(request, 'twitter') as any;
    const instagramAuth = verifyAuthToken(request, 'instagram') as any;
    const tiktokAuth = verifyAuthToken(request, 'tiktok') as any;

    const credentials: any = {};

    if (twitterAuth && twitterAuth.userId) {
      credentials.twitter = {
        userId: twitterAuth.userId,
        accessToken: twitterAuth.accessToken,
        accessTokenSecret: twitterAuth.accessTokenSecret
      };
    }

    if (instagramAuth && instagramAuth.accessToken) {
      credentials.instagram = {
        accessToken: instagramAuth.accessToken
      };
    }

    if (tiktokAuth && tiktokAuth.openId) {
      credentials.tiktok = {
        openId: tiktokAuth.openId,
        accessToken: tiktokAuth.accessToken
      };
    }

    // 少なくとも1つのプラットフォームが認証されている必要がある
    if (Object.keys(credentials).length === 0) {
      return NextResponse.json(
        { error: 'No authenticated platforms found' },
        { status: 401 }
      );
    }

    // 分析データを取得
    const metrics = await socialAnalyticsService.getAllPlatformMetrics(credentials);

    // レスポンスデータの整形
    const response = {
      platforms: metrics,
      summary: {
        totalFollowers: metrics.reduce((sum, m) => sum + m.followers, 0),
        totalPosts: metrics.reduce((sum, m) => sum + m.posts, 0),
        totalEngagement: metrics.reduce((sum, m) => 
          sum + m.engagement.likes + m.engagement.comments + m.engagement.shares, 0
        ),
        averageEngagementRate: metrics.length > 0 
          ? metrics.reduce((sum, m) => sum + m.growth.engagementRate, 0) / metrics.length
          : 0
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Social analytics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// 特定の投稿のパフォーマンスを取得
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postIds } = body;

    if (!postIds || typeof postIds !== 'object') {
      return NextResponse.json(
        { error: 'Invalid post IDs' },
        { status: 400 }
      );
    }

    const credentials: any = {};

    // Twitter post
    if (postIds.twitter) {
      const twitterAuth = verifyAuthToken(request, 'twitter') as any;
      if (!twitterAuth) {
        return NextResponse.json(
          { error: 'Twitter authentication required' },
          { status: 401 }
        );
      }
      credentials.twitter = {
        tweetId: postIds.twitter,
        accessToken: twitterAuth.accessToken,
        accessTokenSecret: twitterAuth.accessTokenSecret
      };
    }

    // Instagram post
    if (postIds.instagram) {
      const instagramAuth = verifyAuthToken(request, 'instagram') as any;
      if (!instagramAuth) {
        return NextResponse.json(
          { error: 'Instagram authentication required' },
          { status: 401 }
        );
      }
      credentials.instagram = {
        mediaId: postIds.instagram,
        accessToken: instagramAuth.accessToken
      };
    }

    // TikTok post
    if (postIds.tiktok) {
      const tiktokAuth = verifyAuthToken(request, 'tiktok') as any;
      if (!tiktokAuth) {
        return NextResponse.json(
          { error: 'TikTok authentication required' },
          { status: 401 }
        );
      }
      credentials.tiktok = {
        videoId: postIds.tiktok,
        openId: tiktokAuth.openId,
        accessToken: tiktokAuth.accessToken
      };
    }

    // 投稿パフォーマンスを取得
    const performance = await socialAnalyticsService.getPostPerformance(credentials);

    return NextResponse.json({
      posts: performance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Post performance error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch post performance';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}