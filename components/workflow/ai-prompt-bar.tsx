'use client';

import { useRef, useState } from 'react';
import { Sparkles, Send, Loader2, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  onSubmit: (prompt: string) => void;
  isStreaming: boolean;
  onCancel?: () => void;
  status?: string;
  progressText?: string;
}

const QUICK_PROMPTS = [
  'Add an SMS notification when transfer completes',
  'Add a duplicate check before the transfer',
  'Branch on trust score: above 0.7 transfer, below 0.7 notify',
  'Add a Supabase write to log the result',
];

export function AIPromptBar({ onSubmit, isStreaming, onCancel, status, progressText }: Props) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (text?: string) => {
    const prompt = (text ?? input).trim();
    if (!prompt || isStreaming) return;
    onSubmit(prompt);
    setInput('');
    setShowSuggestions(false);
  };

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-30 w-[640px] max-w-[calc(100%-32px)]">
      {showSuggestions && !isStreaming && (
        <div className="mb-2 bg-surface-1 border border-border rounded-xl shadow-xl p-2 animate-fade-in">
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
              Try
            </p>
            <button
              onClick={() => setShowSuggestions(false)}
              className="p-0.5 rounded text-text-tertiary hover:text-text-primary"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-0.5">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleSubmit(p)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-2 text-[12px] text-text-secondary hover:text-text-primary transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex items-end gap-2 bg-surface-1/95 backdrop-blur-md border rounded-2xl shadow-2xl px-3 py-2 transition-all',
          isStreaming
            ? 'border-accent-primary/50 ring-2 ring-accent-primary/20'
            : 'border-border hover:border-border/80 focus-within:border-accent-primary/50 focus-within:ring-2 focus-within:ring-accent-primary/20'
        )}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
            isStreaming
              ? 'bg-accent-primary/15 animate-pulse'
              : 'bg-accent-primary/10'
          )}
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-accent-primary" />
          )}
        </div>

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          onFocus={() => !isStreaming && setShowSuggestions(true)}
          placeholder={
            isStreaming
              ? progressText || 'AI is building your workflow…'
              : 'Describe a workflow or change… (⌘+Enter)'
          }
          rows={1}
          disabled={isStreaming}
          className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-tertiary resize-none outline-none min-h-[24px] max-h-[120px] py-1.5"
        />

        {!isStreaming && (
          <button
            onClick={() => setShowSuggestions((s) => !s)}
            className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors"
            title="Quick prompts"
          >
            <ChevronUp className={cn('w-3.5 h-3.5 transition-transform', showSuggestions && 'rotate-180')} />
          </button>
        )}

        {isStreaming && onCancel ? (
          <button
            onClick={onCancel}
            className="p-2 rounded-lg bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim()}
            className={cn(
              'p-2 rounded-lg transition-all shrink-0',
              input.trim()
                ? 'bg-accent-primary text-text-inverse hover:bg-accent-primary-hover shadow-lg shadow-accent-primary/30'
                : 'bg-surface-3 text-text-tertiary cursor-not-allowed'
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isStreaming && status && (
        <div className="mt-2 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-1/90 border border-border rounded-full text-[10px] text-text-secondary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-primary" />
            </span>
            {status}
          </div>
        </div>
      )}
    </div>
  );
}
