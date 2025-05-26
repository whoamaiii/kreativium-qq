# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js educational web application called "Kreativium" that provides tools for supporting students with special needs. The application includes:

- **AAC (Augmentative and Alternative Communication)**: Symbol-based communication interface with text-to-speech
- **ILP (Individual Learning Plans)**: Goal tracking and PDF report generation system
- **Dashboard**: Activity cards, daily streaks, and quick navigation

## Development Environment

### Prerequisites
- Node.js ≥ 20
- pnpm (preferred package manager)

### Essential Commands

```bash
# Install dependencies
pnpm install

# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Linting
pnpm lint

# Testing
pnpm test              # Run all tests
pnpm test:ui           # Run tests with UI
pnpm test:specific     # Run specific test file

# Database operations
pnpm prisma:seed       # Seed database with initial data
pnpm db:reset          # Reset database and re-seed
```

## Architecture Overview

### Database Layer (Prisma + SQLite)
- **Schema**: Kid → Goals → Entries relationship structure
- **Models**: Kid (students), Goal (learning objectives), Entry (activities/progress)
- **Database**: SQLite with Prisma ORM for development
- **Seeding**: Automated seed script in `prisma/seed.ts`

### Application Structure
- **App Router**: Next.js 15 with App Router architecture
- **Client/Server Components**: Mixed rendering strategy
  - Server components for data fetching (ILP page)
  - Client components for interactive features (AAC interface)
- **API Routes**: RESTful endpoints in `src/app/api/`

### Key Features
1. **AAC System** (`src/app/aac/`):
   - Symbol grid interface with categories (Core, Food, etc.)
   - Real-time text-to-speech using Web Speech API
   - Sentence building and playback
   - Teach mode for symbol customization

2. **ILP System** (`src/app/ilp/`):
   - Server-side data fetching with Prisma
   - Client-side interactions for goal management
   - PDF export functionality using pdf-lib
   - Activity tracking and progress monitoring

3. **PDF Generation** (`src/utils/pdf.ts`):
   - Custom PDF reports using pdf-lib
   - Integration with ILP data export API

### Technology Stack
- **Frontend**: React 19, Next.js 15, TailwindCSS 4
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: SQLite (development), easily configurable for production
- **PDF Generation**: pdf-lib library
- **Testing**: Vitest with React Testing Library and jsdom
- **Type Safety**: TypeScript throughout

### Rewards System
- **Schema**: `Kid.stars` field tracks total earned stars (Int, default 0)
- **Trigger**: Stars awarded when Goal.pct reaches 100
- **Seed**: Idempotent with `SEED_DEMO_DATA=true` for demo content
- **Backfill**: Automatically calculates stars from completed goals

## Development Workflow

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Update seed script if needed
4. Test with `pnpm db:reset`

### Testing Strategy
- Component tests in `*.test.tsx` files alongside components
- Vitest configuration supports JSX and absolute imports (`@/`)
- Setup file in `vitest.setup.ts` for global test configuration

### Code Conventions
- Use Next.js App Router patterns (async server components, client components with "use client")
- Prisma client imported from `@/lib/prisma`
- Absolute imports using `@/` prefix
- TailwindCSS for styling with consistent design system
- TypeScript for all new code

## Key Integration Points

### Data Flow
1. **Server Components**: Fetch data using Prisma in page components
2. **Client Components**: Handle user interactions and state management
3. **API Routes**: Process data mutations and external integrations
4. **Database**: Centralized data layer with foreign key relationships

### PDF Export Workflow
1. Client requests export via API route (`/api/ilp/export`)
2. Server fetches goal and entry data via Prisma
3. PDF generation using custom utility function
4. Binary response with appropriate headers for download

### AAC Communication Flow
1. Symbol selection triggers immediate text-to-speech
2. Sentence building with visual feedback
3. Category-based organization for symbol discovery
4. Real-time search and filtering capabilities