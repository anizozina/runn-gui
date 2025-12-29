import { useState } from 'react';
import { useRunbookStore } from '../store/runbookStore';
import { useTranslation } from '../i18n/I18nContext';

export function RunbookMetadata() {
  const { runbook, setDesc, addLabel, removeLabel } = useRunbookStore();
  const { t } = useTranslation();
  const [newLabel, setNewLabel] = useState('');

  const handleAddLabel = () => {
    if (newLabel.trim()) {
      addLabel(newLabel.trim());
      setNewLabel('');
    }
  };

  return (
    <div>
      <h2>{t.metadata.title}</h2>

      <div className="form-group">
        <label>{t.metadata.description}</label>
        <input
          type="text"
          className="form-control"
          value={runbook.desc || ''}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={t.metadata.descriptionPlaceholder}
        />
      </div>

      <div className="form-group">
        <label>{t.metadata.labels}</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="text"
            className="form-control"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
            placeholder={t.metadata.labelsPlaceholder}
          />
          <button className="btn btn-primary" onClick={handleAddLabel}>
            {t.metadata.addLabel}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {runbook.labels?.map((label, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.75rem',
                backgroundColor: '#007bff',
                borderRadius: '16px',
                color: 'white',
                fontSize: '0.85rem'
              }}
            >
              <span>{label}</span>
              <button
                onClick={() => removeLabel(label)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '1.2rem',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {(!runbook.labels || runbook.labels.length === 0) && (
          <p style={{ color: '#666', fontSize: '0.85rem', margin: '0.5rem 0' }}>
            {t.metadata.noLabels}
          </p>
        )}
      </div>
    </div>
  );
}
