/**
 * サーバーサイドで NextAuth セッションから userId を取得するヘルパー。
 * Route Handler / Server Component から利用する。
 */
import { auth } from '@/auth';

/**
 * ログイン中のユーザーIDを返す。未ログインなら null。
 */
export async function getServerUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
