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
}
```

## How It Works

### 1. AI Generation

The AI is instructed to include a `<SCENE_META>` block after each scene:

```
<SCENE_META>
emotional_beat: tentative trust building
tension_threads: secret identity, jealousy subplot
relationship_progress: 2
key_moment: protagonist reveals past trauma
</SCENE_META>
```

### 2. Parsing

The `parseSceneMeta()` function extracts:

- Clean narrative content (without meta tags)
- Structured metadata object
- Generated summary

### 3. Storage

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

### 4. Context Usage

When generating the next scene:

- `getRecentScenes()` returns summaries instead of full content
- Summaries are generated from metadata when available
- Falls back to heuristic analysis if metadata is missing

## Benefits

### Token Efficiency

- Summaries are ~20-40 tokens vs 800-1200 for full scenes
- Recent context (2 scenes) reduced from ~2000 tokens to ~60 tokens
- Significant cost savings on multi-scene stories

### Better Continuity

- Tracks emotional progression numerically
- Maintains awareness of unresolved tensions
- Highlights key moments for callback opportunities

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
- Include `setting_detail` for location continuity

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
