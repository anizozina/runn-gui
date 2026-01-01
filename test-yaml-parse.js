import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const yamlPath = join(__dirname, 'test-petstore.yml');

try {
  const yamlContent = readFileSync(yamlPath, 'utf8');
  const parsed = yaml.load(yamlContent);

  console.log('=== Parsed YAML Structure ===\n');
  console.log(JSON.stringify(parsed, null, 2));

  console.log('\n=== Analysis ===\n');
  console.log('Description:', parsed.desc);
  console.log('Variables:', Object.keys(parsed.vars || {}).join(', '));
  console.log('Runners:', Object.keys(parsed.runners || {}).join(', '));
  console.log('Steps count:', parsed.steps?.length || 0);
  console.log('Has finally:', !!parsed.finally);

  console.log('\n=== Steps Details ===\n');
  parsed.steps?.forEach((step, index) => {
    console.log(`Step ${index + 1}:`, step.desc || 'No description');
    if (step.include) {
      console.log('  Type: Include');
      console.log('  Path:', typeof step.include === 'string' ? step.include : step.include.path);
      if (typeof step.include === 'object' && step.include.vars) {
        console.log('  Vars:', Object.keys(step.include.vars).join(', '));
      }
    } else if (step.req) {
      console.log('  Type: HTTP Request');
      const method = ['get', 'post', 'put', 'delete', 'patch'].find(m => step[m]);
      if (method) {
        console.log('  Method:', method.toUpperCase());
        console.log('  Path:', step[method].path);
      }
    } else if (step.bind && !step.req && !step.include) {
      console.log('  Type: Bind only');
      console.log('  Bind keys:', Object.keys(step.bind).join(', '));
    }
  });

  if (parsed.finally) {
    console.log('\n=== Finally Steps ===\n');
    parsed.finally.forEach((step, index) => {
      console.log(`Finally ${index + 1}:`, step.desc || 'No description');
    });
  }

} catch (error) {
  console.error('Error:', error.message);
}
