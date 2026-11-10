import { NextResponse } from 'next/server';

interface OpenrouterApiModel {
  id: string;
  name?: string;
  description?: string;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

// OpenRouter の公開モデル一覧を取得して返す。
// 一覧はハードコードせず OpenRouter 自身の API を正とすることで、常に最新のモデルを扱える。
// エンドポイントは認証不要。レスポンスは 1 時間キャッシュする。
export async function GET() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 * 60 }, // 1時間キャッシュ
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch models: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const models = (data.data as OpenrouterApiModel[])
      .map((m) => ({
        id: m.id,
        name: m.name || m.id,
        description: m.description || '',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Openrouter models GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
