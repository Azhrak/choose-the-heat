# Codebase Refactoring Checklist

**Status**: In Progress
**Started**: 2025-12-22
**Goal**: Full compliance with [.clauderc](../../.clauderc) and [CODING_PRACTICES.md](./CODING_PRACTICES.md)

---

## 📊 Progress Overview

**Total Estimated Effort**: 70-80 hours
**Completed**: ~14 hours (Phase 1 + 2 partially complete)
**Remaining**: ~60 hours

---

## ✅ Completed Work (14 files)

### Phase 1: Problem Pages (5/5) ✅

**Created Components:**

- ✅ `src/components/about/FeatureSection.tsx` - Extracted from about.tsx
- ✅ `src/components/subscription/SubscriptionCard.tsx` - Extracted from subscription.tsx

**Refactored Pages:**

- ✅ `src/routes/contact.tsx` - **CRITICAL FIX**: Raw HTML → FormInput/FormTextarea/Button
  - Added: Header, Footer, PageBackground, PageContainer, Stack layout
  - 34+ inline styles → 0 inline styles
  - Zero raw form inputs
- ✅ `src/routes/about.tsx` - Inline components → Extracted components
  - 24+ inline styles → 0 inline styles
- ✅ `src/routes/subscription.tsx` - Inline components → Extracted components
  - 67+ inline styles → 0 inline styles

### Phase 2: Core Components (9/11) ✅

**Form Components:**

- ✅ `src/components/FormInput.tsx` - Props object + removed `mt-1` margins
- ✅ `src/components/FormTextarea.tsx` - Props object + removed `mt-1` margins
- ✅ `src/components/Button.tsx` - Props object pattern

**UI Components:**

- ✅ `src/components/ui/Card.tsx` - Props object pattern
- ✅ `src/components/ui/Stack.tsx` - Props object pattern
- ✅ `src/components/ui/Alert.tsx` - Props object pattern
- ✅ `src/components/ui/Badge.tsx` - Props object pattern
- ✅ `src/components/ui/Text.tsx` - Props object pattern
- ✅ `src/components/Heading.tsx` - Props object pattern

**Verification:**

- ✅ TypeScript compilation passes
- ✅ All components have JSDoc documentation
- ✅ Zero props destructuring in completed components
- ✅ Zero margin violations in form components

---

## 🚧 Remaining Work

### Phase 2: Layout Components (2/11 remaining)

**Priority**: HIGH | **Effort**: 2-3 hours

**Files to refactor:**

1. `src/components/Header.tsx` - Remove props destructuring
2. `src/components/Footer.tsx` - Remove props destructuring
3. `src/components/PageContainer.tsx` - Remove props destructuring
4. `src/components/PageBackground.tsx` - Remove props destructuring

**Pattern**: Same as UI components - use `props` object, no destructuring at signature

---

### Phase 3: Feature Components

**Priority**: MEDIUM | **Effort**: 20-25 hours

#### Admin Components (~20 files)

**Directory**: `src/components/admin/`

**Files:**

- `AdminLayout.tsx`
- `AdminNav.tsx`
- `DataTable.tsx` (⚠️ Generic component - careful with types)
- `FilterBar.tsx`
- `PaginationControls.tsx`
- `BulkActionsToolbar.tsx`
- `StatCard.tsx`
- `StatusBadge.tsx`
- `RoleBadge.tsx`
- `ConfirmDialog.tsx`
- `NoPermissions.tsx`
- `TropeSelector.tsx`
- `ChoicePointForm.tsx`
- `ChoicePointItem.tsx`
- `ChoicePointOption.tsx`
- `TemplateStatusManager.tsx`
- `TemplatePreview.tsx`
- `APIKeysSettings.tsx`
- `Toast.tsx`
- `ToastContext.tsx`
- `AIGenerationModal.tsx`

**Also check:**

- `src/components/admin/choice-points/` directory

#### Profile Components (~7 files)

**Directory**: `src/components/profile/`

**Files:**

- `ProfileInformation.tsx`
- `PasswordChange.tsx`
- `SubscriptionDisplay.tsx`
- `PreferencesDisplay.tsx`
- `DataDownload.tsx`
- `DangerZone.tsx`
- `DeleteAccountModal.tsx`

#### Preferences Components (~6 files)

**Directory**: `src/components/preferences/`

**Files:**

- `GenresSection.tsx`
- `TropesSection.tsx`
- `SpiceLevelSection.tsx`
- `PacingSection.tsx`
- `SceneLengthSection.tsx`
- `PovCharacterGenderSection.tsx`

#### Story Components (~8 files)

**Files:**

- `src/components/StoryCard.tsx`
- `src/components/NovelCard.tsx`
- `src/components/SceneNavigation.tsx`
- `src/components/StoryProgressBar.tsx`
- `src/components/AudioPlayer.tsx`
- `src/components/StreamingAudioPlayer.tsx`
- `src/components/AudioIndicator.tsx`
- `src/components/AudioGenerationButton.tsx`
- `src/components/BranchConfirmationDialog.tsx`

#### Remaining Utility Components (~15 files)

**Files:**

- `src/components/LoadingSpinner.tsx`
- `src/components/FullPageLoader.tsx`
- `src/components/ErrorMessage.tsx`
- `src/components/EmptyState.tsx`
- `src/components/Checkbox.tsx`
- `src/components/RadioButton.tsx`
- `src/components/RadioButtonGroup.tsx`
- `src/components/FormSelect.tsx`
- `src/components/SpiceLevelSelector.tsx`
- `src/components/TropeFilter.tsx`
- `src/components/Pagination.tsx`
- `src/components/ThemeToggle.tsx`
- `src/components/ThemeProvider.tsx`
- `src/components/GoogleAuthButton.tsx`
- `src/components/CookieConsentBanner.tsx`
- `src/components/DividerWithText.tsx`
- `src/components/AlreadyLoggedInNotice.tsx`

---

### Phase 4: Route Files Audit

**Priority**: MEDIUM | **Effort**: 12-16 hours

**Task**: Verify all 31 route files use props object pattern (no destructuring)

**Directories**: `src/routes/`

**Files to audit:**

- ✅ `index.tsx` - Landing page
- ✅ `about.tsx` - Already refactored
- ✅ `contact.tsx` - Already refactored
- ✅ `subscription.tsx` - Already refactored
- `privacy.tsx`
- `terms.tsx`
- `cookies.tsx`
- `__root.tsx` - Root layout

**Auth routes** (`src/routes/auth/`):

- `login.tsx`
- `signup.tsx`
- `onboarding.tsx`

**User routes**:

- `browse.tsx`
- `library.tsx`
- `profile.tsx`
- `preferences.tsx`
- `template/$id.tsx`

**Story routes** (`src/routes/story/`):

- `create.tsx`
- `$id.read.tsx`
- `$id.info.tsx`

**Admin routes** (`src/routes/admin/`):

- `index.tsx` - Admin dashboard
- `admin.tsx` - Admin layout wrapper
- `templates/index.tsx`
- `templates/new.tsx`
- `templates/$id/edit.tsx`
- `templates/bulk-import.tsx`
- `users/index.tsx`
- `users/$id/edit.tsx`
- `tropes/index.tsx`
- `audit-logs/index.tsx`
- `settings/index.tsx`
- `test.tsx` - Test utilities

**Note**: Most route files may already follow the pattern since they're newer.

---

### Phase 5: Automated Validation

**Priority**: HIGH | **Effort**: 4-6 hours

#### Task 5.1: Create Validation Script

**File**: `scripts/validate-code-standards.js`

**Checks needed:**

1. Props destructuring at function signature
2. Component margin violations (mb-, mt-, mx-, my-)
3. Raw form inputs in routes
4. Missing layout components in routes
5. `any` types

**Integration:**

- Add to `package.json` scripts: `"validate": "node scripts/validate-code-standards.js"`
- Add to pre-commit hook
- Add to CI/CD pipeline

#### Task 5.2: Pre-commit Hook Setup

**File**: `.husky/pre-commit` (create if missing)

Add validation script to pre-commit checks.

---

### Phase 6: Testing & Verification

**Priority**: CRITICAL | **Effort**: 8-10 hours

#### Visual Regression Testing

**Test pages** (light + dark mode):

- ✅ `/contact` - Verify form functionality
- ✅ `/about` - Verify layout
- ✅ `/subscription` - Verify component extraction
- `/browse` - Verify NovelCard still works
- `/library` - Verify StoryCard still works
- `/profile` - Verify all profile components
- `/preferences` - Verify all preference components
- `/admin/*` - Verify all admin pages

#### Functional Testing

**Critical tests:**

1. Contact form submission (all validation scenarios)
2. Subscription tier selection and display
3. Form inputs (all pages with forms)
4. Admin CRUD operations
5. Story creation and reading
6. User profile updates

#### Compilation & Linting

After each phase, run:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm lint:md
```

---

### Phase 7: Documentation Updates

**Priority**: MEDIUM | **Effort**: 3-4 hours

#### Task 7.1: Component Documentation

**Update**: `docs/development/COMPONENT_LIBRARY.md`

Add:

- FeatureSection component
- SubscriptionCard component
- Updated props patterns (all components use props object)
- Spacing patterns (no margins on components)

#### Task 7.2: Feature Documentation

**Create/Update**:

- `docs/features/about-page.md`
- `docs/features/contact-page.md`
- `docs/features/subscription-page.md`

Include component usage and architecture.

#### Task 7.3: Change Log

**Update**: `docs/CHANGELOG.md` (or create)

Document:

- All extracted components
- Props pattern changes
- Margin removal changes
- Breaking changes (if any)

---

## 🔍 Search Patterns for Finding Violations

### Props Destructuring

```bash
# Find all function components with destructured props
grep -rn "^export function \w\+({" src/ --include="*.tsx"
grep -rn "^function \w\+({" src/ --include="*.tsx"

# Example violations to fix:
# BEFORE: export function Card({ children, className }: CardProps)
# AFTER: export function Card(props: CardProps)
```

### Component Margins

```bash
# Find all margin classes in components
grep -rn 'className="[^"]*m[btlrxy]-' src/components --include="*.tsx"

# Specific patterns:
grep -rn 'className="[^"]*mb-' src/components --include="*.tsx"
grep -rn 'className="[^"]*mt-' src/components --include="*.tsx"
```

### Raw Form Inputs

```bash
# Find raw inputs in route files
grep -rn '<input' src/routes --include="*.tsx" | grep -v "FormInput"
grep -rn '<textarea' src/routes --include="*.tsx" | grep -v "FormTextarea"
grep -rn '<button' src/routes --include="*.tsx" | grep -v "Button"
```

### Missing Layout Components

```bash
# Find routes without Header
grep -rL "Header" src/routes/*.tsx

# Find routes without Footer
grep -rL "Footer" src/routes/*.tsx

# Find routes without PageBackground
grep -rL "PageBackground" src/routes/*.tsx
```

### Any Types

```bash
# Find any type usage
grep -rn ': any' src/ --include="*.ts" --include="*.tsx"
grep -rn '<any>' src/ --include="*.ts" --include="*.tsx"
grep -rn 'as any' src/ --include="*.ts" --include="*.tsx"
```

---

## ✅ Success Criteria

### Code Quality

- [ ] Zero props destructuring at function signatures (except hook dependencies)
- [ ] Zero margin classes in reusable components (`src/components/`)
- [ ] Zero raw form inputs in route files (all use FormInput/FormTextarea)
- [ ] All 3 problem pages use Header/Footer/PageBackground/PageContainer ✅
- [ ] Zero inline component definitions in route files ✅
- [ ] Validation script passes with zero violations

### Component Library

- [ ] FeatureSection component extracted and documented ✅
- [ ] SubscriptionCard component extracted and documented ✅
- [ ] All components have JSDoc documentation (14/~90 done)
- [ ] Component library documentation updated

### Testing

- [ ] TypeScript compilation passes ✅
- [ ] Linting passes (`pnpm lint && pnpm lint:md`)
- [ ] All visual regression tests pass (31 routes tested)
- [ ] All functional tests pass (forms, CRUD, navigation)
- [ ] No console errors in browser

### Documentation

- [ ] COMPONENT_LIBRARY.md updated
- [ ] Feature documentation created/updated
- [ ] CHANGELOG.md updated
- [ ] Validation script documented

---

## 📝 Implementation Notes

### Pattern: Props Object (No Destructuring)

```typescript
// ❌ BAD - Destructuring at signature
export function Button({ variant, size, children }: ButtonProps) {
  return <button className={cn(variant, size)}>{children}</button>;
}

// ✅ GOOD - Props object pattern
export function Button(props: ButtonProps) {
  const variant = props.variant || "primary";
  const size = props.size || "md";

  return <button className={cn(variant, size)}>{props.children}</button>;
}

// ✅ ALSO GOOD - Destructure inside function body for HTML props
export function Button(props: ButtonProps) {
  const { variant, size, loading, children, className, disabled, ...buttonProps } = props;

  return <button className={cn(variant, size, className)} {...buttonProps}>
    {children}
  </button>;
}
```

### Pattern: Parent Controls Spacing (No Margins)

```typescript
// ❌ BAD - Component sets its own margin
export function ErrorMessage(props: ErrorMessageProps) {
  return <p className="mt-4 text-red-600">{props.message}</p>;
}

// ✅ GOOD - Parent controls spacing with gap/space-y
export function ErrorMessage(props: ErrorMessageProps) {
  return <p className="text-red-600">{props.message}</p>;
}

// Usage - parent controls spacing:
<div className="space-y-4">
  <input />
  <ErrorMessage message="Error!" />
</div>
```

### Pattern: JSDoc Documentation

```typescript
/**
 * ComponentName - Brief description
 * Follows props object pattern (no destructuring)
 *
 * @param props.propName - Description of prop
 * @param props.anotherProp - Description (default: value)
 */
export function ComponentName(props: ComponentProps) {
  // ...
}
```

---

## 🎯 Priority Order

1. **Phase 2: Layout Components** (4 files) - Quick win, completes Phase 2
2. **Phase 5: Validation Script** - Prevents new violations
3. **Phase 6: Testing** - Verify current changes work
4. **Phase 3: Feature Components** - Systematic refactoring
5. **Phase 4: Route Audits** - Final verification
6. **Phase 7: Documentation** - Clean up and document

---

## 📈 Progress Tracking

Update this document as work progresses:

- ✅ Mark completed tasks
- 📝 Add notes about issues encountered
- 🐛 Track any bugs found during refactoring
- 💡 Note any improvements or optimizations discovered

---

**Last Updated**: 2025-12-22
**Next Milestone**: Complete Phase 2 (4 layout components remaining)
