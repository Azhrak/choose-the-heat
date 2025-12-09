# API Key Management

## Overview

The Choose the Heat application uses multiple AI providers (OpenAI, Google Gemini, Anthropic Claude, Mistral AI, xAI Grok, and OpenRouter) to generate romance novel content. API keys for these providers are securely stored encrypted in the database and managed through the admin settings interface.

## Security Model

### Encryption at Rest

All API keys are encrypted before storage using AES-256-GCM authenticated encryption:

- **Algorithm**: AES-256-GCM (industry-standard authenticated encryption)
- **Key Length**: 256 bits (32 bytes)
- **IV**: Unique 12-byte initialization vector generated per encryption
- **Auth Tag**: 16-byte authentication tag prevents tampering
- **Encryption Key**: Stored in `ENCRYPTION_KEY` environment variable

### Access Control

- Only users with the **admin** role can view or modify API keys
- All API key endpoints require admin authentication via `requireAdmin()` middleware
- Non-admin users cannot access the API Keys tab or endpoints

### Audit Trail

All API key operations are logged to the `admin_audit_logs` table:

- Create/update operations (without exposing key values)
- Delete operations
- Test/validation attempts
- Timestamp and user ID for all operations

## Setup Instructions

### 1. Generate Encryption Key

Generate a secure 32-byte encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Add to Environment

Add the generated key to your `.env` file:

```bash
ENCRYPTION_KEY=your-generated-base64-key-here
```

**Important**: This key must be consistently set across all environments (development, staging, production). If the key is lost, existing encrypted keys cannot be recovered.

### 3. Run Database Migration

Apply the database migration to create the `api_keys` table:

```bash
pnpm db:migrate
```

### 4. Configure API Keys

1. Log in as an admin user
2. Navigate to **Admin Settings > API Keys**
3. For each provider you want to use:
   - Click the edit/key button
   - Enter the API key
   - The system will automatically test the key
   - If valid, the key is encrypted and saved
   - If invalid, you'll see an error message

## Database Schema

### api_keys Table

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  provider VARCHAR(50) NOT NULL UNIQUE,
  encrypted_key TEXT NOT NULL,
  iv VARCHAR(32) NOT NULL,
  encryption_version INTEGER NOT NULL DEFAULT 1,
  last_tested_at TIMESTAMP,
  test_status VARCHAR(20),
  test_error TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);
```

**Fields**:

- `provider`: AI provider identifier (openai, google, anthropic, mistral, xai, openrouter)
- `encrypted_key`: Base64-encoded encrypted API key
- `iv`: Hex-encoded initialization vector for decryption
- `encryption_version`: Version number for future key rotation support
- `test_status`: Validation status (valid, invalid, untested)
- `test_error`: Error message from last validation attempt
- `last_tested_at`: Timestamp of last validation

## Admin UI

### API Keys Tab

The admin settings interface includes an "API Keys" tab with the following features:

#### Status Indicators

- 🟢 **Valid** (green): Key tested and working
- 🔴 **Invalid** (red): Key failed validation
- 🟡 **Untested** (yellow): Key not yet validated
- ⚪ **Not configured** (gray): No key set for this provider

#### Actions

- **Edit**: Modify an existing API key
- **Test**: Validate a configured key
- **Save**: Encrypt and store the key (with automatic validation)
- **Delete**: Remove the key from the database
- **Show/Hide**: Toggle visibility of the API key input

#### Workflow

1. Click the key/edit icon for a provider
2. Enter or paste the API key
3. Click "Save"
4. System automatically validates the key
5. If valid: Key is encrypted and saved
6. If invalid: Error message is shown, key is not saved

## API Key Validation

### Validation Process

When an API key is saved or tested, the system:

1. Makes a minimal API call to the provider
2. Uses the cheapest/fastest model for each provider
3. Sends a simple prompt ("Say OK")
4. Limits response to 10 tokens
5. Validates the response

### Test Models Used

- **OpenAI**: gpt-3.5-turbo
- **Google**: gemini-1.5-flash
- **Anthropic**: claude-3-haiku-20240307
- **Mistral**: mistral-small-latest
- **xAI**: grok-beta
- **OpenRouter**: openai/gpt-3.5-turbo

### Error Handling

Common error responses:

- **401 Unauthorized**: "Invalid API key - authentication failed"
- **403 Forbidden**: "API key does not have required permissions"
- **429 Rate Limit**: Key is considered valid (just rate limited during test)
- **Other errors**: Full error message is displayed

## API Endpoints

### GET /api/admin/api-keys

List all API keys metadata (admin only).

**Response**:

```json
{
  "keys": [
    {
      "id": "uuid",
      "provider": "openai",
      "encryptedKey": "******",
      "testStatus": "valid",
      "testError": null,
      "lastTestedAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Note**: `encryptedKey` is always masked as "******" or empty string.

### PUT /api/admin/api-keys/$provider

Update an API key for a specific provider (admin only).

**Request**:

```json
{
  "apiKey": "sk-..."
}
```

**Response**:

```json
{
  "success": true
}
```

**Validation**: Key is tested before saving. Invalid keys are rejected.

### POST /api/admin/api-keys/$provider/test

Test an existing API key (admin only).

**Response**:

```json
{
  "valid": true,
  "message": "API key is valid and working"
}
```

Or if invalid:

```json
{
  "valid": false,
  "error": "Invalid API key - authentication failed"
}
```

### DELETE /api/admin/api-keys/$provider

Delete an API key (admin only).

**Implementation**: Sets `encrypted_key` and `iv` to empty strings.

## Integration with AI Client

### Key Loading

The AI client (`/src/lib/ai/client.ts`) loads API keys from the database:

```typescript
const apiKey = await getApiKey('openai');

if (!apiKey) {
  throw new Error(
    'OpenAI API key not configured. ' +
    'Please set it in Admin Settings > API Keys'
  );
}

const openai = createOpenAI({ apiKey });
```

### Error Messages

If a provider is selected but no valid API key is configured, users see:

> "Cannot use {provider}: No valid API key configured. Please configure in Admin Settings > API Keys"

This provides clear guidance on how to resolve the issue.

## Security Best Practices

### What's Protected

✅ API keys encrypted at rest in database
✅ Keys never logged in plaintext
✅ Keys never exposed in API responses
✅ Keys never appear in error messages
✅ Admin-only access to all key operations
✅ Audit trail for accountability

### Key Rotation

To rotate an API key:

1. Generate new key from the AI provider
2. Update the key in Admin Settings > API Keys
3. Test the new key
4. Once confirmed working, revoke the old key at the provider

The system supports `encryption_version` for future encryption key rotation if needed.

### Encryption Key Backup

**Critical**: Back up your `ENCRYPTION_KEY` in a secure location:

- Use a password manager (1Password, LastPass, etc.)
- Store in secure secrets management (AWS Secrets Manager, HashiCorp Vault)
- Keep separate from application code and database backups

If the encryption key is lost, you'll need to:

1. Generate a new encryption key
2. Re-enter all API keys through the admin UI

## Monitoring

### Check API Key Status

As an admin:

1. Navigate to Admin Settings > API Keys
2. Review status indicators for each provider
3. Use "Test" button to validate keys periodically

### Audit Logs

Query recent API key operations:

```sql
SELECT * FROM admin_audit_logs
WHERE entity_id LIKE 'api_key:%'
ORDER BY created_at DESC
LIMIT 20;
```

### Database Verification

Verify keys are encrypted (not readable):

```sql
SELECT
  provider,
  LENGTH(encrypted_key) as key_length,
  LENGTH(iv) as iv_length,
  test_status
FROM api_keys
WHERE encrypted_key != '';
```

## Troubleshooting

### "Encryption key not set" Error

**Problem**: `ENCRYPTION_KEY` environment variable is missing or invalid.

**Solution**:

1. Generate a new key: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
2. Add to `.env`: `ENCRYPTION_KEY=<generated-key>`
3. Restart the application

### "Failed to decrypt API key" Error

**Problem**: Encryption key changed or corrupted data.

**Solution**:

1. Verify `ENCRYPTION_KEY` is correct across all environments
2. If key is lost, re-enter all API keys through admin UI
3. Check database for data corruption

### API Key Test Fails

**Problem**: Key validation returns "invalid".

**Solution**:

1. Verify the API key is correct (copy-paste from provider)
2. Check the key has required permissions at the provider
3. Verify no leading/trailing whitespace in the key
4. Check provider status page for outages
5. Review `test_error` field for specific error message

### Story Generation Fails

**Problem**: "No valid API key configured" error.

**Solution**:

1. Navigate to Admin Settings > API Keys
2. Verify the selected provider has a valid key
3. Test the key using the "Test" button
4. If invalid, update the key and test again

## Migration from Environment Variables

If you previously used environment variables for API keys:

### Old Approach (No longer used)

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### New Approach (Current)

```bash
# Only this is needed:
ENCRYPTION_KEY=<base64-encoded-32-byte-key>
```

All API keys are now configured via Admin Settings > API Keys.

### Migration Steps

1. Set up `ENCRYPTION_KEY` in `.env`
2. Run database migration
3. Enter API keys via admin UI
4. Test each provider
5. Remove old `*_API_KEY` environment variables from `.env`

## Development

### Local Setup

For local development:

1. Generate encryption key
2. Add to `.env.local`:

   ```bash
   ENCRYPTION_KEY=your-dev-key-here
   ```

3. Run migration: `pnpm db:migrate`
4. Configure test API keys via UI

### Testing

Run encryption tests:

```bash
pnpm test src/lib/crypto/encryption.test.ts
```

Run query layer tests:

```bash
pnpm test src/lib/db/queries/apiKeys.test.ts
```

### Key Generation Helper

Generate an encryption key programmatically:

```typescript
import { generateEncryptionKey } from '~/lib/crypto/encryption';

generateEncryptionKey();
// Outputs: "ENCRYPTION_KEY=<base64-key>"
```

## Architecture

### Component Overview

```
┌─────────────────────────────────────────┐
│         Admin UI (React)                │
│  /admin/settings (API Keys Tab)         │
└───────────────┬─────────────────────────┘
                │
                ├─ GET /api/admin/api-keys
                ├─ PUT /api/admin/api-keys/$provider
                └─ POST /api/admin/api-keys/$provider/test
                │
┌───────────────┴─────────────────────────┐
│       API Routes (TanStack Router)      │
│  - requireAdmin() authorization         │
│  - Request validation (Zod)             │
└───────────────┬─────────────────────────┘
                │
┌───────────────┴─────────────────────────┐
│      Query Layer (/lib/db/queries)      │
│  - getApiKey()                          │
│  - updateApiKey()                       │
│  - testApiKey()                         │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
┌───────┴──────┐ ┌─────┴──────────┐
│  Encryption  │ │  Key Validator │
│  (AES-GCM)   │ │  (Test APIs)   │
└──────────────┘ └────────────────┘
        │
┌───────┴─────────────────────────────────┐
│      PostgreSQL Database                │
│  - api_keys table (encrypted storage)   │
│  - admin_audit_logs (audit trail)       │
└─────────────────────────────────────────┘
```

### Data Flow

1. **Save Key**: UI → API → Validator → Encryptor → Database
2. **Load Key**: AI Client → Query Layer → Decryptor → Database
3. **Test Key**: UI → API → Validator → Provider API

## Support

For issues or questions:

1. Check this documentation
2. Review audit logs for recent changes
3. Verify encryption key is correctly set
4. Check provider status pages
5. Test keys individually to isolate issues

## Future Enhancements

Potential improvements (not yet implemented):

- Encryption key rotation workflow
- Automatic key expiration detection
- Usage tracking per provider
- Cost monitoring
- Multi-region key replication
- Key sharing between environments (with re-encryption)
