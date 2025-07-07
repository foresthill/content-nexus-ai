import { NextRequest, NextResponse } from 'next/server';
import { QueueManager } from '@/lib/queue/manager';

const queueManager = new QueueManager();
const deadLetterQueue = queueManager.getDeadLetterQueue();

// Dead Letter Queueの内容を取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform') || undefined;
    const retryable = searchParams.get('retryable');
    const since = searchParams.get('since');

    const filter: any = {};
    if (platform) filter.platform = platform;
    if (retryable !== null) filter.retryable = retryable === 'true';
    if (since) filter.since = new Date(since);

    const entries = deadLetterQueue.getAll(filter);
    const stats = deadLetterQueue.getStats();

    return NextResponse.json({
      entries,
      stats,
      patterns: deadLetterQueue.analyzePatterns()
    });
  } catch (error) {
    console.error('Dead letter queue error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dead letter queue' },
      { status: 500 }
    );
  }
}

// Dead Letter Queueからジョブをリトライ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId, action } = body;

    if (!entryId || !action) {
      return NextResponse.json(
        { error: 'Missing entryId or action' },
        { status: 400 }
      );
    }

    const entry = deadLetterQueue.get(entryId);
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'retry':
        if (!entry.metadata.manualRetryAllowed) {
          return NextResponse.json(
            { error: 'Manual retry not allowed for this entry' },
            { status: 400 }
          );
        }

        // 新しいジョブとして追加
        const job = await queueManager.addPost(entry.data);
        
        // リトライを記録
        deadLetterQueue.recordRetry(entryId);
        
        return NextResponse.json({
          success: true,
          jobId: job.id,
          message: 'Job has been re-queued for retry'
        });

      case 'remove':
        const removed = deadLetterQueue.remove(entryId);
        return NextResponse.json({
          success: removed,
          message: removed ? 'Entry removed' : 'Failed to remove entry'
        });

      case 'addNote':
        const { note } = body;
        if (!note) {
          return NextResponse.json(
            { error: 'Note is required' },
            { status: 400 }
          );
        }
        
        deadLetterQueue.addNote(entryId, note);
        return NextResponse.json({
          success: true,
          message: 'Note added'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Dead letter queue action error:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}

// Dead Letter Queueをエクスポート
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    if (format === 'json') {
      const data = deadLetterQueue.export();
      
      return new NextResponse(data, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="dead-letter-queue-${Date.now()}.json"`
        }
      });
    }

    return NextResponse.json(
      { error: 'Unsupported format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Dead letter queue export error:', error);
    return NextResponse.json(
      { error: 'Failed to export dead letter queue' },
      { status: 500 }
    );
  }
}