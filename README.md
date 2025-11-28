# Choose the Heat - AI-Enhanced Romance Novel App

Full-stack TypeScript app for AI-generated interactive romance novels. Users make choices that influence the narrative, with all preferences and progress saved.

**Repo**: [github.com/Azhrak/choose-the-heat](https://github.com/Azhrak/choose-the-heat) | **Status**: Production Ready! 🎉

## Features

### 🔐 Authentication & User Management
- Google OAuth + Email/Password authentication
- Secure session management with httpOnly cookies
- User profiles with customizable preferences
- Account management and deletion

### 📚 AI-Powered Story Generation
- AI-generated romance novels with choice-based branching
- Real-time streaming content generation (watch stories being written!)
- Story-specific AI configuration (temperature, max tokens, model selection)
- 5 AI providers supported (OpenAI, Google Gemini, Anthropic Claude, Mistral, xAI)
- Smart scene regeneration with retry logic
- Scene metadata tracking (emotions, tension, relationship progress)

### 🎨 Personalization & Preferences
- Custom reading preferences (genres, tropes, spice level, pacing, POV, scene length)
- Mark stories as favorites with filtering
- Editable story titles and cover images
- Preferences management page

### 🌳 Story Experience
- Interactive choice-based branching
- Story branching system (explore alternative storylines)
- Progress tracking with scene caching
- Library with in-progress and completed stories
- Reading statistics and progress bars
- Custom tropes management

### 👑 Admin Dashboard
- Role-based access control (user, editor, admin)
- Template management with AI-assisted generation
- User management and audit logging
- System settings with import/export
- Bulk operations for templates
- Paginated views with search functionality

### 🤖 Technical Features
- Automated CI/CD with database migrations
- Enhanced safety guardrails for content generation
- GDPR compliance with cookie consent
- Responsive design with dark mode support

## Documentation

📚 **[Complete Documentation Index](docs/DOCUMENTATION_INDEX.md)** - Navigate all documentation

### Getting Started
- [Docker Setup](docs/getting-started/DOCKER.md) - Docker setup guide (recommended)
- [Deployment Guide](docs/getting-started/DEPLOYMENT.md) - Production deployment instructions
- [Environment Variables](.env.example) - Configuration template

### Configuration
- [AI Providers](docs/configuration/AI_PROVIDERS.md) - Configure OpenAI, Gemini, Claude, Mistral, or xAI

### Development
- [Implementation Progress](docs/development/PROGRESS.md) - Implementation status & roadmap
- [Coding Standards](docs/development/CODING_PRACTICES.md) - Development standards and patterns
- [Component Usage](docs/development/COMPONENT_USAGE.md) - Component library guidelines
- [Design System](docs/development/DESIGN_SYSTEM.md) - Design system documentation
- [Component Library](docs/development/COMPONENT_LIBRARY.md) - Component API reference
- [Refactoring](docs/development/REFACTORING.md) - Refactoring history and guidelines
- [CI/CD & Migrations](docs/development/CI_MIGRATIONS.md) - Automated deployment & database migrations

### Technical Reference
- [Admin Dashboard](docs/technical/ADMIN.md) - Admin features and role-based access
- [AI Metadata System](docs/technical/SCENE_METADATA.md) - Scene metadata and context management

### Legal & Compliance
- [GDPR Implementation](docs/legal/GDPR_IMPLEMENTATION_SUMMARY.md) - Privacy and compliance details

## Tech Stack

**Frontend**: TanStack Start, React, Tailwind CSS
**Backend**: Node.js, Vite
**Database**: PostgreSQL + Kysely
**Auth**: Arctic (OAuth), Argon2 (passwords)
**AI**: Vercel AI SDK (OpenAI, Google Gemini, Anthropic Claude, Mistral, xAI)
**State**: TanStack Query

## Prerequisites

- Node.js 24+
- PostgreSQL 14+
- pnpm 9+ (or npm)
- AI Provider API key: OpenAI, Google Gemini, Anthropic Claude, Mistral, or xAI
- Google OAuth credentials (optional)

See [AI_PROVIDERS.md](docs/configuration/AI_PROVIDERS.md) for detailed configuration.

**OR use Docker** (recommended - includes PostgreSQL & Redis):

- Docker Desktop or Engine
- Docker Compose

## Quick Start

### Docker (Recommended)

```bash
cp .env.example .env
# Edit .env with your API keys (comment out DATABASE_URL/REDIS_URL)
docker-compose up --build
# Visit http://localhost:3000
```

See [DOCKER.md](docs/getting-started/DOCKER.md) for full Docker setup.

### Local Development

```bash
# 1. Install & setup
git clone https://github.com/Azhrak/choose-the-heat.git
cd choose-the-heat
pnpm install

# 2. Create database
createdb romance_novels

# 3. Environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Database setup
pnpm db:migrate
pnpm db:seed
pnpm db:codegen

# 5. Start
pnpm dev
# Visit http://localhost:3000
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/romance_novels

# Application
APP_URL=http://localhost:3000

# Google OAuth (get from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# AI Provider (choose one)
OPENAI_API_KEY=sk-your-api-key
# OR
ANTHROPIC_API_KEY=your-key
# OR
GOOGLE_API_KEY=your-key
# OR
MISTRAL_API_KEY=your-key
# OR
XAI_API_KEY=your-key

# Session (generate: openssl rand -base64 32)
SESSION_SECRET=your-random-secret
```

## Scripts

- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm start` - Production server
- `pnpm db:migrate` - Run migrations
- `pnpm db:codegen` - Generate types from schema
- `pnpm db:seed` - Seed templates
- `pnpm test` - Run tests

## Project Structure

```
src/
├── routes/           # Pages & API endpoints
│   ├── __root.tsx    # Root layout
│   ├── auth/         # Auth pages
│   ├── story/        # Story pages
│   └── api/          # API endpoints
├── components/       # React components
├── lib/
│   ├── db/          # Database (Kysely)
│   ├── auth/        # Auth logic
│   ├── ai/          # AI integration
│   └── utils.ts     # Utilities
└── styles/          # Global styles
```

## User Flow

1. Sign up (Google OAuth or email)
2. Set preferences (genres, tropes, spice level, pacing, scene length)
3. Browse novel templates
4. Create a story from template
5. AI generates scenes based on your choices
6. Make decisions at plot points to influence story
7. Resume anytime, update preferences from profile

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t choose-the-heat .
docker run -p 3000:3000 --env-file .env choose-the-heat
```

## Development Notes

### Database Changes

```bash
# 1. Create migration in src/lib/db/migrations/
# 2. Run migration
pnpm db:migrate
# 3. Regenerate types
pnpm db:codegen
```

### Add Novel Templates

Edit `src/lib/db/seed.ts` then run:

```bash
pnpm db:seed
```

## Security

- ✅ httpOnly, secure cookies
- ✅ CSRF protection (SameSite)
- ✅ Password hashing (Argon2)
- ✅ Input validation (Zod)
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: Content moderation

## Cost

- ~$0.01-0.05 per scene (GPT-4)
- Scenes cached in DB to avoid regeneration
- Consider pre-generating next scenes in background

## Recent Updates

- ✅ **Story-specific AI Settings** - Configure temperature, max tokens, and model per story
- ✅ **App Settings Management** - Database-driven admin settings with import/export
- ✅ **Cover Images** - Support for custom cover URLs on stories and templates
- ✅ **Scene Regeneration** - Force regenerate scenes with retry logic
- ✅ **Custom Tropes** - Admin can create and manage custom tropes
- ✅ **Favorites** - Mark and filter favorite stories
- ✅ **Pagination & Search** - Enhanced admin views with search and pagination
- ✅ **GDPR Compliance** - Cookie consent and data privacy features

## Roadmap

See [PROGRESS.md](docs/development/PROGRESS.md) for detailed roadmap. Upcoming features:

- Advanced story analytics and visualizations
- Story export (PDF/EPUB)
- Enhanced branching visualization
- Multi-language support
- Mobile app version

## License

MIT

## Support

Open a GitHub issue for questions or problems.
