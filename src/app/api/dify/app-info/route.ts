import { NextRequest, NextResponse } from 'next/server';
import { getDifyConfig } from '@/lib/dify/config';

// Difyアプリケーションの情報を取得
export async function GET(request: NextRequest) {
  try {
    const difyConfig = await getDifyConfig();
    
    if (!difyConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません' },
        { status: 401 }
      );
    }

    // Dify APIでアプリケーション情報を取得
    const response = await fetch(`${difyConfig.baseUrl}/parameters`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${difyConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dify app info error:', errorText);
      
      // メタ情報を取得（パラメータAPIが使えない場合）
      const metaResponse = await fetch(`${difyConfig.baseUrl}/meta`, {
        method: 'GET', 
        headers: {
          'Authorization': `Bearer ${difyConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (metaResponse.ok) {
        const metaData = await metaResponse.json();
        return NextResponse.json({
          appType: 'unknown',
          meta: metaData,
          message: 'メタ情報から判断してください',
        });
      }

      return NextResponse.json(
        { error: 'アプリケーション情報の取得に失敗しました' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // アプリケーションタイプを判定
    let appType = 'unknown';
    if (data.system_parameters) {
      appType = 'chat'; // チャットアプリケーション
    } else if (data.user_input_form) {
      appType = 'completion'; // 完了型アプリケーション
    }

    return NextResponse.json({
      appType,
      parameters: data,
      message: `アプリケーションタイプ: ${appType}`,
    });

  } catch (error) {
    console.error('App info error:', error);
    return NextResponse.json(
      { error: 'アプリケーション情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}