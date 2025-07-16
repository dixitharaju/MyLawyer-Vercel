# MyLawyer - AI-Powered Legal Support Platform

## Overview

MyLawyer is a comprehensive AI-powered legal support platform designed to make legal assistance accessible to everyone. The system provides AI-driven legal advice, complaint management, community forums, and a digital legal library, all through a mobile-first user interface.

## User Preferences

Preferred communication style: Simple, everyday language.
GitHub Repository: https://github.com/Sristi-Vasani/MyLawyer.git
Deployment Target: GitHub repository setup for production deployment

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling
- **Mobile-First**: Responsive design optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with session management
- **API**: RESTful endpoints with proper error handling

### Database Design
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Located in `shared/schema.ts` for type sharing
- **Migrations**: Managed via Drizzle Kit
- **Session Storage**: PostgreSQL-based session store

## Key Components

### Authentication System
- **Provider**: Replit Auth integration
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **User Management**: Automatic user creation and profile management
- **Security**: HTTP-only cookies with secure session handling

### AI Legal Assistant
- **Provider**: OpenAI GPT-4o for legal responses
- **Features**: Context-aware legal advice, complaint categorization
- **Conversation Management**: Persistent chat history with title generation
- **Safety**: Proper disclaimers and recommendations for professional consultation

### Legal Library
- **Structure**: Categorized legal articles and resources
- **Search**: Full-text search capabilities
- **Content Management**: Admin-managed legal categories and articles

### Complaint Management
- **Filing**: Digital complaint submission with AI categorization
- **Tracking**: Status tracking and updates
- **Priority System**: Automatic priority assignment based on content analysis

### Community Features
- **Posts**: User-generated legal discussions and stories
- **Interactions**: Like and comment system
- **Moderation**: Community-driven content management

## Data Flow

### User Authentication Flow
1. User accesses protected route
2. Replit Auth middleware validates session
3. User data retrieved from PostgreSQL
4. Session maintained across requests

### AI Chat Flow
1. User submits legal question
2. Message stored in conversation
3. OpenAI API generates response
4. Response stored and returned to user
5. Conversation title auto-generated

### Complaint Processing Flow
1. User submits complaint form
2. AI categorizes complaint type and priority
3. Complaint stored with metadata
4. Status tracking initiated
5. User receives confirmation

## External Dependencies

### Core Services
- **Neon Database**: PostgreSQL hosting
- **OpenAI API**: AI-powered legal responses
- **Replit Auth**: Authentication and user management

### Development Tools
- **Vite**: Frontend build tool and dev server
- **Drizzle Kit**: Database migrations and introspection
- **TanStack Query**: Server state management

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push`

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **AI Service**: `OPENAI_API_KEY` for OpenAI integration
- **Authentication**: `SESSION_SECRET` for session security
- **Replit Integration**: `REPL_ID` and `REPLIT_DOMAINS` for auth

### Production Deployment
- **Node.js**: Express server runs on Node.js
- **Static Assets**: Served from `/dist/public`
- **Database**: PostgreSQL with connection pooling
- **Sessions**: Persistent storage in PostgreSQL

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and scalable design patterns suitable for a legal support platform.