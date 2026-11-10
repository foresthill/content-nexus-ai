/**
 * 結合テスト: n8n 設定の2秘匿値(apiKey + password)を ApiKeyService で
 * 別レコード(name='n8n' / 'n8n-password')に暗号化保存し、復号で往復することを検証。
 * 実行: npm run test:integration（env無しは自動スキップ）
 */
import { prisma } from '@/lib/prisma';
import { saveApiKey, getApiKey, deleteApiKey } from '@/lib/apikey/service';

const canRun = !!process.env.DATABASE_URL && !!process.env.ENCRYPTION_KEY;
const describeOrSkip = canRun ? describe : describe.skip;

const TEST_USER_ID = 'itest-n8n-user';
const TEST_EMAIL = 'itest-n8n@example.test';
const N8N = 'N8N' as const;
const N8N_MAIN = 'n8n';
const N8N_PASSWORD = 'n8n-password';

describeOrSkip('n8n config storage (integration, 2 secrets)', () => {
  beforeAll(async () => {
    await prisma.apiKey.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.user.deleteMany({ where: { id: TEST_USER_ID } });
    await prisma.user.create({
      data: { id: TEST_USER_ID, email: TEST_EMAIL, name: 'n8n Test', role: 'USER', isActive: true },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: TEST_USER_ID } });
    await prisma.$disconnect();
  });

  it('apiKey と password を別レコードに暗号化保存し復号できる', async () => {
    await saveApiKey({
      userId: TEST_USER_ID,
      serviceType: N8N,
      name: N8N_MAIN,
      apiKey: 'n8n-apikey-secret-123',
      metadata: { baseUrl: 'https://n8n.example.com', username: 'admin', timeout: 30000 },
    });
    await saveApiKey({
      userId: TEST_USER_ID,
      serviceType: N8N,
      name: N8N_PASSWORD,
      apiKey: 'n8n-password-secret-456',
    });

    const rows = await prisma.apiKey.findMany({ where: { userId: TEST_USER_ID, serviceType: N8N } });
    expect(rows).toHaveLength(2);
    for (const r of rows) expect(r.encryptedKey).not.toContain('secret');

    const main = await getApiKey(TEST_USER_ID, N8N, N8N_MAIN);
    expect(main?.apiKey).toBe('n8n-apikey-secret-123');
    expect(main?.metadata?.baseUrl).toBe('https://n8n.example.com');
    expect(main?.metadata?.username).toBe('admin');

    const pw = await getApiKey(TEST_USER_ID, N8N, N8N_PASSWORD);
    expect(pw?.apiKey).toBe('n8n-password-secret-456');

    await deleteApiKey(TEST_USER_ID, N8N, N8N_MAIN);
    await deleteApiKey(TEST_USER_ID, N8N, N8N_PASSWORD);
    expect(await getApiKey(TEST_USER_ID, N8N, N8N_MAIN)).toBeNull();
  });
});
