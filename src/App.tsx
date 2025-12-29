import { useState } from 'react';
import './App.css';
import { RunbookEditor } from './components/RunbookEditor';
import { YAMLExporter } from './components/YAMLExporter';
import { useRunbookStore } from './store/runbookStore';
import { useTranslation } from './i18n/I18nContext';

function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'yaml'>('editor');
  const runbook = useRunbookStore((state) => state.runbook);
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="app">
      <header className="header">
        <h1>{t.app.title}</h1>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
            {runbook.desc || t.app.untitledRunbook}
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              className={`btn ${language === 'ja' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setLanguage('ja')}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
            >
              日本語
            </button>
            <button
              className={`btn ${language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setLanguage('en')}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
            >
              English
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="editor-area">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              {t.tabs.editor}
            </button>
            <button
              className={`tab ${activeTab === 'yaml' ? 'active' : ''}`}
              onClick={() => setActiveTab('yaml')}
            >
              {t.tabs.yaml}
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'editor' && <RunbookEditor />}
            {activeTab === 'yaml' && <YAMLExporter />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
