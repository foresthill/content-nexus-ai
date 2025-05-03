import { create } from 'zustand';
import { Video, VideoStatus, VideoType } from '../types/video';

// モックデータの生成
const generateMockVideos = (): Video[] => {
  return [
    {
      id: '1',
      title: 'マーケティング戦略の基本',
      description: '初心者向けマーケティング戦略の概要を説明します',
      type: VideoType.LONG,
      url: '/videos/marketing-basics.mp4',
      thumbnailUrl: '/images/marketing-thumbnail.jpg',
      duration: 720, // 12分
      author: 'Marketing Expert',
      category: ['マーケティング', '初心者向け'],
      tags: ['戦略', 'ビジネス'],
      status: VideoStatus.PUBLISHED,
      publishedAt: new Date('2025-04-10'),
      updatedAt: new Date('2025-04-10'),
      createdAt: new Date('2025-04-05')
    },
    {
      id: '2',
      title: 'SNSマーケティングのコツ',
      description: 'SNSを使った効果的なマーケティング手法',
      type: VideoType.SHORT,
      url: '/videos/sns-tips.mp4',
      thumbnailUrl: '/images/sns-thumbnail.jpg',
      duration: 45, // 45秒
      author: 'Social Media Guru',
      category: ['SNS', 'マーケティング'],
      tags: ['Instagram', 'TikTok', 'Twitter'],
      status: VideoStatus.PUBLISHED,
      relatedContentId: '2', // SEO記事に関連
      publishedAt: new Date('2025-04-22'),
      updatedAt: new Date('2025-04-22'),
      createdAt: new Date('2025-04-20')
    },
    {
      id: '3',
      title: 'コンテンツ制作の舞台裏',
      description: '効果的なコンテンツを作るためのプロセスとヒント',
      type: VideoType.LONG,
      url: '/videos/content-creation.mp4',
      thumbnailUrl: '/images/content-creation-thumbnail.jpg',
      duration: 540, // 9分
      author: 'Content Creator',
      category: ['コンテンツ制作', 'マーケティング'],
      tags: ['制作過程', 'クリエイティブ'],
      status: VideoStatus.PROCESSING,
      updatedAt: new Date('2025-04-28'),
      createdAt: new Date('2025-04-28')
    }
  ];
};

interface VideoStore {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  fetchVideos: () => Promise<void>;
  getVideoById: (id: string) => Video | undefined;
  createVideo: (video: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Video>;
  updateVideo: (id: string, videoData: Partial<Video>) => Promise<Video>;
  deleteVideo: (id: string) => Promise<void>;
}

const useVideoStore = create<VideoStore>((set, get) => ({
  videos: [],
  isLoading: false,
  error: null,
  
  fetchVideos: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // APIから取得する代わりにモックデータを使用
      const mockVideos = generateMockVideos();
      set({ videos: mockVideos, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  getVideoById: (id: string) => {
    return get().videos.find(video => video.id === id);
  },
  
  createVideo: async (videoData) => {
    set({ isLoading: true, error: null });
    
    try {
      // 新しいIDの生成（実際はAPIが生成する）
      const newId = Math.random().toString(36).substring(2, 9);
      
      // 新規動画の作成
      const newVideo: Video = {
        ...videoData,
        id: newId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // ストアに追加
      set((state) => ({
        videos: [...state.videos, newVideo],
        isLoading: false
      }));
      
      return newVideo;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  updateVideo: async (id: string, videoData: Partial<Video>) => {
    set({ isLoading: true, error: null });
    
    try {
      const videos = get().videos;
      const videoIndex = videos.findIndex(v => v.id === id);
      
      if (videoIndex === -1) {
        throw new Error(`Video with ID ${id} not found`);
      }
      
      // 動画の更新
      const updatedVideo: Video = {
        ...videos[videoIndex],
        ...videoData,
        updatedAt: new Date()
      };
      
      // ストアを更新
      videos[videoIndex] = updatedVideo;
      set({ videos: [...videos], isLoading: false });
      
      return updatedVideo;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  deleteVideo: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      set((state) => ({
        videos: state.videos.filter(video => video.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  }
}));

export default useVideoStore;