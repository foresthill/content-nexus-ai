# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Development Guide for Claude

## Build/Lint/Test Commands
```bash
# Install dependencies
npm install 

# Run development server
npm run dev

# Lint code
npm run lint

# Format code with Prettier
npm run format

# Run tests (where available)
npm run test

# Run specific test file
npx jest path/to/test-file.test.js
```

## Code Style Guidelines
- **TypeScript**: Use strict mode with complete type annotations
- **Formatting**: 2 space indentation, 100 char line limit, single quotes
- **Imports**: Group imports (React, external, internal), sort alphabetically
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Components**: Prefer functional components with explicit return types
- **Error Handling**: Use try/catch blocks with centralized error logging
- **State Management**: Use context/hooks for state, avoid prop drilling
- **CSS**: Prefer Tailwind CSS with componentized styling
- **Testing**: Write unit tests for utilities and components