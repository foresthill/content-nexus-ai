/**
 * NextAuth v5 Configuration
 *
 * NextAuthの設定ファイル
 * 認証プロバイダーとセッション戦略を定義します
 */

import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * NextAuth設定オブジェクト
 */
export const authConfig: NextAuthConfig = {
  // 認証プロバイダーの設定
  providers: [
    // 1. Credentials認証（メール/パスワード）
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('メールアドレスとパスワードを入力してください');
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // ユーザーを検索
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error('ユーザーが見つかりません');
        }

        // パスワード検証
        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('パスワードが正しくありません');
        }

        // アクティブユーザーチェック
        if (!user.isActive) {
          throw new Error('このアカウントは無効化されています');
        }

        // ユーザー情報を返す（passwordは除外）
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // 2. Google OAuth（環境変数が設定されている場合のみ有効）
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true, // 同じメールアドレスでのアカウント連携を許可
          }),
        ]
      : []),

    // 3. GitHub OAuth（環境変数が設定されている場合のみ有効）
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],

  // セッション設定
  session: {
    strategy: 'jwt', // JWT戦略を使用（サーバーレス環境で推奨）
    maxAge: 30 * 24 * 60 * 60, // 30日間
    updateAge: 24 * 60 * 60, // 24時間ごとに更新
  },

  // カスタムページ
  pages: {
    signIn: '/auth/signin',
    // signUp: '/auth/signup', // NextAuth v5では直接サポートされていないため、カスタム実装
    error: '/auth/error',
  },

  // コールバック設定
  callbacks: {
    /**
     * JWT作成時のコールバック
     * トークンにカスタムデータを追加
     */
    async jwt({ token, user, account, trigger }) {
      // 初回ログイン時（userが存在する）
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
      }

      // OAuth認証の場合、プロバイダー情報を保存
      if (account) {
        token.provider = account.provider;
      }

      // セッション更新時の処理
      if (trigger === 'update') {
        // データベースから最新のユーザー情報を取得
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.isActive = dbUser.isActive;
          token.name = dbUser.name;
          token.image = dbUser.image;
        }
      }

      return token;
    },

    /**
     * セッション作成時のコールバック
     * クライアントに返すセッションデータをカスタマイズ
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isActive = token.isActive as boolean;
      }

      return session;
    },

    /**
     * 認証許可のコールバック
     * アクセス制御のカスタマイズ
     */
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

      // 認証ページは常にアクセス可能
      if (isAuthPage) {
        return true;
      }

      // 保護されたページは認証が必要
      const protectedPaths = ['/dashboard', '/social', '/videos', '/settings', '/dify'];
      const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
      );

      if (isProtectedPath && !isLoggedIn) {
        return false; // middleware.tsでリダイレクト処理
      }

      // 非アクティブユーザーのアクセス拒否
      if (isLoggedIn && !auth.user.isActive && !isAuthPage) {
        return false;
      }

      return true;
    },
  },

  // イベントハンドラー
  events: {
    /**
     * サインイン時のイベント
     * 監査ログやアナリティクスに使用
     */
    async signIn({ user, account, profile }) {
      console.log(`User signed in: ${user.email} via ${account?.provider || 'credentials'}`);

      // 監査ログの記録（実装例）
      if (user.id) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            entityType: 'User',
            entityId: user.id,
            changes: {
              provider: account?.provider || 'credentials',
              timestamp: new Date().toISOString(),
            },
          },
        });
      }
    },

    /**
     * サインアウト時のイベント
     */
    async signOut({ token }) {
      console.log(`User signed out: ${token?.email}`);

      // 監査ログの記録
      if (token?.id) {
        await prisma.auditLog.create({
          data: {
            userId: token.id as string,
            action: 'LOGOUT',
            entityType: 'User',
            entityId: token.id as string,
            changes: {
              timestamp: new Date().toISOString(),
            },
          },
        });
      }
    },
  },

  // デバッグ設定（開発環境のみ）
  debug: process.env.NODE_ENV === 'development',
};
