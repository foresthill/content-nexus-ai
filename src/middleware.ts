/**
 * Next.js Middleware
 *
 * NextAuth認証チェックとページ保護
 * 認証が必要なページへのアクセス制御を行う
 */

import { auth } from '@/auth';
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
const publicPaths = ['/', '/api'];

/**
 * ADMIN専用パス
 */
const adminOnlyPaths = ['/admin'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const isActive = req.auth?.user?.isActive;

  // パスの分類
  const isProtectedPath = protectedPaths.some((path) => nextUrl.pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => nextUrl.pathname.startsWith(path));
  const isPublicPath =
    nextUrl.pathname === '/' ||
    publicPaths.some((path) => nextUrl.pathname.startsWith(path) && path !== '/');
  const isAdminPath = adminOnlyPaths.some((path) => nextUrl.pathname.startsWith(path));

  // 1. 非アクティブユーザーのチェック
  if (isLoggedIn && !isActive && !isAuthPath) {
    return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', nextUrl));
  }

  // 2. ADMIN専用パスのチェック
  if (isAdminPath) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${nextUrl.pathname}`, nextUrl));
    }
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', nextUrl));
    }
  }

  // 3. 保護されたパスへのアクセス
  if (isProtectedPath && !isLoggedIn) {
    // 未認証ユーザーをサインインページへリダイレクト（元のURLを保持）
    const signInUrl = new URL('/auth/signin', nextUrl);
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  // 4. 認証済みユーザーが認証ページにアクセス
  if (isAuthPath && isLoggedIn) {
    // ダッシュボードへリダイレクト
    const callbackUrl = nextUrl.searchParams.get('callbackUrl');
    const redirectUrl = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, nextUrl));
  }

  // 5. その他のリクエストは通過
  return NextResponse.next();
});

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
