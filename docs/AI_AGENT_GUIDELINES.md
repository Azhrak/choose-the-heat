# AI Agent Documentation Guidelines

**Purpose**: Instructions for AI coding assistants on maintaining feature documentation when modifying code.

**Last Updated**: 2025-12-09

---

## Core Principle

**When you touch feature code, you MUST update the corresponding feature documentation.**

Every code change that affects user-facing functionality, APIs, architecture, or implementation details requires a documentation update. Keeping docs in sync is not optional—it's part of completing the task.

---

## Quick Reference: Code → Documentation Mapping

| Code Location | Feature Documentation | Update When |
|---------------|----------------------|-------------|
| `src/lib/auth/`, `src/routes/api/auth/` | [features/authentication.md](features/authentication.md) | Auth flows, sessions, OAuth, RBAC changes |
| `src/lib/ai/`, `src/routes/api/scenes/`, `src/routes/api/generate/` | [features/ai-story-generation.md](features/ai-story-generation.md) | AI providers, generation logic, metadata, streaming |
| `src/lib/types/preferences.ts`, `src/routes/api/preferences.ts`, `src/routes/preferences.tsx` | [features/personalization.md](features/personalization.md) | Preference types, validation, UI changes |
| `src/routes/story/`, `src/routes/api/stories/` | [features/story-experience.md](features/story-experience.md) | Story flow, choices, branching, navigation |
| `src/lib/tts/`, `src/routes/api/*/audio*`, `src/components/Audio*.tsx` | [features/text-to-speech.md](features/text-to-speech.md) | TTS providers, audio generation, playback |
| `src/routes/admin/`, `src/routes/api/admin/`, `src/lib/auth/authorization.ts` | [features/admin-dashboard.md](features/admin-dashboard.md) | Admin features, roles, permissions, audit logs |

---

## When to Update Documentation

### 🔴 ALWAYS Update (Critical Changes)

1. **API Changes**
   - New endpoints added
   - Endpoint signatures modified
   - Request/response formats changed
   - Status codes changed

2. **Feature Additions**
   - New user-facing functionality
   - New configuration options
   - New UI components
   - New database tables/columns

3. **Breaking Changes**
   - Removed features
   - Changed behavior
   - Migration required
   - Deprecated functionality

4. **Architecture Changes**
   - New dependencies added
   - Integration patterns changed
   - Data flow modified
   - Provider implementations changed

### 🟡 SHOULD Update (Important Changes)

1. **Implementation Details**
   - Algorithm improvements
   - Performance optimizations
   - Caching strategies
   - Error handling patterns

2. **Configuration**
   - Environment variables added/removed
   - Default values changed
   - Validation rules updated

3. **Security**
   - Authentication changes
   - Authorization updates
   - Security best practices

### 🟢 CONSIDER Updating (Minor Changes)

1. **Bug Fixes** - Update Troubleshooting section if fix addresses documented issue
2. **Code Refactoring** - Update Code Locations if file paths change
3. **Dependency Updates** - Update Dependencies section if major version change

---

## How to Update Documentation

### Step 1: Identify Affected Feature(s)

After making code changes, ask yourself:

- Which user-facing feature does this affect?
- Which feature documentation files need updates?
- Are multiple features affected by this change?

**Example**: Adding a new spice level validation rule affects [features/personalization.md](features/personalization.md)

### Step 2: Read the Current Documentation

```bash
# Read the relevant feature documentation
Read file: docs/features/{feature-name}.md
```

Understand:

- Current documented behavior
- What sections need updates
- What's missing that you just added

### Step 3: Update the Appropriate Sections

Each feature doc has 14 standardized sections. Update the sections affected by your changes:

| Section | Update When | Example Changes |
|---------|-------------|-----------------|
| **Metadata** | Feature status changes, new related features | Change status from Beta to Production |
| **Overview** | New capabilities added | Add bullet point for new feature |
| **User Experience** | UI changes, new components | Document new button or page |
| **Technical Implementation** | Architecture changes | Update data flow diagram |
| **API Reference** | New/modified endpoints | Add new endpoint documentation |
| **Code Locations** | Files moved/renamed | Update file paths |
| **Configuration** | New env vars, settings | Add environment variable docs |
| **Related Features** | New dependencies | Add link to newly integrated feature |
| **Testing** | New test requirements | Add test cases to checklist |
| **Performance** | Optimization changes | Update performance characteristics |
| **Future Enhancements** | Planned features completed | Move from Future to implemented sections |
| **Troubleshooting** | New error cases | Add troubleshooting steps |
| **AI Agent Guidelines** | Maintenance pattern changes | Update when-to-update triggers |
| **Change Log** | Every change | Add entry with date and description |

### Step 4: Follow the Update Triggers

Each section has `<!-- UPDATE TRIGGER -->` comments. These tell you exactly when to update:

```markdown
<!-- UPDATE TRIGGER: Update when new API endpoints are added -->
```

**Search for relevant triggers**:

```bash
# Find update triggers in the feature doc
Grep pattern: "UPDATE TRIGGER.*{your change type}"
```

### Step 5: Update the Change Log

**ALWAYS** add an entry to the Change Log section:

```markdown
## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-09 | Added spice level 6 (scorching) with validation rules | AI Assistant |
| 2025-12-08 | Added preference export endpoint GET /api/preferences/export | AI Assistant |
```

### Step 6: Validate Your Changes

Before marking the task complete:

1. **Check markdown syntax**:

   ```bash
   pnpm lint:md:fix
   ```

2. **Verify cross-references** - If you referenced other features, ensure links are correct

3. **Update "Last Updated"** metadata field

4. **Review completeness** - Did you document all aspects of the change?

---

## Documentation Update Examples

### Example 1: Adding a New API Endpoint

**Code Change**: Added `POST /api/preferences/validate` endpoint

**Documentation Updates Required**:

1. **File**: [features/personalization.md](features/personalization.md)
2. **Sections to Update**:
   - **API Reference** - Add new endpoint with request/response examples
   - **Code Locations** - Add file path if new file created
   - **Change Log** - Add entry with date and description

**Update Process**:

```markdown
## API Reference

### Validate Preferences

**Endpoint**: `POST /api/preferences/validate`

**Description**: Validates user preferences without saving them.

**Request Body**:
```typescript
{
  genres: Genre[]
  tropes: string[]
  spiceLevel: number
  pacing: PacingOption
}
```

**Response**:

```typescript
{
  valid: boolean
  errors?: {
    field: string
    message: string
  }[]
}
```

**Status Codes**:

- `200 OK` - Validation complete (check `valid` field)
- `400 Bad Request` - Invalid request format
- `401 Unauthorized` - Not authenticated

```

### Example 2: Adding a New Feature

**Code Change**: Added story export to PDF feature

**Documentation Updates Required**:

1. **File**: [features/story-experience.md](features/story-experience.md)
2. **Sections to Update**:
   - **Overview > Key Capabilities** - Add "PDF Export" bullet
   - **User Experience** - Document export button and download flow
   - **Technical Implementation** - Add PDF generation architecture
   - **API Reference** - Add `GET /api/stories/:id/export/pdf` endpoint
   - **Code Locations** - Add export-related files
   - **Configuration** - Add any new env vars (e.g., PDF_GENERATION_TIMEOUT)
   - **Dependencies** - Add PDF library (e.g., `pdfmake`)
   - **Testing** - Add export test cases
   - **Future Enhancements** - Remove if "PDF export" was listed
   - **Change Log** - Add entry

### Example 3: Modifying Authentication Flow

**Code Change**: Added 2FA support with TOTP

**Documentation Updates Required**:

1. **File**: [features/authentication.md](features/authentication.md)
2. **Sections to Update**:
   - **Overview > Key Capabilities** - Add "Two-Factor Authentication (TOTP)"
   - **User Experience** - Document 2FA setup and login flow
   - **Technical Implementation** - Add 2FA architecture diagram
   - **API Reference** - Add 2FA endpoints (setup, verify, disable)
   - **Code Locations** - Add 2FA-related files
   - **Configuration** - Add `TOTP_ISSUER` env var
   - **Dependencies** - Add `otplib` or similar
   - **Security** - Update security best practices
   - **Testing** - Add 2FA test scenarios
   - **Troubleshooting** - Add 2FA issues (lost device, sync problems)
   - **Change Log** - Add entry

3. **Related Features**:
   - Update [features/admin-dashboard.md](features/admin-dashboard.md) if 2FA affects admin access
   - Update [features/personalization.md](features/personalization.md) if 2FA is a user preference

---

## Common Mistakes to Avoid

### ❌ Don't Do This

1. **Skipping Documentation**
   ```

   "I'll just make the code change and skip the docs—someone else can update them"

   ```
   **Why Bad**: Docs become stale immediately, causing confusion

2. **Incomplete Updates**
   ```

   "I updated the API Reference but didn't update the Change Log"

   ```
   **Why Bad**: Missing change log makes it hard to track what changed when

3. **Vague Descriptions**
   ```markdown
   | 2025-12-09 | Updated preferences | AI Assistant |
   ```

   **Why Bad**: Doesn't explain what actually changed

4. **Breaking Cross-References**

   ```markdown
   See [Admin System](../technical/ADMIN.md) for details
   ```

   **Why Bad**: File has moved to `features/admin-dashboard.md`

5. **Ignoring Update Triggers**

   ```
   Code change affects API, but you skip updating API Reference section
   ```

   **Why Bad**: The update triggers exist specifically to prevent this

### ✅ Do This Instead

1. **Complete Documentation Updates**

   ```
   "I'll update the feature doc before marking this task complete"
   ```

2. **Update All Relevant Sections**

   ```
   "API Reference updated ✓, Change Log updated ✓, Code Locations verified ✓"
   ```

3. **Descriptive Change Log Entries**

   ```markdown
   | 2025-12-09 | Added spice level 6 (scorching) with validation rules. Updated preference UI to show new level. | AI Assistant |
   ```

4. **Use Correct Paths**

   ```markdown
   See [Admin Dashboard](./admin-dashboard.md) for role configuration
   ```

5. **Follow All Update Triggers**

   ```
   Found 3 UPDATE TRIGGER comments relevant to my change—updated all 3 sections
   ```

---

## Documentation Workflow Checklist

Use this checklist when making code changes:

### Before Making Code Changes

- [ ] Identify which feature(s) will be affected
- [ ] Read current documentation for those features
- [ ] Note which sections will need updates

### While Making Code Changes

- [ ] Keep track of all changes that affect documentation:
  - [ ] New files created
  - [ ] New APIs added
  - [ ] Configuration changes
  - [ ] UI changes
  - [ ] Architecture changes

### After Code Changes (Before Task Completion)

- [ ] Read the feature documentation file(s)
- [ ] Search for relevant UPDATE TRIGGER comments
- [ ] Update all affected sections:
  - [ ] Metadata (if status/related features changed)
  - [ ] Overview (if capabilities changed)
  - [ ] User Experience (if UI/UX changed)
  - [ ] Technical Implementation (if architecture changed)
  - [ ] API Reference (if endpoints changed)
  - [ ] Code Locations (if files moved/added)
  - [ ] Configuration (if env vars changed)
  - [ ] Related Features (if dependencies changed)
  - [ ] Testing (if test requirements changed)
  - [ ] Performance (if characteristics changed)
  - [ ] Future Enhancements (if planned features completed)
  - [ ] Troubleshooting (if new issues addressed)
  - [ ] AI Agent Guidelines (if maintenance changed)
  - [ ] Change Log (ALWAYS)
- [ ] Run `pnpm lint:md:fix` to fix markdown issues
- [ ] Verify all cross-references are correct
- [ ] Update "Last Updated" in metadata

### Task Completion Criteria

A task is NOT complete until:

- ✅ Code changes work as intended
- ✅ Tests pass
- ✅ Documentation is updated
- ✅ Markdown linting passes
- ✅ Change log entry added

---

## Emergency: "I Don't Know Which Feature This Belongs To"

If you're making changes and unsure which feature documentation to update:

1. **Check the Quick Reference table** at the top of this document
2. **Look at file paths**:
   - `src/lib/auth/*` → authentication.md
   - `src/lib/ai/*` → ai-story-generation.md
   - `src/routes/story/*` → story-experience.md
3. **Think about the user**: What feature does the user interact with?
4. **Check Related Features**: Multiple features might need updates
5. **When in doubt**: Update multiple feature docs if the change affects multiple areas

---

## Documentation Template Reference

All feature documentation follows the same 14-section template:

1. **Metadata** - Status, last updated, related features
2. **Overview** - Purpose, key capabilities, use cases
3. **User Experience** - Entry points, UI components, user flows
4. **Technical Implementation** - Architecture, data flow, key components
5. **API Reference** - Endpoints, types, examples
6. **Code Locations** - File paths for key functionality
7. **Configuration** - Environment variables, settings
8. **Dependencies** - External libraries and services
9. **Related Features** - Integration points with other features
10. **Testing** - Test coverage, manual testing checklist
11. **Performance** - Characteristics, caching, optimization
12. **Future Enhancements** - Planned improvements
13. **Troubleshooting** - Common issues and solutions
14. **AI Agent Guidelines** - When and how to update this doc
15. **Change Log** - History of changes

See [FEATURE_DOCUMENTATION_TEMPLATE.md](FEATURE_DOCUMENTATION_TEMPLATE.md) for the complete template.

---

## Special Cases

### Multi-Feature Changes

If your change affects multiple features:

1. Update the primary feature doc (where the main change is)
2. Update secondary feature docs (where integration points change)
3. Add cross-references between the affected features
4. Update "Related Features" metadata in both docs

**Example**: Adding voice selection affects both:

- [features/text-to-speech.md](features/text-to-speech.md) - Primary (voice implementation)
- [features/personalization.md](features/personalization.md) - Secondary (voice preference setting)

### Infrastructure Changes

Changes to infrastructure (database, deployment, CI/CD) may not map to a specific feature:

- **Database migrations**: Update affected feature docs' "Technical Implementation" sections
- **Deployment changes**: Update [getting-started/DEPLOYMENT.md](getting-started/DEPLOYMENT.md)
- **CI/CD**: Update [development/CI_MIGRATIONS.md](development/CI_MIGRATIONS.md)

### Refactoring Without Behavior Change

If you refactor code without changing behavior:

- **File moves**: Update "Code Locations" sections
- **File renames**: Update all references to old file names
- **Internal restructuring**: Usually no documentation update needed unless it affects understanding

---

## Questions?

- **Template**: See [FEATURE_DOCUMENTATION_TEMPLATE.md](FEATURE_DOCUMENTATION_TEMPLATE.md)
- **Reorganization**: See [DOCUMENTATION_REORGANIZATION_PLAN.md](DOCUMENTATION_REORGANIZATION_PLAN.md)
- **Navigation**: See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## For Human Developers

This document is written for AI coding assistants, but human developers should follow the same principles:

- **Keep docs in sync with code** - Documentation debt compounds quickly
- **Update docs in the same PR** - Don't defer documentation to "later"
- **Follow the template** - Consistency makes docs easier to navigate
- **Be thorough** - Future you (and AI assistants) will thank you

---

**Last Updated**: 2025-12-09
**Version**: 1.0
