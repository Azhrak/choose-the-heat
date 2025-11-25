# Design System Guide

## Overview

This document defines the design system for Choose the Heat, including color palettes, spacing scales, typography, and component usage guidelines.

---

## Color Palette

### Primary Colors (Romance)

The romance color palette is the primary brand color used throughout the application:

```
romance-50:  #fef2f4  - Lightest tint (backgrounds, hover states)
romance-100: #fde6e9  - Very light
romance-200: #fbd0d8  - Light
romance-300: #f7a9b8  - Light-medium
romance-400: #f27693  - Medium-light
romance-500: #e84c73  - Base brand color (primary actions)
romance-600: #d32f5c  - Medium-dark (hover states)
romance-700: #b2244d  - Dark
romance-800: #942146  - Darker
romance-900: #7e1f41  - Darkest (text, emphasis)
```

**Usage**:

- **romance-500**: Primary buttons, links, brand elements
- **romance-600**: Hover states for primary actions
- **romance-50/100**: Light backgrounds, subtle highlights
- **romance-700/800**: Dark text, strong emphasis

### Neutral Colors (Slate)

Use **slate** as the standard neutral color throughout the application. Avoid mixing with `gray`.

```
slate-50   - Lightest backgrounds
slate-100  - Light backgrounds
slate-200  - Borders, dividers
slate-300  - Disabled states
slate-600  - Secondary text
slate-700  - Primary text (light mode)
slate-800  - Dark backgrounds
slate-900  - Darkest backgrounds
```

**Usage**:

- **slate-50/100**: Page backgrounds (light mode)
- **slate-200**: Borders, dividers, subtle separators
- **slate-600**: Secondary/muted text
- **slate-700**: Primary body text (light mode)
- **slate-800/900**: Card/section backgrounds (dark mode)

### Semantic Colors

Use Tailwind's built-in semantic colors:

- **Success**: `green-500`, `green-600`, `green-50`, `green-900/20`
- **Warning**: `yellow-500`, `yellow-600`, `yellow-50`, `yellow-900/20`
- **Error**: `red-500`, `red-600`, `red-50`, `red-900/20`
- **Info**: `blue-500`, `blue-600`, `blue-50`, `blue-900/20`

---

## Spacing Scale

### Internal Spacing (Stack, Flex, Grid gaps)

Use these semantic gap sizes for vertical and horizontal spacing:

| Gap Size | Tailwind Class | Use Case |
|----------|----------------|----------|
| **xs** | `space-y-2` / `gap-2` | Compact lists, tight groupings, tags |
| **sm** | `space-y-4` / `gap-4` | Form fields, button groups, related items |
| **md** | `space-y-6` / `gap-6` | Card content (standard), section items |
| **lg** | `space-y-8` / `gap-8` | Page sections, major content blocks |
| **xl** | `space-y-12` / `gap-12` | Large section separations |

**Best Practice**: Use the `Stack` component instead of manual `space-y-*` classes for consistency.

### Padding (Cards, Sections)

| Padding Size | Tailwind Class | Use Case |
|--------------|----------------|----------|
| **sm** | `p-4` | Compact cards, small modals |
| **md** | `p-6` | Standard cards, form sections |
| **lg** | `p-8` | Large cards, main content areas |
| **xl** | `p-12` | Hero sections, large feature blocks |

**Card Component**: Use the `Card` component with `padding` prop instead of manual padding.

### Page Spacing

| Spacing | Tailwind Class | Use Case |
|---------|----------------|----------|
| **sm** | `py-4` | Compact page sections, headers |
| **md** | `py-8` | Standard page padding |
| **lg** | `py-12` | Main content sections |

**Section Component**: Use the `Section` component with `spacing` prop for page-level spacing.

---

## Typography

### Heading Hierarchy

Use the `Heading` component for all headings:

```tsx
<Heading level="h1" size="hero">Main Page Title</Heading>
<Heading level="h2" size="page">Page Section</Heading>
<Heading level="h3" size="section">Card/Section Title</Heading>
<Heading level="h4" size="subsection">Subsection</Heading>
<Heading level="h5" size="label">Small Label</Heading>
```

**Available Sizes**:

- **hero**: `text-4xl` - Page hero titles
- **page**: `text-3xl` - Main page headings
- **section**: `text-2xl` - Section/card headings
- **subsection**: `text-xl` - Subsection headings
- **label**: `text-lg` - Small labels, emphasized text

### Text / Paragraph Component

Use the `Text` component for all body text instead of manual color classes:

```tsx
import { Text } from "~/components/ui";

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
```

**Variants**:

- **primary**: Default body text (text-slate-700 dark:text-slate-300)
- **secondary**: De-emphasized text (text-slate-600 dark:text-slate-300)
- **muted**: Subtle text (text-slate-600 dark:text-slate-400)
- **emphasis**: Important text (text-slate-900 dark:text-slate-100)

**Sizes**: `xs`, `sm`, `base` (default), `lg`, `xl`

**Weights**: `normal` (default), `medium`, `semibold`, `bold`

**Elements**: Can render as `p`, `span`, `div`, `strong`, `em`, `small` via the `as` prop

**Migration Examples**:

```tsx
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
```

### Body Text (Legacy - Use Text Component)

- **Primary**: `text-slate-700 dark:text-slate-200`
- **Secondary**: `text-slate-600 dark:text-slate-300`
- **Muted**: `text-slate-500 dark:text-slate-400`

---

## Layout Components

### Stack

For consistent vertical or horizontal spacing:

```tsx
<Stack gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

<Stack direction="horizontal" gap="sm" align="center">
  <Icon />
  <span>Text</span>
</Stack>
```

**Props**:

- `direction`: 'vertical' (default) | 'horizontal'
- `gap`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none'
- `align`: 'start' | 'center' | 'end' | 'stretch'

### Section

For page-level sections with consistent padding and max-width:

```tsx
<Section spacing="lg" maxWidth="lg" centered>
  <h2>Section Content</h2>
  <p>Content here...</p>
</Section>
```

**Props**:

- `spacing`: 'sm' (py-4) | 'md' (py-8) | 'lg' (py-12)
- `maxWidth`: 'sm' (max-w-2xl) | 'md' (max-w-4xl) | 'lg' (max-w-6xl) | 'xl' (max-w-7xl) | 'full'
- `centered`: boolean (applies mx-auto)

### Container

For page containers with responsive padding:

```tsx
<Container size="lg">
  <p>Page content</p>
</Container>
```

**Props**:

- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `padding`: boolean (default true - applies px-4)

---

## Component Usage Guidelines

### Cards

**Always use the `Card` component** instead of custom divs:

```tsx
// ✅ Good
<Card padding="lg">
  <Heading level="h3" size="section">Title</Heading>
  <p>Content</p>
</Card>

// ❌ Bad
<div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
  <h3 className="text-2xl font-bold">Title</h3>
  <p>Content</p>
</div>
```

### Buttons

**Always use the `Button` component** instead of custom styled links or buttons:

```tsx
// ✅ Good
<Button variant="primary" size="md">
  Click Me
</Button>

// ❌ Bad
<button className="px-6 py-3 bg-romance-600 text-white rounded-lg...">
  Click Me
</button>
```

### Modals

**Use the `Modal` component** for all dialogs:

```tsx
<Modal isOpen={isOpen} onClose={handleClose} size="md">
  <Stack gap="md">
    <Heading level="h3" size="section">Modal Title</Heading>
    <p>Modal content</p>
  </Stack>
</Modal>
```

### Forms

**Use `FormGroup` and form components** for consistent spacing:

```tsx
<FormGroup spacing="md">
  <FormInput label="Email" name="email" />
  <FormInput label="Password" type="password" name="password" />
  <Button type="submit">Submit</Button>
</FormGroup>
```

### Alerts

**Use the `Alert` component** for messages:

```tsx
<Alert variant="error" message={errorMessage} />
<Alert variant="success" message="Saved successfully!" />
```

---

## Dark Mode

All components should support dark mode using Tailwind's `dark:` prefix:

```tsx
// Text colors
className="text-slate-700 dark:text-slate-200"

// Background colors
className="bg-white dark:bg-slate-800"

// Border colors
className="border-slate-200 dark:border-slate-700"
```

**Theme Detection**: The app uses class-based dark mode (`darkMode: 'class'` in Tailwind config).

---

## Accessibility Guidelines

1. **Always use semantic HTML**: Use `<button>` for actions, `<a>` for navigation
2. **Include proper ARIA labels**: Especially for icon-only buttons
3. **Ensure sufficient color contrast**: Use contrast checkers for text/background combinations
4. **Keyboard navigation**: All interactive elements should be keyboard accessible
5. **Focus states**: Always include visible focus states for keyboard users

---

## Migration Guidelines

When updating existing components:

1. **Replace custom spacing** with `Stack` component
2. **Replace custom divs** with `Card` component
3. **Replace custom buttons** with `Button` component
4. **Replace custom headings** with `Heading` component
5. **Use Section/Container** for page-level layouts

**Example Migration**:

```tsx
// Before
<div className="space-y-6">
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
      Title
    </h3>
    <p className="text-slate-600 dark:text-slate-300">Description</p>
  </div>
</div>

// After
<Stack gap="md">
  <Card padding="lg">
    <Stack gap="sm">
      <Heading level="h3" size="section">Title</Heading>
      <p className="text-slate-600 dark:text-slate-300">Description</p>
    </Stack>
  </Card>
</Stack>
```

---

## Questions?

For questions or clarifications about the design system, refer to:

- `docs/COMPONENT_LIBRARY.md` - Detailed component API reference
- `docs/CODING_PRACTICES.md` - General coding standards
- Ask the team in development discussions
