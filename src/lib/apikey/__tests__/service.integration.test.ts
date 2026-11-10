/**
 * 結合テスト: ApiKeyService × 実DB × 暗号化
 *
 * 平文キーを保存→暗号化されてDBに入り→取得で復号される往復を、実際の
 * Neon DB(DATABASE_URL) と ENCRYPTION_KEY を使って検証する。
 *
 * 実行: npm run test:integration
 * 必要env: DATABASE_URL / DIRECT_URL / ENCRYPTION_KEY（.env）
 * env が無い環境(CI等)では describe.skip で自動スキップする。
 */
import { prisma } from '@/lib/prisma';
import {
  saveApiKey,
  getApiKey,
  getMaskedApiKey,
  updateMetadata,
  deleteApiKey,
} from '@/lib/apikey/service';

const canRun = !!process.env.DATABASE_URL && !!process.env.ENCRYPTION_KEY;
const describeOrSkip = canRun ? describe : describe.skip;

// テスト専用ユーザー（他データと衝突しないID/メール）
const TEST_USER_ID = 'itest-apikey-user';
const TEST_EMAIL = 'itest-apikey@example.test';
const SERVICE_TYPE = 'CUSTOM' as const;
const NAME = 'itest-openrouter';

describeOrSkip('ApiKeyService (integration, real DB + encryption)', () => {
  beforeAll(async () => {
    // 前回の残骸を掃除してからテストユーザーを用意
    await prisma.apiKey.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.user.deleteMany({ where: { id: TEST_USER_ID } });
    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        name: 'Integration Test User',
        role: 'USER',
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    // User削除でApiKeyはカスケード削除される
    await prisma.user.deleteMany({ where: { id: TEST_USER_ID } });
    await prisma.$disconnect();
  });

  it('平文キーを暗号化保存し、取得時に復号して元の値が戻る', async () => {
    const plaintext = 'sk-or-v1-integration-secret-abcdef123456';

    await saveApiKey({
      userId: TEST_USER_ID,
      serviceType: SERVICE_TYPE,
      name: NAME,
      apiKey: plaintext,
      metadata: { model: 'anthropic/claude-sonnet-4.6' },
    });

    // DBには平文で保存されていないこと（暗号文のみ）
    const row = await prisma.apiKey.findFirst({
      where: { userId: TEST_USER_ID, serviceType: SERVICE_TYPE, name: NAME },
    });
    expect(row).not.toBeNull();
    expect(row!.encryptedKey).not.toContain(plaintext);
    expect(row!.iv).toHaveLength(32); // 16バイトhex
    expect(row!.authTag).toHaveLength(32);

    // 取得で復号されて元の平文に戻る
    const got = await getApiKey(TEST_USER_ID, SERVICE_TYPE, NAME);
    expect(got).not.toBeNull();
    expect(got!.apiKey).toBe(plaintext);
    expect(got!.metadata?.model).toBe('anthropic/claude-sonnet-4.6');
  });

  it('マスク取得は平文を返さず末尾のみ可視', async () => {
    const masked = await getMaskedApiKey(TEST_USER_ID, SERVICE_TYPE, NAME);
    expect(masked).not.toBeNull();
    expect(masked!.maskedKey).toContain('●');
    expect(masked!.maskedKey).not.toContain('integration-secret');
  });

  it('metadataのみ更新してもキー本体は保持される', async () => {
    const updated = await updateMetadata(TEST_USER_ID, SERVICE_TYPE, NAME, {
      model: 'anthropic/claude-opus-4.8',
    });
    expect(updated).toBe(true);

    const got = await getApiKey(TEST_USER_ID, SERVICE_TYPE, NAME);
    expect(got!.apiKey).toBe('sk-or-v1-integration-secret-abcdef123456');
    expect(got!.metadata?.model).toBe('anthropic/claude-opus-4.8');
  });

  it('削除すると取得できなくなる', async () => {
    await deleteApiKey(TEST_USER_ID, SERVICE_TYPE, NAME);
    const got = await getApiKey(TEST_USER_ID, SERVICE_TYPE, NAME);
    expect(got).toBeNull();
  });
});
