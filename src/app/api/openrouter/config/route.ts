import { NextRequest, NextResponse } from 'next/server';
import { getServerUserId } from '@/lib/auth/server-user';
import {
  saveApiKey,
  updateMetadata,
  getMaskedApiKey,
  deleteApiKey,
} from '@/lib/apikey/service';
import {
  OPENROUTER_SERVICE_TYPE,
  OPENROUTER_SERVICE_NAME,
  OPENROUTER_DEFAULT_MODEL,
  isMaskedKey,
} from '@/lib/openrouter/user-config';

// 設定を取得（ユーザーごと・暗号化DBから）
export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const masked = await getMaskedApiKey(
      userId,
      OPENROUTER_SERVICE_TYPE,
      OPENROUTER_SERVICE_NAME
    );

    if (!masked) {
      return NextResponse.json({
        apiKey: '',
        model: OPENROUTER_DEFAULT_MODEL,
        isConfigured: false,
      });
    }

    return NextResponse.json({
      apiKey: masked.maskedKey,
      model: (masked.metadata?.model as string) || OPENROUTER_DEFAULT_MODEL,
      isConfigured: true,
    });
  } catch (error) {
    console.error('Openrouter config GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}

// 設定を保存（ユーザーごと・暗号化DBへ）
export async function POST(request: NextRequest) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { apiKey, model } = body;

    if (!model) {
      return NextResponse.json(
        { error: 'Model selection is required' },
        { status: 400 }
      );
    }

    // キーがマスク済み（未変更）なら、モデルだけ更新しキー本体は保持する
    if (isMaskedKey(apiKey)) {
      const updated = await updateMetadata(
        userId,
        OPENROUTER_SERVICE_TYPE,
        OPENROUTER_SERVICE_NAME,
        { model }
      );
      if (!updated) {
        return NextResponse.json(
          { error: 'Valid Openrouter API key is required' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Configuration saved successfully',
      });
    }

    if (!apiKey.startsWith('sk-or-')) {
      return NextResponse.json(
        { error: 'Valid Openrouter API key is required' },
        { status: 400 }
      );
    }

    await saveApiKey({
      userId,
      serviceType: OPENROUTER_SERVICE_TYPE,
      name: OPENROUTER_SERVICE_NAME,
      apiKey,
      metadata: { model },
    });

    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully',
    });
  } catch (error) {
    console.error('Openrouter config POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

// 設定を削除（ユーザーごと）
export async function DELETE() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteApiKey(
      userId,
      OPENROUTER_SERVICE_TYPE,
      OPENROUTER_SERVICE_NAME
    );

    return NextResponse.json({
      success: true,
      message: 'Configuration deleted successfully',
    });
  } catch (error) {
    console.error('Openrouter config DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}
