import { SocialPlatform } from '@/types/social';
import { EngagementPattern, TimeSlot, PredictionConfig } from './types';
import { platformBestPractices } from './best-practices';
import * as tf from '@tensorflow/tfjs';

export class PostingTimePredictor {
  private platform: SocialPlatform;
  private model: tf.LayersModel | null = null;
  private historicalPatterns: EngagementPattern[] = [];
  private confidenceScore: number = 0.7;

  constructor(platform: SocialPlatform) {
    this.platform = platform;
    this.initializeModel();
  }

  private async initializeModel() {
    // Create a simple neural network for time prediction
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [24], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 24, activation: 'sigmoid' }) // 24 hours
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
  }

  async predictOptimalTimes(config: PredictionConfig): Promise<TimeSlot[]> {
    const { targetAudience, contentType, timeZone, numberOfSlots } = config;

    // Get base predictions from platform best practices
    const basePredictions = this.getBasePredictions();

    // Adjust for target audience demographics
    const audienceAdjusted = this.adjustForAudience(basePredictions, targetAudience);

    // Adjust for content type
    const contentAdjusted = this.adjustForContentType(audienceAdjusted, contentType);

    // Apply historical patterns if available
    const historicalAdjusted = this.applyHistoricalPatterns(contentAdjusted);

    // Convert to requested timezone
    const timeZoneAdjusted = this.convertToTimeZone(historicalAdjusted, timeZone);

    // Sort by score and return top N slots
    return timeZoneAdjusted
      .sort((a, b) => b.score - a.score)
      .slice(0, numberOfSlots);
  }

  private getBasePredictions(): TimeSlot[] {
    const practices = platformBestPractices[this.platform];
    const slots: TimeSlot[] = [];

    // Generate time slots based on platform best practices
    practices.peakHours.forEach(hour => {
      slots.push({
        hour,
        dayOfWeek: 'all',
        score: 0.8,
        engagement: practices.averageEngagement,
        reason: 'Platform peak hour'
      });
    });

    // Add day-specific recommendations
    Object.entries(practices.bestDays).forEach(([day, multiplier]) => {
      practices.peakHours.forEach(hour => {
        slots.push({
          hour,
          dayOfWeek: day as any,
          score: 0.8 * multiplier,
          engagement: practices.averageEngagement * multiplier,
          reason: `Best ${day} time`
        });
      });
    });

    return slots;
  }

  private adjustForAudience(slots: TimeSlot[], audience?: any): TimeSlot[] {
    if (!audience) return slots;

    return slots.map(slot => {
      let adjustedScore = slot.score;

      // Adjust based on audience age group
      if (audience.ageGroup) {
        const ageAdjustments: Record<string, Record<number, number>> = {
          '18-24': { 20: 1.2, 21: 1.3, 22: 1.2, 23: 1.1 },
          '25-34': { 8: 1.2, 12: 1.1, 18: 1.2, 19: 1.1 },
          '35-44': { 7: 1.1, 9: 1.2, 17: 1.1, 20: 1.1 },
          '45+': { 6: 1.1, 8: 1.2, 10: 1.1, 16: 1.1 }
        };

        const adjustment = ageAdjustments[audience.ageGroup]?.[slot.hour] || 1;
        adjustedScore *= adjustment;
      }

      // Adjust based on audience location/timezone
      if (audience.primaryRegion) {
        // Add region-specific adjustments
        adjustedScore *= this.getRegionalMultiplier(audience.primaryRegion, slot.hour);
      }

      return { ...slot, score: adjustedScore };
    });
  }

  private adjustForContentType(slots: TimeSlot[], contentType?: string): TimeSlot[] {
    if (!contentType) return slots;

    const contentAdjustments: Record<string, Record<number, number>> = {
      'educational': { 7: 1.2, 8: 1.1, 9: 1.1, 17: 1.1 },
      'entertainment': { 19: 1.2, 20: 1.3, 21: 1.2, 22: 1.1 },
      'news': { 6: 1.3, 7: 1.2, 8: 1.1, 12: 1.1 },
      'promotional': { 10: 1.1, 14: 1.1, 18: 1.2, 19: 1.1 },
      'lifestyle': { 11: 1.1, 15: 1.1, 19: 1.2, 20: 1.1 }
    };

    return slots.map(slot => {
      const adjustment = contentAdjustments[contentType]?.[slot.hour] || 1;
      return { ...slot, score: slot.score * adjustment };
    });
  }

  private applyHistoricalPatterns(slots: TimeSlot[]): TimeSlot[] {
    if (this.historicalPatterns.length === 0) return slots;

    return slots.map(slot => {
      const historicalData = this.historicalPatterns.find(
        p => p.hour === slot.hour && 
        (p.dayOfWeek === slot.dayOfWeek || slot.dayOfWeek === 'all')
      );

      if (historicalData) {
        const historicalWeight = 0.6;
        const baseWeight = 0.4;
        
        return {
          ...slot,
          score: (slot.score * baseWeight) + (historicalData.engagementRate * historicalWeight),
          engagement: historicalData.averageEngagement
        };
      }

      return slot;
    });
  }

  private convertToTimeZone(slots: TimeSlot[], timeZone: string): TimeSlot[] {
    // For simplicity, we'll use a basic offset calculation
    // In production, use a proper timezone library
    const offsets: Record<string, number> = {
      'UTC': 0,
      'EST': -5,
      'CST': -6,
      'MST': -7,
      'PST': -8,
      'JST': 9,
      'GMT': 0,
      'CET': 1
    };

    const offset = offsets[timeZone] || 0;

    return slots.map(slot => ({
      ...slot,
      hour: (slot.hour + offset + 24) % 24
    }));
  }

  private getRegionalMultiplier(region: string, hour: number): number {
    // Regional activity patterns
    const regionalPatterns: Record<string, Record<number, number>> = {
      'north_america': { 8: 1.1, 12: 1.1, 17: 1.2, 20: 1.1 },
      'europe': { 7: 1.1, 9: 1.1, 16: 1.1, 19: 1.2 },
      'asia': { 9: 1.1, 12: 1.1, 18: 1.1, 21: 1.2 },
      'oceania': { 7: 1.1, 10: 1.1, 17: 1.1, 19: 1.1 }
    };

    return regionalPatterns[region]?.[hour] || 1;
  }

  updateWithHistoricalPatterns(patterns: EngagementPattern[]) {
    this.historicalPatterns = patterns;
    
    // Update confidence score based on data quality
    if (patterns.length > 100) {
      this.confidenceScore = 0.9;
    } else if (patterns.length > 50) {
      this.confidenceScore = 0.8;
    } else if (patterns.length > 20) {
      this.confidenceScore = 0.7;
    } else {
      this.confidenceScore = 0.6;
    }
  }

  getConfidenceScore(): number {
    return this.confidenceScore;
  }

  getInfluencingFactors(): string[] {
    const factors = ['Platform best practices', 'Time zone considerations'];
    
    if (this.historicalPatterns.length > 0) {
      factors.push('Historical engagement data');
    }
    
    return factors;
  }

  getGeneralRecommendations() {
    const practices = platformBestPractices[this.platform];
    
    return {
      peakHours: practices.peakHours,
      bestDays: practices.bestDays,
      avoidHours: practices.avoidHours,
      tips: practices.tips
    };
  }

  getSupportedTimeZones(): string[] {
    return ['UTC', 'EST', 'CST', 'MST', 'PST', 'JST', 'GMT', 'CET'];
  }
}