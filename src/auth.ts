/**
 * NextAuth Instance
 *
 * NextAuth認証インスタンスの作成
 * Prisma Adapterとの統合
 */

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';

/**
 * NextAuthインスタンスを作成
 *
 * Prisma Adapterを使用してデータベースと統合
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
});
