# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Development Guide for Claude

## Build/Lint/Test Commands
```bash
# Install dependencies
npm install 

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Format code with Prettier
npm run format

# Run tests (when implemented)
npm run test
```

## Code Architecture Overview

### Project Structure
- **`/src/app`**: Next.js App Router pages
  - `/dashboard`: Analytics dashboard
  - `/shorts`: Short-form video management
- **`/src/components`**: Reusable React components
  - `/comments`: Comment-related components
  - `/content`: Content management components
  - `/dashboard`: Dashboard UI components
  - `/layout`: Layout components (Header, Sidebar)
- **`/src/store`**: Zustand state management stores
  - `analyticsStore.ts`: Analytics data management
  - `contentStore.ts`: Content creation and management
  - `videoStore.ts`: Video asset management  
  - `videoProjectStore.ts`: Video project management
- **`/src/types`**: TypeScript type definitions
  - `analytics.ts`: Analytics data interfaces
  - `comment.ts`: Comment data structures
  - `content.ts`: Content and article interfaces 
  - `video.ts`: Video and project interfaces

### Technology Stack
- **Frontend Framework**: Next.js 15 with React 19
- **State Management**: Zustand for centralized stores
- **Styling**: Tailwind CSS with componentized styling
- **UI Components**: Headless UI for accessible components
- **Icons**: Heroicons for consistent UI elements
- **Data Visualization**: Recharts for analytics charts
- **TypeScript**: Strict mode with complete type annotations

### Data Flow
1. **Store Pattern**: The application uses Zustand for state management with centralized stores for each domain (content, videos, analytics)
2. **API Mock Layer**: Currently using mock data generators within stores to simulate backend services
3. **Component Interaction**: Components consume store data and actions via hooks

### Content Management
- Supports article creation with markdown content
- Handles affiliate links and featured images
- Content status workflow: Draft → Published → Archived

### Video Management
- Supports multiple video types (short/long form)
- Platform-specific formatting (TikTok, YouTube Shorts, Instagram Reels)
- Video projects with effects, transitions, and sound management

### Analytics Dashboard
- Performance metrics visualization
- User demographics tracking
- Engagement analytics (views, likes, shares, comments)
- Conversion rate and revenue tracking for affiliate content

## Code Style Guidelines
- **TypeScript**: Use strict mode with complete type annotations
- **Formatting**: 2 space indentation, 100 char line limit, single quotes
- **Imports**: Group imports (React, external, internal), sort alphabetically
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Components**: Prefer functional components with explicit return types
- **Error Handling**: Use try/catch blocks with centralized error logging
- **State Management**: Use context/hooks for state, avoid prop drilling
- **CSS**: Prefer Tailwind CSS with componentized styling