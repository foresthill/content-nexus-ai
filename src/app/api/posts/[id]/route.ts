import { NextRequest, NextResponse } from 'next/server';
import { QueueManager } from '@/lib/queue/manager';

const queueManager = new QueueManager();

// ジョブの詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobStatus = await queueManager.getJobStatus(params.id);
    
    return NextResponse.json(jobStatus);
  } catch (error: any) {
    console.error('Get job status error:', error);
    
    if (error.message === 'Job not found') {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
}

// ジョブの更新（スケジュール変更）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { scheduledAt } = body;
    
    if (!scheduledAt) {
      return NextResponse.json(
        { error: 'scheduledAt is required' },
        { status: 400 }
      );
    }
    
    await queueManager.updateSchedule(params.id, new Date(scheduledAt));
    
    return NextResponse.json({
      success: true,
      message: 'Schedule updated'
    });
  } catch (error: any) {
    console.error('Update job error:', error);
    
    if (error.message === 'Job not found') {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

// ジョブのキャンセル
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await queueManager.cancelJob(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Job cancelled'
    });
  } catch (error: any) {
    console.error('Cancel job error:', error);
    
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    );
  }
}

// 失敗したジョブのリトライ
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    if (action !== 'retry') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    const newJob = await queueManager.retryFailedJob(params.id);
    
    return NextResponse.json({
      success: true,
      newJobId: newJob.id,
      message: 'Job retry scheduled'
    });
  } catch (error: any) {
    console.error('Retry job error:', error);
    
    if (error.message === 'Job not found') {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Job is not in failed state') {
      return NextResponse.json(
        { error: 'Job is not in failed state' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to retry job' },
      { status: 500 }
    );
  }
}