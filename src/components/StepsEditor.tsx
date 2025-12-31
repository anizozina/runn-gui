import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRunbookStore } from '../store/runbookStore';
import type { Step } from '../types/runbook';
import { HttpRequestEditor } from './HttpRequestEditor';
import { IncludeStepViewer } from './IncludeStepViewer';
import { BindStepViewer } from './BindStepViewer';
import { RunnRequestViewer } from './RunnRequestViewer';
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = runbook.steps.findIndex((step) => step.id === active.id);
      const newIndex = runbook.steps.findIndex((step) => step.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        moveStep(oldIndex, newIndex);
      }
    }
  };

  interface StepDisplayInfo {
    method?: string;
    path?: string;
    desc?: string;
    icon?: string;
    label: string;
  }

  const getStepDisplayInfo = (step: Step, index: number): StepDisplayInfo => {
    // Include step
    if (step.include) {
      const includePath = typeof step.include === 'string' ? step.include : step.include.path;
      return {
        icon: '📁',
        label: step.desc || 'Include',
        path: includePath
      };
    }

    // HTTP request (runn format)
    if (step.req && typeof step.req === 'object' && !('method' in step.req)) {
      const pathKey = Object.keys(step.req)[0];
      if (pathKey) {
        const methodObj = (step.req as any)[pathKey];
        const method = Object.keys(methodObj)[0]?.toUpperCase() || 'GET';
        return {
          method,
          path: pathKey,
          label: step.desc || 'HTTP Request'
        };
      }
    }

    // HTTP request (standard format)
    if (step.req && 'method' in step.req) {
      return {
        method: step.req.method,
        path: step.req.path,
        label: step.desc || 'HTTP Request'
      };
    }

    // Bind-only step
    if (step.bind && Object.keys(step.bind).length > 0) {
      return {
        icon: '🔗',
        label: step.desc || 'Bind',
        path: Object.keys(step.bind).join(', ')
      };
    }

    // Other types
    if (step.db) return { label: step.desc || 'DB Query' };
    if (step.grpcRequest) return { label: step.desc || 'gRPC', path: step.grpcRequest.method };

    return { label: `Step ${index + 1}` };
  };

  const selectedStep = runbook.steps.find(s => s.id === selectedStepId)
    || runbook.finally?.find(s => s.id === selectedStepId);

  // Helper function to detect runn format req
  const isRunnFormatReq = (step: Step): boolean => {
    if (!step.req) return false;
    // runn format: { "/path": { "method": {...} } }
    // Standard format has method and path properties
    return typeof step.req === 'object' && !('method' in step.req) && !('path' in step.req);
  };

  // Sortable Step Item Component
  interface SortableStepItemProps {
    step: Step;
    index: number;
    selectedStepId: string | null;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
  }

  function SortableStepItem({ step, index, selectedStepId, onSelect, onRemove }: SortableStepItemProps) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: step.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const displayInfo = getStepDisplayInfo(step, index);

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`step-item ${selectedStepId === step.id ? 'active' : ''}`}
        onClick={() => {
          onSelect(step.id);
          setShowAddForm(false);
        }}
      >
        <div className="step-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span
                {...attributes}
                {...listeners}
                style={{
                  cursor: 'grab',
                  color: '#aaa',
                  fontSize: '0.9rem',
                  flexShrink: 0,
                  padding: '0.2rem',
                  touchAction: 'none'
                }}
              >
                ⋮⋮
              </span>
              <span style={{ color: '#aaa', fontSize: '0.75rem', flexShrink: 0 }}>
                {index + 1}.
              </span>
              {displayInfo.icon && (
                <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>
                  {displayInfo.icon}
                </span>
              )}
              <span
                style={{
                  color: '#fff',
                  fontSize: '0.85rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0
                }}
              >
                {displayInfo.label}
              </span>
            </div>
            {displayInfo.path && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginLeft: '2.5rem'
                }}
              >
                {displayInfo.method && (
                  <span
                    className="method-chip"
                    style={{
                      padding: '0.1rem 0.4rem',
                      borderRadius: '3px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      backgroundColor: displayInfo.method === 'GET' ? '#28a745' :
                                       displayInfo.method === 'POST' ? '#007bff' :
                                       displayInfo.method === 'PUT' ? '#ffc107' :
                                       displayInfo.method === 'DELETE' ? '#dc3545' :
                                       '#6c757d',
                      color: '#fff',
                      flexShrink: 0
                    }}
                  >
                    {displayInfo.method}
                  </span>
                )}
                <span
                  style={{
                    color: '#aaa',
                    fontSize: '0.75rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0
                  }}
                >
                  {displayInfo.path}
                </span>
              </div>
            )}
          </div>
          <div className="step-actions" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn btn-danger"
              onClick={() => {
                onRemove(step.id);
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
    );
  }

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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="step-list">
            {runbook.steps.length === 0 ? (
              <div className="empty-state">
                <h3>{t.steps.noSteps}</h3>
                <p>{t.steps.noStepsDesc}</p>
              </div>
            ) : (
              <SortableContext
                items={runbook.steps.map(step => step.id)}
                strategy={verticalListSortingStrategy}
              >
                {runbook.steps.map((step, index) => (
                  <SortableStepItem
                    key={step.id}
                    step={step}
                    index={index}
                    selectedStepId={selectedStepId}
                    onSelect={setSelectedStepId}
                    onRemove={removeStep}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        </DndContext>

        {/* Finally Steps */}
        {runbook.finally && runbook.finally.length > 0 && (
          <>
            <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #444' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#ffa500' }}>
                {t.steps.finallyTitle}
              </h3>
              <small style={{ color: '#aaa', fontSize: '0.8rem' }}>
                {t.steps.finallyDesc}
              </small>
            </div>
            <div className="step-list">
              {runbook.finally.map((step, index) => {
                const displayInfo = getStepDisplayInfo(step, index);
                return (
                  <div
                    key={step.id}
                    className={`step-item ${selectedStepId === step.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedStepId(step.id);
                      setShowAddForm(false);
                    }}
                    style={{ borderLeft: '3px solid #ffa500' }}
                  >
                    <div className="step-header">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>
                            🧹
                          </span>
                          <span
                            style={{
                              color: '#fff',
                              fontSize: '0.85rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              minWidth: 0
                            }}
                          >
                            {displayInfo.label}
                          </span>
                        </div>
                        {displayInfo.path && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginLeft: '1.5rem'
                            }}
                          >
                            {displayInfo.method && (
                              <span
                                className="method-chip"
                                style={{
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '3px',
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  backgroundColor: displayInfo.method === 'GET' ? '#28a745' :
                                                   displayInfo.method === 'POST' ? '#007bff' :
                                                   displayInfo.method === 'PUT' ? '#ffc107' :
                                                   displayInfo.method === 'DELETE' ? '#dc3545' :
                                                   '#6c757d',
                                  color: '#fff',
                                  flexShrink: 0
                                }}
                              >
                                {displayInfo.method}
                              </span>
                            )}
                            <span
                              style={{
                                color: '#aaa',
                                fontSize: '0.75rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                minWidth: 0
                              }}
                            >
                              {displayInfo.path}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
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
            ) : selectedStep.req && isRunnFormatReq(selectedStep) ? (
              <RunnRequestViewer
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
