# Database Migrations Guide

This guide explains how to manage database migrations for Choose the Heat, with specific instructions for production deployment on Vercel + Neon.

## Overview

Choose the Heat uses [Kysely](https://kysely.dev/) for type-safe database queries and migrations. Migrations are TypeScript files that define schema changes.

## Migration Files

Migrations are located in: [src/lib/db/migrations/](../src/lib/db/migrations/)

Current migrations:

- `001_initial.ts` - Initial schema (users, stories, scenes, templates, sessions)
- `002_add_story_title.ts` - Add title field to stories
- `003_add_scene_metadata.ts` - Add metadata to scenes

## Running Migrations

### Local Development

Run migrations against your local PostgreSQL:

```bash
# Make sure DATABASE_URL is set in .env
pnpm db:migrate
```

### Production (Vercel + Neon)

You have two options for running migrations in production:

---

## Option 1: Run Locally Against Neon (Recommended)

This is the safest and most straightforward approach.

### Step 1: Get Neon Connection String

1. Go to [Neon dashboard](https://console.neon.tech)
2. Select your project
3. Copy the **Pooled connection** string from Connection Details

### Step 2: Set Environment Variable Temporarily

**On Linux/Mac/WSL:**

```bash
export DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

**On Windows PowerShell:**

```powershell
$env:DATABASE_URL = "postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

**On Windows CMD:**

```cmd
set DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### Step 3: Run Migrations

```bash
pnpm db:migrate
```

You should see:

```
✅ Migration "001_initial" was executed successfully
✅ Migration "002_add_story_title" was executed successfully
✅ Migration "003_add_scene_metadata" was executed successfully
✅ All migrations executed successfully
```

### Step 4: Verify

Check that tables were created:

```bash
# Using psql (if installed)
psql "$DATABASE_URL" -c "\dt"

# Or use Neon's built-in SQL Editor:
# Go to Neon dashboard → SQL Editor → Run: SELECT * FROM kysely_migration
```

### Step 5: Clean Up

Clear the environment variable:

**Linux/Mac/WSL:**

```bash
unset DATABASE_URL
```

**Windows PowerShell:**

```powershell
Remove-Item Env:\DATABASE_URL
```

**Windows CMD:**

```cmd
set DATABASE_URL=
```

---

## Option 2: Run During Vercel Build

Automatically run migrations on every deployment.

### ⚠️ Warnings

- Migrations run on every deploy (even if already applied)
- Build fails if migration fails
- May cause issues with concurrent deploys
- **Not recommended for production apps with traffic**

### Setup

Add a `vercel-build` script to [package.json](../package.json):

```json
{
  "scripts": {
    "vercel-build": "pnpm db:migrate && pnpm build"
  }
}
```

Vercel will automatically use `vercel-build` if it exists.

### How It Works

1. Vercel starts build
2. Runs `pnpm db:migrate`
3. Kysely checks which migrations have run (via `kysely_migration` table)
4. Applies any new migrations
5. Runs `pnpm build`
6. Deploys the app

### When to Use

✅ Good for:

- Initial deployment
- Development/staging environments
- Solo projects with no traffic during deploys

❌ Avoid for:

- Production apps with users
- Apps with multiple concurrent deployments
- Migrations that take >30 seconds

---

## Option 3: Dedicated Migration Script (Advanced)

For production apps, run migrations separately from deployments.

### Setup

Create a dedicated Vercel project for migrations:

1. Create `migrate-production.sh`:

   ```bash
   #!/bin/bash
   export DATABASE_URL=$PRODUCTION_DATABASE_URL
   pnpm db:migrate
   ```

2. Make it executable:

   ```bash
   chmod +x migrate-production.sh
   ```

3. Run before deployment:

   ```bash
   ./migrate-production.sh
   vercel --prod
   ```

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: pnpm db:migrate

  deploy:
    needs: migrate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Creating New Migrations

### Step 1: Create Migration File

Create a new file in `src/lib/db/migrations/`:

```bash
# Format: XXX_description.ts
# Example: 004_add_user_preferences.ts
```

### Step 2: Write Migration

Use Kysely's schema builder:

```typescript
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Add new table
  await db.schema
    .createTable('user_preferences')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('theme', 'text', (col) => col.notNull().defaultTo('light'))
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute()

  // Add index
  await db.schema
    .createIndex('user_preferences_user_id_idx')
    .on('user_preferences')
    .column('user_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // Rollback changes
  await db.schema.dropTable('user_preferences').execute()
}
```

### Step 3: Test Locally

```bash
# Run migration
pnpm db:migrate

# Regenerate types
pnpm db:codegen

# Verify in your app
```

### Step 4: Commit and Deploy

```bash
git add src/lib/db/migrations/004_add_user_preferences.ts
git commit -m "feat: Add user preferences table"
git push
```

If using Option 1 (recommended), manually run migration after push:

```bash
export DATABASE_URL="..."
pnpm db:migrate
```

---

## Troubleshooting

### Error: "Database connection failed"

**Cause**: Cannot connect to Neon database

**Solutions**:

1. Verify `DATABASE_URL` is correct
2. Check you're using the **pooled connection** string
3. Verify Neon database is not suspended (it auto-wakes, but takes ~1-2 seconds)
4. Check firewall/network allows PostgreSQL connections

```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT version();"
```

### Error: "Migration already executed"

**Cause**: Trying to run a migration that's already been applied

**Solution**: This is actually normal! Kysely tracks which migrations have run in the `kysely_migration` table. It will skip migrations that are already applied.

To see migration status:

```bash
psql "$DATABASE_URL" -c "SELECT * FROM kysely_migration;"
```

### Error: "Module not found: kysely"

**Cause**: Dependencies not installed

**Solution**:

```bash
pnpm install
```

### Error: "Cannot find module 'node:fs'"

**Cause**: Node.js version is too old

**Solution**: Upgrade to Node.js 22+:

```bash
node --version  # Should be >= 22.0.0

# Using nvm
nvm install 22
nvm use 22
```

### Migration Failed Midway

**Cause**: Error during migration execution (e.g., syntax error, constraint violation)

**Solution**:

1. Check error message for specific cause
2. Fix the migration file
3. Manually rollback if needed:

   ```sql
   -- Connect to database
   psql "$DATABASE_URL"

   -- Check migration status
   SELECT * FROM kysely_migration ORDER BY executed_at DESC;

   -- If migration is marked as executed but failed, delete the record
   DELETE FROM kysely_migration WHERE migration_name = '004_bad_migration';

   -- Manually undo any partial changes
   -- (depends on what the migration was doing)
   ```

4. Run migration again after fix

---

## Migration Best Practices

### ✅ Do's

- **Write reversible migrations**: Always implement `down()` for rollbacks
- **Test locally first**: Run against local database before production
- **Keep migrations small**: One logical change per migration
- **Use transactions**: Kysely migrations are automatically transactional
- **Add indexes**: For foreign keys and frequently queried columns
- **Document complex changes**: Add comments explaining non-obvious changes

### ❌ Don'ts

- **Don't edit existing migrations**: Once deployed, never modify a migration that's been run in production
- **Don't delete migrations**: Old migrations are part of your schema history
- **Don't skip migrations**: Run all migrations in order
- **Avoid data migrations in schema migrations**: Separate data changes from schema changes when possible
- **Don't use `CASCADE` lightly**: Be explicit about deletion behavior

---

## Database Schema Regeneration

After running migrations, regenerate TypeScript types:

```bash
pnpm db:codegen
```

This updates [src/lib/db/types.ts](../src/lib/db/types.ts) with the current schema, giving you type-safe queries.

**When to run**:

- After creating/running new migrations
- After manually altering the database schema
- When types seem out of sync with database

---

## Migration Checklist for Production

Before running migrations on production:

- [ ] Migration tested locally
- [ ] Types regenerated (`pnpm db:codegen`)
- [ ] App tested with new schema locally
- [ ] Migration reviewed (breaking changes?)
- [ ] Backup plan ready (rollback strategy)
- [ ] Database backup taken (Neon does this automatically, but verify)
- [ ] Decided on migration strategy (Option 1, 2, or 3)
- [ ] App deployment strategy decided (before/after migration?)

---

## Rollback Strategy

If a migration causes issues:

### Option 1: Rollback via down() function

**Not currently supported by the migration script**, but you can manually implement:

```typescript
// In a separate script
import { Kysely } from 'kysely'
import { down } from './src/lib/db/migrations/004_problem_migration.ts'

const db = new Kysely<any>({ /* config */ })
await down(db)
```

### Option 2: Manual SQL Rollback

```bash
# Connect to database
psql "$DATABASE_URL"

# Manually reverse changes
DROP TABLE user_preferences;

# Remove migration record
DELETE FROM kysely_migration WHERE migration_name = '004_add_user_preferences';
```

### Option 3: Restore from Backup

Neon provides point-in-time recovery:

1. Go to Neon dashboard → **Restore**
2. Select restore point (before migration)
3. Create new branch from restore point
4. Update `DATABASE_URL` to point to restored branch

---

## Monitoring Migrations

### Check Migration Status

```bash
# Via psql
psql "$DATABASE_URL" -c "SELECT * FROM kysely_migration ORDER BY executed_at DESC;"

# Via Neon SQL Editor
# Go to dashboard → SQL Editor
# Run: SELECT * FROM kysely_migration ORDER BY executed_at DESC;
```

### Migration Table Schema

```sql
CREATE TABLE kysely_migration (
  name VARCHAR(255) PRIMARY KEY,
  timestamp VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## Additional Resources

- [Kysely Documentation](https://kysely.dev/)
- [Kysely Migrations Guide](https://kysely.dev/docs/migrations)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Schema Design](https://www.postgresql.org/docs/current/ddl.html)

---

## Questions?

For issues or questions:

- Check [GitHub Issues](../../issues)
- Review [Deployment Guide](../DEPLOYMENT.md)
- Check Kysely docs for migration syntax
