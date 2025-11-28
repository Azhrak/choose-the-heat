# Database Migrations CI Pipeline

This project uses GitHub Actions to automatically run database migrations when changes are pushed or merged to the `main` branch.

## How It Works

The CI pipeline consists of two jobs:

### 1. Check Migration Files

**Runs on:** Push to `main` and Pull Requests

This job validates migration files to ensure they follow best practices:

- Detects if any migration files were added or modified
- Validates that migration file names follow the convention: `###_description.ts` (e.g., `001_initial_schema.ts`)
- Runs TypeScript compilation to catch syntax errors in migration files

### 2. Run Database Migrations

**Runs on:** Push to `main` only (not on PRs)

This job automatically runs pending migrations against your production database:

- Installs dependencies
- Executes `pnpm db:migrate` to run all pending migrations
- Fails the workflow if migrations encounter errors

## Setup Requirements

### 1. Add Database URL Secret

You must add your production database URL as a GitHub secret:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `DATABASE_URL`
5. Value: Your production PostgreSQL connection string (e.g., `postgresql://user:password@host:5432/database`)

### 2. Database Permissions

Ensure the database user has permissions to:

- Create/modify tables
- Read/write to the migrations table
- Execute DDL statements

## Migration Best Practices

### File Naming Convention

Migration files must follow this pattern:

```
###_description.ts
```

Examples:

- ✅ `001_initial_schema.ts`
- ✅ `002_add_users_table.ts`
- ✅ `010_add_story_metadata.ts`
- ❌ `add_users.ts` (missing number prefix)
- ❌ `1_users.ts` (number should be 3 digits)

### Creating New Migrations

1. Create a new file in `src/lib/db/migrations/` with the next sequential number
2. Follow the existing migration structure:

```typescript
import type { Kysely } from "kysely";

/**
 * Migration ###: Description of changes
 * Date: YYYY-MM-DD
 */

export async function up(db: Kysely<any>): Promise<void> {
  // Your migration code here
}

export async function down(db: Kysely<any>): Promise<void> {
  // Optional: Rollback logic
}
```

3. Test locally first:

```bash
pnpm db:migrate
```

4. Commit and push to trigger CI

### Workflow Triggers

The workflow runs on:

- **Push to main**: Runs both validation and migration
- **Pull requests to main**: Runs validation only (no database changes)

This ensures migrations are validated before merging, but only applied when code reaches `main`.

## Troubleshooting

### Migration Fails in CI

1. Check the GitHub Actions logs for error messages
2. Common issues:
   - **Connection error**: Verify `DATABASE_URL` secret is correct
   - **Permission denied**: Check database user permissions
   - **Syntax error**: Run `pnpm db:migrate` locally first
   - **Migration conflict**: Another migration may have run concurrently

### Testing Migrations Locally

Before pushing:

```bash
# Test migration
pnpm db:migrate

# Regenerate types if schema changed
pnpm db:codegen

# Run tests to verify
pnpm test
```

### Skipping CI

If you need to push without running migrations (e.g., documentation only):

```bash
git commit -m "docs: update README [skip ci]"
```

## Manual Migration

If CI fails and you need to run migrations manually:

```bash
# SSH to your server or connect to production database
# Then run:
pnpm db:migrate
```

## Monitoring

After each deployment:

1. Check the GitHub Actions tab for workflow status
2. Review the migration logs for any warnings
3. Verify application health after migration completes

## Security Notes

- Never commit database credentials to the repository
- Always use GitHub Secrets for sensitive values
- Limit database user permissions to minimum required
- Test migrations thoroughly in staging before production
- Consider using separate database users for CI vs application

## Rollback Strategy

If a migration causes issues:

1. **Option A - Revert the commit**:

   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Option B - Manual rollback**:
   - Implement `down()` functions in migrations
   - Connect to database and manually revert changes
   - Remove migration record from migrations table

3. **Option C - Hotfix forward**:
   - Create a new migration to fix the issue
   - Push to main to apply the fix

## Related Files

- Workflow: `.github/workflows/database-migrations.yml`
- Migration script: `src/lib/db/migrate.ts`
- Migrations: `src/lib/db/migrations/`
- Package scripts: `package.json` (`db:migrate`, `db:codegen`)
