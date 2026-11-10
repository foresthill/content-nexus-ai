import { NextRequest, NextResponse } from 'next/server';
import { getServerUserId } from '@/lib/auth/server-user';
import {
  saveApiKey,
  updateMetadata,
  getApiKey,
  deleteApiKey,
} from '@/lib/apikey/service';

// n8n 接続設定をユーザーごとに暗号化DB(ApiKeyテーブル)へ保存する。
// 秘匿値が2つ(apiKey / password)あるため2レコードに分割:
//   name='n8n'          : encryptedKey=apiKey, metadata={baseUrl, username, timeout}
//   name='n8n-password' : encryptedKey=password
// 注意: n8n 呼び出しはクライアント(n8nService)で行う設計のため、GET は設定値を
//       平文で返す(localStorage 平文保持の置き換え。at-rest はDBで暗号化される)。
const N8N = 'N8N' as const;
const N8N_MAIN = 'n8n';
const N8N_PASSWORD = 'n8n-password';

function isMasked(value: unknown): boolean {
  return typeof value !== 'string' || value === '' || value.includes('●');
}

export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const main = await getApiKey(userId, N8N, N8N_MAIN);
    if (!main) {
      return NextResponse.json({ hasConfig: false });
    }
    const pw = await getApiKey(userId, N8N, N8N_PASSWORD);

    return NextResponse.json({
      hasConfig: true,
      config: {
        baseUrl: (main.metadata?.baseUrl as string) || '',
        username: (main.metadata?.username as string) || undefined,
        timeout: (main.metadata?.timeout as number) || undefined,
        apiKey: main.apiKey || undefined,
        password: pw?.apiKey || undefined,
      },
    });
  } catch (error) {
    console.error('n8n config GET error:', error);
    return NextResponse.json({ error: 'Failed to get configuration' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { baseUrl, apiKey, username, password, timeout } = body;

    if (!baseUrl) {
      return NextResponse.json({ error: 'baseUrl は必須です' }, { status: 400 });
    }

    const metadata = {
      baseUrl,
      username: username || null,
      timeout: typeof timeout === 'number' ? timeout : null,
    };

    // apiKey: 未変更(マスク/空)ならメタのみ更新。新規値なら暗号化保存。
    if (isMasked(apiKey)) {
      const updated = await updateMetadata(userId, N8N, N8N_MAIN, metadata);
      if (!updated) {
        // 新規でキー無し(basic認証のみ)の場合は空キーで作成
        await saveApiKey({ userId, serviceType: N8N, name: N8N_MAIN, apiKey: '', metadata });
      }
    } else {
      await saveApiKey({ userId, serviceType: N8N, name: N8N_MAIN, apiKey, metadata });
    }

    // password: 新規値のみ保存
    if (!isMasked(password)) {
      await saveApiKey({ userId, serviceType: N8N, name: N8N_PASSWORD, apiKey: password });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('n8n config POST error:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await deleteApiKey(userId, N8N, N8N_MAIN);
    await deleteApiKey(userId, N8N, N8N_PASSWORD);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('n8n config DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete configuration' }, { status: 500 });
  }
}
