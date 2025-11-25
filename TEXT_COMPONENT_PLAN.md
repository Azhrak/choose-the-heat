# Text Component Implementation Plan

## Overview

Create a polymorphic `Text` component to standardize text styling across the application, eliminating ~165+ manual text color class combinations (`text-slate-700 dark:text-slate-300`, etc.).

---

## Current State Analysis

### Text Color Patterns in Codebase

Based on grep analysis:

- **Primary body text**: `text-slate-700 dark:text-slate-300` (85 occurrences)
- **Secondary text**: `text-slate-600 dark:text-slate-300` (11 occurrences)
- **Muted text**: `text-slate-600 dark:text-slate-400` (5 occurrences)
- **Strong/emphasis**: `text-slate-900 dark:text-slate-100` (headings, strong tags)
- **Code/mono**: `font-mono text-slate-900 dark:text-slate-100`

### Size Patterns

- `text-xs`, `text-sm`, `text-base` (default), `text-lg`, `text-xl`
- Most paragraph text has no explicit size class (defaults to `text-base`)

### Existing Component Patterns

- Heading component (src/components/Heading.tsx): Uses `variant` + `size` props
- Badge/Alert components: Use variant classes mapped to color schemes
- All components use `cn()` utility from lib/utils.ts for className merging
- Dark mode support with Tailwind's `dark:` prefix

---

## Component Design

### API Design

```tsx
interface TextProps {
  // Polymorphic component - render as different HTML elements
  as?: 'p' | 'span' | 'div' | 'strong' | 'em' | 'small';

  // Color variant
  variant?: 'primary' | 'secondary' | 'muted' | 'emphasis';

  // Text size
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';

  // Font weight
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';

  // Monospace font (for code/technical text)
  mono?: boolean;

  // Additional classes
  className?: string;

  // Content
  children: ReactNode;
}
```

### Variant Mapping

Based on actual usage patterns:

```tsx
const variantClasses = {
  primary: 'text-slate-700 dark:text-slate-300',      // Most common (85 uses)
  secondary: 'text-slate-600 dark:text-slate-300',    // 11 uses
  muted: 'text-slate-600 dark:text-slate-400',        // 5 uses
  emphasis: 'text-slate-900 dark:text-slate-100',     // For strong/important text
};
```

### Size Mapping

```tsx
const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};
```

### Weight Mapping

```tsx
const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};
```

### Default Props

- `as`: 'p' (paragraph by default)
- `variant`: 'primary'
- `size`: 'base'
- `weight`: 'normal'
- `mono`: false

---

## Implementation Steps

### Step 1: Create Text Component

**File**: `src/components/ui/Text.tsx`

- Create polymorphic component with `as` prop
- Define variant, size, and weight class maps
- Use `cn()` utility for className merging
- Support mono font option
- Add TypeScript types for all props

### Step 2: Create/Update UI Index

**File**: `src/components/ui/index.ts`

- Export Text component
- Export all other ui components (Stack, Card, etc.)
- Provide central import location

### Step 3: Update Design System Documentation

**File**: `docs/DESIGN_SYSTEM.md`

**Changes**:
- Add Text component section under "Typography" (after Heading)
- Document all variants with usage examples
- Show migration examples
- Update color palette usage notes to reference Text component

**Content to add**:
```markdown
### Text / Paragraph Component

Use the `Text` component for all body text instead of manual color classes:

**Variants**:
- **primary**: Default body text (text-slate-700 dark:text-slate-300)
- **secondary**: De-emphasized text (text-slate-600 dark:text-slate-300)
- **muted**: Subtle text (text-slate-600 dark:text-slate-400)
- **emphasis**: Important text (text-slate-900 dark:text-slate-100)

**Usage**:

\`\`\`tsx
// Default paragraph
<Text>This is primary body text</Text>

// Secondary text
<Text variant="secondary">Less important text</Text>

// Inline span with custom size
<Text as="span" size="sm" variant="muted">Small muted text</Text>

// Code/technical text
<Text as="code" mono variant="emphasis">SESSION_COOKIE</Text>

// Strong emphasis
<Text as="strong" variant="emphasis" weight="semibold">Important!</Text>
\`\`\`

**Migration**:

\`\`\`tsx
// Before
<p className="text-slate-700 dark:text-slate-300">
  Some text
</p>

// After
<Text>Some text</Text>

// Before
<span className="text-sm text-slate-600 dark:text-slate-400">
  Muted small text
</span>

// After
<Text as="span" size="sm" variant="muted">
  Muted small text
</Text>
\`\`\`
```

### Step 4: Update Component Library Documentation

**File**: `docs/COMPONENT_LIBRARY.md`

Add complete API reference for Text component:

```markdown
### Text

Polymorphic text component with consistent color, size, and weight variants.

**Props:**

\`\`\`tsx
interface TextProps {
  as?: 'p' | 'span' | 'div' | 'strong' | 'em' | 'small';
  variant?: 'primary' | 'secondary' | 'muted' | 'emphasis';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  mono?: boolean;
  className?: string;
  children: ReactNode;
}
\`\`\`

**Variants:**
- `primary`: text-slate-700 dark:text-slate-300
- `secondary`: text-slate-600 dark:text-slate-300
- `muted`: text-slate-600 dark:text-slate-400
- `emphasis`: text-slate-900 dark:text-slate-100

**Sizes:**
- `xs`: text-xs
- `sm`: text-sm
- `base`: text-base (default)
- `lg`: text-lg
- `xl`: text-xl

**Weights:**
- `normal`: font-normal (default)
- `medium`: font-medium
- `semibold`: font-semibold
- `bold`: font-bold

**Usage:**

\`\`\`tsx
<Text>Default paragraph text</Text>
<Text as="span" variant="secondary" size="sm">Small secondary text</Text>
<Text variant="emphasis" weight="bold">Bold important text</Text>
<Text mono>Code or technical text</Text>
\`\`\`
```

### Step 5: Update Refactoring Progress Tracker

**File**: `REFACTORING_PROGRESS.md`

Add new section under Phase 2 (after 2.9):

```markdown
### 2.10. Create Text Component and Apply Throughout Codebase

- [ ] Create Text component (src/components/ui/Text.tsx)
- [ ] Create ui/index.ts barrel export
- [ ] Update DESIGN_SYSTEM.md with Text component documentation
- [ ] Update COMPONENT_LIBRARY.md with Text component API reference
- [ ] Apply Text component to policy pages (cookies.tsx, privacy.tsx, terms.tsx)
- [ ] Apply Text component to user-facing pages
- [ ] Apply Text component to admin pages
- [ ] Apply Text component to component library
- [ ] Add tests for Text component
```

---

## Migration Strategy

### Phase 1: Create Component & Documentation (High Priority)
1. Create Text component
2. Create ui/index.ts
3. Update documentation

### Phase 2: Apply to High-Traffic Pages (Medium Priority)
Apply Text component to frequently edited files:
- Policy pages (cookies.tsx, privacy.tsx, terms.tsx) - 80+ instances
- Onboarding flow - 10+ instances
- Story creation pages - 15+ instances
- Template pages - 10+ instances

### Phase 3: Apply to Component Library (Medium Priority)
Update reusable components:
- CookieConsentBanner
- EmptyState
- LoadingSpinner
- StoryCard / NovelCard (selectively - preserve custom styling)

### Phase 4: Apply to Admin Pages (Lower Priority)
- Admin dashboard
- User management
- Template management

### Phase 5: Add Tests (Ongoing)
- Unit tests for Text component
- Visual regression tests for variants
- Accessibility tests

---

## Design Decisions & Rationale

### Why Polymorphic Component?

**Pros**:
- Single component for all text elements (p, span, div, etc.)
- Semantic HTML flexibility
- Consistent API across all text use cases
- Smaller bundle size (one component vs multiple)

**Cons**:
- Slightly more complex TypeScript types
- Learning curve for polymorphic pattern

**Decision**: Use polymorphic component - modern pattern, maximum flexibility

### Why Not Separate Paragraph/Span Components?

Separate components would duplicate all the variant/size/weight logic. The polymorphic approach keeps DRY while supporting all HTML elements.

### Variant Names

Use semantic names (primary, secondary, muted, emphasis) instead of color names (slate-700, etc.):
- More maintainable - can change colors without changing component API
- More semantic - describes purpose, not implementation
- Matches Heading component pattern

### Size vs. Typography Scale

Considered creating a typography scale (body-1, body-2, etc.) but chose explicit sizes (xs, sm, base, etc.):
- More direct mapping to Tailwind classes
- Easier migration from existing code
- Clearer for developers

### Mono Font as Boolean vs Variant

Could add mono as a variant, but made it a boolean prop:
- Code text often needs different variants (muted code, emphasis code, etc.)
- Boolean allows combining with any variant
- More flexible

---

## Out of Scope

### Not Replacing:
1. **Heading component** - Already exists, different use case
2. **Link text** - Links use romance colors (text-romance-600), need separate component or NavLink
3. **Badge component** - Semantic component with background colors
4. **Alert component** - Semantic component with backgrounds and borders
5. **Form labels** - May need separate FormLabel component with different defaults

### Future Considerations:
- **Link/Anchor component**: For romance-colored links
- **Label component**: For form labels with specific styling
- **Code component**: Dedicated inline code component with background

---

## Success Metrics

- [ ] Reduce manual text color classes by 80%+
- [ ] Zero new instances of `text-slate-{n}00 dark:text-slate-{n}00` in new code
- [ ] All policy pages use Text component
- [ ] Documentation complete with migration examples
- [ ] Tests pass for all variants

---

## Questions for Review

1. **Variant naming**: Are 'primary', 'secondary', 'muted', 'emphasis' the right names?
2. **Default element**: Should default be `<p>` or `<span>`? (I chose `<p>`)
3. **Mono font**: Should this be a separate component or boolean prop? (I chose boolean)
4. **Additional props**: Do we need `align` prop (text-left, text-center, etc.)?
5. **Migration urgency**: Which files should we prioritize first?
