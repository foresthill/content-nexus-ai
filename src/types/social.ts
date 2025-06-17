// SNS投稿機能の型定義

// プラットフォームの定義
export type SocialPlatform = 'twitter' | 'instagram' | 'tiktok';

// 各プラットフォームの制限
export const PLATFORM_LIMITS = {
  twitter: {
    textLength: 280,
    imageCount: 4,
    videoCount: 1,
    videoLength: 140, // 秒
  },
  instagram: {
    textLength: 2200,
    imageCount: 10,
    videoCount: 1,
    videoLength: 60, // フィード投稿
    reelsLength: 90, // リール
  },
  tiktok: {
    textLength: 2200,
    videoCount: 1,
    videoLength: 180, // 3分
  },
} as const;

// メディアタイプ
export type MediaType = 'image' | 'video';

// メディアファイル
export interface MediaFile {
  id: string;
  url: string;
  type: MediaType;
  filename: string;
  size: number; // bytes
  width?: number;
  height?: number;
  duration?: number; // 動画の場合の秒数
  thumbnailUrl?: string; // 動画のサムネイル
}

// プラットフォーム固有のコンテンツ
export interface PlatformContent {
  platform: SocialPlatform;
  text: string;
  media: MediaFile[];
  hashtags: string[];
  mentions: string[];
}

// 投稿ステータス
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

// SNS投稿
export interface SocialPost {
  id: string;
  title: string; // 管理用タイトル
  platforms: PlatformContent[];
  status: PostStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

// プラットフォーム固有の投稿結果
export interface PlatformPostResult {
  platform: SocialPlatform;
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

// 投稿作成のための入力
export interface CreatePostInput {
  title: string;
  platforms: PlatformContent[];
  scheduledAt?: Date;
}

// 投稿更新のための入力
export interface UpdatePostInput {
  title?: string;
  platforms?: PlatformContent[];
  scheduledAt?: Date;
  status?: PostStatus;
  publishedAt?: Date;
}