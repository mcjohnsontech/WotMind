'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import type { AutomationFormData } from './automation-wizard';
import type { CustomRule } from '@/types/ai';

interface AIRulesFormProps {
  data: AutomationFormData;
  onChange: (updates: Partial<AutomationFormData>) => void;
}

export function AIRulesForm({ data, onChange }: AIRulesFormProps) {
  const ai_rules = data.ai_rules || {
    auto_approve_below: 10000,
    require_approval_above: 100000,
    anomaly_score_threshold: 70,
    max_amount: 500000,
    custom_rules: [],
  };

  const [showRuleForm, setShowRuleForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<CustomRule>>({
    operator: 'gt',
    action: 'block',
  });

  const handleThresholdChange = (key: string, value: number) => {
    onChange({
      ai_rules: { ...ai_rules, [key]: value },
    });
  };

  const handleAddRule = () => {
    if (!newRule.field || !newRule.value || !newRule.label) {
      alert('Please fill in all rule fields');
      return;
    }

    const custom_rules = ai_rules.custom_rules || [];
    custom_rules.push(newRule as CustomRule);

    onChange({
      ai_rules: { ...ai_rules, custom_rules },
    });

    setNewRule({ operator: 'gt', action: 'block' });
    setShowRuleForm(false);
  };

  const handleRemoveRule = (index: number) => {
    const custom_rules = (ai_rules.custom_rules || []).filter((_, i) => i !== index);
    onChange({
      ai_rules: { ...ai_rules, custom_rules },
    });
  };

  return (
    <div className="space-y-6">
      {/* Thresholds */}
      <Card className="p-6 bg-surface-2 border-border-glow/30">
        <h3 className="font-semibold text-text-primary mb-4">Amount Thresholds</h3>
        <div className="space-y-4">
          {/* Auto-approve */}
          <div>
            <label className="text-sm text-text-secondary block mb-2">
              Auto-approve amounts below
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-accent-amber">₦</span>
              <Input
                type="number"
                value={ai_rules.auto_approve_below}
                onChange={(e) =>
                  handleThresholdChange('auto_approve_below', parseInt(e.target.value))
                }
                className="flex-1"
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Transactions below this amount execute immediately without approval
            </p>
          </div>

          {/* Require approval */}
          <div>
            <label className="text-sm text-text-secondary block mb-2">
              Require manual approval above
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-accent-amber">₦</span>
              <Input
                type="number"
                value={ai_rules.require_approval_above}
                onChange={(e) =>
                  handleThresholdChange('require_approval_above', parseInt(e.target.value))
                }
                className="flex-1"
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Amounts above this require explicit approval via SMS
            </p>
          </div>

          {/* Max amount */}
          <div>
            <label className="text-sm text-text-secondary block mb-2">
              Hard cap (absolute maximum)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-accent-amber">₦</span>
              <Input
                type="number"
                value={ai_rules.max_amount}
                onChange={(e) =>
                  handleThresholdChange('max_amount', parseInt(e.target.value))
                }
                className="flex-1"
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">
              No transaction exceeding this amount will be allowed
            </p>
          </div>

          {/* Anomaly threshold */}
          <div>
            <label className="text-sm text-text-secondary block mb-2">
              Anomaly detection threshold (%)
            </label>
            <Input
              type="number"
              value={ai_rules.anomaly_score_threshold}
              onChange={(e) =>
                handleThresholdChange('anomaly_score_threshold', parseInt(e.target.value))
              }
              min="0"
              max="100"
            />
            <p className="text-xs text-text-secondary mt-1">
              Higher risk scores above this percentage require approval
            </p>
          </div>
        </div>
      </Card>

      {/* Custom Rules */}
      <Card className="p-6 bg-surface-2 border-border-glow/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Custom Business Rules</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRuleForm(!showRuleForm)}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </Button>
        </div>

        {showRuleForm && (
          <div className="bg-surface-1 p-4 rounded-lg mb-4 space-y-3">
            <Input
              placeholder="Rule name (e.g., 'Disable Sundays')"
              value={newRule.label || ''}
              onChange={(e) => setNewRule({ ...newRule, label: e.target.value })}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Field (e.g., 'day_of_week')"
                value={newRule.field || ''}
                onChange={(e) => setNewRule({ ...newRule, field: e.target.value })}
                className="flex-1"
              />
              <select
                value={newRule.operator || 'gt'}
                onChange={(e) => setNewRule({ ...newRule, operator: e.target.value as any })}
                className="px-3 py-2 bg-surface-2 border border-border rounded text-text-primary text-sm"
              >
                <option value="gt">Greater than</option>
                <option value="lt">Less than</option>
                <option value="eq">Equals</option>
                <option value="gte">≥</option>
                <option value="lte">≤</option>
              </select>
              <Input
                placeholder="Value"
                value={newRule.value || ''}
                onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                className="w-24"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={newRule.action || 'block'}
                onChange={(e) => setNewRule({ ...newRule, action: e.target.value as any })}
                className="flex-1 px-3 py-2 bg-surface-2 border border-border rounded text-text-primary text-sm"
              >
                <option value="block">Block</option>
                <option value="flag">Flag for review</option>
                <option value="approve">Auto-approve</option>
              </select>
              <Button variant="primary" size="sm" onClick={handleAddRule}>
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRuleForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {(ai_rules.custom_rules || []).map((rule, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-surface-1 rounded border border-border"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{rule.label}</p>
                <p className="text-xs text-text-secondary">
                  {rule.field} {rule.operator} {rule.value} → {rule.action}
                </p>
              </div>
              <button
                onClick={() => handleRemoveRule(idx)}
                className="text-accent-red hover:text-accent-red/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(!ai_rules.custom_rules || ai_rules.custom_rules.length === 0) && (
            <p className="text-sm text-text-secondary italic">
              No custom rules. Click "Add Rule" to create one.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
