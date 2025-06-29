# Content Nexus AI

AI-driven content management and social media automation platform with enterprise-grade reliability.

## Features

- 🤖 **AI-Powered Content Creation** - Generate and optimize content with AI assistance
- 📱 **Multi-Platform Social Media Management** - Twitter/X, Instagram, TikTok integration
- 📊 **Advanced Analytics** - Real-time performance tracking and insights
- 🔄 **n8n Workflow Automation** - Connect with external services via webhooks
- 🎯 **Smart Retry System** - Enterprise-grade error handling and recovery
- 🎬 **Video Management** - Edit and publish short-form videos across platforms

## Getting Started

### Prerequisites

- Node.js 18+ 
- Redis server (for queue management)
- API keys for social media platforms
- (Optional) n8n instance for workflow automation
- (Optional) Dify API key for AI features

### Installation

1. Clone the repository:
```bash
git clone https://github.com/foresthill/content-nexus-ai.git
cd content-nexus-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see Configuration section)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### Environment Variables (.env.local)

Create a `.env.local` file in the root directory:

```env
# Twitter/X API Keys
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret

# Instagram API Keys (requires Facebook App)
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_business_account_id

# TikTok API Keys
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=http://localhost:3000/api/auth/tiktok/callback

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Secret (generate a secure random string)
JWT_SECRET=your_jwt_secret_key_here

# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### In-App Configuration

#### Dify AI Integration (Optional)
1. Navigate to `/settings/dify`
2. Enter your Dify API configuration:
   - **API Key**: Your Dify application API key (format: `app-xxxxx`)
   - **Base URL**: Dify API endpoint (default: `https://api.dify.ai/v1`)
3. Test the connection
4. Once connected, Dify features will be available in content improvement

#### n8n Workflow Integration (Optional)
1. Navigate to `/settings/n8n`
2. Configure n8n connection:
   - **Base URL**: Your n8n instance URL (e.g., `https://your-n8n.com`)
   - **API Key**: Optional, for secured instances
   - **Username/Password**: For basic auth (if configured)
3. Test with a webhook path
4. Add workflows to trigger on specific events:
   - Content created/updated/published
   - Social media post published/failed/scheduled
   - Analytics threshold reached

### Social Media Authentication Flow

1. **Twitter/X**: 
   - Requires Elevated access for API v2
   - OAuth 1.0a flow
   - Set up callback URL in Twitter App settings

2. **Instagram**:
   - Requires Facebook App with Instagram Basic Display or Instagram Graph API
   - Business account required for full features
   - OAuth 2.0 flow

3. **TikTok**:
   - Requires TikTok for Developers account
   - OAuth 2.0 flow with refresh tokens
   - Video publishing requires approval

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## API Endpoints

### Queue Management
- `GET /api/queue/health` - System health check
- `GET /api/queue/dead-letter` - View failed jobs
- `POST /api/queue/dead-letter` - Retry failed jobs

### Social Media
- `POST /api/posts` - Create scheduled posts
- `GET /api/social/analytics` - Fetch platform analytics
- `POST /api/social/analytics` - Get specific post metrics

### Authentication
- `/api/auth/twitter` - Twitter OAuth flow
- `/api/auth/instagram` - Instagram OAuth flow
- `/api/auth/tiktok` - TikTok OAuth flow

## Architecture

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Queue System**: Bull + Redis
- **Testing**: Jest, Testing Library
- **Charts**: Recharts
- **AI Integration**: Dify (optional)
- **Workflow Automation**: n8n (optional)

### Key Components
- **Smart Retry Engine**: Adaptive retry strategies per platform
- **Circuit Breaker**: Prevents cascade failures
- **Dead Letter Queue**: Manages permanently failed jobs
- **Real-time Analytics**: Cross-platform performance tracking

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Self-Hosted
1. Build the project: `npm run build`
2. Set up Redis server
3. Configure environment variables
4. Run with PM2 or similar: `pm2 start npm --name "content-nexus" -- start`

## Troubleshooting

### Redis Connection Issues
- Ensure Redis server is running
- Check `REDIS_URL` in environment variables
- For production, use Redis Cloud or similar

### Social Media API Errors
- Verify API keys are correct
- Check rate limits
- Ensure callback URLs match configuration
- For Instagram, verify Business Account ID

### n8n Webhook Not Triggering
- Check n8n instance is accessible
- Verify webhook path is correct
- Test with n8n's webhook test feature
- Check Circuit Breaker status at `/api/queue/health`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/foresthill/content-nexus-ai/issues) page.