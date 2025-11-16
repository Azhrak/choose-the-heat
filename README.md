# Choose the Heat - AI-Enhanced Romance Novel App

Full-stack TypeScript app for AI-generated interactive romance novels. Users make choices that influence the narrative, with all preferences and progress saved.

**Repo**: [github.com/Azhrak/choose-the-heat](https://github.com/Azhrak/choose-the-heat) | **Status**: MVP Complete! 🎉

## Features

- 🔐 Authentication (Google OAuth + Email/Password)
- 📚 AI-generated romance novels with choice-based branching
- 🌳 Story branching system (explore alternative storylines)
- ✏️ Edit story titles anytime
- ❤️ Mark stories as favorites and filter by favorites
- 🎨 Custom preferences (genres, tropes, spice level, pacing, scene length)
- ⚙️ Preferences management page
- 💾 Progress tracking with scene caching
- 👤 User profiles & account management
- 📊 Smart metadata (emotional tracking, tension threads)
- 🛡️ Enhanced safety guardrails
- 👑 Admin dashboard with role-based access control
- 🤖 Automated CI/CD with database migrations

## Documentation

- [PROGRESS.md](PROGRESS.md) - Implementation status & roadmap
- [SESSION_SUMMARY.md](SESSION_SUMMARY.md) - Session recap
- [ADMIN.md](ADMIN.md) - Admin dashboard guide
- [DOCKER.md](DOCKER.md) - Docker setup guide
- [AI_PROVIDERS.md](AI_PROVIDERS.md) - AI configuration
- [SCENE_METADATA.md](SCENE_METADATA.md) - Metadata system
- [docs/CI_MIGRATIONS.md](docs/CI_MIGRATIONS.md) - CI/CD & migrations guide

## Tech Stack

**Frontend**: TanStack Start, React, Tailwind CSS
**Backend**: Node.js, Vite
**Database**: PostgreSQL + Kysely
**Auth**: Arctic (OAuth), Argon2 (passwords)
**AI**: Vercel AI SDK (OpenAI, Gemini, Claude, Mistral, xAI)
**State**: TanStack Query

## Prerequisites

- Node.js 24+
- PostgreSQL 14+
- pnpm 9+ (or npm)
- AI Provider API key: OpenAI, Google Gemini, Anthropic Claude, Mistral, or xAI
- Google OAuth credentials (optional)

See [AI_PROVIDERS.md](AI_PROVIDERS.md) for detailed configuration.

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

See [DOCKER.md](DOCKER.md) for full Docker setup.

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

## Next Steps

See [PROGRESS.md](PROGRESS.md) for:

- Phase 15: Polish & UX improvements
- Phase 16: Advanced features (exports, dashboards, branching visualization)
- Full technical debt & roadmap

## License

MIT

## Support

Open a GitHub issue for questions or problems.
