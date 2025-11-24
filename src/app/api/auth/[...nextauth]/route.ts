/**
 * NextAuth API Route Handler
 *
 * NextAuth v5のAPIルートハンドラー
 * /api/auth/* エンドポイントを処理
 */

import { handlers } from '@/auth';

export const { GET, POST } = handlers;
