# Component Usage Summary

This document tracks where all the reusable components created during the refactoring are being used.

**Last Updated:** November 14, 2025 (Phase 15.5)

---

## Custom Hooks Usage

### useStoryQuery

**Location:** `src/hooks/useStoryQuery.ts`
**Used in 1 file:**

- ✅ src/routes/story/$id.info.tsx

**Purpose:** Fetches a single story with all details including preferences, template info, and progress.

### useCurrentUserQuery

**Location:** `src/hooks/useCurrentUserQuery.ts`
**Used in 12 files:**

- ✅ src/routes/library.tsx
- ✅ src/routes/browse.tsx
- ✅ src/routes/story/create.tsx
- ✅ src/routes/story/$id.info.tsx
- ✅ src/routes/template/$id.tsx
- ✅ src/routes/admin/index.tsx
- ✅ src/routes/admin/users/index.tsx
- ✅ src/routes/admin/users/$id/edit.tsx
- ✅ src/routes/admin/templates/index.tsx
- ✅ src/routes/admin/templates/new.tsx
- ✅ src/routes/admin/templates/$id/edit.tsx
- ✅ src/routes/admin/audit-logs/index.tsx

### useUserStoriesQuery

**Location:** `src/hooks/useUserStoriesQuery.ts`
**Used in 2 files:**

- ✅ src/routes/library.tsx
- ✅ src/routes/story/create.tsx (for checking existing stories)

### useTemplatesQuery

**Location:** `src/hooks/useTemplatesQuery.ts`
**Used in 1 file:**

- ✅ src/routes/browse.tsx

### useUserPreferencesQuery

**Location:** `src/hooks/useUserPreferencesQuery.ts`
**Used in 2 files:**

- ✅ src/routes/story/create.tsx
- ⏳ src/routes/preferences.tsx (TODO: Should be migrated to use this hook)

### useDeleteStoryMutation

**Location:** `src/hooks/useDeleteStoryMutation.ts`
**Used in 1 file:**

- ✅ src/routes/library.tsx

---

## Component Usage

### StoryCard

**Location:** `src/components/StoryCard.tsx`
**Used in 1 file:**

- ✅ src/routes/library.tsx - Displays user stories with progress tracking

**Usage Example:**

```typescript
<StoryCard
  id={story.id}
  storyTitle={story.story_title}
  templateTitle={story.template.title}
  templateDescription={story.template.description}
  coverGradient={story.template.cover_gradient}
  createdAt={story.created_at}
  currentScene={story.current_scene}
  totalScenes={story.template.estimated_scenes}
  status={activeTab}
  onDelete={handleDeleteClick}
  isDeleting={deletingId === story.id}
/>
```

**Features:**

- Clickable cover image that navigates to reading page
- Info button to view story settings
- Progress bar integration
- Delete button with loading state
- Responsive design

**Benefits:**

- Reduced 65 lines of duplicate code from library page
- Reusable across all story list views
- Consistent styling with NovelCard
- Centralized story card logic

### FullPageLoader

**Location:** `src/components/FullPageLoader.tsx`
**Used in 4 files:**

- ✅ src/routes/profile.tsx - Default message
- ✅ src/routes/preferences.tsx - Custom message: "Loading your preferences..."
- ✅ src/routes/story/$id.read.tsx - Custom message: "Loading your story..."
- ✅ src/routes/story/$id.info.tsx - Default message

**Benefits:**

- Consistent loading UX across all full-page loaders
- Reduced 21 lines of duplicate code
- Centralized styling (romance gradient background)

### StoryProgressBar

**Location:** `src/components/StoryProgressBar.tsx`
**Used in 2 files:**

- ✅ src/routes/library.tsx - Shows progress for each story in the library grid (via StoryCard)
- ✅ src/routes/story/$id.info.tsx - Shows reading progress on story info page

**Usage Example:**

```typescript
<StoryProgressBar
  currentScene={story.current_scene}
  totalScenes={story.template.estimated_scenes}
/>
```

**Potential additional usage:**

- ⏳ src/routes/story/$id.read.tsx (currently has inline progress, could use this component)

### SpiceLevelSelector

**Location:** `src/components/SpiceLevelSelector.tsx`
**Used in 1 file:**

- ✅ src/routes/story/create.tsx - Spice level selection during story creation

**Usage Example:**

```typescript
<SpiceLevelSelector
  value={spiceLevel}
  onChange={setSpiceLevel}
/>
```

**Potential additional usage:**

- ⏳ src/routes/preferences.tsx (has inline spice selector, could use this component)

### RadioButtonGroup

**Location:** `src/components/RadioButtonGroup.tsx`
**Used in 1 file (2 instances):**

- ✅ src/routes/story/create.tsx:
  - Pacing selection (2 columns)
  - Scene Length selection (3 columns)

**Usage Example:**

```typescript
<RadioButtonGroup
  label="Pacing"
  value={pacing}
  options={PACING_OPTIONS.map((option) => ({
    value: option,
    label: PACING_LABELS[option].label,
    description: PACING_LABELS[option].description,
  }))}
  onChange={setPacing}
  columns={2}
/>
```

**Potential additional usage:**

- ⏳ src/routes/preferences.tsx (has inline pacing and scene length selectors)

### StatCard (Admin)

**Location:** `src/components/admin/StatCard.tsx`
**Currently not used** ⚠️

**Potential usage:**

- ⏳ src/routes/admin/index.tsx (has inline StatCard component)
- ⏳ src/routes/admin/users/index.tsx (has inline StatBox component)
- ⏳ src/routes/admin/templates/index.tsx (has inline StatBox component)

**Action needed:** Replace inline admin stat components with this reusable version.

---

## Shared Types Usage

### From src/lib/api/types.ts

**Template** - Used in:

- ✅ src/hooks/useTemplatesQuery.ts
- ✅ src/hooks/useUserStoriesQuery.ts
- ✅ src/routes/story/create.tsx
- ✅ src/routes/admin/templates/index.tsx
- ✅ src/routes/admin/templates/$id/edit.tsx

**User** - Used in:

- ✅ src/routes/admin/users/index.tsx
- ✅ src/routes/admin/users/$id/edit.tsx

**UserStory** - Used in:

- ✅ src/hooks/useUserStoriesQuery.ts
- ✅ src/hooks/useStoryQuery.ts
- ✅ src/components/StoryCard.tsx (via props)

**StoryStatus** - Used in:

- ✅ src/hooks/useUserStoriesQuery.ts
- ✅ src/components/StoryCard.tsx

**TemplateStatus** - Used in:

- ✅ src/routes/admin/templates/index.tsx
- ✅ src/routes/admin/templates/$id/edit.tsx

---

## Constants Usage

### From src/lib/constants/gradients.ts

**GRADIENT_OPTIONS** - Currently not used ⚠️

**Potential usage:**

- ⏳ src/routes/admin/templates/$id/edit.tsx (has inline gradientOptions array)
- ⏳ src/routes/admin/templates/new.tsx (might have inline gradients)

**Action needed:** Import and use GRADIENT_OPTIONS in template edit forms.

---

## Summary Statistics

### Custom Hooks

- **Created:** 6 hooks
- **In Use:** 6 hooks (100%)
- **Total usages:** 20+ locations
- **New in Phase 15.5:** useStoryQuery

### Components

- **Created:** 6 components
- **In Use:** 5 components (83%)
- **Not Yet Used:** 1 component (StatCard)
- **Total usages:** 12+ locations
- **New in Phase 15.5:** StoryCard

### Shared Types

- **Created:** 10+ type definitions
- **In Use:** All actively used across 25+ files
- **Enhanced in Phase 15.5:** UserStory interface (added preferences field)

### Constants

- **Created:** 1 constants file
- **In Use:** 0 (0%)
- **Action needed:** Migrate gradient options to use GRADIENT_OPTIONS

---

## Recommendations

### High Priority (Components not yet utilized)

1. **Replace inline StatCard components** in admin pages with the reusable `src/components/admin/StatCard.tsx`
2. **Use GRADIENT_OPTIONS** from constants in template edit forms

### Medium Priority (Extend component usage)

3. **Use StoryProgressBar** in `src/routes/story/$id.read.tsx` for consistency
2. **Migrate preferences.tsx** to use:
   - `SpiceLevelSelector`
   - `RadioButtonGroup` for pacing and scene length
   - `useUserPreferencesQuery` hook

### Low Priority (Additional refactoring)

5. Consider creating a `TemplateCard` component (used in browse and library)
2. Consider creating a `TropeFilter` component (used in browse)

---

## Migration Checklist

When adding new code, always check:

- [ ] Is there a custom hook for this query/mutation in `src/hooks/`?
- [ ] Is there a reusable component for this UI pattern in `src/components/`?
- [ ] Are types defined in `src/lib/api/types.ts`?
- [ ] Are constants defined in `src/lib/constants/`?

Before creating new code, always run:

```bash
# Check for existing hooks
ls src/hooks/

# Check for existing components
ls src/components/

# Check shared types
cat src/lib/api/types.ts

# Check constants
ls src/lib/constants/
```

---

## Version History

- **v1.1** (2025-11-14 Phase 15.5) - Added StoryCard component and useStoryQuery hook
  - Added StoryCard component with clickable cover and info button
  - Added useStoryQuery hook for fetching single story details
  - Updated StoryProgressBar usage (now in StoryCard and story info page)
  - Updated FullPageLoader usage (now in story info page)
  - Enhanced UserStory type with preferences field
  - Updated useCurrentUserQuery usage count (12 files)

- **v1.0** (2025-11-14) - Initial component usage tracking
  - Documented all component and hook usage
  - Identified StatCard and GRADIENT_OPTIONS not yet in use
  - Created migration checklist
