# MyLawyer - AI-Powered Legal Support Platform

## Overview

MyLawyer is a comprehensive AI-powered legal support platform designed to make legal assistance accessible to everyone in India. The system provides AI-driven legal advice, complaint management, community forums, and a digital legal library, all through a mobile-first user interface.

## Features

### 🤖 AI Legal Assistant
- Get instant answers to legal questions in simple language
- Context-aware legal advice powered by OpenAI GPT-4o
- Conversation history with auto-generated titles
- Proper disclaimers and professional consultation recommendations

### 📝 Digital Complaint Management
- Easy complaint submission with AI categorization
- Automatic priority assignment based on content analysis
- Status tracking and updates
- Digital complaint numbering system

### 📚 Legal Library
- Categorized legal articles and resources
- Full-text search capabilities
- Simplified explanations of Indian laws and procedures
- Admin-managed content system

### 👥 Community Forum
- User-generated legal discussions and experiences
- Like and comment system
- Community-driven content moderation
- Safe space for sharing legal stories

### 🔐 Secure Authentication
- Replit Auth integration for secure login
- Session management with PostgreSQL storage
- User profile management
- Protected routes and endpoints

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with session management
- **AI Integration**: OpenAI GPT-4o API

### Database
- **ORM**: Drizzle ORM with type-safe queries
- **Database**: PostgreSQL with Neon hosting
- **Session Storage**: PostgreSQL-based session store
- **Migrations**: Managed via Drizzle Kit

## Getting Started

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sristi-Vasani/MyLawyer.git
cd MyLawyer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/mylawyer

# OpenAI API
OPENAI_API_KEY=sk-proj-your-api-key-here

# Authentication (for Replit deployment)
SESSION_SECRET=your-session-secret
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-domain.com
```

4. Push database schema:
```bash
npm run db:push
```

5. Seed initial data:
```bash
# Make a POST request to /api/seed to populate legal categories and articles
curl -X POST http://localhost:5000/api/seed
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
mylawyer/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── services/           # Business logic services
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   └── auth.ts             # Authentication logic
├── shared/                 # Shared type definitions
│   └── schema.ts           # Database schema and types
└── README.md
```

## API Endpoints

### Authentication
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user
- `GET /api/auth/user` - Get current user info

### Chat
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations/:id/messages` - Send message
- `GET /api/chat/conversations/:id/messages` - Get conversation messages

### Legal Library
- `GET /api/legal/categories` - Get legal categories
- `GET /api/legal/articles` - Get legal articles (with search)

### Complaints
- `POST /api/complaints` - Submit complaint
- `GET /api/complaints` - Get user complaints
- `GET /api/complaints/:id` - Get specific complaint

### Community
- `GET /api/community/posts` - Get community posts
- `POST /api/community/posts` - Create new post
- `POST /api/community/posts/:id/like` - Toggle post like
- `POST /api/community/posts/:id/comments` - Add comment
- `GET /api/community/posts/:id/comments` - Get post comments

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the GitHub repository.

## Acknowledgments

- Built with love for making legal assistance accessible to all
- Supports UN Sustainable Development Goals (SDGs) 4, 5, 10, and 16
- Empowering citizens with accessible legal support

---

**Note**: This application is designed to provide general legal information and should not replace professional legal advice. Always consult with qualified legal professionals for specific legal matters.