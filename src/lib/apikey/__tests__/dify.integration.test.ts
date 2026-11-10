/**
 * 結合テスト: Dify 設定の2秘匿値(本体APIキー + データセットAPIキー)を
 * ApiKeyService で別レコード(name='dify' / 'dify-dataset')に暗号化保存し、
 * それぞれ復号で往復することを実DBで検証する（Phase 2b の保存モデル）。
 *
 * 実行: npm run test:integration
 * env無し環境では自動スキップ。
 */
import { prisma } from '@/lib/prisma';
import { saveApiKey, getApiKey, deleteApiKey } from '@/lib/apikey/service';

// 定数は値を直接定義する（@/lib/dify/config は NextAuth(ESM) を間接 import するため
// jest が node_modules の ESM を変換できず import すると失敗する）。
// 値は src/lib/dify/config.ts と一致させること。
const DIFY_SERVICE_TYPE = 'DIFY' as const;
const DIFY_MAIN_NAME = 'dify';
const DIFY_DATASET_NAME = 'dify-dataset';

const canRun = !!process.env.DATABASE_URL && !!process.env.ENCRYPTION_KEY;
const describeOrSkip = canRun ? describe : describe.skip;

const TEST_USER_ID = 'itest-dify-user';
const TEST_EMAIL = 'itest-dify@example.test';

describeOrSkip('Dify config storage (integration, 2 secrets)', () => {
  beforeAll(async () => {
    await prisma.apiKey.deleteMany({ where: { userId: TEST_USER_ID } });
    await prisma.user.deleteMany({ where: { id: TEST_USER_ID } });
    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        name: 'Dify Integration User',
        role: 'USER',
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: TEST_USER_ID } });
    await prisma.$disconnect();
  });

  it('本体キーと datasetキーを別レコードに暗号化保存し、両方復号できる', async () => {
    const mainKey = 'app-dify-main-secret-123';
    const datasetKey = 'dataset-dify-secret-456';

    await saveApiKey({
      userId: TEST_USER_ID,
      serviceType: DIFY_SERVICE_TYPE,
      name: DIFY_MAIN_NAME,
      apiKey: mainKey,
      metadata: { baseUrl: 'https://dify.example.com/v1', appId: 'app-xyz' },
    });
    await saveApiKey({
      userId: TEST_USER_ID,
      serviceType: DIFY_SERVICE_TYPE,
      name: DIFY_DATASET_NAME,
      apiKey: datasetKey,
    });

    // 2レコードが別々に存在する
    const rows = await prisma.apiKey.findMany({
      where: { userId: TEST_USER_ID, serviceType: DIFY_SERVICE_TYPE },
    });
    expect(rows).toHaveLength(2);
    // 平文がDBに入っていない
    for (const r of rows) {
      expect(r.encryptedKey).not.toContain('secret');
    }

    // 本体キー: 復号 + metadata
    const main = await getApiKey(TEST_USER_ID, DIFY_SERVICE_TYPE, DIFY_MAIN_NAME);
    expect(main?.apiKey).toBe(mainKey);
    expect(main?.metadata?.baseUrl).toBe('https://dify.example.com/v1');
    expect(main?.metadata?.appId).toBe('app-xyz');

    // datasetキー: 復号
    const dataset = await getApiKey(TEST_USER_ID, DIFY_SERVICE_TYPE, DIFY_DATASET_NAME);
    expect(dataset?.apiKey).toBe(datasetKey);
  });

  it('本体のみ削除しても datasetキーは残る', async () => {
    await deleteApiKey(TEST_USER_ID, DIFY_SERVICE_TYPE, DIFY_MAIN_NAME);
    expect(await getApiKey(TEST_USER_ID, DIFY_SERVICE_TYPE, DIFY_MAIN_NAME)).toBeNull();
    expect(await getApiKey(TEST_USER_ID, DIFY_SERVICE_TYPE, DIFY_DATASET_NAME)).not.toBeNull();
  });
});
