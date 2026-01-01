import { useState } from 'react';
import { useRunbookStore } from '../store/runbookStore';
import { useTranslation } from '../i18n/I18nContext';
import type { Step } from '../types/runbook';

interface BindStepEditorProps {
  step?: Step;
  onSave?: (step: Omit<Step, 'id'>) => void;
  onCancel: () => void;
}

export function BindStepEditor({ step, onSave, onCancel }: BindStepEditorProps) {
  const updateStep = useRunbookStore((state) => state.updateStep);
  const { t } = useTranslation();

  // Extract existing data if editing
  const existingBind = step?.bind || {};

  // State
  const [desc, setDesc] = useState(step?.desc || '');
  const [bind, setBind] = useState<Record<string, any>>(existingBind);
  const [newBindKey, setNewBindKey] = useState('');
  const [newBindValue, setNewBindValue] = useState('');
  const [bindError, setBindError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Add binding
  const handleAddBinding = () => {
    if (!newBindKey.trim()) return;

    let value: any = newBindValue.trim();

    // Try to parse as JSON for complex values
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        value = JSON.parse(value);
      } catch {
        // Keep as string if not valid JSON
      }
    }

    setBind({
      ...bind,
      [newBindKey.trim()]: value || newBindValue
    });
    setNewBindKey('');
    setNewBindValue('');
  };

  // Remove binding
  const handleRemoveBinding = (key: string) => {
    const newBind = { ...bind };
    delete newBind[key];
    setBind(newBind);
  };

  // Save
  const handleSave = () => {
    // Validation
    if (Object.keys(bind).length === 0) {
      setBindError(t.bindStep.bindingsRequired);
      return;
    }
    setBindError('');

    const stepData: Omit<Step, 'id'> = {
      desc: desc.trim() || undefined,
      bind
    };

    if (step && step.id) {
      // Edit mode: update existing step
      updateStep(step.id, stepData);
      onCancel();
    } else if (onSave) {
      // Create mode: call onSave callback
      onSave(stepData);
    }
  };

  // Render binding value
  const renderBindingValue = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    } else {
      return String(value);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>{step ? t.bindStep.editTitle : t.bindStep.addTitle}</h2>
        <button
          onClick={() => setShowHelp(!showHelp)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0.25rem',
            color: '#61dafb',
            display: 'flex',
            alignItems: 'center'
          }}
          title={t.bindStep.info}
        >
          ℹ️
        </button>
      </div>

      {/* Help box - collapsible */}
      {showHelp && (
        <div style={{
          backgroundColor: '#2a4a6a',
          border: '1px solid #3a5a7a',
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa' }}>
            {t.bindStep.infoDesc}
          </p>
        </div>
      )}

      {/* Description */}
      <div className="form-group">
        <label>{t.bindStep.description}</label>
        <input
          type="text"
          className="form-control"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={t.bindStep.descriptionPlaceholder}
        />
      </div>

      {/* Bindings */}
      <div className="form-group">
        <label>{t.bindStep.bindings}</label>
        <small style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>
          {t.bindStep.hint}
        </small>

        {bindError && (
          <div style={{
            color: '#ff6b6b',
            fontSize: '0.85rem',
            marginBottom: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#ff000020',
            borderRadius: '4px',
            border: '1px solid #ff6b6b'
          }}>
            {bindError}
          </div>
        )}

        {/* Existing bindings */}
        {Object.keys(bind).length > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            {Object.entries(bind).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#3a3a3a',
                  borderRadius: '4px'
                }}
              >
                <span style={{
                  color: '#61dafb',
                  fontFamily: 'monospace',
                  flex: '0 0 150px',
                  paddingTop: '0.25rem'
                }}>
                  {key}:
                </span>
                <span style={{
                  color: '#fff',
                  fontFamily: 'monospace',
                  flex: 1,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {renderBindingValue(value)}
                </span>
                <button
                  onClick={() => handleRemoveBinding(key)}
                  className="btn btn-danger"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', flexShrink: 0 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {Object.keys(bind).length === 0 && (
          <div style={{
            color: '#aaa',
            fontSize: '0.85rem',
            padding: '0.5rem',
            backgroundColor: '#2a2a2a',
            borderRadius: '4px',
            marginBottom: '0.5rem'
          }}>
            {t.bindStep.noBindings}
          </div>
        )}

        {/* Add new binding */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-control"
            value={newBindKey}
            onChange={(e) => {
              setNewBindKey(e.target.value);
              if (bindError) setBindError('');
            }}
            placeholder={t.bindStep.bindKeyPlaceholder}
            style={{ flex: 1 }}
          />
          <input
            type="text"
            className="form-control"
            value={newBindValue}
            onChange={(e) => setNewBindValue(e.target.value)}
            placeholder={t.bindStep.bindValuePlaceholder}
            style={{ flex: 2, fontFamily: 'monospace' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newBindKey.trim()) {
                handleAddBinding();
              }
            }}
          />
          <button
            onClick={handleAddBinding}
            className="btn btn-primary"
            disabled={!newBindKey.trim()}
          >
            {t.bindStep.addBinding}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button className="btn btn-success" onClick={handleSave}>
          {step ? t.bindStep.updateStep : t.bindStep.addStep}
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          {t.bindStep.cancel}
        </button>
      </div>
    </div>
  );
}
