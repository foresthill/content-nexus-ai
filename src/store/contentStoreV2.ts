import { create } from 'zustand';
import { Content, ContentStatus } from '@prisma/client';
import axios from 'axios';

interface ContentWithRelations extends Content {
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  team?: any;
  _count?: {
    socialPosts: number;
    versions: number;
  };
}

interface ContentStoreV2 {
  contents: ContentWithRelations[];
  currentContent: ContentWithRelations | null;
  isLoading: boolean;
  error: string | null;
  
  // 基本操作
  fetchContents: (params?: {
    status?: ContentStatus;
    search?: string;
    tags?: string[];
    skip?: number;
    take?: number;
  }) => Promise<void>;
  
  getContent: (id: string) => Promise<void>;
  
  createContent: (data: {
    title: string;
    content: string;
    excerpt?: string;
    tags?: string[];
    metadata?: any;
  }) => Promise<ContentWithRelations>;
  
  updateContent: (id: string, data: {
    title?: string;
    content?: string;
    excerpt?: string;
    status?: ContentStatus;
    tags?: string[];
    metadata?: any;
  }) => Promise<ContentWithRelations>;
  
  deleteContent: (id: string) => Promise<void>;
  
  // ユーティリティ
  clearError: () => void;
  setCurrentContent: (content: ContentWithRelations | null) => void;
}

const useContentStoreV2 = create<ContentStoreV2>((set, get) => ({
  contents: [],
  currentContent: null,
  isLoading: false,
  error: null,
  
  fetchContents: async (params) => {
    set({ isLoading: true, error: null });
    
    try {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.tags) params.tags.forEach(tag => searchParams.append('tags', tag));
      if (params?.skip) searchParams.append('skip', params.skip.toString());
      if (params?.take) searchParams.append('take', params.take.toString());
      
      const response = await axios.get(`/api/contents?${searchParams.toString()}`);
      set({ contents: response.data.contents, isLoading: false });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'Failed to fetch contents';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  getContent: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(`/api/contents/${id}`);
      set({ currentContent: response.data, isLoading: false });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'Failed to fetch content';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  createContent: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post('/api/contents', data);
      const newContent = response.data;
      
      // ストアに追加
      set((state) => ({
        contents: [newContent, ...state.contents],
        isLoading: false
      }));
      
      return newContent;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'Failed to create content';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  
  updateContent: async (id, data) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.put(`/api/contents/${id}`, data);
      const updatedContent = response.data;
      
      // ストアを更新
      set((state) => ({
        contents: state.contents.map(content => 
          content.id === id ? updatedContent : content
        ),
        currentContent: state.currentContent?.id === id ? updatedContent : state.currentContent,
        isLoading: false
      }));
      
      return updatedContent;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'Failed to update content';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  
  deleteContent: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(`/api/contents/${id}`);
      
      // ストアから削除（実際はアーカイブされる）
      set((state) => ({
        contents: state.contents.filter(content => content.id !== id),
        currentContent: state.currentContent?.id === id ? null : state.currentContent,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'Failed to delete content';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  
  clearError: () => set({ error: null }),
  
  setCurrentContent: (content) => set({ currentContent: content }),
}));

export default useContentStoreV2;