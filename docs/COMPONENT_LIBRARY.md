# Component Library Reference

Complete API reference for all UI components in Choose the Heat.

---

## Layout Components

### Stack

Consistent vertical or horizontal spacing for child elements.

**Props:**

```tsx
interface StackProps {
  direction?: 'vertical' | 'horizontal'; // Default: 'vertical'
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none'; // Default: 'md'
  align?: 'start' | 'center' | 'end' | 'stretch'; // Default: 'stretch'
  className?: string;
  children: ReactNode;
}
```

**Gap Scale:**

- `xs`: 0.5rem (space-y-2 / space-x-2)
- `sm`: 1rem (space-y-4 / space-x-4)
- `md`: 1.5rem (space-y-6 / space-x-6)
- `lg`: 2rem (space-y-8 / space-x-8)
- `xl`: 3rem (space-y-12 / space-x-12)

**Usage:**

```tsx
<Stack gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>

<Stack direction="horizontal" gap="sm" align="center">
  <Icon />
  <span>Text</span>
</Stack>
```

---

### Section

Page-level sections with consistent padding and max-width.

**Props:**

```tsx
interface SectionProps {
  spacing?: 'sm' | 'md' | 'lg'; // Default: 'md'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; // Default: 'lg'
  centered?: boolean; // Default: true
  className?: string;
  children: ReactNode;
}
```

**Spacing Scale:**

- `sm`: py-4 (1rem top/bottom)
- `md`: py-8 (2rem top/bottom)
- `lg`: py-12 (3rem top/bottom)

**Max-Width Scale:**

- `sm`: max-w-2xl (672px)
- `md`: max-w-4xl (896px)
- `lg`: max-w-6xl (1152px)
- `xl`: max-w-7xl (1280px)
- `full`: max-w-full (100%)

**Usage:**

```tsx
<Section spacing="lg" maxWidth="lg" centered>
  <h2>Section Content</h2>
</Section>
```

---

### Container

Standard page container with responsive padding.

**Props:**

```tsx
interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; // Default: 'lg'
  padding?: boolean; // Default: true (adds px-4)
  className?: string;
  children: ReactNode;
}
```

**Size Scale:**
Same as Section maxWidth scale.

**Usage:**

```tsx
<Container size="lg">
  <p>Page content</p>
</Container>
```

---

## Typography Components

### Text

Polymorphic text component with consistent color, size, and weight variants.

**Props:**

```tsx
interface TextProps {
  as?: 'p' | 'span' | 'div' | 'strong' | 'em' | 'small'; // Default: 'p'
  variant?: 'primary' | 'secondary' | 'muted' | 'emphasis'; // Default: 'primary'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'; // Default: 'base'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'; // Default: 'normal'
  mono?: boolean; // Default: false
  className?: string;
  children: ReactNode;
}
```

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

```tsx
// Default paragraph
<Text>Default paragraph text</Text>

// Inline span with custom styling
<Text as="span" variant="secondary" size="sm">Small secondary text</Text>

// Emphasis with bold weight
<Text variant="emphasis" weight="bold">Bold important text</Text>

// Code/technical text
<Text mono>Code or technical text</Text>
<Text as="code" mono variant="emphasis">SESSION_COOKIE_NAME</Text>

// Strong tag with semantic emphasis
<Text as="strong" variant="emphasis" weight="semibold">
  Important notice
</Text>
```

---

## UI Components

### Modal

Accessible modal dialog with backdrop and keyboard support.

**Props:**

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg'; // Default: 'md'
  className?: string;
  children: ReactNode;
}
```

**Features:**

- Escape key to close
- Click backdrop to close
- Prevents body scroll when open
- Dark mode support

**Size Scale:**

- `sm`: max-w-md (28rem)
- `md`: max-w-lg (32rem)
- `lg`: max-w-2xl (42rem)

**Usage:**

```tsx
<Modal isOpen={isOpen} onClose={handleClose} title="Modal Title" size="md">
  <p>Modal content</p>
</Modal>
```

---

### Alert

Message display for errors, success, warnings, and info.

**Props:**

```tsx
interface AlertProps {
  message?: string | null;
  variant?: 'error' | 'success' | 'warning' | 'info'; // Default: 'error'
  className?: string;
  children?: ReactNode; // Alternative to message prop
}
```

**Variants:**

- `error`: Red background, red text
- `success`: Green background, green text
- `warning`: Yellow background, yellow text
- `info`: Blue background, blue text

**Usage:**

```tsx
<Alert variant="error" message={errorMessage} />
<Alert variant="success">Saved successfully!</Alert>
```

**Note:** Returns null if no message/children provided.

---

### Badge

Status indicators with color variants.

**Props:**

```tsx
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'; // Default: 'default'
  size?: 'sm' | 'md'; // Default: 'md'
  className?: string;
  children: ReactNode;
}
```

**Variants:**

- `default`: Slate background
- `success`: Green background
- `warning`: Yellow background
- `danger`: Red background
- `info`: Blue background

**Size Scale:**

- `sm`: px-2 py-0.5 text-xs
- `md`: px-2.5 py-1 text-sm

**Usage:**

```tsx
<Badge variant="success" size="sm">Active</Badge>
<Badge variant="danger">Error</Badge>
```

---

### Tabs

Compound component for tabbed interfaces.

**Components:**

- `Tabs` - Root wrapper with state management
- `TabsList` - Container for tab triggers
- `TabsTrigger` - Individual tab button
- `TabsContent` - Content panel for each tab

**Tabs Props:**

```tsx
interface TabsProps {
  defaultValue: string; // Initial active tab
  value?: string; // Controlled value
  onValueChange?: (value: string) => void; // Controlled callback
  className?: string;
  children: ReactNode;
}
```

**TabsTrigger Props:**

```tsx
interface TabsTriggerProps {
  value: string; // Tab identifier
  className?: string;
  children: ReactNode;
}
```

**TabsContent Props:**

```tsx
interface TabsContentProps {
  value: string; // Tab identifier
  className?: string;
  children: ReactNode;
}
```

**Usage:**

```tsx
// Uncontrolled
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>

// Controlled
<Tabs value={activeTab} onValueChange={setActiveTab}>
  {/* ... */}
</Tabs>
```

---

### NavLink

Navigation link with automatic active state detection.

**Props:**

```tsx
interface NavLinkProps {
  to: string; // Route path
  activeClassName?: string; // Default: 'text-romance-600 dark:text-romance-300'
  className?: string; // Default includes hover states
  matchSubpaths?: boolean; // Default: false
  children: ReactNode;
}
```

**Features:**

- Automatically detects active state using router
- `matchSubpaths`: Match /admin for /admin/users
- Customizable active styling
- Dark mode support

**Usage:**

```tsx
<NavLink to="/browse">Browse</NavLink>
<NavLink to="/admin" matchSubpaths>Admin</NavLink>
```

---

### FormGroup

Consistent spacing wrapper for form fields.

**Props:**

```tsx
interface FormGroupProps {
  spacing?: 'sm' | 'md' | 'lg'; // Default: 'md'
  className?: string;
  children: ReactNode;
}
```

**Spacing Scale:**

- `sm`: space-y-4 (1rem)
- `md`: space-y-6 (1.5rem)
- `lg`: space-y-8 (2rem)

**Usage:**

```tsx
<FormGroup spacing="md">
  <FormInput label="Email" name="email" />
  <FormInput label="Password" type="password" name="password" />
  <Button type="submit">Submit</Button>
</FormGroup>
```

---

## Existing Components

### Card

Reusable card container with padding variants.

**Props:**

```tsx
interface CardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg'; // Default: 'lg'
  className?: string;
  children: ReactNode;
}
```

**Padding Scale:**

- `none`: No padding
- `sm`: p-4
- `md`: p-6
- `lg`: p-8

**Usage:**

```tsx
<Card padding="lg">
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

---

### Button

Comprehensive button with variants and sizes.

**Props:**

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: ReactNode;
}
```

**Variants:**

- `primary`: Romance background
- `secondary`: Slate background
- `outline`: Border only
- `danger`: Red background
- `ghost`: No background

**Usage:**

```tsx
<Button variant="primary" size="md">Click Me</Button>
```

---

### LinkButton

Navigation link styled as a button, combining TanStack Router's Link with Button styling.

**Props:**

```tsx
interface LinkButtonProps {
  to: string;
  search?: Record<string, unknown>;
  params?: Record<string, string>;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}
```

**Variants:**

Same as Button component:

- `primary`: Romance background
- `secondary`: Slate background  
- `outline`: Border only
- `danger`: Red background
- `ghost`: No background

**Usage:**

```tsx
<LinkButton to="/browse" variant="primary" size="md">
  Browse Stories
</LinkButton>

<LinkButton to="/preferences" variant="outline">
  <Settings className="w-5 h-5" />
  Update Preferences
</LinkButton>
```

**When to use:**

- Navigation that looks like a button (CTAs, primary actions)
- Consistent with Button component styling
- Needs TanStack Router features (search, params)

**When not to use:**

- Text links in paragraphs or navigation menus (use regular `<Link>`)
- Non-navigation actions (use `<Button>` with `onClick`)

---

### Heading

Semantic headings with consistent sizing.

**Props:**

```tsx
interface HeadingProps {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'hero' | 'page' | 'section' | 'subsection' | 'label';
  className?: string;
  children: ReactNode;
}
```

**Size Scale:**

- `hero`: text-4xl
- `page`: text-3xl
- `section`: text-2xl
- `subsection`: text-xl
- `label`: text-lg

**Usage:**

```tsx
<Heading level="h1" size="hero">Page Title</Heading>
<Heading level="h2" size="section">Section Title</Heading>
```

---

## Component Composition Patterns

### Form Layout

```tsx
<Card padding="lg">
  <Stack gap="md">
    <Heading level="h2" size="section">Form Title</Heading>
    <FormGroup spacing="md">
      <FormInput label="Field 1" />
      <FormInput label="Field 2" />
      <Alert variant="error" message={error} />
      <Button type="submit">Submit</Button>
    </FormGroup>
  </Stack>
</Card>
```

### Page Layout

```tsx
<Section spacing="lg" maxWidth="lg">
  <Stack gap="lg">
    <Heading level="h1" size="page">Page Title</Heading>
    <Card padding="lg">
      {/* Content */}
    </Card>
  </Stack>
</Section>
```

### Tabbed Interface

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Overview</TabsTrigger>
    <TabsTrigger value="tab2">Details</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    <Stack gap="md">
      {/* Tab 1 content */}
    </Stack>
  </TabsContent>
  <TabsContent value="tab2">
    <Stack gap="md">
      {/* Tab 2 content */}
    </Stack>
  </TabsContent>
</Tabs>
```

---

## Best Practices

1. **Always use layout components** instead of manual spacing classes
2. **Use Stack for vertical/horizontal spacing** instead of space-y-*or gap-*
3. **Use Card component** instead of custom divs with bg/shadow
4. **Use Button component** instead of styled buttons/links
5. **Use Heading component** for all headings
6. **Use FormGroup** to wrap form fields
7. **Use NavLink** for navigation instead of raw Link with active styling
8. **Use Tabs** for tabbed interfaces instead of custom button groups

---

## Migration Checklist

When refactoring existing components:

- [ ] Replace `space-y-*` with `<Stack gap="...">`
- [ ] Replace custom card divs with `<Card>`
- [ ] Replace custom buttons with `<Button>`
- [ ] Replace custom headings with `<Heading>`
- [ ] Replace error divs with `<Alert variant="error">`
- [ ] Replace nav Links with `<NavLink>`
- [ ] Replace custom tab buttons with `<Tabs>`
- [ ] Wrap forms with `<FormGroup>`
- [ ] Use `<Section>` for page sections
- [ ] Use `<Container>` for page containers
