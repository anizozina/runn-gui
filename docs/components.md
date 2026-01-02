# Component API Reference

This document provides detailed API reference for all React components in Runn GUI Builder.

## Table of Contents

- [Editor Components](#editor-components)
  - [HttpRequestEditor](#httprequesteditor)
  - [IncludeStepEditor](#includestepeditor)
  - [BindStepEditor](#bindstepeditor)
  - [StepTypeSelector](#steptypeselector)
- [Container Components](#container-components)
  - [StepsEditor](#stepseditor)
  - [RunnersEditor](#runnerseditor)
  - [VariablesEditor](#variableseditor)
  - [YAMLExporter](#yamlexporter)
- [Utility Components](#utility-components)
  - [LanguageSelector](#languageselector)

---

## Editor Components

Editor components follow a dual-mode pattern: they can create new items (when `step` prop is undefined) or edit existing items (when `step` prop is provided).

### HttpRequestEditor

Create or edit HTTP request steps.

#### Props

```typescript
interface HttpRequestEditorProps {
  step?: Step;                    // Optional: if provided, edit mode
  onSave?: (step: Step) => void;  // Required for create mode
  onCancel: () => void;            // Required: close editor
}
```

#### Usage

**Create Mode:**
```tsx
<HttpRequestEditor
  onSave={(step) => addStep(step)}
  onCancel={() => setShowEditor(false)}
/>
```

**Edit Mode:**
```tsx
<HttpRequestEditor
  step={existingStep}
  onCancel={() => setEditMode(false)}
/>
```

#### Features

- **Method Selection**: GET, POST, PUT, DELETE, PATCH
- **Path Input**: Supports variable interpolation `{{ vars.name }}`
- **Headers Management**: Add/remove key-value pairs
- **Query Parameters**: Add/remove query parameters
- **Body Editor**:
  - JSON (textarea with syntax highlighting)
  - Form-data (key-value pairs)
  - Raw text
- **Test Expression**: JavaScript expression for validation
- **Response Binding**: Extract values from response
- **Collapsible Help**: Info icon with usage examples

#### Internal State

```typescript
const [desc, setDesc] = useState<string>('');
const [runner, setRunner] = useState<string>('');
const [method, setMethod] = useState<HttpMethod>('get');
const [path, setPath] = useState<string>('');
const [headers, setHeaders] = useState<Record<string, string>>({});
const [queryParams, setQueryParams] = useState<Record<string, string>>({});
const [bodyType, setBodyType] = useState<'json' | 'form' | 'raw'>('json');
const [bodyContent, setBodyContent] = useState<string>('');
const [test, setTest] = useState<string>('');
const [bind, setBind] = useState<Record<string, string>>({});
const [showHelp, setShowHelp] = useState<boolean>(false);
```

#### Save Logic

```typescript
const handleSave = () => {
  const stepData: Step = {
    desc,
    req: runner,
    [method]: {
      path,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      body: /* body content based on bodyType */,
    },
    test: test || undefined,
    bind: Object.keys(bind).length > 0 ? bind : undefined,
  };

  if (step && step.id) {
    // Edit mode: update existing step
    updateStep(step.id, stepData);
    onCancel();
  } else if (onSave) {
    // Create mode: create new step
    onSave({ ...stepData, id: generateId() });
  }
};
```

---

### IncludeStepEditor

Create or edit Include steps.

#### Props

```typescript
interface IncludeStepEditorProps {
  step?: Step;
  onSave?: (step: Step) => void;
  onCancel: () => void;
}
```

#### Usage

```tsx
<IncludeStepEditor
  onSave={(step) => addStep(step)}
  onCancel={() => setShowEditor(false)}
/>
```

#### Features

- **Path Input**: Relative path to included runbook
- **Variables Management**: Optional key-value pairs to pass to included runbook
- **Smart Format**: Uses string format if no variables, object format if variables exist
- **Collapsible Help**: Info icon with usage examples

#### Internal State

```typescript
const [desc, setDesc] = useState<string>('');
const [path, setPath] = useState<string>('');
const [vars, setVars] = useState<Record<string, any>>({});
const [newVarKey, setNewVarKey] = useState<string>('');
const [newVarValue, setNewVarValue] = useState<string>('');
const [showHelp, setShowHelp] = useState<boolean>(false);
```

#### Save Logic

```typescript
const handleSave = () => {
  let includeData: string | IncludeStep;

  if (Object.keys(vars).length === 0) {
    // Simple format: just the path string
    includeData = path.trim();
  } else {
    // Object format: path + vars
    includeData = {
      path: path.trim(),
      vars: vars,
    };
  }

  const stepData: Step = {
    desc,
    include: includeData,
  };

  if (step && step.id) {
    updateStep(step.id, stepData);
    onCancel();
  } else if (onSave) {
    onSave({ ...stepData, id: generateId() });
  }
};
```

---

### BindStepEditor

Create or edit Bind steps.

#### Props

```typescript
interface BindStepEditorProps {
  step?: Step;
  onSave?: (step: Step) => void;
  onCancel: () => void;
}
```

#### Usage

```tsx
<BindStepEditor
  onSave={(step) => addStep(step)}
  onCancel={() => setShowEditor(false)}
/>
```

#### Features

- **Bindings Management**: Add/remove key-value pairs
- **JSON Support**: Automatically parses JSON values
- **Faker Support**: Recognizes faker functions (e.g., `faker.UUID()`)
- **Collapsible Help**: Info icon with usage examples

#### Internal State

```typescript
const [desc, setDesc] = useState<string>('');
const [bind, setBind] = useState<Record<string, any>>({});
const [newBindKey, setNewBindKey] = useState<string>('');
const [newBindValue, setNewBindValue] = useState<string>('');
const [showHelp, setShowHelp] = useState<boolean>(false);
```

#### Save Logic

```typescript
const handleAddBinding = () => {
  let value: any = newBindValue.trim();

  // Try to parse as JSON for complex values
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      value = JSON.parse(value);
    } catch {
      // Keep as string if not valid JSON
    }
  }

  setBind({ ...bind, [newBindKey.trim()]: value });
  setNewBindKey('');
  setNewBindValue('');
};

const handleSave = () => {
  const stepData: Step = {
    desc,
    bind,
  };

  if (step && step.id) {
    updateStep(step.id, stepData);
    onCancel();
  } else if (onSave) {
    onSave({ ...stepData, id: generateId() });
  }
};
```

---

### StepTypeSelector

UI for selecting step type when creating a new step.

#### Props

```typescript
interface StepTypeSelectorProps {
  onSelect: (type: StepType) => void;
  onCancel: () => void;
}
```

#### Usage

```tsx
<StepTypeSelector
  onSelect={(type) => setStepTypeToCreate(type)}
  onCancel={() => setShowAddForm(false)}
/>
```

#### Features

- **Button Grid**: 3-column grid of step type buttons
- **Icons**: Visual icons for each step type (🌐, 📁, 🔗, etc.)
- **Enabled/Disabled**: Active buttons for implemented types, grayed out for upcoming types
- **Coming Soon Badge**: Shows "Coming Soon" for unimplemented types

#### Step Types

```typescript
const stepTypes = [
  { type: 'http', icon: '🌐', enabled: true },
  { type: 'include', icon: '📁', enabled: true },
  { type: 'bind', icon: '🔗', enabled: true },
  { type: 'db', icon: '💾', enabled: false },
  { type: 'grpc', icon: '📡', enabled: false },
  { type: 'ssh', icon: '🖥️', enabled: false },
  { type: 'cdp', icon: '🌍', enabled: false },
  { type: 'exec', icon: '⚙️', enabled: false },
];
```

---

## Container Components

Container components manage higher-level functionality and state.

### StepsEditor

Main step management component with drag-and-drop reordering.

#### Props

```typescript
// No props - uses Zustand store directly
```

#### Usage

```tsx
<StepsEditor />
```

#### Features

- **Step List**: Displays all steps with drag-and-drop reordering
- **Add Step**: Button to add new step (shows StepTypeSelector)
- **Edit Step**: Click on step to edit in appropriate editor
- **Delete Step**: Delete button for each step
- **Step Display**: Shows step number, description, type chip, and preview

#### Internal State

```typescript
const [selectedStep, setSelectedStep] = useState<Step | null>(null);
const [showAddForm, setShowAddForm] = useState<boolean>(false);
const [stepTypeToCreate, setStepTypeToCreate] = useState<StepType | null>(null);
```

#### Routing Logic

```typescript
// Create mode
{showAddForm && (
  stepTypeToCreate === null ? (
    <StepTypeSelector onSelect={setStepTypeToCreate} onCancel={...} />
  ) : stepTypeToCreate === 'http' ? (
    <HttpRequestEditor onSave={...} onCancel={...} />
  ) : stepTypeToCreate === 'include' ? (
    <IncludeStepEditor onSave={...} onCancel={...} />
  ) : stepTypeToCreate === 'bind' ? (
    <BindStepEditor onSave={...} onCancel={...} />
  ) : null
)}

// Edit mode
{selectedStep && (
  selectedStep.include ? (
    <IncludeStepEditor step={selectedStep} onCancel={...} />
  ) : !selectedStep.req && selectedStep.bind ? (
    <BindStepEditor step={selectedStep} onCancel={...} />
  ) : (
    <HttpRequestEditor step={selectedStep} onCancel={...} />
  )
)}
```

#### Drag & Drop

Uses `@dnd-kit` for drag-and-drop:

```typescript
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    const oldIndex = steps.findIndex((s) => s.id === active.id);
    const newIndex = steps.findIndex((s) => s.id === over.id);
    reorderSteps(oldIndex, newIndex);
  }
};
```

---

### RunnersEditor

Manage HTTP/gRPC runners.

#### Props

```typescript
// No props - uses Zustand store directly
```

#### Usage

```tsx
<RunnersEditor />
```

#### Features

- **Add Runner**: Add new HTTP/gRPC runner with name and endpoint
- **Edit Runner**: Modify existing runner
- **Delete Runner**: Remove runner
- **Validation**: Ensures runner name is unique

---

### VariablesEditor

Manage global variables.

#### Props

```typescript
// No props - uses Zustand store directly
```

#### Usage

```tsx
<VariablesEditor />
```

#### Features

- **Add Variable**: Add new variable with name and value
- **Edit Variable**: Modify existing variable
- **Delete Variable**: Remove variable
- **JSON Support**: Automatically parses JSON values

---

### YAMLExporter

Generate, export, and execute YAML runbooks.

#### Props

```typescript
// No props - uses Zustand store directly
```

#### Usage

```tsx
<YAMLExporter />
```

#### Features

- **Auto-Generate**: Automatically generates YAML when runbook changes
- **Syntax Highlighting**: Displays YAML with monospace font
- **Export**: Save YAML to file via Tauri dialog
- **Import**: Load YAML from file
- **Execute**: Run runbook with `runn run` command
- **Output Display**: Shows execution output in terminal-style panel

#### Internal State

```typescript
const [yaml, setYaml] = useState<string>('');
const [output, setOutput] = useState<string>('');
const [isRunning, setIsRunning] = useState<boolean>(false);
```

#### YAML Generation

```typescript
useEffect(() => {
  generateYAML();
}, [runbook]); // Re-generate whenever runbook changes

const generateYAML = () => {
  try {
    const yamlObj = runbookToYAML(runbook);
    const yamlStr = jsyaml.dump(yamlObj, { indent: 2 });
    setYaml(yamlStr);
  } catch (error) {
    setYaml('# Error generating YAML: ' + error.message);
  }
};
```

#### Export Logic

```typescript
const handleExport = async () => {
  const filePath = await save({
    filters: [{ name: 'YAML', extensions: ['yml', 'yaml'] }],
  });

  if (filePath) {
    await writeTextFile(filePath, yaml);
  }
};
```

#### Import Logic

```typescript
const handleImport = async () => {
  const file = await open({
    filters: [{ name: 'YAML', extensions: ['yml', 'yaml'] }],
  });

  if (file) {
    const content = await readTextFile(file.path);
    const runbook = yamlToRunbook(content);
    importRunbook(runbook);
  }
};
```

#### Execute Logic

```typescript
const handleRun = async () => {
  // Save YAML to temp file
  const tempPath = await save({ /* ... */ });
  await writeTextFile(tempPath, yaml);

  // Execute runn command
  const command = Command.create('run-runn', ['run', tempPath]);

  command.on('stdout', (line) => {
    setOutput((prev) => prev + line);
  });

  command.on('stderr', (line) => {
    setOutput((prev) => prev + line);
  });

  setIsRunning(true);
  const result = await command.execute();
  setIsRunning(false);
};
```

---

## Utility Components

### LanguageSelector

Switch between English and Japanese UI.

#### Props

```typescript
// No props - uses Zustand store directly
```

#### Usage

```tsx
<LanguageSelector />
```

#### Features

- **Toggle Button**: Switch between EN and JA
- **Persists**: Language preference stored in Zustand

#### Implementation

```typescript
const language = useRunbookStore((state) => state.language);
const setLanguage = useRunbookStore((state) => state.setLanguage);

return (
  <button onClick={() => setLanguage(language === 'en' ? 'ja' : 'en')}>
    {language === 'en' ? '日本語' : 'English'}
  </button>
);
```

---

## Common Patterns

### Using Zustand Store in Components

```typescript
import { useRunbookStore } from '../store/runbookStore';

function MyComponent() {
  // Subscribe to specific state
  const steps = useRunbookStore((state) => state.runbook.steps);
  const runners = useRunbookStore((state) => state.runbook.runners);

  // Get actions
  const addStep = useRunbookStore((state) => state.addStep);
  const updateStep = useRunbookStore((state) => state.updateStep);

  return (/* ... */);
}
```

### Using i18n in Components

```typescript
import { useTranslation } from '../i18n/I18nContext';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t.mySection.title}</h2>
      <p>{t.mySection.description}</p>
    </div>
  );
}
```

### Form Input Pattern

```typescript
<div className="form-group">
  <label>{t.mySection.fieldLabel}</label>
  <input
    type="text"
    className="form-control"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder={t.mySection.placeholder}
  />
</div>
```

---

For architecture details, see [architecture.md](architecture.md).
For step type details, see [step-types.md](step-types.md).
