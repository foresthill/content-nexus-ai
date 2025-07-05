import { NextRequest, NextResponse } from 'next/server';
import { DifyService } from '@/lib/dify/service';
import { getDifyConfig } from '@/lib/dify/config';

// チャットアプリケーション専用のコンテンツ生成API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.topic) {
      return NextResponse.json(
        { error: 'topic パラメータが必要です' },
        { status: 400 }
      );
    }

    const difyConfig = await getDifyConfig();
    
    if (!difyConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません' },
        { status: 401 }
      );
    }

    const difyService = new DifyService(difyConfig);
    
    // プロンプトを構築
    const messages = [];
    
    // システムメッセージ
    messages.push(`あなたは優秀なコンテンツライターです。以下の条件に従って高品質なコンテンツを生成してください。

出力形式:
1. タイトル（#で始まる）
2. 本文（段落に分けて読みやすく）
3. まとめ（##で始まる）

条件:
- トピック: ${body.topic}
- キーワード: ${body.keywords?.join(', ') || 'なし'}
- トーン: ${body.tone || 'professional'}
- 長さ: ${body.length === 'short' ? '200-300文字' : body.length === 'long' ? '1000文字以上' : '500-700文字'}
- ターゲット: ${body.targetAudience || '一般読者'}
`);

    // ユーザーメッセージ
    const userMessage = `「${body.topic}」について、指定された条件でコンテンツを作成してください。`;

    // Chat APIを直接呼び出す
    const response = await difyService.client.chat({
      query: userMessage,
      user: 'content-generator',
      inputs: {
        topic: body.topic,
        keywords: body.keywords?.join(', ') || '',
        tone: body.tone || 'professional',
        length: body.length || 'medium',
        audience: body.targetAudience || 'general',
      },
      conversation_id: body.conversationId,
      response_mode: 'blocking',
    });

    // レスポンスから情報を抽出
    const content = response.answer || '';
    
    // タイトルを抽出
    let title = body.topic;
    const titleMatch = content.match(/^#\s*(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
    
    // 要約を抽出または生成
    let summary = '';
    const summaryMatch = content.match(/##\s*まとめ\s*\n([\s\S]+?)(?=\n##|$)/);
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    } else {
      summary = content.substring(0, 200) + '...';
    }

    return NextResponse.json({
      success: true,
      content: {
        title,
        body: content,
        summary,
        keywords: body.keywords || [],
        tags: [],
        metaDescription: summary.substring(0, 160),
        slug: body.topic.toLowerCase().replace(/\s+/g, '-'),
      },
      metadata: {
        conversationId: response.conversation_id,
        messageId: response.message_id,
        createdAt: response.created_at || Date.now(),
        model: 'dify-chat',
        tokensUsed: response.metadata?.usage?.total_tokens || 0,
      },
    });
    
  } catch (error) {
    console.error('Chat generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'チャットでのコンテンツ生成に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

// 会話を続ける
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message } = body;

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'conversationId と message が必要です' },
        { status: 400 }
      );
    }

    const difyConfig = await getDifyConfig();
    
    if (!difyConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません' },
        { status: 401 }
      );
    }

    const difyService = new DifyService(difyConfig);
    
    const response = await difyService.client.chat({
      query: message,
      user: 'content-generator',
      conversation_id: conversationId,
      response_mode: 'blocking',
    });

    return NextResponse.json({
      success: true,
      answer: response.answer,
      conversationId: response.conversation_id,
      messageId: response.message_id,
    });

  } catch (error) {
    console.error('Chat continuation error:', error);
    return NextResponse.json(
      { error: '会話の継続に失敗しました' },
      { status: 500 }
    );
  }
}