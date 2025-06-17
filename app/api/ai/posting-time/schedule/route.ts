import { NextRequest, NextResponse } from 'next/server';
import { PostingTimePredictor } from '@/lib/ai/posting-time/predictor';
import { QueueManager } from '@/lib/queue/manager';
import { SocialPlatform } from '@/types/social';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      postId, 
      platforms, 
      targetAudience, 
      contentType, 
      timeZone = 'UTC',
      content,
      userId 
    } = body;

    if (!postId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Post ID and platforms are required' },
        { status: 400 }
      );
    }

    const queueManager = new QueueManager();
    const scheduledJobs: Array<{
      platform: string;
      jobId: string;
      scheduledAt: Date;
      optimalTime: { hour: number; dayOfWeek: string; reason: string };
      confidence: number;
    }> = [];

    // Get optimal times for each platform and schedule
    for (const platform of platforms) {
      const predictor = new PostingTimePredictor(platform as SocialPlatform);
      
      // Get optimal posting time for this platform
      const predictions = await predictor.predictOptimalTimes({
        targetAudience,
        contentType,
        timeZone,
        numberOfSlots: 1 // Get the best single time slot
      });

      if (predictions.length > 0) {
        const optimalTime = predictions[0];
        
        // Calculate the actual scheduled date/time
        const scheduledDate = calculateScheduledDate(optimalTime, timeZone);
        
        // Create job data for the queue
        const jobData = {
          id: `${postId}-${platform}`,
          platform: platform as SocialPlatform,
          content: content[platform] || content.default,
          scheduledAt: scheduledDate,
          userId,
          credentials: await getUserCredentials(userId, platform), // You'll need to implement this
          metadata: {
            postId,
            optimalTimeReason: optimalTime.reason,
            confidence: predictor.getConfidenceScore()
          }
        };

        // Add to queue
        const job = await queueManager.addPost(jobData);
        
        scheduledJobs.push({
          platform,
          jobId: String(job.id),
          scheduledAt: scheduledDate,
          optimalTime: {
            hour: optimalTime.hour,
            dayOfWeek: optimalTime.dayOfWeek,
            reason: optimalTime.reason || ''
          },
          confidence: predictor.getConfidenceScore()
        });
      }
    }

    return NextResponse.json({
      postId,
      scheduledJobs,
      message: `Successfully scheduled ${scheduledJobs.length} posts`
    });

  } catch (error) {
    console.error('Error scheduling optimal posts:', error);
    return NextResponse.json(
      { error: 'Failed to schedule posts at optimal times' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const queueManager = new QueueManager();
    
    // Get all jobs for this post
    const activeJobs = await queueManager.getActiveJobs();
    const pendingJobs = await queueManager.getPendingJobs(50);
    
    const postJobs = [...activeJobs, ...pendingJobs].filter(
      job => job.data.metadata?.postId === postId
    );

    const scheduledPosts = await Promise.all(
      postJobs.map(async (job) => {
        const status = await queueManager.getJobStatus(job.id!.toString());
        return {
          platform: job.data.platform,
          jobId: job.id,
          scheduledAt: job.data.scheduledAt,
          status: status.status,
          progress: status.progress,
          error: status.error,
          metadata: job.data.metadata
        };
      })
    );

    return NextResponse.json({
      postId,
      scheduledPosts,
      summary: {
        total: scheduledPosts.length,
        pending: scheduledPosts.filter(p => p.status === 'waiting').length,
        active: scheduledPosts.filter(p => p.status === 'active').length,
        completed: scheduledPosts.filter(p => p.status === 'completed').length,
        failed: scheduledPosts.filter(p => p.status === 'failed').length
      }
    });

  } catch (error) {
    console.error('Error getting scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to get scheduled posts' },
      { status: 500 }
    );
  }
}

function calculateScheduledDate(optimalTime: { hour: number; dayOfWeek: string }, timeZone: string): Date {
  const now = new Date();
  const scheduledDate = new Date();
  
  // Set the optimal hour
  scheduledDate.setHours(optimalTime.hour, 0, 0, 0);
  
  // If the optimal day is specified and not 'all'
  if (optimalTime.dayOfWeek !== 'all') {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(optimalTime.dayOfWeek.toLowerCase());
    const currentDay = now.getDay();
    
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7; // Next week
    }
    
    scheduledDate.setDate(scheduledDate.getDate() + daysUntilTarget);
  }
  
  // If the time has already passed today, schedule for tomorrow/next occurrence
  if (scheduledDate <= now) {
    if (optimalTime.dayOfWeek === 'all') {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
  }
  
  // Apply timezone offset if needed
  // In a production environment, use a proper timezone library like date-fns-tz
  const timezoneOffsets: Record<string, number> = {
    'UTC': 0,
    'EST': -5,
    'CST': -6,
    'MST': -7,
    'PST': -8,
    'JST': 9
  };
  
  const offset = timezoneOffsets[timeZone] || 0;
  scheduledDate.setHours(scheduledDate.getHours() - offset);
  
  return scheduledDate;
}

async function getUserCredentials(userId: string, platform: SocialPlatform): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  // In a real implementation, fetch user's social media credentials from database
  // This is a placeholder that should be replaced with actual credential fetching
  return {
    accessToken: process.env[`${platform.toUpperCase()}_ACCESS_TOKEN`] || 'placeholder',
    refreshToken: process.env[`${platform.toUpperCase()}_REFRESH_TOKEN`] || 'placeholder',
    // Add other platform-specific credentials as needed
  };
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const queueManager = new QueueManager();
    await queueManager.cancelJob(jobId);

    return NextResponse.json({
      message: 'Scheduled post cancelled successfully',
      jobId
    });

  } catch (error) {
    console.error('Error cancelling scheduled post:', error);
    return NextResponse.json(
      { error: 'Failed to cancel scheduled post' },
      { status: 500 }
    );
  }
}