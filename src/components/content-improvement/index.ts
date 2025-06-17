// Main Dashboard Component
export { ContentImprovementDashboard } from './ContentImprovementDashboard';

// Widget Component for Integration
export { ContentImprovementWidget } from './ContentImprovementWidget';

// Analysis Components
export { ImprovementOverview } from './ImprovementOverview';
export { QualityAnalysis } from './QualityAnalysis';
export { EngagementAnalysis } from './EngagementAnalysis';
export { ReadabilityAnalysis } from './ReadabilityAnalysis';
export { SentimentAnalysis } from './SentimentAnalysis';

// Variation and Testing Components
export { VariationsList } from './VariationsList';
export { ABTestSuggestions } from './ABTestSuggestions';

// Preview Component
export { ImprovementPreview } from './ImprovementPreview';

// Store Hook
export { useContentImprovementStore } from '@/store/contentImprovementStore';

// Types
export type {
  ContentImprovement,
  ContentAnalysisRequest,
  ContentQualityScore,
  EngagementPotential,
  ReadabilityAnalysis as ReadabilityAnalysisType,
  SentimentAnalysis as SentimentAnalysisType,
  ContentVariation,
  ABTestSuggestion,
  ImprovementSuggestion,
  ContentOptimizationRequest,
  ContentOptimizationResult
} from '@/types/content-improvement';