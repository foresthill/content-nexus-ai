import { create } from 'zustand';
import { ContentImprovement, ContentAnalysisRequest, ImprovementSuggestion } from '@/types/content-improvement';

interface ContentImprovementState {
  // Current analysis
  currentAnalysis: ContentImprovement | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  
  // Analysis history
  analysisHistory: ContentImprovement[];
  
  // Selected variations and improvements
  selectedVariations: string[];
  appliedImprovements: ImprovementSuggestion[];
  
  // Real-time suggestions
  realTimeSuggestions: ImprovementSuggestion[];
  enableRealTime: boolean;
  
  // Settings
  analysisSettings: {
    platform?: string;
    targetAudience?: string;
    category?: string;
    autoAnalyze: boolean;
    suggestionThreshold: number;
  };
}

interface ContentImprovementActions {
  // Analysis actions
  analyzeContent: (request: ContentAnalysisRequest) => Promise<void>;
  clearAnalysis: () => void;
  setAnalysisError: (error: string | null) => void;
  
  // History actions
  addToHistory: (analysis: ContentImprovement) => void;
  clearHistory: () => void;
  getHistoryByContent: (contentId: string) => ContentImprovement[];
  
  // Variation actions
  selectVariation: (variationId: string) => void;
  deselectVariation: (variationId: string) => void;
  clearSelectedVariations: () => void;
  
  // Improvement actions
  applyImprovement: (improvement: ImprovementSuggestion) => void;
  undoImprovement: (improvementId: string) => void;
  clearAppliedImprovements: () => void;
  
  // Real-time suggestions
  updateRealTimeSuggestions: (content: string) => Promise<void>;
  toggleRealTime: (enabled: boolean) => void;
  dismissRealTimeSuggestion: (suggestionId: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<ContentImprovementState['analysisSettings']>) => void;
  
  // Utility actions
  getImprovementScore: () => number;
  getRecommendationsPriority: () => string[];
  exportAnalysis: (format: 'json' | 'csv') => string;
}

export const useContentImprovementStore = create<ContentImprovementState & ContentImprovementActions>((set, get) => ({
  // Initial state
  currentAnalysis: null,
  isAnalyzing: false,
  analysisError: null,
  analysisHistory: [],
  selectedVariations: [],
  appliedImprovements: [],
  realTimeSuggestions: [],
  enableRealTime: false,
  analysisSettings: {
    autoAnalyze: false,
    suggestionThreshold: 70,
  },

  // Analysis actions
  analyzeContent: async (request: ContentAnalysisRequest) => {
    set({ isAnalyzing: true, analysisError: null });
    
    try {
      const response = await fetch('/api/ai/content-improvement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }

      const analysis: ContentImprovement = await response.json();
      
      set({ 
        currentAnalysis: analysis, 
        isAnalyzing: false,
        analysisError: null 
      });
      
      // Add to history
      get().addToHistory(analysis);
      
      // Generate real-time suggestions if enabled
      if (get().enableRealTime) {
        await get().updateRealTimeSuggestions(request.content);
      }
    } catch (error) {
      set({ 
        isAnalyzing: false, 
        analysisError: error instanceof Error ? error.message : 'Analysis failed' 
      });
    }
  },

  clearAnalysis: () => {
    set({ 
      currentAnalysis: null, 
      analysisError: null,
      selectedVariations: [],
      realTimeSuggestions: []
    });
  },

  setAnalysisError: (error: string | null) => {
    set({ analysisError: error });
  },

  // History actions
  addToHistory: (analysis: ContentImprovement) => {
    set((state) => ({
      analysisHistory: [analysis, ...state.analysisHistory.slice(0, 49)] // Keep last 50
    }));
  },

  clearHistory: () => {
    set({ analysisHistory: [] });
  },

  getHistoryByContent: (contentId: string) => {
    return get().analysisHistory.filter(analysis => 
      analysis.id === contentId || analysis.originalContent.includes(contentId)
    );
  },

  // Variation actions
  selectVariation: (variationId: string) => {
    set((state) => ({
      selectedVariations: [...state.selectedVariations, variationId]
    }));
  },

  deselectVariation: (variationId: string) => {
    set((state) => ({
      selectedVariations: state.selectedVariations.filter(id => id !== variationId)
    }));
  },

  clearSelectedVariations: () => {
    set({ selectedVariations: [] });
  },

  // Improvement actions
  applyImprovement: (improvement: ImprovementSuggestion) => {
    set((state) => ({
      appliedImprovements: [...state.appliedImprovements, improvement]
    }));
  },

  undoImprovement: (improvementId: string) => {
    set((state) => ({
      appliedImprovements: state.appliedImprovements.filter(imp => imp.type !== improvementId)
    }));
  },

  clearAppliedImprovements: () => {
    set({ appliedImprovements: [] });
  },

  // Real-time suggestions
  updateRealTimeSuggestions: async (content: string) => {
    if (!get().enableRealTime || content.length < 50) return;

    try {
      // Simplified real-time analysis
      const suggestions: ImprovementSuggestion[] = await generateQuickSuggestions(content);
      
      set({ realTimeSuggestions: suggestions });
    } catch (error) {
      console.error('Failed to update real-time suggestions:', error);
    }
  },

  toggleRealTime: (enabled: boolean) => {
    set({ enableRealTime: enabled });
    if (!enabled) {
      set({ realTimeSuggestions: [] });
    }
  },

  dismissRealTimeSuggestion: (suggestionId: string) => {
    set((state) => ({
      realTimeSuggestions: state.realTimeSuggestions.filter(s => s.type !== suggestionId)
    }));
  },

  // Settings
  updateSettings: (settings) => {
    set((state) => ({
      analysisSettings: { ...state.analysisSettings, ...settings }
    }));
  },

  // Utility actions
  getImprovementScore: () => {
    const analysis = get().currentAnalysis;
    if (!analysis) return 0;
    
    return Math.round(
      (analysis.quality.overall + 
       analysis.engagement.score + 
       analysis.readability.score) / 3
    );
  },

  getRecommendationsPriority: () => {
    const analysis = get().currentAnalysis;
    if (!analysis) return [];
    
    const recommendations = [];
    
    if (analysis.quality.overall < 70) recommendations.push('quality');
    if (analysis.engagement.score < 70) recommendations.push('engagement');
    if (analysis.readability.score < 70) recommendations.push('readability');
    if (analysis.sentiment.confidence < 0.7) recommendations.push('sentiment');
    
    return recommendations;
  },

  exportAnalysis: (format: 'json' | 'csv') => {
    const analysis = get().currentAnalysis;
    if (!analysis) return '';
    
    if (format === 'json') {
      return JSON.stringify(analysis, null, 2);
    } else {
      // CSV format
      const csv = [
        'Metric,Score,Details',
        `Quality,${analysis.quality.overall},"${analysis.quality.details.suggestions.join('; ')}"`,
        `Engagement,${analysis.engagement.score},"${analysis.engagement.recommendations.join('; ')}"`,
        `Readability,${analysis.readability.score},"${analysis.readability.recommendations.simplifyLanguage.join('; ')}"`,
        `Sentiment,${Math.round(analysis.sentiment.confidence * 100)},"${analysis.sentiment.optimization.adjustments.join('; ')}"`,
      ].join('\n');
      
      return csv;
    }
  },
}));

// Helper function for real-time suggestions
async function generateQuickSuggestions(content: string): Promise<ImprovementSuggestion[]> {
  const suggestions: ImprovementSuggestion[] = [];
  
  // Quick length check
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 50) {
    suggestions.push({
      type: 'quality',
      title: 'Content Too Short',
      description: 'Consider expanding your content for better engagement',
      impact: 30,
      effort: 20,
      before: content,
      after: content + '\n\n[Add more detailed explanation here]',
      reasoning: 'Longer content typically performs better',
      category: 'length'
    });
  }
  
  // Quick readability check
  const avgSentenceLength = content.split(/[.!?]+/).reduce((sum, sentence) => {
    return sum + sentence.trim().split(/\s+/).length;
  }, 0) / content.split(/[.!?]+/).length;
  
  if (avgSentenceLength > 25) {
    suggestions.push({
      type: 'readability',
      title: 'Long Sentences Detected',
      description: 'Break down long sentences for better readability',
      impact: 25,
      effort: 15,
      before: 'Long sentence example...',
      after: 'Shorter sentence. Another sentence.',
      reasoning: 'Shorter sentences improve comprehension',
      category: 'structure'
    });
  }
  
  // Quick CTA check
  const hasCallToAction = /\b(click|subscribe|share|comment|contact|buy|try|download|sign up)\b/i.test(content);
  if (!hasCallToAction) {
    suggestions.push({
      type: 'engagement',
      title: 'Missing Call-to-Action',
      description: 'Add a clear call-to-action to boost engagement',
      impact: 35,
      effort: 10,
      before: content,
      after: content + '\n\nWhat do you think? Share your thoughts below!',
      reasoning: 'CTAs significantly increase user engagement',
      category: 'cta'
    });
  }
  
  return suggestions.filter(s => s.impact >= 20); // Only show high-impact suggestions
}

// Export store hook
export type ContentImprovementStore = ReturnType<typeof useContentImprovementStore>;