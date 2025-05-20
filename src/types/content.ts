export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum PlatformType {
  BLOG = 'blog',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  NOTE = 'note',
  OTHER = 'other'
}

export interface PlatformData {
  type: PlatformType;
  url?: string;
  accountName?: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  engagement?: {
    likes?: number;
    shares?: number;
    comments?: number;
    clicks?: number;
  };
}

export interface Content {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  category: string[];
  tags: string[];
  status: ContentStatus;
  featuredImage?: string;
  publishedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
  affiliateLinks: AffiliateLink[];
  platforms: PlatformData[];
}

export interface AffiliateLink {
  id: string;
  title: string;
  url: string;
  imageUrl?: string;
  description?: string;
}