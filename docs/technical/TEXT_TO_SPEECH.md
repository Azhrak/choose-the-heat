# Text-to-Speech (TTS) System

**Last Updated**: 2025-12-08 | **Status**: ✅ Production Ready (Non-Streaming)

---

## Overview

The Text-to-Speech system enables users to listen to their stories with high-quality AI-generated audio narration. The system supports multiple TTS providers, stores audio files in Google Cloud Storage, and provides a full-featured audio player with playback controls.

### Current Production Status

**Active Features** ✅:

- Non-streaming audio generation with progress feedback
- Multi-provider support (OpenAI, Google Cloud TTS)
- Google Cloud Storage with 90-day lifecycle
- Signed URLs with 7-day expiry
- Full-featured audio player with controls
- Intelligent text chunking for long scenes
- Voice consistency per story

**Experimental Features** ⚠️:

- Streaming audio playback (MediaSource API) - Complete but disabled
- See [Streaming TTS](#streaming-tts) and [Future Enhancements](#streaming-audio-playback-re-enable-and-stabilize) for details

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

## Streaming TTS

**Added**: 2025-12-07 | **Status**: ⚠️ Implemented but Disabled (Feature Flag Ready)

The TTS system has a complete streaming implementation that delivers audio chunks progressively, but it's currently disabled in production due to client-side stability issues with MediaSource API.

### Current Production Behavior

- **Non-Streaming Mode**: Full audio generation before playback (stable)
- **Progress Feedback**: Real-time progress percentage during generation
- **GCS Persistence**: All generated audio saved to Google Cloud Storage
- **Fallback Support**: Streaming endpoint falls back to blob URL if MediaSource fails

### Streaming Features (Implemented)

- **Progressive Delivery**: Audio chunks streamed as generated
- **Lower Latency**: Faster time-to-first-byte
- **Better UX**: Start playback before complete generation
- **Multiple Formats**: Supports both MP3 (OpenAI) and PCM (Google Gemini)
- **Provider Support**: OpenAI and Google Gemini
- **Background Persistence**: Streams to client while saving to GCS in parallel

### Implementation Status

**What's Complete**:

- ✅ Server-side streaming endpoints (`audio-stream.ts`)
- ✅ NDJSON protocol with proper line buffering
- ✅ Client-side streaming hook (`useStreamingAudioPlayer.ts`)
- ✅ MediaSource Extensions API integration
- ✅ Streaming UI component (`StreamingAudioPlayer.tsx`)
- ✅ Progress tracking and chunk counting
- ✅ Auto-play after buffering 2 seconds
- ✅ Fallback to blob URL when MediaSource unsupported
- ✅ Background GCS upload during streaming
- ✅ Voice name tracking and metadata persistence

**Known Issues** (Why It's Disabled):

- ⚠️ React effect infinite loop with MediaSource cleanup
- ⚠️ AbortController timing issues causing re-mounts
- ⚠️ Browser compatibility varies for MediaSource with MP3
- ⚠️ PCM format requires additional client-side processing

**Files Preserved for Future**:

- `src/hooks/useStreamingAudioPlayer.ts` - MediaSource playback hook
- `src/components/StreamingAudioPlayer.tsx` - Streaming player UI
- `src/routes/api/stories/$id/scene/$number/audio-stream.ts` - Streaming endpoint

### Streaming API Endpoint

#### GET /api/stories/:id/scene/:number/audio-stream

Stream audio generation with progressive chunk delivery.

**Response Format**: NDJSON (Newline-Delimited JSON)

**First Chunk (Metadata)**:

```json
{
  "type": "metadata",
  "metadata": {
    "estimatedDuration": 45.5,
    "format": "mp3",  // or "pcm"
    "totalChunks": 3,
    "provider": "openai",
    "audioFormat": "mp3",
    // For PCM audio only:
    "pcmSpecs": {
      "sampleRate": 24000,
      "bitDepth": 16,
      "channels": 1
    }
  }
}
```

**Audio Chunks**:

```json
{
  "type": "audio",
  "index": 0,
  "isLast": false,
  "data": "base64-encoded-audio-data",
  "format": "mp3"
}
```

### Audio Formats

#### MP3 (OpenAI)

- **Ready for Playback**: Direct browser support
- **Compressed**: Smaller file sizes
- **Streaming**: Compatible with Media Source Extensions
- **Provider**: OpenAI TTS

#### PCM (Google Gemini)

- **Raw Audio**: 24000 Hz, 16-bit, mono
- **Uncompressed**: Larger file sizes
- **Processing Required**: Needs Web Audio API or conversion
- **Provider**: Google Gemini TTS
- **Format**: `audio/L16;codec=pcm;rate=24000`

### Client Implementation Example

```typescript
async function streamAudio(storyId: string, sceneNumber: number) {
  const response = await fetch(
    `/api/stories/${storyId}/scene/${sceneNumber}/audio-stream`
  );

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let metadata: any;
  const audioChunks: Buffer[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      const chunk = JSON.parse(line);

      if (chunk.type === 'metadata') {
        metadata = chunk.metadata;
        console.log(`Format: ${metadata.audioFormat}`);
        console.log(`Duration: ${metadata.estimatedDuration}s`);
      } else if (chunk.type === 'audio') {
        const audioData = atob(chunk.data);

        // Handle based on format
        if (metadata.audioFormat === 'mp3') {
          // Create blob and play
          const blob = new Blob([audioData], { type: 'audio/mp3' });
          audioElement.src = URL.createObjectURL(blob);
        } else if (metadata.audioFormat === 'pcm') {
          // Use Web Audio API
          const audioContext = new AudioContext();
          // Convert PCM to AudioBuffer...
        }

        if (chunk.isLast) {
          console.log('Streaming complete');
        }
      }
    }
  }
}
```

### Backend Implementation

**Streaming Functions**:

- `generateSpeechOpenAIStream()` - MP3 streaming
- `generateSpeechGoogleStream()` - PCM streaming

**Async Generators**:

```typescript
async function* generateAudioChunks() {
  for (let i = 0; i < chunks.length; i++) {
    const audioBuffer = await generateChunk(chunks[i]);
    yield {
      chunk: audioBuffer,
      index: i,
      isLast: i === chunks.length - 1
    };
  }
}
```

---

## API Endpoints

### Production Endpoints (Currently Active)

#### GET /api/stories/:id/scene/:number/audio

**Status**: ✅ Active in Production

Check if audio exists or generate new audio for a scene. This is the stable, non-streaming endpoint currently used by the application.

**Query Parameters**:

- `generate=true` - Trigger audio generation if not exists

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

#### DELETE /api/stories/:id/scene/:number/audio

**Status**: ✅ Active in Production

Remove audio (admin only).

**Flow**:

1. Authenticate user (admin role required)
2. Delete from GCS
3. Delete from database

### Experimental Endpoints (Implemented but Not Active)

#### GET /api/stories/:id/scene/:number/audio-stream

**Status**: ⚠️ Implemented but Disabled

Streaming endpoint that delivers audio chunks progressively using NDJSON protocol. Complete implementation exists but is not used in production due to client-side stability issues with MediaSource API.

See [Streaming TTS](#streaming-tts) section for full details.

### Other Endpoints

#### GET /api/tts/voices

**Status**: ✅ Active in Production

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

### Active Production Components

#### AudioPlayer (`src/components/AudioPlayer.tsx`)

**Status**: ✅ Active in Production

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

#### AudioGenerationButton (`src/components/AudioGenerationButton.tsx`)

**Status**: ✅ Active in Production

Button to trigger audio generation:

**States**:

- Loading: Shows spinner and progress percentage during audio generation
- Disabled: While scene text is still streaming
- Hidden: When audio already exists

**Features**:

- Notifies parent via callback when audio is ready
- Shows "Scene generating..." when scene is incomplete
- Displays streaming progress percentage (e.g., "Streaming... 45%")

#### AudioIndicator (`src/components/AudioIndicator.tsx`)

**Status**: ✅ Active in Production

Visual indicator when audio exists:

**Features**:

- Small green volume icon
- Tooltip on hover
- Accessibility labels

### Experimental Components (Not Active)

#### StreamingAudioPlayer (`src/components/StreamingAudioPlayer.tsx`)

**Status**: ⚠️ Implemented but Disabled

Complete streaming audio player using MediaSource Extensions API. Features include:

- Real-time streaming with progressive chunk loading
- MediaSource API integration with SourceBuffer management
- Auto-play after buffering 2 seconds of audio
- Full playback controls (play/pause, seek, volume, speed)
- Progress tracking with streaming percentage
- Automatic fallback to blob URL if MediaSource unsupported
- Support for both MP3 (OpenAI) and PCM (Google) formats

**Why Disabled**: React effect infinite loop issues and AbortController timing problems. See [Future Enhancements](#streaming-audio-playback-re-enable-and-stabilize) for re-enabling plan.

### React Hooks

#### useAudioGeneration (`src/hooks/useAudioGeneration.ts`)

**Status**: ✅ Active in Production

React Query hook for checking/generating audio:

```typescript
const { data, isLoading, mutate } = useAudioGeneration(storyId, sceneNumber);
```

**Features**:

- 5-minute stale time for caching
- Mutation for triggering generation with progress callbacks
- Automatic refetch on success
- NDJSON streaming protocol with line buffering
- Fallback to non-streaming generation if streaming fails

**Progress Tracking**:

```typescript
generate({
  onProgress: (percentage) => console.log(`${percentage}%`)
});
```

#### useAudioPlayer (`src/hooks/useAudioPlayer.ts`)

**Status**: ✅ Active in Production

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

#### useStreamingAudioPlayer (`src/hooks/useStreamingAudioPlayer.ts`)

**Status**: ⚠️ Implemented but Disabled

Advanced hook for MediaSource-based streaming audio playback:

```typescript
const {
  isPlaying,
  currentTime,
  duration,
  isReady,
  initializeMediaSource,
  addChunk,
  finalize,
  reset,
  play,
  pause,
  seek,
  setVolume,
  setPlaybackRate
} = useStreamingAudioPlayer({
  onPlaybackStart: () => console.log('Started'),
  onPlaybackEnd: () => console.log('Ended'),
});
```

**Features**:

- MediaSource Extensions API integration
- SourceBuffer management with chunk queueing
- Auto-play when 2 seconds buffered
- Graceful fallback when MediaSource unsupported
- Complete playback control surface
- MIME type detection and validation

**Why Disabled**: Infinite loop issues with React effects and cleanup. Needs refactoring of effect dependencies and AbortController lifecycle.

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

## Admin Testing Interface

**Location**: `/admin/test` | **Status**: ✅ Active in Production

The admin panel includes a comprehensive testing interface for validating AI text generation and TTS audio generation without affecting app settings or user stories.

### Features

#### Text Generation Testing

- **Multi-Provider Support**: Test OpenAI, Google, Anthropic, Mistral, xAI, OpenRouter
- **Model Selection**: Choose any available model per provider
- **Custom Prompts**: Enter custom prompts or use pre-built romance scene generator
- **Real-time Results**: See generated text immediately
- **Auto-population**: Generated text automatically populates TTS input

#### TTS Audio Testing

- **Multi-Provider Support**: Test OpenAI, Google, ElevenLabs, Azure
- **Voice Selection**: Choose from available voices per provider
- **Model Configuration**: Test different TTS models
- **Integrated Player**: Built-in audio player for immediate playback
- **GCS Upload**: Audio uploaded to GCS with "test" prefix for cleanup

### Interface Layout

**Current Settings Display**:

- Shows active AI configuration (provider, model, temperature, max tokens, timeout)
- Shows active TTS configuration (provider, model)
- Reference only - test changes don't affect these settings

**Text Generation Section**:

- Provider selector (OpenAI, Google, Anthropic, Mistral, xAI, OpenRouter)
- Model selector (dynamically populated per provider)
- Prompt textarea
- "Generate Text" button
- "Random Romance Sample" button (pre-built prompt)
- Error display for failed generations
- Output display with formatted text

**TTS Generation Section**:

- Provider selector (OpenAI, Google, ElevenLabs, Azure)
- Model selector (dynamically populated per provider)
- Voice selector with friendly names
- Text input textarea (auto-populated from text generation)
- "Generate Audio" button
- Error display for failed generations
- Audio player for playback

### API Endpoints

#### POST /api/admin/test/generate-audio

**Status**: ✅ Active in Production

**Authorization**: Admin only (enforced via `requireAdmin` middleware)

**Request Body**:

```typescript
{
  text: string;          // Text to convert
  provider: TTSProvider; // openai | google | elevenlabs | azure
  model: string;         // Model name
  voiceId: string;       // Voice identifier
}
```

**Response**:

```typescript
{
  audioUrl: string;   // Signed GCS URL
  duration: number;   // Audio duration in seconds
  fileSize: number;   // Buffer size in bytes
  provider: string;   // Echo provider used
  model: string;      // Echo model used
  voiceId: string;    // Echo voice used
}
```

**Process Flow**:

1. Validate admin authorization
2. Parse and validate request body
3. Generate speech using TTS client
4. Upload to GCS with "test" story ID prefix
5. Generate 7-day signed URL
6. Return audio URL and metadata

#### POST /api/admin/test/generate-text

**Status**: ✅ Active in Production

**Authorization**: Admin only

Generate text using AI providers for testing purposes.

### Voice Options by Provider

**OpenAI**:

- Alloy, Echo, Fable, Onyx, Nova, Shimmer

**Google**:

- Enceladus (Male), Puck (Male), Charon (Male), Kore (Female), Fenrir (Male), Aoede (Female)

**ElevenLabs**:

- Rachel, Domi

**Azure**:

- Jenny (Female), Guy (Male), Aria (Female)

### React Hooks

#### useTestAudioGenerationMutation (`src/hooks/useTestAudioGenerationMutation.ts`)

React Query mutation for admin audio testing:

```typescript
const ttsGenerationMutation = useTestAudioGenerationMutation();

ttsGenerationMutation.mutate(
  {
    text: "Test audio",
    provider: "openai",
    model: "tts-1-hd",
    voiceId: "alloy"
  },
  {
    onSuccess: (audioUrl) => console.log("Audio ready:", audioUrl)
  }
);
```

#### useTestTextGenerationMutation (`src/hooks/useTestTextGenerationMutation.ts`)

React Query mutation for admin text testing.

### Usage Notes

- Test audio files stored with "test" prefix for easy cleanup
- Changes don't affect app settings or user data
- Requires admin role to access
- Real API calls incur costs (monitor usage)
- Audio files uploaded to GCS (count toward storage quota)
- Audio files follow same 90-day lifecycle as production audio

### Cleanup Recommendations

Test audio files should be cleaned up periodically:

```bash
# List test audio files
gsutil ls gs://your-bucket/audio/test/

# Delete test audio files older than 7 days
gsutil -m rm gs://your-bucket/audio/test/**
```

Consider adding automated cleanup for test files:

- Scheduled job to delete test prefix files after 7 days
- Manual "Clear Test Audio" button in admin panel

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

# Google Cloud TTS (non-streaming, MP3 output)
# Optional, falls back to GCS_SERVICE_ACCOUNT_JSON
GOOGLE_TTS_ACCOUNT_JSON={"type":"service_account",...}

# Google Gemini TTS (streaming, PCM output)
# Required for streaming TTS with Google provider
GOOGLE_TTS_API_KEY=your-google-api-key

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
  "@google/genai": "^1.31.0",
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

- Scheduled 90-day cleanup job for production audio
- Scheduled 7-day cleanup job for test audio (with "test" prefix)
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
- [ ] "Clear Test Audio" button in admin panel
- [ ] Test audio usage statistics and cleanup scheduling

### User Features

- [ ] "Clear all my audio" button in settings
- [ ] Voice selection interface
- [ ] Audio playback history

### Streaming Audio Playback (Re-enable and Stabilize)

**Status**: Complete implementation exists but disabled due to client-side issues

**What's Done**:

- ✅ Full MediaSource Extensions API integration
- ✅ Streaming server endpoint with NDJSON protocol
- ✅ Line buffering to handle stream chunk boundaries
- ✅ Progress tracking and auto-play after buffering
- ✅ Fallback to blob URL when MediaSource unsupported
- ✅ Complete UI component with playback controls

**What's Needed**:

- [ ] Fix React effect infinite loop with MediaSource cleanup
- [ ] Resolve AbortController timing issues
- [ ] Test and fix browser compatibility (especially Safari)
- [ ] Add PCM to MP3 client-side conversion for Google streaming
- [ ] Implement feature flag system
- [ ] Add comprehensive error recovery
- [ ] Test with various network conditions (slow connections, interruptions)
- [ ] Performance testing with concurrent streams

**Files to Reference**:

- [src/hooks/useStreamingAudioPlayer.ts](../../src/hooks/useStreamingAudioPlayer.ts) - Complete MediaSource playback hook
- [src/components/StreamingAudioPlayer.tsx](../../src/components/StreamingAudioPlayer.tsx) - Full streaming UI with controls
- [src/routes/api/stories/$id/scene/$number/audio-stream.ts](../../src/routes/api/stories/$id/scene/$number/audio-stream.ts) - Working streaming endpoint

**Benefits When Fixed**:

- Start playback within 2 seconds instead of waiting for full generation
- Better UX for long scenes (5+ minutes of audio)
- Lower perceived latency
- Spotify-like streaming experience

### Other Optimizations

- [ ] Audio preloading for next scene
- [ ] Service worker caching for frequently played scenes
- [ ] Adaptive bitrate based on connection speed

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
