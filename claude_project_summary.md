# AI-Enhanced Romance Novel App

## Project Overview

A full-stack TypeScript application that generates personalized, interactive romance novels using AI. Users make choices throughout the story that influence the narrative, with all preferences and progress saved to their profile.

## Tech Stack

### Frontend

- **Framework**: TanStack Start (React-based full-stack framework)
- **Routing**: TanStack Router (file-based, type-safe)
- **State Management**: TanStack Query (server state)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js with Vinxi
- **Database**: PostgreSQL with Kysely (type-safe SQL query builder)
- **Auth**: Arctic (OAuth), custom session management
- **AI**: OpenAI API for story generation
- **Caching**: Redis (optional, for scene caching)

### Development

- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm
- **Testing**: Vitest
- **Deployment**: Vercel/Node/Docker

## Core Features

### 1. Authentication

- **Primary**: Google OAuth (Arctic)
- **Fallback**: Email/password with Argon2 hashing
- Session-based auth with httpOnly cookies
- Email verification for password accounts

### 2. User Onboarding

- Multi-step preference collection:
  - Genres (contemporary, fantasy, paranormal, historical, sci-fi)
  - Tropes (enemies-to-lovers, fake dating, second chance, etc.)
  - Spice level (1-5 heat rating)
  - Pacing (slow burn vs fast-paced)
- Saved to `users.default_preferences` (JSONB)

### 3. Novel Selection & Configuration

- Browse pre-built novel templates
- Each template has:
  - Title, description, base tropes
  - Predefined choice points (3 options each)
  - Estimated length (scenes)
- Users can use default preferences or customize per-story

### 4. Interactive Reading Experience

- Scene-by-scene narrative display
- AI-generated content based on:
  - User preferences
  - Previous choices
  - Novel template structure
- Choice points appear at predefined scenes
- 3 options per choice with tone indicators
- Scenes cached in DB for re-reading

### 5. Story Management

- Library view (in-progress vs completed)
- Progress tracking (current scene, completion %)
- Choice history per story
- Re-read with same choices (from cache)
- **Favorites**: Mark stories as favorites with heart icon
  - Toggle on story cards and info pages
  - Filter library to show favorites only
  - Works with both in-progress and completed tabs

## Database Schema

### Core Tables

**users**

- Authentication & profile data
- `default_preferences` (JSONB): genre, tropes, spice level, pacing

**oauth_accounts**

- Google OAuth tokens and provider data

**password_accounts**

- Argon2 hashed passwords for email users

**sessions**

- Session IDs with expiry (30 days)

**novel_templates**

- Pre-written story outlines
- Base tropes, estimated length, cover gradient

**choice_points**

- Predefined decision points in templates
- Scene number, prompt text, 3 options (JSONB)

**user_stories**

- Story instances per user
- Snapshot of preferences at creation
- Current scene tracker, status (in-progress/completed)
- `favorited_at` (timestamp): When story was marked as favorite (null if not favorited)
- `branched_from_story_id`, `branched_at_scene`: Story branching support

**choices**

- User decisions at choice points
- Links story → choice_point → selected_option

**scenes**

- Cached AI-generated content
- Unique per (story_id, scene_number)
- Word count for analytics

## AI Generation Strategy

### Hybrid Approach

1. **Pre-written scaffolding**: Novel templates define structure, key plot points, choice points
2. **AI fills prose**: OpenAI generates ~800-1200 word scenes based on:
   - Template narrative arc
   - User preferences (tropes, spice level, pacing)
   - Previous choices and their impact
   - Character continuity

### Prompt Structure

```typescript
{
  system: "You are a romance novelist specializing in [genres]...",
  user: `
    Story: ${template.title}
    Tropes: ${preferences.tropes}
    Spice: ${preferences.spice_level}/5
    Previous scenes: ${lastTwoScenes}
    Last choice: "${selectedOption.text}" (${tone})
    
    Write scene ${sceneNumber} (800-1200 words)...
  `
}
```

### Caching Strategy

- First generation: API call + DB insert
- Subsequent reads: Serve from `scenes` table
- Optional: Redis for hot reads
- Future: Pre-generate next 2-3 scenes in background

## File Structure

```
app/
├── routes/
│   ├── __root.tsx              # Root layout, React Query provider
│   ├── index.tsx                # Landing page
│   ├── auth/
│   │   ├── login.tsx            # Google primary, email fallback
│   │   ├── signup.tsx
│   │   └── onboarding.tsx       # Preference collection
│   ├── browse.tsx               # Novel template selection
│   ├── library.tsx              # User's stories
│   ├── story/
│   │   ├── $storyId.configure.tsx  # Pre-reading settings
│   │   └── $storyId.read.tsx       # Reading interface
│   └── api/
│       ├── auth/
│       │   ├── google.ts           # OAuth initiation
│       │   ├── callback.google.ts  # OAuth callback
│       │   ├── login.ts            # Email login
│       │   ├── signup.ts           # Email signup
│       │   └── logout.ts
│       ├── novels.ts               # List templates
│       ├── story.$storyId.ts       # CRUD story
│       ├── generate-scene.ts       # AI generation + cache
│       └── make-choice.ts          # Record choice + advance
├── components/
│   ├── ui/                      # Shadcn-style base components
│   ├── NovelCard.tsx            # Template display card
│   ├── ChoiceSelector.tsx       # 3-option choice UI
│   ├── ReadingView.tsx          # Prose display
│   └── PreferencesForm.tsx      # Onboarding form
├── lib/
│   ├── db/
│   │   ├── index.ts             # Kysely instance
│   │   ├── types.ts             # Generated DB types
│   │   ├── migrate.ts           # Migration runner
│   │   ├── queries/
│   │   │   ├── stories.ts       # Story CRUD with joins
│   │   │   ├── scenes.ts        # Scene cache operations
│   │   │   └── users.ts         # User/auth queries
│   │   └── migrations/
│   │       └── 001_initial.sql
│   ├── ai/
│   │   ├── client.ts            # OpenAI wrapper
│   │   ├── prompts.ts           # Prompt templates
│   │   └── generate.ts          # Scene generation logic
│   ├── auth/
│   │   ├── oauth.ts             # Arctic Google setup
│   │   └── session.ts           # Session CRUD
│   └── utils.ts                 # cn() helper
└── styles/
    └── globals.css              # Tailwind imports
```

## Key Type Patterns

### Preferences Type

```typescript
interface TropePreferences {
  genres: string[]              // ["contemporary", "fantasy"]
  tropes: string[]              // ["enemies-to-lovers", "ceo-romance"]
  spiceLevel: 1 | 2 | 3 | 4 | 5  // Heat level
  pacing: "slow-burn" | "fast-paced"
  protagonistTraits?: string[]
  settingPreferences?: string[]
}
```

### Choice Option Type

```typescript
interface ChoiceOption {
  id: string
  text: string                  // Display text
  tone: string                  // "confrontational", "vulnerable", etc.
  impact?: string               // "bold", "reserved", "emotional"
}
```

### Story Context for AI

```typescript
interface GenerateSceneContext {
  template: NovelTemplate       // Title, base tropes, structure
  preferences: TropePreferences // User's settings
  previousChoices: Choice[]     // History of decisions
  sceneNumber: number           // Current position
  previousScenes?: string[]     // Last 1-2 scenes for continuity
}
```

## Development Workflow

### Initial Setup

```bash
pnpm install
pnpm db:migrate      # Run SQL migrations
pnpm db:codegen      # Generate Kysely types
pnpm db:seed         # Seed novel templates + choice points
```

### Development

```bash
pnpm dev             # Start on localhost:3000
# TanStack Router devtools at bottom-right
# React Query devtools at bottom-left
```

### After Schema Changes

```bash
# 1. Create new migration file: app/lib/db/migrations/00X_description.sql
# 2. Run migration: pnpm db:migrate
# 3. Regenerate types: pnpm db:codegen
```

## Environment Variables

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/romance_novels
APP_URL=http://localhost:3000

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# OpenAI
OPENAI_API_KEY=sk-...

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Session secret (generate: openssl rand -base64 32)
SESSION_SECRET=xxx
```

## API Patterns

### Protected Routes

```typescript
export const Route = createAPIFileRoute('/api/generate-scene')({
  POST: async ({ request }) => {
    const session = await getSession(request)
    if (!session?.userId) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    // ... handler logic
  }
})
```

### Type-Safe Queries (Kysely)

```typescript
// With relations using jsonArrayFrom/jsonObjectFrom
const story = await db
  .selectFrom('userStories as us')
  .selectAll('us')
  .select((eb) => [
    jsonObjectFrom(
      eb.selectFrom('novelTemplates')
        .selectAll()
        .whereRef('id', '=', 'us.templateId')
    ).as('template'),
    jsonArrayFrom(
      eb.selectFrom('choices')
        .selectAll()
        .whereRef('storyId', '=', 'us.id')
        .orderBy('createdAt', 'asc')
    ).as('choices')
  ])
  .where('us.id', '=', storyId)
  .executeTakeFirst()
```

## Future Feature Considerations

### Tier 1 (MVP+)

- Character name customization
- Save points / "what if" branching
- Reading preferences (font size, theme)
- Highlights & notes

### Tier 2 (Growth)

- Social features (share endings, discussion threads)
- "% of readers chose this" stats
- Friend recommendations
- Reading stats dashboard

### Tier 3 (Monetization)

- Premium tier (longer stories, exclusive templates)
- Creator studio (user-submitted templates)
- Series/sequels with character continuity

### Tier 4 (Advanced AI)

- Dynamic plot adaptation based on choice patterns
- "Rewrite this scene" user override
- Character chat between chapters

## Known Constraints

1. **AI Costs**: Scene generation is ~$0.01-0.05 per scene. Caching is critical.
2. **Generation Speed**: ~5-15s per scene. Consider background pre-generation.
3. **Content Moderation**: Spice level 5 needs age verification + filtering.
4. **Choice Impact**: Currently branching (binary). Consider weighted influence for smoother narratives.
5. **Novel Length**: Start with 10-15k words (10-12 scenes) to manage costs.

## Testing Strategy

- **Unit**: Database queries, auth helpers, prompt generation
- **Integration**: API routes with test DB
- **E2E**: Critical flows (signup → onboarding → read → choice)
- Mock OpenAI in tests (use fixtures)

## Deployment Notes

### Vercel (Recommended)

- `app.config.ts`: Set `server.preset = 'vercel'`
- Environment variables in Vercel dashboard
- Database: Neon or Supabase (Postgres)

### Docker

- Multi-stage build for production
- Health check on `/api/health`
- Use connection pooling for Postgres

### Database Hosting

- **Neon**: Serverless Postgres, generous free tier
- **Supabase**: Postgres + real-time (future feature)
- **Railway**: Simple Postgres + Redis hosting

## Code Style

- **Naming**: camelCase for variables, PascalCase for components
- **Imports**: Absolute paths via `~/` alias
- **Error Handling**: Try/catch in API routes, return `json({ error }, { status })`
- **Validation**: Zod schemas for all API inputs
- **Types**: Infer from Kysely queries, avoid `any`

## Performance Targets

- **Scene generation**: < 15s
- **Cached scene load**: < 200ms
- **Page load (reading)**: < 1s
- **Database queries**: < 50ms (indexed lookups)

## Security Checklist

- [x] httpOnly, secure cookies for sessions
- [x] CSRF protection (sameSite: 'lax')
- [x] Password hashing with Argon2
- [x] Input validation with Zod
- [ ] Rate limiting on auth endpoints
- [ ] Content moderation for user-generated notes
- [ ] Age verification for high spice levels

---

**Last Updated**: 2025-11-03  
**Version**: 0.1.0 (MVP)
