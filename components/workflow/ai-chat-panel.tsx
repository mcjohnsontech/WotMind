'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Node, Edge } from '@xyflow/react';

interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  nodes?: Node[];
  edges?: Edge[];
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowGenerated: (nodes: Node[], edges: Edge[], name?: string) => void;
  existingNodes?: Node[];
  existingEdges?: Edge[];
}

const SUGGESTIONS = [
  'Create a receipt reimbursement workflow',
  'Build a payroll processing pipeline',
  'Set up invoice verification with trust check',
  'Create an expense approval workflow with AI risk assessment',
];

export function AIChatPanel({
  isOpen,
  onClose,
  onWorkflowGenerated,
  existingNodes,
  existingEdges,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'system',
      content:
        'Describe your workflow in plain English and I\'ll build it for you. You can say things like "Create a receipt processing pipeline with OCR, trust verification, and transfer."',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (text?: string) => {
    const prompt = text || input.trim();
    if (!prompt || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          existing_nodes: existingNodes || [],
          existing_edges: existingEdges || [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate workflow');
      }

      const data = await response.json();
      const { nodes, edges, name, explanation } = data;

      const assistantMsg: AIChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: explanation || `I've created a workflow${name ? ` called "${name}"` : ''} with ${nodes.length} nodes. The workflow has been applied to the canvas.`,
        timestamp: new Date(),
        nodes,
        edges,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Apply nodes to canvas
      if (nodes && edges) {
        onWorkflowGenerated(nodes, edges, name);
      }
    } catch (error) {
      const errorMsg: AIChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          'Sorry, I couldn\'t generate the workflow. Please try again with a different description.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'system',
        content:
          'Describe your workflow in plain English and I\'ll build it for you.',
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-4 bottom-4 w-[380px] bg-surface-1 border border-border rounded-xl shadow-lg flex flex-col z-20 animate-slide-in-right overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">AI Workflow Builder</p>
            <p className="text-[10px] text-text-tertiary">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md hover:bg-surface-2 text-text-tertiary hover:text-text-secondary transition-colors"
            title="Reset chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface-2 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('animate-fade-in', {
              'flex justify-end': msg.role === 'user',
            })}
          >
            <div
              className={cn('max-w-[90%] rounded-xl px-3.5 py-2.5', {
                'bg-accent-primary text-text-inverse': msg.role === 'user',
                'bg-surface-2 text-text-primary': msg.role === 'assistant',
                'bg-surface-2/50 text-text-secondary': msg.role === 'system',
              })}
            >
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
              {msg.nodes && msg.nodes.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-[11px] text-text-tertiary mb-1.5 font-medium">
                    Generated {msg.nodes.length} nodes:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {msg.nodes.map((node: Node) => (
                      <span
                        key={node.id}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-surface-3 text-text-secondary"
                      >
                        {(node.data as { label?: string })?.label || node.type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="animate-fade-in">
            <div className="bg-surface-2 rounded-xl px-3.5 py-3 max-w-[90%] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-accent-primary animate-spin" />
              <span className="text-[13px] text-text-secondary">Generating workflow...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (shown only when minimal messages) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 space-y-1.5">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
            Try these
          </p>
          {SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(suggestion)}
              className="w-full text-left px-3 py-2 rounded-lg bg-surface-2/50 hover:bg-surface-2 text-[12px] text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-border shrink-0">
        <div className="flex items-end gap-2 bg-surface-2 rounded-xl px-3 py-2 border border-border focus-within:border-accent-primary/30 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your workflow..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary resize-none outline-none min-h-[20px] max-h-[80px]"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isLoading}
            className={cn(
              'p-1.5 rounded-lg transition-all shrink-0',
              input.trim()
                ? 'bg-accent-primary text-text-inverse hover:bg-accent-primary-hover'
                : 'bg-surface-3 text-text-tertiary cursor-not-allowed'
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
