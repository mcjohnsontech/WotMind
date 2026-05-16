'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { nodeTypes } from '@/components/workflow/wot-node';
import { edgeTypes } from '@/components/workflow/plus-edge';
import { useWorkflowStream } from '@/lib/workflow/use-workflow-stream';
import {
  Sparkles,
  Send,
  ArrowRight,
  Plus,
  ScanText,
  ArrowRightLeft,
  Receipt,
  Users,
  Mail,
  RefreshCw,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
  accent: string;
}

const TEMPLATES: Template[] = [
  {
    title: 'Receipt reimbursement',
    category: 'Finance',
    icon: Receipt,
    prompt:
      'When a staff member uploads a fuel receipt, extract amount and vendor via OCR, run trust verification for duplicates and anomalies, and transfer the reimbursement to their bank account. Log everything to audit and notify them by SMS.',
    accent: 'text-node-ocr',
  },
  {
    title: 'Monthly payroll',
    category: 'Payroll',
    icon: Users,
    prompt:
      'On the 28th of every month, run AI risk assessment on each staff salary, transfer payroll to all active staff via Squad, send them an SMS receipt, and audit the run.',
    accent: 'text-node-transfer',
  },
  {
    title: 'Invoice approval',
    category: 'Finance',
    icon: ScanText,
    prompt:
      'When a vendor invoice is uploaded, OCR the line items and total, run AI risk on the amount, branch: above ₦200k requires approval via SMS, below ₦200k auto-transfers and notifies the vendor.',
    accent: 'text-node-trust',
  },
  {
    title: 'Vendor payouts',
    category: 'Operations',
    icon: ArrowRightLeft,
    prompt:
      'Trigger weekly on Friday: pull pending vendor invoices from Supabase, AI-check each for anomalies, transfer approved ones, log results and send a Slack/SMS summary.',
    accent: 'text-node-transfer',
  },
  {
    title: 'Customer notification',
    category: 'Comms',
    icon: Mail,
    prompt:
      'On webhook event "order.completed", send a WhatsApp confirmation to the customer with the order details and a payment receipt link.',
    accent: 'text-accent-amber',
  },
  {
    title: 'Expense approval',
    category: 'Finance',
    icon: Sparkles,
    prompt:
      'Staff submits expense via webhook. OCR receipt, AI risk score the amount, if low auto-approve and transfer, if medium send SMS approval to manager, if high block and alert. Audit every step.',
    accent: 'text-node-ai',
  },
];

const QUICK_INTENTS = [
  'Process fuel receipts with OCR and transfer',
  'Payroll with AI risk and SMS receipts',
  'Vendor invoice verification with approval branching',
];

function PreviewCanvas({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge[];
}) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.3, duration: 400 }), 150);
    return () => clearTimeout(t);
  }, [nodes.length, edges.length, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges.map((e) => ({ ...e, type: 'plus', animated: true }))}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      defaultEdgeOptions={{
        type: 'plus',
        animated: true,
        style: { stroke: 'var(--border)', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'var(--border)',
          width: 18,
          height: 18,
        },
      }}
      proOptions={{ hideAttribution: true }}
      panOnDrag={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      preventScrolling={false}
      className="bg-canvas-bg pointer-events-none"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--canvas-dot)" />
    </ReactFlow>
  );
}

function NewWorkflowInner() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [previewNodes, setPreviewNodes] = useState<Node[]>([]);
  const [previewEdges, setPreviewEdges] = useState<Edge[]>([]);
  const [workflowName, setWorkflowName] = useState('');
  const [explanation, setExplanation] = useState('');
  const [creating, setCreating] = useState(false);
  const finalRef = useRef<{ nodes: Node[]; edges: Edge[]; name: string; explanation: string } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const stream = useWorkflowStream({
    onName: (name) => {
      setWorkflowName(name);
    },
    onNode: (node) => {
      const annotated: Node = {
        ...node,
        data: { ...(node.data || {}), status: 'streaming' },
      };
      setPreviewNodes((nds) => [...nds, annotated]);
      setTimeout(() => {
        setPreviewNodes((nds) =>
          nds.map((n) =>
            n.id === annotated.id ? { ...n, data: { ...(n.data || {}), status: 'idle' } } : n
          )
        );
      }, 800);
    },
    onEdge: (edge) => {
      setPreviewEdges((eds) => [...eds, { ...edge, type: 'plus', animated: true } as Edge]);
    },
    onComplete: ({ name, explanation, nodes, edges }) => {
      finalRef.current = {
        nodes: nodes.map((n) => ({ ...n, data: { ...(n.data || {}), status: 'idle' } })),
        edges: edges.map((e) => ({ ...e, type: 'plus', animated: true } as Edge)),
        name,
        explanation,
      };
      setPreviewNodes(finalRef.current.nodes);
      setPreviewEdges(finalRef.current.edges);
      setWorkflowName(name);
      setExplanation(explanation);
    },
    onError: (message) => {
      toast.error(message);
    },
  });

  const handleGenerate = useCallback((text?: string) => {
    const p = (text ?? prompt).trim();
    if (!p) return;
    setPreviewNodes([]);
    setPreviewEdges([]);
    setWorkflowName('');
    setExplanation('');
    finalRef.current = null;
    setPrompt(p);
    stream.start({ prompt: p });
  }, [prompt, stream]);

  const handleCreate = useCallback(async () => {
    const final = finalRef.current;
    if (!final) return;
    setCreating(true);
    try {
      // Create workflow with blank pipeline then update with AI output
      const createRes = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: final.name || 'Untitled Workflow',
          description: explanation || prompt.slice(0, 200),
        }),
      });
      if (!createRes.ok) throw new Error('Failed to create workflow');
      const { workflow } = await createRes.json();

      // Patch with AI-generated nodes/edges
      await fetch(`/api/workflows/${workflow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: final.name,
          nodes: final.nodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: {
              label: (n.data as any)?.label,
              description: (n.data as any)?.description,
            },
          })),
          edges: final.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            animated: true,
          })),
        }),
      });

      router.push(`/workflows/${workflow.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Could not create workflow');
      setCreating(false);
    }
  }, [explanation, prompt, router]);

  const handleBlank = useCallback(async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Untitled Workflow',
          description: 'Blank workflow',
        }),
      });
      const { workflow } = await res.json();
      router.push(`/workflows/${workflow.id}`);
    } catch {
      toast.error('Could not create workflow');
      setCreating(false);
    }
  }, [router]);

  const hasPreview = previewNodes.length > 0;
  const isReady = !stream.isStreaming && finalRef.current && previewNodes.length > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="h-full flex flex-col bg-surface-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Hero header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-[11px] font-semibold mb-4">
              <Sparkles className="w-3 h-3" />
              AI Workflow Builder
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-2">
              What do you want to{' '}
              <span className="text-gradient">automate</span>?
            </h1>
            <p className="text-sm md:text-base text-text-secondary max-w-xl mx-auto">
              Describe it in plain English. WotMind will design, build and connect
              every step — in real-time.
            </p>
          </div>

          {/* Prompt input */}
          <div className="max-w-2xl mx-auto mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <div
              className={cn(
                'bg-surface-1 border-2 rounded-2xl transition-all overflow-hidden',
                stream.isStreaming
                  ? 'border-accent-primary/50 ring-4 ring-accent-primary/10'
                  : 'border-border focus-within:border-accent-primary/50 focus-within:ring-4 focus-within:ring-accent-primary/10'
              )}
            >
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="e.g. When a staff uploads a receipt, OCR it, run trust checks, transfer reimbursement, and send them an SMS."
                rows={3}
                disabled={stream.isStreaming}
                className="w-full bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary outline-none px-5 py-4 resize-none"
              />
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-subtle bg-surface-1/50">
                <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                  <kbd className="bg-surface-2 px-1.5 py-0.5 rounded border border-border font-mono">⌘</kbd>
                  <span>+</span>
                  <kbd className="bg-surface-2 px-1.5 py-0.5 rounded border border-border font-mono">↵</kbd>
                  <span>to generate</span>
                </div>
                <div className="flex items-center gap-2">
                  {stream.isStreaming ? (
                    <Button variant="danger" size="sm" onClick={stream.cancel}>
                      <X className="w-3.5 h-3.5" />
                      Stop
                    </Button>
                  ) : (
                    <>
                      {hasPreview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPreviewNodes([]);
                            setPreviewEdges([]);
                            setWorkflowName('');
                            setExplanation('');
                            finalRef.current = null;
                          }}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Reset
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleGenerate()}
                        disabled={!prompt.trim()}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {!hasPreview && !stream.isStreaming && (
              <div className="flex flex-wrap items-center gap-2 mt-3 justify-center">
                {QUICK_INTENTS.map((intent) => (
                  <button
                    key={intent}
                    onClick={() => {
                      setPrompt(intent);
                      handleGenerate(intent);
                    }}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-surface-1 border border-border hover:border-accent-primary/40 text-text-secondary hover:text-text-primary transition-all"
                  >
                    {intent}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Streaming / Preview */}
          {(stream.isStreaming || hasPreview) && (
            <div className="max-w-5xl mx-auto mb-10 animate-fade-in">
              <div className="bg-surface-1 border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface-1/80">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        stream.isStreaming
                          ? 'bg-accent-primary animate-pulse'
                          : 'bg-accent-green'
                      )}
                    />
                    <p className="text-[13px] font-semibold text-text-primary truncate">
                      {workflowName || 'Designing workflow…'}
                    </p>
                    <span className="text-[11px] text-text-tertiary">
                      {previewNodes.length} node{previewNodes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {isReady && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCreate}
                      loading={creating}
                    >
                      Open in editor
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

                <div className="h-[420px] relative bg-canvas-bg">
                  <ReactFlowProvider>
                    <PreviewCanvas nodes={previewNodes} edges={previewEdges} />
                  </ReactFlowProvider>

                  {stream.isStreaming && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-1/95 border border-border text-[11px] text-text-secondary shadow-md">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary" />
                      </span>
                      {stream.status || 'Streaming…'}
                    </div>
                  )}
                </div>

                {explanation && (
                  <div className="px-5 py-3 border-t border-border bg-surface-1/40">
                    <p className="text-[12px] text-text-secondary leading-relaxed">
                      {explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Templates */}
          {!hasPreview && !stream.isStreaming && (
            <div className="max-w-4xl mx-auto mt-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">
                    Or start from a template
                  </h2>
                  <p className="text-[11px] text-text-tertiary">
                    Curated workflows for Nigerian businesses
                  </p>
                </div>
                <button
                  onClick={handleBlank}
                  disabled={creating}
                  className="text-[12px] text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Blank workflow
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {TEMPLATES.map((t, idx) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.title}
                      onClick={() => {
                        setPrompt(t.prompt);
                        handleGenerate(t.prompt);
                      }}
                      className="text-left bg-surface-1 border border-border hover:border-accent-primary/30 rounded-xl p-4 transition-all duration-200 group hover:shadow-lg hover:-translate-y-0.5"
                      style={{ animation: `fade-in-up 0.3s ease ${idx * 0.05}s both` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={cn(
                            'w-9 h-9 rounded-lg flex items-center justify-center',
                            'bg-surface-2 border border-border'
                          )}
                        >
                          <Icon className={cn('w-4 h-4', t.accent)} />
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-2 text-text-tertiary font-medium">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-[13px] font-semibold text-text-primary mb-1 group-hover:text-accent-primary transition-colors">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-text-tertiary leading-relaxed line-clamp-3">
                        {t.prompt}
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-[11px] text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="w-3 h-3" />
                        Generate with AI
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewWorkflowPage() {
  return <NewWorkflowInner />;
}
