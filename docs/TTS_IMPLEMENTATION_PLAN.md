# Text-to-Speech Feature Implementation Plan

## Overview

Add text-to-speech functionality to the story reading page, allowing users to listen to stories as audio. The implementation follows existing patterns from the AI provider integration.

**Status: ✅ MVP Complete**

## Requirements

- **TTS Providers**: Configurable (OpenAI ✅, Google Cloud TTS 🚧, ElevenLabs 🚧, Azure 🚧)
- **Storage**: Google Cloud Storage bucket for generated audio files ✅
- **Voice Selection**: User default preference + story-specific voice (maintains consistency) ✅
- **Player Features**: play, pause, volume, speed, seek controls (no auto-play) ✅
- **UI**: "Generate Audio" button in header, floating player at bottom (only visible after generation) ✅
- **Generation**: Whole scene audio at once with automatic chunking for long content ✅
- **Storage Management**: 90-day auto-deletion policy ✅ + "clear all audio" option in settings 🚧
- **Audio Format**: MP3 (universal compatibility) ✅
- **Cost Visibility**: Hidden from users, shown in admin panel only 🚧
- **URL Management**: Signed URLs with on-demand regeneration ✅

## Architecture

### 1. Database Schema Changes

**Migration: `src/lib/db/migrations/012_add_tts_support.ts`** ✅

Create `scene_audio` table:

```typescript
- id (uuid, primary key)
- story_id (uuid, foreign key → user_stories)
- scene_number (integer)
- audio_url (text) // GCS path (gs://bucket/path format)
- file_size (integer) // bytes
- duration (decimal) // seconds
- tts_provider (varchar 50)
- voice_id (varchar 255)
- voice_name (varchar 255)
- generated_at (timestamp)
- created_at (timestamp)
- Unique constraint: (story_id, scene_number)
- Index: (story_id, scene_number)
```

Add columns to `user_stories`:

```typescript
- tts_provider (varchar 50, nullable)
- tts_voice_id (varchar 255, nullable)
- tts_voice_name (varchar 255, nullable)
```

Add columns to `users`:

```typescript
- default_tts_provider (varchar 50, nullable)
- default_tts_voice_id (varchar 255, nullable)
- default_tts_voice_name (varchar 255, nullable)
```

Seed `app_settings` with TTS defaults:

```typescript
category: 'tts'
- tts.provider → 'openai'
- tts.gcs_bucket_name → ''
- tts.gcs_bucket_path → 'audio/'
```

### 2. TTS Library (`src/lib/tts/`)

**`config.ts`** ✅ - Mirrors AI config pattern:

```typescript
export interface TTSConfig {
  provider: TTSProvider;
  gcsBucketName: string;
  gcsBucketPath: string;
  availableVoices: Record<TTSProvider, Voice[]>;
}

export type TTSProvider = 'openai' | 'google' | 'elevenlabs' | 'azure';

interface Voice {
  id: string;
  name: string;
  language?: string;
  gender?: string;
}

// In-memory cache with 5-minute TTL
// getTTSConfig(): Falls back DB → env
// getTTSConfigForStory(provider?, voiceId?): Story-specific settings
// invalidateTTSCache()
```

**`client.ts`** ✅ - Provider abstraction with intelligent chunking:

```typescript
export async function generateSpeech(options: {
  text: string;
  provider: TTSProvider;
  voiceId: string;
  config?: TTSConfig;
}): Promise<{
  audioBuffer: Buffer;
  duration: number;
  format: string;
}> {
  // Dispatch to provider-specific implementation
}

// Provider implementations:
- generateSpeechOpenAI(): ✅ Uses OpenAI tts-1-hd model with automatic text chunking
- generateSpeechGoogle(): 🚧 TODO: Google Cloud TTS Neural2
- generateSpeechElevenLabs(): 🚧 TODO: ElevenLabs API
- generateSpeechAzure(): 🚧 TODO: Azure Cognitive Services

// Helper function:
- chunkText(): ✅ Intelligently splits text at sentence boundaries for OpenAI's 4096 char limit
```

**`storage.ts`** ✅ - Google Cloud Storage with signed URL support:

```typescript
export async function uploadAudioToGCS(options: {
  audioBuffer: Buffer;
  storyId: string;
  sceneNumber: number;
  provider: string;
  voiceId: string;
}): Promise<string> {
  // Upload to GCS
  // Filename: {storyId}/scene-{number}-{hash}.mp3
  // Returns: GCS path (gs://bucket/path)
}

export async function generateSignedUrl(gcsPath: string): Promise<string> {
  // Generate 7-day signed URL from GCS path
  // Enables access with uniform bucket-level access enabled
}

export async function deleteAudioFromGCS(audioUrl: string): Promise<void> {
  // Delete file from GCS
  // Handles both GCS paths and signed URLs
}

export async function cleanupOldAudio(): Promise<number> {
  // Background job to delete files older than 90 days
}
```

**`voices.ts`** ✅ - Voice management:

```typescript
export async function getAvailableVoices(
  provider: TTSProvider
): Promise<Voice[]> {
  // For ElevenLabs: 🚧 TODO: Fetch from API
  // For others: ✅ Return static list
}
```

### 3. Database Queries

**`src/lib/db/queries/scene-audio.ts`** ✅ - New file:

```typescript
export async function getSceneAudio(storyId: string, sceneNumber: number)
export async function saveSceneAudio(data: SceneAudioInsert)
export async function deleteSceneAudio(storyId: string, sceneNumber: number)
export async function getStoryAudio(storyId: string)
export async function deleteStoryAudio(storyId: string)
```

**Update `src/lib/db/queries/stories.ts`** ✅:

```typescript
export async function updateStoryTTSSettings(storyId: string, settings: {
  provider: string;
  voiceId: string;
  voiceName: string;
})

export async function getStoryTTSSettings(storyId: string): Promise<{
  provider?: string;
  voiceId?: string;
  voiceName?: string;
}>
```

**Update `src/lib/db/queries/users.ts`** ✅:

```typescript
export async function updateUserDefaultTTS(userId: string, settings: {
  provider: string;
  voiceId: string;
  voiceName: string;
})

export async function getUserDefaultTTS(userId: string)
```

**Update `src/lib/db/queries/scenes.ts`** ✅:

```typescript
export async function getSceneByNumber(storyId: string, sceneNumber: number)
// Alias for getCachedScene - used by audio API
```

### 4. API Routes

**`src/routes/api/stories/$id/scene/$number/audio.ts`** ✅

```typescript
GET: Check/generate audio
  Flow:
    1. Authenticate user ✅
    2. Verify story ownership ✅
    3. Check if audio exists ✅
    4. If exists: Generate fresh signed URL and return metadata ✅
    5. If not:
       a. Determine voice (story > user > default) ✅
       b. Fetch scene content ✅
       c. Generate audio via TTS client (with chunking) ✅
       d. Upload to GCS (returns GCS path) ✅
       e. Save metadata to DB ✅
       f. Update story TTS settings (first generation) ✅
       g. Generate signed URL and return ✅

  Response: {
    exists: boolean;
    audioUrl: string; // Fresh signed URL
    fileSize: number;
    duration: number;
    provider: string;
    voice: { id: string; name: string };
  }

DELETE: Remove audio (admin only) ✅
  Flow:
    1. Authenticate user (admin role required) ✅
    2. Delete from GCS ✅
    3. Delete from DB ✅
  Response: { success: boolean }
```

**`src/routes/api/tts/voices.ts`** ✅

```typescript
GET: List available voices
  Query params: provider (optional)

  Response: {
    [provider: string]: Voice[]
  }
```

### 5. Frontend Hooks

**`src/hooks/useAudioGeneration.ts`** ✅

- React Query hook for checking/generating audio
- 5-minute stale time for caching
- Mutation for triggering generation

**`src/hooks/useAudioPlayer.ts`** ✅

- HTML5 Audio element management
- Controls: play, pause, seek, volume, playback rate
- Auto-cleanup on unmount

### 6. UI Components

**`src/components/AudioPlayer.tsx`** ✅

- Floating audio player with full controls
- Play/pause, progress bar, volume slider, speed selector
- Time display and close button
- Dark mode support

**`src/components/AudioGenerationButton.tsx`** ✅

- Button to trigger audio generation
- Shows loading states for both audio and scene generation
- Disabled while scene text is still streaming
- Hidden when audio already exists
- Notifies parent via callback when audio is ready

**`src/components/AudioIndicator.tsx`** ✅

- Small green volume icon when audio exists
- Accessibility labels
- Tooltip on hover

### 7. Reading Page Integration

**Update `src/routes/story/$id.read.tsx`** ✅

- Imports all audio components
- Manages audio player state
- Passes scene generation state to disable button during streaming
- Shows audio indicator in header
- Shows generation button when no audio exists
- Floating player at bottom with proper z-index and margin

### 8. Environment Variables

**Added to `.env.example`** ✅

```bash
# TTS Configuration
TTS_PROVIDER=openai  # openai | google | elevenlabs | azure

# Google Cloud Storage
GCS_BUCKET_NAME=your-bucket-name
GCS_BUCKET_PATH=audio/
GCS_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Provider API Keys
OPENAI_API_KEY=... # Reused from AI config
GOOGLE_CLOUD_TTS_API_KEY=...
ELEVENLABS_API_KEY=...
AZURE_TTS_KEY=...
AZURE_TTS_REGION=eastus
```

### 9. Package Dependencies

**Installed** ✅

```json
{
  "@google-cloud/storage": "^7.17.3",
  "@google-cloud/text-to-speech": "^6.4.0",
  "openai": "^6.9.1"
}
```

## Implementation Details

### ✅ Completed Features

1. **Database Foundation**
   - Migration with scene_audio table
   - TTS columns in user_stories and users tables
   - App settings seeded with defaults

2. **Backend Core**
   - TTS configuration with 5-minute cache
   - OpenAI TTS client with intelligent text chunking
   - GCS storage integration with signed URLs
   - Voice management for all providers
   - Database queries for audio, stories, users

3. **API Endpoints**
   - Audio generation/retrieval with signed URL regeneration
   - Voice listing endpoint
   - Admin-only deletion endpoint

4. **Frontend Hooks**
   - Audio generation with React Query
   - HTML5 audio player management

5. **UI Components**
   - Full-featured audio player
   - Generation button with multiple states
   - Audio availability indicator

6. **Integration**
   - Complete integration into reading page
   - Scene generation state handling

### 🎯 Key Enhancements Made

1. **Signed URL Management**
   - Database stores permanent GCS paths (`gs://bucket/path`)
   - Signed URLs generated on-demand with 7-day expiry
   - Solves uniform bucket-level access compatibility
   - Users always get fresh, valid URLs

2. **Intelligent Text Chunking**
   - Automatically splits text over 4096 characters
   - Splits at sentence boundaries for natural flow
   - Falls back to word boundaries for long sentences
   - Concatenates MP3 chunks seamlessly
   - Handles unlimited scene length

3. **Scene Generation State**
   - Button disabled while scene text is streaming
   - Shows "Scene generating..." message
   - Prevents audio generation for incomplete content

4. **Enhanced Error Handling**
   - Graceful handling of GCS bucket configurations
   - Type-safe session role checking
   - Proper signed URL expiry handling

### 🚧 Future Enhancements

1. **Additional TTS Providers**
   - Google Cloud TTS implementation
   - ElevenLabs API integration
   - Azure Cognitive Services implementation

2. **Admin Features**
   - Cost monitoring dashboard
   - Bulk audio deletion
   - Provider usage statistics

3. **User Features**
   - "Clear all my audio" button in settings
   - Voice selection interface
   - Audio playback history

4. **Background Jobs**
   - Scheduled 90-day cleanup job
   - Orphaned file detection and cleanup
   - Signed URL refresh job (optional)

5. **Optimization**
   - Streaming audio generation (chunk-based)
   - Progressive audio loading
   - Audio preloading for next scene

## Testing Checklist

### ✅ Tested & Working

- [x] Generate audio for scenes (both short and long content)
- [x] Voice saved to story settings on first generation
- [x] Audio indicator shows correctly
- [x] Play/pause/seek controls work
- [x] Volume and speed controls work
- [x] Floating player appears/disappears correctly
- [x] Button disabled during scene generation
- [x] Signed URLs regenerate on-demand
- [x] Text chunking for long scenes (4997+ characters)
- [x] GCS integration with uniform bucket-level access

### 🚧 Remaining Tests

- [ ] Generate audio for subsequent scenes (should use saved voice)
- [ ] Verify voice cannot be changed after first generation
- [ ] Admin: Delete audio and verify GCS cleanup
- [ ] Navigate between scenes (audio persistence)
- [ ] Error handling: Invalid scene, generation failure
- [ ] Storage: Verify 90-day cleanup job
- [ ] Multiple voice providers
- [ ] User settings integration

## Production Deployment Checklist

1. **Environment Setup**
   - [ ] Configure GCS bucket
   - [ ] Create service account with Storage Admin role
   - [ ] Add service account JSON to environment
   - [ ] Set TTS_PROVIDER environment variable
   - [ ] Verify OpenAI API key is configured

2. **Database Migration**
   - [ ] Run `pnpm db:migrate` on production
   - [ ] Verify migration succeeded
   - [ ] Run `pnpm db:codegen` to update types

3. **GCS Configuration**
   - [ ] Enable uniform bucket-level access
   - [ ] Set appropriate CORS policy
   - [ ] Configure lifecycle rules for 90-day deletion

4. **Monitoring**
   - [ ] Set up logging for audio generation
   - [ ] Monitor GCS storage costs
   - [ ] Track TTS API usage
   - [ ] Monitor signed URL regeneration frequency

5. **Cost Controls**
   - [ ] Set budget alerts for GCS
   - [ ] Set budget alerts for OpenAI TTS
   - [ ] Monitor average audio file sizes
   - [ ] Review cleanup job effectiveness

## Architecture Decisions

### Why Signed URLs?

- **Security**: Time-limited access without public bucket
- **Flexibility**: Works with uniform bucket-level access
- **Compatibility**: No bucket policy changes needed
- **Cost-effective**: Regeneration is lightweight

### Why Text Chunking?

- **Provider Limits**: OpenAI has 4096 character limit
- **User Experience**: No manual scene splitting required
- **Quality**: Sentence-aware splitting maintains natural flow
- **Scalability**: Handles scenes of any length

### Why GCS Paths in Database?

- **Permanent Storage**: GCS paths never expire
- **URL Regeneration**: Fresh signed URLs on every request
- **Flexibility**: Can change URL strategy without migration
- **Reliability**: No broken links from expired URLs

## Performance Considerations

- **Caching**: 5-minute TTL for TTS config reduces DB queries
- **React Query**: 5-minute stale time for audio metadata
- **Signed URLs**: 7-day expiry balances security and performance
- **Text Chunking**: Sequential generation to avoid rate limits
- **MP3 Concatenation**: Direct buffer concatenation (no re-encoding)

## Security Considerations

- **Authentication**: All API endpoints require valid session
- **Authorization**: Story ownership verified before access
- **Admin-only Deletion**: Role check for DELETE operations
- **Signed URLs**: Time-limited access to GCS files
- **Input Validation**: Scene number and text validation
- **Rate Limiting**: Consider adding for audio generation

## Cost Estimation

**Per Scene (assuming ~2000 characters):**

- OpenAI TTS: ~$0.03
- GCS Storage: ~$0.00002/month
- GCS Egress: ~$0.001 per playback

**Monthly for 1000 scenes:**

- Generation: ~$30
- Storage: ~$0.02
- Egress (avg 10 plays/scene): ~$10
- **Total: ~$40/month**

## Notes

- Audio files stored indefinitely (until 90-day cleanup)
- Signed URLs expire after 7 days (regenerated on-demand)
- Users cannot regenerate audio (cost control)
- Voice locked to story after first generation (consistency)
- MP3 format chosen for universal browser support
- Chunking happens transparently (no user awareness needed)
