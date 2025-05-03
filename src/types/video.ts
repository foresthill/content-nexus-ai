export enum VideoType {
  SHORT = 'short',         // ショート動画 (15-60秒)
  TIKTOK = 'tiktok',       // TikTok向け (15-60秒)
  YOUTUBE_SHORTS = 'youtube_shorts', // YouTube Shorts向け (60秒まで)
  INSTAGRAM_REELS = 'instagram_reels', // Instagram Reels向け (90秒まで)
  LINE_VOOM = 'line_voom', // LINE VOOM向け
  LONG = 'long'           // 長尺動画
}

export enum VideoStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface AspectRatio {
  width: number;
  height: number;
}

export interface VideoEffect {
  id: string;
  name: string;
  type: 'filter' | 'transition' | 'text' | 'sound';
  settings: Record<string, unknown>;
  startTime?: number;
  endTime?: number;
}

export interface PlatformExport {
  platform: VideoType;
  url: string;
  createdAt: Date;
  status: 'processing' | 'ready' | 'failed';
  downloadUrl?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  type: VideoType;
  url: string;
  thumbnailUrl: string;
  duration: number; // 秒単位
  author: string;
  category: string[];
  tags: string[];
  status: VideoStatus;
  relatedContentId?: string; // 関連するブログ記事ID（ショート動画の場合）
  publishedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
  
  // ショート動画用の拡張フィールド
  aspectRatio?: AspectRatio;
  effects?: VideoEffect[];
  soundUrl?: string;
  soundName?: string;
  exportedVersions?: PlatformExport[];
  
  // 投稿サポート情報
  recommendedHashtags?: string[];
  captionTemplate?: string;
  bestPostTime?: string;
}

export interface VideoProject {
  id: string;
  name: string;
  description?: string;
  videoId: string;
  originalVideoUrl: string;
  editedVideoUrl?: string;
  thumbnailUrl?: string;
  targetPlatforms: VideoType[];
  effects: VideoEffect[];
  soundUrl?: string;
  soundName?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'editing' | 'ready' | 'exported';
  exports?: PlatformExport[];
}