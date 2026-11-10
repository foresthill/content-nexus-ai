import { DifyConfig } from '@/types/dify';
import { getServerUserId } from '@/lib/auth/server-user';
import { getApiKey } from '@/lib/apikey/service';

// Dify 設定は ApiKey テーブルにユーザーごと暗号化保存する。
// 秘匿値が2つ（apiKey, datasetApiKey）あるため2レコードに分割:
//   name='dify'         : encryptedKey=apiKey, metadata={baseUrl, appId}
//   name='dify-dataset' : encryptedKey=datasetApiKey
export const DIFY_SERVICE_TYPE = 'DIFY' as const;
export const DIFY_MAIN_NAME = 'dify';
export const DIFY_DATASET_NAME = 'dify-dataset';

// サーバーサイドでDify設定を取得する関数。
// ログインユーザーの暗号化DBを優先し、無ければ環境変数にフォールバック。
export async function getDifyConfig(): Promise<DifyConfig | null> {
  try {
    const userId = await getServerUserId();

    if (userId) {
      const main = await getApiKey(userId, DIFY_SERVICE_TYPE, DIFY_MAIN_NAME);
      if (main) {
        const dataset = await getApiKey(
          userId,
          DIFY_SERVICE_TYPE,
          DIFY_DATASET_NAME
        );
        return {
          apiKey: main.apiKey,
          baseUrl: (main.metadata?.baseUrl as string) || '',
          appId: (main.metadata?.appId as string) || undefined,
          datasetApiKey: dataset?.apiKey,
        };
      }
    }

    // 環境変数から取得（フォールバック）
    if (process.env.DIFY_API_KEY && process.env.DIFY_BASE_URL) {
      return {
        apiKey: process.env.DIFY_API_KEY,
        baseUrl: process.env.DIFY_BASE_URL,
        appId: process.env.DIFY_APP_ID,
        datasetApiKey: process.env.DIFY_DATASET_API_KEY,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting Dify config:', error);
    return null;
  }
}
