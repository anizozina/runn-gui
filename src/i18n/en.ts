const en = {
  // App
  app: {
    title: 'Runn GUI Builder',
    untitledRunbook: 'Untitled Runbook',
  },

  // Tabs
  tabs: {
    editor: 'Editor',
    yaml: 'YAML Preview',
  },

  // Editor sections
  sections: {
    metadata: 'Metadata',
    runners: 'Runners',
    variables: 'Variables',
    steps: 'Steps',
  },

  // Metadata
  metadata: {
    title: 'Runbook Metadata',
    description: 'Description:',
    descriptionPlaceholder: 'Enter runbook description...',
    labels: 'Labels:',
    labelsPlaceholder: 'Add a label...',
    addLabel: 'Add',
    noLabels: 'No labels added yet',
  },

  // Runners
  runners: {
    title: 'Runners',
    add: '+ Add Runner',
    cancel: 'Cancel',
    newRunner: 'New HTTP Runner',
    runnerName: 'Runner Name:',
    runnerNamePlaceholder: 'e.g., api, backend, etc.',
    endpointUrl: 'Endpoint URL:',
    endpointPlaceholder: 'e.g., https://api.example.com or ${RUNN_BASE_URL:-http://localhost:3000}',
    useEnvVar: '+ Use Env Var',
    envVarHint: 'Use environment variable: ${RUNN_BASE_URL:-default}',
    addRunner: 'Add Runner',
    edit: 'Edit',
    delete: 'Delete',
    update: 'Update',
    noRunners: 'No Runners Defined',
    noRunnersDesc: 'Add an HTTP runner to get started',
    editRunner: 'Edit Runner:',
  },

  // Variables
  variables: {
    title: 'Variables',
    add: '+ Add Variable',
    cancel: 'Cancel',
    newVariable: 'New Variable',
    variableName: 'Variable Name:',
    variableNamePlaceholder: 'e.g., baseUrl, auth_token, etc.',
    value: 'Value:',
    valuePlaceholder: 'Enter value (string, number, JSON, or ${ENV_VAR:-default})',
    addBaseUrl: '+ Base URL',
    addAuthToken: '+ Auth Token',
    hint: 'Environment variables: ${ENV_VAR:-default value} | Templates: {{ vars.key }} | JSON objects',
    addVariable: 'Add Variable',
    delete: 'Delete',
    noVariables: 'No Variables Defined',
    noVariablesDesc: 'Add variables to use throughout your runbook',
    usageTitle: 'Usage in Steps:',
    usageDesc: 'Reference variables using: {{ vars.variableName }}',
  },

  // Steps
  steps: {
    title: 'Steps',
    add: '+ Add',
    noSteps: 'No Steps',
    noStepsDesc: 'Add a step to get started',
    addNewStep: 'Add New Step',
    editStep: 'Edit Step',
    noStepSelected: 'No Step Selected',
    noStepSelectedDesc: 'Select a step to edit or add a new one',
  },

  // HTTP Request Editor
  httpRequest: {
    description: 'Description (optional):',
    descriptionPlaceholder: 'e.g., Login user, Fetch products, etc.',
    method: 'Method:',
    path: 'Path:',
    pathPlaceholder: '/api/users, /api/products/{{ vars.productId }}',
    headers: 'Headers:',
    addJson: '+ JSON',
    addAccept: '+ Accept',
    addAuth: '+ Auth',
    headerName: 'Header name',
    headerValue: 'Header value',
    add: 'Add',

    // Body
    requestBody: 'Request Body:',
    bodyNone: 'None',
    bodyJson: 'JSON',
    bodyFormData: 'Form Data',
    bodyRaw: 'Raw Text',
    jsonHint: 'Content-Type: application/json will be set automatically',
    formKey: 'Key',
    formValue: 'Value',
    formAdd: 'Add',
    formDataHint: 'Content-Type: application/x-www-form-urlencoded will be set automatically',
    rawPlaceholder: 'Enter text...',
    rawHint: 'Will be sent as plain text',
    invalidJson: 'Invalid JSON:',
    parseError: 'Parse error',

    // Bind
    bindVariables: 'Bind Response to Variables:',
    bindKeyPlaceholder: 'Variable name (e.g., user_id)',
    bindValuePlaceholder: 'Response path (e.g., current.res.body.id)',
    bindHint: 'Bind response values to variables. Example: user_id = current.res.body.id',

    // Tests
    tests: 'Tests (Assertions):',
    test200: '+ 200 OK',
    test201: '+ 201 Created',
    testBodyNotEmpty: '+ Body Not Empty',
    testHasId: '+ Has ID',
    testConditionPlaceholder: 'e.g., current.res.status == 200',
    testDescPlaceholder: 'Test description (optional)',
    addCustomTest: 'Add Custom Test',
    testHint: 'Use quick add buttons above or write custom assertions',

    // Actions
    updateStep: 'Update Step',
    addStep: 'Add Step',
    cancel: 'Cancel',
  },

  // YAML Exporter
  yaml: {
    generate: 'Generate YAML',
    exportToFile: 'Export to File',
    copyToClipboard: 'Copy to Clipboard',
    validationErrors: 'Validation Errors:',
    generatedYaml: 'Generated YAML:',
    placeholder: 'Click "Generate YAML" to see the output...',
    exportSuccess: 'Runbook exported successfully!',
    copySuccess: 'YAML copied to clipboard!',
    exportError: 'Failed to export:',
  },

  // Common
  common: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    update: 'Update',
  },
};

export type Translation = typeof en;
export { en };
