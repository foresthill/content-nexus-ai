# AI-Powered Optimal Posting Time Prediction System

This system provides intelligent recommendations for when to post content on social media platforms to maximize engagement rates.

## Features

### 🤖 Machine Learning-Powered Predictions
- Uses TensorFlow.js to create neural network models
- Analyzes historical engagement patterns
- Considers multiple factors including platform algorithms, audience behavior, and content type

### 📊 Multi-Platform Support
- **Twitter/X**: Optimized for tweet engagement and retweet patterns
- **Instagram**: Considers feed posts, stories, and reels engagement
- **TikTok**: Analyzes video engagement and For You Page algorithm factors

### 🎯 Audience-Targeted Recommendations
- Age group targeting (18-24, 25-34, 35-44, 45+)
- Geographic targeting (North America, Europe, Asia, Oceania)
- Content type optimization (Educational, Entertainment, News, Promotional, Lifestyle)

### ⚡ Real-Time Analytics
- Historical performance tracking
- Engagement rate analysis
- Peak and low performance time identification

## API Endpoints

### GET `/api/ai/posting-time`
Get general posting time recommendations for a platform.

**Query Parameters:**
- `platform` (required): twitter | instagram | tiktok

**Response:**
```json
{
  "platform": "twitter",
  "generalRecommendations": {
    "peakHours": [8, 9, 12, 17, 18, 19],
    "bestDays": {
      "monday": 1.0,
      "tuesday": 1.1,
      "wednesday": 1.15,
      "thursday": 1.1,
      "friday": 0.9
    },
    "avoidHours": [0, 1, 2, 3, 4, 5, 23],
    "tips": ["Tweet during commute hours...", "..."]
  },
  "timeZones": ["UTC", "EST", "CST", "MST", "PST", "JST", "GMT", "CET"]
}
```

### POST `/api/ai/posting-time`
Get personalized posting time predictions.

**Request Body:**
```json
{
  "platform": "twitter",
  "targetAudience": {
    "ageGroup": "25-34",
    "primaryRegion": "north_america"
  },
  "contentType": "educational",
  "timeZone": "EST",
  "numberOfSlots": 3,
  "historicalData": [...]
}
```

**Response:**
```json
{
  "platform": "twitter",
  "predictions": [
    {
      "hour": 8,
      "dayOfWeek": "tuesday",
      "score": 0.85,
      "engagement": 0.067,
      "reason": "Peak commute hour for target demographic"
    }
  ],
  "confidence": 0.85,
  "factors": ["Platform best practices", "Audience demographics", "Historical data"]
}
```

### POST `/api/ai/posting-time/analyze`
Analyze historical posting performance.

**Request Body:**
```json
{
  "postIds": ["post1", "post2", "post3"],
  "dateRange": { "days": 30 },
  "platforms": ["twitter", "instagram", "tiktok"]
}
```

### POST `/api/ai/posting-time/schedule`
Schedule posts at optimal times using the queue system.

**Request Body:**
```json
{
  "postId": "post123",
  "platforms": ["twitter", "instagram"],
  "targetAudience": { "ageGroup": "25-34" },
  "contentType": "educational",
  "content": {
    "twitter": { "text": "...", "media": [] },
    "instagram": { "text": "...", "media": [] }
  },
  "userId": "user123"
}
```

## Machine Learning Model

### Architecture
The system uses a simple neural network with the following structure:
- Input layer: 24 neurons (representing hours of the day)
- Hidden layer 1: 64 neurons with ReLU activation
- Dropout layer: 20% dropout rate
- Hidden layer 2: 32 neurons with ReLU activation
- Output layer: 24 neurons with sigmoid activation

### Training Data
The model is trained on:
- Historical engagement rates by hour
- Platform-specific performance patterns
- Audience demographic behavior
- Content type performance variations

### Confidence Scoring
Confidence scores are calculated based on:
- Historical data sample size
- Model prediction consistency
- Platform-specific reliability factors

## Best Practices by Platform

### Twitter/X
- **Peak Hours**: 8-9 AM, 12-1 PM, 5-7 PM EST
- **Best Days**: Tuesday-Thursday
- **Avoid**: Late night/early morning (11 PM - 6 AM)
- **Tips**: Use trending hashtags, engage during commute hours

### Instagram
- **Peak Hours**: 7-9 AM, 11 AM-1 PM, 5-8 PM EST
- **Best Days**: Tuesday-Friday
- **Avoid**: Very early morning (before 6 AM)
- **Tips**: Stories perform best in evening, Reels get 22% more engagement

### TikTok
- **Peak Hours**: 6-7 AM, 10 AM, 7-10 PM EST
- **Best Days**: Tuesday-Thursday
- **Avoid**: Mid-day weekdays (11 AM - 2 PM)
- **Tips**: Post 3-5 times daily, use trending sounds

## Integration with Queue System

The posting time prediction system integrates with the existing Bull queue system to:
- Automatically schedule posts at optimal times
- Handle retry logic for failed posts
- Manage multi-platform posting coordination
- Track scheduling success rates

## Usage Examples

### React Components

```tsx
// Basic recommendations display
<PostingTimeRecommendations
  platform="twitter"
  targetAudience={{ ageGroup: "25-34" }}
  contentType="educational"
  onSchedule={(time) => schedulePost(time)}
/>

// Full scheduler interface
<PostingTimeScheduler
  platforms={["twitter", "instagram", "tiktok"]}
  onScheduleComplete={(time, platform) => handleScheduled(time, platform)}
/>

// Analytics dashboard
<PostingTimeAnalytics
  userId="user123"
  platforms={["twitter", "instagram"]}
  dateRange={30}
/>
```

### API Usage

```javascript
// Get optimal times
const response = await fetch('/api/ai/posting-time', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platform: 'twitter',
    targetAudience: { ageGroup: '25-34' },
    contentType: 'educational',
    timeZone: 'EST',
    numberOfSlots: 3
  })
});

const { predictions, confidence } = await response.json();

// Schedule at optimal time
await fetch('/api/ai/posting-time/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    postId: 'post123',
    platforms: ['twitter'],
    targetAudience: { ageGroup: '25-34' },
    contentType: 'educational',
    content: { twitter: { text: 'Hello world!', media: [] } },
    userId: 'user123'
  })
});
```

## Performance and Scaling

### Caching Strategy
- Platform best practices cached for 24 hours
- User-specific predictions cached for 1 hour
- Historical analysis cached for 6 hours

### Rate Limiting
- Analysis endpoints: 100 requests/hour per user
- Prediction endpoints: 1000 requests/hour per user
- Scheduling endpoints: 50 requests/hour per user

### Database Optimization
- Indexed queries on userId, platform, and timestamp
- Aggregated analytics tables for faster performance
- Batch processing for historical analysis

## Security Considerations

- User credentials encrypted at rest
- API rate limiting to prevent abuse
- Input validation on all endpoints
- CORS configuration for frontend access
- Authentication required for scheduling endpoints

## Monitoring and Logging

The system includes comprehensive logging for:
- Prediction accuracy tracking
- Scheduling success rates
- API response times
- Error rates and types
- User engagement improvements

## Future Enhancements

1. **Advanced ML Models**: Implement LSTM networks for time series analysis
2. **Real-time Learning**: Continuously update models with new engagement data  
3. **Cross-platform Optimization**: Coordinate posting times across platforms
4. **A/B Testing**: Built-in testing framework for timing strategies
5. **Competitor Analysis**: Factor in competitor posting patterns
6. **Seasonal Adjustments**: Account for holidays and seasonal trends