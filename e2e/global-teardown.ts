/**
 * E2E 後始末: テストで作成したユーザー(メールが e2e+ で始まる)を削除する。
 * User 削除で ApiKey / SocialAccount 等は onDelete: Cascade で消える。
 *
 * .env を Next と同じ方式(@next/env)で読み込んでから Prisma を生成する
 * （Playwright のプロセスは .env を自動ロードしないため）。
 */
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import { PrismaClient } from '@prisma/client';

async function globalTeardown() {
  if (!process.env.DATABASE_URL) return;
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      where: { email: { startsWith: 'e2e+' } },
      select: { id: true },
    });
    const ids = users.map((u) => u.id);
    if (ids.length) {
      // AuditLog は onDelete: RESTRICT のため先に削除してから User を消す
      await prisma.auditLog.deleteMany({ where: { userId: { in: ids } } });
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    }
  } catch (e) {
    console.warn('E2E teardown cleanup skipped:', e);
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;
