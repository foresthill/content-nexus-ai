import { create } from 'zustand';
import { 
  SocialPost, 
  PostStatus, 
  CreatePostInput, 
  UpdatePostInput, 
  PlatformPostResult,
  SocialPlatform,
  MediaFile,
  PlatformContent
} from '../types/social';

// モックデータの生成
const generateMockPosts = (): SocialPost[] => {
  const mockMedia: MediaFile[] = [
    {
      id: 'media1',
      url: '/images/sample-post-1.jpg',
      type: 'image',
      filename: 'sample-post-1.jpg',
      size: 1024000,
      width: 1080,
      height: 1080
    },
    {
      id: 'media2',
      url: '/videos/sample-video-1.mp4',
      type: 'video',
      filename: 'sample-video-1.mp4',
      size: 5242880,
      width: 1920,
      height: 1080,
      duration: 30,
      thumbnailUrl: '/images/video-thumb-1.jpg'
    }
  ];

  return [
    {
      id: '1',
      title: '新商品リリースのお知らせ',
      platforms: [
        {
          platform: 'twitter',
          text: '🎉 新商品が登場！\n\n本日より、待望の新商品をリリースしました。\n詳細はこちら → https://example.com\n\n#新商品 #リリース',
          media: [mockMedia[0]],
          hashtags: ['新商品', 'リリース'],
          mentions: []
        },
        {
          platform: 'instagram',
          text: '新商品リリース🎉\n\n皆さまお待たせしました！\n本日より新商品の販売を開始いたします。\n\n詳しくはプロフィールのリンクから\n\n#新商品 #newproduct #リリース #launch',
          media: [mockMedia[0]],
          hashtags: ['新商品', 'newproduct', 'リリース', 'launch'],
          mentions: []
        }
      ],
      status: 'published',
      publishedAt: new Date('2025-06-10T10:00:00'),
      createdAt: new Date('2025-06-09T15:00:00'),
      updatedAt: new Date('2025-06-10T10:00:00')
    },
    {
      id: '2',
      title: 'ハウツー動画：初心者向けチュートリアル',
      platforms: [
        {
          platform: 'tiktok',
          text: '初心者必見！30秒でわかる基本操作🎬\n\n#初心者 #チュートリアル #ハウツー #tutorial',
          media: [mockMedia[1]],
          hashtags: ['初心者', 'チュートリアル', 'ハウツー', 'tutorial'],
          mentions: []
        },
        {
          platform: 'instagram',
          text: '【保存版】初心者向けチュートリアル📚\n\n基本操作を30秒で解説！\n保存して後でじっくり見てね。\n\n#初心者向け #チュートリアル #ハウツー #保存版',
          media: [mockMedia[1]],
          hashtags: ['初心者向け', 'チュートリアル', 'ハウツー', '保存版'],
          mentions: []
        }
      ],
      status: 'scheduled',
      scheduledAt: new Date('2025-06-20T18:00:00'),
      createdAt: new Date('2025-06-15T14:00:00'),
      updatedAt: new Date('2025-06-15T14:30:00')
    },
    {
      id: '3',
      title: 'ユーザー投稿キャンペーン',
      platforms: [
        {
          platform: 'twitter',
          text: '📸 フォトコンテスト開催中！\n\nあなたの素敵な写真を投稿してください。\n優秀作品には豪華賞品をプレゼント🎁\n\n応募方法：\n1. @example をフォロー\n2. #フォトコン2025 を付けて投稿\n\n締切：6/30',
          media: [],
          hashtags: ['フォトコン2025'],
          mentions: ['@example']
        }
      ],
      status: 'draft',
      createdAt: new Date('2025-06-16T09:00:00'),
      updatedAt: new Date('2025-06-16T09:00:00')
    }
  ];
};

interface SocialPostStore {
  posts: SocialPost[];
  isLoading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  getPostById: (id: string) => SocialPost | undefined;
  createPost: (input: CreatePostInput) => Promise<SocialPost>;
  updatePost: (id: string, input: UpdatePostInput) => Promise<SocialPost>;
  deletePost: (id: string) => Promise<void>;
  publishPost: (id: string, platforms?: SocialPlatform[]) => Promise<PlatformPostResult[]>;
  schedulePost: (id: string, scheduledAt: Date) => Promise<SocialPost>;
}

const useSocialPostStore = create<SocialPostStore>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  
  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // APIから取得する代わりにモックデータを使用
      const mockPosts = generateMockPosts();
      set({ posts: mockPosts, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  getPostById: (id: string) => {
    return get().posts.find(post => post.id === id);
  },
  
  createPost: async (input: CreatePostInput) => {
    set({ isLoading: true, error: null });
    
    try {
      // 新しいIDの生成
      const newId = Math.random().toString(36).substring(2, 9);
      
      // 新規投稿の作成
      const newPost: SocialPost = {
        id: newId,
        title: input.title,
        platforms: input.platforms,
        status: input.scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: input.scheduledAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // ストアに追加
      set((state) => ({
        posts: [...state.posts, newPost],
        isLoading: false
      }));
      
      return newPost;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  updatePost: async (id: string, input: UpdatePostInput) => {
    set({ isLoading: true, error: null });
    
    try {
      const posts = get().posts;
      const postIndex = posts.findIndex(p => p.id === id);
      
      if (postIndex === -1) {
        throw new Error(`Post with ID ${id} not found`);
      }
      
      // 投稿の更新
      const updatedPost: SocialPost = {
        ...posts[postIndex],
        ...input,
        updatedAt: new Date()
      };
      
      // ストアを更新
      posts[postIndex] = updatedPost;
      set({ posts: [...posts], isLoading: false });
      
      return updatedPost;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  deletePost: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      set((state) => ({
        posts: state.posts.filter(post => post.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  publishPost: async (id: string, platforms?: SocialPlatform[]) => {
    set({ isLoading: true, error: null });
    
    try {
      const post = get().getPostById(id);
      if (!post) {
        throw new Error(`Post with ID ${id} not found`);
      }
      
      // 公開するプラットフォームを決定
      const targetPlatforms = platforms || post.platforms.map(p => p.platform);
      
      // モック: 各プラットフォームへの投稿結果
      const results: PlatformPostResult[] = targetPlatforms.map(platform => ({
        platform,
        success: true,
        postId: `${platform}-${Math.random().toString(36).substring(2, 9)}`,
        url: `https://${platform}.com/posts/${Math.random().toString(36).substring(2, 9)}`
      }));
      
      // 投稿ステータスを更新
      await get().updatePost(id, {
        status: 'published',
        publishedAt: new Date()
      });
      
      set({ isLoading: false });
      return results;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  schedulePost: async (id: string, scheduledAt: Date) => {
    return get().updatePost(id, {
      status: 'scheduled',
      scheduledAt
    });
  }
}));

export default useSocialPostStore;