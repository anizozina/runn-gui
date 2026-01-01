import { useState, useEffect } from 'react';
import { useRunbookStore } from '../store/runbookStore';
import { runbookToYAML, validateRunbook, yamlToRunbook } from '../utils/yaml';
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { Command } from '@tauri-apps/plugin-shell';
import { tempDir } from '@tauri-apps/api/path';
import { useTranslation } from '../i18n/I18nContext';

export function YAMLExporter() {
  const runbook = useRunbookStore((state) => state.runbook);
  const importRunbook = useRunbookStore((state) => state.importRunbook);
  const { t } = useTranslation();
  const [yamlContent, setYamlContent] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<string>('');
  const [showOutput, setShowOutput] = useState(false);

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

  const handleImport = async () => {
    try {
      // Confirm before importing
      if (!confirm(t.yaml.importConfirm)) {
        return;
      }

      // Open file dialog
      const filePath = await open({
        filters: [{
          name: 'YAML',
          extensions: ['yml', 'yaml']
        }],
        multiple: false
      });

      if (!filePath) {
        return; // User cancelled
      }

      // Read file content
      const yamlText = await readTextFile(filePath as string);

      // Parse YAML to Runbook
      const importedRunbook = yamlToRunbook(yamlText);

      // Import to store
      importRunbook(importedRunbook);

      // Regenerate YAML preview
      generateYAML();

      alert(t.yaml.importSuccess);
    } catch (error) {
      alert(`${t.yaml.importError} ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRun = async () => {
    if (!yamlContent) {
      alert('Please generate YAML first');
      return;
    }

    try {
      setIsRunning(true);
      setRunOutput('');
      setShowOutput(true);

      // Save YAML to temporary file
      const tempFileName = `temp-runbook-${Date.now()}.yml`;
      await writeTextFile(tempFileName, yamlContent, { baseDir: BaseDirectory.Temp });

      // Get full path to temp file
      const tempDirPath = await tempDir();
      const fullTempPath = `${tempDirPath}${tempFileName}`;

      // Execute runn command
      const command = Command.create('runn', ['run', fullTempPath]);

      // Execute and capture output
      const output = await command.execute();

      // Display output
      let outputText = '';
      if (output.stdout) {
        outputText += output.stdout;
      }
      if (output.stderr) {
        outputText += '\n[STDERR]\n' + output.stderr;
      }

      setRunOutput(outputText);

      if (output.code === 0) {
        setRunOutput(prev => prev + '\n\n✅ Runbook executed successfully!');
      } else {
        setRunOutput(prev => prev + `\n\n❌ Runbook execution failed with code ${output.code}`);
      }
    } catch (error) {
      setRunOutput(prev => prev + `\n\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-generate on mount and when runbook changes
  useEffect(() => {
    generateYAML();
  }, [runbook]); // Re-generate whenever runbook changes

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={generateYAML}>
          {t.yaml.generate}
        </button>
        <button className="btn btn-success" onClick={handleRun} disabled={!yamlContent || isRunning}>
          {isRunning ? 'Running...' : '▶ Run'}
        </button>
        <button className="btn btn-success" onClick={handleExport} disabled={!yamlContent}>
          {t.yaml.exportToFile}
        </button>
        <button className="btn btn-secondary" onClick={copyToClipboard} disabled={!yamlContent}>
          {t.yaml.copyToClipboard}
        </button>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary" onClick={handleImport}>
            {t.yaml.importFromFile}
          </button>
        </div>
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

      {showOutput && (
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Execution Output:</span>
            <button
              className="btn btn-secondary"
              onClick={() => setShowOutput(false)}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
            >
              Hide
            </button>
          </label>
          <textarea
            className="form-control"
            value={runOutput}
            readOnly
            style={{
              minHeight: '300px',
              fontFamily: 'Courier New, monospace',
              fontSize: '0.85rem',
              backgroundColor: '#1a1a1a',
              color: '#00ff00'
            }}
          />
        </div>
      )}
    </div>
  );
}
