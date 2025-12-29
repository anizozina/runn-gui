import type { Step } from '../types/runbook';
import { useTranslation } from '../i18n/I18nContext';

interface IncludeStepViewerProps {
  step: Step;
  onClose: () => void;
}

export function IncludeStepViewer({ step, onClose }: IncludeStepViewerProps) {
  const { t } = useTranslation();

  if (!step.include) {
    return null;
  }

  const includePath = typeof step.include === 'string'
    ? step.include
    : step.include.path;

  const includeVars = typeof step.include === 'object'
    ? step.include.vars
    : undefined;

  return (
    <div>
      <h2>{t.includeStep.title}</h2>

      <div className="form-group">
        <label>{t.includeStep.description}</label>
        <input
          type="text"
          className="form-control"
          value={step.desc || ''}
          readOnly
          style={{ backgroundColor: '#2a2a2a' }}
        />
      </div>

      <div className="form-group">
        <label>{t.includeStep.path}</label>
        <input
          type="text"
          className="form-control"
          value={includePath}
          readOnly
          style={{ backgroundColor: '#2a2a2a', fontFamily: 'monospace' }}
        />
        <small style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
          {t.includeStep.pathHint}
        </small>
      </div>

      {includeVars && Object.keys(includeVars).length > 0 && (
        <div className="form-group">
          <label>{t.includeStep.vars}</label>
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #444'
          }}>
            {Object.entries(includeVars).map(([key, value]) => (
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
          <small style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
            {t.includeStep.varsHint}
          </small>
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
          {t.includeStep.info}
        </h4>
        <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>
          {t.includeStep.infoDesc}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          {t.includeStep.close}
        </button>
      </div>
    </div>
  );
}
