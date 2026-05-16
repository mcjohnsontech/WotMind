'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ALL_NODES, CATEGORIES, type NodeDefinition } from '@/lib/workflow/node-registry';

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (node: NodeDefinition) => void;
  title?: string;
  excludeTriggers?: boolean;
}

export function NodePicker({ open, onClose, onPick, title = 'Add Node', excludeTriggers }: Props) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveCategory('all');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    return ALL_NODES.filter((n) => {
      if (excludeTriggers && n.isTrigger) return false;
      if (activeCategory !== 'all' && n.category !== activeCategory) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          n.name.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, activeCategory, excludeTriggers]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-surface-1 border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-text-tertiary shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={title}
            className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-tertiary outline-none"
          />
          <kbd className="text-[10px] text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded border border-border font-mono">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-surface-2 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex border-b border-border px-2 py-1.5 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-3 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap',
              activeCategory === 'all'
                ? 'bg-accent-primary/15 text-accent-primary'
                : 'text-text-tertiary hover:text-text-primary hover:bg-surface-2'
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-3 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap',
                activeCategory === cat.id
                  ? 'bg-accent-primary/15 text-accent-primary'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface-2'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-text-secondary">No nodes match "{query}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {filtered.map((node, idx) => {
                const Icon = node.icon;
                return (
                  <button
                    key={node.type}
                    onClick={() => {
                      onPick(node);
                      onClose();
                    }}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-2 transition-colors text-left group border border-transparent hover:border-border"
                    style={{ animation: `fade-in 0.2s ease ${idx * 0.02}s both` }}
                  >
                    <div
                      className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border',
                        node.bgColor,
                        node.borderColor
                      )}
                    >
                      <Icon className={cn('w-4 h-4', node.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">
                        {node.name}
                      </p>
                      <p className="text-[10px] text-text-tertiary truncate leading-snug">
                        {node.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[10px] text-text-tertiary bg-surface-1/50">
          <span>{filtered.length} nodes available</span>
          <span className="flex items-center gap-1.5">
            <kbd className="bg-surface-2 px-1.5 py-0.5 rounded border border-border font-mono">↵</kbd>
            <span>to select</span>
          </span>
        </div>
      </div>
    </div>
  );
}
