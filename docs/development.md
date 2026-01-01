# Development Guide

This guide provides detailed information for developers working on Runn GUI Builder.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Project Configuration](#project-configuration)
- [Development Workflow](#development-workflow)
- [Code Organization](#code-organization)
- [State Management](#state-management)
- [Adding New Features](#adding-new-features)
- [Testing](#testing)
- [Debugging](#debugging)
- [Build & Release](#build--release)
- [Troubleshooting](#troubleshooting)

## Environment Setup

### Required Tools

1. **Node.js** (LTS version recommended)
   ```bash
   # Check version
   node --version  # Should be >= 18.x

   # Install via nvm (recommended)
   nvm install --lts
   nvm use --lts
   ```

2. **Rust** (latest stable)
   ```bash
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

   # Check version
   rustc --version
   cargo --version

   # Update Rust
   rustup update stable
   ```

3. **Platform-Specific Dependencies**

   **macOS:**
   ```bash
   # Install Xcode Command Line Tools
   xcode-select --install
   ```

   **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt-get update
   sudo apt-get install -y \
     libwebkit2gtk-4.1-dev \
     libappindicator3-dev \
     librsvg2-dev \
     patchelf
   ```

   **Windows:**
   - Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
   - Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/) with C++ development tools

### Optional Tools

- **runn CLI** (for testing runbook execution)
  ```bash
  # macOS/Linux
  brew install k1LoW/tap/runn

  # Or download from GitHub
  # https://github.com/k1LoW/runn/releases
  ```

- **VS Code Extensions** (recommended)
  - ESLint
  - Prettier
  - Rust Analyzer
  - Tauri

## Project Configuration

### package.json

Key dependencies:
```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.9.1",
    "react": "^19.2.0",
    "zustand": "^5.0.9",
    "js-yaml": "^4.1.1",
    "@dnd-kit/core": "^6.3.1"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.9.6",
    "typescript": "~5.9.3",
    "vite": "npm:rolldown-vite@7.2.5"
  }
}
```

### tsconfig.json

TypeScript configuration with strict mode:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}
```

### Vite Configuration (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
});
```

### Tauri Configuration (src-tauri/tauri.conf.json)

```json
{
  "productName": "runn-gui",
  "version": "0.1.0",
  "identifier": "com.example.runn-gui",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:5173"
  }
}
```

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/runn-gui.git
cd runn-gui

# Install dependencies
npm install
```

### Running in Development Mode

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Tauri (in separate terminal)
npm run tauri dev
```

Or run both together:
```bash
npm run tauri dev
# This automatically starts Vite dev server first
```

### Hot Reload

- **Frontend**: Changes to React components automatically reload
- **Backend**: Changes to Rust code require Tauri restart

### Type Checking

```bash
# Check TypeScript types
npm run type-check

# Watch mode
tsc -b --watch
```

### Linting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Building

```bash
# Build frontend only
npm run build

# Build complete Tauri app
npm run tauri build
```

## Code Organization

### Directory Structure

```
runn-gui/
├── src/                          # React frontend
│   ├── components/               # React components
│   │   ├── *Editor.tsx          # Editable components (create/edit)
│   │   ├── *Viewer.tsx          # Read-only components (display)
│   │   └── *.tsx                # Other UI components
│   ├── store/                   # Zustand state management
│   │   └── runbookStore.ts      # Global runbook state
│   ├── utils/                   # Utility functions
│   │   └── yaml.ts              # YAML conversion
│   ├── i18n/                    # Internationalization
│   │   ├── en.ts                # English translations
│   │   ├── ja.ts                # Japanese translations
│   │   └── I18nContext.tsx      # i18n context
│   ├── types/                   # TypeScript types
│   │   └── runbook.ts           # Type definitions
│   ├── App.tsx                  # Main app component
│   ├── App.css                  # Global styles
│   └── main.tsx                 # React entry point
├── src-tauri/                   # Tauri backend
│   ├── src/
│   │   └── main.rs              # Rust entry point
│   ├── capabilities/            # Permissions
│   │   └── default.json         # Default capabilities
│   ├── icons/                   # App icons
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri config
├── docs/                        # Documentation
├── .github/workflows/           # CI/CD
└── dist/                        # Build output (gitignored)
```

### File Naming Conventions

- **Components**: PascalCase (`HttpRequestEditor.tsx`)
- **Utilities**: camelCase (`yaml.ts`)
- **Types**: camelCase (`runbook.ts`)
- **Styles**: kebab-case (`app.css`)

### Import Organization

```typescript
// 1. External dependencies
import { useState, useEffect } from 'react';
import { useRunbookStore } from '../store/runbookStore';

// 2. Internal utilities
import { runbookToYAML } from '../utils/yaml';

// 3. Components
import { HttpRequestEditor } from './HttpRequestEditor';

// 4. Types
import type { Step, Runbook } from '../types/runbook';

// 5. Styles (if needed)
import './MyComponent.css';
```

## State Management

### Zustand Store Pattern

```typescript
import { create } from 'zustand';

interface MyStore {
  // State
  data: string[];

  // Actions
  addData: (item: string) => void;
  removeData: (index: number) => void;
}

export const useMyStore = create<MyStore>((set) => ({
  // Initial state
  data: [],

  // Actions
  addData: (item) => set((state) => ({
    data: [...state.data, item]
  })),

  removeData: (index) => set((state) => ({
    data: state.data.filter((_, i) => i !== index)
  })),
}));
```

### Using Store in Components

```typescript
function MyComponent() {
  // Subscribe to specific state (component only re-renders when this changes)
  const data = useMyStore((state) => state.data);

  // Get actions
  const addData = useMyStore((state) => state.addData);

  return (
    <div>
      {data.map((item, i) => <div key={i}>{item}</div>)}
      <button onClick={() => addData('new item')}>Add</button>
    </div>
  );
}
```

### Best Practices

- **Selective Subscriptions**: Only subscribe to state you need
- **Derived State**: Compute derived values in component, not store
- **Immutable Updates**: Always return new objects/arrays in actions
- **Action Naming**: Use verb prefixes (`add`, `update`, `delete`, `set`)

## Adding New Features

### Adding a New Step Type

Follow this checklist:

1. **Update Types** (`src/types/runbook.ts`)
   ```typescript
   export interface MyNewStep {
     field1: string;
     field2?: number;
   }

   export interface Step {
     // ... existing fields
     myNewStep?: MyNewStep;
   }

   export type StepType = 'http' | 'include' | 'bind' | 'myNewType';
   ```

2. **Add i18n** (`src/i18n/en.ts` and `ja.ts`)
   ```typescript
   export const en = {
     // ...
     myNewStep: {
       title: 'My New Step',
       field1Label: 'Field 1',
       field2Label: 'Field 2',
       // ... all UI text
     },
   };
   ```

3. **Create Viewer** (`src/components/MyNewStepViewer.tsx`)
   ```typescript
   interface MyNewStepViewerProps {
     step: Step;
   }

   export function MyNewStepViewer({ step }: MyNewStepViewerProps) {
     const { t } = useTranslation();
     const data = step.myNewStep;

     return (
       <div>
         <div><strong>{t.myNewStep.field1Label}:</strong> {data?.field1}</div>
         {/* ... display all fields */}
       </div>
     );
   }
   ```

4. **Create Editor** (`src/components/MyNewStepEditor.tsx`)
   ```typescript
   interface MyNewStepEditorProps {
     step?: Step;
     onSave?: (step: Step) => void;
     onCancel: () => void;
   }

   export function MyNewStepEditor({ step, onSave, onCancel }: MyNewStepEditorProps) {
     const { t } = useTranslation();
     const updateStep = useRunbookStore((state) => state.updateStep);

     const [field1, setField1] = useState(step?.myNewStep?.field1 || '');
     const [field2, setField2] = useState(step?.myNewStep?.field2);

     const handleSave = () => {
       const stepData: Step = {
         desc: /* ... */,
         myNewStep: { field1, field2 },
       };

       if (step && step.id) {
         updateStep(step.id, stepData);
         onCancel();
       } else if (onSave) {
         onSave({ ...stepData, id: generateId() });
       }
     };

     return (/* form fields */);
   }
   ```

5. **Update StepTypeSelector** (`src/components/StepTypeSelector.tsx`)
   ```typescript
   const stepTypes = [
     // ... existing types
     { type: 'myNewType' as StepType, icon: '🆕', enabled: true },
   ];
   ```

6. **Update StepsEditor** (`src/components/StepsEditor.tsx`)
   - Add routing in create mode
   - Add routing in edit mode
   - Add display logic for step list

7. **Update YAML Utils** (`src/utils/yaml.ts`)
   - Add conversion logic in `runbookToYAML()`
   - Add parsing logic in `yamlToRunbook()` if needed

8. **Test**
   - Create new step
   - Edit existing step
   - Export to YAML
   - Import from YAML
   - Verify runn can execute it

### Adding a New UI Component

1. Create component file in `src/components/`
2. Define prop interface
3. Implement component with TypeScript
4. Add i18n support
5. Import and use in parent component

### Adding a New Utility Function

1. Create utility file in `src/utils/`
2. Export typed functions
3. Add unit tests (if applicable)
4. Import and use in components

## Testing

### Manual Testing

Before committing, test:

1. **Create Mode**
   - Add HTTP, Include, Bind steps
   - Fill all fields
   - Verify save creates step

2. **Edit Mode**
   - Click on existing steps
   - Modify fields
   - Verify save updates step

3. **Delete**
   - Delete steps
   - Verify removal

4. **Drag & Drop**
   - Reorder steps
   - Verify order persists

5. **Runners & Variables**
   - Add/edit/delete runners
   - Add/edit/delete variables

6. **YAML**
   - Generate YAML
   - Export to file
   - Import from file
   - Verify roundtrip (export → import → export should match)

7. **Execution**
   - Execute runbook (if runn installed)
   - Verify output displayed

8. **i18n**
   - Switch to Japanese
   - Verify all text translated
   - Switch back to English

### Automated Testing (Future)

Consider adding:
- Unit tests (Vitest)
- Component tests (React Testing Library)
- E2E tests (Playwright)

## Debugging

### Frontend Debugging

**Chrome DevTools:**
- Right-click in app → "Inspect Element"
- Use Console, Network, React DevTools tabs

**Console Logging:**
```typescript
console.log('Debug:', value);
console.table(arrayOfObjects);
console.error('Error:', error);
```

**React DevTools:**
- Install React DevTools browser extension
- Inspect component tree and state

### Backend Debugging

**Rust Logging:**
```rust
println!("Debug: {:?}", value);
eprintln!("Error: {:?}", error);
```

**Cargo Build Errors:**
```bash
# Detailed error output
cargo build --verbose

# Check for warnings
cargo clippy
```

### YAML Debugging

**Log Conversion:**
```typescript
const yamlObj = runbookToYAML(runbook);
console.log('YAML Object:', yamlObj);

const yamlStr = jsyaml.dump(yamlObj);
console.log('YAML String:', yamlStr);
```

**Validate YAML:**
```bash
# Use runn to validate
runn run output.yml --dry-run
```

## Build & Release

### Local Build

```bash
# Build frontend
npm run build

# Build Tauri app
npm run tauri build
```

Build artifacts:
- **macOS**: `src-tauri/target/release/bundle/macos/runn-gui.app`
- **macOS DMG**: `src-tauri/target/release/bundle/dmg/runn-gui_*.dmg`
- **Windows**: `src-tauri/target/release/bundle/msi/runn-gui_*.msi`
- **Linux**: `src-tauri/target/release/bundle/appimage/runn-gui_*.AppImage`

### Version Bumping

Update version in:
1. `package.json`
2. `src-tauri/Cargo.toml`
3. `src-tauri/tauri.conf.json`

```bash
# Example: bump to v0.2.0
# Edit files, then:
git add .
git commit -m "chore: bump version to 0.2.0"
git tag v0.2.0
git push origin main
git push origin v0.2.0
```

### GitHub Actions Release

Pushing a version tag triggers automated release:

```bash
git tag v0.2.0
git push origin v0.2.0
```

GitHub Actions will:
1. Build for macOS (Intel & ARM), Windows, Linux
2. Create installers
3. Create draft GitHub Release
4. Attach all artifacts

## Troubleshooting

### Common Issues

**Issue: "cargo: command not found"**
```bash
# Add cargo to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Or restart shell to load mise/asdf
exec $SHELL
```

**Issue: "Unable to find your web assets"**
```json
// Fix frontendDist in tauri.conf.json
{
  "build": {
    "frontendDist": "../dist"  // Note: relative to src-tauri/
  }
}
```

**Issue: "Bundle identifier ... is not allowed"**
```json
// Use custom identifier in tauri.conf.json
{
  "identifier": "com.example.runn-gui"
}
```

**Issue: "Module not found" after adding dependency**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue: Type errors after Zustand update**
```typescript
// Ensure proper typing
const myValue = useRunbookStore((state) => state.myValue);
// Not:
const { myValue } = useRunbookStore();
```

### Getting Help

1. Check existing [issues](https://github.com/your-org/runn-gui/issues)
2. Review [runn documentation](https://github.com/k1LoW/runn)
3. Review [Tauri documentation](https://tauri.app/)
4. Ask in pull request comments

---

For architecture details, see [architecture.md](architecture.md).
For step type details, see [step-types.md](step-types.md).
For component reference, see [components.md](components.md).
