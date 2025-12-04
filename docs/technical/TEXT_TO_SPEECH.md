# Text-to-Speech (TTS) System

**Last Updated**: 2025-12-04 | **Status**: ✅ Production Ready

---

## Overview

The Text-to-Speech system enables users to listen to their stories with high-quality AI-generated audio narration. The system supports multiple TTS providers, stores audio files in Google Cloud Storage, and provides a full-featured audio player with playback controls.

---

## Features

### Core Capabilities

- **Multi-Provider Support**: OpenAI TTS, Google Cloud TTS (Journey/Gemini voices)
- **Audio Storage**: Google Cloud Storage with 90-day lifecycle policy
- **Smart Caching**: Audio files cached indefinitely until cleanup
- **Signed URLs**: Time-limited access (7 days) with on-demand regeneration
- **Intelligent Chunking**: Automatic text splitting for long scenes
- **Voice Consistency**: Voice locked to story after first generation

### User Experience

- **Generation Button**: "Generate Audio" button in reading page header
- **Audio Player**: Floating player at bottom with full controls
  - Play/pause
  - Progress bar with seeking
  - Volume control
  - Playback speed (0.5x - 2x)
  - Time display
- **Audio Indicator**: Small green volume icon when audio exists
- **Generation State**: Button disabled during scene text generation

---

## Architecture

### Database Schema

#### scene_audio Table

Stores metadata and GCS paths for generated audio files:

```typescript
{
  id: uuid (primary key)
  story_id: uuid (foreign key → user_stories)
  scene_number: integer
  audio_url: text // GCS path (gs://bucket/path format)
  file_size: integer // bytes
  duration: decimal // seconds
  tts_provider: varchar(50)
  voice_id: varchar(255)
  voice_name: varchar(255)
  generated_at: timestamp
  created_at: timestamp
  // Unique constraint: (story_id, scene_number)
}
```

#### Story TTS Settings

Added to `user_stories` table:

```typescript
{
  tts_provider: varchar(50) // nullable
  tts_voice_id: varchar(255) // nullable
  tts_voice_name: varchar(255) // nullable
}
```

#### User TTS Defaults

Added to `users` table:

```typescript
{
  default_tts_provider: varchar(50) // nullable
  default_tts_voice_id: varchar(255) // nullable
  default_tts_voice_name: varchar(255) // nullable
}
```

#### App Settings

TTS configuration stored in `app_settings`:

```typescript
category: 'tts'
- tts.provider → 'openai'
- tts.gcs_bucket_name → ''
- tts.gcs_bucket_path → 'audio/'
```

### Backend Components

#### Configuration (`src/lib/tts/config.ts`)

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
```

**Features**:
- In-memory cache with 5-minute TTL
- Falls back: DB → environment variables
- Story-specific configuration support
- Cache invalidation API

#### TTS Client (`src/lib/tts/client.ts`)

Provider abstraction with intelligent chunking:

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
}>
```

**Supported Providers**:
- **OpenAI**: `tts-1-hd` model with 4096 char chunking
- **Google Cloud TTS**: Journey voices or Gemini models with byte-aware chunking (3800 bytes for Gemini Lite)

**Text Chunking**:
- Automatically splits text over provider limits
- Splits at sentence boundaries for natural flow
- Falls back to word boundaries for long sentences
- Concatenates MP3 chunks seamlessly
- Handles unlimited scene length

#### Storage Management (`src/lib/tts/storage.ts`)

Google Cloud Storage integration:

```typescript
export async function uploadAudioToGCS(options: {
  audioBuffer: Buffer;
  storyId: string;
  sceneNumber: number;
  provider: string;
  voiceId: string;
}): Promise<string>
```

**Features**:
- Uploads to GCS with structured path: `{storyId}/scene-{number}-{hash}.mp3`
- Returns GCS path (`gs://bucket/path`) for database storage
- Generates signed URLs with 7-day expiry
- Deletes audio files from GCS
- Background cleanup job for 90-day retention

**Signed URL Management**:
- Database stores permanent GCS paths
- Signed URLs generated on-demand
- Works with uniform bucket-level access
- Users always get fresh, valid URLs

#### Voice Management (`src/lib/tts/voices.ts`)

```typescript
export async function getAvailableVoices(
  provider: TTSProvider
): Promise<Voice[]>
```

**Static Voice Lists**:
- OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
- Google Journey voices: Puck, Charon, Kore, Fenrir, Aoede, etc.

---

## API Endpoints

### GET /api/stories/:id/scene/:number/audio

Check if audio exists or generate new audio for a scene.

**Flow**:
1. Authenticate user
2. Verify story ownership
3. Check if audio exists in database
4. If exists: Generate fresh signed URL and return metadata
5. If not:
   - Determine voice (story → user → default)
   - Fetch scene content
   - Generate audio via TTS client (with chunking)
   - Upload to GCS (returns GCS path)
   - Save metadata to database
   - Update story TTS settings (first generation)
   - Generate signed URL and return

**Response**:
```typescript
{
  exists: boolean;
  audioUrl: string; // Fresh signed URL
  fileSize: number;
  duration: number;
  provider: string;
  voice: { id: string; name: string };
}
```

### DELETE /api/stories/:id/scene/:number/audio

Remove audio (admin only).

**Flow**:
1. Authenticate user (admin role required)
2. Delete from GCS
3. Delete from database

### GET /api/tts/voices

List available voices.

**Query Params**: `provider` (optional)

**Response**:
```typescript
{
  [provider: string]: Voice[]
}
```

---

## Frontend Components

### AudioPlayer (`src/components/AudioPlayer.tsx`)

Floating audio player with full controls:

**Features**:
- Play/pause button
- Progress bar with seek capability
- Current time / total duration display
- Volume slider
- Playback speed selector (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- Close button
- Dark mode support
- Responsive design

### AudioGenerationButton (`src/components/AudioGenerationButton.tsx`)

Button to trigger audio generation:

**States**:
- Loading: Shows spinner during audio generation
- Disabled: While scene text is still streaming
- Hidden: When audio already exists

**Features**:
- Notifies parent via callback when audio is ready
- Shows "Scene generating..." when scene is incomplete

### AudioIndicator (`src/components/AudioIndicator.tsx`)

Visual indicator when audio exists:

**Features**:
- Small green volume icon
- Tooltip on hover
- Accessibility labels

### React Hooks

#### useAudioGeneration (`src/hooks/useAudioGeneration.ts`)

React Query hook for checking/generating audio:

```typescript
const { data, isLoading, mutate } = useAudioGeneration(storyId, sceneNumber);
```

**Features**:
- 5-minute stale time for caching
- Mutation for triggering generation
- Automatic refetch on success

#### useAudioPlayer (`src/hooks/useAudioPlayer.ts`)

HTML5 Audio element management:

```typescript
const {
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackRate,
  play,
  pause,
  seek,
  setVolume,
  setPlaybackRate
} = useAudioPlayer(audioUrl);
```

**Features**:
- Auto-cleanup on unmount
- Error handling
- Loading state management

---

## Reading Page Integration

The reading page (`src/routes/story/$id.read.tsx`) integrates all audio components:

**Header**:
- Audio indicator (when audio exists)
- Audio generation button (when no audio)

**Content Area**:
- Scene text and choices
- Generation button disabled during streaming

**Footer**:
- Floating audio player (only visible after generation)
- Proper z-index and margin for footer

**State Management**:
- Tracks audio player state
- Passes scene generation state to disable button
- Shows/hides components based on audio availability

---

## Configuration

### Environment Variables

```bash
# TTS Configuration
TTS_PROVIDER=openai  # openai | google | elevenlabs | azure

# Google Cloud Storage
GCS_BUCKET_NAME=your-bucket-name
GCS_BUCKET_PATH=audio/
GCS_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Google TTS (optional, falls back to GCS_SERVICE_ACCOUNT_JSON)
GOOGLE_TTS_ACCOUNT_JSON={"type":"service_account",...}

# Provider API Keys (managed via Admin Settings > API Keys)
# OpenAI API key reused from AI config
ELEVENLABS_API_KEY=...
AZURE_TTS_KEY=...
AZURE_TTS_REGION=eastus
```

### Package Dependencies

```json
{
  "@google-cloud/storage": "^7.17.3",
  "@google-cloud/text-to-speech": "^6.4.0",
  "openai": "^6.9.1"
}
```

---

## Provider Details

### OpenAI TTS

**Model**: `tts-1-hd`

**Voices**: alloy, echo, fable, onyx, nova, shimmer

**Features**:
- High-quality neural voices
- Automatic text chunking (4096 chars)
- MP3 output format
- Fast generation

**Chunk Size**: 4096 characters with sentence-aware splitting

### Google Cloud TTS

**Models**:
- Journey voices (e.g., `en-US-Journey-F`)
- Gemini models (e.g., `gemini-2.5-flash-lite-preview-tts`)

**Voices**: Puck, Charon, Kore, Fenrir, Aoede, Achernar, Zephyr, Orus, etc.

**Features**:
- Named voices with distinct personalities
- Native MP3 support
- Configurable audio settings:
  - Speaking rate: 0.25 to 4.0 (default: 1.0)
  - Pitch: -20.0 to 20.0 (default: 0.0)
  - Volume gain: -96.0 to 16.0 dB (default: 0.0)

**Chunk Sizes**:
- Gemini Lite: 450 bytes (512 byte limit)
- Journey voices: 4500 bytes (5000 byte limit)

**Output Format**: MP3 with configurable settings

---

## Cost Estimation

**Per Scene** (assuming ~2000 characters):

- OpenAI TTS: ~$0.03
- GCS Storage: ~$0.00002/month
- GCS Egress: ~$0.001 per playback

**Monthly for 1000 scenes**:

- Generation: ~$30
- Storage: ~$0.02
- Egress (avg 10 plays/scene): ~$10
- **Total: ~$40/month**

---

## Performance Considerations

- **Caching**: 5-minute TTL for TTS config reduces DB queries
- **React Query**: 5-minute stale time for audio metadata
- **Signed URLs**: 7-day expiry balances security and performance
- **Text Chunking**: Sequential generation to avoid rate limits
- **MP3 Concatenation**: Direct buffer concatenation (no re-encoding)

---

## Security

- **Authentication**: All API endpoints require valid session
- **Authorization**: Story ownership verified before access
- **Admin-only Deletion**: Role check for DELETE operations
- **Signed URLs**: Time-limited access to GCS files
- **Input Validation**: Scene number and text validation

**Recommendations**:
- Consider adding rate limiting for audio generation
- Monitor API usage and costs
- Set up alerts for unusual activity

---

## Storage Management

### Lifecycle Policy

Audio files are automatically deleted after 90 days:

**GCS Lifecycle Rule**:
```json
{
  "action": { "type": "Delete" },
  "condition": { "age": 90 }
}
```

### Manual Cleanup

Delete old audit logs (can be adapted for audio):

```bash
pnpm cleanup:audit-logs [days]  # Default 90 days
```

### Background Jobs

Planned features:
- Scheduled 90-day cleanup job
- Orphaned file detection and cleanup
- Signed URL refresh job (optional)

---

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

---

## Deployment Checklist

### Environment Setup

- [ ] Configure GCS bucket
- [ ] Create service account with Storage Admin role
- [ ] Add service account JSON to environment
- [ ] Set TTS_PROVIDER environment variable
- [ ] Verify OpenAI API key is configured (via Admin Settings)

### Database Migration

- [ ] Run `pnpm db:migrate` on production
- [ ] Verify migration succeeded
- [ ] Run `pnpm db:codegen` to update types

### GCS Configuration

- [ ] Enable uniform bucket-level access
- [ ] Set appropriate CORS policy
- [ ] Configure lifecycle rules for 90-day deletion

### Monitoring

- [ ] Set up logging for audio generation
- [ ] Monitor GCS storage costs
- [ ] Track TTS API usage
- [ ] Monitor signed URL regeneration frequency

### Cost Controls

- [ ] Set budget alerts for GCS
- [ ] Set budget alerts for OpenAI TTS
- [ ] Monitor average audio file sizes
- [ ] Review cleanup job effectiveness

---

## User Flow

### First Time Generation

1. User navigates to reading page
2. Sees "Generate Audio" button in header
3. Clicks button
4. Audio generation starts (shows loading state)
5. Text is chunked and sent to TTS provider
6. Audio chunks are concatenated
7. Complete audio uploaded to GCS
8. Metadata saved to database with GCS path
9. Story TTS settings updated (voice locked)
10. Signed URL generated and returned
11. Audio player appears with playback controls

### Subsequent Playback

1. User returns to scene with audio
2. Audio indicator shows in header
3. Audio player loads automatically
4. Fresh signed URL generated on-demand
5. User can play immediately (no generation needed)

### Exploring Different Scenes

1. User navigates between scenes
2. Generation button appears for scenes without audio
3. Audio player persists for scenes with audio
4. Each scene can have independent audio

---

## Troubleshooting

### "TTS Provider API key not configured"

**Problem**: No valid API key for selected TTS provider.

**Solution**:
1. Navigate to Admin Settings > API Keys
2. Configure the TTS provider's API key
3. Test the key
4. Try generating audio again

### "Failed to generate audio"

**Problem**: TTS generation failed.

**Solution**:
1. Check provider API status
2. Verify API key is valid and has quota
3. Check scene content for special characters
4. Review error logs for specific error message

### "Failed to upload to GCS"

**Problem**: GCS upload failed.

**Solution**:
1. Verify GCS_BUCKET_NAME is correct
2. Check service account has Storage Admin permissions
3. Verify GCS_SERVICE_ACCOUNT_JSON is valid
4. Check GCS bucket exists and is accessible

### Signed URL Expired

**Problem**: Audio URL returns 403 Forbidden.

**Solution**:
- Refresh the page (new signed URL generated automatically)
- URLs expire after 7 days but regenerate on demand

---

## Future Enhancements

### Additional Providers

- [ ] ElevenLabs API integration
- [ ] Azure Cognitive Services implementation

### Admin Features

- [ ] Cost monitoring dashboard
- [ ] Bulk audio deletion
- [ ] Provider usage statistics

### User Features

- [ ] "Clear all my audio" button in settings
- [ ] Voice selection interface
- [ ] Audio playback history

### Optimization

- [ ] Streaming audio generation (chunk-based)
- [ ] Progressive audio loading
- [ ] Audio preloading for next scene

---

## Support

For issues or questions:

1. Check this documentation
2. Review error logs for generation failures
3. Verify GCS bucket configuration
4. Test API keys individually
5. Check provider status pages

---

## Related Documentation

- [AI Providers](../configuration/AI_PROVIDERS.md) - AI provider configuration (OpenAI, Google, etc.)
- [Admin Dashboard](ADMIN.md) - Admin features and role-based access control
- [API Key Management](../api-key-management.md) - Secure API key storage and management
- [Implementation Progress](../development/PROGRESS.md) - Full project progress including TTS implementation
