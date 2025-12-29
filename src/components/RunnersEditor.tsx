import { useState } from 'react';
import { useRunbookStore } from '../store/runbookStore';
import type { HttpRunner } from '../types/runbook';
import { useTranslation } from '../i18n/I18nContext';

export function RunnersEditor() {
  const { runbook, addRunner, updateRunner, removeRunner } = useRunbookStore();
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRunner, setEditingRunner] = useState<string | null>(null);
  const [runnerName, setRunnerName] = useState('');
  const [endpoint, setEndpoint] = useState('');

  const handleAddRunner = () => {
    if (runnerName.trim() && endpoint.trim()) {
      const runner: HttpRunner = {
        endpoint: endpoint.trim()
      };
      addRunner(runnerName.trim(), runner);
      setRunnerName('');
      setEndpoint('');
      setShowAddForm(false);
    }
  };

  const handleEditRunner = (name: string) => {
    const runner = runbook.runners[name] as HttpRunner;
    setEditingRunner(name);
    setEndpoint(runner.endpoint);
  };

  const handleUpdateRunner = () => {
    if (editingRunner && endpoint.trim()) {
      const runner: HttpRunner = {
        endpoint: endpoint.trim()
      };
      updateRunner(editingRunner, runner);
      setEditingRunner(null);
      setEndpoint('');
    }
  };

  const handleCancelEdit = () => {
    setEditingRunner(null);
    setEndpoint('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>{t.runners.title}</h2>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? t.runners.cancel : t.runners.add}
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
          <h3 style={{ marginTop: 0 }}>{t.runners.newRunner}</h3>
          <div className="form-group">
            <label>{t.runners.runnerName}</label>
            <input
              type="text"
              className="form-control"
              value={runnerName}
              onChange={(e) => setRunnerName(e.target.value)}
              placeholder={t.runners.runnerNamePlaceholder}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>{t.runners.endpointUrl}</label>
              <button
                className="btn btn-secondary"
                onClick={() => setEndpoint('${RUNN_BASE_URL:-http://localhost:3000}')}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >
                {t.runners.useEnvVar}
              </button>
            </div>
            <input
              type="text"
              className="form-control"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder={t.runners.endpointPlaceholder}
            />
            <small style={{ color: '#aaa', fontSize: '0.8rem' }}>
              {t.runners.envVarHint}
            </small>
          </div>

          <button className="btn btn-success" onClick={handleAddRunner}>
            {t.runners.addRunner}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Object.entries(runbook.runners).length === 0 ? (
          <div className="empty-state">
            <h3>{t.runners.noRunners}</h3>
            <p>{t.runners.noRunnersDesc}</p>
          </div>
        ) : (
          Object.entries(runbook.runners).map(([name, runner]) => {
            const httpRunner = runner as HttpRunner;
            const isEditing = editingRunner === name;

            return (
              <div
                key={name}
                style={{
                  backgroundColor: '#2a2a2a',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: isEditing ? '1px solid #007bff' : '1px solid #444'
                }}
              >
                {isEditing ? (
                  <div>
                    <h3 style={{ marginTop: 0 }}>{t.runners.editRunner} {name}</h3>
                    <div className="form-group">
                      <label>{t.runners.endpointUrl}</label>
                      <input
                        type="text"
                        className="form-control"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        placeholder={t.runners.endpointPlaceholder}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-success" onClick={handleUpdateRunner}>
                        {t.runners.update}
                      </button>
                      <button className="btn btn-secondary" onClick={handleCancelEdit}>
                        {t.runners.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.25rem' }}>
                        {name}
                      </div>
                      <div style={{ color: '#aaa', fontSize: '0.85rem' }}>
                        {httpRunner.endpoint}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEditRunner(name)}
                        style={{ padding: '0.25rem 0.75rem' }}
                      >
                        {t.runners.edit}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => removeRunner(name)}
                        style={{ padding: '0.25rem 0.75rem' }}
                      >
                        {t.runners.delete}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
