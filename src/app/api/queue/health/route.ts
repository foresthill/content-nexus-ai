import { NextRequest, NextResponse } from 'next/server';
import { QueueManager } from '@/lib/queue/manager';
import { circuitBreakerManager } from '@/lib/queue/circuit-breaker';

const queueManager = new QueueManager();

// キューシステムのヘルスチェック
export async function GET(request: NextRequest) {
  try {
    // 基本的なヘルスチェック
    const health = await queueManager.healthCheck();
    
    // キューの統計情報
    const queueStats = await queueManager.getQueueStats();
    
    // Circuit Breakerの詳細状態
    const circuitBreakerDetails = queueManager.getCircuitBreakerStatus();
    
    // リトライ分析
    const retryAnalysis = queueManager.getRetryAnalysis();
    
    // Dead Letter Queueの統計
    const deadLetterStats = queueManager.getDeadLetterQueue().getStats();
    
    // 総合的な健康状態を判定
    const overallHealth = {
      status: health.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      components: {
        queues: {
          status: health.queues.post && health.queues.retry ? 'operational' : 'degraded',
          details: {
            post: {
              connected: health.queues.post,
              stats: {
                waiting: queueStats.waiting,
                active: queueStats.active,
                completed: queueStats.completed,
                failed: queueStats.failed,
                delayed: queueStats.delayed
              }
            },
            retry: {
              connected: health.queues.retry
            }
          }
        },
        circuitBreakers: {
          status: Object.values(health.circuitBreakers).every(state => state === 'CLOSED') 
            ? 'operational' 
            : 'degraded',
          platforms: health.circuitBreakers,
          details: circuitBreakerDetails
        },
        deadLetterQueue: {
          status: deadLetterStats.total > 100 ? 'warning' : 'operational',
          count: deadLetterStats.total,
          stats: deadLetterStats
        },
        retryStrategy: {
          status: 'operational',
          analysis: retryAnalysis
        }
      },
      recommendations: generateRecommendations(health, queueStats, deadLetterStats)
    };
    
    // 適切なHTTPステータスコードを設定
    const statusCode = overallHealth.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(overallHealth, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Failed to perform health check',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

// Circuit Breakerの手動操作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, platform } = body;
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'reset':
        if (platform) {
          circuitBreakerManager.resetPlatform(platform);
          return NextResponse.json({
            success: true,
            message: `Circuit breaker for ${platform} has been reset`
          });
        } else {
          circuitBreakerManager.resetAll();
          return NextResponse.json({
            success: true,
            message: 'All circuit breakers have been reset'
          });
        }
        
      case 'open':
        if (!platform) {
          return NextResponse.json(
            { error: 'Platform is required for open action' },
            { status: 400 }
          );
        }
        
        const breaker = circuitBreakerManager.getBreaker(platform);
        breaker.manualOpen();
        
        return NextResponse.json({
          success: true,
          message: `Circuit breaker for ${platform} has been opened`
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "reset" or "open"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Circuit breaker control error:', error);
    return NextResponse.json(
      { error: 'Failed to control circuit breaker' },
      { status: 500 }
    );
  }
}

// 推奨事項を生成
function generateRecommendations(
  health: any,
  queueStats: any,
  deadLetterStats: any
): string[] {
  const recommendations: string[] = [];
  
  // キューの健康状態チェック
  if (!health.queues.post || !health.queues.retry) {
    recommendations.push('Queue connection issues detected. Check Redis connection.');
  }
  
  // 失敗ジョブが多い場合
  if (queueStats.failed > 50) {
    recommendations.push(`High number of failed jobs (${queueStats.failed}). Review error logs and retry strategies.`);
  }
  
  // Circuit Breakerが開いている場合
  Object.entries(health.circuitBreakers).forEach(([platform, state]) => {
    if (state === 'OPEN') {
      recommendations.push(`Circuit breaker for ${platform} is OPEN. Platform may be experiencing issues.`);
    } else if (state === 'HALF_OPEN') {
      recommendations.push(`Circuit breaker for ${platform} is testing. Monitor closely.`);
    }
  });
  
  // Dead Letter Queueが溜まっている場合
  if (deadLetterStats.total > 100) {
    recommendations.push(`Dead Letter Queue has ${deadLetterStats.total} entries. Manual intervention may be required.`);
  }
  
  if (deadLetterStats.retryableCount > 20) {
    recommendations.push(`${deadLetterStats.retryableCount} entries in DLQ are retryable. Consider batch retry.`);
  }
  
  // アクティブジョブが多すぎる場合
  if (queueStats.active > 100) {
    recommendations.push('High number of active jobs. Consider scaling workers.');
  }
  
  return recommendations;
}