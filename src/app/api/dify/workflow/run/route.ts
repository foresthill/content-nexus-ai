import { NextRequest, NextResponse } from 'next/server';
import { DifyService } from '@/lib/dify/service';
import { getDifyConfig } from '@/lib/dify/config';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    const { 
      workflowId,
      inputs,
      responseMode = 'blocking' // blocking or streaming
    } = body;

    // 必須パラメータのチェック
    if (!inputs) {
      return NextResponse.json(
        { error: 'inputs パラメータが必要です' },
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
    
    // ワークフローを実行
    const result = await difyService.executeWorkflow(
      workflowId || '', // workflowIdが指定されていない場合は空文字列
      {
        ...inputs,
        response_mode: responseMode,
      }
    );

    // 結果を返す
    return NextResponse.json({
      success: true,
      workflowRunId: result.workflow_run_id,
      outputs: result.data?.outputs || {},
      status: result.data?.status || 'completed',
      createdAt: result.data?.created_at || Date.now(),
      elapsed_time: result.data?.elapsed_time || 0,
      total_tokens: 0, // Workflow doesn't provide token count
      cost: '0', // Workflow doesn't provide cost
    });
    
  } catch (error) {
    console.error('Dify workflow execution error:', error);
    
    // エラーレスポンス
    return NextResponse.json(
      { 
        error: 'ワークフローの実行に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}

// ワークフロー実行状態を確認するGETエンドポイント
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowRunId = searchParams.get('workflow_run_id');

    if (!workflowRunId) {
      return NextResponse.json(
        { error: 'workflow_run_id パラメータが必要です' },
        { status: 400 }
      );
    }

    // TODO: Difyの実行状態確認APIを実装
    // 現時点では、モックレスポンスを返す
    return NextResponse.json({
      workflowRunId,
      status: 'completed',
      progress: 100,
      message: 'ワークフローの実行が完了しました',
    });

  } catch (error) {
    console.error('Workflow status check error:', error);
    return NextResponse.json(
      { error: 'ワークフロー状態の確認に失敗しました' },
      { status: 500 }
    );
  }
}