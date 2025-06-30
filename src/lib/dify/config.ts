import { cookies } from 'next/headers';
import { DifyConfig } from '@/types/dify';

// サーバーサイドでDify設定を取得する関数
export async function getDifyConfig(): Promise<DifyConfig | null> {
  try {
    // Cookieから設定を取得（クライアントサイドのlocalStorageの代わり）
    const cookieStore = await cookies();
    const configCookie = cookieStore.get('dify-config');
    
    if (configCookie) {
      try {
        const config = JSON.parse(configCookie.value) as DifyConfig;
        return config;
      } catch (e) {
        console.error('Failed to parse Dify config from cookie:', e);
      }
    }
    
    // 環境変数から取得（フォールバック）
    if (process.env.DIFY_API_KEY && process.env.DIFY_BASE_URL) {
      return {
        apiKey: process.env.DIFY_API_KEY,
        baseUrl: process.env.DIFY_BASE_URL,
        appId: process.env.DIFY_APP_ID,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Dify config:', error);
    return null;
  }
}