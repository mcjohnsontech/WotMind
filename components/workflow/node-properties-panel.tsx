'use client';

import { useEffect, useState } from 'react';
import { X, Trash2, Copy, ExternalLink } from 'lucide-react';
import type { Node } from '@xyflow/react';
import { cn } from '@/lib/utils/cn';
import { getNodeDefinition, type NodeField } from '@/lib/workflow/node-registry';
import { Button } from '@/components/ui/button';

interface Props {
  node: Node | null;
  onClose: () => void;
  onChange: (nodeId: string, patch: { label?: string; description?: string; config?: Record<string, unknown> }) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: NodeField;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const baseClass =
    'w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all';

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );
    case 'number':
    case 'currency':
      return (
        <div className="relative">
          {field.type === 'currency' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">₦</span>
          )}
          <input
            type="number"
            value={(value as number) ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            className={cn(baseClass, field.type === 'currency' && 'pl-7')}
          />
        </div>
      );
    case 'textarea':
      return (
        <textarea
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={cn(baseClass, 'resize-y min-h-[72px]')}
        />
      );
    case 'select':
      return (
        <select
          value={(value as string) ?? (field.default as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(baseClass, 'pr-8 appearance-none cursor-pointer')}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case 'boolean':
      return (
        <button
          onClick={() => onChange(!value)}
          className={cn(
            'relative w-10 h-6 rounded-full transition-colors',
            value ? 'bg-accent-primary' : 'bg-surface-3 border border-border'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              value ? 'translate-x-4' : 'translate-x-0.5'
            )}
          />
        </button>
      );
    default:
      return null;
  }
}

export function NodePropertiesPanel({ node, onClose, onChange, onDelete, onDuplicate }: Props) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!node) return;
    const data = (node.data || {}) as any;
    setLabel(data.label || '');
    setDescription(data.description || '');
    setConfig((data.config as Record<string, unknown>) || {});
  }, [node?.id]);

  useEffect(() => {
    if (!node) return;
    const t = setTimeout(() => {
      onChange(node.id, { label, description, config });
    }, 200);
    return () => clearTimeout(t);
  }, [label, description, config]);

  if (!node) return null;

  const def = getNodeDefinition(node.type);
  const Icon = def.icon;

  return (
    <div className="h-full flex flex-col bg-surface-1 border-l border-border w-[88vw] max-w-[360px] lg:w-[360px] shrink-0 animate-slide-in-right shadow-2xl lg:shadow-none">
      <div className="flex items-start justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border',
              def.bgColor,
              def.borderColor
            )}
          >
            <Icon className={cn('w-4.5 h-4.5', def.color)} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate">{def.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
              {def.category}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-surface-2 text-text-tertiary hover:text-text-primary transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-[11px] text-text-secondary leading-relaxed">{def.description}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div>
          <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
            Display Label
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={def.name}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this step do?"
            rows={2}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all resize-y"
          />
        </div>

        {def.fields.length > 0 && (
          <div className="pt-2 border-t border-border-subtle space-y-3">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
              Parameters
            </p>
            {def.fields.map((field) => (
              <div key={field.key}>
                <label className="text-[11px] font-medium text-text-secondary block mb-1.5">
                  {field.label}
                  {field.required && <span className="text-accent-red ml-1">*</span>}
                </label>
                <FieldRenderer
                  field={field}
                  value={config[field.key] ?? field.default}
                  onChange={(next) =>
                    setConfig((c) => ({ ...c, [field.key]: next as any }))
                  }
                />
                {field.description && (
                  <p className="text-[10px] text-text-tertiary mt-1 leading-relaxed">
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-border-subtle">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-2">
            Node ID
          </p>
          <code className="text-[11px] text-text-secondary bg-surface-2 px-2 py-1 rounded font-mono break-all block">
            {node.id}
          </code>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border flex items-center gap-2">
        <Button variant="ghost" size="xs" onClick={() => onDuplicate(node.id)} className="flex-1">
          <Copy className="w-3.5 h-3.5" />
          Duplicate
        </Button>
        <Button variant="danger" size="xs" onClick={() => onDelete(node.id)} className="flex-1">
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
