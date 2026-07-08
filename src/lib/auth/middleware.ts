import { NextRequest, NextResponse } from 'next/server';
import { UserService, JWTPayload } from '@/lib/auth/user';
import { UserRole } from '@prisma/client';

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
    // サービス間連携 (Kotone 等からの push)。x-api-key が SERVICE_API_KEY と
    // 一致すれば、SERVICE_USER_ID のユーザーとして振る舞う。env 未設定なら無効。
    const serviceUser = getServiceUser(request);
    if (serviceUser) {
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = serviceUser;
      return handler(authenticatedRequest);
    }

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
 * サービス間連携用の API キー認証。
 * SERVICE_API_KEY と SERVICE_USER_ID が両方設定されていて、リクエストの
 * x-api-key ヘッダーが一致する場合のみ、その userId のサービスユーザーを返す。
 * 未設定・不一致なら null（通常の JWT / cookie 認証にフォールバック）。
 *
 * 用途例: Kotone (別アプリ) が完成記事を POST /api/contents に push する。
 */
function getServiceUser(request: NextRequest): JWTPayload | null {
  const apiKey = process.env.SERVICE_API_KEY;
  const userId = process.env.SERVICE_USER_ID;
  if (!apiKey || !userId) return null;

  const provided = request.headers.get('x-api-key');
  if (!provided || provided !== apiKey) return null;

  return {
    userId,
    email: process.env.SERVICE_USER_EMAIL ?? 'service@kotone.local',
    role: UserRole.USER,
  };
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