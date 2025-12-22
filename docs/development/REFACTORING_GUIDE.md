# Quick Refactoring Reference Guide

This guide provides quick reference for the ongoing codebase refactoring to enforce coding standards.

---

## 📚 Documentation

- **[REFACTORING_CHECKLIST.md](./REFACTORING_CHECKLIST.md)** - Complete checklist with all remaining work
- **[CODING_PRACTICES.md](./CODING_PRACTICES.md)** - Coding standards and patterns
- **[.clauderc](../../.clauderc)** - Enforced coding rules

---

## 🎯 Core Principles

### 1. Props Object Pattern (ALWAYS)

```typescript
// ❌ NEVER do this
export function Component({ prop1, prop2 }: Props) { }

// ✅ ALWAYS do this
export function Component(props: Props) { }
```

### 2. Parent Controls Spacing (NO MARGINS)

```typescript
// ❌ NEVER set margins on components
<ErrorMessage className="mt-4" />

// ✅ ALWAYS use parent spacing
<div className="space-y-4">
  <Input />
  <ErrorMessage />
</div>
```

### 3. Use Shared Components (NO RAW HTML)

```typescript
// ❌ NEVER use raw form inputs
<input type="text" />
<textarea />
<button>Submit</button>

// ✅ ALWAYS use shared components
<FormInput label="Name" />
<FormTextarea label="Message" />
<Button>Submit</Button>
```

---

## 📋 Quick Commands

### Find Violations

```bash
# Props destructuring
grep -rn "^export function \w\+({" src/ --include="*.tsx"

# Component margins
grep -rn 'className="[^"]*m[btlrxy]-' src/components --include="*.tsx"

# Raw form inputs
grep -rn '<input' src/routes --include="*.tsx" | grep -v "FormInput"

# Any types
grep -rn ': any' src/ --include="*.ts" --include="*.tsx"
```

### Verify Changes

```bash
# TypeScript compilation
pnpm exec tsc --noEmit

# Linting
pnpm lint
pnpm lint:md

# Run validation (once implemented)
pnpm validate
```

---

## 🚀 Component Refactoring Template

Use this template when refactoring components:

```typescript
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ComponentProps {
  variant?: "default" | "primary";
  className?: string;
  children: ReactNode;
}

/**
 * ComponentName - Brief description
 * Follows props object pattern (no destructuring)
 *
 * @param props.variant - Style variant (default: "default")
 * @param props.className - Additional CSS classes
 * @param props.children - Component content
 */
export function ComponentName(props: ComponentProps) {
  const variant = props.variant || "default";

  return (
    <div className={cn("base-styles", variantClasses[variant], props.className)}>
      {props.children}
    </div>
  );
}
```

---

## ✅ Completed Components (Reference Examples)

Good examples to follow:

- ✅ `src/components/FormInput.tsx`
- ✅ `src/components/FormTextarea.tsx`
- ✅ `src/components/Button.tsx`
- ✅ `src/components/ui/Card.tsx`
- ✅ `src/components/ui/Stack.tsx`
- ✅ `src/components/ui/Alert.tsx`
- ✅ `src/components/Heading.tsx`
- ✅ `src/components/ui/Text.tsx`

---

## 📊 Current Progress

**Phase 1**: ✅ Complete (5/5 tasks)
**Phase 2**: 🚧 In Progress (9/11 tasks)
**Phase 3-7**: ⏳ Pending (~60 files remaining)

See [REFACTORING_CHECKLIST.md](./REFACTORING_CHECKLIST.md) for complete details.

---

## 🐛 Common Issues & Solutions

### Issue: TypeScript errors after refactoring

**Solution**: Ensure you're not destructuring at the function signature. Destructure inside the function body if needed.

### Issue: Spacing looks wrong after removing margins

**Solution**: Use parent container with `gap` or `space-y` classes:

```typescript
<Stack gap="md">  {/* or <div className="space-y-4"> */}
  <Component1 />
  <Component2 />
</Stack>
```

### Issue: Need to pass HTML attributes

**Solution**: Destructure inside function to separate custom props from HTML props:

```typescript
export function FormInput(props: FormInputProps) {
  const { label, error, className, ...inputProps } = props;
  return <input className={cn("base", className)} {...inputProps} />;
}
```

---

## 📞 Need Help?

1. Check [CODING_PRACTICES.md](./CODING_PRACTICES.md) for detailed patterns
2. Look at completed components as examples
3. Run validation commands to verify compliance
4. Review the [REFACTORING_CHECKLIST.md](./REFACTORING_CHECKLIST.md) for context

---

**Last Updated**: 2025-12-22
