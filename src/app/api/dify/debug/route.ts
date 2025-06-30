import { NextRequest, NextResponse } from 'next/server';
import { difyStore } from '@/store/difyStore';

// デバッグ用エンドポイント - 現在の設定状態を確認
export async function GET(request: NextRequest) {
  try {
    const state = difyStore.getState();
    
    return NextResponse.json({
      hasConfig: !!state.config,
      isConfigured: state.isConfigured,
      hasApiKey: !!state.config?.apiKey,
      apiKeyLength: state.config?.apiKey?.length || 0,
      apiKeyPrefix: state.config?.apiKey?.substring(0, 10) || 'none',
      baseUrl: state.config?.baseUrl || 'not set',
      appId: state.config?.appId || 'not set',
      isConnected: state.isConnected,
      connectionError: state.connectionError,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get debug info',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}