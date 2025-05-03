export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
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
}

export interface AffiliateLink {
  id: string;
  title: string;
  url: string;
  imageUrl?: string;
  description?: string;
}