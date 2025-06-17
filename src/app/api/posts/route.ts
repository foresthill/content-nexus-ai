import { NextRequest, NextResponse } from 'next/server';
import { QueueManager } from '@/lib/queue/manager';
import jwt from 'jsonwebtoken';

const queueManager = new QueueManager();

// 認証トークンの検証
function verifyAuthToken(request: NextRequest, platform: string) {
  const token = request.cookies.get(`sns-auth-${platform}`)?.value;
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, content, scheduledAt, metadata } = body;
    
    // プラットフォーム検証
    if (!['twitter', 'instagram', 'tiktok'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }
    
    // 認証情報の取得
    interface AuthData {
      userId?: string;
      openId?: string;
      accessToken: string;
      accessTokenSecret?: string;
      refreshToken?: string;
    }
    const authData = verifyAuthToken(request, platform) as AuthData;
    
    // userIdの検証
    const userId = authData.userId || authData.openId;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in authentication data' },
        { status: 400 }
      );
    }
    
    // ジョブデータの構築
    const jobData = {
      id: crypto.randomUUID(),
      platform: platform as 'twitter' | 'instagram' | 'tiktok',
      content,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      userId,
      credentials: {
        accessToken: authData.accessToken,
        accessTokenSecret: authData.accessTokenSecret,
        refreshToken: authData.refreshToken,
        openId: authData.openId
      },
      metadata
    };
    
    // キューに追加
    const job = await queueManager.addPost(jobData);
    
    return NextResponse.json({
      jobId: job.id,
      status: 'queued',
      platform,
      scheduledAt: jobData.scheduledAt
    });
  } catch (error) {
    console.error('Post creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// ジョブ一覧の取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let jobs;
    
    switch (status) {
      case 'pending':
        jobs = await queueManager.getPendingJobs(limit);
        break;
      case 'active':
        jobs = await queueManager.getActiveJobs();
        break;
      case 'completed':
        jobs = await queueManager.getCompletedJobs(limit);
        break;
      case 'failed':
        jobs = await queueManager.getFailedJobs(limit);
        break;
      case 'all':
      default:
        const [pending, active, completed, failed] = await Promise.all([
          queueManager.getPendingJobs(5),
          queueManager.getActiveJobs(),
          queueManager.getCompletedJobs(5),
          queueManager.getFailedJobs(5)
        ]);
        
        jobs = {
          pending: pending.map(formatJob),
          active: active.map(formatJob),
          completed: completed.map(formatJob),
          failed: failed.map(formatJob)
        };
        
        return NextResponse.json(jobs);
    }
    
    return NextResponse.json(jobs.map(formatJob));
  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to get jobs' },
      { status: 500 }
    );
  }
}

// ジョブデータのフォーマット
interface JobData {
  platform: string;
  content: any; // Bull allows any type for job data
  scheduledAt?: Date;
  [key: string]: any; // Allow additional properties
}

interface Job {
  id: string | number;
  data: JobData;
  opts: {
    delay?: number;
  };
  progress(): number;
  timestamp: number;
  processedOn?: number;
  failedReason?: string;
}

function formatJob(job: Job) {
  return {
    id: String(job.id),
    platform: job.data.platform,
    content: typeof job.data.content === 'string' ? job.data.content : JSON.stringify(job.data.content),
    scheduledAt: job.data.scheduledAt,
    status: job.opts.delay ? 'scheduled' : 'pending',
    progress: job.progress(),
    createdAt: new Date(job.timestamp),
    processedAt: job.processedOn ? new Date(job.processedOn) : null,
    failedReason: job.failedReason
  };
}