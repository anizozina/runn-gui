import { useTranslation } from '../i18n/I18nContext';
import type { StepType } from '../types/runbook';

interface StepTypeSelectorProps {
  onSelect: (type: StepType) => void;
  onCancel: () => void;
}

export function StepTypeSelector({ onSelect, onCancel }: StepTypeSelectorProps) {
  const { t } = useTranslation();

  const stepTypes = [
    { type: 'http' as StepType, icon: '🌐', enabled: true },
    { type: 'include' as StepType, icon: '📁', enabled: true },
    { type: 'bind' as StepType, icon: '🔗', enabled: true },
    { type: 'db' as StepType, icon: '💾', enabled: false },
    { type: 'grpc' as StepType, icon: '📡', enabled: false },
    { type: 'ssh' as StepType, icon: '🖥️', enabled: false },
    { type: 'cdp' as StepType, icon: '🌍', enabled: false },
  ];

  return (
    <div>
      <h2>{t.stepTypeSelector.title}</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
        marginTop: '1.5rem'
      }}>
        {stepTypes.map(({ type, icon, enabled }) => (
          <button
            key={type}
            onClick={() => enabled && onSelect(type)}
            disabled={!enabled}
            className={`btn ${enabled ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1.5rem 1rem',
              fontSize: '0.9rem',
              opacity: enabled ? 1 : 0.5,
              cursor: enabled ? 'pointer' : 'not-allowed',
              position: 'relative',
              minHeight: '120px',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '2rem' }}>{icon}</span>
            <span style={{ fontWeight: 'bold' }}>
              {t.stepTypeSelector[type as keyof typeof t.stepTypeSelector]}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#aaa', textAlign: 'center' }}>
              {t.stepTypeSelector[`${type}Desc` as keyof typeof t.stepTypeSelector]}
            </span>
            {!enabled && (
              <span style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                backgroundColor: '#ffa500',
                color: '#000',
                padding: '0.2rem 0.5rem',
                borderRadius: '3px',
                fontSize: '0.65rem',
                fontWeight: 'bold'
              }}>
                {t.stepTypeSelector.comingSoon}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button className="btn btn-secondary" onClick={onCancel}>
          {t.stepTypeSelector.cancel}
        </button>
      </div>
    </div>
  );
}
