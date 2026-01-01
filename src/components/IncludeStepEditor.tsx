import { useState } from 'react';
import { useRunbookStore } from '../store/runbookStore';
import { useTranslation } from '../i18n/I18nContext';
import type { Step, IncludeStep } from '../types/runbook';

interface IncludeStepEditorProps {
  step?: Step;
  onSave?: (step: Omit<Step, 'id'>) => void;
  onCancel: () => void;
}

export function IncludeStepEditor({ step, onSave, onCancel }: IncludeStepEditorProps) {
  const updateStep = useRunbookStore((state) => state.updateStep);
  const { t } = useTranslation();

  // Extract existing data if editing
  const existingInclude = step?.include;
  const existingPath = typeof existingInclude === 'string'
    ? existingInclude
    : existingInclude?.path || '';
  const existingVars = typeof existingInclude === 'object' && existingInclude !== null && 'vars' in existingInclude
    ? existingInclude.vars || {}
    : {};

  // State
  const [desc, setDesc] = useState(step?.desc || '');
  const [path, setPath] = useState(existingPath);
  const [vars, setVars] = useState<Record<string, any>>(existingVars);
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [pathError, setPathError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Add variable
  const handleAddVar = () => {
    if (!newVarKey.trim()) return;

    setVars({
      ...vars,
      [newVarKey.trim()]: newVarValue.trim() || newVarValue
    });
    setNewVarKey('');
    setNewVarValue('');
  };

  // Remove variable
  const handleRemoveVar = (key: string) => {
    const newVars = { ...vars };
    delete newVars[key];
    setVars(newVars);
  };

  // Save
  const handleSave = () => {
    // Validation
    if (!path.trim()) {
      setPathError(t.includeStep.pathRequired);
      return;
    }
    setPathError('');

    // Build include object
    let includeData: string | IncludeStep;

    if (Object.keys(vars).length === 0) {
      // Simple format: just string
      includeData = path.trim();
    } else {
      // Object format with vars
      includeData = {
        path: path.trim(),
        vars
      };
    }

    const stepData: Omit<Step, 'id'> = {
      desc: desc.trim() || undefined,
      include: includeData
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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>{step ? t.includeStep.editTitle : t.includeStep.addTitle}</h2>
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
          title={t.includeStep.info}
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
            {t.includeStep.infoDesc}
          </p>
        </div>
      )}

      {/* Description */}
      <div className="form-group">
        <label>{t.includeStep.description}</label>
        <input
          type="text"
          className="form-control"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={t.includeStep.descriptionPlaceholder}
        />
      </div>

      {/* Path */}
      <div className="form-group">
        <label>{t.includeStep.path}</label>
        <input
          type="text"
          className="form-control"
          value={path}
          onChange={(e) => {
            setPath(e.target.value);
            if (pathError) setPathError('');
          }}
          placeholder={t.includeStep.pathPlaceholder}
          style={{
            fontFamily: 'monospace',
            borderColor: pathError ? '#ff6b6b' : undefined
          }}
        />
        {pathError && (
          <div style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {pathError}
          </div>
        )}
        <small style={{ color: '#aaa', fontSize: '0.8rem' }}>
          {t.includeStep.pathHint}
        </small>
      </div>

      {/* Variables */}
      <div className="form-group">
        <label>{t.includeStep.vars}</label>
        <small style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>
          {t.includeStep.varsHint}
        </small>

        {/* Existing variables */}
        {Object.keys(vars).length > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            {Object.entries(vars).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#3a3a3a',
                  borderRadius: '4px'
                }}
              >
                <span style={{ color: '#61dafb', fontFamily: 'monospace', flex: '0 0 150px' }}>
                  {key}:
                </span>
                <span style={{ color: '#fff', fontFamily: 'monospace', flex: 1 }}>
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </span>
                <button
                  onClick={() => handleRemoveVar(key)}
                  className="btn btn-danger"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {Object.keys(vars).length === 0 && (
          <div style={{
            color: '#aaa',
            fontSize: '0.85rem',
            padding: '0.5rem',
            backgroundColor: '#2a2a2a',
            borderRadius: '4px',
            marginBottom: '0.5rem'
          }}>
            {t.includeStep.noVars}
          </div>
        )}

        {/* Add new variable */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-control"
            value={newVarKey}
            onChange={(e) => setNewVarKey(e.target.value)}
            placeholder={t.includeStep.varName}
            style={{ flex: 1 }}
          />
          <input
            type="text"
            className="form-control"
            value={newVarValue}
            onChange={(e) => setNewVarValue(e.target.value)}
            placeholder={t.includeStep.varValue}
            style={{ flex: 2 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newVarKey.trim()) {
                handleAddVar();
              }
            }}
          />
          <button
            onClick={handleAddVar}
            className="btn btn-primary"
            disabled={!newVarKey.trim()}
          >
            {t.includeStep.addVar}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button className="btn btn-success" onClick={handleSave}>
          {step ? t.includeStep.updateStep : t.includeStep.addStep}
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          {t.includeStep.cancel}
        </button>
      </div>
    </div>
  );
}
