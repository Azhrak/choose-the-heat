# Documentation Index

This index helps navigate the Choose the Heat project documentation.

**Last Updated**: 2025-11-28

---

## 📖 Getting Started

Start here if you're new to the project:

1. **[README.md](../README.md)** - Project overview, features, and quick start
2. **[Docker Setup](getting-started/DOCKER.md)** - Recommended Docker setup guide
3. **[Deployment Guide](getting-started/DEPLOYMENT.md)** - Production deployment instructions
4. **[.env.example](../.env.example)** - Environment variables template

---

## ⚙️ Configuration

### AI Configuration
- **[AI Providers](configuration/AI_PROVIDERS.md)** - Configure OpenAI, Google Gemini, Anthropic Claude, Mistral, or xAI
  - API key setup for each provider
  - Model selection and configuration
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
- **[AI Metadata System](technical/SCENE_METADATA.md)** - AI metadata system
  - Metadata structure (emotional_beat, tension_threads, etc.)
  - Token reduction strategy (97% reduction)
  - Parsing and storage
  - Context summarization

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
│   ├── ADMIN.md
│   └── SCENE_METADATA.md
├── legal/
│   └── GDPR_IMPLEMENTATION_SUMMARY.md
└── archive/
    ├── DOCUMENTATION_CLEANUP_2025-11-28.md
    ├── LINKBUTTON_COMPONENT_PLAN.md
    └── SETTINGS_IMPLEMENTATION_PLAN.md
```

---

## 🔍 Quick Links by Role

### New Developer
1. [README.md](../README.md) - Project overview
2. [Docker Setup](getting-started/DOCKER.md) - Setup environment
3. [Coding Practices](development/CODING_PRACTICES.md) - Learn patterns
4. [Component Library](development/COMPONENT_LIBRARY.md) - UI components

### DevOps Engineer
1. [Deployment Guide](getting-started/DEPLOYMENT.md) - Deploy application
2. [Docker Setup](getting-started/DOCKER.md) - Container setup
3. [CI/CD & Migrations](development/CI_MIGRATIONS.md) - CI/CD pipeline

### Product Manager
1. [README.md](../README.md) - Feature overview
2. [Implementation Progress](development/PROGRESS.md) - Implementation status
3. [Admin Dashboard](technical/ADMIN.md) - Admin capabilities

### AI Integration Engineer
1. [AI Providers](configuration/AI_PROVIDERS.md) - Provider config
2. [AI Metadata System](technical/SCENE_METADATA.md) - Metadata system
3. [Implementation Progress](development/PROGRESS.md#phase-35-ai-integration) - AI features

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
| **Technical** | ADMIN.md | ✅ Active | ~550 lines |
| | SCENE_METADATA.md | ✅ Active | ~320 lines |
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
