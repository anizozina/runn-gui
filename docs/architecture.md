# Architecture Documentation

## Overview

Runn GUI Builder is a desktop application built with Tauri 2, combining a React frontend with a Rust backend. The architecture follows a clean separation between UI (React), state management (Zustand), and system integration (Tauri).

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tauri Application                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  React Frontend                        │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │ Components  │  │ Zustand Store│  │   i18n      │  │  │
│  │  │  - Editors  │←─┤  runbook     │  │  - en.ts    │  │  │
│  │  │  - Viewers  │  │  - runners   │  │  - ja.ts    │  │  │
│  │  │  - UI       │  │  - vars      │  └─────────────┘  │  │
│  │  └─────────────┘  │  - steps     │                    │  │
│  │         ↕          └──────────────┘                    │  │
│  │  ┌─────────────────────────────────┐                  │  │
│  │  │        Utilities                 │                  │  │
│  │  │  - YAML conversion (yaml.ts)     │                  │  │
│  │  │  - Type definitions (types/)     │                  │  │
│  │  └─────────────────────────────────┘                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Tauri Core (Rust)                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │   Dialog     │  │   File I/O   │  │   Shell    │  │  │
│  │  │   Plugin     │  │   Plugin     │  │   Plugin   │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                Operating System                        │  │
│  │        (macOS / Windows / Linux)                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (React)

### Component Hierarchy

```
App.tsx
├── LanguageSelector (i18n switching)
├── RunnersEditor (manage HTTP/gRPC runners)
├── VariablesEditor (manage variables)
├── StepsEditor (main step management)
│   ├── StepTypeSelector (select step type)
│   ├── HttpRequestEditor (create/edit HTTP steps)
│   ├── IncludeStepEditor (create/edit Include steps)
│   ├── BindStepEditor (create/edit Bind steps)
│   ├── HttpRequestViewer (display HTTP step)
│   ├── IncludeStepViewer (display Include step)
│   └── BindStepViewer (display Bind step)
└── YAMLExporter (generate/export YAML, execute runn)
```

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Zustand Store Action
    ↓
Store State Update
    ↓
Component Re-render (via subscription)
    ↓
Updated UI
```

Example:
1. User clicks "Add Step" → `handleAddStep()`
2. `setShowAddForm(true)` → local state update
3. StepTypeSelector appears → user selects "HTTP"
4. HttpRequestEditor appears → user fills form
5. User clicks "Save" → `onSave(stepData)`
6. `addStep(stepData)` → Zustand store action
7. Store updates `runbook.steps` → subscribers notified
8. StepsEditor re-renders → new step appears in list

## State Management (Zustand)

### Store Structure

```typescript
interface RunbookStore {
  // State
  runbook: {
    desc?: string;
    runners?: Record<string, Runner>;
    vars?: Record<string, any>;
    steps: Step[];
  };
  language: 'en' | 'ja';

  // Actions
  setRunbookDesc: (desc: string) => void;
  addRunner: (name: string, runner: Runner) => void;
  updateRunner: (name: string, runner: Runner) => void;
  deleteRunner: (name: string) => void;
  addVariable: (name: string, value: any) => void;
  updateVariable: (name: string, value: any) => void;
  deleteVariable: (name: string) => void;
  addStep: (step: Step) => void;
  updateStep: (id: string, step: Step) => void;
  deleteStep: (id: string) => void;
  reorderSteps: (startIndex: number, endIndex: number) => void;
  importRunbook: (runbook: Runbook) => void;
  setLanguage: (lang: 'en' | 'ja') => void;
}
```

### Store Usage Pattern

```typescript
// In a component
import { useRunbookStore } from '../store/runbookStore';

function MyComponent() {
  // Subscribe to specific state
  const steps = useRunbookStore((state) => state.runbook.steps);
  const addStep = useRunbookStore((state) => state.addStep);

  const handleAdd = () => {
    addStep({ id: generateId(), desc: 'New step', /* ... */ });
  };

  return (
    <div>
      {steps.map(step => <div key={step.id}>{step.desc}</div>)}
      <button onClick={handleAdd}>Add</button>
    </div>
  );
}
```

## YAML Conversion (`utils/yaml.ts`)

### Runbook → YAML

```
Runbook Object (TypeScript)
    ↓
runbookToYAML(runbook)
    ↓
Plain JavaScript Object (YAML-compatible structure)
    ↓
js-yaml.dump()
    ↓
YAML String
```

Key transformations:
- Remove IDs (used only for React keys)
- Flatten single-property objects
- Handle special formats (Include step: string vs object)

### YAML → Runbook

```
YAML String
    ↓
js-yaml.load()
    ↓
Plain JavaScript Object
    ↓
yamlToRunbook(obj)
    ↓
Runbook Object (with IDs added)
    ↓
importRunbook(runbook)
    ↓
Zustand Store
```

Key transformations:
- Add IDs to all steps (using uuid)
- Normalize Include step format (string → {path, vars})
- Validate structure

## Tauri Integration

### File Operations

```typescript
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';

// Export YAML
const filePath = await save({
  filters: [{ name: 'YAML', extensions: ['yml', 'yaml'] }]
});
if (filePath) {
  await writeTextFile(filePath, yamlContent);
}

// Import YAML
const file = await open({
  filters: [{ name: 'YAML', extensions: ['yml', 'yaml'] }]
});
if (file) {
  const content = await readTextFile(file.path);
  const runbook = yamlToRunbook(content);
  importRunbook(runbook);
}
```

### Shell Execution

```typescript
import { Command } from '@tauri-apps/plugin-shell';

// Execute runn
const command = Command.create('run-runn', ['run', filePath]);
command.on('stdout', (line) => {
  setOutput((prev) => prev + line);
});
command.on('stderr', (line) => {
  setOutput((prev) => prev + line);
});
const result = await command.execute();
```

## Internationalization (i18n)

### Context-based i18n

```typescript
// I18nContext.tsx
const I18nContext = createContext<{ t: Translation; setLanguage: (lang: Language) => void }>(/* ... */);

export function useTranslation() {
  return useContext(I18nContext);
}

// In components
const { t } = useTranslation();
return <h2>{t.httpRequest.title}</h2>;
```

### Translation Structure

```typescript
// en.ts
export const en = {
  sectionName: {
    key: 'English text',
    anotherKey: 'Another text',
  },
};

// ja.ts
export const ja = {
  sectionName: {
    key: '日本語テキスト',
    anotherKey: '別のテキスト',
  },
};
```

## Component Patterns

### Editor Pattern (Dual-mode: Create/Edit)

```typescript
interface EditorProps {
  step?: Step;        // If provided: edit mode, if not: create mode
  onSave?: (step: Step) => void;  // Called in create mode
  onCancel: () => void;
}

export function MyEditor({ step, onSave, onCancel }: EditorProps) {
  // Initialize from step if editing
  const [field, setField] = useState(step?.field || '');

  const handleSave = () => {
    const stepData = { /* ... */ };

    if (step && step.id) {
      // Edit mode: update existing step
      updateStep(step.id, stepData);
      onCancel();
    } else if (onSave) {
      // Create mode: create new step
      onSave(stepData);
    }
  };

  return (
    <div>
      <input value={field} onChange={(e) => setField(e.target.value)} />
      <button onClick={handleSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
```

### Viewer Pattern (Read-only Display)

```typescript
interface ViewerProps {
  step: Step;
}

export function MyViewer({ step }: ViewerProps) {
  return (
    <div>
      <div><strong>Field:</strong> {step.field}</div>
    </div>
  );
}
```

## Build Process

### Development Build

```
npm run dev (Vite dev server)
    ↓
React app runs at http://localhost:5173
    ↓
npm run tauri dev
    ↓
Tauri loads dev server URL
    ↓
Hot reload enabled
```

### Production Build

```
npm run build (TypeScript + Vite build)
    ↓
Compiled JS/CSS → dist/
    ↓
npm run tauri build (Cargo build)
    ↓
Tauri bundles dist/ + Rust binary
    ↓
Platform-specific installers:
  - macOS: .app, .dmg
  - Windows: .msi
  - Linux: .AppImage, .deb
```

## Security Model

### Tauri Capabilities

Defined in `src-tauri/capabilities/default.json`:

```json
{
  "permissions": [
    "core:default",
    "dialog:allow-open",
    "dialog:allow-save",
    "fs:allow-read-text-file",
    "fs:allow-write-text-file",
    "shell:allow-run-runn"
  ]
}
```

- **Dialog**: File open/save dialogs
- **FS**: Read/write text files (for YAML import/export)
- **Shell**: Execute `runn` command with specific arguments

### CSP (Content Security Policy)

Currently set to `null` for development. For production, should be tightened:

```json
{
  "app": {
    "security": {
      "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'"
    }
  }
}
```

## Performance Considerations

### State Updates

- Zustand updates are efficient (subscribers only re-render when their slice changes)
- Use specific selectors to minimize re-renders:
  ```typescript
  // Good: only re-renders when steps change
  const steps = useRunbookStore((state) => state.runbook.steps);

  // Bad: re-renders on any state change
  const store = useRunbookStore();
  const steps = store.runbook.steps;
  ```

### Drag and Drop

- Uses `@dnd-kit` for performant drag-and-drop
- Virtualization not yet implemented (consider for large step lists)

### YAML Generation

- Regenerates on every runbook change (via `useEffect`)
- For very large runbooks, consider debouncing or manual generation

## Extension Points

### Adding New Step Types

1. Add type to `types/runbook.ts`
2. Create Viewer component
3. Create Editor component
4. Update StepTypeSelector
5. Update StepsEditor routing
6. Update YAML conversion logic
7. Add i18n translations

### Adding New Runners

Currently supports HTTP. To add gRPC/DB:
1. Update `Runner` type in `types/runbook.ts`
2. Update RunnersEditor UI
3. Update YAML conversion

### Custom Themes

Currently hardcoded dark theme. To add theme support:
1. Create theme context
2. Define theme variables
3. Apply theme to all components

## Debugging

### Frontend

- Use React DevTools
- Use Zustand DevTools (can be added via middleware)
- Console logs in browser DevTools

### Backend

- Use `cargo build` and check compile errors
- Use `println!` or `dbg!` macros in Rust
- View logs in terminal when running `npm run tauri dev`

### YAML Conversion

- Log intermediate steps in `yaml.ts`
- Compare generated YAML with expected format
- Use online YAML validators

---

For more details on specific components, see [components.md](components.md).
For step type details, see [step-types.md](step-types.md).
