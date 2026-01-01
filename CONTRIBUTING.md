# Contributing to Runn GUI Builder

Thank you for your interest in contributing to Runn GUI Builder! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing](#testing)

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive community.

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- Rust (latest stable)
- Platform-specific dependencies (see [README.md](README.md#prerequisites))

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/your-org/runn-gui.git
cd runn-gui

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, maintainable code
- Follow the coding standards below
- Add/update tests as needed
- Update documentation if necessary

### 3. Test Your Changes

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build frontend
npm run build

# Test Tauri app
npm run tauri dev
```

### 4. Commit Your Changes

Follow our [commit guidelines](#commit-guidelines).

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Coding Standards

### TypeScript/React

- **Type Safety**: Always use TypeScript types, avoid `any` where possible
- **Functional Components**: Use React functional components with hooks
- **State Management**: Use Zustand for global state, `useState`/`useEffect` for local state
- **Props**: Define clear prop interfaces for all components
- **Naming**:
  - Components: PascalCase (`HttpRequestEditor.tsx`)
  - Functions: camelCase (`handleSaveStep`)
  - Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
  - Files: Match component name (`HttpRequestEditor.tsx`)

### Code Organization

```typescript
// 1. Imports (grouped by external, internal, types)
import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/I18nContext';
import type { Step } from '../types/runbook';

// 2. Type definitions
interface MyComponentProps {
  step?: Step;
  onSave?: (step: Step) => void;
}

// 3. Component
export function MyComponent({ step, onSave }: MyComponentProps) {
  // 3.1. Hooks
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  // 3.2. Event handlers
  const handleSave = () => {
    // ...
  };

  // 3.3. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### CSS/Styling

- Use inline styles for component-specific styling
- Follow existing color scheme:
  - Background: `#2a2a2a`
  - Borders: `#444`
  - Text: `#fff`
  - Secondary text: `#aaa`
  - Accent colors: `#3498db` (blue), `#2ecc71` (green), `#e74c3c` (red)
- Use existing class names when possible: `btn`, `btn-primary`, `btn-secondary`, `form-control`

### Internationalization (i18n)

- All user-facing text must be added to `src/i18n/en.ts` and `src/i18n/ja.ts`
- Use translation keys via `const { t } = useTranslation();`
- Example:

```typescript
// en.ts
export const en = {
  myFeature: {
    title: 'My Feature',
    description: 'This is a description',
  },
};

// Component
const { t } = useTranslation();
return <h2>{t.myFeature.title}</h2>;
```

### Rust (Tauri Backend)

- Follow Rust naming conventions (snake_case for functions, PascalCase for types)
- Use `cargo fmt` for formatting
- Use `cargo clippy` for linting
- Keep backend minimal - most logic should be in frontend

## Commit Guidelines

We follow a conventional commit message format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD changes

### Examples

```bash
feat(steps): Include/Bindステップエディタを追加

- StepTypeSelectorコンポーネントを実装
- IncludeStepEditorとBindStepEditorを追加
- StepsEditorに新しいエディタを統合

fix(yaml): YAML preview auto-update after import

- Changed useState to useEffect with runbook dependency
- Preview now updates immediately after YAML import
```

## Pull Request Process

1. **Update Documentation**: Ensure README.md and other docs reflect your changes
2. **Add Tests**: If applicable, add tests for your changes
3. **Update i18n**: Add translations for both English and Japanese
4. **Type Check**: Run `npm run type-check` to ensure no TypeScript errors
5. **Lint**: Run `npm run lint` to ensure code quality
6. **Build**: Run `npm run build` to ensure the build succeeds
7. **Create PR**: Write a clear PR description explaining:
   - What changes were made
   - Why these changes were needed
   - How to test the changes
8. **CI Checks**: Ensure all CI checks pass
9. **Code Review**: Wait for maintainer review and address feedback

### PR Title Format

Use the same format as commit messages:

```
feat(steps): Add Include/Bind step editors
```

## Project Structure

### Frontend (`src/`)

```
src/
├── components/           # React components
│   ├── *Editor.tsx      # Editable form components
│   ├── *Viewer.tsx      # Read-only display components
│   └── *.tsx            # Other UI components
├── store/               # Zustand state management
│   └── runbookStore.ts  # Global runbook state
├── utils/               # Utility functions
│   └── yaml.ts          # YAML conversion logic
├── i18n/                # Internationalization
│   ├── en.ts            # English translations
│   ├── ja.ts            # Japanese translations
│   └── I18nContext.tsx  # i18n context provider
├── types/               # TypeScript type definitions
│   └── runbook.ts       # Core runbook types
└── App.tsx              # Main application component
```

### Backend (`src-tauri/`)

```
src-tauri/
├── src/
│   └── main.rs          # Tauri application setup
├── capabilities/        # Tauri permission system
│   └── default.json     # Default app capabilities
├── icons/               # Application icons
├── Cargo.toml           # Rust dependencies
└── tauri.conf.json      # Tauri configuration
```

## Testing

### Manual Testing Checklist

Before submitting a PR, test the following:

- [ ] Create HTTP request step
- [ ] Create Include step with variables
- [ ] Create Bind step with bindings
- [ ] Edit existing steps
- [ ] Drag and drop to reorder steps
- [ ] Add/edit runners
- [ ] Add/edit variables
- [ ] Generate YAML
- [ ] Export YAML to file
- [ ] Import YAML from file
- [ ] Execute runbook (if `runn` is installed)
- [ ] Switch between English and Japanese languages
- [ ] Build production binary (`npm run tauri build`)

### Testing in Different Environments

If possible, test on:
- macOS (Intel and/or Apple Silicon)
- Linux (Ubuntu 22.04+)
- Windows (Windows 10+)

## Adding New Features

### Adding a New Step Type

If you want to add support for a new runn step type (e.g., DB, gRPC, SSH):

1. **Update Types** (`src/types/runbook.ts`):
   - Add interface for the step type
   - Ensure `Step` type includes the new type

2. **Add i18n Translations** (`src/i18n/en.ts` and `src/i18n/ja.ts`):
   - Add section for the new step type with all necessary labels

3. **Create Viewer Component** (`src/components/XxxStepViewer.tsx`):
   - Display step in read-only format
   - Show all relevant fields

4. **Create Editor Component** (`src/components/XxxStepEditor.tsx`):
   - Follow the pattern from `HttpRequestEditor.tsx`
   - Support both create and edit modes
   - Implement proper validation

5. **Update StepTypeSelector** (`src/components/StepTypeSelector.tsx`):
   - Add the new type to `stepTypes` array
   - Set `enabled: true`
   - Add appropriate icon

6. **Update StepsEditor** (`src/components/StepsEditor.tsx`):
   - Add routing logic for the new step type
   - Update step display info logic
   - Add import for new viewer/editor

7. **Update YAML Utils** (`src/utils/yaml.ts`):
   - Ensure YAML export handles the new step type
   - Test YAML import/export

8. **Update Documentation**:
   - Add examples to README.md
   - Update this CONTRIBUTING.md if needed

## Need Help?

- Check existing [issues](https://github.com/your-org/runn-gui/issues)
- Review the [runn documentation](https://github.com/k1LoW/runn)
- Look at existing components for patterns
- Ask questions in pull request comments

## License

By contributing to Runn GUI Builder, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
