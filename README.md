# Runn GUI Builder

<div align="center">

A modern desktop GUI application for building and managing [runn](https://github.com/k1LoW/runn) runbooks.

Built with Tauri, React, TypeScript, and Vite.

[Features](#features) • [Installation](#installation) • [Development](#development) • [Release](#release-process) • [Contributing](#contributing)

</div>

---

## Overview

Runn GUI Builder provides a visual interface for creating, editing, and executing [runn](https://github.com/k1LoW/runn) runbooks. Instead of manually writing YAML, you can build your API test scenarios through an intuitive GUI and export them to standard runn format.

## Features

### 🎨 Visual Runbook Editor
- **Drag & Drop**: Reorder steps with drag-and-drop interface
- **Step Types**: Support for multiple step types:
  - 🌐 HTTP Requests (GET, POST, PUT, DELETE, PATCH)
  - 📁 Include (reference external step files)
  - 🔗 Bind (extract or generate values)
  - 💾 Database queries (coming soon)
  - 📡 gRPC calls (coming soon)
  - 🖥️ SSH commands (coming soon)
  - 🌍 CDP browser automation (coming soon)

### 📝 HTTP Request Builder
- Visual HTTP request editor with:
  - Method selection (GET, POST, PUT, DELETE, PATCH)
  - Path with variable interpolation
  - Headers management
  - Request body (JSON, form-data, raw text)
  - Query parameters
  - Test assertions
  - Response binding

### 🔄 Include & Bind Steps
- **Include Steps**: Reference external runbook files with variable passing
- **Bind Steps**: Extract values from responses or generate values (e.g., faker.UUID())
- Visual editors for both step types (not just YAML-only!)

### 📦 YAML Import/Export
- **Import**: Load existing runn YAML files
- **Export**: Save runbooks as standard runn YAML format
- **Auto-sync**: YAML preview updates automatically when you edit
- **Validation**: Real-time validation with error messages

### ▶️ Built-in Executor
- Run runbooks directly from the GUI
- Real-time output display
- Success/failure status with colored output
- Terminal-style output panel

### 🌐 Multi-language Support
- English UI
- Japanese UI (日本語対応)
- Easy to add more languages via i18n system

### 🎯 Developer-Friendly
- Type-safe with TypeScript
- Hot-reload in development mode
- Dark theme UI
- Cross-platform (macOS, Windows, Linux)

## Installation

### Download Pre-built Binaries

Download the latest release for your platform from [GitHub Releases](https://github.com/your-org/runn-gui/releases):

- **macOS**: `.dmg` installer (Intel & Apple Silicon)
- **Windows**: `.msi` installer
- **Linux**: `.AppImage` or `.deb` package

### Build from Source

See [Development](#development) section below.

## Usage

### Creating a Runbook

1. **Add Runners**: Define HTTP endpoints in the Runners section
   - Click "+ Add Runner"
   - Enter name (e.g., "api") and endpoint URL
   - Supports environment variables: `${RUNN_BASE_URL:-http://localhost:3000}`

2. **Add Variables**: Define reusable variables in the Variables section
   - Click "+ Add Variable"
   - Supports templates: `{{ vars.variableName }}`
   - Supports environment variables: `${ENV_VAR:-default}`

3. **Add Steps**: Build your test scenario
   - Click "+ Add" in Steps section
   - Select step type (HTTP, Include, or Bind)
   - Fill in the form for your step type
   - Drag to reorder steps

4. **Export YAML**: Generate runbook YAML
   - Switch to "YAML Preview" tab
   - Click "Generate YAML" (or it auto-generates)
   - Click "Export to File" to save
   - Click "▶ Run" to execute directly

### HTTP Request Example

1. Select "HTTP Request" step type
2. Fill in:
   - Description: "Login user"
   - Method: POST
   - Path: `/api/login`
   - Body (JSON):
     ```json
     {
       "email": "user@example.com",
       "password": "secret"
     }
     ```
   - Test: `current.res.status == 200`
   - Bind: `token = current.res.body.token`

### Include Step Example

1. Select "Include" step type
2. Fill in:
   - Description: "Run authentication flow"
   - Path: `steps/auth.yml`
   - Variables (optional):
     - `user_id`: `{{ vars.testUserId }}`

### Bind Step Example

1. Select "Bind" step type
2. Fill in:
   - Description: "Generate UUID"
   - Bindings:
     - `user_id`: `faker.UUID()`
     - `timestamp`: `faker.UnixTime()`

## Development

### Prerequisites

- **Node.js** (LTS version recommended)
- **Rust** (latest stable)
- Platform-specific dependencies:
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**:
    ```bash
    sudo apt-get update
    sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
    ```
  - **Windows**: [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/runn-gui.git
cd runn-gui

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Development Scripts

```bash
# Start dev server with hot-reload
npm run dev

# Build frontend only
npm run build

# Run Tauri app in development
npm run tauri dev

# Build production binary
npm run tauri build

# Type checking
npm run type-check

# Linting
npm run lint
```

### Project Structure

```
runn-gui/
├── src/                          # React frontend source
│   ├── components/               # React components
│   │   ├── StepTypeSelector.tsx  # Step type selection UI
│   │   ├── HttpRequestEditor.tsx # HTTP request builder
│   │   ├── IncludeStepEditor.tsx # Include step editor
│   │   ├── BindStepEditor.tsx    # Bind step editor
│   │   ├── StepsEditor.tsx       # Main steps editor
│   │   ├── YAMLExporter.tsx      # YAML generation & execution
│   │   └── ...
│   ├── store/                    # Zustand state management
│   │   └── runbookStore.ts       # Runbook state & actions
│   ├── utils/                    # Utility functions
│   │   └── yaml.ts               # YAML conversion logic
│   ├── i18n/                     # Internationalization
│   │   ├── en.ts                 # English translations
│   │   └── ja.ts                 # Japanese translations
│   ├── types/                    # TypeScript type definitions
│   │   └── runbook.ts            # Runbook type definitions
│   └── App.tsx                   # Main app component
├── src-tauri/                    # Tauri backend
│   ├── src/                      # Rust source
│   │   └── main.rs               # Tauri app setup
│   ├── icons/                    # App icons
│   ├── capabilities/             # Tauri permissions
│   │   └── default.json          # Default capabilities
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
├── .github/workflows/            # CI/CD workflows
│   ├── ci.yml                    # Continuous integration
│   └── release.yml               # Release automation
├── dist/                         # Build output (frontend)
└── README.md                     # This file
```

## Release Process

### Automated Releases (Recommended)

Releases are automatically built when you create a new release on GitHub:

```bash
# Update version in package.json, src-tauri/Cargo.toml, and src-tauri/tauri.conf.json first
```

Then on GitHub:
1. Go to **Releases** → **Draft a new release**
2. Create a new tag (e.g., `v0.2.0`) and fill in the release details
3. Click **Publish release** (or **Save draft** for draft releases)

GitHub Actions will automatically:
1. Build the app for macOS (Intel & Apple Silicon), Windows, and Linux
2. Create installers (`.dmg`, `.msi`, `.AppImage`, `.deb`)
3. Upload all artifacts to the release you just created
4. You can then publish the release when ready

### Manual Build

To test the release build locally:

```bash
npm run tauri build
```

Built artifacts will be in `src-tauri/target/release/bundle/`:
- **macOS**: `macos/runn-gui.app` and `dmg/runn-gui_*.dmg`
- **Windows**: `msi/runn-gui_*.msi`
- **Linux**: `appimage/runn-gui_*.AppImage` and `deb/runn-gui_*.deb`

## Tech Stack

- **Frontend**:
  - React 19 - UI framework
  - TypeScript - Type safety
  - Vite - Build tool & dev server
  - Zustand - State management
  - dnd-kit - Drag & drop
  - js-yaml - YAML processing

- **Backend**:
  - Tauri 2 - Desktop app framework
  - Rust - System-level programming

- **UI**:
  - Custom CSS - Dark theme
  - No UI framework - Lightweight & fast

## Troubleshooting

### App won't start on macOS

If you see "App is damaged and can't be opened":

```bash
# Remove quarantine attribute
xattr -cr /Applications/runn-gui.app
```

### Build fails with "cargo: command not found"

Install Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### YAML export shows validation errors

Check that:
- At least one runner is defined
- At least one step is added
- All required fields are filled in steps

### "runn: command not found" when clicking Run

Install runn CLI:

```bash
# macOS/Linux
brew install k1LoW/tap/runn

# Or download from https://github.com/k1LoW/runn/releases
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT License](LICENSE)

## Acknowledgments

- [runn](https://github.com/k1LoW/runn) - The amazing API scenario testing tool
- [Tauri](https://tauri.app/) - Build smaller, faster, and more secure desktop applications
- [React](https://react.dev/) - The library for web and native user interfaces

---

<div align="center">
Made with ❤️ by the Runn GUI Builder team
</div>
