# Dynamic AI Model Management Implementation Plan

## Overview

Transform the current hardcoded model system into a dynamic, database-driven model management system. This will enable automatic discovery of new models from provider APIs and provide admin controls for model approval, deprecation, and fallback handling.

## User Requirements Summary

- **Manual refresh**: Admin clicks button to fetch models from APIs (not automatic)
- **Manual approval**: New models appear as "available but not enabled" requiring explicit enable
- **Fallback to provider default**: Deprecated models fall back to that provider's default model
- **Global settings only**: No per-model configuration (keep temperature/tokens global)
- **Text and voice separation**: All features work separately for text generation and TTS

---

## Phase 1: Database Schema

### 1.1 Create `ai_models` Table

**File**: `src/lib/db/migrations/018_add_ai_models_table.ts`

Create a new table to track all models with lifecycle management:

```sql
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core identification
  provider VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('text', 'tts')),
  model_id VARCHAR(255) NOT NULL,

  -- Model metadata
  display_name VARCHAR(255),
  description TEXT,
  context_window INTEGER,
  supports_streaming BOOLEAN DEFAULT true,

  -- Lifecycle management
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'enabled', 'disabled', 'deprecated')),

  discovered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  enabled_at TIMESTAMP,
  deprecated_at TIMESTAMP,

  -- Provider metadata (raw API response)
  provider_metadata JSONB,

  -- Admin notes
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES users(id),

  UNIQUE(provider, category, model_id)
);

CREATE INDEX idx_ai_models_provider_category ON ai_models(provider, category);
CREATE INDEX idx_ai_models_status ON ai_models(status);
```

**Status lifecycle**:
- `pending`: Discovered from API, awaiting admin approval
- `enabled`: Admin approved, available for selection
- `disabled`: Admin explicitly disabled (can re-enable)
- `deprecated`: Provider no longer offers, falls back to default

### 1.2 Seed Migration

**File**: `src/lib/db/migrations/019_seed_existing_models.ts`

Seed the table with existing hardcoded models from `providers.ts` as "enabled" status to maintain backward compatibility.

---

## Phase 2: Model Discovery Service

### 2.1 Model Discovery Core

**File**: `src/lib/ai/modelDiscovery.ts`

Create service to fetch available models from provider APIs:

```typescript
interface ModelDiscoveryResult {
  provider: string;
  category: 'text' | 'tts';
  discovered: ModelInfo[];
  newModels: ModelInfo[];
  errors?: string[];
}

interface ModelInfo {
  model_id: string;
  display_name?: string;
  description?: string;
  context_window?: number;
  supports_streaming?: boolean;
  provider_metadata?: any;
}

async function discoverModelsForProvider(
  provider: string,
  category: 'text' | 'tts'
): Promise<ModelDiscoveryResult>
```

### 2.2 Provider-Specific Implementations

**Text Generation Providers**:

- **OpenAI**: Use `openai.models.list()` API - full listing support
- **Google Gemini**: Use `genAI.listModels()` from `@google/generative-ai` SDK
- **Anthropic**: Fallback to curated list (no listing API) - verify via test request
- **Mistral**: Use Mistral SDK's list models endpoint
- **xAI**: Try OpenAI-compatible `/v1/models` endpoint
- **OpenRouter**: Use `GET https://openrouter.ai/api/v1/models` - comprehensive metadata

**TTS Providers**:

- **OpenAI TTS**: List from known models (tts-1, tts-1-hd)
- **Google TTS**: Use voices API from Gemini SDK
- **ElevenLabs**: Use `GET /v1/voices` endpoint
- **Azure TTS**: Use REST API to list available voices

### 2.3 Database Operations

**File**: `src/lib/db/queries/aiModels.ts`

Create query layer for model CRUD operations:

```typescript
// Core CRUD
async function listModels(filters: ModelFilters): Promise<AIModel[]>
async function getModelById(id: string): Promise<AIModel | null>
async function updateModelStatus(id: string, status: ModelStatus): Promise<AIModel>
async function bulkUpdateModels(ids: string[], updates: Partial<AIModel>): Promise<number>

// Discovery operations
async function upsertDiscoveredModel(data: DiscoveredModelData): Promise<AIModel>
async function getModelByProviderId(provider: string, category: string, modelId: string): Promise<AIModel | null>

// Provider operations
async function getEnabledModelsForProvider(provider: string, category: string): Promise<AIModel[]>
async function getDefaultModelForProvider(provider: string, category: string): Promise<AIModel | null>
```

---

## Phase 3: Backend API Endpoints

### 3.1 Model Discovery Endpoint

**File**: `src/routes/api/admin/models/discover.ts`

```typescript
POST /api/admin/models/discover
Body: {
  provider?: string;      // Optional: specific provider, or all if omitted
  category: 'text' | 'tts';
  force?: boolean;        // Force refresh even if recently synced
}

Response: {
  results: ModelDiscoveryResult[];
  totalNew: number;
  totalErrors: number;
}
```

**Logic**:
1. Rate limiting check (don't spam provider APIs - track last sync time)
2. Fetch models from provider API(s)
3. Compare with database (`ai_models` table)
4. Insert new models with `status='pending'`
5. Return summary of discovered/new models

### 3.2 Model Management Endpoints

**File**: `src/routes/api/admin/models/index.ts`

```typescript
// List all models with filtering
GET /api/admin/models?provider=openai&category=text&status=pending

// Get single model details
GET /api/admin/models/:id

// Update model (enable/disable/deprecate)
PATCH /api/admin/models/:id
Body: {
  status: 'enabled' | 'disabled' | 'deprecated';
  admin_notes?: string;
}

// Bulk update models (approve/reject multiple)
POST /api/admin/models/bulk-update
Body: {
  model_ids: string[];
  status: 'enabled' | 'disabled';
}
```

### 3.3 Default Model Management

**File**: `src/routes/api/admin/models/default.ts`

```typescript
POST /api/admin/models/set-default
Body: {
  provider: string;
  category: 'text' | 'tts';
  model_id: string;
}
```

Updates `app_settings` with key: `{category}.{provider}.default_model`

---

## Phase 4: Fallback & Validation Logic

### 4.1 Modify AI Client with Model Validation

**File**: `src/lib/ai/client.ts`

Update `getAIModel()` to check model status before use:

```typescript
async function getAIModel(modelOverride?: string, configOverride?: AIConfig) {
  const config = configOverride || await getAIConfig();
  const requestedModel = modelOverride || config.model;

  // Check if requested model is still enabled
  const modelRecord = await getModelByProviderId(
    config.provider,
    'text',
    requestedModel
  );

  if (!modelRecord || modelRecord.status === 'deprecated') {
    console.warn(`Model ${requestedModel} is deprecated, falling back`);

    // Get provider's default model from database
    const defaultModel = await getDefaultModelForProvider(config.provider, 'text');
    if (defaultModel) {
      return createProviderModel(config.provider, defaultModel.model_id);
    }

    // Ultimate fallback: hardcoded default from providers.ts
    const providerMeta = getProviderMetadata(config.provider);
    return createProviderModel(config.provider, providerMeta.defaultModel);
  }

  if (modelRecord.status !== 'enabled') {
    throw new Error(`Model ${requestedModel} is not enabled`);
  }

  return createProviderModel(config.provider, requestedModel);
}
```

### 4.2 Modify Story-Specific AI Config

**File**: `src/lib/ai/config.ts`

Update `getAIConfigForStory()` to handle deprecated models:

```typescript
export async function getAIConfigForStory(
  storyProvider?: string | null,
  storyModel?: string | null,
  storyTemperature?: string | number | null,
): Promise<AIConfig> {
  const currentConfig = await getAIConfig();

  if (!storyProvider || !storyModel) {
    return currentConfig;
  }

  // Check if story's model is still enabled in database
  const modelRecord = await getModelByProviderId(
    storyProvider,
    'text',
    storyModel
  );

  if (!modelRecord ||
      modelRecord.status === 'deprecated' ||
      modelRecord.status === 'disabled') {
    console.log(`Story model "${storyModel}" no longer available, using provider default`);

    // Fall back to provider's default model
    const defaultModel = await getDefaultModelForProvider(
      storyProvider as AIProvider,
      'text'
    );

    if (defaultModel) {
      return {
        ...currentConfig,
        provider: storyProvider as AIProvider,
        model: defaultModel.model_id,
      };
    }

    // Ultimate fallback: current app config
    return currentConfig;
  }

  // Use story's saved settings
  return {
    ...currentConfig,
    provider: storyProvider as AIProvider,
    model: storyModel,
    temperature: parseTemperature(storyTemperature),
  };
}
```

### 4.3 Mirror Changes for TTS

**File**: `src/lib/tts/client.ts` and `src/lib/tts/config.ts`

Apply the same model validation and fallback logic for TTS providers.

---

## Phase 5: Admin UI Components

### 5.1 Model Management Panel

**File**: `src/components/admin/ModelManagementPanel.tsx`

Create unified component for managing models:

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ Model Management                                     │
│ ┌──────────┬──────────┐                             │
│ │ Text Gen │ TTS      │  ← Category tabs            │
│ └──────────┴──────────┘                             │
│                                                      │
│ ┌─ Provider Selector ──────────────────────────┐    │
│ │ [OpenAI ▼] [Refresh Models]                  │    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ ┌─ Pending Models (3) ─────────────────────────┐    │
│ │ ☐ gpt-4.5-turbo       [Approve] [Reject]     │    │
│ │ ☐ gpt-4.5-preview     [Approve] [Reject]     │    │
│ │                       [Approve All Selected] │    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ ┌─ Enabled Models (4) ─────────────────────────┐    │
│ │ ○ gpt-4o              [Set Default] [Disable]│    │
│ │ ● gpt-4o-mini (default) [Disable]            │    │
│ │ ○ gpt-4-turbo         [Set Default] [Disable]│    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ ┌─ Deprecated Models (1) ──────────────────────┐    │
│ │ ⚠ gpt-3.5-turbo-0613   [Archive]             │    │
│ │   Falls back to: gpt-4o-mini                 │    │
│ └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Features**:
- Provider dropdown to filter models
- "Refresh Models" button triggers discovery API
- Three sections: Pending, Enabled, Deprecated
- Bulk approval/rejection for pending models
- Set default model per provider (radio button)
- Model cards show metadata (context window if available)

### 5.2 Integrate into Settings Page

**File**: `src/routes/admin/settings/index.tsx`

Modify the settings page to replace the current `AvailableModelsEditor` with the new `ModelManagementPanel`:

- Keep existing tabs: "Text Generation", "Prompt Configuration", "TTS", "API Keys"
- For "Text Generation" and "TTS" tabs, show the new `ModelManagementPanel` instead of the JSON editor
- Remove the old `ai.available_models` and `tts.available_models` settings fields (they'll be managed by the database)

### 5.3 Update Provider Status Component

**File**: `src/lib/ai/providerStatus.ts`

Update `getProviderStatus()` to query `ai_models` table instead of parsing JSON from `app_settings`:

```typescript
export async function getProviderStatus(
  providerId: string,
  category: "text" | "tts" = "text",
): Promise<ProviderStatusInfo | null> {
  // ... existing code ...

  // NEW: Query enabled models from database instead of JSON
  const enabledModels = await getEnabledModelsForProvider(providerId, category);
  const availableModels = enabledModels.map(m => m.model_id);

  // Get default model from app_settings
  const settingsCategory = category === "text" ? "ai" : "tts";
  const settings = await getSettingsMap({ category: settingsCategory });
  const defaultModel = settings[`${settingsCategory}.${providerId}.default_model`];

  // ... rest of status determination logic ...
}
```

### 5.4 Provider Card Enhancement

**File**: `src/components/admin/ProviderCard.tsx`

Add pending models indicator:

```tsx
<div className="text-sm font-medium">
  {status.enabledModels.length} enabled
  {status.pendingModels > 0 && (
    <span className="ml-1 text-yellow-600">
      ({status.pendingModels} pending approval)
    </span>
  )}
</div>
```

---

## Phase 6: Migration & Rollout Strategy

### 6.1 Migration Sequence

1. **018_add_ai_models_table.ts** - Create `ai_models` table
2. **019_seed_existing_models.ts** - Seed with current models from `providers.ts` as "enabled"
3. Run migrations: `pnpm db:migrate`

### 6.2 Backward Compatibility

- Keep hardcoded models in `providers.ts` as fallback for 3 months
- New system reads from database first, falls back to hardcoded
- Existing stories continue working (fallback logic handles deprecated models)
- Admin can gradually transition to dynamic system

### 6.3 Gradual Feature Rollout

**Week 1**: Deploy database + backend APIs
**Week 2**: Deploy discovery service (test with OpenAI only)
**Week 3**: Deploy admin UI for model management
**Week 4**: Enable discovery for all providers
**Week 5+**: Monitor, iterate, eventually remove hardcoded models

---

## Phase 7: Edge Cases & Error Handling

### 7.1 Rate Limiting

- Track `last_discovery_timestamp` per provider in database or cache
- Enforce 5-minute minimum between refreshes
- Show "Refreshed 3 minutes ago" message to admin
- Queue-based discovery for multiple providers in parallel

### 7.2 Provider Without Listing API

For providers like Anthropic that don't support model listing:
- Maintain curated list in `src/lib/ai/curatedModels.ts`
- Discovery service falls back to curated list
- Admin sees note: "Using curated list (provider API doesn't support discovery)"

### 7.3 Incomplete Metadata

- Store whatever metadata is available from API
- Allow admin to manually enrich: display name, description
- UI shows "No metadata" when data is unavailable

### 7.4 API Key Rotation

- Discovery uses API key from database at call time
- If key changes during discovery, next refresh uses new key

### 7.5 Model ID Conflicts

- Database constraint prevents duplicates: `UNIQUE(provider, category, model_id)`
- Display format in UI: `{provider}/{model_id}`

---

## Phase 8: Performance & Caching

### 8.1 Model List Cache

Cache enabled models per provider (5-minute TTL):

```typescript
const modelCache = new Map<string, { models: AIModel[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function getEnabledModelsForProvider(provider: string, category: string) {
  const cacheKey = `${provider}:${category}`;
  const cached = modelCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.models;
  }

  // Query database...
  modelCache.set(cacheKey, { models, timestamp: Date.now() });
  return models;
}
```

### 8.2 Database Indexing

Already included in schema:
```sql
CREATE INDEX idx_ai_models_provider_category ON ai_models(provider, category);
CREATE INDEX idx_ai_models_status ON ai_models(status);
```

### 8.3 Batch Operations

Use single UPDATE with IN clause for bulk approvals:

```typescript
await db.updateTable('ai_models')
  .set({ status: 'enabled', enabled_at: new Date() })
  .where('id', 'in', modelIds)
  .execute();
```

---

## Critical Files to Modify

### New Files
- `src/lib/db/migrations/018_add_ai_models_table.ts`
- `src/lib/db/migrations/019_seed_existing_models.ts`
- `src/lib/ai/modelDiscovery.ts`
- `src/lib/db/queries/aiModels.ts`
- `src/routes/api/admin/models/discover.ts`
- `src/routes/api/admin/models/index.ts`
- `src/routes/api/admin/models/default.ts`
- `src/components/admin/ModelManagementPanel.tsx`

### Modified Files
- `src/lib/ai/client.ts` - Add model validation before use
- `src/lib/ai/config.ts` - Update `getAIConfigForStory()` fallback logic
- `src/lib/tts/client.ts` - Mirror changes for TTS
- `src/lib/tts/config.ts` - Add TTS model validation
- `src/lib/ai/providerStatus.ts` - Query database instead of JSON settings
- `src/routes/admin/settings/index.tsx` - Replace AvailableModelsEditor with ModelManagementPanel
- `src/components/admin/ProviderCard.tsx` - Add pending models indicator

### Files to Eventually Deprecate (after 3 months)
- Hardcoded `supportedModels` arrays in `src/lib/ai/providers.ts` (keep for fallback initially)
- `src/components/admin/AvailableModelsEditor.tsx` (replaced by ModelManagementPanel)

---

## Testing Strategy

### Unit Tests
- Model discovery service with mocked API responses
- Fallback logic for deprecated models
- Database queries (CRUD operations)
- Status determination logic

### Integration Tests
1. Discover models from OpenAI → verify database inserts
2. Approve pending model → verify status change to "enabled"
3. Generate story with deprecated model → verify fallback to provider default
4. Set default model → verify it's used when provider is activated

### E2E Tests
1. Admin refreshes models → sees pending count
2. Admin approves models → models appear in enabled list
3. Admin sets default → activating provider uses new default
4. User generates story → correct model used with fallback

---

## Estimated Effort

| Phase | Time Estimate |
|-------|---------------|
| 1. Database Schema | 4-6 hours |
| 2. Discovery Service | 8-12 hours |
| 3. Backend APIs | 6-8 hours |
| 4. Fallback Logic | 4-6 hours |
| 5. Admin UI | 10-14 hours |
| 6. Testing | 6-8 hours |
| **Total** | **38-54 hours** |

---

## Summary

This implementation plan provides a comprehensive roadmap for transforming the hardcoded model system into a dynamic, database-driven solution. The key benefits are:

1. **Future-proof**: New models discovered automatically without code changes
2. **Admin control**: Manual approval workflow for new models
3. **Graceful degradation**: Fallback logic prevents breaking existing stories
4. **Separation of concerns**: Text and TTS models managed independently
5. **Scalable**: Database-driven with proper caching and indexing

The phased approach ensures backward compatibility while gradually migrating to the new system.
