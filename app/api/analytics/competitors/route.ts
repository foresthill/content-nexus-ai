import { NextRequest, NextResponse } from 'next/server';
import { 
  CompetitorProfile, 
  CompetitorPlatformInfo, 
  CompetitorDashboardData,
  CompetitorSearchResult 
} from '@/types/competitor';

// Mock data for demonstration
const mockCompetitors: CompetitorProfile[] = [
  {
    id: 'comp_1',
    name: 'Content Creator Alpha',
    brandName: 'Alpha Studios',
    platforms: [
      {
        platform: 'instagram',
        handle: '@alphastudios',
        url: 'https://instagram.com/alphastudios',
        followerCount: 125000,
        verified: true,
        isActive: true,
        lastChecked: new Date()
      },
      {
        platform: 'tiktok',
        handle: '@alphastudios_official',
        url: 'https://tiktok.com/@alphastudios_official',
        followerCount: 89000,
        verified: false,
        isActive: true,
        lastChecked: new Date()
      }
    ],
    industry: 'Content Creation',
    niche: ['lifestyle', 'fashion', 'travel'],
    targetAudience: ['millennials', 'gen-z'],
    location: 'Los Angeles, CA',
    description: 'Leading lifestyle and fashion content creator',
    website: 'https://alphastudios.com',
    isActive: true,
    addedAt: new Date('2024-01-15'),
    lastUpdatedAt: new Date()
  },
  {
    id: 'comp_2',
    name: 'Digital Maverick',
    brandName: 'Maverick Media',
    platforms: [
      {
        platform: 'youtube',
        handle: '@maverickmedia',
        url: 'https://youtube.com/@maverickmedia',
        followerCount: 245000,
        verified: true,
        isActive: true,
        lastChecked: new Date()
      },
      {
        platform: 'instagram',
        handle: '@maverick_digital',
        url: 'https://instagram.com/maverick_digital',
        followerCount: 156000,
        verified: true,
        isActive: true,
        lastChecked: new Date()
      }
    ],
    industry: 'Digital Marketing',
    niche: ['business', 'entrepreneurship', 'marketing'],
    targetAudience: ['professionals', 'entrepreneurs'],
    location: 'New York, NY',
    description: 'Business and marketing insights for modern entrepreneurs',
    website: 'https://maverickmedia.co',
    isActive: true,
    addedAt: new Date('2024-02-01'),
    lastUpdatedAt: new Date()
  }
];

// Mock dashboard data
const generateDashboardData = (): CompetitorDashboardData => ({
  overview: {
    totalCompetitors: mockCompetitors.length,
    activeCompetitors: mockCompetitors.filter(c => c.isActive).length,
    platformsCovered: 4,
    lastAnalysisDate: new Date()
  },
  performanceSnapshot: {
    yourRank: 3,
    totalRanked: 15,
    topPerformers: [
      { competitorId: 'comp_1', competitorName: 'Alpha Studios', score: 94 },
      { competitorId: 'comp_2', competitorName: 'Maverick Media', score: 91 },
      { competitorId: 'you', competitorName: 'Your Brand', score: 87 }
    ]
  },
  recentInsights: [
    {
      insight: 'Alpha Studios increased posting frequency by 40% this week',
      category: 'trend',
      priority: 'medium',
      actionable: true,
      relatedCompetitors: ['comp_1']
    },
    {
      insight: 'Video content performing 65% better than static posts across competitors',
      category: 'opportunity',
      priority: 'high',
      actionable: true,
      relatedCompetitors: ['comp_1', 'comp_2']
    }
  ],
  trendingTopics: [
    {
      topic: 'sustainable fashion',
      volume: 15420,
      growth: 23.5,
      sentiment: 'positive',
      platforms: [
        { platform: 'instagram', volume: 8500, engagement: 4.2 },
        { platform: 'tiktok', volume: 6920, engagement: 7.8 }
      ],
      competitorParticipation: [
        {
          competitorId: 'comp_1',
          competitorName: 'Alpha Studios',
          contentCount: 12,
          avgEngagement: 5.4,
          shareOfVoice: 18.2
        }
      ]
    }
  ],
  engagementComparison: {
    yourPerformance: {
      totalEngagement: 45000,
      averageEngagementRate: 4.2,
      totalReach: 890000,
      followerGrowthRate: 12.5,
      contentVolume: 156,
      viralContent: 3,
      brandMentions: 245,
      shareOfVoice: 15.8
    },
    competitors: [
      {
        competitorId: 'comp_1',
        competitorName: 'Alpha Studios',
        totalEngagement: 62000,
        averageEngagementRate: 5.1,
        totalReach: 1200000,
        followerGrowthRate: 18.3,
        contentVolume: 189,
        viralContent: 7,
        brandMentions: 412,
        shareOfVoice: 24.7
      }
    ]
  },
  recommendations: [
    {
      recommendation: 'Increase video content production to match competitor performance',
      category: 'content',
      impact: 'high',
      effort: 'medium',
      timeline: 'short_term',
      success_metrics: ['engagement_rate', 'reach', 'video_completion_rate']
    }
  ]
});

// GET - List competitors or get dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    // const search = searchParams.get('search'); // Currently unused
    const platform = searchParams.get('platform');

    if (action === 'dashboard') {
      const dashboardData = generateDashboardData();
      return NextResponse.json(dashboardData);
    }

    if (action === 'search') {
      // Mock search results
      const searchResults: CompetitorSearchResult[] = [
        {
          platform: 'instagram',
          handle: '@newfashionista',
          name: 'New Fashionista',
          followerCount: 85000,
          verified: false,
          profileImage: '/api/placeholder/profile1.jpg',
          description: 'Sustainable fashion advocate',
          estimatedEngagementRate: 3.8,
          niche: ['fashion', 'sustainability'],
          relevanceScore: 0.92
        }
      ];

      return NextResponse.json({
        results: searchResults,
        total: searchResults.length
      });
    }

    // List all competitors with optional filtering
    let filteredCompetitors = mockCompetitors;

    if (platform) {
      filteredCompetitors = mockCompetitors.filter(c => 
        c.platforms.some(p => p.platform === platform)
      );
    }

    return NextResponse.json({
      competitors: filteredCompetitors,
      total: filteredCompetitors.length
    });

  } catch (error) {
    console.error('Error fetching competitors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    );
  }
}

// POST - Add new competitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, brandName, platforms, industry, niche, targetAudience, location, description, website } = body;

    // Validate required fields
    if (!name || !platforms || !industry) {
      return NextResponse.json(
        { error: 'Name, platforms, and industry are required' },
        { status: 400 }
      );
    }

    // Validate platforms
    const validPlatforms = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin'];
    const invalidPlatforms = platforms.filter((p: CompetitorPlatformInfo) => 
      !validPlatforms.includes(p.platform)
    );

    if (invalidPlatforms.length > 0) {
      return NextResponse.json(
        { error: `Invalid platforms: ${invalidPlatforms.map((p: CompetitorPlatformInfo) => p.platform).join(', ')}` },
        { status: 400 }
      );
    }

    // Create new competitor
    const newCompetitor: CompetitorProfile = {
      id: `comp_${Date.now()}`,
      name,
      brandName,
      platforms: platforms.map((p: CompetitorPlatformInfo) => ({
        ...p,
        isActive: true,
        lastChecked: new Date()
      })),
      industry,
      niche: niche || [],
      targetAudience: targetAudience || [],
      location,
      description,
      website,
      isActive: true,
      addedAt: new Date(),
      lastUpdatedAt: new Date()
    };

    // In a real implementation, save to database
    mockCompetitors.push(newCompetitor);

    return NextResponse.json(newCompetitor, { status: 201 });

  } catch (error) {
    console.error('Error adding competitor:', error);
    return NextResponse.json(
      { error: 'Failed to add competitor' },
      { status: 500 }
    );
  }
}

// PUT - Update competitor
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Competitor ID is required' },
        { status: 400 }
      );
    }

    const competitorIndex = mockCompetitors.findIndex(c => c.id === id);
    if (competitorIndex === -1) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Update competitor
    mockCompetitors[competitorIndex] = {
      ...mockCompetitors[competitorIndex],
      ...updateData,
      lastUpdatedAt: new Date()
    };

    return NextResponse.json(mockCompetitors[competitorIndex]);

  } catch (error) {
    console.error('Error updating competitor:', error);
    return NextResponse.json(
      { error: 'Failed to update competitor' },
      { status: 500 }
    );
  }
}

// DELETE - Remove competitor
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Competitor ID is required' },
        { status: 400 }
      );
    }

    const competitorIndex = mockCompetitors.findIndex(c => c.id === id);
    if (competitorIndex === -1) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Remove competitor
    const removedCompetitor = mockCompetitors.splice(competitorIndex, 1)[0];

    return NextResponse.json({
      message: 'Competitor removed successfully',
      competitor: removedCompetitor
    });

  } catch (error) {
    console.error('Error removing competitor:', error);
    return NextResponse.json(
      { error: 'Failed to remove competitor' },
      { status: 500 }
    );
  }
}