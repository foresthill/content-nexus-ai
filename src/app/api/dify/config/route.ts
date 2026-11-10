import { NextRequest, NextResponse } from 'next/server';
import { getServerUserId } from '@/lib/auth/server-user';
import {
  saveApiKey,
  updateMetadata,
  getApiKey,
  getMaskedApiKey,
  deleteApiKey,
} from '@/lib/apikey/service';
import {
  DIFY_SERVICE_TYPE,
  DIFY_MAIN_NAME,
  DIFY_DATASET_NAME,
} from '@/lib/dify/config';

// 送信されたキーがマスク済み（未変更）か判定
function isMasked(value: unknown): boolean {
  return typeof value !== 'string' || value === '' || value.includes('●');
}

// Dify設定を保存するAPI（ユーザーごと・暗号化DB）
export async function POST(request: NextRequest) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { apiKey, baseUrl, appId, datasetApiKey } = body;

    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Base URLは必須です' },
        { status: 400 }
      );
    }

    const metadata = { baseUrl, appId: appId || null };

    // メインキー: マスク済み（未変更）ならメタ情報のみ更新
    if (isMasked(apiKey)) {
      const updated = await updateMetadata(
        userId,
        DIFY_SERVICE_TYPE,
        DIFY_MAIN_NAME,
        metadata
      );
      if (!updated) {
        return NextResponse.json(
          { error: 'API Keyは必須です' },
          { status: 400 }
        );
      }
    } else {
      await saveApiKey({
        userId,
        serviceType: DIFY_SERVICE_TYPE,
        name: DIFY_MAIN_NAME,
        apiKey,
        metadata,
      });
    }

    // データセットAPIキー: 入力があり未マスクなら保存
    if (!isMasked(datasetApiKey)) {
      await saveApiKey({
        userId,
        serviceType: DIFY_SERVICE_TYPE,
        name: DIFY_DATASET_NAME,
        apiKey: datasetApiKey,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Config save error:', error);
    return NextResponse.json(
      { error: '設定の保存に失敗しました' },
      { status: 500 }
    );
  }
}

// Dify設定を取得するAPI（平文は返さない）
export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const main = await getMaskedApiKey(
      userId,
      DIFY_SERVICE_TYPE,
      DIFY_MAIN_NAME
    );

    if (!main) {
      return NextResponse.json(
        { error: '設定が見つかりません' },
        { status: 404 }
      );
    }

    const dataset = await getApiKey(
      userId,
      DIFY_SERVICE_TYPE,
      DIFY_DATASET_NAME
    );

    return NextResponse.json({
      hasConfig: true,
      apiKey: main.maskedKey,
      baseUrl: (main.metadata?.baseUrl as string) || '',
      appId: (main.metadata?.appId as string) || null,
      hasDatasetKey: !!dataset,
    });
  } catch (error) {
    console.error('Config get error:', error);
    return NextResponse.json(
      { error: '設定の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// Dify設定を削除するAPI（ユーザーごと）
export async function DELETE() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteApiKey(userId, DIFY_SERVICE_TYPE, DIFY_MAIN_NAME);
    await deleteApiKey(userId, DIFY_SERVICE_TYPE, DIFY_DATASET_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Config delete error:', error);
    return NextResponse.json(
      { error: '設定の削除に失敗しました' },
      { status: 500 }
    );
  }
}
