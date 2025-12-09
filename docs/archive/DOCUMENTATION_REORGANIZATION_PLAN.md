# Documentation Reorganization Plan

**Date**: 2025-12-08  
**Status**: Planning Phase  
**Purpose**: Reorganize documentation from type-centric to feature-centric structure

---

## Executive Summary

This plan reorganizes Choose the Heat documentation into a feature-centric structure under `docs/features/`, making it easier for AI coding agents and developers to find, maintain, and update feature documentation alongside code changes.

**Key Changes:**

- New `docs/features/` directory with 6 feature areas
- Flat structure for easy navigation
- Standardized template for all feature docs
- Clear AI agent update triggers
- Content migration from existing docs to new structure

---

## Current Documentation Issues

### Problems Identified

1. **Scattered Information**: Features documented across multiple locations
   - TTS documentation in `docs/technical/TEXT_TO_SPEECH.md`
   - Admin features in `docs/technical/ADMIN.md`
   - Metadata system in `docs/technical/SCENE_METADATA.md`
   - Progress tracking in `docs/development/PROGRESS.md`

2. **Type-Centric Organization**: Organized by document type rather than feature
   - `technical/` directory mixes unrelated features
   - Hard to find all documentation for one feature
   - No clear pattern for where new feature docs go

3. **Inconsistent Structure**: Each document uses different format
   - Some have tables of contents, some don't
   - Section naming varies widely
   - No standard for API documentation

4. **Poor AI Maintainability**: Missing clear update triggers
   - No guidance on when to update docs
   - No relationship between code changes and doc updates
   - Agents don't know which docs to update when modifying code

---

## Proposed Structure

### Directory Layout

```
docs/
├── FEATURE_DOCUMENTATION_TEMPLATE.md   # Template for new features
├── DOCUMENTATION_INDEX.md              # Main navigation (updated)
├── features/                           # ← NEW: Feature-centric docs
│   ├── authentication.md               # Auth & user management
│   ├── ai-story-generation.md          # Story & scene generation
│   ├── personalization.md              # User preferences & customization
│   ├── story-experience.md             # Reading, choices, navigation
│   ├── text-to-speech.md               # TTS audio generation & playback
│   └── admin-dashboard.md              # Admin & editor features
├── getting-started/                    # Unchanged - setup guides
│   ├── DOCKER.md
│   └── DEPLOYMENT.md
├── configuration/                      # Unchanged - config guides
│   └── AI_PROVIDERS.md
├── development/                        # Development process docs
│   ├── CODING_PRACTICES.md
│   ├── COMPONENT_LIBRARY.md
│   ├── DESIGN_SYSTEM.md
│   ├── CI_MIGRATIONS.md
│   └── PROGRESS.md                     # ← UPDATED: Remove feature details
├── technical/                          # ← REORGANIZED: Non-feature technical docs
│   └── SCENE_METADATA.md               # ← MOVED to features/ai-story-generation.md
├── legal/
│   └── GDPR_IMPLEMENTATION_SUMMARY.md
└── archive/                            # Historical docs
```

**Design Decision: Flat Structure**

- All feature docs in one directory (`docs/features/`)
- No subdirectories for feature categories
- Rationale: 6 features is manageable; easier to navigate; simpler for AI agents

---

## Feature Documentation

### 6 Core Features

#### 1. Authentication & User Management

**File**: `docs/features/authentication.md`

**Covers:**

- OAuth (Google) integration
- Email/password authentication
- User profiles and sessions
- Role-based access control (User, Editor, Admin)
- Arctic auth library usage

**Key Components:**

- `server/middleware/00-auth.ts`
- `src/lib/auth/`
- Session management

**Migrates Content From:**

- Scattered across ADMIN.md (role-based access)
- README.md (auth overview)
- New comprehensive documentation needed

---

#### 2. AI Story Generation

**File**: `docs/features/ai-story-generation.md`

**Covers:**

- Template generation (trope-based, prompt-based)
- Scene generation with AI
- Multi-provider support (OpenAI, Gemini, Claude, Mistral, xAI)
- Scene metadata and context management
- Streaming generation
- Caching strategy

**Key Components:**

- `src/lib/ai/generate.ts`
- `src/lib/ai/generateTemplate.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/ai/client.ts`
- `src/routes/api/stories/`

**Migrates Content From:**

- `docs/technical/SCENE_METADATA.md` (scene metadata system)
- `docs/configuration/AI_PROVIDERS.md` (provider configuration - cross-reference)
- README.md (feature overview)
- Existing code comments

---

#### 3. Personalization & Preferences

**File**: `docs/features/personalization.md`

**Covers:**

- User preferences system
- Spice level settings (1-5)
- Pacing options (slow-burn, medium, fast-paced)
- Scene length preferences
- POV character gender selection
- Genre and trope preferences
- Preference persistence

**Key Components:**

- `src/lib/types/preferences.ts`
- `src/hooks/useUserPreferencesQuery.ts`
- User preferences API routes
- Settings UI components

**Migrates Content From:**

- README.md (preferences overview)
- Component-level documentation
- New comprehensive documentation needed

---

#### 4. Story Experience

**File**: `docs/features/story-experience.md`

**Covers:**

- Reading interface
- Scene navigation (previous/next)
- Choice points (interactive branching)
- Story progress tracking
- Scene display and formatting
- Story creation flow
- Story list and management

**Key Components:**

- `src/routes/story/$id/read.tsx`
- `src/routes/story/create.tsx`
- `src/components/story/`
- Choice handling system

**Migrates Content From:**

- README.md (story experience overview)
- Scattered technical docs
- New comprehensive documentation needed

---

#### 5. Text-to-Speech

**File**: `docs/features/text-to-speech.md`

**Covers:**

- TTS audio generation
- Multi-provider support (OpenAI TTS, Google Cloud TTS)
- Google Cloud Storage integration
- Audio caching and lifecycle
- Signed URLs with expiry
- Audio player with controls
- Streaming audio (experimental)
- Voice consistency

**Key Components:**

- `src/lib/tts/`
- `src/components/StreamingAudioPlayer.tsx`
- `src/routes/api/stories/$id.audio.ts`
- GCS storage integration

**Migrates Content From:**

- `docs/technical/TEXT_TO_SPEECH.md` (ENTIRE FILE - 1200+ lines)
- Complete existing documentation

---

#### 6. Admin Dashboard

**File**: `docs/features/admin-dashboard.md`

**Covers:**

- Role-based access control
- User management (Admin only)
- Template management (Editor/Admin)
- Audit logging system
- Dashboard statistics
- Test page for AI/TTS

**Key Components:**

- `src/routes/admin/`
- Admin API routes
- Role middleware

**Migrates Content From:**

- `docs/technical/ADMIN.md` (ENTIRE FILE - 557 lines)
- Complete existing documentation

---

## Template Structure

### Standard Sections

Every feature document follows `FEATURE_DOCUMENTATION_TEMPLATE.md`:

1. **Metadata** - Status, last updated, related features
2. **Overview** - Purpose, capabilities, use cases
3. **User Experience** - UI, entry points, user flows
4. **Technical Implementation** - Architecture, components, data flow
5. **API Reference** - Request/response types, examples
6. **Code Locations** - Directory structure, key files
7. **Configuration** - Environment variables, settings
8. **Related Features** - Dependencies and dependents
9. **Testing** - Test coverage, manual checklist
10. **Performance** - Optimizations, limitations
11. **Future Enhancements** - Roadmap, planned features
12. **Troubleshooting** - Common issues, debug mode
13. **AI Agent Guidelines** - When/how to update docs
14. **Change Log** - Document history

---

## AI Agent Maintenance

### Update Triggers

Built into the template with HTML comments:

```markdown
<!-- UPDATE TRIGGER: Update when new major capabilities are added or removed -->
```

**Key Triggers:**

- Component added/removed/renamed → Update "Frontend Components"
- API route changed → Update "API Reference"
- Schema migration → Update "Database Schema"
- Feature reaches production → Update metadata status
- New environment variable → Update "Configuration"
- User flow modified → Update "User Flows"

### Update Patterns

Standard workflows for common changes:

**Pattern 1: New Feature Component Added**

1. Add component to "Frontend Components" table
2. Update "Directory Structure"
3. Add to "Primary Components" if user-facing
4. Update "Last Updated"

**Pattern 2: API Route Modified**

1. Update API signature in "API Reference"
2. Update example usage code
3. Update error codes if changed
4. Update "Last Updated"

**Pattern 3: Feature Reaches Production**

1. Change Feature Status from 🚧 to ✅
2. Update API Stability
3. Remove experimental warnings
4. Update "Last Updated"

### Agent Instructions

Clear instructions in template's "AI Agent Maintenance Guidelines" section:

- **Before code changes**: Review docs to understand architecture
- **After code changes**: Update relevant sections based on triggers
- **Quality checks**: Verify paths, types, cross-references
- **Automation hooks**: Future CI/CD integration points

---

## Migration Plan

### Phase 1: Create Structure (Week 1)

**Tasks:**

1. Create `docs/features/` directory
2. Copy `FEATURE_DOCUMENTATION_TEMPLATE.md` to `docs/`
3. Create 6 empty feature files from template
4. Update `DOCUMENTATION_INDEX.md` with new structure

**Files Created:**

- `docs/features/authentication.md`
- `docs/features/ai-story-generation.md`
- `docs/features/personalization.md`
- `docs/features/story-experience.md`
- `docs/features/text-to-speech.md`
- `docs/features/admin-dashboard.md`

---

### Phase 2: Migrate Existing Content (Week 1-2)

#### High Priority (Complete Feature Docs Exist)

**1. Text-to-Speech** (Source: `docs/technical/TEXT_TO_SPEECH.md`)

- Status: ✅ Production Ready
- Size: 1,236 lines
- Migration: Copy and restructure into template format
  - Extract Overview section → Template Overview
  - Extract Features → Template Key Capabilities
  - Extract Architecture → Template Technical Implementation
  - Extract API docs → Template API Reference
  - Add AI agent guidelines
  - Add update triggers
- Effort: 2-3 hours

**2. Admin Dashboard** (Source: `docs/technical/ADMIN.md`)

- Status: Backend ✅ Complete, Frontend 🚧 In Progress
- Size: 557 lines
- Migration: Copy and restructure
  - User roles → Overview & User Experience
  - Permissions matrix → Technical Implementation
  - API reference → Template API Reference
  - Add frontend component details as they're built
  - Add AI agent guidelines
- Effort: 2-3 hours

**3. Scene Metadata** (Source: `docs/technical/SCENE_METADATA.md`)

- Status: Production
- Migration: Move content to `ai-story-generation.md`
  - Merge with AI generation docs
  - Keep as subsection of AI Story Generation feature
  - Update cross-references
- Effort: 1 hour

---

#### Medium Priority (Partial Docs + Code Exploration)

**4. AI Story Generation**

- Sources:
  - `docs/technical/SCENE_METADATA.md` (migrate in)
  - `docs/configuration/AI_PROVIDERS.md` (cross-reference)
  - README.md overview
  - Code exploration of `src/lib/ai/`
- Create: Comprehensive new doc following template
- Sections to write:
  - Overview (from README + code)
  - User Experience (from story creation flow)
  - Technical Implementation (from src/lib/ai/)
  - API Reference (from API routes)
  - Code Locations (from file structure)
- Effort: 4-6 hours

**5. Story Experience**

- Sources:
  - README.md overview
  - Code exploration of reading/choice system
- Create: New comprehensive doc
- Sections to write:
  - Overview (reading + choices + navigation)
  - User Experience (reading page, choice UI)
  - Technical Implementation (scene display, choice handling)
  - API Reference (scene loading, choice submission)
- Effort: 3-4 hours

**6. Personalization**

- Sources:
  - README.md overview
  - Code exploration of preferences system
- Create: New comprehensive doc
- Sections to write:
  - Overview (all preference types)
  - User Experience (settings UI)
  - Technical Implementation (preference storage)
  - API Reference (preference CRUD)
- Effort: 2-3 hours

---

#### Low Priority (Mostly New Documentation)

**7. Authentication**

- Sources:
  - Scattered references in ADMIN.md
  - README.md brief mention
  - Code exploration needed
- Create: New comprehensive doc
- Sections to write:
  - All sections from template
  - Deep dive into Arctic auth library
  - OAuth flow documentation
  - Session management
- Effort: 4-5 hours

---

### Phase 3: Update Cross-References (Week 2)

**Tasks:**

1. Update `README.md` links to point to features/
2. Update `DOCUMENTATION_INDEX.md` navigation
3. Update `AI_PROVIDERS.md` cross-references
4. Add "Related Features" links between feature docs
5. Update code comments pointing to old doc locations

**Files to Update:**

- `README.md` (Features section)
- `DOCUMENTATION_INDEX.md` (Add Features section)
- `docs/configuration/AI_PROVIDERS.md` (Link to ai-story-generation.md)
- Any code comments with doc references

---

### Phase 4: Archive Old Structure (Week 2)

**Tasks:**

1. Move migrated docs to `docs/archive/`
2. Add README in archive explaining migration
3. Add redirects/warnings in archived docs pointing to new location

**Files to Archive:**

- `docs/technical/TEXT_TO_SPEECH.md` → `docs/archive/`
- `docs/technical/ADMIN.md` → `docs/archive/`
- `docs/technical/SCENE_METADATA.md` → `docs/archive/`

**Keep in Place:**

- `docs/technical/` directory (for future non-feature technical docs)

---

### Phase 5: Validation (Week 3)

**Tasks:**

1. Review all 6 feature docs for completeness
2. Verify all cross-references work
3. Check all code paths mentioned in docs exist
4. Test that AI agents can follow update triggers
5. Get team review on structure and content

**Validation Checklist:**

- [ ] All 6 feature files complete
- [ ] Template followed consistently
- [ ] All links work (no broken references)
- [ ] Code paths verified accurate
- [ ] "Related Features" cross-references bidirectional
- [ ] AI agent guidelines clear and actionable
- [ ] Migration complete, old docs archived
- [ ] DOCUMENTATION_INDEX updated

---

## Success Metrics

### Measurability

**Before Reorganization:**

- Feature docs scattered across 4+ files
- 3 different documentation formats
- No AI update guidance
- ~20% of features fully documented

**After Reorganization:**

- All features in dedicated files under `docs/features/`
- 100% consistent template usage
- Every doc has AI maintenance guidelines
- 100% of major features documented

### Developer Experience

- Time to find feature documentation: 5 minutes → 30 seconds
- Time to update docs after code change: Unclear → Clear triggers
- AI agent success rate updating docs: Low → High (measurable after implementation)

### Documentation Quality

- Consistency: Mixed formats → Standardized template
- Completeness: Partial → Comprehensive
- Maintainability: Ad-hoc → Systematic with triggers

---

## Rollout Strategy

### Communication

1. **Team Announcement**: Share this plan for feedback
2. **Template Review**: Review template with team before migration
3. **Progressive Updates**: Migrate high-priority docs first, announce each
4. **Final Cutover**: Archive old docs only after all migrations complete

### Rollback Plan

If structure doesn't work:

1. Old docs preserved in `docs/archive/` for 3 months
2. Can restore from archive if needed
3. Git history preserves all previous versions

### Timeline

- **Week 1**: Create structure, migrate TTS + Admin docs
- **Week 2**: Migrate AI Generation, Story Experience, Personalization
- **Week 2-3**: Create Authentication docs, update cross-references
- **Week 3**: Validation, team review, archive old docs

**Total Estimated Effort**: 20-30 hours

---

## Next Steps

1. **Review this plan** with team
2. **Approve template structure** (`FEATURE_DOCUMENTATION_TEMPLATE.md`)
3. **Begin Phase 1**: Create directory structure
4. **Start Phase 2**: Migrate highest-value docs (TTS, Admin)
5. **Iterate**: Adjust template based on first migrations

---

## Appendix: Content Migration Map

### Detailed Mapping

| Current Location | Content | Destination | Action |
|------------------|---------|-------------|--------|
| `docs/technical/TEXT_TO_SPEECH.md` | Full TTS documentation | `docs/features/text-to-speech.md` | Restructure into template |
| `docs/technical/ADMIN.md` | Full admin documentation | `docs/features/admin-dashboard.md` | Restructure into template |
| `docs/technical/SCENE_METADATA.md` | Scene metadata system | `docs/features/ai-story-generation.md` | Merge as subsection |
| `README.md` (lines 14-50) | Feature overviews | All 6 feature docs | Extract to each feature's Overview section |
| `docs/configuration/AI_PROVIDERS.md` | Provider configuration | Cross-reference from `ai-story-generation.md` | Keep in place, add cross-ref |
| Code comments in `src/lib/ai/` | Implementation details | `docs/features/ai-story-generation.md` | Extract to Technical Implementation |
| Code comments in `src/lib/tts/` | TTS implementation | `docs/features/text-to-speech.md` | Verify against existing docs |
| `docs/development/PROGRESS.md` | Feature status tracking | Feature metadata sections | Distribute status to each feature doc |

---

## Questions for Review

1. **Flat vs Nested**: Should we keep flat `docs/features/` or nest by category?
   - Recommendation: Flat (6 files is manageable)

2. **Template Completeness**: Is the template comprehensive enough?
   - Covers: Metadata, Overview, UX, Technical, API, Testing, Troubleshooting, AI guidelines

3. **Migration Priority**: Start with TTS + Admin (complete docs exist)?
   - Recommendation: Yes, quickest value

4. **Archive Timing**: Archive old docs immediately or after 3-month buffer?
   - Recommendation: Immediate archive with clear pointers to new location

5. **AI Agent Testing**: How do we validate AI agents can maintain docs?
   - Recommendation: Manual testing after Phase 2, automated hooks in future
