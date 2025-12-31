import type { Step } from '../types/runbook';

interface RunnRequestViewerProps {
  step: Step;
  onClose: () => void;
}

export function RunnRequestViewer({ step, onClose }: RunnRequestViewerProps) {

  if (!step.req) {
    return null;
  }

  // Parse runn format: { "/path": { "method": {...} } }
  let pathKey = '';
  let methodKey = '';
  let requestConfig: any = {};

  // Check if this is runn format (no method/path properties)
  if (typeof step.req === 'object' && !('method' in step.req) && !('path' in step.req)) {
    pathKey = Object.keys(step.req)[0] || '';
    if (pathKey) {
      const methodObj = (step.req as any)[pathKey];
      methodKey = Object.keys(methodObj)[0] || '';
      requestConfig = methodObj[methodKey] || {};
    }
  }

  return (
    <div>
      <h2>HTTP Request (runn format)</h2>

      {step.desc && (
        <div className="form-group">
          <label>Description:</label>
          <input
            type="text"
            className="form-control"
            value={step.desc}
            readOnly
            style={{ backgroundColor: '#2a2a2a' }}
          />
        </div>
      )}

      <div className="form-group">
        <label>Method:</label>
        <input
          type="text"
          className="form-control"
          value={methodKey.toUpperCase()}
          readOnly
          style={{ backgroundColor: '#2a2a2a' }}
        />
      </div>

      <div className="form-group">
        <label>Path:</label>
        <input
          type="text"
          className="form-control"
          value={pathKey}
          readOnly
          style={{ backgroundColor: '#2a2a2a' }}
        />
      </div>

      {requestConfig.headers && Object.keys(requestConfig.headers).length > 0 && (
        <div className="form-group">
          <label>Headers:</label>
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #444'
          }}>
            {Object.entries(requestConfig.headers).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  alignItems: 'center'
                }}
              >
                <span style={{ flex: 1, color: '#61dafb', fontFamily: 'monospace' }}>
                  {key}:
                </span>
                <span style={{ flex: 2, color: '#aaa', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {requestConfig.query && Object.keys(requestConfig.query).length > 0 && (
        <div className="form-group">
          <label>Query Parameters:</label>
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #444'
          }}>
            {Object.entries(requestConfig.query).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  alignItems: 'center'
                }}
              >
                <span style={{ flex: 1, color: '#61dafb', fontFamily: 'monospace' }}>
                  {key}:
                </span>
                <span style={{ flex: 2, color: '#aaa', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {requestConfig.body && (
        <div className="form-group">
          <label>Request Body:</label>
          <textarea
            className="form-control"
            value={typeof requestConfig.body === 'string' ? requestConfig.body : JSON.stringify(requestConfig.body, null, 2)}
            readOnly
            style={{ backgroundColor: '#2a2a2a', minHeight: '150px' }}
          />
        </div>
      )}

      {step.test && (
        <div className="form-group">
          <label>Tests:</label>
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #444',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            color: '#aaa',
            whiteSpace: 'pre-wrap'
          }}>
            {typeof step.test === 'string' ? step.test : JSON.stringify(step.test, null, 2)}
          </div>
        </div>
      )}

      {step.bind && Object.keys(step.bind).length > 0 && (
        <div className="form-group">
          <label>Bind Variables:</label>
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #444'
          }}>
            {Object.entries(step.bind).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  alignItems: 'center'
                }}
              >
                <span style={{ flex: 1, color: '#61dafb', fontFamily: 'monospace' }}>
                  {key}:
                </span>
                <span style={{ flex: 2, color: '#aaa', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#1a3a5a',
        borderRadius: '4px',
        border: '1px solid #007bff'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>
          About runn format requests
        </h4>
        <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>
          This step uses runn's native request format. This is a read-only view. To edit, modify the YAML file directly.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
