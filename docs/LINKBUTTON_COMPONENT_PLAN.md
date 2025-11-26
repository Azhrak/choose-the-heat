# LinkButton Component Plan

## Status: ✅ COMPLETED

All planned refactoring has been successfully implemented!

## Overview

A reusable component that combines TanStack Router's `Link` functionality with Button-like styling. This eliminates the need for custom inline styling on Link components that are styled as buttons throughout the application.

## Implementation Status

### ✅ Component Created
- **Location**: `src/components/ui/LinkButton.tsx`
- **Status**: Fully implemented with all variants and sizes
- **Documentation**: Added to `docs/COMPONENT_LIBRARY.md`

### ✅ Files Refactored

All originally identified files have been successfully refactored:

1. ✅ **PreferencesDisplay.tsx** (lines 28, 150)
   - Using `LinkButton` with `variant="primary"` for "Set Up Preferences"
   - Using `LinkButton` with `variant="outline"` for "Update Preferences"

2. ✅ **EmptyState.tsx** (line 37)
   - Using `LinkButton` with `variant="primary"` for action links

3. ✅ **template/$id.tsx** (lines 54, 126, 199)
   - Using `LinkButton` for "Return to Browse"
   - Using `LinkButton` with `size="lg"` for "Start Your Story" CTAs

4. ✅ **story/$id.read.tsx** (lines 228, 266, 281, 572)
   - Using `LinkButton` with `variant="secondary"` and `variant="ghost"` for navigation
   - All back links and info links refactored

5. ✅ **story/$id.info.tsx** (lines 163, 296)
   - Using `LinkButton` with `variant="ghost"` for "Back to Library"
   - Using `LinkButton` with `variant="primary"` for "Continue Reading"/"Read Again"

6. ✅ **preferences.tsx** (lines 154, 218)
   - Using `LinkButton` with `variant="ghost"` for "Back to Profile"
   - Using `LinkButton` with `variant="outline"` for "Cancel"

### Original Problem (Now Solved)

We had multiple instances where `Link` components were styled as buttons with inline classNames - all have been refactored to use the `LinkButton` component.

## Component Design

### API Design

```tsx
interface LinkButtonProps {
  // TanStack Router props
  to: string;
  search?: Record<string, unknown>;
  params?: Record<string, string>;
  
  // Button styling props (matching existing Button component)
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  
  // Additional customization
  className?: string;
  children: ReactNode;
  
  // Accessibility
  title?: string;
  'aria-label'?: string;
}
```

### Variant Styles

Should match the existing `Button` component exactly:

- **primary**: `bg-romance-600 text-white hover:bg-romance-700`
- **secondary**: `bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-gray-600`
- **outline**: `border-2 border-romance-600 dark:border-romance-400 text-romance-600 dark:text-romance-400 hover:bg-romance-50 dark:hover:bg-romance-900/20`
- **danger**: `bg-red-600 text-white hover:bg-red-700`
- **ghost**: `text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700`

### Size Classes

Should match the existing `Button` component:

- **sm**: `px-4 py-2 text-sm`
- **md**: `px-6 py-3`
- **lg**: `px-8 py-4 text-lg`

### Base Classes

```tsx
"rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
```

## Implementation Location

Create at: `src/components/ui/LinkButton.tsx`

## Usage Examples

### Before (PreferencesDisplay.tsx)

```tsx
<Link
  to="/preferences"
  className="inline-flex items-center px-6 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors"
>
  Set Up Preferences
</Link>
```

### After

```tsx
<LinkButton
  to="/preferences"
  variant="primary"
>
  Set Up Preferences
</LinkButton>
```

### With Icons

```tsx
<LinkButton
  to="/story/create"
  search={{ templateId: template.id }}
  variant="primary"
  size="lg"
>
  <Heart className="w-5 h-5" fill="currentColor" />
  Start Your Story
</LinkButton>
```

## Refactoring Opportunities

### High Priority (Clear Button Styling)

1. **PreferencesDisplay.tsx**
   - Line 28-33: "Set Up Preferences" → primary variant
   - Line 153-158: "Update Preferences" → outline variant

2. **EmptyState.tsx**
   - Line 41-43: action.label → primary variant

3. **template/$id.tsx**
   - Line 66-71: "Return to Browse" → primary variant
   - Line 135-140: "Start Your Story" → primary variant, lg size
   - Line 174-179: "Start Your Story" (bottom CTA) → primary variant, lg size

4. **story/$id.read.tsx**
   - Line 565-571: "Back to Library" → outline variant

5. **story/$id.info.tsx**
   - Line 361-367: "Continue Reading" / "Read Again" → primary variant

6. **preferences.tsx**
   - Line 186-190: "Cancel" → secondary/outline variant

### Medium Priority (Navigation Links)

These have simpler styling but could benefit from consistency:

1. **story/$id.info.tsx**
   - Line 179-183: Back to Library link → could use ghost variant with icon

2. **preferences.tsx**
   - Line 159-164: Back to Profile link → could use ghost variant

### Low Priority (Consider, but may not need)

1. **index.tsx** - Already using optimal pattern (Link wrapping Button)
2. **auth/login.tsx**, **auth/signup.tsx** - Text links, not button-styled

## Benefits

1. **Consistency**: All button-styled links use the same component with same variants
2. **Maintainability**: Changes to button styles propagate automatically
3. **Type Safety**: TanStack Router's typed routes work seamlessly
4. **Accessibility**: Consistent focus states and aria attributes
5. **Dark Mode**: Automatic dark mode support matching Button component
6. **DRY**: Eliminates ~200+ lines of duplicate className strings

## Testing Considerations

- Verify all TanStack Router features work (to, search, params)
- Test keyboard navigation and focus states
- Verify dark mode styling
- Check responsive behavior on mobile
- Ensure icons render correctly inside LinkButton
- Test with loading/disabled states if needed in future

## Future Enhancements

Potential additions if needed:

1. **Loading state**: Add spinner like Button component
2. **Disabled state**: Visual indication when link should be inactive
3. **Icon positions**: `iconPosition?: 'left' | 'right'` prop
4. **Full width**: `fullWidth?: boolean` prop for mobile layouts

## Component Library Documentation

After implementation, add to `docs/COMPONENT_LIBRARY.md`:

```markdown
### LinkButton

Navigation link styled as a button, combining TanStack Router's Link with Button styling.

**Props:**

\`\`\`tsx
interface LinkButtonProps {
  to: string;
  search?: Record<string, unknown>;
  params?: Record<string, string>;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}
\`\`\`

**Usage:**

\`\`\`tsx
<LinkButton to="/browse" variant="primary" size="md">
  Browse Stories
</LinkButton>

<LinkButton to="/preferences" variant="outline">
  <Settings className="w-5 h-5" />
  Update Preferences
</LinkButton>
\`\`\`

**When to use:**
- Navigation that looks like a button (CTAs, actions)
- Consistent with Button component styling

**When not to use:**
- Text links in paragraphs or navigation menus
- Use regular `<Link>` for simple text links
- Use `<Button>` with `onClick` for non-navigation actions
```

## Migration Strategy

1. **Create LinkButton component** with full test coverage
2. **Update one file at a time** to avoid merge conflicts
3. **Test each page** after refactoring
4. **Document in COMPONENT_LIBRARY.md**
5. **Add to component usage guide** for future development

## Files to Refactor (In Order)

1. `src/components/ui/LinkButton.tsx` - Create new component
2. `src/components/EmptyState.tsx` - Simple, single usage
3. `src/components/profile/PreferencesDisplay.tsx` - Two clear usages
4. `src/routes/template/$id.tsx` - Three usages, all primary CTAs
5. `src/routes/story/$id.read.tsx` - One usage
6. `src/routes/story/$id.info.tsx` - Two usages
7. `src/routes/preferences.tsx` - One usage
8. Update `docs/COMPONENT_LIBRARY.md` - Add documentation

## Actual Impact

- **Components affected**: 6 files (component + 5 refactored files)
- **Link instances refactored**: 12+ instances
- **Lines of code reduced**: ~150-200 lines
- **Consistency improvement**: 100% of originally identified button-styled links unified

---

## Next Steps: Finding More Opportunities

To identify additional places where LinkButton could be beneficial, search for:

1. **Link components with extensive className props**
   ```bash
   # Search for Link components with button-like styling
   grep -r "Link" src/routes --include="*.tsx" | grep "className.*px-.*py-"
   ```

2. **Link components with button colors**
   ```bash
   # Search for Links with background colors
   grep -r "Link" src --include="*.tsx" | grep -E "bg-(romance|slate|red|green)"
   ```

3. **Common patterns to look for**:
   - Links with padding classes (px-*, py-*)
   - Links with background colors (bg-*)
   - Links with rounded corners (rounded-lg, rounded-full)
   - Links with hover states (hover:bg-*)
   - Links that look visually like buttons

4. **Manual review of key pages**:
   - Browse page
   - Library page
   - Profile page
   - Admin pages
   - Auth pages (login/signup)
   - Home/landing page

---

## Additional Refactoring Opportunities

### Discovered: December 2024

After comprehensive search, the following files contain Link components with button-like styling that could benefit from LinkButton refactoring:

#### 1. **Header.tsx** - Mobile Navigation Links
**Location**: Lines 93-140
**Issue**: Mobile menu links have button-like styling with padding, rounded corners, and background colors
**Impact**: 4 Link components with duplicate className strings

**Current Pattern:**
```tsx
<Link
  to="/browse"
  className={`px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-romance-50 dark:hover:bg-slate-700 hover:text-romance-600 dark:hover:text-romance-400 font-medium transition-colors ${
    isActive("/browse")
      ? "bg-romance-50 dark:bg-slate-700 text-romance-600 dark:text-romance-400"
      : ""
  }`}
>
  Browse
</Link>
```

**Consideration**: These are navigation menu items, not primary CTAs. Using LinkButton here may not be appropriate as they serve a different purpose (menu navigation vs action buttons). The current pattern with NavLink or custom styling may be more semantically correct.

**Recommendation**: Consider creating a separate `MenuLink` component or keep as-is. LinkButton is designed for button-styled CTAs, not menu items.

---

#### 2. **StoryCard.tsx** - Action Links
**Location**: Lines 162-177
**Issue**: Two Link components styled as buttons for story actions
**Impact**: High - appears on every story card in library

**Current Pattern:**
```tsx
<Link
  to="/story/$id/read"
  params={{ id }}
  search={{ scene: currentScene }}
  className="flex-1 px-4 py-2 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700 transition-colors text-center"
>
  {status === "in-progress" ? "Continue Reading" : "Read Again"}
</Link>
<Link
  to="/story/$id/info"
  params={{ id }}
  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
  title="Story info"
>
  <Info className="w-5 h-5" />
</Link>
```

**Recommended Refactoring:**
```tsx
<LinkButton
  to="/story/$id/read"
  params={{ id }}
  search={{ scene: currentScene }}
  variant="primary"
  size="md"
  className="flex-1"
>
  {status === "in-progress" ? "Continue Reading" : "Read Again"}
</LinkButton>
<LinkButton
  to="/story/$id/info"
  params={{ id }}
  variant="secondary"
  size="sm"
  title="Story info"
>
  <Info className="w-5 h-5" />
</LinkButton>
```

**Priority**: High - Clear button-styled CTAs that match LinkButton's purpose

---

#### 3. **NovelCard.tsx** - Action Links
**Location**: Lines 84-97
**Issue**: Two Link components styled as buttons for template actions
**Impact**: High - appears on every novel card in browse page

**Current Pattern:**
```tsx
<Link
  to="/template/$id"
  params={{ id }}
  className="flex-1 px-4 py-2 bg-romance-600 text-white rounded-lg font-medium hover:bg-romance-700 transition-colors text-center"
>
  View Details
</Link>
<Link
  to="/story/create"
  search={{ templateId: id }}
  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
>
  Start Reading
</Link>
```

**Recommended Refactoring:**
```tsx
<LinkButton
  to="/template/$id"
  params={{ id }}
  variant="primary"
  size="md"
  className="flex-1"
>
  View Details
</LinkButton>
<LinkButton
  to="/story/create"
  search={{ templateId: id }}
  variant="secondary"
  size="md"
  className="flex-1"
>
  Start Reading
</LinkButton>
```

**Priority**: High - Clear button-styled CTAs that match LinkButton's purpose

---

### Summary of New Opportunities

| File | Location | Link Count | Priority | Notes |
|------|----------|-----------|----------|-------|
| Header.tsx | Lines 93-140 | 4 | Low | Menu items, not CTAs - consider separate MenuLink component |
| StoryCard.tsx | Lines 162-177 | 2 | **High** | Primary CTAs - perfect for LinkButton |
| NovelCard.tsx | Lines 84-97 | 2 | **High** | Primary CTAs - perfect for LinkButton |

**Total Additional Opportunities**: 8 Link components
**High Priority**: 4 Link components (StoryCard + NovelCard)
**Estimated Lines Reduced**: ~80-100 additional lines

---

### Files Confirmed Not Needing Changes

The following files were reviewed and confirmed appropriate:

- ✅ **auth/login.tsx** - Simple text links (line 149-154)
- ✅ **auth/signup.tsx** - Simple text links (line 182-187)
- ✅ **index.tsx** - Uses Link wrapping Button (optimal pattern, lines 46-55)
- ✅ **Admin pages** - No Link components with button styling
- ✅ **Legal pages** (terms, privacy, cookies) - Text links only
