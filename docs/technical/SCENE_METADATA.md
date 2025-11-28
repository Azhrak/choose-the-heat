# Scene Metadata System

## Overview

The Scene Metadata system captures structured information about each generated scene to improve continuity, context awareness, and future scene generation.

## Database Schema

### New Columns in `scenes` Table

- **`metadata`** (JSONB): Structured metadata about the scene
- **`summary`** (TEXT): Generated summary for efficient context passing

### Migration

Run migration 003 to add these columns:

```bash
pnpm db:migrate
```

## Metadata Structure

```typescript
interface SceneMetadata {
  emotional_beat?: string; // e.g., "tentative trust building"
  tension_threads?: string; // e.g., "secret identity, past trauma"
  relationship_progress?: number; // -5 to +5 scale
  key_moment?: string; // e.g., "first vulnerable confession"
  key_characters?: string; // Comma-separated list of characters present in scene
  pov_character?: string; // Whose perspective the scene is told from
  setting_location?: string; // Where the scene takes place
}
```

### New Character & Setting Tracking (Enhanced)

**key_characters**: A comma-separated list of all significant characters who appear in the scene. This helps:

- Track which characters have been introduced
- Maintain character consistency across scenes
- Ensure characters aren't forgotten or reintroduced unnecessarily
- Build character relationship maps over time

**pov_character**: The name of the character whose perspective the scene is told from. This ensures:

- Consistent point of view within each scene
- Tracking of perspective shifts across the story
- Proper limitation to one character's thoughts per scene
- Clear narrative voice

**setting_location**: Where the scene takes place (e.g., "coffee shop", "protagonist's apartment", "office building"). This helps:

- Maintain spatial continuity
- Avoid illogical location jumps
- Build on previously established environmental details
- Create grounded, consistent settings

## How It Works

### 1. AI Generation

The AI is instructed to include a `<SCENE_META>` block after each scene:

```text
<SCENE_META>
emotional_beat: tentative trust building
tension_threads: secret identity, jealousy subplot
relationship_progress: 2
key_moment: protagonist reveals past trauma
key_characters: Emma, Liam
pov_character: Emma
setting_location: coffee shop downtown
</SCENE_META>
```

**Important**: This metadata block is automatically filtered out during streaming and never shown to users.

### 2. Streaming & Filtering

When scenes are generated in real-time (streaming):

- **Server-side filtering**: The streaming endpoint (`/api/stories/$id/scene/stream`) uses a smart buffering system
- **Buffer size**: Maintains a 200-character buffer to detect `<SCENE_META>` opening tags
- **Detection logic**:
  - Scans incoming chunks for metadata block markers
  - Stops streaming when `<SCENE_META>` is detected
  - Holds metadata in buffer for final processing
- **Clean output**: Only narrative content reaches the user
- **Final parsing**: After streaming completes, full content is parsed via `parseSceneMeta()` for database storage

**Why this matters**: Users see stories being written in real-time without technical metadata cluttering the experience.

### 3. Parsing

The `parseSceneMeta()` function extracts:

- Clean narrative content (without meta tags)
- Structured metadata object
- Generated summary

### 4. Storage

Metadata is stored in the database alongside the scene content:

```typescript
await cacheScene(
  storyId,
  sceneNumber,
  content, // cleaned narrative
  metadata, // structured metadata
  summary // generated summary
);
```

### 5. Context Usage

When generating the next scene:

- `getRecentScenes()` returns summaries AND metadata instead of full content
- Character context is built from previous scenes' metadata
- Established characters are tracked and not reintroduced
- POV consistency is maintained or shifts are deliberate
- Setting continuity is preserved with location tracking
- Summaries are generated from metadata when available
- Falls back to heuristic analysis if metadata is missing

**Character Context Building:**

The system now extracts character information from recent scenes:

- **Established Characters**: Lists all characters who have appeared, reminding the AI not to reintroduce them with full descriptions
- **Recent POV**: Tracks whose perspective was used, encouraging consistency
- **Recent Setting**: Notes the last location to maintain spatial continuity or make transitions clear

## Benefits

### Token Efficiency

- Summaries are ~20-40 tokens vs 800-1200 for full scenes
- Recent context (2 scenes) reduced from ~2000 tokens to ~60 tokens
- Significant cost savings on multi-scene stories

### Better Continuity

- Tracks emotional progression numerically
- Maintains awareness of unresolved tensions
- Highlights key moments for callback opportunities
- **NEW: Tracks introduced characters and their consistency**
- **NEW: Maintains POV consistency across scenes**
- **NEW: Preserves setting continuity and spatial logic**
- **NEW: Enables character relationship mapping over time**

### Future Features

- **Progression Visualization**: Show relationship arc over time
- **Tension Tracking**: Display active subplot threads
- **Emotional Heatmap**: Visualize pacing and intensity
- **Smart Choices**: Generate context-aware choice options
- **Story Analytics**: Provide insights on completed stories

## API Functions

### Core Functions

```typescript
// Parse scene with metadata
const parsed = parseSceneMeta(rawContent);
// Returns: { content, metadata, summary }

// Extract summary (prefers metadata)
const summary = extractSceneSummary(sceneContent);

// Get metadata for a specific scene
const meta = await getSceneMetadata(storyId, sceneNumber);

// Get full story progression
const progression = await getStoryMetadataProgression(storyId);
```

### Query Functions (scenes.ts)

- `cacheScene(storyId, sceneNumber, content, metadata?, summary?)` - Store scene with metadata
- `getSceneMetadata(storyId, sceneNumber)` - Get metadata for one scene
- `getStoryMetadataProgression(storyId)` - Get all metadata for analysis
- `getRecentScenes(storyId, count)` - Get summaries for context

## Implementation Details

### Backward Compatibility

- Metadata columns are nullable
- Existing scenes without metadata continue to work
- Heuristic fallback ensures summaries for old content
- No breaking changes to existing API

### Fallback Logic

If metadata is missing or incomplete:

1. Try to use available metadata fields
2. Fall back to heuristic keyword extraction
3. Always return a valid summary string

### Heuristic Fallback

When metadata isn't available:

```typescript
// Analyzes first ~6 sentences for keywords:
- "kiss", "touch" → "physical spark grows"
- "argu", "tension" → "conflict escalates"
- "secret", "reveal" → "partial reveal"
- "fear", "anxious" → "emotional vulnerability"
- Default → "relationship advances subtly"
```

## Example Usage

### During Scene Generation

```typescript
// In generate.ts
const rawContent = await generateCompletion(systemPrompt, userPrompt);
const parsed = parseSceneMeta(rawContent);

await cacheScene(
  storyId,
  sceneNumber,
  parsed.content,
  parsed.metadata,
  parsed.summary
);

return { content: parsed.content, cached: false };
```

### Analyzing Story Progression

```typescript
const progression = await getStoryMetadataProgression(storyId);

const relationshipArc = progression
  .filter((p) => p.metadata?.relationship_progress)
  .map((p) => p.metadata.relationship_progress);

console.log("Relationship progression:", relationshipArc);
// Example: [0, 1, 1, 2, -1, 3, 4, 5]
```

### Building Context for Next Scene

```typescript
const recentScenes = await getRecentScenes(storyId, 2);
// Returns summaries like:
// [
//   "tentative trust building | first vulnerable confession",
//   "conflict escalates | tensions: jealousy, secret identity"
// ]

// Used in buildScenePrompt() for efficient context
```

## Future Enhancements

### Planned Features

1. **Adaptive Choices**: Generate choice options based on metadata
2. **Pacing Intelligence**: Adjust scene length based on tension level
3. **Callback System**: Reference key moments from metadata
4. **Reader Analytics**: Show users their story's emotional journey
5. **AI Summarization**: Use AI to generate better summaries
6. **Relationship Graph**: Visualize character relationship evolution

### Optional Enhancements

- Add `scene_tone` field (e.g., "playful", "intense", "melancholic")
- Track `character_development` for protagonist growth
- Add `foreshadowing` hints for future callbacks
- ~~Include `setting_detail` for location continuity~~ **✅ IMPLEMENTED as `setting_location`**
- Expand `key_characters` to include character relationship states
- Add `subplot_threads` separate from main tension threads

## Testing

When database is available, test with:

```bash
# Run migration
pnpm db:migrate

# Generate a new scene (will include metadata)
# Check database:
SELECT scene_number, metadata, summary FROM scenes WHERE story_id = '<id>';

# Verify metadata extraction:
# Check that relationship_progress is numeric
# Check that summaries are concise
```

## Migration Path

For existing deployments:

1. **Run migration 003** - Adds nullable columns
2. **Deploy new code** - Starts capturing metadata
3. **Old scenes gracefully degrade** - Use heuristic summaries
4. **New scenes capture full metadata** - Better context over time
5. **Optional: Backfill** - Re-parse old scenes to extract metadata

No data loss, no downtime required.

---

**Status**: Implemented and ready for testing when database is available.

**Related Files**:

- `src/lib/ai/prompts.ts` - Metadata types, parsing, summary generation
- `src/lib/ai/generate.ts` - Integration with scene generation
- `src/lib/db/queries/scenes.ts` - Storage and retrieval
- `src/lib/db/types.ts` - TypeScript types
- `src/lib/db/migrations/003_add_scene_metadata.ts` - Database migration
