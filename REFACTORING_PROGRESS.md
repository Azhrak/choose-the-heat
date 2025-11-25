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
- [ ] Replace error pattern in EditTropeModal.tsx
- [ ] Replace error pattern in AddTropeModal.tsx
- [ ] Replace error pattern in PasswordChange.tsx
- [ ] Replace error pattern in ProfileInformation.tsx
- [ ] Replace error pattern in TropeSelector.tsx
- [ ] Replace error pattern in other files

### 2.2. Consolidate Duplicate Trope Modals

- [ ] Create unified `TropeModal.tsx`
- [ ] Update parent components to use TropeModal
- [ ] Delete `AddTropeModal.tsx`
- [ ] Delete `EditTropeModal.tsx`
- [ ] Test add/edit flows thoroughly

### 2.3. Extract Preference Section Wrapper

- [ ] Create `PreferenceSection.tsx` wrapper
- [ ] Refactor GenresSection.tsx
- [ ] Refactor TropesSection.tsx
- [ ] Refactor SpiceLevelSection.tsx
- [ ] Refactor SceneLengthSection.tsx
- [ ] Refactor PovCharacterGenderSection.tsx
- [ ] Refactor PacingSection.tsx

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
**Phase 2**: 0/7 sections complete (0%)
**Phase 3**: 1/2 sections complete (50%)

**Overall Progress**: 5/13 sections (38%)

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
