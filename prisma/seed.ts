import { PrismaClient, SocialPlatform, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 データベースシード開始...');

  try {
    // テストユーザーを作成
    const testUser = await prisma.user.upsert({
      where: { email: 'test@toolplus.com' },
      update: {},
      create: {
        id: 'temp-user-001',
        email: 'test@toolplus.com',
        password: 'temp-password', // 実際の環境では暗号化が必要
        name: 'テストユーザー',
        role: UserRole.USER,
      },
    });

    console.log('✅ テストユーザー作成:', testUser.email);

    // テストTwitterアカウントを作成
    const twitterAccount = await prisma.socialAccount.upsert({
      where: { 
        userId_platform: {
          userId: testUser.id,
          platform: SocialPlatform.TWITTER
        }
      },
      update: {},
      create: {
        id: 'temp-twitter-account',
        userId: testUser.id,
        platform: SocialPlatform.TWITTER,
        platformUserId: 'temp-twitter-user-id',
        username: 'temp_twitter_user',
        accessToken: 'temp-access-token',
        accessTokenSecret: 'temp-access-token-secret',
        isActive: true,
      },
    });

    console.log('✅ テストTwitterアカウント作成:', twitterAccount.username);

    // テスト投稿データを作成（オプション）
    const testPosts = [
      {
        content: 'これはテスト投稿です #test #ToolPlus',
        status: 'PUBLISHED' as const,
        platformPostId: '1234567890',
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1日前
      },
      {
        content: 'データベース永続化のテスト投稿 #database #testing',
        status: 'PUBLISHED' as const,
        platformPostId: '1234567891',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12時間前
      },
      {
        content: 'APIエラーのテスト',
        status: 'FAILED' as const,
        failedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6時間前
        failureReason: 'APIキーが設定されていません（テスト）',
      },
    ];

    for (const [index, postData] of testPosts.entries()) {
      await prisma.socialPost.upsert({
        where: { id: `test-post-${index + 1}` },
        update: {},
        create: {
          id: `test-post-${index + 1}`,
          userId: testUser.id,
          socialAccountId: twitterAccount.id,
          platform: SocialPlatform.TWITTER,
          content: postData.content,
          hashtags: postData.content.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g)?.map(tag => tag.slice(1)) || [],
          status: postData.status,
          platformPostId: postData.platformPostId,
          publishedAt: postData.publishedAt,
          failedAt: postData.failedAt,
          failureReason: postData.failureReason,
        },
      });
    }

    console.log('✅ テスト投稿データ作成完了');
    console.log('🎉 データベースシード完了！');

  } catch (error) {
    console.error('❌ シードエラー:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });