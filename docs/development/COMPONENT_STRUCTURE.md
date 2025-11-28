# Component Structure Guide

This document describes the component organization patterns used in the Choose the Heat project.

## Container/Presentational Pattern

Large route files follow a clean separation between container (smart) and presentational (dumb) components:

- **Route files** (`src/routes/*.tsx`) - Smart containers handling:
  - State management
  - API calls and data fetching
  - Business logic and validation
  - Side effects
  - Event handlers
- **Component files** (`src/components/*/*.tsx`) - Presentational components handling:
  - UI rendering
  - User interactions (via callback props)
  - Display logic
  - Styling

## Directory Structure

```
src/components/
├── Button.tsx                    # General reusable components
├── EmptyState.tsx
├── ErrorMessage.tsx
├── FormInput.tsx
├── FullPageLoader.tsx
├── Header.tsx
├── LoadingSpinner.tsx
├── NovelCard.tsx
├── PageContainer.tsx
├── RadioButtonGroup.tsx
├── SpiceLevelSelector.tsx
├── StoryProgressBar.tsx
├── profile/                      # Profile page components
│   ├── ProfileInformation.tsx
│   ├── PasswordChange.tsx
│   ├── PreferencesDisplay.tsx
│   ├── DangerZone.tsx
│   ├── DeleteAccountModal.tsx
│   └── index.ts
├── preferences/                  # Preferences page components
│   ├── GenresSection.tsx
│   ├── TropesSection.tsx
│   ├── SpiceLevelSection.tsx
│   ├── PacingSection.tsx
│   ├── SceneLengthSection.tsx
│   └── index.ts
└── admin/                        # Admin-specific components
    ├── AdminLayout.tsx
    ├── AdminNav.tsx
    ├── ConfirmDialog.tsx
    ├── DataTable.tsx
    ├── NoPermissions.tsx
    ├── RoleBadge.tsx
    ├── StatCard.tsx
    ├── StatusBadge.tsx
    └── index.ts
```

## Naming Conventions

### Component Files

- Use PascalCase: `ProfileInformation.tsx`, `GenresSection.tsx`
- Name matches the exported component
- One component per file (except barrel exports)

### Barrel Exports

- Use `index.ts` to re-export all components from a directory
- Allows clean imports: `import { ProfileInformation, PasswordChange } from "~/components/profile"`

### Props Interfaces

- Named after component with `Props` suffix: `ProfileInformationProps`
- Defined in the same file as the component
- Export if needed elsewhere

## Component Patterns

### 1. Form Section Components

Components that render a section of a larger form:

```typescript
interface GenresSectionProps {
  selectedGenres: Genre[];
  onToggle: (genre: Genre) => void;
}

export function GenresSection({ selectedGenres, onToggle }: GenresSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Render genre selection UI */}
    </div>
  );
}
```

**Characteristics:**

- Controlled components (state managed by parent)
- Callback props for user interactions
- Display-only logic (no API calls)
- Self-contained styling

### 2. Modal Components

Full-screen overlay components:

```typescript
interface DeleteAccountModalProps {
  isOpen: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  error?: string;
}

export function DeleteAccountModal({ isOpen, ...props }: DeleteAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal content */}
    </div>
  );
}
```

**Characteristics:**

- Conditional rendering based on `isOpen` prop
- Fixed positioning and z-index
- Callback props for all actions
- Error display built-in

### 3. Display Components

Read-only components that format and display data:

```typescript
interface PreferencesDisplayProps {
  preferences: any;
}

export function PreferencesDisplay({ preferences }: PreferencesDisplayProps) {
  if (!preferences) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Format and display preferences */}
    </div>
  );
}
```

**Characteristics:**

- No state management
- Data formatting/transformation
- Conditional rendering for empty states
- Optional action links

## Example: Profile Page Refactoring

### Before (613 lines)

```typescript
// src/routes/profile.tsx - Everything in one file
function ProfilePage() {
  // 50+ lines of state declarations
  // 150 lines of event handlers
  // 400+ lines of JSX
}
```

### After (~140 lines)

```typescript
// src/routes/profile.tsx - Container component
import {
  ProfileInformation,
  PasswordChange,
  PreferencesDisplay,
  DangerZone,
  DeleteAccountModal,
} from "~/components/profile";

function ProfilePage() {
  // State declarations
  // Event handlers

  return (
    <PageContainer>
      <ProfileInformation {...profileProps} />
      <PasswordChange {...passwordProps} />
      <PreferencesDisplay preferences={profile?.preferences} />
      <DangerZone onDeleteClick={() => setShowDeleteModal(true)} />
      <DeleteAccountModal {...modalProps} />
    </PageContainer>
  );
}
```

### Benefits Achieved

1. **Readability:** Route file is now easy to scan and understand
2. **Testability:** Each component can be tested in isolation
3. **Reusability:** Components can be used in other contexts
4. **Maintainability:** Changes are localized to specific components
5. **Type Safety:** Well-defined prop interfaces catch errors early

## When to Extract a Component

Extract a component when:

1. **Size:** Section exceeds ~50 lines of JSX
2. **Reusability:** Pattern is used in multiple places
3. **Complexity:** Logic is self-contained and complex
4. **Testing:** Section needs isolated testing
5. **Readability:** Main component is hard to scan

## When NOT to Extract

Don't extract when:

1. **Tightly Coupled:** Component needs too many props (>8)
2. **Single Use:** Used only once and simple (<30 lines)
3. **Dynamic:** Structure changes frequently based on complex conditions
4. **Context Heavy:** Needs deep context from parent

## Best Practices

### 1. Component Size

- Keep components under 200 lines
- Extract sub-components if needed
- Use composition over large components

### 2. Props Interface

```typescript
// ✅ Good - Clear, focused props
interface ProfileInformationProps {
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
  error?: string;
  success?: string;
}

// ❌ Bad - Too many props, unclear purpose
interface ProfileSectionProps {
  data: any;
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  error?: string;
  // ... 10 more props
}
```

### 3. Callback Props

```typescript
// ✅ Good - Specific callbacks
onGenreToggle: (genre: Genre) => void;
onSpiceLevelChange: (level: SpiceLevel) => void;

// ❌ Bad - Generic callbacks
onChange: (field: string, value: any) => void;
```

### 4. State Management

```typescript
// ✅ Good - State in container
function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <ProfileInformation
      name={name}
      email={email}
      onNameChange={setName}
      onEmailChange={setEmail}
    />
  );
}

// ❌ Bad - State in presentational component
function ProfileInformation() {
  const [name, setName] = useState(""); // Should be in parent
  // ...
}
```

### 5. Error Handling

```typescript
// ✅ Good - Display errors passed as props
export function PasswordChange({ error, success, ...props }) {
  return (
    <div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      {/* Form content */}
    </div>
  );
}

// ❌ Bad - Handle errors internally
export function PasswordChange() {
  const [error, setError] = useState(""); // Should be in parent
  // ...
}
```

## Migration Strategy

When refactoring a large route file:

1. **Identify Sections:** Find logical boundaries in JSX
2. **Define Props:** Determine what data each section needs
3. **Create Component:** Extract JSX to new file
4. **Add Props Interface:** Define TypeScript interface
5. **Update Container:** Replace JSX with component
6. **Test:** Verify functionality
7. **Iterate:** Repeat for remaining sections

## References

- [React Docs - Thinking in React](https://react.dev/learn/thinking-in-react)
- [Container/Presentational Pattern](https://www.patterns.dev/posts/presentational-container-pattern)
- `CODING_PRACTICES.md` - Project coding standards
- `REFACTORING_SUMMARY.md` - Refactoring history
