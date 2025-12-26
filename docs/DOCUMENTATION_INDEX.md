# Documentation Index

This index helps navigate the Choose the Heat project documentation.

**Last Updated**: 2025-12-26

---

## 📖 Getting Started

Start here if you're new to the project:

1. **[README.md](../README.md)** - Project overview, features, and quick start
2. **[Docker Setup](getting-started/DOCKER.md)** - Recommended Docker setup guide
3. **[Deployment Guide](getting-started/DEPLOYMENT.md)** - Production deployment instructions
4. **[.env.example](../.env.example)** - Environment variables template

---

## 🎯 Features

Complete feature documentation following standardized templates for AI-maintainability:

- **[Authentication & User Management](features/authentication.md)** - User auth, sessions, role-based access
  - OAuth (Google) and email/password authentication
  - Arctic auth library integration
  - User, Editor, Admin roles
  - Profile management

- **[AI Story Generation](features/ai-story-generation.md)** - AI-powered story and scene generation
  - Template generation (trope-based and prompt-based)
  - Multi-provider support (OpenAI, Gemini, Claude, Mistral, xAI)
  - Scene metadata and context management
  - Streaming generation and caching

- **[Personalization & Preferences](features/personalization.md)** - User preference system
  - Spice level settings (1-5)
  - Pacing options (slow-burn, medium, fast-paced)
  - Scene length and POV character preferences
  - Genre and trope preferences

- **[Story Experience](features/story-experience.md)** - Interactive story reading
  - Reading interface and scene navigation
  - Interactive choice points
  - Progress tracking
  - Story creation and management

- **[Text-to-Speech](features/text-to-speech.md)** - TTS audio generation and playback
  - Multi-provider support (OpenAI TTS, Google Cloud TTS)
  - Google Cloud Storage integration
  - Audio caching and lifecycle management
  - Streaming audio (experimental)

- **[Admin Dashboard](features/admin-dashboard.md)** - Administrative features
  - Role-based access control
  - User management (Admin only)
  - Template management (Editor/Admin)
  - Audit logging and system statistics

- **[Stripe Billing Integration](features/stripe-billing.md)** - 🚧 In Development
  - Subscription tier management (Free, Basic, Premium, Premium Plus)
  - Stripe payment processing integration
  - Invoice tracking and webhook sync
  - Admin panel for tier management
  - **Status**: Backend complete, frontend pending

**Template**: See [FEATURE_DOCUMENTATION_TEMPLATE.md](FEATURE_DOCUMENTATION_TEMPLATE.md) for creating new feature docs

**AI Maintenance**: See [AI_AGENT_GUIDELINES.md](AI_AGENT_GUIDELINES.md) for keeping docs in sync with code

---

## ⚙️ Configuration

### AI Configuration

- **[AI Providers](configuration/AI_PROVIDERS.md)** - Configure OpenAI, Google Gemini, Anthropic Claude, Mistral, or xAI
  - Admin UI for provider management (`/admin/providers`)
  - Provider status monitoring (ready, incomplete, invalid, unconfigured)
  - Secure API key storage with AES-256 encryption
  - API key setup and validation for each provider
  - Model selection and configuration
  - Provider activation and switching
  - Cost estimation

---

## 👨‍💻 Development

### Development Standards

- **[Coding Practices](development/CODING_PRACTICES.md)** - Development standards and patterns
  - Custom hooks patterns
  - Component patterns
  - Type safety requirements
  - File organization
  - Import order

- **[Component Usage](development/COMPONENT_USAGE.md)** - Component usage guidelines
  - UI component library
  - When to create new components
  - Reusability patterns

### Project Status

- **[Implementation Progress](development/PROGRESS.md)** - Detailed implementation status and roadmap
  - Completed phases (1-15+)
  - Feature implementation details
  - Technical decisions
  - Future roadmap

- **[Refactoring](development/REFACTORING.md)** - Refactoring documentation
  - Completed refactorings (Phases 1-7)
  - Code quality metrics (9.4/10)
  - Best practices
  - Technical debt tracking

### Database & CI/CD

- **[CI/CD & Migrations](development/CI_MIGRATIONS.md)** - CI/CD and database migrations
  - GitHub Actions workflow
  - Migration best practices
  - Rollback strategies
  - Troubleshooting

- **[Database Migrations](development/MIGRATIONS.md)** - Database migration reference
  - Migration history
  - Schema changes
  - Manual migration procedures

### Design System

- **[Design System](development/DESIGN_SYSTEM.md)** - Design system guidelines
  - Color palette
  - Typography scales
  - Spacing system
  - Component usage

- **[Component Library](development/COMPONENT_LIBRARY.md)** - Component library API reference
  - UI components (Stack, Card, Text, Modal, etc.)
  - Props and usage examples
  - Accessibility notes

- **[Component Structure](development/COMPONENT_STRUCTURE.md)** - Component architecture
  - Component organization
  - File structure
  - Naming conventions

---

## 🔧 Technical Reference

### Architecture

> **Note**: Technical documentation has been reorganized into feature-centric docs.
> See the [Features](#-features) section above for complete technical details.
>
> Archived technical docs are available in [archive/](archive/) for historical reference.

- **AI System Architecture** - See [features/ai-story-generation.md](features/ai-story-generation.md)
  - Scene metadata system (97% token reduction)
  - Multi-provider support
  - Streaming and caching

- **Text-to-Speech Architecture** - See [features/text-to-speech.md](features/text-to-speech.md)
  - Multi-provider support (OpenAI, Google Cloud TTS)
  - Google Cloud Storage integration
  - Audio player features
  - Voice management and consistency
  - Cost estimation and performance

### Admin Features

- **[Admin Dashboard](technical/ADMIN.md)** - Admin dashboard guide
  - Role-based access control
  - Template management
  - User management
  - Audit logging
  - System settings

---

## 📋 Legal & Compliance

- **[GDPR Implementation](legal/GDPR_IMPLEMENTATION_SUMMARY.md)** - GDPR compliance
  - Cookie consent implementation
  - Data privacy features
  - User data management
  - Compliance checklist

---

## 🗂️ Documentation Structure

```
docs/
├── DOCUMENTATION_INDEX.md (this file)
├── FEATURE_DOCUMENTATION_TEMPLATE.md
├── DOCUMENTATION_REORGANIZATION_PLAN.md
├── api-key-management.md
├── features/                          # ← NEW: Feature-centric documentation
│   ├── authentication.md              # Auth & user management
│   ├── ai-story-generation.md         # Story & scene generation
│   ├── personalization.md             # User preferences
│   ├── story-experience.md            # Reading & navigation
│   ├── text-to-speech.md              # TTS audio generation
│   └── admin-dashboard.md             # Admin & editor features
├── getting-started/
│   ├── DOCKER.md
│   └── DEPLOYMENT.md
├── configuration/
│   └── AI_PROVIDERS.md
├── development/
│   ├── PROGRESS.md
│   ├── CODING_PRACTICES.md
│   ├── COMPONENT_USAGE.md
│   ├── REFACTORING.md
│   ├── CI_MIGRATIONS.md
│   ├── MIGRATIONS.md
│   ├── DESIGN_SYSTEM.md
│   ├── COMPONENT_LIBRARY.md
│   └── COMPONENT_STRUCTURE.md
├── technical/
│   ├── ADMIN.md                       # ← TO BE ARCHIVED (migrated to features/)
│   ├── SCENE_METADATA.md              # ← TO BE ARCHIVED (migrated to features/)
│   └── TEXT_TO_SPEECH.md              # ← TO BE ARCHIVED (migrated to features/)
├── legal/
│   └── GDPR_IMPLEMENTATION_SUMMARY.md
└── archive/
    ├── DOCUMENTATION_CLEANUP_2025-11-28.md
    ├── DOCUMENTATION_REORGANIZATION_2025-11-28.md
    ├── LINKBUTTON_COMPONENT_PLAN.md
    ├── SETTINGS_IMPLEMENTATION_PLAN.md
    └── TTS_IMPLEMENTATION_PLAN.md
```

---

## 🔍 Quick Links by Role

### New Developer

1. [README.md](../README.md) - Project overview
2. [Docker Setup](getting-started/DOCKER.md) - Setup environment
3. [Coding Practices](development/CODING_PRACTICES.md) - Learn patterns
4. [Component Library](development/COMPONENT_LIBRARY.md) - UI components
5. [Features Documentation](features/) - Comprehensive feature guides

### DevOps Engineer

1. [Deployment Guide](getting-started/DEPLOYMENT.md) - Deploy application
2. [Docker Setup](getting-started/DOCKER.md) - Container setup
3. [CI/CD & Migrations](development/CI_MIGRATIONS.md) - CI/CD pipeline

### Product Manager

1. [README.md](../README.md) - Feature overview
2. [Implementation Progress](development/PROGRESS.md) - Implementation status
3. [Features Documentation](features/) - Complete feature capabilities
4. [Admin Dashboard](features/admin-dashboard.md) - Admin capabilities

### AI Integration Engineer

1. [AI Providers](configuration/AI_PROVIDERS.md) - Provider config
2. [AI Story Generation](features/ai-story-generation.md) - Generation system
3. [Text-to-Speech](features/text-to-speech.md) - TTS integration
4. [Implementation Progress](development/PROGRESS.md#phase-35-ai-integration) - AI features

---

## 📝 Documentation Guidelines

### When to Create New Documentation

Create new documentation when:

- Adding a new major feature or system
- Introducing new development patterns
- Documenting complex technical decisions
- Providing setup/configuration guides

### When to Update Existing Documentation

Update documentation when:

- Features change significantly
- New patterns are established
- Dependencies are updated
- Configuration changes

### Documentation Best Practices

1. **Keep README.md concise** - Link to detailed docs in `docs/` folder
2. **Update PROGRESS.md for new features** - Maintain implementation history
3. **Document in code** - Use JSDoc for functions and components
4. **Cross-reference related docs** - Help navigation with relative links
5. **Archive completed plans** - Move to `docs/archive/` once complete
6. **Organize by category** - Use appropriate subfolder (getting-started, development, technical, etc.)

---

## 📊 Document Status

| Category | Document | Status | Size |
|----------|----------|--------|------|
| **Features** | authentication.md | 🚧 In Progress | ~200 lines |
| | ai-story-generation.md | 🚧 In Progress | ~250 lines |
| | personalization.md | 🚧 In Progress | ~180 lines |
| | story-experience.md | 🚧 In Progress | ~180 lines |
| | text-to-speech.md | 🚧 In Progress | ~200 lines |
| | admin-dashboard.md | 🚧 In Progress | ~200 lines |
| **Getting Started** | DOCKER.md | ✅ Active | ~400 lines |
| | DEPLOYMENT.md | ✅ Active | ~550 lines |
| **Configuration** | AI_PROVIDERS.md | ✅ Active | ~400 lines |
| **Development** | PROGRESS.md | ✅ Active | ~1,200 lines |
| | CODING_PRACTICES.md | ✅ Active | ~700 lines |
| | COMPONENT_USAGE.md | ✅ Active | ~350 lines |
| | REFACTORING.md | ✅ Active | ~450 lines |
| | CI_MIGRATIONS.md | ✅ Active | ~150 lines |
| | MIGRATIONS.md | ✅ Active | ~400 lines |
| | DESIGN_SYSTEM.md | ✅ Active | ~300 lines |
| | COMPONENT_LIBRARY.md | ✅ Active | ~400 lines |
| | COMPONENT_STRUCTURE.md | ✅ Active | ~300 lines |
| **Technical** | ADMIN.md | ⏳ To Be Archived | ~550 lines |
| | SCENE_METADATA.md | ⏳ To Be Archived | ~320 lines |
| | TEXT_TO_SPEECH.md | ⏳ To Be Archived | ~650 lines |
| **Legal** | GDPR_IMPLEMENTATION_SUMMARY.md | ✅ Active | ~300 lines |

---

## 📧 Contributing

When contributing documentation:

1. Place docs in appropriate subfolder under `docs/`
2. Update this index if adding new docs
3. Cross-reference related documentation with relative links
4. Use clear, concise language
5. Include code examples where helpful
6. Update "Last Updated" dates
7. Move completed implementation plans to `docs/archive/`

---

*For questions or suggestions about documentation, please open a GitHub issue.*
