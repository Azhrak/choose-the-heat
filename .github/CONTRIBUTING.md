# Contributing to Spicy Tales

First off, thank you for considering contributing to Spicy Tales! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment for all contributors.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed and what you expected
- Include screenshots if relevant
- Note your environment (OS, Node version, Docker vs local, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a detailed description of the suggested enhancement
- Explain why this enhancement would be useful
- List any alternative solutions or features you've considered

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes (`pnpm test`)
4. Make sure your code lints (`pnpm lint`)
5. Update documentation as needed
6. Write a clear commit message

## Development Setup

### Prerequisites

- Node.js 24+
- PostgreSQL 14+
- pnpm 9+
- Docker (optional, but recommended)

### Local Development

1. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/spicy-tales.git
cd spicy-tales
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy environment variables:

```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Set up the database:

```bash
pnpm db:migrate
pnpm db:seed
```

5. Start development server:

```bash
pnpm dev
```

### Docker Development

```bash
docker-compose up --build
```

## Project Structure

```
src/
├── routes/          # TanStack Router pages and API routes
├── components/      # React components
├── lib/
│   ├── db/         # Database (Kysely) and migrations
│   ├── auth/       # Authentication logic
│   └── ai/         # AI provider integration
└── styles/         # Global styles
```

## Style Guidelines

### Code Style

- Use TypeScript strict mode
- Follow the existing code style (enforced by Biome)
- Write meaningful commit messages
- Keep functions small and focused
- Add comments for complex logic

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Examples:

```
Add user onboarding flow

- Create multi-step preference form
- Add API endpoint for saving preferences
- Update UI components

Fixes #123
```

## Testing

Before submitting a pull request, make sure:

```bash
# Lint your code
pnpm lint

# Format your code
pnpm format

# Run tests (when available)
pnpm test
```

## Documentation

- Update the README.md if you change functionality
- Update PROGRESS.md for feature completions
- Add JSDoc comments for new functions/components
- Update AI_PROVIDERS.md for AI-related changes

## Questions?

Feel free to open an issue with the "question" label, or reach out to the maintainers.

Thank you for contributing! 🚀
