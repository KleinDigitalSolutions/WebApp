# NutriWise - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
NutriWise is an intelligent nutrition tracking web application built with Next.js App Router, TypeScript, Tailwind CSS, Zustand for state management, and Supabase as backend-as-a-service.

## Technology Stack
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **APIs**: Grok AI, OpenFoodFacts, Spoonacular
- **Styling**: Tailwind CSS with mobile-first approach
- **PWA**: Progressive Web App capabilities

## Architecture Principles
- Mobile-first design with "app-like" feel
- Server-side rendering (SSR) for dynamic content
- Static generation (SSG) for static content
- Incremental Static Regeneration (ISR) for semi-static content
- Row Level Security (RLS) in Supabase for data protection

## Code Standards
- Use TypeScript for all code
- Implement proper error handling
- Follow Next.js App Router patterns
- Use Tailwind CSS utility classes
- Implement responsive design with Tailwind breakpoints
- Add loading states and smooth animations
- Ensure API keys are properly secured server-side

## Database Schema
- `profiles`: User profile data extending auth.users
- `diary_entries`: Daily nutrition entries
- `recipes`: User recipes and saved recipes
- `weight_history`: Weight tracking (future phase)
- `knowledge_articles`: Blog content (future phase)

## Security Guidelines
- Always use RLS policies in Supabase
- Keep API keys server-side only
- Validate all user inputs
- Implement proper authentication flows
