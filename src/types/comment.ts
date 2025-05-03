export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam'
}

export interface Comment {
  id: string;
  contentId?: string; // コンテンツID
  videoId?: string;   // 動画ID
  author: string;
  authorEmail?: string;
  text: string;
  parentId?: string;  // 返信元コメントID
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
}