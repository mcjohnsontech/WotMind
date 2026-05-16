import type { AICheck, CustomRule } from '@/types/ai';
import type { GenericAIInput } from '../engine';

export async function checkCustomRules(input: GenericAIInput): Promise<AICheck> {
  const startTime = Date.now();

  try {
    const custom_rules = input.ai_rules.custom_rules || [];

    if (custom_rules.length === 0) {
      return {
        check_id: 'custom_rules',
        label: 'Custom Rules',
        passed: true,
        score: 1.0,
        detail: 'No custom rules configured',
        latency_ms: Date.now() - startTime,
      };
    }

    // Evaluate each rule
    const failed_rules: CustomRule[] = [];

    for (const rule of custom_rules) {
      const field_value = (input.custom_data || {})[rule.field];

      if (field_value === undefined) {
        // Field not provided, assume pass
        continue;
      }

      const passes = evaluateRule(field_value, rule);

      if (!passes && rule.action === 'block') {
        failed_rules.push(rule);
      }
    }

    const passed = failed_rules.length === 0;

    return {
      check_id: 'custom_rules',
      label: 'Custom Rules',
      passed,
      score: passed ? 1.0 : 0.0,
      detail: passed
        ? `All ${custom_rules.length} custom rule(s) passed`
        : `${failed_rules.length} rule(s) failed: ${failed_rules.map((r) => r.label).join(', ')}`,
      latency_ms: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Custom rules check failed:', error);
    throw error;
  }
}

function evaluateRule(value: any, rule: CustomRule): boolean {
  const num_value = Number(value);

  switch (rule.operator) {
    case 'gt':
      return num_value > Number(rule.value);
    case 'lt':
      return num_value < Number(rule.value);
    case 'eq':
      return String(value) === String(rule.value);
    case 'gte':
      return num_value >= Number(rule.value);
    case 'lte':
      return num_value <= Number(rule.value);
    default:
      return true;
  }
}
