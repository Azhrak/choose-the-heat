# Spicy Tales - AI-Enhanced Romance Novel App

A full-stack TypeScript application that generates personalized, interactive romance novels using AI. Users make choices throughout the story that influence the narrative, with all preferences and progress saved to their profile.

**GitHub Repository**: [https://github.com/Azhrak/spicy-tales](https://github.com/Azhrak/spicy-tales)

## Features

- 🔐 **Authentication**: Google OAuth + Email/Password with session management
- 📚 **Interactive Stories**: AI-generated romance novels with choice-based branching
- 🎨 **Personalization**: Custom preferences for genres, tropes, spice level, pacing, and scene length
- 💾 **Progress Tracking**: Resume stories anytime, all choices cached
- 🤖 **AI-Powered**: Each scene uniquely generated based on your decisions
- 📊 **Smart Metadata**: Automatic emotional tracking, tension threads, and relationship progression
- � **Scene Length Control**: Choose short (230-585 words), medium (350-900 words), or long (490-1260 words) scenes
- �🛡️ **Safety First**: Enhanced content guardrails and age verification in prompts

## Project Status

**Current Phase**: MVP Complete with AI Enhancements & Scene Length Control! 🎉

### 📚 Documentation

- **[PROGRESS.md](PROGRESS.md)** - Detailed implementation status and next steps
- **[SESSION_SUMMARY.md](SESSION_SUMMARY.md)** - Complete session recap and quick reference
- **[DOCKER.md](DOCKER.md)** - Docker setup and deployment guide
- **[AI_PROVIDERS.md](AI_PROVIDERS.md)** - Multi-provider AI configuration guide
- **[SCENE_METADATA.md](SCENE_METADATA.md)** - Metadata system documentation

## Tech Stack

- **Frontend**: TanStack Start, React, Tailwind CSS
- **Backend**: Node.js, Vite
- **Database**: PostgreSQL with Kysely
- **Auth**: Arctic (OAuth), Argon2 (passwords)
- **AI**: Vercel AI SDK (OpenAI, Google Gemini, Anthropic Claude, Mistral)
- **State**: TanStack Query

## Prerequisites

- Node.js 24+
- PostgreSQL 14+
- pnpm 9+ (recommended) or npm
- **AI Provider API key** (choose one):
  - OpenAI (GPT-4) - Best quality
  - Google Gemini - Free tier available
  - Anthropic Claude - Most creative
  - Mistral AI - European option
  - See [AI_PROVIDERS.md](AI_PROVIDERS.md) for details
- Google OAuth credentials (optional)

**OR** use Docker (recommended for quick setup):

- Docker Desktop or Docker Engine
- Docker Compose

## Getting Started

### Option 1: Docker (Recommended) 🐳

For the easiest setup with all services (app, PostgreSQL, Redis) in containers:

See **[DOCKER.md](DOCKER.md)** for complete Docker setup instructions.

**Quick start:**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# Comment out DATABASE_URL and REDIS_URL for Docker
# Then start everything:
docker-compose up --build
```

Visit http://localhost:3000 when ready!

### Option 2: Local Development

#### 1. Clone and Install

```bash
git clone https://github.com/Azhrak/spicy-tales.git
cd spicy-tales
pnpm install
```

#### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb romance_novels
```

#### 3. Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/romance_novels

# Application
APP_URL=http://localhost:3000

# Google OAuth (get from https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# OpenAI (get from https://platform.openai.com/)
OPENAI_API_KEY=sk-your-api-key

# Session (generate with: openssl rand -base64 32)
SESSION_SECRET=your-random-secret
```

#### 4. Run Migrations

```bash
pnpm db:migrate
```

This creates all necessary database tables.

#### 5. Seed Data

```bash
pnpm db:seed
```

This adds sample novel templates and choice points.

#### 6. Generate Types

```bash
pnpm db:codegen
```

This generates TypeScript types from your database schema.

#### 7. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:migrate` - Run database migrations
- `pnpm db:codegen` - Generate Kysely types
- `pnpm db:seed` - Seed novel templates
- `pnpm test` - Run tests

## Project Structure

```
src/
├── routes/                # Pages and API routes
│   ├── __root.tsx        # Root layout
│   ├── index.tsx         # Landing page
│   ├── auth/             # Authentication pages
│   └── api/              # API endpoints
├── components/           # React components
├── lib/
│   ├── db/              # Database (Kysely)
│   ├── auth/            # Authentication logic
│   ├── ai/              # AI integration
│   └── utils.ts         # Utilities
└── styles/              # Global styles
```

## Authentication Flow

1. **Google OAuth**: One-click sign-in with Google
2. **Email/Password**: Traditional authentication with Argon2 hashing
3. **Sessions**: Secure httpOnly cookies, 30-day expiry
4. **Onboarding**: First-time users set preferences

## How It Works

1. **Sign Up**: Create account via Google or email
2. **Set Preferences**: Choose genres, tropes, spice level, pacing
3. **Browse**: Select from curated novel templates
4. **Read**: AI generates scenes based on your preferences
5. **Choose**: Make decisions at key plot points
6. **Continue**: Your choices shape the story uniquely

## Development Notes

### Database Changes

After modifying the schema:

```bash
# 1. Create migration file in src/lib/db/migrations/
# 2. Run migration
pnpm db:migrate
# 3. Regenerate types
pnpm db:codegen
```

### Adding Novel Templates

Edit `src/lib/db/seed.ts` and re-run:

```bash
pnpm db:seed
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t spicy-tales .
docker run -p 3000:3000 --env-file .env spicy-tales
```

## Cost Considerations

- **AI Generation**: ~$0.01-0.05 per scene (GPT-4)
- **Caching**: Scenes cached in DB to avoid regeneration
- **Optimization**: Consider pre-generating next scenes in background

## Security

- ✅ httpOnly, secure cookies
- ✅ CSRF protection (SameSite)
- ✅ Password hashing (Argon2)
- ✅ Input validation (Zod)
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: Content moderation

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
