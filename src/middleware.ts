/**
 * Next.js Middleware
 *
 * NextAuth認証チェックとページ保護
 * 認証が必要なページへのアクセス制御を行う
 */

// Edge ランタイムで安全に JWT セッションを読む。
// 以前は adapter (Prisma) を含む `@/auth` の `auth` を import していたが、
// それは Edge 非対応で middleware のセッション判定が壊れ、未ログインでも全員
// ログイン扱いになっていた (= 全ページが素通り)。getToken は Cookie の JWT を
// secret で復号するだけなので Edge 安全、かつログイン処理には一切触れない。
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 保護されたパス（認証が必要）
 */
const protectedPaths = [
  '/dashboard',
  '/social',
  '/videos',
  '/settings',
  '/dify',
  '/competitors',
  '/content',
];

/**
 * 認証ページのパス
 */
const authPaths = ['/auth/signin', '/auth/signup', '/auth/error'];

/**
 * 公開パス（認証不要）
 */
const publicPaths = ['/'];

/**
 * ADMIN専用パス
 */
const adminOnlyPaths = ['/admin'];

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // Cookie の JWT を復号してセッションを判定 (無ければ token は null = 未ログイン)。
  // NextAuth v5 は AUTH_SECRET を使う。念のため NEXTAUTH_SECRET にもフォールバック。
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });
  const isLoggedIn = !!token;
  const userRole = token?.role as string | undefined;
  const isActive = (token?.isActive as boolean | undefined) ?? true; // デフォルトでアクティブと見なす

  // パスの分類
  const isProtectedPath = protectedPaths.some((path) => nextUrl.pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => nextUrl.pathname.startsWith(path));
  const isPublicPath = publicPaths.some((path) => nextUrl.pathname === path);
  const isAdminPath = adminOnlyPaths.some((path) => nextUrl.pathname.startsWith(path));

  // 1. 認証済みユーザーが認証ページにアクセス（最優先）
  if (isAuthPath && isLoggedIn) {
    const callbackUrl = nextUrl.searchParams.get('callbackUrl');
    const redirectUrl = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, nextUrl));
  }

  // 2. 公開パスは常に許可
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 3. 非アクティブユーザーのチェック
  if (isLoggedIn && !isActive && !isAuthPath) {
    return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', nextUrl));
  }

  // 4. ADMIN専用パスのチェック
  if (isAdminPath) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${nextUrl.pathname}`, nextUrl));
    }
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', nextUrl));
    }
  }

  // 5. 保護されたパスへのアクセス
  if (isProtectedPath && !isLoggedIn) {
    // 未認証ユーザーをサインインページへリダイレクト（元のURLを保持）
    const signInUrl = new URL('/auth/signin', nextUrl);
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  // 6. その他のリクエストは通過（認証済みの保護パスを含む）
  return NextResponse.next();
}

/**
 * Middlewareの適用範囲を設定
 * APIルート（NextAuthを除く）とstatic assetsを除外
 */
export const config = {
  matcher: [
    /*
     * 以下を除く全てのパスにマッチ:
     * - api (APIルート)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
