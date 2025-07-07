import { NextRequest, NextResponse } from 'next/server';
import { getDifyConfig } from '@/lib/dify/config';

// シンプルなテストAPI - 最小限のパラメータで動作確認
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message = 'こんにちは' } = body;

    const difyConfig = await getDifyConfig();
    
    if (!difyConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません' },
        { status: 401 }
      );
    }

    console.log('Dify Config:', {
      hasApiKey: !!difyConfig.apiKey,
      baseUrl: difyConfig.baseUrl,
      appId: difyConfig.appId,
    });

    // 1. 最もシンプルなChat API呼び出し
    try {
      console.log('Test 1: Simple chat message');
      const chatResponse = await fetch(`${difyConfig.baseUrl}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${difyConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {},
          query: message,
          response_mode: 'blocking',
          conversation_id: '',
          user: 'test-user',
        }),
      });

      const chatData = await chatResponse.json();
      console.log('Chat response:', chatResponse.status, chatData);

      if (chatResponse.ok) {
        return NextResponse.json({
          success: true,
          type: 'chat',
          response: chatData,
        });
      }
    } catch (error) {
      console.error('Chat API error:', error);
    }

    // 2. Completion API を試す
    try {
      console.log('Test 2: Completion API');
      const completionResponse = await fetch(`${difyConfig.baseUrl}/completion-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${difyConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            query: message,
          },
          response_mode: 'blocking',
          user: 'test-user',
        }),
      });

      const completionData = await completionResponse.json();
      console.log('Completion response:', completionResponse.status, completionData);

      if (completionResponse.ok) {
        return NextResponse.json({
          success: true,
          type: 'completion',
          response: completionData,
        });
      }
    } catch (error) {
      console.error('Completion API error:', error);
    }

    // 3. メッセージ送信API（別の形式）
    try {
      console.log('Test 3: Alternative message format');
      const messageResponse = await fetch(`${difyConfig.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${difyConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {},
          query: message,
          user: 'test-user',
        }),
      });

      const messageData = await messageResponse.json();
      console.log('Message response:', messageResponse.status, messageData);

      if (messageResponse.ok) {
        return NextResponse.json({
          success: true,
          type: 'message',
          response: messageData,
        });
      }
    } catch (error) {
      console.error('Message API error:', error);
    }

    return NextResponse.json({
      error: 'すべてのAPIが失敗しました',
      message: '上記のコンソールログを確認してください',
    }, { status: 500 });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'テスト中にエラーが発生しました' },
      { status: 500 }
    );
  }
}