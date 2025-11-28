# Deployment Guide: Vercel + Neon PostgreSQL

This guide walks you through deploying Choose the Heat to Vercel with Neon PostgreSQL for free-tier hosting.

## Overview

- **App Hosting**: Vercel (Serverless)
- **Database**: Neon PostgreSQL
- **Cache**: Not needed initially (app uses PostgreSQL for caching)
- **Total Cost**: $0/month (free tiers)

## How It Works

TanStack Start uses **Nitro** to build for different deployment platforms:

- ✅ **Auto-Detection**: Vercel sets `VERCEL=1` during builds, Nitro detects this and uses the `vercel` preset
- ✅ **Serverless Functions**: Automatically generates `.vercel/output/functions/` for server-side rendering
- ✅ **Static Assets**: Optimized static files in `.vercel/output/static/`
- ✅ **Node.js 22**: Uses the latest Node.js runtime on Vercel

Configuration files already set up:

- [vercel.json](vercel.json) - Ensures devDependencies are installed
- [vite.config.ts](vite.config.ts) - Includes Nitro Vite plugin for Vercel deployment
- [package.json](package.json) - Includes `nitro` package

## Prerequisites

- [Vercel account](https://vercel.com/signup) (free)
- [Neon account](https://neon.tech) (free)
- Your Choose the Heat GitHub repository
- Google OAuth credentials (if using social login)
- AI provider API key (OpenAI, Anthropic, Google, or Mistral)

---

## Part 1: Set Up Neon PostgreSQL

### Step 1: Create Neon Project

1. Go to [neon.tech](https://neon.tech) and sign up/log in
2. Click **Create Project**
3. Configure:
   - **Name**: `choose-the-heat` (or your preferred name)
   - **Region**: Choose closest to your users (e.g., US East, EU West)
   - **PostgreSQL Version**: 16 (latest)
4. Click **Create Project**

### Step 2: Get Database Connection String

1. In your Neon project dashboard, find the **Connection Details** section
2. **IMPORTANT**: Toggle to **Pooled connection** (required for serverless)
3. Copy the connection string - it looks like:

   ```
   postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

4. Save this for later - you'll add it to Vercel as `DATABASE_URL`

### Step 3: Configure Database Settings (Optional)

For production, you may want to:

1. Go to **Settings** → **General**
2. Enable **Auto-suspend**: Database sleeps after 5 minutes of inactivity (saves compute hours)
3. Set **Compute size**: Keep at minimum (0.25 CU) for free tier

> **Note**: Free tier includes 0.5GB storage and 100 compute hours/month. Perfect for testing!

---

## Part 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended for First Time)

#### Step 1: Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your `choose-the-heat` repository from GitHub
   - If not connected, click **Add GitHub Account** and authorize Vercel

#### Step 2: Configure Project

1. **Framework Preset**: Select "Other" (TanStack Start is auto-detected via vercel.json)
2. **Root Directory**: Leave as `.` (root)
3. **Build Command**: `pnpm build` (auto-detected from vercel.json)
4. **Output Directory**: Leave empty (configured in vercel.json)
5. **Install Command**: `pnpm install`
6. **Node.js Version**: 22.x (required by package.json)

#### Step 3: Add Environment Variables

Click **Environment Variables** and add all of the following:

##### Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` | Your Neon pooled connection string from Part 1 |
| `SESSION_SECRET` | Generate new secret | See instructions below |
| `APP_URL` | Leave empty for now | Will update after first deploy |
| `NODE_ENV` | `production` | Tells app to run in production mode |
| `AI_PROVIDER` | `openai` | Or `anthropic`, `google`, `mistral` |

##### Recommended for Testing/Staging

| Variable | Value | Notes |
|----------|-------|-------|
| `SITE_PASSWORD` | `your-test-password` | **Protects site with password** - Testers will see browser login popup |

> **Password Protection**: When `SITE_PASSWORD` is set, the entire site requires authentication via HTTP Basic Auth. Users will see a browser popup asking for credentials (username can be anything, only password matters). This is recommended for staging deployments to prevent public access. Password protection is automatically disabled in development mode.

##### AI Provider (Choose ONE)

**For OpenAI:**

```
OPENAI_API_KEY=sk-...your-key
OPENAI_MODEL=gpt-4-turbo
```

**For Anthropic Claude:**

```
ANTHROPIC_API_KEY=sk-ant-...your-key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

**For Google Gemini:**

```
GOOGLE_GENERATIVE_AI_API_KEY=...your-key
GOOGLE_MODEL=gemini-1.5-pro
```

**For Mistral:**

```
MISTRAL_API_KEY=...your-key
MISTRAL_MODEL=mistral-large-latest
```

##### Optional: Google OAuth

Only add if you want Google social login:

```
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...your-secret
```

##### Generating SESSION_SECRET

**On Linux/Mac/WSL:**

```bash
openssl rand -base64 32
```

**On Windows PowerShell:**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the output and paste as `SESSION_SECRET` value.

#### Step 4: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. Once deployed, you'll get a URL like: `https://choose-the-heat-abc123.vercel.app`

#### Step 5: Update APP_URL

1. Copy your new Vercel deployment URL
2. Go to **Settings** → **Environment Variables**
3. Edit `APP_URL` and set it to your deployment URL (e.g., `https://choose-the-heat-abc123.vercel.app`)
4. Click **Save**
5. Go to **Deployments** → Click **⋯** on latest deployment → **Redeploy**

---

### Option B: Deploy via Vercel CLI

If you prefer command-line deployment:

#### Step 1: Install Vercel CLI

```bash
pnpm add -g vercel
```

#### Step 2: Login

```bash
vercel login
```

#### Step 3: Deploy

```bash
# From your project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? choose-the-heat
# - Directory? ./
# - Override settings? No
```

#### Step 4: Add Environment Variables

```bash
# Add each variable (you'll be prompted for value)
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add NODE_ENV
vercel env add AI_PROVIDER
vercel env add OPENAI_API_KEY
# ... add others as needed
```

#### Step 5: Deploy to Production

```bash
vercel --prod
```

---

## Part 3: Run Database Migrations

Your database needs the schema created before the app will work.

### Option 1: Run Migrations Locally (Recommended)

1. Copy your Neon `DATABASE_URL` from Vercel
2. In your local project, create a temporary `.env` file:

   ```bash
   DATABASE_URL=postgresql://...your-neon-pooled-connection
   ```

3. Run migrations:

   ```bash
   pnpm db:migrate
   ```

4. (Optional) Seed templates:

   ```bash
   pnpm db:seed
   ```

5. Delete the temporary `.env` file

### Option 2: Run Migrations via Vercel Functions

If you prefer to run migrations on Vercel:

1. Add this to `package.json` scripts:

   ```json
   "vercel-build": "pnpm db:migrate && vite build"
   ```

2. Redeploy on Vercel

> **Note**: This runs migrations on every deploy. For production, consider a dedicated migration service.

---

## Part 4: Configure OAuth (If Using Google Login)

If you added `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`:

### Step 1: Update Google OAuth Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add **Authorized redirect URIs**:

   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```

   Replace `your-app.vercel.app` with your actual Vercel URL
4. Click **Save**

### Step 2: Test OAuth Flow

1. Visit your deployed app
2. Click "Sign in with Google"
3. Authorize the app
4. You should be redirected back and logged in

---

## Part 5: Verify Deployment

### Checklist

- [ ] App loads at your Vercel URL
- [ ] Can create an account (email + password)
- [ ] Can log in
- [ ] Can create a story
- [ ] Story generation works (tests AI provider)
- [ ] Google OAuth works (if configured)
- [ ] Database persists data (create story, refresh, still there)

### Common Issues

#### Issue: "Database connection failed"

**Solution**:

- Verify `DATABASE_URL` is the **pooled connection** string from Neon
- Check Neon compute hasn't auto-suspended (should wake up automatically)
- Verify migrations ran successfully

#### Issue: "Session secret not configured"

**Solution**:

- Verify `SESSION_SECRET` is set in Vercel environment variables
- Redeploy after adding environment variables

#### Issue: "Story generation fails"

**Solution**:

- Verify AI provider API key is correct
- Check `AI_PROVIDER` matches your configured provider
- Check Vercel function logs for specific error

#### Issue: "OAuth redirect mismatch"

**Solution**:

- Verify redirect URI in Google Console matches exactly: `https://your-domain.vercel.app/api/auth/callback/google`
- No trailing slash
- Must use HTTPS

#### Issue: "Cold starts / slow first load"

**Expected behavior**:

- First request after inactivity may take 2-3 seconds
- Neon database wakes from suspend (~1-2 seconds)
- Vercel function cold start (~500ms)
- Subsequent requests are fast (<100ms)

---

## Part 6: Custom Domain (Optional)

To use your own domain instead of `*.vercel.app`:

### Step 1: Add Domain in Vercel

1. Go to your project → **Settings** → **Domains**
2. Add your domain (e.g., `choosetheheat.com`)
3. Follow DNS configuration instructions

### Step 2: Update Environment Variables

1. Update `APP_URL` to your custom domain
2. Update Google OAuth redirect URI to use custom domain

### Step 3: Update OAuth

1. Go to Google Cloud Console
2. Add new redirect URI with custom domain:

   ```
   https://choosetheheat.com/api/auth/callback/google
   ```

---

## Monitoring & Limits

### Vercel Free Tier Limits

- ✅ 100GB bandwidth/month
- ✅ 100,000 serverless function invocations/month
- ✅ Unlimited deployments
- ✅ 6,000 build minutes/month

**Estimate**: Supports ~10,000-50,000 page views/month depending on usage

### Neon Free Tier Limits

- ✅ 0.5GB storage
- ✅ 100 compute hours/month
- ✅ 20 projects
- ✅ Auto-suspend after 5 minutes (saves hours)

**Estimate**: 100 hours = ~3 hours/day of active use (plenty for testing)

### Monitoring Usage

**Vercel**:

- Dashboard → Analytics → Usage
- Get alerts when approaching limits

**Neon**:

- Dashboard → Billing → Usage
- Shows storage and compute hours used

---

## Upgrading from Free Tier

When you're ready for more capacity:

### Vercel Pro ($20/month)

- Removes "Hobby" restriction (commercial use allowed)
- 1TB bandwidth
- 1,000,000 function invocations
- Better performance

### Neon Launch ($19/month)

- 10GB storage
- 300 compute hours
- Better performance
- 7-day point-in-time recovery

**Total**: ~$40/month for small production app

---

## Troubleshooting

### View Logs

**Vercel Function Logs**:

1. Go to your project → **Deployments**
2. Click on a deployment
3. Click **Functions** tab
4. View real-time logs

**Neon Query Logs**:

1. Go to Neon dashboard → **Monitoring**
2. View query performance and errors

### Database Connection Test

Run this locally to test Neon connection:

```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="postgresql://..."

# Test connection
pnpm db:migrate
```

If this works but Vercel deployment doesn't, issue is with Vercel environment variables.

---

## Next Steps

- [ ] Set up [Vercel Analytics](https://vercel.com/docs/analytics) for usage insights
- [ ] Configure [Error Tracking](https://vercel.com/docs/observability/error-tracking)
- [ ] Set up [GitHub Integration](https://vercel.com/docs/deployments/git) for auto-deploy on push
- [ ] Add [Preview Deployments](https://vercel.com/docs/deployments/preview-deployments) for pull requests
- [ ] Consider [Upstash Redis](https://upstash.com) if you need caching later (256MB free)

---

## Password Protection for Testers

To protect your staging deployment from public access, you can enable HTTP Basic Authentication:

### How to Enable

1. Go to Vercel dashboard → Your project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `SITE_PASSWORD`
   - **Value**: Your chosen password (e.g., `TestingAccess2025`)
   - **Environment**: Production (or all environments)
3. Click **Save**
4. Redeploy your app (or wait for next auto-deployment)

### How It Works

- **Browser Popup**: When someone visits your site, they'll see a browser login dialog
- **Username**: Can be anything (not checked)
- **Password**: Must match the `SITE_PASSWORD` you set
- **Auto-Disabled in Dev**: Password protection is automatically disabled for local development
- **All Routes Protected**: Every page of your site requires authentication

### Sharing Access with Testers

Send testers:

1. **URL**: `https://choose-the-heat.vercel.app`
2. **Username**: `tester` (or any username)
3. **Password**: The value you set for `SITE_PASSWORD`

### Disabling Password Protection

To remove password protection:

1. Go to Vercel → Settings → Environment Variables
2. Delete the `SITE_PASSWORD` variable
3. Redeploy

> **Note**: This uses HTTP Basic Auth, which is sufficient for staging/testing but not recommended for production apps with real users. For production, implement proper user authentication.

---

## Getting Help

- **Vercel Issues**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Issues**: [neon.tech/docs](https://neon.tech/docs)
- **TanStack Start**: [tanstack.com/start/docs](https://tanstack.com/start/latest)
- **Project Issues**: [GitHub Issues](../../issues)

---

## Security Notes

- ✅ All secrets stored in Vercel environment variables (encrypted)
- ✅ DATABASE_URL never exposed to client (server-side only)
- ✅ Neon enforces SSL connections
- ✅ Vercel provides automatic HTTPS
- ✅ HTTP Basic Auth available for staging (via SITE_PASSWORD)
- ⚠️ Rotate `SESSION_SECRET` if ever compromised
- ⚠️ Rotate AI API keys periodically
- ⚠️ Change `SITE_PASSWORD` if leaked to unauthorized users
