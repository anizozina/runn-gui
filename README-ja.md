# Runn GUI Builder

<div align="center">

[runn](https://github.com/k1LoW/runn) のランブックを作成・管理するためのモダンなデスクトップGUIアプリケーション。

Tauri、React、TypeScript、Vite（rolldown-vite）で構築。

[特長](#特長) • [インストール](#インストール) • [開発](#開発) • [リリース](#リリース手順) • [コントリビュート](#コントリビュート)

[English](README.md) • [日本語](README-ja.md)

</div>

---

## 概要

Runn GUI Builder は、[runn](https://github.com/k1LoW/runn) のランブックを視覚的に作成・編集・実行できるGUIツールです。YAMLを手書きせずに、GUIでAPIテストシナリオを組み立てて標準的な runn 形式で書き出せます。

## 特長

### 🎨 ビジュアルランブックエディタ
- **ドラッグ＆ドロップ**: ステップをドラッグで並び替え
- **ステップ種類**:
  - 🌐 HTTPリクエスト（GET, POST, PUT, DELETE, PATCH）
  - 📁 Include（外部ステップファイルの参照）
  - 🔗 Bind（値の抽出や生成）
  - 💾 DBクエリ（coming soon）
  - 📡 gRPC（coming soon）
  - 🖥️ SSH（coming soon）
  - 🌍 CDPブラウザ自動化（coming soon）

### 📝 HTTPリクエストビルダー
- 直感的なHTTPリクエスト編集:
  - メソッド選択（GET, POST, PUT, DELETE, PATCH）
  - 変数展開つきパス
  - ヘッダー管理
  - リクエストボディ（JSON, form-data, raw text）
  - テストアサーション
  - レスポンスのバインド

### 🔄 Include & Bind ステップ
- **Include**: 外部ランブックの参照と変数渡し
- **Bind**: レスポンスから値を抽出したり値を生成（例: `faker.UUID()`）
- YAMLだけでなくGUIで編集可能

### 📦 YAML インポート/エクスポート
- **Import**: 既存の runn YAML を読み込み
- **Export**: runn 標準フォーマットで書き出し
- **Auto-sync**: 編集内容に応じて自動でプレビュー更新
- **Validation**: エラーメッセージ付きのバリデーション

### ▶️ 内蔵実行
- GUIから直接ランブックを実行
- 実行結果の出力表示
- 成功/失敗のメッセージ表示
- ターミナル風の出力パネル

### 🌐 多言語対応
- 英語UI
- 日本語UI
- i18nで追加が容易

### 🎯 開発者向け
- TypeScriptで型安全
- 開発時はホットリロード
- ダークテーマUI
- クロスプラットフォーム（macOS, Windows, Linux）

## インストール

### ビルド済みバイナリの入手

最新のリリースは [GitHub Releases](https://github.com/anizozina/runn-gui/releases) から取得できます。

- **macOS**: `.dmg`（Intel & Apple Silicon）
- **Windows**: `.msi`
- **Linux**: `.AppImage` / `.deb`

### ソースからビルド

詳しくは [開発](#開発) セクションを参照してください。

## 使い方

### ランブック作成

1. **Runnersを追加**: Runners セクションでHTTPエンドポイントを定義
   - "+ Add Runner" をクリック
   - 名前（例: "api"）とエンドポイントURLを入力
   - 環境変数対応: `${RUNN_BASE_URL:-http://localhost:3000}`

2. **Variablesを追加**: Variables セクションで再利用変数を定義
   - "+ Add Variable" をクリック
   - テンプレート対応: `{{ vars.variableName }}`
   - 環境変数対応: `${ENV_VAR:-default}`

3. **Stepsを追加**: テストシナリオを組み立て
   - Steps セクションの "+ Add" をクリック
   - ステップ種類（HTTP / Include / Bind）を選択
   - フォームに必要事項を入力
   - ドラッグで並び替え

4. **YAMLを書き出し**:
   - "YAML Preview" タブに切り替え
   - "Generate YAML" を押す（自動生成もあり）
   - "Export to File" で保存
   - "▶ Run" でそのまま実行

### HTTPリクエスト例

1. "HTTP Request" を選択
2. 入力例:
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

### Includeステップ例

1. "Include" を選択
2. 入力例:
   - Description: "Run authentication flow"
   - Path: `steps/auth.yml`
   - Variables (optional):
     - `user_id`: `{{ vars.testUserId }}`

### Bindステップ例

1. "Bind" を選択
2. 入力例:
   - Description: "Generate UUID"
   - Bindings:
     - `user_id`: `faker.UUID()`
     - `timestamp`: `faker.UnixTime()`

## 開発

### 前提

- **Node.js**（LTS推奨）
- **Rust**（最新安定版）
- OS別の依存関係:
  - **macOS**: Xcode Command Line Tools（`xcode-select --install`）
  - **Linux**:
    ```bash
    sudo apt-get update
    sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
    ```
  - **Windows**: [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)（多くの環境で既に導入済み）

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/anizozina/runn-gui.git
cd runn-gui

# 依存関係のインストール
npm install

# 開発モードで起動
npm run tauri:dev
```

### 開発用スクリプト

```bash
# フロントエンドの開発サーバ
npm run dev

# フロントエンドのみビルド
npm run build

# Tauriアプリを開発モードで起動
npm run tauri:dev

# 生成物ビルド
npm run tauri:build

# Lint
npm run lint
```

### プロジェクト構成

```
runn-gui/
├── src/                          # Reactフロントエンド
│   ├── components/               # Reactコンポーネント
│   │   ├── StepTypeSelector.tsx  # ステップ種類の選択
│   │   ├── HttpRequestEditor.tsx # HTTPリクエストビルダー
│   │   ├── IncludeStepEditor.tsx # Includeステップ
│   │   ├── BindStepEditor.tsx    # Bindステップ
│   │   ├── StepsEditor.tsx       # ステップ全体編集
│   │   ├── YAMLExporter.tsx      # YAML生成 & 実行
│   │   └── ...
│   ├── store/                    # Zustand状態管理
│   │   └── runbookStore.ts       # ランブック状態と操作
│   ├── utils/                    # ユーティリティ
│   │   └── yaml.ts               # YAML変換ロジック
│   ├── i18n/                     # 国際化
│   │   ├── en.ts                 # 英語翻訳
│   │   └── ja.ts                 # 日本語翻訳
│   ├── types/                    # TypeScript型定義
│   │   └── runbook.ts            # ランブック型
│   └── App.tsx                   # アプリのエントリ
├── src-tauri/                    # Tauriバックエンド
│   ├── src/                      # Rustソース
│   │   └── main.rs               # Tauriアプリ設定
│   ├── icons/                    # アプリアイコン
│   ├── capabilities/             # Tauri権限
│   │   └── default.json          # 標準権限
│   ├── Cargo.toml                # Rust依存
│   └── tauri.conf.json           # Tauri設定
├── .github/workflows/            # CI/CD
│   ├── ci.yml                    # CI
│   └── release.yml               # リリース
├── dist/                         # フロントエンドビルド出力
└── README.md                     # README
```

## リリース手順

### 自動リリース（推奨）

GitHubで新しいリリースを作成すると、GitHub Actionsが自動でビルドします。

```bash
# 事前に package.json / src-tauri/Cargo.toml / src-tauri/tauri.conf.json のバージョン更新を行う
```

GitHub上で:
1. **Releases** → **Draft a new release** を開く
2. 新しいタグ（例: `v0.2.0`）を作成して内容を入力
3. **Publish release**（または **Save draft**）を押す

自動処理:
1. macOS（Intel/Apple Silicon）、Windows、Linux向けにビルド
2. インストーラ（`.dmg`, `.msi`, `.AppImage`, `.deb`）を生成
3. リリースに成果物をアップロード
4. 準備ができたらリリースを公開

### 手動ビルド

ローカルでリリースビルドを試す場合:

```bash
npm run tauri:build
```

生成物は `src-tauri/target/release/bundle/` に出力されます:
- **macOS**: `macos/runn-gui.app` と `dmg/runn-gui_*.dmg`
- **Windows**: `msi/runn-gui_*.msi`
- **Linux**: `appimage/runn-gui_*.AppImage` と `deb/runn-gui_*.deb`

## 技術スタック

- **フロントエンド**:
  - React 19 - UIフレームワーク
  - TypeScript - 型安全
  - Vite（rolldown-vite） - ビルド & 開発サーバ
  - Zustand - 状態管理
  - dnd-kit - ドラッグ＆ドロップ
  - js-yaml - YAML処理

- **バックエンド**:
  - Tauri 2 - デスクトップアプリフレームワーク
  - Rust - システムプログラミング

- **UI**:
  - Custom CSS - ダークテーマ
  - UIフレームワークなし - 軽量

## トラブルシューティング

### macOSで起動できない

"App is damaged and can't be opened" が表示される場合:

```bash
# クォランティン属性を除去
xattr -cr /Applications/runn-gui.app
```

### "cargo: command not found" でビルドが失敗する

Rustをインストール:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### YAML書き出しでバリデーションエラーが出る

以下を確認:
- Runnerが少なくとも1つ定義されている
- Stepが少なくとも1つ追加されている
- 各ステップの必須項目が埋まっている

### Run実行時に "runn: command not found"

runn CLIをインストール:

```bash
# macOS/Linux
brew install k1LoW/tap/runn

# または https://github.com/k1LoW/runn/releases から入手
```

## コントリビュート

コントリビュート歓迎です。詳細は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## ライセンス

[MIT License](LICENSE)

## 謝辞

- [runn](https://github.com/k1LoW/runn) - APIシナリオテストツール
- [Tauri](https://tauri.app/) - 軽量で安全なデスクトップアプリを構築
- [React](https://react.dev/) - WebとネイティブUIのためのライブラリ

---

<div align="center">
Made with ❤️ by the Runn GUI Builder team
</div>
