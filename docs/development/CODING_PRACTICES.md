# Coding Practices & Standards

This document outlines the coding practices, patterns, and standards for the Choose the Heat project. All developers and AI agents should follow these guidelines to maintain consistency and code quality.

## Table of Contents

1. [Custom Hooks](#custom-hooks)
2. [Type Safety](#type-safety)
3. [Component Patterns](#component-patterns)
4. [API Patterns](#api-patterns)
5. [File Organization](#file-organization)
6. [Naming Conventions](#naming-conventions)
7. [Import Order](#import-order)

---

## Custom Hooks

### When to Create a Custom Hook

Create a custom hook when a query or mutation pattern is used **3 or more times** across the codebase.

### Location

All custom hooks should be placed in `src/hooks/`

### Naming Convention

- Queries: `use[Entity]Query.ts` (e.g., `useCurrentUserQuery.ts`, `useTemplatesQuery.ts`)
- Mutations: `use[Action][Entity]Mutation.ts` (e.g., `useDeleteStoryMutation.ts`)

### Structure

**Query Hook Example:**

```typescript
import { useQuery } from "@tanstack/react-query";
import type { SomeType } from "~/lib/api/types";

interface SomeResponse {
  data: SomeType[];
}

/**
 * Custom hook to fetch [description]
 * @param param - Description of parameter
 */
export function useSomeQuery(param: string) {
  return useQuery({
    queryKey: ["someKey", param],
    queryFn: async () => {
      const response = await fetch(`/api/endpoint?param=${param}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json() as Promise<SomeResponse>;
    },
  });
}
```

**Mutation Hook Example:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook to [action description]
 * Automatically invalidates [queries] on success
 */
export function useSomeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/endpoint/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Operation failed");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["relatedData"] });
    },
  });
}
```

### Required Documentation

Every custom hook must have:

- JSDoc comment describing its purpose
- Parameter descriptions (if applicable)
- Return type inference or explicit type

---

## Type Safety

### Core Principle: Local Types First

**Define types where they're used, not in global type files.** Each component should only know about its own data structure.

```typescript
// ✅ Good - Local types
function UserCard(props: { name: string; email: string }) {
  return <div>{props.name}</div>;
}

// ❌ Bad - Importing unnecessary global types
import type { User } from "~/lib/api/types";
function UserCard(props: { user: User }) { } // Knows too much
```

### Props Pattern: No Destructuring

**Always use `props` object. Never destructure at function signature.**

```typescript
// ❌ Never destructure props
function UserCard({ name, email, onUpdate }: Props) { }

// ✅ Always use props object
function UserCard(props: Props) {
  return <div>{props.name}</div>;
}

// ✅ Exception: Functions in dependency arrays (for stable references)
function UserCard(props: Props) {
  const { onUpdate } = props; // Stable reference needed
  useEffect(() => {
    onUpdate(props.data);
  }, [onUpdate, props.data]);
}
```

**Why?** Clearer data flow, easier refactoring, better DevTools, no naming conflicts.

### Avoid Barrel Files (index.ts)

**Don't use index.ts files to re-export multiple modules.** Import directly from source files.

```typescript
// ❌ Barrel file pattern
// components/index.ts
export { Button } from './Button';
export { Card } from './Card';

// app.tsx
import { Button, Card } from '@/components'; // Imports entire barrel

// ✅ Direct imports
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
```

**Why avoid barrels?**

- Bundle size: Imports entire barrel file, not tree-shakeable
- Slow builds: Bundler must parse all re-exports
- Circular dependencies: Easy to create import cycles
- Poor IDE performance: Editor loads more files than needed

**Exception:** Barrel files are OK for small, tightly-coupled modules (e.g., `choice-points/index.ts`).

### When to Use Shared Types

**Limited to API boundaries and database types only.**

Current shared types in `src/lib/api/types.ts`:

- `Template` - Novel template with all fields
- `User` - User account information
- `UserStory` - Story with template relation
- `Scene` - Story scene content
- `AuditLog` - Admin audit log entry
- `DashboardStats` - Admin dashboard statistics
- `StoryStatus` - "in-progress" | "completed"
- `TemplateStatus` - "draft" | "published" | "archived"

**Type Re-exports** (for consistency):

```typescript
// In src/lib/api/types.ts
import type { UserRole, TemplateStatus } from "~/lib/db/types";
export type { UserRole, TemplateStatus };
```

### Type Definition Patterns

```typescript
// Small components - inline types
function Button(props: { label: string; onClick: () => void }) {
  return <button onClick={props.onClick}>{props.label}</button>;
}

// Complex components - adjacent type
type UserProfileProps = {
  userId: string;
  onUpdate?: (data: { name: string; bio: string }) => void;
};

function UserProfile(props: UserProfileProps) {
  return <div>{props.userId}</div>;
}

// Share types via return types, not separate files
function getUser(id: string) {
  return { id, name: "...", email: "..." };
}
type User = Awaited<ReturnType<typeof getUser>>;
```

### Type Inference Over Explicit

```typescript
// ❌ Redundant
const items: string[] = ["a", "b", "c"];

// ✅ Inferred
const items = ["a", "b", "c"];

// ✅ Explicit only when needed
const config = { timeout: 5000 } as const;
```

### Avoid `any` Types

Always define proper types. Use `unknown` if you need to force type checking.

```typescript
// ❌ Never use any
const stats: any = {};

// ✅ Define proper types
const stats: {
  total: number;
  active: number;
} = {
  total: 0,
  active: 0,
};

// ✅ Use unknown for truly unknown data
const data: unknown = await response.json();
if (typeof data === 'object' && data !== null) {
  // Type guard narrows unknown
}
```

### Avoid Type Bloat

```typescript
// ❌ Over-typed - passing entire nested object
type Props = {
  data: { user: { profile: { name: string } } };
};

// ✅ Extract what you need at boundary
type Props = { userName: string };
<UserCard userName={data.user.profile.name} />
```

### Discriminated Unions for States

```typescript
type State = 
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; error: Error };

function render(props: { state: State }) {
  switch (props.state.status) {
    case 'loading': return <Spinner />;
    case 'success': return <List items={props.state.data} />;
    case 'error': return <Error message={props.state.error.message} />;
  }
}
```

### Zod for Runtime Validation + Types

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;
const user = UserSchema.parse(apiResponse);
```

### Generic Components - Use Sparingly

```typescript
// ✅ Good: Reusable data structures
function List<T>(props: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return props.items.map(props.renderItem);
}

// ❌ Avoid: Over-engineering one-off components
```

### Additional Type Safety Rules

- Prefer `interface` for objects, `type` for unions/intersections
- Use `satisfies` for autocomplete without widening types
- Avoid `as` casts - sign of poor type design
- Co-locate types with implementation
- Import directly from source files, not index.ts barrels (except small coupled modules)
- Enable `strict: true` in tsconfig.json

---

## Component Patterns

### Reusable Components

Extract components when:

1. The same UI pattern appears **2 or more times**
2. A complex block would benefit from a descriptive name
3. The component could be useful across multiple pages

### Component Location

- Shared components: `src/components/`
- Admin-specific: `src/components/admin/`
- Domain-specific: Consider creating domain folders (e.g., `src/components/auth/`)

### Component Structure

```typescript
type ComponentProps = {
  // Props with clear names and types
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
};

/**
 * Brief description of component purpose
 * Additional usage notes if needed
 */
export function ComponentName(props: ComponentProps) {
  return (
    <div>{props.value}</div>
  );
}
```

**Note:** Always use `props` object, never destructure at function signature.

### Existing Reusable Components

Before creating new components, check if these exist:

**General:**

- `FullPageLoader` - Full-page loading state with message
- `StoryProgressBar` - Progress visualization for stories
- `SpiceLevelSelector` - Spice level selection (1-5 flames)
- `RadioButtonGroup` - Generic radio button group (pacing, scene length, etc.)
- `FormInput` - Standard form input (use this for all forms!)
- `LoadingSpinner` - Inline loading indicator
- `ErrorMessage` - Error display component
- `EmptyState` - Empty state with icon and action

**Admin:**

- `StatCard` - Admin dashboard statistics card

### Component Spacing and Layout

**Components should NEVER set their own margins.** Parent layouts control spacing.

```typescript
// ✅ Good - parent controls spacing with gap
<div className="flex flex-col gap-4">
  <Heading level="h1">Title</Heading>
  <p>Description</p>
</div>

// ❌ Bad - component sets its own margin
const Heading = (props: Props) => <h1 className="mb-4">{props.children}</h1>;
```

**Exception:** Padding (p-, px-, py-) is allowed for components with backgrounds.

### Using FormInput Component

**Always use the existing `FormInput` component** for form fields instead of inline input elements:

#### DO

```typescript
import { FormInput } from "~/components/FormInput";

<FormInput
  id="name"
  label="Name"
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>
```

#### DON'T

```typescript
<div>
  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
    Name
  </label>
  <input
    id="name"
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-romance-500 focus:border-transparent"
  />
</div>
```

---

## API Patterns

### Fetch Requests

Always include `credentials: "include"` for authenticated requests:

```typescript
const response = await fetch("/api/endpoint", {
  credentials: "include",
});
```

### Error Handling

Standard error handling pattern:

```typescript
if (!response.ok) {
  if (response.status === 401) {
    navigate({ to: "/auth/login" });
    return null;
  }
  throw new Error("Failed to fetch data");
}
```

### Query Keys

Use descriptive, hierarchical query keys:

```typescript
// Good
["currentUser"]
["user-stories", status]
["templates", tropes, search]
["template", templateId]

// Bad
["user"]
["data"]
["items", id]
```

---

## File Organization

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   └── ...
├── hooks/              # Custom React hooks
├── lib/
│   ├── api/            # API client and types
│   │   └── types.ts    # Shared API types
│   ├── constants/      # App-wide constants
│   │   └── gradients.ts
│   ├── db/             # Database types and queries
│   ├── types/          # Other type definitions
│   └── utils/          # Utility functions
└── routes/             # TanStack Router pages
    ├── api/            # API routes
    └── ...
```

### Constants

Extract hardcoded values to constants files:

```typescript
// src/lib/constants/gradients.ts
export const GRADIENT_OPTIONS = [
  { value: "from-purple-600 to-pink-600", label: "Purple to Pink" },
  // ...
];
```

---

## Naming Conventions

### Files

- Components: PascalCase (e.g., `FormInput.tsx`)
- Hooks: camelCase starting with "use" (e.g., `useCurrentUserQuery.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: camelCase (e.g., `gradients.ts`)
- Types: camelCase (e.g., `types.ts`)

### Variables

- Components: PascalCase (e.g., `FormInput`)
- Hooks: camelCase starting with "use" (e.g., `useCurrentUserQuery`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `GRADIENT_OPTIONS`)
- Variables: camelCase (e.g., `userData`)
- Types/Interfaces: PascalCase (e.g., `UserStory`)

---

## Import Order

Organize imports in this order:

1. External libraries (React, TanStack, etc.)
2. Internal hooks
3. Internal components
4. Internal types
5. Internal utilities/constants
6. Relative imports

Example:

```typescript
// 1. External libraries
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Clock } from "lucide-react";
import { useState } from "react";

// 2. Internal hooks
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useUserStoriesQuery } from "~/hooks/useUserStoriesQuery";

// 3. Internal components
import { EmptyState } from "~/components/EmptyState";
import { Header } from "~/components/Header";
import { LoadingSpinner } from "~/components/LoadingSpinner";

// 4. Internal types
import type { UserStory } from "~/lib/api/types";

// 5. Internal utilities/constants
import { GRADIENT_OPTIONS } from "~/lib/constants/gradients";

// 6. Relative imports (if any)
import { localHelper } from "./utils";
```

---

## Best Practices Summary

### DRY (Don't Repeat Yourself)

1. **3+ uses = extract it**
   - Queries/mutations → custom hooks
   - UI patterns → components
   - Values → constants file

2. **2 uses = consider extraction**
   - If the pattern is complex or likely to grow

### Type Safety First

1. **Local types first** - define types where they're used
2. Never use `any` - use `unknown` if needed
3. **Use props object** - never destructure at function signature
4. Avoid barrel files (index.ts) except for small coupled modules
5. Share types only at API boundaries (`~/lib/api/types`)
6. Type all API responses
7. Extract what components need at boundaries (avoid type bloat)

### Component Reuse

1. Check existing components before creating new ones
2. Use `FormInput` for all form fields
3. Use `FullPageLoader` for loading states
4. Extract repeated JSX into components
5. Never add margins to reusable components - use parent gap/spacing
6. Always use `props` object, never destructure at signature

### Query Patterns

1. Use custom hooks for repeated queries
2. Include proper error handling
3. Use descriptive query keys
4. Include `credentials: "include"` for auth

### Documentation

1. Add JSDoc comments to all hooks and complex components
2. Include parameter descriptions
3. Document purpose and usage
4. Add examples where helpful

---

## Agent Instructions

When working on this codebase, AI agents should:

1. **Before creating anything new:**
   - Check `src/hooks/` for existing query/mutation hooks
   - Check `src/components/` for existing UI components
   - Check `src/lib/api/types.ts` for existing type definitions
   - Check `src/lib/constants/` for existing constants

2. **When adding new functionality:**
   - Follow the patterns established in this document
   - Extract reusable code (3+ uses rule)
   - Use existing shared types
   - Add proper TypeScript types
   - Include JSDoc documentation

3. **When refactoring:**
   - Look for repeated patterns to extract
   - Replace `any` types with proper interfaces
   - Use existing reusable components
   - Consolidate duplicate type definitions

4. **Code quality checks:**
   - No `any` types (use `unknown` instead)
   - No destructuring props at function signature (use `props` object)
   - No barrel files (except small coupled modules)
   - No component margins (use parent gap/spacing)
   - No duplicate interfaces (define locally)
   - No inline form inputs (use `FormInput`)
   - No repeated query/mutation patterns (use custom hooks)
   - Proper error handling on all API calls

---

## Red Flags to Avoid

- ❌ Destructuring props at function signature
- ❌ Shared `types/` folders with many type files
- ❌ Barrel files (index.ts re-exports) except small coupled modules
- ❌ Components importing types from 3+ levels deep
- ❌ Using `any` as escape hatch
- ❌ Components setting their own margins (mb-, mt-, mx-, my-)
- ❌ Complex utility type gymnastics
- ❌ Premature type abstraction
- ❌ Over-typed props (passing entire nested objects)

---

## Version History

- **v1.1** - Added TypeScript best practices (November 2025)
  - Props pattern: No destructuring rule
  - Local types first principle
  - Avoid barrel files guidance
  - Component spacing rules (no margins)
  - Type inference and discriminated unions
  
- **v1.0** - Initial documentation after major refactoring (2025)
  - Added custom hooks pattern
  - Established shared types system
  - Created reusable component library
  - Extracted constants
