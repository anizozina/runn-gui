import { useState } from 'react';
import { useRunbookStore } from '../store/runbookStore';
import type { Step, HttpMethod, TestCondition } from '../types/runbook';
import { useTranslation } from '../i18n/I18nContext';

interface HttpRequestEditorProps {
  step?: Step;
  onSave?: (step: Omit<Step, 'id'>) => void;
  onCancel: () => void;
}

// Helper function to extract request data from both formats
function extractRequestData(req: any) {
  // Standard format: { method: "GET", path: "/path", ... }
  if (req?.method && req?.path) {
    return {
      method: req.method as HttpMethod,
      path: req.path,
      headers: req.headers || {},
      body: req.body,
      query: req.query,
      isRunnFormat: false
    };
  }

  // Runn format: { "/path": { "get": { headers: {...}, ... } } }
  if (req && typeof req === 'object' && !req.method && !req.path) {
    const pathKey = Object.keys(req)[0];
    if (pathKey) {
      const methodObj = req[pathKey];
      const methodKey = Object.keys(methodObj)[0];
      const config = methodObj[methodKey] || {};

      return {
        method: methodKey.toUpperCase() as HttpMethod,
        path: pathKey,
        headers: config.headers || {},
        body: config.body,
        query: config.query,
        isRunnFormat: true
      };
    }
  }

  // Default
  return {
    method: 'GET' as HttpMethod,
    path: '',
    headers: {},
    body: undefined,
    query: undefined,
    isRunnFormat: false
  };
}

export function HttpRequestEditor({ step, onSave, onCancel }: HttpRequestEditorProps) {
  const updateStep = useRunbookStore((state) => state.updateStep);
  const { t } = useTranslation();

  // Extract request data (supports both standard and runn formats)
  const requestData = step?.req ? extractRequestData(step.req) : extractRequestData(null);

  // Form state
  const [desc, setDesc] = useState(step?.desc || '');
  const [method, setMethod] = useState<HttpMethod>(requestData.method);
  const [path, setPath] = useState(requestData.path);
  const [headers, setHeaders] = useState<Record<string, string>>(requestData.headers);
  const [query] = useState<Record<string, any>>(requestData.query || {});
  const [useRunnFormat] = useState(requestData.isRunnFormat);

  // Body type state
  const [bodyType, setBodyType] = useState<'none' | 'json' | 'form-data' | 'raw'>('json');
  const [body, setBody] = useState(
    requestData.body
      ? typeof requestData.body === 'string'
        ? requestData.body
        : JSON.stringify(requestData.body, null, 2)
      : ''
  );
  const [formData, setFormData] = useState<Record<string, string>>({});

  const [tests, setTests] = useState<TestCondition[]>(step?.test || []);
  const [bind, setBind] = useState<Record<string, string>>(
    step?.bind?.vars || step?.bind?.steps || {}
  );

  // Error state
  const [bodyError, setBodyError] = useState<string>('');

  // Header editing
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  // Test editing
  const [newTestCondition, setNewTestCondition] = useState('');
  const [newTestDesc, setNewTestDesc] = useState('');

  // Bind editing
  const [newBindKey, setNewBindKey] = useState('');
  const [newBindValue, setNewBindValue] = useState('');

  // Form data editing
  const [newFormKey, setNewFormKey] = useState('');
  const [newFormValue, setNewFormValue] = useState('');

  const handleAddHeader = () => {
    if (newHeaderKey.trim()) {
      setHeaders({ ...headers, [newHeaderKey.trim()]: newHeaderValue });
      setNewHeaderKey('');
      setNewHeaderValue('');
    }
  };

  const handleRemoveHeader = (key: string) => {
    const { [key]: _, ...rest } = headers;
    setHeaders(rest);
  };

  const handleAddTest = () => {
    if (newTestCondition.trim()) {
      setTests([
        ...tests,
        {
          condition: newTestCondition.trim(),
          desc: newTestDesc.trim() || undefined
        }
      ]);
      setNewTestCondition('');
      setNewTestDesc('');
    }
  };

  const handleRemoveTest = (index: number) => {
    setTests(tests.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Clear previous errors
    setBodyError('');

    let parsedBody: any = undefined;
    const finalHeaders = { ...headers };

    // Parse body based on type
    if (bodyType !== 'none') {
      if (bodyType === 'json') {
        if (body.trim()) {
          try {
            parsedBody = JSON.parse(body);
            finalHeaders['Content-Type'] = 'application/json';
          } catch (error) {
            setBodyError(`${t.httpRequest.invalidJson}: ${error instanceof Error ? error.message : t.httpRequest.parseError}`);
            return;
          }
        }
      } else if (bodyType === 'form-data') {
        if (Object.keys(formData).length > 0) {
          parsedBody = formData;
          finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      } else if (bodyType === 'raw') {
        if (body.trim()) {
          parsedBody = body;
        }
      }
    }

    // Build req object in the appropriate format
    let req: any;

    if (useRunnFormat) {
      // Runn format: { "/path": { "method": {...} } }
      const config: any = {};
      if (Object.keys(finalHeaders).length > 0) config.headers = finalHeaders;
      if (parsedBody !== undefined) config.body = parsedBody;
      if (Object.keys(query).length > 0) config.query = query;

      req = {
        [path]: {
          [method.toLowerCase()]: config
        }
      };
    } else {
      // Standard format: { method: "GET", path: "/path", ... }
      req = {
        method,
        path,
        headers: Object.keys(finalHeaders).length > 0 ? finalHeaders : undefined,
        body: parsedBody,
        query: Object.keys(query).length > 0 ? query : undefined
      };
    }

    const stepData: Omit<Step, 'id'> = {
      desc: desc.trim() || undefined,
      req,
      test: tests.length > 0 ? tests : undefined,
      bind: Object.keys(bind).length > 0 ? { vars: bind } : undefined
    };

    if (step && step.id) {
      // Update existing step
      updateStep(step.id, stepData);
      onCancel();
    } else if (onSave) {
      // Create new step
      onSave(stepData);
    }
  };

  const handleAddFormData = () => {
    if (newFormKey.trim()) {
      setFormData({ ...formData, [newFormKey.trim()]: newFormValue });
      setNewFormKey('');
      setNewFormValue('');
    }
  };

  const handleRemoveFormData = (key: string) => {
    const { [key]: _, ...rest } = formData;
    setFormData(rest);
  };

  const handleAddBind = () => {
    if (newBindKey.trim() && newBindValue.trim()) {
      setBind({ ...bind, [newBindKey.trim()]: newBindValue.trim() });
      setNewBindKey('');
      setNewBindValue('');
    }
  };

  const handleRemoveBind = (key: string) => {
    const { [key]: _, ...rest } = bind;
    setBind(rest);
  };

  return (
    <div>
      <div className="form-group">
        <label>{t.httpRequest.description}</label>
        <input
          type="text"
          className="form-control"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={t.httpRequest.descriptionPlaceholder}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>{t.httpRequest.method}</label>
          <select
            className="form-control"
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>{t.httpRequest.path}</label>
          <input
            type="text"
            className="form-control"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder={t.httpRequest.pathPlaceholder}
          />
        </div>
      </div>

      {/* Headers */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ margin: 0 }}>{t.httpRequest.headers}</label>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setHeaders({ ...headers, 'Content-Type': 'application/json' })}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              {t.httpRequest.addJson}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setHeaders({ ...headers, 'Accept': 'application/json' })}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              {t.httpRequest.addAccept}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setHeaders({ ...headers, 'Authorization': '{{ vars.auth_token }}' })}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              {t.httpRequest.addAuth}
            </button>
          </div>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          {Object.entries(headers).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.25rem',
                padding: '0.5rem',
                backgroundColor: '#2a2a2a',
                borderRadius: '4px'
              }}
            >
              <span style={{ flex: 1, color: '#61dafb' }}>{key}:</span>
              <span style={{ flex: 2, color: '#aaa' }}>{value}</span>
              <button
                className="btn btn-danger"
                onClick={() => handleRemoveHeader(key)}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-control"
            value={newHeaderKey}
            onChange={(e) => setNewHeaderKey(e.target.value)}
            placeholder={t.httpRequest.headerName}
            style={{ flex: 1 }}
          />
          <input
            type="text"
            className="form-control"
            value={newHeaderValue}
            onChange={(e) => setNewHeaderValue(e.target.value)}
            placeholder={t.httpRequest.headerValue}
            style={{ flex: 2 }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddHeader()}
          />
          <button className="btn btn-primary" onClick={handleAddHeader}>
            {t.httpRequest.add}
          </button>
        </div>
      </div>

      {/* Body (for POST, PUT, PATCH) */}
      {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ margin: 0 }}>{t.httpRequest.requestBody}</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn ${bodyType === 'none' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setBodyType('none')}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
              >
                {t.httpRequest.bodyNone}
              </button>
              <button
                className={`btn ${bodyType === 'json' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setBodyType('json')}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
              >
                {t.httpRequest.bodyJson}
              </button>
              <button
                className={`btn ${bodyType === 'form-data' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setBodyType('form-data')}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
              >
                {t.httpRequest.bodyFormData}
              </button>
              <button
                className={`btn ${bodyType === 'raw' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setBodyType('raw')}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
              >
                {t.httpRequest.bodyRaw}
              </button>
            </div>
          </div>

          {bodyType === 'json' && (
            <>
              <textarea
                className="form-control"
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  setBodyError('');
                }}
                placeholder={'{\n  "key": "value"\n}'}
                rows={8}
                style={{ borderColor: bodyError ? '#dc3545' : undefined }}
              />
              {bodyError && (
                <div style={{
                  color: '#ff6b6b',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#ff000020',
                  borderRadius: '4px',
                  border: '1px solid #ff0000'
                }}>
                  {bodyError}
                </div>
              )}
              <small style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                {t.httpRequest.jsonHint}
              </small>
            </>
          )}

          {bodyType === 'form-data' && (
            <>
              <div style={{ marginBottom: '0.5rem' }}>
                {Object.entries(formData).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '0.25rem',
                      padding: '0.5rem',
                      backgroundColor: '#2a2a2a',
                      borderRadius: '4px'
                    }}
                  >
                    <span style={{ flex: 1, color: '#61dafb' }}>{key}:</span>
                    <span style={{ flex: 2, color: '#aaa' }}>{value}</span>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemoveFormData(key)}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  value={newFormKey}
                  onChange={(e) => setNewFormKey(e.target.value)}
                  placeholder={t.httpRequest.formKey}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={newFormValue}
                  onChange={(e) => setNewFormValue(e.target.value)}
                  placeholder={t.httpRequest.formValue}
                  style={{ flex: 2 }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFormData()}
                />
                <button className="btn btn-primary" onClick={handleAddFormData}>
                  {t.httpRequest.formAdd}
                </button>
              </div>
              <small style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                {t.httpRequest.formDataHint}
              </small>
            </>
          )}

          {bodyType === 'raw' && (
            <>
              <textarea
                className="form-control"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t.httpRequest.rawPlaceholder}
                rows={8}
              />
              <small style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                {t.httpRequest.rawHint}
              </small>
            </>
          )}
        </div>
      )}

      {/* Bind Variables */}
      <div className="form-group">
        <label>{t.httpRequest.bindVariables}</label>
        <div style={{ marginBottom: '0.5rem' }}>
          {Object.entries(bind).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.25rem',
                padding: '0.5rem',
                backgroundColor: '#2a2a2a',
                borderRadius: '4px'
              }}
            >
              <span style={{ flex: 1, color: '#61dafb' }}>{key}:</span>
              <span style={{ flex: 2, color: '#aaa', fontFamily: 'monospace', fontSize: '0.85rem' }}>{value}</span>
              <button
                className="btn btn-danger"
                onClick={() => handleRemoveBind(key)}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-control"
            value={newBindKey}
            onChange={(e) => setNewBindKey(e.target.value)}
            placeholder={t.httpRequest.bindKeyPlaceholder}
            style={{ flex: 1 }}
          />
          <input
            type="text"
            className="form-control"
            value={newBindValue}
            onChange={(e) => setNewBindValue(e.target.value)}
            placeholder={t.httpRequest.bindValuePlaceholder}
            style={{ flex: 2 }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddBind()}
          />
          <button className="btn btn-primary" onClick={handleAddBind}>
            {t.httpRequest.add}
          </button>
        </div>
        <small style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
          {t.httpRequest.bindHint}
        </small>
      </div>

      {/* Tests */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ margin: 0 }}>{t.httpRequest.tests}</label>
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setTests([...tests, { condition: 'current.res.status == 200' }])}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              {t.httpRequest.test200}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setTests([...tests, { condition: 'current.res.status == 201' }])}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              {t.httpRequest.test201}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setTests([...tests, { condition: 'len(current.res.body) > 0' }])}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              {t.httpRequest.testBodyNotEmpty}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setTests([...tests, { condition: 'current.res.body.id != null' }])}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            >
              {t.httpRequest.testHasId}
            </button>
          </div>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          {tests.map((test, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.25rem',
                padding: '0.5rem',
                backgroundColor: '#2a2a2a',
                borderRadius: '4px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ color: '#61dafb', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  {test.condition}
                </div>
                {test.desc && (
                  <div style={{ color: '#aaa', fontSize: '0.75rem' }}>
                    {test.desc}
                  </div>
                )}
              </div>
              <button
                className="btn btn-danger"
                onClick={() => handleRemoveTest(index)}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-control"
            value={newTestCondition}
            onChange={(e) => setNewTestCondition(e.target.value)}
            placeholder={t.httpRequest.testConditionPlaceholder}
          />
          <input
            type="text"
            className="form-control"
            value={newTestDesc}
            onChange={(e) => setNewTestDesc(e.target.value)}
            placeholder={t.httpRequest.testDescPlaceholder}
          />
          <button className="btn btn-primary" onClick={handleAddTest} style={{ alignSelf: 'flex-start' }}>
            {t.httpRequest.addCustomTest}
          </button>
        </div>
        <small style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
          {t.httpRequest.testHint}
        </small>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <button className="btn btn-success" onClick={handleSave}>
          {step ? t.httpRequest.updateStep : t.httpRequest.addStep}
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          {t.httpRequest.cancel}
        </button>
      </div>
    </div>
  );
}
