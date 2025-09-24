import { NextRequest, NextResponse } from 'next/server';
import { DifyService } from '@/lib/dify/service';
import { getDifyConfig } from '@/lib/dify/config';

interface ContentGenerationRequest {
  // 基本入力
  topic: string;
  keywords?: string[];
  
  // コンテンツ設定
  contentType?: 'blog' | 'social' | 'email' | 'product' | 'other';
  tone?: 'professional' | 'casual' | 'friendly' | 'formal' | 'creative';
  length?: 'short' | 'medium' | 'long';
  
  // ターゲット設定
  targetAudience?: string;
  platform?: string;
  
  // RAG/ナレッジ設定
  useKnowledge?: boolean;
  knowledgeIds?: string[];
  
  // カスタムパラメータ
  customInputs?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContentGenerationRequest = await request.json();
    
    // 必須パラメータのチェック
    if (!body.topic) {
      return NextResponse.json(
        { error: 'topic パラメータが必要です' },
        { status: 400 }
      );
    }

    // Dify設定を取得
    const difyConfig = await getDifyConfig();
    
    if (!difyConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません' },
        { status: 401 }
      );
    }

    // DifyServiceを初期化
    const difyService = new DifyService(difyConfig);
    
    // ワークフロー入力を構築
    const workflowInputs = {
      // 基本入力
      topic: body.topic,
      keywords: body.keywords?.join(', ') || '',
      
      // コンテンツ設定
      content_type: body.contentType || 'blog',
      tone: body.tone || 'professional',
      length: body.length || 'medium',
      
      // ターゲット設定
      target_audience: body.targetAudience || 'general',
      platform: body.platform || 'web',
      
      // RAG/ナレッジ設定
      use_knowledge: body.useKnowledge || false,
      knowledge_ids: body.knowledgeIds?.join(',') || '',
      
      // カスタムパラメータをマージ
      ...body.customInputs,
    };

    console.log('Executing workflow with inputs:', workflowInputs);

    // アプリケーションタイプに応じて適切なメソッドを使用
    let result;
    
    // まずアプリタイプを確認
    let appType = 'unknown';
    let appInfo = null;
    try {
      console.log('Fetching app info...');
      appInfo = await difyService.getAppInfo();
      console.log('Raw app info response:', JSON.stringify(appInfo, null, 2));
      
      // レスポンスの構造を確認
      const mode = appInfo?.mode || appInfo?.app_type || appInfo?.type;
      appType = mode || 'completion'; // デフォルトはCompletion
      console.log('Detected app type:', appType, 'from field:', mode ? 'mode' : (appInfo?.app_type ? 'app_type' : 'type'));
    } catch (error: any) {
      console.error('App info fetch failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        stack: error.stack
      });
      appType = 'completion';
    }
    
    try {
      // アプリタイプに基づいて適切なAPIを使用
      if (appType === 'workflow') {
        console.log('Using Workflow API');
        result = await difyService.executeWorkflow(
          '', // workflowIdは設定から取得するか、デフォルトを使用
          workflowInputs
        );
      } else if (appType === 'chat' || appType === 'chatbot') {
        console.log('Using Chat API');
        // Chat APIの場合、会話形式で実行
        const prompt = `トピック: ${body.topic}
コンテンツタイプ: ${body.contentType || 'blog'}
トーン: ${body.tone || 'professional'}
長さ: ${body.length || 'medium'}
${body.keywords ? `キーワード: ${body.keywords.join(', ')}` : ''}

上記の条件でコンテンツを生成してください。`;

        result = await difyService.sendChatMessage(prompt, 'content-generator');
      } else {
        console.log('Using Completion API');
        // Completion APIの場合
        const prompt = `以下の条件でコンテンツを生成してください：

トピック: ${body.topic}
コンテンツタイプ: ${body.contentType || 'blog'}
トーン: ${body.tone || 'professional'}
長さ: ${body.length || 'medium'}
${body.keywords ? `キーワード: ${body.keywords.join(', ')}` : ''}
${body.targetAudience ? `対象読者: ${body.targetAudience}` : ''}

高品質で魅力的なコンテンツを作成してください。`;

        result = await difyService.client.complete({
          inputs: {
            query: prompt,
            ...workflowInputs
          },
          response_mode: 'blocking',
          user: 'content-generator'
        });
      }
    } catch (error: any) {
      // ワークフローエラーの場合、通常のコンテンツ生成を試みる
      if (error?.code === 'not_workflow_app' || error?.status === 400) {
        console.log('Workflow APIが使えないため、Completion APIを使用します');
        
        // プロンプトを構築
        const prompt = `
トピック: ${body.topic}
${body.keywords?.length ? `キーワード: ${body.keywords.join(', ')}` : ''}
コンテンツタイプ: ${body.contentType || 'blog'}
トーン: ${body.tone || 'professional'}
長さ: ${body.length || 'medium'}
ターゲットオーディエンス: ${body.targetAudience || 'general'}

上記の条件で高品質なコンテンツを生成してください。
タイトル、本文、要約を含めてください。
`;

        // まずChat APIを試す
        try {
          console.log('Chat APIを使用してコンテンツを生成します');
          const chatResult = await difyService.client.chat({
            query: prompt,
            user: 'content-generator',
            response_mode: 'blocking',
            conversation_id: '',
            inputs: {}, // 空のinputsを渡す
          });

          // チャット結果からコンテンツを抽出
          const generatedContent = chatResult.answer || '';
          
          // タイトルを抽出または生成
          let title = body.topic;
          const titleMatch = generatedContent.match(/^#\s*(.+)$/m);
          if (titleMatch) {
            title = titleMatch[1];
          }
          
          // 要約を生成
          const summary = generatedContent.substring(0, 200) + '...';
          
          // レスポンスを整形
          result = {
            data: {
              outputs: {
                title: title,
                content: generatedContent,
                main_content: generatedContent,
                summary: summary,
                keywords: body.keywords?.join(',') || '',
              },
              workflow_run_id: 'chat-' + Date.now(),
              elapsed_time: 0,
              total_tokens: chatResult.metadata?.usage?.total_tokens || 0,
              cost: '0',
            }
          };
        } catch (chatError: any) {
          console.error('Chat API error:', chatError);
          
          // Chat APIも失敗した場合、Completion APIを試す
          if (chatError?.code === 'invalid_param' || chatError?.status === 400) {
            console.log('Completion APIを使用します');
            
            // Difyの仕様に合わせて、inputsをqueryとして送信
            const completionResult = await difyService.client.complete({
              inputs: {
                query: prompt, // queryをinputsの中に入れる
              },
              user: 'content-generator',
              response_mode: 'blocking',
            });
            
            const generatedContent = completionResult.answer || '';
            
            result = {
              data: {
                outputs: {
                  title: body.topic,
                  content: generatedContent,
                  main_content: generatedContent,
                  summary: generatedContent.substring(0, 200) + '...',
                  keywords: body.keywords?.join(',') || '',
                },
                workflow_run_id: 'completion-' + Date.now(),
                elapsed_time: 0,
                total_tokens: completionResult.metadata?.usage?.total_tokens || 0,
                cost: '0',
              }
            };
          } else {
            throw chatError;
          }
        }
      } else {
        throw error;
      }
    }

    // 出力を整形
    const outputs = (result as any).data?.outputs || {};
    
    // レスポンスを構築
    const response = {
      success: true,
      content: {
        // 生成されたコンテンツ
        title: outputs.title || `${body.topic}について`,
        body: outputs.content || outputs.main_content || '',
        summary: outputs.summary || '',
        
        // メタデータ
        keywords: outputs.keywords ? 
          (typeof outputs.keywords === 'string' ? outputs.keywords.split(',').map((k: string) => k.trim()) : outputs.keywords) : 
          body.keywords || [],
        tags: outputs.tags || [],
        
        // SEO関連
        metaDescription: outputs.meta_description || '',
        slug: outputs.slug || body.topic.toLowerCase().replace(/\s+/g, '-'),
        
        // その他の出力
        additionalOutputs: outputs,
      },
      metadata: {
        workflowRunId: (result as any).workflow_run_id,
        executionTime: (result as any).data?.elapsed_time || 0,
        tokensUsed: 0, // Workflow response doesn't include token count
        cost: '0', // Workflow response doesn't include cost
        timestamp: new Date().toISOString(),
        
        // デバッグ情報を追加
        debug: {
          detectedAppType: appType,
          appInfoRaw: appInfo,
          usedApiType: appType === 'workflow' ? 'workflow' : 
                      appType === 'chat' || appType === 'chatbot' ? 'chat' : 'completion',
          resultStructure: {
            hasWorkflowRunId: !!(result as any).workflow_run_id,
            hasData: !!(result as any).data,
            hasOutputs: !!(result as any).data?.outputs,
            outputKeys: (result as any).data?.outputs ? Object.keys((result as any).data.outputs) : []
          }
        }
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Content generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'コンテンツ生成に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

// バッチ生成用のPOSTエンドポイント
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { topics, sharedConfig } = body;

    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: 'topics 配列が必要です' },
        { status: 400 }
      );
    }

    // Dify設定を取得
    const difyConfig = await getDifyConfig();
    
    if (!difyConfig?.apiKey) {
      return NextResponse.json(
        { error: 'Dify API Keyが設定されていません' },
        { status: 401 }
      );
    }

    const difyService = new DifyService(difyConfig);
    const results = [];

    // 各トピックに対してコンテンツを生成
    for (const topic of topics) {
      try {
        const inputs = {
          topic: typeof topic === 'string' ? topic : topic.topic,
          ...sharedConfig,
          ...(typeof topic === 'object' ? topic : {}),
        };

        const result = await difyService.executeWorkflow('', inputs);
        results.push({
          topic: inputs.topic,
          success: true,
          content: result.data?.outputs || {},
        });
      } catch (error) {
        results.push({
          topic: typeof topic === 'string' ? topic : topic.topic,
          success: false,
          error: error instanceof Error ? error.message : '生成エラー',
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalRequested: topics.length,
      successCount: results.filter(r => r.success).length,
      results,
    });

  } catch (error) {
    console.error('Batch content generation error:', error);
    return NextResponse.json(
      { error: 'バッチ生成に失敗しました' },
      { status: 500 }
    );
  }
}