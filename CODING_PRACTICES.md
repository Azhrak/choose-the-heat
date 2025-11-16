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

### Existing Custom Hooks

Always check `src/hooks/` before creating duplicate query/mutation logic. Current hooks include:

- `useCurrentUserQuery` - Fetch current user profile (18+ uses)
- `useUserStoriesQuery` - Fetch user stories by status
- `useTemplatesQuery` - Fetch templates with filters
- `useUserPreferencesQuery` - Fetch user preferences
- `useDeleteStoryMutation` - Delete story with auto-invalidation

---

## Type Safety

### Shared Type Definitions

All shared types must be defined in `src/lib/api/types.ts`

#### DO

```typescript
// In src/lib/api/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  // ... other fields
}

// In component file
import type { User } from "~/lib/api/types";
```

#### DON'T

```typescript
// DON'T define interfaces inline in components
interface User {
  id: string;
  email: string;
  // ...
}
```

### Type Re-exports

Types that originate from `~/lib/db/types` should be re-exported from `~/lib/api/types` for consistency:

```typescript
// In src/lib/api/types.ts
import type { UserRole, TemplateStatus } from "~/lib/db/types";

// Re-export for consistency
export type { UserRole, TemplateStatus };
```

### Avoid `any` Types

Always define proper types instead of using `any`.

#### DO

```typescript
const stats: {
  total: number;
  active: number;
} = {
  total: 0,
  active: 0,
};
```

#### DON'T

```typescript
const stats: any = {};
```

### API Response Types

Always type API responses properly:

```typescript
// Define response interface
interface TemplatesResponse {
  templates: Template[];
}

// Use in query
return response.json() as Promise<TemplatesResponse>;
```

### Shared Type Catalog

Current shared types in `src/lib/api/types.ts`:

- `Template` - Novel template with all fields
- `User` - User account information
- `UserStory` - Story with template relation
- `Scene` - Story scene content
- `AuditLog` - Admin audit log entry
- `DashboardStats` - Admin dashboard statistics
- `StoryStatus` - "in-progress" | "completed"
- `TemplateStatus` - "draft" | "published" | "archived"

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
interface ComponentProps {
  // Props with clear names and types
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}

/**
 * Brief description of component purpose
 * Additional usage notes if needed
 */
export function ComponentName({ value, onChange, optional = true }: ComponentProps) {
  return (
    // JSX
  );
}
```

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
   - Types → shared types file
   - Values → constants file

2. **2 uses = consider extraction**
   - If the pattern is complex or likely to grow

### Type Safety First

1. Never use `any` - always define proper types
2. Use shared types from `~/lib/api/types`
3. Type all API responses
4. Type all component props

### Component Reuse

1. Check existing components before creating new ones
2. Use `FormInput` for all form fields
3. Use `FullPageLoader` for loading states
4. Extract repeated JSX into components

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
   - No `any` types
   - No duplicate interfaces
   - No inline form inputs (use `FormInput`)
   - No repeated query/mutation patterns (use custom hooks)
   - Proper error handling on all API calls

---

## Version History

- **v1.0** - Initial documentation after major refactoring (2025)
  - Added custom hooks pattern
  - Established shared types system
  - Created reusable component library
  - Extracted constants
