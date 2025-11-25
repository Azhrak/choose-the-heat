# LinkButton Component Plan

## Overview

A reusable component that combines TanStack Router's `Link` functionality with Button-like styling. This will eliminate the need for custom inline styling on Link components that are styled as buttons throughout the application.

## Current Problem

We have multiple instances where `Link` components are styled as buttons with inline classNames:

1. **PreferencesDisplay.tsx** (lines 28-33, 153-158)
   - Primary button style: `bg-romance-600 text-white rounded-lg hover:bg-romance-700`
   - Outline button style: `border-2 border-romance-600 text-romance-600 hover:bg-romance-50`

2. **EmptyState.tsx** (line 41-43)
   - Primary button style: `bg-romance-600 text-white rounded-lg hover:bg-romance-700`

3. **template/$id.tsx** (lines 66-71, 135-140, 174-179)
   - Primary CTA buttons with custom styling and icons

4. **story/$id.read.tsx** (lines 565-571)
   - Secondary/outline button with border

5. **story/$id.info.tsx** (lines 179-183, 361-367)
   - Primary button for "Continue Reading"
   - Back links with custom styling

6. **preferences.tsx** (lines 186-190)
   - Outline/secondary button for "Cancel"

7. **index.tsx** (Home page, lines 49-57)
   - Links wrapped around Button components (already optimal pattern)

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

## Estimated Impact

- **Components affected**: 7 files
- **Link instances to refactor**: ~12 instances
- **Lines of code reduced**: ~150-200 lines
- **Consistency improvement**: 100% of button-styled links unified
