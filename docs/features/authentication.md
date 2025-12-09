# Authentication & User Management

<!--
  This document follows the standard feature documentation template.
  See FEATURE_DOCUMENTATION_TEMPLATE.md for section descriptions and update triggers.
-->

Complete guide to user authentication, session management, and role-based access control.

---

## Metadata

| Property | Value |
|----------|-------|
| **Feature Status** | ✅ Production Ready |
| **Last Updated** | 2025-12-09 |
| **Related Features** | [Admin Dashboard](./admin-dashboard.md), [Personalization](./personalization.md), [Story Experience](./story-experience.md), [AI Story Generation](./ai-story-generation.md), [Text-to-Speech](./text-to-speech.md) |
| **Primary Maintainer** | Core Team |
| **API Stability** | Stable |

<!-- UPDATE TRIGGER: Update Last Updated date whenever ANY section changes -->
<!-- UPDATE TRIGGER: Update Feature Status when production state changes -->
<!-- UPDATE TRIGGER: Update Related Features when cross-feature dependencies change -->

---

## Overview

### Purpose

The Authentication & User Management feature provides secure user identity management for the platform. It handles user registration, login, session management, and role-based access control, ensuring that users can safely access their personalized content and that admins can manage the platform effectively.

### Key Capabilities

- **Email/Password Authentication**: Traditional signup and login with Argon2id password hashing
- **Google OAuth 2.0**: One-click sign-in via Google using Arctic library and PKCE flow
- **Secure Session Management**: Database-backed sessions with 30-day expiry
- **Role-Based Access Control**: Three-tier permission system (User, Editor, Admin)
- **Password Strength Validation**: Enforced complexity requirements
- **Session Security**: HttpOnly, Secure, SameSite=Lax cookies
- **Expired Session Cleanup**: Automatic removal of old sessions

<!-- UPDATE TRIGGER: Update when new major capabilities are added or removed -->

### Use Cases

**Primary User Flows:**

1. **Email/Password Signup**
   - User provides email, name, password → System validates password strength → Password hashed with Argon2id → User account created with "user" role → Session created and user logged in → Optional: Redirect to onboarding for preferences

2. **Email/Password Login**
   - User enters email and password → System verifies credentials → Session created on success → Session cookie set (30-day expiry)

3. **Google OAuth Login**
   - User clicks "Sign in with Google" → Redirected to Google OAuth consent screen → User authorizes application → System receives authorization code → System exchanges code for access token (using PKCE) → Fetch user info from Google → Create or update user account → Session created and user logged in

4. **Session-Based Access**
   - Every request includes session cookie → Middleware validates session from database → User identity available to all endpoints → Expired sessions automatically rejected

5. **Role-Based Authorization**
   - User role checked on protected endpoints → Admin-only routes (user management, audit logs) → Editor routes (template management) → User routes (story creation, preferences)

6. **Logout**
   - User clicks logout → Session deleted from database → Session cookie cleared → User redirected to login page

<!-- UPDATE TRIGGER: Add new use cases when feature scope expands -->

---

## User Experience

### Login Page

**Location**: `/auth/login`

**Elements:**

- Email input field
- Password input field
- "Sign In" button
- "Sign in with Google" button
- "Don't have an account? Sign up" link
- Error messages for invalid credentials

### Signup Page

**Location**: `/auth/signup`

**Elements:**

- Email input field
- Name input field
- Password input field
- Password requirements displayed
- "Create Account" button
- "Sign up with Google" button
- "Already have an account? Login" link
- Error messages for validation failures

**Password Requirements (displayed):**

- At least 8 characters long
- Contains uppercase letter
- Contains lowercase letter
- Contains number

### Onboarding Page

**Location**: `/auth/onboarding`

**Purpose**: Collect user preferences after first signup

**Flow:**

- User redirected here after signup if no preferences set
- Same preferences form as `/preferences` page
- Skip button to set preferences later
- "Get Started" button to save and continue to browse

---

## Technical Implementation

### Architecture Overview

```mermaid
graph TB
    User[User] --> Signup[Signup Flow]
    User --> Login[Login Flow]
    User --> OAuth[Google OAuth]

    Signup --> Validate[Validate Input]
    Validate --> Hash[Hash Password - Argon2id]
    Hash --> CreateUser[Create User]
    CreateUser --> CreateSession[Create Session]

    Login --> GetUser[Get User]
    GetUser --> VerifyPass[Verify Password]
    VerifyPass --> CreateSession

    OAuth --> Google[Google OAuth]
    Google --> PKCE[PKCE Flow]
    PKCE --> FetchUser[Fetch Google User Info]
    FetchUser --> UpsertUser[Create/Update User]
    UpsertUser --> CreateSession

    CreateSession --> SetCookie[Set Session Cookie]
    SetCookie --> DB[sessions table]

    Request[API Request] --> Cookie[Extract Cookie]
    Cookie --> ValidateSession[Validate Session]
    ValidateSession --> DB
    ValidateSession --> CheckRole[Check User Role]
    CheckRole --> Authorized[Proceed] | Reject[401/403]
```

### Password Security

**Hashing Algorithm**: Argon2id (via @node-rs/argon2)

**Configuration:**

```typescript
{
  memoryCost: 19456,    // 19 MiB
  timeCost: 2,          // 2 iterations
  outputLen: 32,        // 32-byte hash
  parallelism: 1        // Single thread
}
```

**Strength Requirements:**

- Minimum 8 characters
- Maximum 128 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number

**Implementation**: [src/lib/auth/password.ts](../../src/lib/auth/password.ts)

### Session Management

**Session Structure:**

```typescript
interface Session {
  id: string          // 32-byte base64url token
  userId: string      // User ID foreign key
  expiresAt: Date     // 30 days from creation
}
```

**Storage**: Database-backed in `sessions` table

**Cookie Configuration:**

- Name: `session_id` (configurable via SESSION_COOKIE_NAME)
- HttpOnly: Yes (prevents JavaScript access)
- Secure: Yes (HTTPS only in production)
- SameSite: Lax (CSRF protection)
- Max-Age: 30 days (2,592,000 seconds)

**Session Lifecycle:**

1. **Creation**: On successful login/signup
   - Generate cryptographically secure 32-byte token
   - Insert into database with 30-day expiry
   - Set cookie with same expiry

2. **Validation**: On every request
   - Extract session cookie from request headers
   - Query database for non-expired session
   - Return null if missing or expired

3. **Expiration**: Automatic
   - Sessions auto-expire after 30 days
   - Periodic cleanup job deletes expired sessions
   - Manual cleanup via `cleanupExpiredSessions()`

4. **Deletion**: On logout
   - Delete session from database
   - Clear cookie with Max-Age=0

**Implementation**: [src/lib/auth/session.ts](../../src/lib/auth/session.ts)

### Role-Based Access Control

**Role Hierarchy:**

```
user → editor → admin
```

**Role Definitions:**

- **user**: Default role for all signups. Can create stories, set preferences, manage own content
- **editor**: Can manage novel templates (create, edit, publish, archive). See [Admin Dashboard](./admin-dashboard.md#user-roles)
- **admin**: Full platform access including user management, audit logs, template deletion

**Authorization Middleware:**

```typescript
// Require specific roles
await requireRole(request, ["editor", "admin"])  // Editor or Admin only
await requireAdmin(request)                      // Admin only
await requireEditorOrAdmin(request)              // Editor or Admin
await requireAuth(request)                       // Any authenticated user

// Returns: { userId: string, role: UserRole }
// Throws: 401 Unauthorized or 403 Forbidden
```

**Permission Enforcement:**

- Middleware applied at route handler level
- Returns user data if authorized
- Throws Response with 401/403 if unauthorized
- Automatically includes in error JSON

**Implementation**: [src/lib/auth/authorization.ts](../../src/lib/auth/authorization.ts)

### Google OAuth Flow

**Library**: [Arctic](https://arctic.js.org/) - OAuth 2.0 library

**Flow Type**: Authorization Code with PKCE (Proof Key for Code Exchange)

**Steps:**

1. **Initiate OAuth**: Generate random state parameter → Generate PKCE code verifier → Store state and verifier temporarily (10-minute expiry) → Build authorization URL with Google → Redirect user to Google consent screen

2. **User Authorization**: User sees Google OAuth consent screen → User authorizes application scopes (email, profile) → Google redirects to callback URL with code and state

3. **Callback Handling**: Validate state parameter matches stored value → Retrieve PKCE code verifier → Exchange authorization code for access token → PKCE adds security layer to prevent interception

4. **User Info Fetch**: Use access token to fetch Google user info → Retrieve: sub (ID), email, name, picture, email_verified

5. **Account Linking**: Check if user exists by email → If exists: Update name/avatar if changed → If new: Create user account with "user" role → Set `email_verified = true` (trusted by Google)

6. **Session Creation**: Create session for user → Set session cookie → Redirect to onboarding (if no preferences) or browse page

**Security Features:**

- State parameter prevents CSRF
- PKCE prevents authorization code interception
- 10-minute expiry on stored state/verifier
- Automatic cleanup of expired OAuth data

**Configuration:**

- GOOGLE_CLIENT_ID (environment variable)
- GOOGLE_CLIENT_SECRET (environment variable)
- Callback URL: `{APP_URL}/api/auth/callback/google`

**Implementation**: [src/lib/auth/oauth.ts](../../src/lib/auth/oauth.ts)

---

## API Reference

### Email/Password Authentication

#### Signup

```typescript
POST /api/auth/signup

Request Body:
{
  email: string       // Valid email, max 255 chars
  name: string        // Min 1, max 255 chars
  password: string    // Min 8, max 128 chars, must meet strength requirements
}

Response: 201 Created
{
  success: true
  user: {
    id: string
    email: string
    name: string
  }
}
// Sets session cookie

Errors:
- 400: Invalid input, weak password, invalid email format
- 409: Email already registered
- 500: Internal server error

Password Validation Errors:
- "Password must be at least 8 characters long"
- "Password must be less than 128 characters"
- "Password must contain at least one lowercase letter"
- "Password must contain at least one uppercase letter"
- "Password must contain at least one number"
```

#### Login

```typescript
POST /api/auth/login

Request Body:
{
  email: string
  password: string
}

Response: 200 OK
{
  success: true
  user: {
    id: string
    email: string
    name: string
    hasPreferences: boolean  // Whether user has set preferences
  }
}
// Sets session cookie

Errors:
- 400: Invalid input
- 401: Invalid email or password
- 500: Internal server error
```

#### Logout

```typescript
POST /api/auth/logout

Authentication: Required (session cookie)

Response: 200 OK
{
  success: true
}
// Clears session cookie

Errors:
- 401: No valid session
- 500: Internal server error
```

### Google OAuth

#### Initiate OAuth

```typescript
GET /api/auth/google

Response: 302 Redirect
// Redirects to Google OAuth consent screen
// Sets state and PKCE verifier cookies (httpOnly)

Example Redirect URL:
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=...
  &redirect_uri=...
  &response_type=code
  &scope=email+profile
  &state=...
  &code_challenge=...
  &code_challenge_method=S256
```

#### OAuth Callback

```typescript
GET /api/auth/callback/google?code={code}&state={state}

Query Parameters:
- code: Authorization code from Google
- state: State parameter for CSRF protection

Response: 302 Redirect
// Creates/updates user account
// Creates session and sets cookie
// Redirects to /auth/onboarding (no preferences) or /browse (has preferences)

Errors:
- 400: Missing code or state, invalid state
- 500: Failed to exchange code or fetch user info
```

### Session Management

Sessions are managed automatically via cookies. No explicit session API endpoints except logout.

**Session Validation**: Done automatically by `getSessionFromRequest()` middleware

**Session Cleanup**: Run periodically via cron job or manual execution

```typescript
import { cleanupExpiredSessions } from "~/lib/auth/session"

const deletedCount = await cleanupExpiredSessions()
// Returns number of sessions deleted
```

---

## Code Locations

### Directory Structure

```
src/
├── lib/
│   └── auth/
│       ├── session.ts                # Session CRUD and validation (189 lines)
│       ├── session-constants.ts      # SESSION_COOKIE_NAME, SESSION_EXPIRY_DAYS
│       ├── password.ts               # Argon2id hashing and validation (77 lines)
│       ├── oauth.ts                  # Google OAuth with Arctic (142 lines)
│       └── authorization.ts          # RBAC middleware functions (119 lines)
├── routes/
│   ├── auth/
│   │   ├── login.tsx                 # Login page UI
│   │   ├── signup.tsx                # Signup page UI
│   │   └── onboarding.tsx            # Post-signup preferences flow
│   └── api/
│       └── auth/
│           ├── login.ts              # POST email/password login (80 lines)
│           ├── signup.ts             # POST email/password signup
│           ├── logout.ts             # POST logout
│           ├── google.ts             # GET initiate Google OAuth
│           └── callback.google.ts    # GET OAuth callback handler
└── hooks/
    └── useCurrentUserQuery.ts        # Fetch current user hook
```

---

## Configuration

### Environment Variables

```bash
# Google OAuth (required for OAuth login)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Application URL (required for OAuth callback)
APP_URL=https://your-domain.com

# Session configuration (optional, defaults shown)
SESSION_COOKIE_NAME=session_id
SESSION_EXPIRY_DAYS=30
```

### Session Settings

**Configured in**: [src/lib/auth/session-constants.ts](../../src/lib/auth/session-constants.ts)

```typescript
export const SESSION_COOKIE_NAME = "session_id"
export const SESSION_EXPIRY_DAYS = 30
```

### Password Requirements

**Hardcoded in**: [src/lib/auth/password.ts](../../src/lib/auth/password.ts)

```typescript
// Validation rules (cannot be changed without code update)
- Minimum length: 8 characters
- Maximum length: 128 characters
- Must contain: lowercase, uppercase, number
```

### Google OAuth Scopes

**Scopes Requested**: email, profile

**Data Retrieved**:

- `sub`: Google user ID
- `email`: User email address
- `name`: Full name
- `picture`: Avatar URL
- `email_verified`: Email verification status (always true from Google)

---

## Related Features

### Dependencies

None (base infrastructure feature)

### Dependents

- **[Personalization](./personalization.md)**: User identity required for preference storage
- **[Story Experience](./story-experience.md)**: User ownership of stories
- **[Admin Dashboard](./admin-dashboard.md)**: Role-based admin/editor access
- **[Text-to-Speech](./text-to-speech.md)**: User-specific audio generation
- **[AI Story Generation](./ai-story-generation.md)**: User-specific stories and scenes

---

## Testing

### Unit Tests

**Password Security:**

```typescript
// Test password hashing
- Hash same password twice → Different hashes (salt randomization)
- Verify correct password → Returns true
- Verify wrong password → Returns false

// Test password validation
- "pass" → Too short
- "password" → Missing uppercase/number
- "Password" → Missing number
- "Password1" → Valid ✓
- "P1" + repeat("a", 126) → Too long (129 chars)
```

**Session Management:**

```typescript
// Test session creation
- Create session → Valid session returned
- Session ID is 43+ chars (base64url)
- Expires at is 30 days in future

// Test session validation
- Get valid session → Returns session
- Get expired session → Returns null
- Get non-existent session → Returns null

// Test session cleanup
- Insert expired session → cleanupExpiredSessions() removes it
- Insert valid session → cleanupExpiredSessions() keeps it
```

### Integration Tests

**Login Flow:**

```typescript
1. POST /api/auth/login with valid credentials
2. Verify 200 response with user data
3. Verify Set-Cookie header present
4. Extract session cookie
5. Make authenticated request with cookie
6. Verify request succeeds with user context
```

**Signup Flow:**

```typescript
1. POST /api/auth/signup with new user data
2. Verify 201 response
3. Verify user created in database
4. Verify password is hashed (not plaintext)
5. Verify session created
6. Verify Set-Cookie header present
```

**OAuth Flow:**

```typescript
1. GET /api/auth/google
2. Verify 302 redirect to Google
3. Verify state cookie set
4. Mock Google callback with code and state
5. Verify user created/updated in database
6. Verify session created
7. Verify redirect to onboarding or browse
```

**Authorization:**

```typescript
// Test requireAdmin middleware
1. Create user with role="user"
2. Make request to admin-only endpoint
3. Verify 403 Forbidden response

// Test requireEditorOrAdmin middleware
1. Create user with role="editor"
2. Make request to editor endpoint
3. Verify request succeeds
```

### Manual Testing Checklist

- [ ] Signup with email/password
- [ ] Signup with weak password (rejected)
- [ ] Signup with duplicate email (409 error)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (401 error)
- [ ] Logout clears session
- [ ] Google OAuth signup flow
- [ ] Google OAuth login (existing user)
- [ ] Session persists across page refreshes
- [ ] Session expires after 30 days
- [ ] Accessing protected route without session (401)
- [ ] Accessing admin route as user (403)
- [ ] Accessing editor route as editor (success)
- [ ] Password requirements displayed on signup
- [ ] Onboarding shown after first signup
- [ ] Dark mode login/signup pages

---

## Performance Considerations

### Password Hashing

**Cost**: ~50-100ms per hash/verify operation

**Argon2id Parameters:**

- Memory: 19 MiB (reasonable for server)
- Time: 2 iterations (balanced security/speed)
- Parallelism: 1 (no multi-threading)

**Impact**:

- Login: One verify operation (~50-100ms)
- Signup: One hash operation (~50-100ms)
- Acceptable latency for authentication endpoints

### Session Queries

**Database Queries:**

- Session validation: Single SELECT with expiry filter (indexed)
- Session creation: Single INSERT
- Session deletion: Single DELETE
- Cleanup: Batch DELETE of expired sessions

**Optimization:**

- Index on `sessions.id` (primary key, automatic)
- Index on `sessions.expires_at` for cleanup queries
- Index on `sessions.user_id` for user session queries

### OAuth Flow

**Network Latency:**

- Google OAuth redirect: ~200-500ms
- Token exchange: ~200-500ms
- User info fetch: ~100-300ms
- Total OAuth flow: ~500-1300ms

**Acceptable** as one-time operation per login

---

## Security Best Practices

### Implemented Protections

✅ **Password Security**

- Argon2id hashing (OWASP recommended)
- Salt automatically generated per password
- Strength requirements enforced
- No password stored in plaintext

✅ **Session Security**

- Cryptographically secure session IDs (32 bytes random)
- HttpOnly cookies (prevents XSS attacks)
- Secure flag (HTTPS only in production)
- SameSite=Lax (CSRF protection)
- 30-day expiry (reduces window of compromise)

✅ **OAuth Security**

- PKCE flow (prevents authorization code interception)
- State parameter (CSRF protection)
- 10-minute expiry on state/verifier storage
- Automatic cleanup of expired OAuth data

✅ **Authorization**

- Role-based access control
- Middleware validation on every request
- Explicit permission checks

✅ **Input Validation**

- Email format validation
- Password strength validation
- Zod schema validation on API inputs

### Recommendations

**Production Deployment:**

1. **HTTPS Required**: Set `Secure` cookie flag only works over HTTPS
2. **Environment Variables**: Never commit credentials to repository
3. **Session Cleanup**: Run `cleanupExpiredSessions()` daily via cron job
4. **OAuth State Storage**: Consider Redis for multi-server deployments (currently in-memory Map)
5. **Rate Limiting**: Add rate limiting to login/signup endpoints to prevent brute force
6. **Email Verification**: Consider adding email verification for email/password signups
7. **Two-Factor Authentication**: Future enhancement for high-security accounts

---

## Troubleshooting

### Cannot Login

**Symptom**: "Invalid email or password" error

**Causes:**

1. Incorrect email or password
2. User doesn't exist
3. Password hash verification failure

**Solutions:**

- Verify email is registered
- Reset password if forgotten (not yet implemented)
- Check database for user existence

**Debug Steps:**

```sql
-- Check if user exists
SELECT id, email, name FROM users WHERE email = 'user@example.com';

-- Check if user has password set (vs OAuth-only)
SELECT id, email, hashed_password IS NOT NULL as has_password
FROM users WHERE email = 'user@example.com';
```

### Google OAuth Not Working

**Symptom**: Redirect fails or error after Google authorization

**Causes:**

1. Missing environment variables
2. Incorrect callback URL configuration
3. State verification failure
4. Invalid Google credentials

**Solutions:**

- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- Verify APP_URL matches production domain
- Check Google Console callback URL matches `{APP_URL}/api/auth/callback/google`
- Verify OAuth consent screen configured in Google Console

**Debug Steps:**

```bash
# Check environment variables
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
echo $APP_URL

# Check server logs for OAuth errors
```

### Session Not Persisting

**Symptom**: User logged out immediately after login

**Causes:**

1. Cookie not being set
2. Cookie being blocked by browser
3. Session expiring immediately
4. HTTPS/Secure flag mismatch

**Solutions:**

- Check browser console for cookie warnings
- Verify cookies enabled in browser
- Check Set-Cookie header in network tab
- Verify HTTPS in production (Secure flag requires HTTPS)

**Debug Steps:**

```sql
-- Check if session was created
SELECT * FROM sessions WHERE user_id = 'user-id' ORDER BY created_at DESC LIMIT 1;

-- Check session expiry
SELECT id, expires_at, expires_at > NOW() as is_valid FROM sessions WHERE id = 'session-id';
```

### 401 Unauthorized on Protected Routes

**Symptom**: API returns 401 even when logged in

**Causes:**

1. Session cookie not being sent
2. Session expired
3. Session deleted from database

**Solutions:**

- Check browser sends session cookie in request headers
- Verify session hasn't expired (30-day limit)
- Re-login to create new session

**Verification:**

```typescript
// Check request includes cookie
console.log(request.headers.get("cookie"))

// Manually validate session
const session = await getSession(sessionId)
console.log(session) // Should not be null
```

### 403 Forbidden on Admin Routes

**Symptom**: API returns 403 when accessing admin features

**Causes:**

1. User doesn't have required role
2. User is "user" role trying to access "editor" or "admin" routes

**Solutions:**

- Verify user has correct role in database
- Contact admin to upgrade role if needed

**Debug Steps:**

```sql
-- Check user role
SELECT id, email, role FROM users WHERE id = 'user-id';

-- Expected roles:
-- "user" - default role
-- "editor" - can manage templates
-- "admin" - full access
```

---

## Future Enhancements

**Planned Features:**

- [ ] Email verification for email/password signups
- [ ] Password reset flow (forgot password)
- [ ] Two-factor authentication (2FA)
- [ ] OAuth with additional providers (GitHub, Discord)
- [ ] Session management UI (view/revoke active sessions)
- [ ] Account deletion flow
- [ ] Email change with verification
- [ ] Login history/audit trail
- [ ] Rate limiting on auth endpoints
- [ ] Remember me (extended session) option
- [ ] Magic link authentication (passwordless)
- [ ] Social account linking (link Google to existing account)

---

## AI Agent Maintenance Guidelines

### When to Update This Document

1. **Authentication Method Changes** (Priority: HIGH)
   - New OAuth provider added → Add to capabilities, flows, and API reference
   - Authentication method removed → Remove from all sections
   - Password requirements changed → Update validation rules and UI descriptions

2. **Session Logic Changes** (Priority: HIGH)
   - Session expiry changed → Update SESSION_EXPIRY_DAYS documentation
   - Cookie configuration changed → Update session security section
   - Session storage mechanism changed → Update architecture diagram

3. **Role System Changes** (Priority: HIGH)
   - New role added → Update RBAC section, permission matrix
   - Role permissions changed → Update authorization section
   - Middleware functions changed → Update API reference

4. **Security Changes** (Priority: HIGH)
   - Password hashing algorithm changed → Update password security section
   - OAuth flow modified → Update OAuth flow diagram and steps
   - New security measure added → Add to security best practices

5. **API Changes** (Priority: MEDIUM)
   - New auth endpoint → Add to API reference section
   - Request/response schema changed → Update examples
   - Error messages changed → Update error documentation

### Update Patterns

**When adding new OAuth provider:**

1. Update "Key Capabilities" with provider name
2. Add provider flow to "User Experience" section
3. Add provider implementation details to "Google OAuth Flow" (rename to "OAuth Providers")
4. Add API endpoints to "API Reference"
5. Add environment variables to "Configuration"
6. Update "Change Log"

**When changing session configuration:**

1. Update SESSION_EXPIRY_DAYS value in "Configuration"
2. Update cookie settings in "Session Management"
3. Update "Security Best Practices" if security implications
4. Update "Last Updated" metadata

**When modifying RBAC:**

1. Update role descriptions in "Role-Based Access Control"
2. Update middleware functions in API reference
3. Update permission examples
4. Update troubleshooting for 403 errors
5. Update "Change Log"

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-09 | Complete documentation created from codebase exploration | AI Assistant |
| 2025-12-09 | Documented email/password auth, Google OAuth, sessions, RBAC | AI Assistant |
| 2025-12-09 | Added security best practices and troubleshooting guide | AI Assistant |
