import { useState } from 'react';
import { useRunbookStore } from '../store/runbookStore';
import { runbookToYAML, validateRunbook } from '../utils/yaml';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { useTranslation } from '../i18n/I18nContext';

export function YAMLExporter() {
  const runbook = useRunbookStore((state) => state.runbook);
  const { t } = useTranslation();
  const [yamlContent, setYamlContent] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const generateYAML = () => {
    try {
      const validation = validateRunbook(runbook);
      setErrors(validation.errors);

      if (validation.valid || validation.errors.length === 0) {
        const yaml = runbookToYAML(runbook);
        setYamlContent(yaml);
      } else {
        setYamlContent('');
      }
    } catch (error) {
      setErrors([`Failed to generate YAML: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setYamlContent('');
    }
  };

  const handleExport = async () => {
    if (!yamlContent) {
      generateYAML();
      return;
    }

    try {
      const filePath = await save({
        filters: [{
          name: 'YAML',
          extensions: ['yml', 'yaml']
        }],
        defaultPath: 'runbook.yml'
      });

      if (filePath) {
        await writeTextFile(filePath, yamlContent);
        alert(t.yaml.exportSuccess);
      }
    } catch (error) {
      alert(`${t.yaml.exportError}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const copyToClipboard = () => {
    if (yamlContent) {
      navigator.clipboard.writeText(yamlContent);
      alert(t.yaml.copySuccess);
    }
  };

  // Auto-generate on mount and when runbook changes
  useState(() => {
    generateYAML();
  });

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-primary" onClick={generateYAML}>
          {t.yaml.generate}
        </button>
        <button className="btn btn-success" onClick={handleExport} disabled={!yamlContent}>
          {t.yaml.exportToFile}
        </button>
        <button className="btn btn-secondary" onClick={copyToClipboard} disabled={!yamlContent}>
          {t.yaml.copyToClipboard}
        </button>
      </div>

      {errors.length > 0 && (
        <div style={{
          backgroundColor: '#ff000020',
          border: '1px solid #ff0000',
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#ff6b6b' }}>{t.yaml.validationErrors}</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {errors.map((error, index) => (
              <li key={index} style={{ color: '#ff6b6b' }}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-group">
        <label>{t.yaml.generatedYaml}</label>
        <textarea
          className="form-control"
          value={yamlContent}
          readOnly
          style={{
            minHeight: '400px',
            fontFamily: 'Courier New, monospace',
            fontSize: '0.85rem'
          }}
          placeholder={t.yaml.placeholder}
        />
      </div>
    </div>
  );
}
