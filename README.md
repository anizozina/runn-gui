# Runn GUI Builder

A desktop GUI application for building and managing [runn](https://github.com/k1LoW/runn) runbooks.

Built with Tauri, React, TypeScript, and Vite.

## Features

- 🎨 **Visual Runbook Editor**: Create and edit runn runbooks through an intuitive GUI
- 📝 **Multiple Step Types**: Support for HTTP, Include, Bind, DB, gRPC, SSH, and CDP steps
- 🔄 **YAML Import/Export**: Seamlessly import existing YAML runbooks and export your work
- ▶️ **Built-in Executor**: Run your runbooks directly from the GUI
- 🌐 **Multi-language Support**: English and Japanese UI
- 🎯 **Type-safe**: Built with TypeScript for reliability

## Development

### Prerequisites

- Node.js (LTS version)
- Rust (latest stable)
- Platform-specific dependencies:
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`
  - **Windows**: WebView2 (usually pre-installed)

### Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Release Process

### Automated Releases (Recommended)

Releases are automatically built for macOS (Intel & Apple Silicon), Windows, and Linux when you push a version tag:

```bash
# Create a new version tag
git tag v0.1.0

# Push the tag to GitHub
git push origin v0.1.0
```

This triggers a GitHub Actions workflow that:
1. Builds the app for all platforms
2. Creates installers (DMG for macOS, MSI for Windows, AppImage/deb for Linux)
3. Creates a draft GitHub Release with all artifacts

### Manual Testing Build

To test the release build locally:

```bash
npm run tauri build
```

Built artifacts will be in `src-tauri/target/release/bundle/`.

## Project Structure

```
runn-gui/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── store/             # Zustand state management
│   ├── utils/             # Utility functions (YAML conversion)
│   ├── i18n/              # Internationalization
│   └── types/             # TypeScript type definitions
├── src-tauri/             # Tauri backend
│   ├── src/               # Rust source
│   ├── icons/             # App icons
│   └── Cargo.toml         # Rust dependencies
└── .github/workflows/     # CI/CD workflows
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Tauri 2, Rust
- **State Management**: Zustand
- **UI**: Custom CSS (dark theme)
- **Drag & Drop**: dnd-kit
- **YAML Processing**: js-yaml

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Add your license here]
