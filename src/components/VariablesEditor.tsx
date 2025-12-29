import { useState } from 'react';
import { useRunbookStore } from '../store/runbookStore';
import { useTranslation } from '../i18n/I18nContext';

export function VariablesEditor() {
  const { runbook, setVar, removeVar } = useRunbookStore();
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [varKey, setVarKey] = useState('');
  const [varValue, setVarValue] = useState('');

  const handleAddVariable = () => {
    if (varKey.trim()) {
      try {
        // Try to parse as JSON if it looks like an object/array
        let parsedValue: any = varValue;
        if (varValue.trim().startsWith('{') || varValue.trim().startsWith('[')) {
          parsedValue = JSON.parse(varValue);
        }
        setVar(varKey.trim(), parsedValue);
        setVarKey('');
        setVarValue('');
        setShowAddForm(false);
      } catch (error) {
        // If parsing fails, store as string
        setVar(varKey.trim(), varValue);
        setVarKey('');
        setVarValue('');
        setShowAddForm(false);
      }
    }
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>{t.variables.title}</h2>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? t.variables.cancel : t.variables.add}
        </button>
      </div>

      {showAddForm && (
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #444'
        }}>
          <h3 style={{ marginTop: 0 }}>{t.variables.newVariable}</h3>
          <div className="form-group">
            <label>{t.variables.variableName}</label>
            <input
              type="text"
              className="form-control"
              value={varKey}
              onChange={(e) => setVarKey(e.target.value)}
              placeholder={t.variables.variableNamePlaceholder}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>{t.variables.value}</label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setVarValue('${RUNN_BASE_URL:-http://localhost:3000}')}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                >
                  {t.variables.addBaseUrl}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setVarValue('${RUNN_AUTH_TOKEN:-Bearer token}')}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                >
                  {t.variables.addAuthToken}
                </button>
              </div>
            </div>
            <textarea
              className="form-control"
              value={varValue}
              onChange={(e) => setVarValue(e.target.value)}
              placeholder={t.variables.valuePlaceholder}
              rows={3}
            />
            <small style={{ color: '#aaa', fontSize: '0.8rem' }}>
              {t.variables.hint}
            </small>
          </div>

          <button className="btn btn-success" onClick={handleAddVariable}>
            {t.variables.addVariable}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {!runbook.vars || Object.entries(runbook.vars).length === 0 ? (
          <div className="empty-state">
            <h3>{t.variables.noVariables}</h3>
            <p>{t.variables.noVariablesDesc}</p>
          </div>
        ) : (
          Object.entries(runbook.vars).map(([key, value]) => (
            <div
              key={key}
              style={{
                backgroundColor: '#2a2a2a',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid #444'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>
                    {key}
                  </div>
                  <pre style={{
                    color: '#aaa',
                    fontSize: '0.85rem',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {formatValue(value)}
                  </pre>
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() => removeVar(key)}
                  style={{ padding: '0.25rem 0.75rem', marginLeft: '1rem' }}
                >
                  {t.variables.delete}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {runbook.vars && Object.keys(runbook.vars).length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#1a3a5a',
          borderRadius: '4px',
          border: '1px solid #007bff'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{t.variables.usageTitle}</h4>
          <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>
            {t.variables.usageDesc}
          </p>
        </div>
      )}
    </div>
  );
}
