import { NextRequest, NextResponse } from 'next/server';
import { UserService, JWTPayload } from '@/lib/auth/user';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * 認証ミドルウェア
 * API routeで使用する認証チェック関数
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // トークンを取得（ヘッダーまたはクッキーから）
    const token = getToken(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // トークンを検証
    const payload = UserService.verifyToken(token);
    
    // リクエストにユーザー情報を追加
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = payload;

    // ハンドラーを実行
    return handler(authenticatedRequest);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

/**
 * 管理者権限チェック付き認証ミドルウェア
 */
export async function withAdminAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (req) => {
    if (req.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    return handler(req);
  });
}

/**
 * トークン取得
 */
function getToken(request: NextRequest): string | null {
  // Authorizationヘッダーから取得
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // クッキーから取得
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * オプショナル認証ミドルウェア
 * 認証があればユーザー情報を追加するが、なくてもリクエストを続行
 */
export async function withOptionalAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = getToken(request);
    
    if (token) {
      const payload = UserService.verifyToken(token);
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = payload;
    }

    return handler(request as AuthenticatedRequest);
  } catch (error) {
    // トークンが無効でもリクエストを続行
    console.warn('Optional auth failed:', error);
    return handler(request as AuthenticatedRequest);
  }
}