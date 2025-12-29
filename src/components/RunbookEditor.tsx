import { useState } from 'react';
import { RunbookMetadata } from './RunbookMetadata';
import { RunnersEditor } from './RunnersEditor';
import { VariablesEditor } from './VariablesEditor';
import { StepsEditor } from './StepsEditor';
import { useTranslation } from '../i18n/I18nContext';

type EditorTab = 'metadata' | 'runners' | 'variables' | 'steps';

export function RunbookEditor() {
  const [activeSection, setActiveSection] = useState<EditorTab>('metadata');
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
      <div style={{
        width: '200px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingRight: '1rem',
        borderRight: '1px solid #333'
      }}>
        <button
          className={`btn ${activeSection === 'metadata' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSection('metadata')}
        >
          {t.sections.metadata}
        </button>
        <button
          className={`btn ${activeSection === 'runners' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSection('runners')}
        >
          {t.sections.runners}
        </button>
        <button
          className={`btn ${activeSection === 'variables' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSection('variables')}
        >
          {t.sections.variables}
        </button>
        <button
          className={`btn ${activeSection === 'steps' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSection('steps')}
        >
          {t.sections.steps}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeSection === 'metadata' && <RunbookMetadata />}
        {activeSection === 'runners' && <RunnersEditor />}
        {activeSection === 'variables' && <VariablesEditor />}
        {activeSection === 'steps' && <StepsEditor />}
      </div>
    </div>
  );
}
