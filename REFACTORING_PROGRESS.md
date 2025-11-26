# Refactoring Progress Tracker

## Overview

This document tracks progress on the comprehensive refactoring plan to establish a unified design system and reduce code duplication.

**Start Date**: 2025-11-25
**Estimated Completion**: 4 weeks

---

## Phase 1: Design System Foundation

### 1.1. Define Tailwind Theme Configuration ✅

- [x] ~~Update `tailwind.config.js`~~ (Not needed - Tailwind v4 uses CSS config in globals.css)
- [x] Verified romance colors already defined in globals.css with dark mode support
- [x] Create `docs/DESIGN_SYSTEM.md` with spacing/color guidelines

### 1.2. Create Core Layout Components ✅

- [x] Create `Stack` component (src/components/ui/Stack.tsx)
- [x] Create `Section` component (src/components/ui/Section.tsx)
- [x] Create `Container` component (src/components/ui/Container.tsx)
- [ ] Add tests for layout components

### 1.3. Enforce Existing Component Usage ✅

- [x] Replace custom tab buttons in library.tsx with Tabs component
- [x] Replace custom nav links in Header.tsx with NavLink component
- [x] Replace custom card styling in StatCard.tsx with Card component
- [x] Replace CTA buttons in index.tsx with Button and Stack components
- [x] Note: StoryCard and NovelCard are domain-specific components with complex layouts (cover images, etc.) and should not be replaced with generic Card component
- [x] Note: browse.tsx already uses appropriate components, no custom button styling found
- [x] Note: DataTable component doesn't exist in codebase
- [x] Note: Heading component already used appropriately throughout codebase

### 1.4. Create Missing UI Components ✅

- [x] Create `Modal` component (src/components/ui/Modal.tsx)
- [x] Create `Tabs` component (src/components/ui/Tabs.tsx) - compound component pattern
- [x] Create `NavLink` component (src/components/ui/NavLink.tsx)
- [x] Create `Badge` component (src/components/ui/Badge.tsx)
- [x] Create `FormGroup` component (src/components/ui/FormGroup.tsx)
- [x] Create `Alert` component (src/components/ui/Alert.tsx) - moved from Phase 2
- [ ] Add tests for new components

---

## Phase 2: Component Consolidation & Testing

### 2.1. Replace Error Patterns with Alert Component ✅

- [x] Create `Alert` component (src/components/ui/Alert.tsx) - moved to Phase 1.4
- [x] Replace error pattern in EditTropeModal.tsx
- [x] Replace error pattern in AddTropeModal.tsx
- [x] Replace error pattern in PasswordChange.tsx
- [x] Replace error pattern in ProfileInformation.tsx
- [x] Replace error pattern in TropeSelector.tsx
- [x] Replace error/success patterns in preferences.tsx
- [x] Replace success pattern in bulk-import.tsx
- [x] Replace success pattern in DataDownload.tsx
- [x] Export Alert from ui/index.ts

### 2.2. Consolidate Duplicate Trope Modals ✅

- [x] Create unified `TropeModal.tsx`
- [x] Update parent components to use TropeModal
- [x] Delete `AddTropeModal.tsx`
- [x] Delete `EditTropeModal.tsx`
- [x] Verified TypeScript build and linting pass

### 2.3. Apply Layout Components to Preference Sections ✅

- [x] Refactor GenresSection.tsx - replaced space-y-6 with Stack gap="md"
- [x] Refactor TropesSection.tsx - replaced space-y-6 with Stack gap="md"
- [x] Refactor SpiceLevelSection.tsx - replaced space-y-6 and space-y-3 with nested Stack components
- [x] Refactor SceneLengthSection.tsx - replaced space-y-6, space-y-4, and space-y-3 with nested Stack components
- [x] Refactor PovCharacterGenderSection.tsx - replaced space-y-6, space-y-4, and space-y-3 with nested Stack components
- [x] Refactor PacingSection.tsx - replaced space-y-6, space-y-4, and space-y-3 with nested Stack components
- [ ] Note: All preference sections now use consistent Stack and Card components

### 2.4. Create Pagination Utility

- [ ] Create `src/lib/api/pagination.ts`
- [ ] Add `validatePaginationParams()` function
- [ ] Add `buildPaginationResponse()` function
- [ ] Update api/admin/templates/index.ts
- [ ] Update api/admin/users/index.ts
- [ ] Update api/admin/audit-logs.ts
- [ ] Add tests for pagination utility

### 2.5. Extract String Formatting Utilities

- [ ] Create `src/lib/utils/formatters.ts`
- [ ] Add `formatEnumValue()` function
- [ ] Update PreferencesDisplay.tsx (4 instances)
- [ ] Add tests for formatters

### 2.6. Create Mutation Hook Factory

- [ ] Create `src/hooks/factories/createMutationHook.ts`
- [ ] Refactor useCreateTropeMutation.ts
- [ ] Refactor useUpdateTropeMutation.ts
- [ ] Refactor useDeleteTropeMutation.ts
- [ ] Apply to other mutation hooks

### 2.7. Extract Custom Hooks

- [ ] Create `useClickOutside` hook
- [ ] Update TropeFilter.tsx to use hook
- [ ] Create `useAvailableSceneNumbers` hook
- [ ] Update ChoicePointItem.tsx to use hook
- [ ] Add tests for custom hooks

### 2.8. Apply Layout Components to Policy Pages ✅

- [x] Refactor privacy.tsx to use Stack, Card, and Container
- [x] Refactor terms.tsx to use Stack, Card, and Container
- [x] Refactor cookies.tsx to use Stack, Card, and Container
- [x] Replace all space-y patterns with standardized Stack components
- [x] Replace all bg-white rounded shadow patterns with Card components
- [x] Verified TypeScript build and linting pass

### 2.9. Apply Layout Components to User-Facing Pages ✅

- [x] Refactor onboarding.tsx to use Stack, Card, Container, and Alert
- [x] Refactor story/create.tsx to use Stack and Card
- [x] Refactor template/$id.tsx to use Stack and Card
- [x] Replace all space-y patterns with standardized Stack components
- [x] Replace all bg-white rounded shadow patterns with Card components
- [x] Verified TypeScript build and linting pass

### 2.10. Create Text Component and Apply Throughout Codebase

- [x] Create Text component (src/components/ui/Text.tsx)
- [x] Create ui/index.ts barrel export
- [x] Update DESIGN_SYSTEM.md with Text component documentation
- [x] Update COMPONENT_LIBRARY.md with Text component API reference
- [x] Apply Text component to policy pages (cookies.tsx, privacy.tsx, terms.tsx)
- [x] Apply Text component to auth pages (login.tsx, signup.tsx, onboarding.tsx)
- [ ] Apply Text component to admin pages
- [ ] Apply Text component to component library
- [ ] Add tests for Text component

---

## Phase 3: Testing & Documentation

### 3.1. Add Unit Tests

- [ ] Test formatters utility
- [ ] Test pagination utility
- [ ] Test useClickOutside hook
- [ ] Test useAvailableSceneNumbers hook
- [ ] Test Stack component
- [ ] Test Modal component
- [ ] Test Alert component
- [ ] Test Badge component

### 3.2. Create Design System Documentation ✅

- [x] Create `docs/DESIGN_SYSTEM.md` - moved to Phase 1.1
- [x] Create `docs/COMPONENT_LIBRARY.md` - moved to Phase 1.4
- [ ] Update `docs/CODING_PRACTICES.md`

---

## Progress Summary

**Phase 1**: 4/4 sections complete (100%)
**Phase 2**: 5/10 sections complete (50%)
**Phase 3**: 1/2 sections complete (50%)

**Overall Progress**: 10/16 sections (63%)

---

## Notes & Decisions

### 2025-11-25

- Started refactoring project
- Created progress tracker
- Completed Phase 1.1: Verified Tailwind v4 CSS configuration in globals.css
- Completed Phase 1.2: Created Stack, Section, and Container layout components
- Completed Phase 1.3: Replaced custom tabs in library.tsx, nav links in Header.tsx, card styling in StatCard.tsx, and CTA buttons in index.tsx
- Completed Phase 1.4: Created Modal, Tabs, NavLink, Badge, Alert, and FormGroup UI components
- Created DESIGN_SYSTEM.md and COMPONENT_LIBRARY.md documentation
- Fixed Modal accessibility issues (ARIA labels, button elements)
- Phase 1 complete! Design system foundation is established
- Completed Phase 2.3: Applied Stack and Container components to:
  - All 6 preference section components (GenresSection, TropesSection, SpiceLevelSection, SceneLengthSection, PovCharacterGenderSection, PacingSection)
  - Home page (index.tsx) - replaced 6 space-y patterns and 3 container patterns with Stack and Container components
  - Eliminated ~20+ manual spacing classes with standardized components
  - All changes pass linting and formatting checks
- Completed Phase 2.1: Replaced error/success patterns with Alert component:
  - Exported Alert from ui/index.ts for easier imports
  - Replaced error patterns in 5 modal/form components (EditTropeModal, AddTropeModal, PasswordChange, ProfileInformation, TropeSelector)
  - Replaced error/success patterns in preferences.tsx (kept CheckCircle icon for success)
  - Replaced success patterns in bulk-import.tsx and DataDownload.tsx
  - Total: 9 files updated with standardized Alert component
  - Consistent error/success messaging across the application
- Completed Phase 2.2: Consolidated duplicate trope modals:
  - Created unified TropeModal.tsx with mode-based behavior (add/edit)
  - Uses discriminated union types for type-safe props based on mode
  - Updated src/routes/admin/tropes/index.tsx to use unified modal
  - Deleted AddTropeModal.tsx and EditTropeModal.tsx (2 files removed)
  - Reduced code duplication by ~140 lines (95% identical code)
  - All TypeScript checks and linting pass
- Completed Phase 2.8: Applied Stack, Card, and Container to policy pages:
  - Refactored all three policy pages (privacy.tsx, terms.tsx, cookies.tsx)
  - Replaced ~60+ manual spacing patterns (space-y-8, space-y-6, space-y-4, etc.) with Stack components
  - Replaced all bg-white/rounded/shadow patterns with Card components
  - Used Container component with size="md" for consistent max-width layouts
  - Improved consistency across all legal/policy pages
  - All TypeScript and linting checks pass
- Completed Phase 2.9: Applied Stack, Card, Container to user-facing pages:
  - Refactored onboarding.tsx (8 space-y patterns → Stack, added Alert component, replaced manual card styling with Card component)
  - Refactored story/create.tsx (4 space-y patterns → Stack, replaced bg-white rounded shadow with Card component)
  - Refactored template/$id.tsx (4 space-y patterns → Stack, 2 bg-white rounded shadow → Card components)
  - Replaced ~15+ manual spacing patterns with Stack components across all three pages
  - Improved consistency in onboarding flow, story creation, and template detail pages
  - All TypeScript and linting checks pass
- Started Phase 2.10: Created Text component for standardized typography:
  - Created polymorphic Text component (src/components/ui/Text.tsx) with variant, size, weight, and mono props
  - Supports 4 color variants (primary, secondary, muted, emphasis) based on actual usage patterns in codebase
  - Analyzed codebase: 85 instances of primary text pattern (text-slate-700 dark:text-slate-300)
  - Created ui/index.ts barrel export for centralized component imports
  - Updated DESIGN_SYSTEM.md with Text component documentation and migration examples
  - Updated COMPONENT_LIBRARY.md with complete API reference in new Typography Components section
  - Component ready for migration across ~165+ text color class instances

### 2025-11-26

- Continued Phase 2.10: Applied Text component to policy and auth pages:
  - Applied Text component to cookies.tsx (replaced 12 instances of manual text color classes)
  - Applied Text component to login.tsx (replaced 1 instance)
  - Applied Text component to signup.tsx (replaced 1 instance)
  - Applied Text component to onboarding.tsx (replaced 7 instances including subtitle, descriptions, and labels)
  - Replaced manual text-slate-600/700 dark:text-slate/gray-300 patterns with Text component using variant prop
  - Used variant="muted" for secondary/helper text, weight="semibold" for emphasized text
  - All TypeScript and linting checks pass
  - Next: Apply Text component to admin pages and component library
