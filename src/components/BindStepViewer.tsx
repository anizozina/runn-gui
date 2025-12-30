import type { Step } from '../types/runbook';
import { useTranslation } from '../i18n/I18nContext';

interface BindStepViewerProps {
  step: Step;
  onClose: () => void;
}

export function BindStepViewer({ step, onClose }: BindStepViewerProps) {
  const { t } = useTranslation();

  if (!step.bind || Object.keys(step.bind).length === 0) {
    return null;
  }

  return (
    <div>
      <h2>{t.bindStep.title}</h2>

      <div className="form-group">
        <label>{t.bindStep.description}</label>
        <input
          type="text"
          className="form-control"
          value={step.desc || ''}
          readOnly
          style={{ backgroundColor: '#2a2a2a' }}
        />
      </div>

      <div className="form-group">
        <label>{t.bindStep.bindings}</label>
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '1rem',
          borderRadius: '4px',
          border: '1px solid #444'
        }}>
          {Object.entries(step.bind).map(([key, value]) => (
            <div key={key}>
              {typeof value === 'object' && value !== null ? (
                <>
                  <div style={{ color: '#61dafb', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {key}:
                  </div>
                  <div style={{ marginLeft: '1rem', marginBottom: '1rem' }}>
                    {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                      <div
                        key={subKey}
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ flex: 1, color: '#61dafb', fontFamily: 'monospace' }}>
                          {subKey}:
                        </span>
                        <span style={{ flex: 2, color: '#aaa', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {typeof subValue === 'string' ? subValue : JSON.stringify(subValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div
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
              )}
            </div>
          ))}
        </div>
        <small style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
          {t.bindStep.hint}
        </small>
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#1a3a5a',
        borderRadius: '4px',
        border: '1px solid #007bff'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>
          {t.bindStep.info}
        </h4>
        <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>
          {t.bindStep.infoDesc}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          {t.bindStep.close}
        </button>
      </div>
    </div>
  );
}
