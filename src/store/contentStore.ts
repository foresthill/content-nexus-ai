import { create } from 'zustand';
import { Content, ContentStatus, PlatformType } from '../types/content';

// モックデータの生成
const generateMockContents = (): Content[] => {
  return [
    {
      id: '1',
      title: '効果的なコンテンツマーケティングの秘訣',
      description: 'コンテンツマーケティングを成功させるための基本戦略を解説します。',
      content: '## コンテンツマーケティングとは\nコンテンツマーケティングは...',
      author: 'John Doe',
      category: ['マーケティング', 'コンテンツ戦略'],
      tags: ['初心者向け', 'ハウツー'],
      status: ContentStatus.PUBLISHED,
      featuredImage: '/images/content-marketing.jpg',
      publishedAt: new Date('2025-04-15'),
      updatedAt: new Date('2025-04-15'),
      createdAt: new Date('2025-04-10'),
      affiliateLinks: [
        {
          id: 'aff1',
          title: 'コンテンツマーケティング完全ガイド',
          url: 'https://example.com/affiliate/book1',
          imageUrl: '/images/book-cover.jpg',
          description: '初心者から上級者まで役立つ完全ガイド'
        }
      ],
      platforms: [
        {
          type: PlatformType.BLOG,
          url: 'https://example.com/blog/content-marketing-tips',
          publishedAt: new Date('2025-04-15'),
          engagement: {
            likes: 124,
            comments: 32,
            shares: 48
          }
        },
        {
          type: PlatformType.TWITTER,
          url: 'https://twitter.com/example/status/123456789',
          publishedAt: new Date('2025-04-16'),
          engagement: {
            likes: 89,
            shares: 24,
            comments: 12
          }
        }
      ]
    },
    {
      id: '2',
      title: 'SEO対策の最新トレンド2025',
      description: '2025年に効果的なSEO対策と最新トレンドを紹介します。',
      content: '## 2025年のSEOトレンド\n1. AIと検索エンジン...',
      author: 'Jane Smith',
      category: ['SEO', 'デジタルマーケティング'],
      tags: ['トレンド', '中級者向け'],
      status: ContentStatus.PUBLISHED,
      featuredImage: '/images/seo-trends.jpg',
      publishedAt: new Date('2025-04-20'),
      updatedAt: new Date('2025-04-22'),
      createdAt: new Date('2025-04-18'),
      affiliateLinks: [
        {
          id: 'aff2',
          title: 'SEOツールプロ',
          url: 'https://example.com/affiliate/seo-tool',
          imageUrl: '/images/seo-tool.jpg',
          description: 'プロフェッショナルのためのSEO分析ツール'
        }
      ],
      platforms: [
        {
          type: PlatformType.BLOG,
          url: 'https://example.com/blog/seo-trends-2025',
          publishedAt: new Date('2025-04-20'),
          engagement: {
            likes: 245,
            comments: 56,
            shares: 103
          }
        },
        {
          type: PlatformType.FACEBOOK,
          url: 'https://facebook.com/posts/987654321',
          publishedAt: new Date('2025-04-21'),
          engagement: {
            likes: 324,
            shares: 87,
            comments: 43
          }
        },
        {
          type: PlatformType.NOTE,
          url: 'https://note.com/example/n/123456',
          publishedAt: new Date('2025-04-22'),
          engagement: {
            likes: 156,
            comments: 28
          }
        }
      ]
    },
    {
      id: '3',
      title: 'ソーシャルメディアキャンペーンの立て方',
      description: '効果的なソーシャルメディアキャンペーンを計画・実行するためのガイド',
      content: '## キャンペーン設計の基本\nターゲットオーディエンスを...',
      author: 'Alex Johnson',
      category: ['ソーシャルメディア', 'キャンペーン'],
      tags: ['実践', 'プランニング'],
      status: ContentStatus.DRAFT,
      updatedAt: new Date('2025-04-28'),
      createdAt: new Date('2025-04-28'),
      affiliateLinks: [],
      platforms: [
        {
          type: PlatformType.INSTAGRAM,
          scheduledAt: new Date('2025-05-10'),
          status: ContentStatus.DRAFT
        },
        {
          type: PlatformType.TWITTER,
          scheduledAt: new Date('2025-05-12'),
          status: ContentStatus.DRAFT
        }
      ]
    }
  ];
};

interface ContentStore {
  contents: Content[];
  isLoading: boolean;
  error: string | null;
  fetchContents: () => Promise<void>;
  getContentById: (id: string) => Content | undefined;
  createContent: (content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Content>;
  updateContent: (id: string, contentData: Partial<Content>) => Promise<Content>;
  deleteContent: (id: string) => Promise<void>;
}

const useContentStore = create<ContentStore>((set, get) => ({
  contents: [],
  isLoading: false,
  error: null,
  
  fetchContents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // APIから取得する代わりにモックデータを使用
      const mockContents = generateMockContents();
      set({ contents: mockContents, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  getContentById: (id: string) => {
    return get().contents.find(content => content.id === id);
  },
  
  createContent: async (contentData) => {
    set({ isLoading: true, error: null });
    
    try {
      // 新しいIDの生成（実際はAPIが生成する）
      const newId = Math.random().toString(36).substring(2, 9);
      
      // 新規コンテンツの作成
      const newContent: Content = {
        ...contentData,
        id: newId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // ストアに追加
      set((state) => ({
        contents: [...state.contents, newContent],
        isLoading: false
      }));
      
      return newContent;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  updateContent: async (id: string, contentData: Partial<Content>) => {
    set({ isLoading: true, error: null });
    
    try {
      const contents = get().contents;
      const contentIndex = contents.findIndex(c => c.id === id);
      
      if (contentIndex === -1) {
        throw new Error(`Content with ID ${id} not found`);
      }
      
      // コンテンツの更新
      const updatedContent: Content = {
        ...contents[contentIndex],
        ...contentData,
        updatedAt: new Date()
      };
      
      // ストアを更新
      contents[contentIndex] = updatedContent;
      set({ contents: [...contents], isLoading: false });
      
      return updatedContent;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  deleteContent: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      set((state) => ({
        contents: state.contents.filter(content => content.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  }
}));

export default useContentStore;