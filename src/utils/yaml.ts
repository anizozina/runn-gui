import yaml from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import type { Runbook } from '../types/runbook';

/**
 * Convert Runbook object to YAML string
 */
export function runbookToYAML(runbook: Runbook): string {
  // Remove internal ID fields from steps before exporting
  const cleanedRunbook = {
    ...runbook,
    steps: runbook.steps.map(({ id, ...step }) => step),
    finally: runbook.finally?.map(({ id, ...step }) => step),
  };

  // Remove empty fields
  const sanitized = removeEmptyFields(cleanedRunbook);

  return yaml.dump(sanitized, {
    indent: 2,
    lineWidth: -1, // Don't wrap lines
    noRefs: true,
    sortKeys: false,
  });
}

/**
 * Parse YAML string to Runbook object
 */
export function yamlToRunbook(yamlString: string): Runbook {
  try {
    const parsed = yaml.load(yamlString) as Runbook;

    // Ensure steps is an array
    if (!Array.isArray(parsed.steps)) {
      parsed.steps = [];
    }

    // Ensure runners exists
    if (!parsed.runners) {
      parsed.runners = {};
    }

    // Add IDs to steps if missing
    parsed.steps = parsed.steps.map(step => ({
      ...step,
      id: step.id || uuidv4(),
    }));

    // Add IDs to finally steps if they exist
    if (parsed.finally && Array.isArray(parsed.finally)) {
      parsed.finally = parsed.finally.map(step => ({
        ...step,
        id: step.id || uuidv4(),
      }));
    }

    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Remove empty/null/undefined fields from object recursively
 */
function removeEmptyFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeEmptyFields).filter(v => v !== null && v !== undefined);
  }

  if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip empty strings, empty arrays, empty objects
      if (value === '' || value === null || value === undefined) {
        continue;
      }

      if (Array.isArray(value) && value.length === 0) {
        continue;
      }

      if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
        continue;
      }

      const cleanedValue = removeEmptyFields(value);

      // Only add if the cleaned value is not empty
      if (cleanedValue !== null && cleanedValue !== undefined) {
        if (typeof cleanedValue === 'object' && !Array.isArray(cleanedValue)) {
          if (Object.keys(cleanedValue).length > 0) {
            cleaned[key] = cleanedValue;
          }
        } else if (Array.isArray(cleanedValue)) {
          if (cleanedValue.length > 0) {
            cleaned[key] = cleanedValue;
          }
        } else {
          cleaned[key] = cleanedValue;
        }
      }
    }

    return cleaned;
  }

  return obj;
}

/**
 * Validate runbook structure
 */
export function validateRunbook(runbook: Runbook): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if runners are defined
  if (!runbook.runners || Object.keys(runbook.runners).length === 0) {
    errors.push('At least one runner must be defined');
  }

  // Check if steps exist
  if (!runbook.steps || runbook.steps.length === 0) {
    errors.push('At least one step must be defined');
  }

  // Validate each step has at least one action
  runbook.steps?.forEach((step, index) => {
    const hasAction = step.req || step.include || step.bind;
    if (!hasAction) {
      errors.push(`Step ${index + 1} must have at least one action (req, bind, include)`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
