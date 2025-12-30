import { useState } from 'react';
import { useRunbookStore } from '../store/runbookStore';
import type { Step } from '../types/runbook';
import { HttpRequestEditor } from './HttpRequestEditor';
import { IncludeStepViewer } from './IncludeStepViewer';
import { BindStepViewer } from './BindStepViewer';
import { useTranslation } from '../i18n/I18nContext';

export function StepsEditor() {
  const { runbook, addStep, removeStep, moveStep } = useRunbookStore();
  const { t } = useTranslation();
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddStep = () => {
    setShowAddForm(true);
    setSelectedStepId(null);
  };

  const handleSaveNewStep = (stepData: Omit<Step, 'id'>) => {
    addStep(stepData);
    setShowAddForm(false);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      moveStep(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < runbook.steps.length - 1) {
      moveStep(index, index + 1);
    }
  };

  const getStepLabel = (step: Step, index: number): string => {
    if (step.desc) return step.desc;
    if (step.include) {
      const includePath = typeof step.include === 'string'
        ? step.include
        : step.include.path;
      return `📁 Include: ${includePath}`;
    }
    if (step.req) {
      // Handle special runn req notation: { "/path": { "get": {...} } }
      if (typeof step.req === 'object' && !step.req.method) {
        const pathKey = Object.keys(step.req)[0];
        if (pathKey) {
          const methodObj = (step.req as any)[pathKey];
          const method = Object.keys(methodObj)[0]?.toUpperCase() || 'HTTP';
          return `HTTP ${method} ${pathKey}`;
        }
      }
      return `HTTP ${step.req.method} ${step.req.path}`;
    }
    if (step.db) return `DB Query`;
    if (step.grpcRequest) return `gRPC ${step.grpcRequest.method}`;
    if (step.bind && Object.keys(step.bind).length > 0) {
      return `🔗 Bind: ${Object.keys(step.bind).join(', ')}`;
    }
    return `Step ${index + 1}`;
  };

  const selectedStep = runbook.steps.find(s => s.id === selectedStepId);

  return (
    <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
      {/* Steps List */}
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>{t.steps.title}</h2>
          <button className="btn btn-primary" onClick={handleAddStep}>
            {t.steps.add}
          </button>
        </div>

        <div className="step-list">
          {runbook.steps.length === 0 ? (
            <div className="empty-state">
              <h3>{t.steps.noSteps}</h3>
              <p>{t.steps.noStepsDesc}</p>
            </div>
          ) : (
            runbook.steps.map((step, index) => (
              <div
                key={step.id}
                className={`step-item ${selectedStepId === step.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedStepId(step.id);
                  setShowAddForm(false);
                }}
              >
                <div className="step-header">
                  <span className="step-title">
                    {index + 1}. {getStepLabel(step, index)}
                  </span>
                  <div className="step-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      ↑
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === runbook.steps.length - 1}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      ↓
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        removeStep(step.id);
                        if (selectedStepId === step.id) {
                          setSelectedStepId(null);
                        }
                      }}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Step Editor */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {showAddForm ? (
          <div>
            <h2>{t.steps.addNewStep}</h2>
            <HttpRequestEditor
              onSave={handleSaveNewStep}
              onCancel={handleCancelAdd}
            />
          </div>
        ) : selectedStep ? (
          <div>
            {selectedStep.include ? (
              <IncludeStepViewer
                step={selectedStep}
                onClose={() => setSelectedStepId(null)}
              />
            ) : !selectedStep.req && selectedStep.bind && Object.keys(selectedStep.bind).length > 0 ? (
              <BindStepViewer
                step={selectedStep}
                onClose={() => setSelectedStepId(null)}
              />
            ) : (
              <>
                <h2>{t.steps.editStep}</h2>
                <HttpRequestEditor
                  step={selectedStep}
                  onCancel={() => setSelectedStepId(null)}
                />
              </>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <h3>{t.steps.noStepSelected}</h3>
            <p>{t.steps.noStepSelectedDesc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
