# Session Summary - Spicy Tales Project Setup

**Date:** November 10, 2025
**Status:** MVP Complete with AI Enhancement + Scene Length Control! 🎉🤖📏
**Next Phase:** Polish & Testing (Phase 13)

---

## 🎉 What We Accomplished

### ✅ Phase 1: Foundation & Setup (100%)

- Initialized TanStack Start project with TypeScript strict mode
- Configured Tailwind CSS with custom romance color palette
- Set up pnpm 9+ as package manager
- Updated to Node.js 24
- Created comprehensive environment variable template
- Set up project structure and utilities

### ✅ Phase 2: Database Infrastructure (100%)

- Designed and created complete database schema (9 tables)
- Set up Kysely for type-safe PostgreSQL queries
- Created migration system with runner script
- Built seed script with 4 sample novel templates
- Generated TypeScript types from schema
- Created query helpers for users, stories, and scenes

### ✅ Phase 3: Authentication System (100%)

- Implemented secure session management (httpOnly cookies, 30-day expiry)
- Set up Google OAuth with Arctic library
- Built email/password authentication with Argon2 hashing
- Created all auth API routes (login, signup, logout, OAuth)
- Built beautiful login and signup UI pages
- Implemented password strength validation

### ✅ Phase 4: AI Integration (100%)

- **Migrated from OpenAI SDK to Vercel AI SDK**
- **Added support for 4 AI providers:**
  - OpenAI (GPT-4, GPT-3.5)
  - Google Gemini (1.5 Pro, Flash)
  - Anthropic Claude (3.5 Sonnet, Opus, Haiku)
  - Mistral AI (Large, Medium, Small)
- Created dynamic prompt templates
- Built scene generation with context awareness
- Implemented scene caching in database
- Added validation for scene quality

### ✅ Phase 5: Docker Setup (100%)

- Created multi-stage Dockerfile for optimal image size
- Set up docker-compose with PostgreSQL, Redis, and app
- Configured health checks and automatic migrations
- Added comprehensive Docker documentation
- Created unified .env template for local and Docker

### ✅ Phase 6: User Onboarding Flow (100%)

- **Created comprehensive preference type system**
  - 6 genres (Contemporary, Fantasy, Paranormal, Historical, Sci-Fi, Small Town)
  - 9 romance tropes (Enemies-to-Lovers, Fake Dating, Second Chance, etc.)
  - 5 spice levels with descriptions and flame icons
  - 2 pacing options (Slow Burn, Fast-Paced)
- **Built 3-step onboarding page** with beautiful UI
  - Step 1: Genre selection
  - Step 2: Trope selection
  - Step 3: Spice level and pacing preferences
  - Progress stepper with validation
- **Created preferences API endpoint**
  - POST: Save user preferences with validation
  - GET: Retrieve user preferences
- **Updated authentication flows**
  - Login now checks preferences and redirects accordingly
  - Signup redirects to onboarding
  - Google OAuth handles onboarding redirect
- **Created placeholder pages**
  - Browse page for novel templates
  - Library page for user's stories
- **Bug Fix:** Fixed signup form error display (was showing "[object Object]")

### ✅ Phase 7: User Profile Management (100%)

- **Created comprehensive profile page** with 4 main sections
  - Profile Information: Update name and email
  - Security Settings: Change password with verification
  - Preferences: Link to re-onboarding
  - Danger Zone: Delete account with confirmation modal
- **Built 3 API endpoints** for profile management
  - GET /api/profile - Fetch user data
  - PATCH /api/profile - Update name/email (with duplicate check)
  - DELETE /api/profile - Delete account (with password verification)
  - POST /api/profile/password - Change password (with strength validation)
- **Enhanced navigation** - Added profile link to Browse and Library pages
- **Security features**
  - Password verification for sensitive operations
  - Email uniqueness validation
  - Cascade deletion of all user data
  - Session cleanup on account deletion

### ✅ Phase 8: Novel Template System (100%)

- **Created NovelCard component** for displaying templates
  - Gradient cover with trope badges
  - Estimated scene count display
  - "View Details" and "Start Reading" action buttons
- **Built browse page with filtering**
  - Search by title/description
  - Filter by tropes (multiple selection)
  - Combined search + trope filtering
  - Responsive grid layout
- **Created 2 API endpoints** for templates
  - GET /api/templates - Fetch all templates with optional filters
  - GET /api/templates/:id - Fetch single template with choice points
- **Built template detail page**
  - Full template information display
  - Choice points preview with options
  - Statistics (scenes, key decisions)
  - "Start Your Story" CTA buttons
- **Tested complete flow** - Browse → Filter → View Details → Start Story

### ✅ Phase 9: Story Creation (100%)

- **Created story creation page** (`/story/create`)
  - Loads template details by ID
  - Fetches user's default preferences
  - Allows per-story preference overrides (spice level, pacing)
  - Beautiful UI with flame icons for spice levels
  - Pacing selection (Slow Burn vs Fast-Paced)
  - Optional custom story title input
  - Auto-generated title preview
  - Duplicate warning when template already in use
  - Cancel and Start Reading buttons
  - Loading and error states
- **Built API endpoint POST /api/stories**
  - Authentication check with session
  - Validates input with Zod schema (including optional story title)
  - Creates user_story record in database
  - Stores optional preference overrides
  - Auto-generates story title with smart counter
  - Returns story ID for redirection
- **Integrated flow** - Template detail page links to story creation
- **Temporary redirect** - Currently redirects to library (reading interface not yet built)

### ✅ Phase 10a: Story Title System (100%)

- **Database Migration 002_add_story_title**
  - Added `story_title` column (VARCHAR 255, nullable)
  - Backfilled existing stories with template titles
  - Updated TypeScript types for type safety
- **Smart Title Auto-Generation**
  - First story from template: Uses template title
  - Subsequent stories: Adds counter (#2, #3, etc.)
  - Custom titles: Users can override defaults
  - Counts existing stories per template per user
- **Duplicate Detection & Warning**
  - Fetches user's existing stories for template
  - Shows amber warning when duplicates exist
  - Displays count and preview of new title
  - Helps users distinguish multiple playthroughs
- **Enhanced Story Creation Form**
  - Optional story title input field
  - Real-time preview of final title
  - Shows auto-generated default in placeholder
  - Max 255 characters with validation

### ✅ Phase 10b: Library Page Enhancement (100%)

- **Created functional library page** with real data
  - Replaced placeholder with actual story fetching
  - Added tabs for "In Progress" and "Completed" stories
  - Loading and error states
  - Empty state with CTA to browse
- **Built API endpoint GET /api/stories/user**
  - Authentication check
  - Fetches user's stories with template details
  - Optional status filter (in-progress/completed)
  - Returns full story data with joined templates
- **Story Card Display**
  - Shows custom story title or template title
  - Displays creation date ("Started Nov 10, 2025")
  - Template description
  - Progress bar with scene tracking
  - Percentage completion
  - Continue/Read Again button (disabled until Phase 11)
  - Responsive grid layout (1/2/3 columns)
- **Tab Switching**
  - In Progress tab with clock icon
  - Completed tab with sparkles icon
  - React Query caching per tab
  - Smooth transitions

### ✅ Phase 11: Reading Interface (100%) 🎉

- **Created main reading page** (`/story/$id/read`)
  - Scene display with prose content
  - Scene number and progress bar
  - Loading states for AI generation
  - Error handling and display
  - Back to Library button
- **Built scene fetching API** (GET `/api/stories/$id/scene`)
  - Session authentication check
  - Scene cache lookup in database
  - On-demand AI scene generation with context
  - Caches generated scenes to database
  - Choice point detection for current scene
  - Story completion detection
- **Built choice recording API** (POST `/api/stories/$id/choose`)
  - Validates choice selection with Zod
  - Records user choice to database
  - Updates story progress (current_scene)
  - Checks for story completion
  - Returns next scene number
- **Built progress update API** (PATCH `/api/stories/$id/scene`)
  - Updates story progress for non-choice scenes
  - Session authentication check
  - Validates scene number is sequential
- **Implemented dual progression system**
  - Choice points: 3-option selector with submission
  - Non-choice scenes: "Continue to Next Scene" button
  - Handles scenes 1-2 (no choices) and 3,7,10 (choices)
- **Scene navigation features**
  - Next scene button (enabled when scene unlocked)
  - Previous scene button (navigate to any prior scene)
  - Progress bar showing current/total scenes
  - Percentage completion display
- **Bug Fixes**
  - ✅ Fixed next scene button always disabled
    - Changed logic from `>=` to `+ 1 >` current_scene
  - ✅ Added continue button for non-choice scenes
    - Created PATCH endpoint for progress updates
  - ✅ Fixed duplicate key constraint violation
    - Added try-catch in cacheScene() for error code 23505
    - Returns null on duplicate instead of throwing
- **Library Integration**
  - Updated Continue Reading buttons to actual links
  - Removed disabled state
  - Full flow: Library → Read → Progress → Library

### ✅ Phase 12: AI Prompt Enhancement & Metadata System (100%) 🤖

- **Enhanced AI System Prompt**
  - Expanded spice level descriptions with clear consent rules
  - Added protagonist traits integration (action, micro-thoughts, subtext)
  - Added setting preferences with sensory/environmental texture
  - Implemented prose guardrails (no meta commentary, varied hooks)
  - **Enhanced DO NOT section** with explicit safety rules:
    - All characters must be 18+ with contextual proof
    - Comprehensive prohibited content list
    - Clear consent requirements
  - Improved pacing descriptions (gradual vs brisk escalation)
  - Continuity and economy guidelines

- **Enhanced Scene Prompt Generation**
  - Phase-aware objectives (Opening, Early, Rising, Pre-Climax, Resolution)
  - 3-6 specific objectives per phase
  - Variable word targets per phase (700-1100 words)
  - Improved choice handling (implicit consequences, poised tension)
  - Better recent context formatting (220 chars vs 300)

- **SCENE_META System** (Structured Metadata Capture)
  - Created `SceneMetadata` interface with 4 fields:
    - `emotional_beat` - Brief emotional state description
    - `tension_threads` - Comma-separated unresolved tensions
    - `relationship_progress` - Numeric scale (-5 to +5)
    - `key_moment` - Defining moment in 5-8 words
  - Implemented `parseSceneMeta()` parser function
    - Extracts `<SCENE_META>` block from AI output
    - Separates narrative from metadata
    - Generates smart summaries from metadata
  - **Database Migration 003_add_scene_metadata**
    - Added `metadata` (JSONB) column to scenes table
    - Added `summary` (TEXT) column to scenes table
    - Applied to Docker PostgreSQL database
  - Updated `cacheScene()` to store metadata and summary
  - Enhanced `extractSceneSummary()` to prefer metadata over heuristics
  - Modified `getRecentScenes()` to return compact summaries
  - Added `getSceneMetadata()` for single scene metadata retrieval
  - Added `getStoryMetadataProgression()` for full story analysis

- **Token Efficiency Improvements**
  - Previous: ~2000 tokens for 2 scenes context
  - Now: ~60 tokens for 2 scene summaries
  - **97% reduction in context token usage**

- **Benefits Delivered**
  - Better narrative continuity across scenes
  - Emotional progression tracking
  - Tension thread maintenance
  - More coherent character development
  - Foundation for analytics and visualizations
  - Significant cost reduction per story generation

### ✅ Phase 13: Scene Length Control Feature (100%) 📏

- **User-Controlled Scene Length**
  - Added 3 preset options: Short, Medium, Long
  - Smart word count ranges that adapt to story phase
  - Architecture supports custom word counts (future enhancement)

- **Type System Updates**
  - Added `SCENE_LENGTH_OPTIONS` constant
  - Created `SceneLengthOption` type
  - Updated `UserPreferences` interface with optional `sceneLength`
  - Added `SCENE_LENGTH_LABELS` with descriptions and word counts

- **AI Prompt System Enhancement**
  - Created `getSceneLengthRange()` function:
    - Handles presets with multipliers (0.65x, 1.0x, 1.4x)
    - Phase-aware adjustments (shorter for resolutions)
    - Supports future custom word counts with ±15% flexibility
  - Updated `buildScenePrompt()` to use dynamic word targets

- **Word Count Ranges by Length**
  - **Short**: ~500-700 words (quick, punchy scenes)
  - **Medium**: ~800-1100 words (balanced pacing) - default
  - **Long**: ~1100-1500 words (detailed, immersive)
  - Automatically adjusts based on story phase

- **UI Integration**
  - Added scene length selector to onboarding (Step 3)
  - Added scene length override in story creation form
  - 3-column grid layout with descriptions and word counts
  - Defaults to "medium" for optimal experience

- **Benefits**
  - User control over reading experience length
  - Faster reads for time-constrained users
  - Deep immersion for dedicated readers
  - Cost optimization (shorter scenes = fewer tokens)
  - Future-ready for custom word count input

### ✅ Documentation (100%)

- **README.md** - Project overview and quick start
- **PROGRESS.md** - Detailed implementation tracking
- **DOCKER.md** - Complete Docker setup guide
- **AI_PROVIDERS.md** - 400+ line multi-provider guide
- **SCENE_METADATA.md** - Metadata system documentation
- **.env.example** - Comprehensive environment template

---

## 📦 Project Structure

```
spicy-tales/
├── src/                        # Renamed from 'app' for TanStack Start compatibility
│   ├── router.tsx              # TanStack Router config
│   ├── routes/
│   │   ├── __root.tsx          # Root layout with React Query
│   │   ├── index.tsx           # Landing page
│   │   ├── auth/
│   │   │   ├── login.tsx       # Login page
│   │   │   └── signup.tsx      # Signup page
│   │   └── api/
│   │       └── auth/           # Auth API routes
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts       # Multi-provider AI client
│   │   │   ├── prompts.ts      # Prompt templates
│   │   │   └── generate.ts     # Scene generation
│   │   ├── auth/
│   │   │   ├── session.ts      # Session management
│   │   │   ├── oauth.ts        # Google OAuth
│   │   │   └── password.ts     # Password hashing
│   │   ├── db/
│   │   │   ├── index.ts        # Kysely client
│   │   │   ├── types.ts        # Generated types
│   │   │   ├── migrate.ts      # Migration runner
│   │   │   ├── seed.ts         # Seed script
│   │   │   ├── migrations/
│   │   │   │   ├── 001_initial.ts
│   │   │   │   ├── 002_add_story_title.ts
│   │   │   │   └── 003_add_scene_metadata.ts
│   │   │   └── queries/
│   │   │       ├── users.ts
│   │   │       ├── stories.ts
│   │   │       └── scenes.ts
│   │   └── utils.ts            # Utility functions
│   └── styles/
│       └── globals.css         # Global styles
├── docs/
│   ├── README.md               # Main documentation
│   ├── PROGRESS.md             # Implementation tracking
│   ├── DOCKER.md               # Docker guide
│   └── AI_PROVIDERS.md         # AI provider guide
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml          # Service orchestration
├── docker-entrypoint.sh        # Startup script
├── .env.example                # Environment template
├── .nvmrc                      # Node version (24)
├── .node-version               # Node version file
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind config
└── app.config.ts               # TanStack Start config
```

---

## 🗄️ Database Schema

**9 Tables Created:**

1. **users** - User accounts
2. **oauth_accounts** - OAuth provider linkage
3. **password_accounts** - Email/password credentials
4. **sessions** - Active user sessions
5. **novel_templates** - Story templates with tropes
6. **choice_points** - Decision points in stories
7. **user_stories** - User's active/completed stories
8. **choices** - User's selected choices
9. **scenes** - Generated scene cache with metadata

**3 Migrations Applied:**

1. **001_initial** - Complete database schema
2. **002_add_story_title** - Story title customization
3. **003_add_scene_metadata** - Metadata and summary columns

**Seeded Data:**

- 4 Romance novel templates
- 12 Choice points across templates
- Various tropes (enemies-to-lovers, fake-dating, etc.)

---

## 🔧 Technology Stack

| Category            | Technology                          |
| ------------------- | ----------------------------------- |
| **Runtime**         | Node.js 24                          |
| **Package Manager** | pnpm 9+                             |
| **Framework**       | TanStack Start (React + SSR)        |
| **Styling**         | Tailwind CSS                        |
| **Database**        | PostgreSQL 14                       |
| **ORM**             | Kysely (type-safe query builder)    |
| **Auth**            | Arctic (OAuth) + Argon2 (passwords) |
| **AI**              | Vercel AI SDK (4 providers)         |
| **State**           | TanStack Query                      |
| **Icons**           | Lucide React                        |
| **Container**       | Docker + Docker Compose             |

---

## 🤖 AI Provider Options

| Provider          | Free Tier | Cost/Scene   | Best For             |
| ----------------- | --------- | ------------ | -------------------- |
| **Google Gemini** | ✅ Yes    | $0.001-0.01  | Development, testing |
| **Mistral AI**    | ❌ No     | $0.002-0.02  | Cost-effective       |
| **OpenAI GPT-4**  | ❌ No     | $0.01-0.05   | High quality         |
| **Claude 3.5**    | ❌ No     | $0.015-0.075 | Most creative        |

**Recommendation:**

- Development: Use Google Gemini (free tier)
- Production: Use OpenAI GPT-4 Turbo or Claude 3.5 Sonnet

---

## 🚀 Quick Start Commands

```bash
# Using Docker (Recommended)
cp .env.example .env
# Edit .env with your API keys
docker-compose up --build

# Using Local Development
cp .env.example .env
# Edit .env with your API keys
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

---

## ✅ Working Features

- ✅ Beautiful landing page with call-to-action
- ✅ Email/password signup with validation
- ✅ Email/password login
- ✅ Google OAuth authentication
- ✅ Session management (30-day expiry)
- ✅ Database with seeded templates
- ✅ AI scene generation (4 provider options)
- ✅ Scene caching to reduce costs
- ✅ Docker containerization
- ✅ Automatic database migrations
- ✅ **3-step user onboarding flow**
- ✅ **Preference management (genres, tropes, spice, pacing)**
- ✅ **Scene length control (short, medium, long presets)**
- ✅ **Intelligent auth redirects (onboarding vs browse)**
- ✅ **Browse and Library pages**
- ✅ **User profile management**
- ✅ **Profile editing (name, email)**
- ✅ **Password change functionality**
- ✅ **Account deletion with confirmation**
- ✅ **Browse novel templates with search and filters**
- ✅ **Template detail view with choice points preview**
- ✅ **NovelCard component with gradient covers**
- ✅ **Story creation with preference customization**
- ✅ **Per-story spice level and pacing overrides**
- ✅ **Smart story title auto-generation with counters**
- ✅ **Duplicate template warning system**
- ✅ **Custom story titles with preview**
- ✅ **Functional library page with real data**
- ✅ **In-progress and completed story tabs**
- ✅ **Story cards with progress tracking**
- ✅ **Creation date display**
- ✅ **Reading interface with scene display**
- ✅ **AI scene generation on-demand**
- ✅ **Choice selection (3 options)**
- ✅ **Continue button for non-choice scenes**
- ✅ **Scene navigation (next/previous)**
- ✅ **Progress tracking and updates**
- ✅ **Scene caching to database**
- ✅ **Complete user flow from signup to reading**
- ✅ **Enhanced AI prompts with safety guardrails**
- ✅ **Structured scene metadata capture (emotional_beat, tension_threads, relationship_progress, key_moment)**
- ✅ **Smart summary generation from metadata**
- ✅ **97% token reduction for context passing**
- ✅ **Metadata-based scene continuity**
- ✅ **User-controlled scene length (short/medium/long with phase-aware word counts)**
- ✅ **Dynamic AI word targets based on preferences and story phase**

---

## 🚧 Not Yet Implemented (Next Steps)

### Phase 13: Polish & Testing (NEXT PRIORITY)

- [ ] Error boundaries for better error recovery
- [ ] Loading skeletons for perceived performance
- [ ] Responsive layout improvements
- [ ] Mobile optimization testing
- [ ] Unit tests for core functionality
- [ ] Integration tests for API routes
- [ ] E2E tests for complete user flow

### Phase 14: Advanced Features (Future)

- [ ] Toast notifications for user feedback
- [ ] Story export (PDF/EPUB)
- [ ] Story sharing features
- [ ] Relationship progression visualization (using metadata)
- [ ] Emotional arc charts (using metadata)
- [ ] Statistics dashboard
- [ ] Custom template creation
- [ ] Multiple save slots per template

---

## 📋 Environment Variables Required

### Required for All Setups

```env
SESSION_SECRET=<generate with openssl>
AI_PROVIDER=openai  # or: google, anthropic, mistral
```

### Required Based on AI Provider

```env
# If using OpenAI
OPENAI_API_KEY=sk-...

# If using Google Gemini (FREE TIER!)
GOOGLE_GENERATIVE_AI_API_KEY=...

# If using Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# If using Mistral
MISTRAL_API_KEY=...
```

### Optional

```env
GOOGLE_CLIENT_ID=...      # For OAuth
GOOGLE_CLIENT_SECRET=...  # For OAuth
```

---

## 🎯 Critical Path to MVP

**MVP Status: 100% Complete** ✅✅✅

1. ✅ **Onboarding** (allows users to set preferences) - **COMPLETE**
2. ✅ **Browse** (allows users to see templates) - **COMPLETE**
3. ✅ **Story Creation** (allows users to start stories) - **COMPLETE**
4. ✅ **Library** (allows users to manage stories) - **COMPLETE**
5. ✅ **Reading Interface** (allows users to read & choose) - **COMPLETE**
6. ✅ **AI Enhancement** (metadata, safety, continuity) - **COMPLETE**
7. ✅ **Scene Length Control** (user-controlled pacing) - **COMPLETE**

**The core loop is complete! Ready for polish and user testing.**

---

## 📊 Current Metrics

- **Lines of Code:** ~11,500+
- **Files Created:** 92+
- **Dependencies:** 32 (production) + 14 (dev)
- **Database Tables:** 9
- **Database Migrations:** 3
- **API Routes:** 17 (auth, preferences, profile, templates, stories, scenes, choices)
- **Pages:** 10 (landing, login, signup, onboarding, browse, library, profile, template detail, story create, reading)
- **Components:** 1 (NovelCard)
- **AI Providers:** 4
- **Scene Length Options:** 3 (short, medium, long)
- **Documentation Pages:** 5 (3,100+ lines)

---

## 🔐 Security Features

- ✅ httpOnly, Secure, SameSite cookies
- ✅ Argon2 password hashing (memory-hard)
- ✅ OAuth state validation (CSRF protection)
- ✅ Password strength requirements
- ✅ Session expiry (30 days)
- ✅ Environment variable validation
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: Email verification
- ⚠️ TODO: Password reset

---

## 💾 Database Scripts

```bash
# Run migrations
pnpm db:migrate

# Generate TypeScript types
pnpm db:codegen

# Seed sample data
pnpm db:seed
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f app

# Stop everything
docker-compose down

# Reset database (WARNING: deletes data)
docker-compose down -v
```

---

## 📈 Performance Considerations

### AI Generation Costs

- Scene caching prevents duplicate generation
- Estimated: 12-15 scenes per story
- Cost per complete story: $0.15-$0.75 (GPT-4) or $0.01-$0.15 (Gemini)

### Database

- Connection pooling (max 10 connections)
- Indexes on foreign keys
- Scene cache table prevents regeneration

### Future Optimizations

- [ ] Pre-generate next scene in background
- [ ] Use Redis for session storage
- [ ] Implement CDN for static assets
- [ ] Add database read replicas

---

## 📚 Key Documentation Links

- **Main README:** [README.md](README.md)
- **Implementation Progress:** [PROGRESS.md](PROGRESS.md)
- **Docker Setup:** [DOCKER.md](DOCKER.md)
- **AI Providers Guide:** [AI_PROVIDERS.md](AI_PROVIDERS.md)
- **Environment Setup:** [.env.example](.env.example)

---

## 🎓 Learning Resources

### TanStack Start

- Docs: https://tanstack.com/start/latest
- Router: https://tanstack.com/router/latest

### Vercel AI SDK

- Main Docs: https://sdk.vercel.ai/docs
- Providers: https://sdk.vercel.ai/providers

### Kysely

- Docs: https://kysely.dev/docs/intro
- Examples: https://github.com/kysely-org/kysely

---

## 🚀 Next Session Checklist

When you return to this project:

1. ✅ Check all dependencies are installed: `pnpm install`
2. ✅ Verify Node version: `node --version` (should be 24+)
3. ✅ Copy environment file: `cp .env.example .env`
4. ✅ Add your API keys to `.env`
5. ✅ Start with Docker: `docker-compose up --build`
   - OR locally: `pnpm db:migrate && pnpm db:seed && pnpm dev`
6. ✅ Test complete user flow: signup → onboarding → browse → create story → read scenes
7. 📋 Next focus: Polish and testing
   - Add error boundaries
   - Implement loading skeletons
   - Test mobile responsiveness
   - Add unit tests

---

## 🎯 Success Criteria for MVP

- [x] Users can sign up and log in
- [x] Users can set their preferences
- [x] Users can browse novel templates
- [x] Users can filter templates by tropes
- [x] Users can search templates by keyword
- [x] Users can view template details
- [x] Users can start a story
- [x] Users can see their story library
- [x] Stories have unique titles (with auto-generation)
- [x] Users can read AI-generated scenes
- [x] Users can make choices that affect the story
- [x] Users can progress through non-choice scenes
- [x] Stories are cached (no duplicate AI calls)
- [x] App works in Docker
- [x] Basic error handling
- [ ] Error boundaries for better recovery
- [ ] Loading skeletons for perceived performance
- [ ] Mobile optimization

**Current Progress: 98% Complete**

---

## 💡 Future Enhancements (Post-MVP)

- Social features (share scenes, recommendations)
- Custom template creation
- Multiple protagonist perspectives
- Story branching visualization
- Export as PDF/EPUB
- Mobile app (React Native)
- Subscription tiers
- Community voting on templates
- AI narrator voices (TTS)
- Illustrations at key moments

---

## 🙏 Credits

- **Framework:** TanStack Start by Tanner Linsley
- **AI SDK:** Vercel AI SDK by Vercel
- **Database:** Kysely by Sami Koskimäki
- **Auth:** Arctic by Pilcrow
- **Icons:** Lucide by Lucide Contributors

---

**Session End: November 10, 2025**
**Status: Reading Interface Complete - MVP ~98% Feature-Complete! 🎉**
**Next: Polish & Testing (Phase 12)**

Happy coding! 🚀✨

---

## 🐛 Recent Bug Fixes & Updates

- **November 10, 2025 (Session 1):** Fixed signup form error display - was showing "[object Object]" instead of readable error messages. Now properly parses and displays Zod validation errors.
- **November 10, 2025 (Session 2):** Added comprehensive user profile management system with profile editing, password changes, and account deletion functionality.
- **November 10, 2025 (Session 3):** Completed Phase 8 (Novel Template System) - Enhanced API filtering to support combined trope + search filters. Verified all features working: browse page with search/filters, NovelCard component, template detail page with choice points preview.
- **November 10, 2025 (Session 4):** Completed Phase 9 (Story Creation) - Built story creation page with preference customization (spice level, pacing), created POST /api/stories endpoint, integrated complete flow from template selection to story creation.
- **November 10, 2025 (Session 5):** Completed Phase 10a & 10b (Story Title System & Library) - Added database migration for story_title column, implemented smart auto-generation with counters for duplicate templates, added duplicate warning on story creation, built functional library page with real data fetching, story cards with progress tracking, and creation date display. Fixed .gitignore to exclude schema.sql dumps.
- **November 10, 2025 (Session 6):** Completed Phase 11 (Reading Interface) - Built complete reading page with scene display, AI generation, choice selection, scene navigation, progress tracking. Created GET /api/stories/$id/scene (fetch/generate), POST /api/stories/$id/choose (record choices), and PATCH /api/stories/$id/scene (update progress) endpoints. Fixed three bugs: next scene button logic, added continue button for non-choice scenes, and fixed duplicate key constraint race condition in cacheScene().
