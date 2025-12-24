# AI Provider Configuration Guide

Choose the Heat supports multiple AI providers through the Vercel AI SDK. You can easily switch between providers or use different models based on your needs.

## Supported Providers

| Provider | Free Tier | Best For | Cost per Scene |
|----------|-----------|----------|----------------|
| **OpenAI** | No | High-quality, consistent output | $0.01-0.05 |
| **Google Gemini** | Yes | Cost-effective, fast | $0.001-0.01 |
| **Anthropic Claude** | No | Creative, nuanced writing | $0.015-0.075 |
| **Mistral AI** | No | European option, multilingual | $0.002-0.02 |
| **xAI** | No | Fast reasoning, real-time data | Varies by model |

---

## Quick Setup

### 1. Choose Your Provider

Set the `AI_PROVIDER` environment variable in your `.env` file:

```env
AI_PROVIDER=openai    # or: google, anthropic, mistral, xai
```

### 2. Get API Keys

Each provider requires its own API key. See detailed setup below.

---

## Provider Setup Guides

### OpenAI (Default)

**Best for:** High-quality creative writing with consistent results

**Get API Key:**

1. Visit <https://platform.openai.com/api-keys>
2. Sign up or log in
3. Create new API key
4. Copy the key (starts with `sk-`)

**Configuration:**

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo
```

**Recommended Models:**

- `gpt-4-turbo` - Best quality, higher cost ($0.01/1K input, $0.03/1K output)
- `gpt-4` - Excellent quality, very high cost
- `gpt-3.5-turbo` - Good quality, lower cost ($0.0005/1K input, $0.0015/1K output)

**Pricing:** ~$0.01-0.05 per scene (800-1200 words)

---

### Google Gemini

**Best for:** Cost-effective solution with generous free tier

**Get API Key:**

1. Visit <https://aistudio.google.com/app/apikey>
2. Sign in with Google account
3. Create API key
4. Copy the key

**Configuration:**

```env
AI_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key-here
GOOGLE_MODEL=gemini-1.5-pro
```

**Recommended Models:**

- `gemini-1.5-pro` - Best quality, 2M context window ($0.00125/1K input, $0.005/1K output)
- `gemini-1.5-flash` - Faster, lower cost ($0.000075/1K input, $0.0003/1K output)
- `gemini-pro` - Legacy model, good quality

**Pricing:**

- Free tier: 15 requests per minute, 1500 requests per day
- Paid: ~$0.001-0.01 per scene

**Note:** Google's API key naming in the SDK uses `GOOGLE_GENERATIVE_AI_API_KEY` (not `GOOGLE_API_KEY`)

---

### Anthropic Claude

**Best for:** Creative, nuanced writing with strong reasoning

**Get API Key:**

1. Visit <https://console.anthropic.com/>
2. Sign up for account
3. Go to API Keys section
4. Create new key
5. Copy the key (starts with `sk-ant-`)

**Configuration:**

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

**Recommended Models:**

- `claude-3-5-sonnet-20241022` - Latest, best quality ($3/1M input, $15/1M output)
- `claude-3-opus-20240229` - Most capable, highest cost ($15/1M input, $75/1M output)
- `claude-3-haiku-20240307` - Fastest, lower cost ($0.25/1M input, $1.25/1M output)

**Pricing:** ~$0.015-0.075 per scene

---

### Mistral AI

**Best for:** European data compliance, multilingual support

**Get API Key:**

1. Visit <https://console.mistral.ai/>
2. Create account
3. Navigate to API Keys
4. Generate new key
5. Copy the key

**Configuration:**

```env
AI_PROVIDER=mistral
MISTRAL_API_KEY=your-mistral-api-key-here
MISTRAL_MODEL=mistral-large-latest
```

**Recommended Models:**

- `mistral-large-latest` - Best quality ($4/1M input, $12/1M output)
- `mistral-medium-latest` - Balanced performance
- `mistral-small-latest` - Cost-effective ($1/1M input, $3/1M output)

**Pricing:** ~$0.002-0.02 per scene

---

### xAI

**Best for:** Fast reasoning and real-time information access

**Get API Key:**

1. Visit <https://console.x.ai/>
2. Sign up or log in with your X/Twitter account
3. Navigate to API Keys section
4. Create new API key
5. Copy the key

**Configuration:**

```env
AI_PROVIDER=xAI
XAI_API_KEY=your-xai-api-key-here
XAI_MODEL=grok-4-fast
```

**Recommended Models:**

- `grok-4-fast` - Latest model with strong reasoning capabilities

**Pricing:** Check <https://x.ai/api> for current pricing

**Note:** xAI uses an OpenAI-compatible API, so integration is seamless.

---

## Model Comparison

### Quality Ranking (for creative writing)

1. **Claude 3.5 Sonnet** - Most creative and nuanced
2. **GPT-4 Turbo** - Consistent, high-quality output
3. **Gemini 1.5 Pro** - Very good, especially for the price
4. **Mistral Large** - Good quality, European option
5. **GPT-3.5 Turbo** - Decent, most cost-effective

### Cost Ranking (lowest to highest per scene)

1. **Gemini Flash** (~$0.001)
2. **GPT-3.5 Turbo** (~$0.002)
3. **Mistral Small** (~$0.002)
4. **Gemini Pro** (~$0.005)
5. **Mistral Large** (~$0.008)
6. **GPT-4 Turbo** (~$0.02)
7. **Claude Haiku** (~$0.015)
8. **Claude 3.5 Sonnet** (~$0.05)
9. **Claude Opus** (~$0.10)

### Speed Ranking (fastest to slowest)

1. **Gemini Flash**
2. **Claude Haiku**
3. **GPT-3.5 Turbo**
4. **Mistral Small**
5. **Gemini Pro**
6. **GPT-4 Turbo**
7. **Mistral Large**
8. **Claude 3.5 Sonnet**
9. **Claude Opus**

---

## Switching Providers

### During Development

Simply change `AI_PROVIDER` in your `.env` file and restart the app:

```bash
# Switch to Google Gemini
AI_PROVIDER=google

# Restart
pnpm dev
```

### In Production

Set environment variables in your deployment platform:

- Vercel: Project Settings → Environment Variables
- Docker: Update `.env` or docker-compose environment
- Railway/Render: Dashboard → Environment Variables

### Dynamic Switching (Future)

You could enhance the app to let users choose their provider per story by:

1. Adding provider preference to user settings
2. Passing provider to `generateCompletion()` function
3. Storing provider choice in `user_stories` table

---

## Admin UI Configuration

The application includes a unified admin interface for managing AI providers at `/admin/providers`. This interface provides comprehensive provider management with real-time status monitoring.

### Provider Status Dashboard

The dashboard shows all providers with their current status:

- **✓ Ready** - Provider has a validated API key and configured models (green)
- **⚠ Incomplete** - Provider has an API key but needs configuration or validation (yellow)
- **✗ Invalid** - Provider has an invalid or failed API key (red)
- **○ Unconfigured** - Provider has no API key set (gray)

**Access:** Admin Panel → AI Providers (`/admin/providers`)

### Configuring a Provider

**Step-by-step guide:**

1. Navigate to **Admin Panel → AI Providers** (admin-only access)
2. Choose the **Text Generation** or **Text-to-Speech** tab
3. Find your desired provider in the list
4. Click the **Configure** button (⚙️ icon)
5. In the configuration modal:
   - Enter your API key in the text field
   - Use the eye icon to toggle visibility
   - Click **Save & Validate** to store and test the key
   - Or click **Test Existing Key** to validate a previously saved key
6. The system will:
   - Encrypt your API key before storage
   - Test the key against the provider's API
   - Update the provider status automatically
   - Display success or error messages

**Security:** All API keys are encrypted using AES-256 encryption before storage in the database.

### Activating a Provider

Once a provider is configured (status shows "Ready"):

1. Click the **Activate** button (▶ icon) on the provider card
2. The system will:
   - Set the provider as active for all new story generation
   - Automatically select the provider's default model
   - Invalidate configuration caches to apply changes immediately
   - Display a success confirmation
3. The "Active" badge will appear on the provider card
4. All other providers will show as inactive

**Note:** Only providers with "Ready" status can be activated. Incomplete or unconfigured providers cannot be activated.

### Provider Information Display

Each provider card shows:

- **Provider Name** - Display name with provider logo/icon
- **Status Badge** - Visual indicator (Ready, Incomplete, Invalid, Unconfigured)
- **Active Badge** - Shows which provider is currently active
- **API Key Status** - Valid, Invalid, Untested, or Not set
- **Models Count** - Number of configured models for this provider
- **Default Model** - The model that will be used when this provider is activated
- **Action Buttons** - Configure (⚙️) and Activate (▶) buttons

### Summary Statistics

The dashboard displays at-a-glance statistics at the top:

- **Ready** (green) - Fully configured and working providers
- **Incomplete** (yellow) - Providers needing configuration or validation
- **Invalid** (red) - Providers with API key issues
- **Unconfigured** (gray) - Providers not yet set up

### Provider Status Logic

The system determines provider status based on:

1. **Unconfigured**: No API key stored
2. **Invalid**: API key test failed
3. **Incomplete**: Has API key but:
   - No models configured, OR
   - No default model set, OR
   - API key not tested yet
4. **Ready**: API key valid AND models configured AND default model set

### Benefits of Admin UI

- **Centralized Management** - All provider configuration in one unified interface
- **Real-time Status** - Live status updates show which providers are ready to use
- **Easy Switching** - Activate different providers with a single click
- **Secure Storage** - API keys encrypted with AES-256 before storage
- **Model Management** - Each provider tracks its own models and default selection
- **Category Support** - Separate configuration for Text Generation and Text-to-Speech
- **Validation Built-in** - Test API keys before activation
- **Status Monitoring** - Visual indicators for quick health checks

---

## Troubleshooting

### "API key not found" Error

Make sure:

1. Environment variable name matches exactly (case-sensitive)
2. API key is valid and not expired
3. `.env` file is in project root
4. You've restarted the dev server after changing `.env`

### "Rate limit exceeded" Error

Solutions:

1. **OpenAI:** Upgrade your account tier
2. **Google:** Wait for rate limit reset or upgrade to paid
3. **Anthropic:** Check your usage limits in console
4. **Mistral:** Reduce concurrent requests

### "Model not found" Error

Make sure:

1. Model name is spelled correctly
2. Model is available for your API key tier
3. Model hasn't been deprecated (check provider docs)

### Poor Quality Output

Try:

1. Switching to a higher-quality model (e.g., GPT-4 Turbo, Claude 3.5 Sonnet)
2. Adjusting temperature (lower = more consistent, higher = more creative)
3. Improving your prompts in `app/lib/ai/prompts.ts`

---

## Cost Optimization Tips

### 1. Use Tiered Models

- **First scene:** Use premium model (GPT-4, Claude 3.5)
- **Subsequent scenes:** Use cheaper model (GPT-3.5, Gemini)

### 2. Cache Aggressively

The app already caches scenes in the database. This prevents regenerating the same scene multiple times.

### 3. Use Gemini Free Tier

For development and testing, use Gemini 1.5 Flash with the free tier:

```env
AI_PROVIDER=google
GOOGLE_MODEL=gemini-1.5-flash
```

### 4. Reduce Max Tokens

Lower `maxTokens` in scene generation (currently 2000):

```typescript
// In app/lib/ai/generate.ts
maxTokens: 1500  // ~1125 words instead of 1500
```

### 5. Monitor Usage

Set up usage alerts in your AI provider's dashboard:

- OpenAI: Usage → Usage Limits
- Anthropic: Settings → Usage
- Google: Quotas & System Limits

---

## Best Practices

### 1. Development vs Production

**Development:**

```env
AI_PROVIDER=google
GOOGLE_MODEL=gemini-1.5-flash  # Free, fast
```

**Production:**

```env
AI_PROVIDER=openai
OPENAI_MODEL=gpt-4-turbo  # High quality
```

### 2. Multiple API Keys

For high-volume apps, rotate between multiple API keys:

```typescript
// In app/lib/ai/client.ts, modify to support key rotation
const keys = [key1, key2, key3]
const currentKey = keys[requestCount % keys.length]
```

### 3. Fallback Providers

Implement fallback logic:

```typescript
try {
  // Try primary provider
  return await generateWithOpenAI()
} catch (error) {
  // Fall back to secondary
  return await generateWithGemini()
}
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | No | `openai` | Which provider to use |
| `OPENAI_API_KEY` | If using OpenAI | - | OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4-turbo` | OpenAI model name |
| `GOOGLE_GENERATIVE_AI_API_KEY` | If using Google | - | Google API key |
| `GOOGLE_MODEL` | No | `gemini-1.5-pro` | Gemini model name |
| `ANTHROPIC_API_KEY` | If using Anthropic | - | Anthropic API key |
| `ANTHROPIC_MODEL` | No | `claude-3-5-sonnet-20241022` | Claude model name |
| `MISTRAL_API_KEY` | If using Mistral | - | Mistral API key |
| `MISTRAL_MODEL` | No | `mistral-large-latest` | Mistral model name |
| `XAI_API_KEY` | If using xAI | - | xAI API key |
| `XAI_MODEL` | No | `grok-4-fast` | xAI model name |

---

## Additional Resources

- **Vercel AI SDK Docs:** <https://sdk.vercel.ai/docs>
- **OpenAI Docs:** <https://platform.openai.com/docs>
- **Google AI Docs:** <https://ai.google.dev/docs>
- **Anthropic Docs:** <https://docs.anthropic.com/>
- **Mistral Docs:** <https://docs.mistral.ai/>
- **xAI Docs:** <https://docs.x.ai/>

---

**Questions or issues?** Open an issue on GitHub or check the main [README.md](README.md).
