import type { Translation } from './en';

export const ja: Translation = {
  // App
  app: {
    title: 'Runn GUI ビルダー',
    untitledRunbook: '無題のランブック',
  },

  // Tabs
  tabs: {
    editor: 'エディタ',
    yaml: 'YAML プレビュー',
  },

  // Editor sections
  sections: {
    metadata: 'メタデータ',
    runners: 'ランナー',
    variables: '変数',
    steps: 'ステップ',
  },

  // Metadata
  metadata: {
    title: 'ランブック メタデータ',
    description: '説明:',
    descriptionPlaceholder: 'ランブックの説明を入力...',
    labels: 'ラベル:',
    labelsPlaceholder: 'ラベルを追加...',
    addLabel: '追加',
    noLabels: 'ラベルが追加されていません',
  },

  // Runners
  runners: {
    title: 'ランナー',
    add: '+ ランナー追加',
    cancel: 'キャンセル',
    newRunner: '新しいHTTPランナー',
    runnerName: 'ランナー名:',
    runnerNamePlaceholder: '例: api, backend など',
    endpointUrl: 'エンドポイントURL:',
    endpointPlaceholder: '例: https://api.example.com または ${RUNN_BASE_URL:-http://localhost:3000}',
    useEnvVar: '+ 環境変数を使用',
    envVarHint: '環境変数を使用: ${RUNN_BASE_URL:-デフォルト値}',
    addRunner: 'ランナーを追加',
    edit: '編集',
    delete: '削除',
    update: '更新',
    noRunners: 'ランナーが未定義です',
    noRunnersDesc: 'HTTPランナーを追加して開始しましょう',
    editRunner: 'ランナーを編集:',
  },

  // Variables
  variables: {
    title: '変数',
    add: '+ 変数追加',
    cancel: 'キャンセル',
    newVariable: '新しい変数',
    variableName: '変数名:',
    variableNamePlaceholder: '例: baseUrl, auth_token など',
    value: '値:',
    valuePlaceholder: '値を入力 (文字列、数値、JSON、または ${ENV_VAR:-デフォルト値})',
    addBaseUrl: '+ ベースURL',
    addAuthToken: '+ 認証トークン',
    hint: '環境変数: ${ENV_VAR:-デフォルト値} | テンプレート: {{ vars.key }} | JSONオブジェクト',
    addVariable: '変数を追加',
    delete: '削除',
    noVariables: '変数が未定義です',
    noVariablesDesc: 'ランブック全体で使用する変数を追加',
    usageTitle: 'ステップでの使い方:',
    usageDesc: '変数を参照するには: {{ vars.変数名 }}',
  },

  // Steps
  steps: {
    title: 'ステップ',
    add: '+ 追加',
    noSteps: 'ステップがありません',
    noStepsDesc: 'ステップを追加して開始しましょう',
    addNewStep: '新しいステップを追加',
    editStep: 'ステップを編集',
    noStepSelected: 'ステップが選択されていません',
    noStepSelectedDesc: 'ステップを選択して編集するか、新しいステップを追加してください',
    finallyTitle: 'Finally（クリーンアップ）',
    finallyDesc: '最後に実行されるクリーンアップステップ',
  },

  // Include Step
  includeStep: {
    title: 'Includeステップ（外部参照）',
    description: '説明:',
    path: 'Includeパス:',
    pathHint: '外部ステップファイルへのパス（例: steps/post-fleet.yml）',
    vars: 'Includeステップに渡す変数:',
    varsHint: 'これらの変数は外部ステップファイルに渡されます',
    info: 'Includeステップについて',
    infoDesc: 'Includeステップは外部YAMLファイルを参照します。これは読み取り専用ビューです。編集するには、YAMLファイルを直接編集してください。',
    close: '閉じる',
  },

  // Bind Step
  bindStep: {
    title: 'Bindステップ（変数バインディング）',
    description: '説明:',
    bindings: '変数バインディング:',
    hint: 'これらのバインディングはレスポンスから値を抽出したり、値を生成します（例: faker.UUID()）',
    info: 'Bindステップについて',
    infoDesc: 'Bindステップは値の抽出や生成に使用されます。よくある使い方: faker.UUID()でユニークIDを生成、current.res.body.idでレスポンスの値を取得。これは読み取り専用ビューです。',
    close: '閉じる',
  },

  // HTTP Request Editor
  httpRequest: {
    description: '説明 (任意):',
    descriptionPlaceholder: '例: ユーザーログイン、商品取得 など',
    method: 'メソッド:',
    path: 'パス:',
    pathPlaceholder: '/api/users, /api/products/{{ vars.productId }}',
    headers: 'ヘッダー:',
    addJson: '+ JSON',
    addAccept: '+ Accept',
    addAuth: '+ Auth',
    headerName: 'ヘッダー名',
    headerValue: 'ヘッダー値',
    add: '追加',

    // Body
    requestBody: 'リクエストボディ:',
    bodyNone: 'なし',
    bodyJson: 'JSON',
    bodyFormData: 'フォームデータ',
    bodyRaw: 'テキスト',
    jsonHint: 'Content-Type: application/json が自動設定されます',
    formKey: 'キー',
    formValue: '値',
    formAdd: '追加',
    formDataHint: 'Content-Type: application/x-www-form-urlencoded が自動設定されます',
    rawPlaceholder: 'テキストを入力...',
    rawHint: 'プレーンテキストとして送信されます',
    invalidJson: '無効なJSON:',
    parseError: 'パースエラー',

    // Bind
    bindVariables: 'レスポンスを変数にバインド:',
    bindKeyPlaceholder: '変数名 (例: user_id)',
    bindValuePlaceholder: 'レスポンスパス (例: current.res.body.id)',
    bindHint: 'レスポンスの値を変数に保存 例: user_id = current.res.body.id',

    // Tests
    tests: 'テスト (アサーション):',
    test200: '+ 200 OK',
    test201: '+ 201 Created',
    testBodyNotEmpty: '+ Body 非空',
    testHasId: '+ ID あり',
    testConditionPlaceholder: '例: current.res.status == 200',
    testDescPlaceholder: 'テストの説明 (任意)',
    addCustomTest: 'カスタムテストを追加',
    testHint: 'クイック追加ボタンまたはカスタムアサーションを記述',

    // Actions
    updateStep: 'ステップを更新',
    addStep: 'ステップを追加',
    cancel: 'キャンセル',
  },

  // YAML Exporter
  yaml: {
    generate: 'YAML生成',
    exportToFile: 'ファイルにエクスポート',
    copyToClipboard: 'クリップボードにコピー',
    importFromFile: 'YAMLインポート',
    validationErrors: 'バリデーションエラー:',
    generatedYaml: '生成されたYAML:',
    placeholder: '"YAML生成"をクリックして出力を確認...',
    exportSuccess: 'ランブックのエクスポートに成功しました！',
    copySuccess: 'YAMLをクリップボードにコピーしました！',
    exportError: 'エクスポートに失敗:',
    importSuccess: 'YAMLのインポートに成功しました！',
    importError: 'インポートに失敗:',
    importConfirm: 'YAMLをインポートすると現在のランブックが置き換えられます。続行しますか？',
  },

  // Common
  common: {
    add: '追加',
    edit: '編集',
    delete: '削除',
    cancel: 'キャンセル',
    save: '保存',
    update: '更新',
  },
};
