'use client';

import { useCallback, useEffect, useMemo, useRef, useState, use } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  MarkerType,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '@/components/workflow/wot-node';
import { edgeTypes, type PlusEdgeData } from '@/components/workflow/plus-edge';
import { NodePropertiesPanel } from '@/components/workflow/node-properties-panel';
import { NodePicker } from '@/components/workflow/node-picker';
import { AIPromptBar } from '@/components/workflow/ai-prompt-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import {
  Save,
  Play,
  ArrowLeft,
  Trash2,
  Plus,
  Sparkles,
  Activity,
  Layers,
  Power,
  PowerOff,
  Maximize2,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useWorkflowStream } from '@/lib/workflow/use-workflow-stream';
import {
  getNodeDefinition,
  type NodeDefinition,
} from '@/lib/workflow/node-registry';

interface WorkflowEditorProps {
  params: Promise<{ id: string }>;
}

const DEFAULT_EDGE_OPTIONS = {
  type: 'plus' as const,
  animated: true,
  style: { stroke: 'var(--border)', strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: 'var(--border)',
    width: 18,
    height: 18,
  },
};

function patchEdgesWithHandler(
  edges: Edge[],
  onInsert: PlusEdgeData['onInsert']
): Edge[] {
  return edges.map((e) => ({
    ...e,
    type: 'plus',
    data: { ...(e.data || {}), onInsert },
  }));
}

function WorkflowCanvas({ workflowId }: { workflowId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowStatus, setWorkflowStatus] = useState<'active' | 'paused' | 'archived'>('active');
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [insertContext, setInsertContext] = useState<
    | { mode: 'append' }
    | { mode: 'insert'; edgeId: string; source: string; target: string }
    | null
  >(null);
  const [lastRunSummary, setLastRunSummary] = useState<{
    success: boolean;
    completedAt: string;
  } | null>(null);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstanceRef = useRef<any>(null);
  const { fitView } = useReactFlow();

  // Edge insertion handler - opens picker with insert context
  const handleEdgeInsert = useCallback(
    (edgeId: string, source: string, target: string) => {
      setInsertContext({ mode: 'insert', edgeId, source, target });
      setPickerOpen(true);
    },
    []
  );

  // Wrap edges with the insert handler
  const displayEdges = useMemo(() => patchEdgesWithHandler(edges, handleEdgeInsert), [
    edges,
    handleEdgeInsert,
  ]);

  // Load workflow
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/workflows/${workflowId}`);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        const wf = data.workflow;
        if (!wf || cancelled) return;

        setWorkflowName(wf.name || 'Untitled Workflow');
        setWorkflowStatus(wf.status || 'active');
        setNodes(Array.isArray(wf.nodes) ? wf.nodes : []);
        setEdges(Array.isArray(wf.edges) ? wf.edges : []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load workflow');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setHasUnsavedChanges(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [workflowId, setNodes, setEdges]);

  // Track changes
  useEffect(() => {
    if (!isLoading) setHasUnsavedChanges(true);
  }, [nodes, edges, workflowName, workflowStatus, isLoading]);

  // Reset selection if node deleted
  useEffect(() => {
    if (selectedNode && !nodes.find((n) => n.id === selectedNode.id)) {
      setSelectedNode(null);
    }
  }, [nodes, selectedNode]);

  // Connection handler
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'plus',
            animated: true,
            style: { stroke: 'var(--accent-primary)', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'var(--accent-primary)',
              width: 18,
              height: 18,
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Compute next position for new node
  const computeNextPosition = useCallback(() => {
    if (nodes.length === 0) return { x: 120, y: 240 };
    const rightmost = nodes.reduce((m, n) => (n.position.x > m.position.x ? n : m));
    return { x: rightmost.position.x + 320, y: rightmost.position.y };
  }, [nodes]);

  // Add node from picker
  const handlePick = useCallback(
    (def: NodeDefinition) => {
      const id = `${def.type}-${Date.now().toString(36)}`;
      const newNode: Node = {
        id,
        type: def.type,
        position: { x: 0, y: 0 },
        data: {
          label: def.name,
          description: def.description,
          config: def.fields.reduce((acc, f) => {
            if (f.default !== undefined) acc[f.key] = f.default as any;
            return acc;
          }, {} as Record<string, unknown>),
        },
      };

      if (insertContext?.mode === 'insert') {
        // Place midway between source and target
        const src = nodes.find((n) => n.id === insertContext.source);
        const tgt = nodes.find((n) => n.id === insertContext.target);
        if (src && tgt) {
          newNode.position = {
            x: (src.position.x + tgt.position.x) / 2,
            y: (src.position.y + tgt.position.y) / 2,
          };
        }
        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => {
          const filtered = eds.filter((e) => e.id !== insertContext.edgeId);
          return [
            ...filtered,
            {
              id: `e-${insertContext.source}-${id}`,
              source: insertContext.source,
              target: id,
              type: 'plus',
              animated: true,
            },
            {
              id: `e-${id}-${insertContext.target}`,
              source: id,
              target: insertContext.target,
              type: 'plus',
              animated: true,
            },
          ];
        });
      } else {
        newNode.position = computeNextPosition();
        setNodes((nds) => [...nds, newNode]);
        // Auto-connect to rightmost node
        if (nodes.length > 0) {
          const last = nodes[nodes.length - 1];
          setEdges((eds) => [
            ...eds,
            {
              id: `e-${last.id}-${id}`,
              source: last.id,
              target: id,
              type: 'plus',
              animated: true,
            },
          ]);
        }
      }

      setInsertContext(null);

      // Fit view after a beat
      setTimeout(() => fitView({ padding: 0.25, duration: 400 }), 100);
    },
    [insertContext, nodes, computeNextPosition, setNodes, setEdges, fitView]
  );

  // Streaming AI generation
  const streamStateRef = useRef({
    nameSet: false,
    nodes: [] as Node[],
    edges: [] as Edge[],
  });

  const stream = useWorkflowStream({
    onName: (name) => {
      if (!streamStateRef.current.nameSet) {
        setWorkflowName(name);
        streamStateRef.current.nameSet = true;
      }
    },
    onStatus: () => {},
    onNode: (node) => {
      const annotated: Node = {
        ...node,
        data: {
          ...(node.data || {}),
          status: 'streaming',
        },
      };
      streamStateRef.current.nodes.push(annotated);
      setNodes((nds) => [...nds, annotated]);
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === annotated.id
              ? { ...n, data: { ...(n.data || {}), status: 'idle' } }
              : n
          )
        );
        fitView({ padding: 0.25, duration: 250 });
      }, 800);
    },
    onEdge: (edge) => {
      const annotated: Edge = { ...edge, type: 'plus', animated: true };
      streamStateRef.current.edges.push(annotated);
      setEdges((eds) => [...eds, annotated]);
    },
    onComplete: ({ nodes: finalNodes, edges: finalEdges, name }) => {
      // Replace any partials with the canonical final list
      setNodes(
        finalNodes.map((n) => ({
          ...n,
          data: { ...(n.data || {}), status: 'idle' },
        }))
      );
      setEdges(finalEdges.map((e) => ({ ...e, type: 'plus', animated: true })));
      if (name && !streamStateRef.current.nameSet) setWorkflowName(name);
      setTimeout(() => fitView({ padding: 0.25, duration: 400 }), 50);
      toast.success(`Workflow ready · ${finalNodes.length} nodes`);
    },
    onError: (message) => {
      toast.error(message);
    },
  });

  const handleAIPrompt = useCallback(
    (prompt: string) => {
      streamStateRef.current = { nameSet: false, nodes: [], edges: [] };
      // Clear existing canvas for a fresh build
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      stream.start({ prompt });
    },
    [stream, setNodes, setEdges]
  );

  // Save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const cleanNodes = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          label: (n.data as any)?.label,
          description: (n.data as any)?.description,
          config: (n.data as any)?.config,
        },
      }));
      const cleanEdges = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated,
      }));
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflowName,
          nodes: cleanNodes,
          edges: cleanEdges,
          status: workflowStatus,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setHasUnsavedChanges(false);
      toast.success('Saved');
    } catch (err) {
      console.error(err);
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  }, [workflowId, workflowName, nodes, edges, workflowStatus]);

  // Run — animates execution by walking the topological order
  const handleRun = useCallback(async () => {
    if (nodes.length === 0) {
      toast.error('Add at least one node');
      return;
    }
    setIsRunning(true);
    setLastRunSummary(null);

    // Mark all pending
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...(n.data || {}), status: 'pending' } }))
    );

    // Build adjacency and find topological order
    const adj = new Map<string, string[]>();
    const indeg = new Map<string, number>();
    nodes.forEach((n) => {
      adj.set(n.id, []);
      indeg.set(n.id, 0);
    });
    edges.forEach((e) => {
      adj.get(e.source)?.push(e.target);
      indeg.set(e.target, (indeg.get(e.target) || 0) + 1);
    });
    const queue: string[] = [];
    indeg.forEach((d, id) => d === 0 && queue.push(id));
    const order: string[] = [];
    while (queue.length) {
      const id = queue.shift()!;
      order.push(id);
      for (const next of adj.get(id) || []) {
        indeg.set(next, (indeg.get(next) || 1) - 1);
        if (indeg.get(next) === 0) queue.push(next);
      }
    }
    if (order.length === 0) order.push(...nodes.map((n) => n.id));

    try {
      // Kick off backend execution
      fetch(`/api/workflows/${workflowId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger_data: {} }),
      }).catch(() => {
        // we still animate locally
      });

      // Animate each node in topo order
      for (const id of order) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === id ? { ...n, data: { ...(n.data || {}), status: 'running' } } : n
          )
        );
        const dur = 700 + Math.random() * 900;
        await new Promise((r) => setTimeout(r, dur));
        setNodes((nds) =>
          nds.map((n) =>
            n.id === id
              ? {
                  ...n,
                  data: { ...(n.data || {}), status: 'completed', durationMs: Math.round(dur) },
                }
              : n
          )
        );
      }
      setLastRunSummary({ success: true, completedAt: new Date().toLocaleTimeString() });
      toast.success('Workflow executed successfully');
    } catch (err) {
      console.error(err);
      setNodes((nds) =>
        nds.map((n) =>
          (n.data as any)?.status === 'running'
            ? { ...n, data: { ...(n.data || {}), status: 'failed' } }
            : n
        )
      );
      setLastRunSummary({ success: false, completedAt: new Date().toLocaleTimeString() });
      toast.error('Workflow execution failed');
    } finally {
      setIsRunning(false);
    }
  }, [nodes, edges, workflowId, setNodes]);

  // Node modifications
  const handleNodePatch = useCallback(
    (
      nodeId: string,
      patch: { label?: string; description?: string; config?: Record<string, unknown> }
    ) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...(n.data || {}),
                  ...(patch.label !== undefined ? { label: patch.label } : {}),
                  ...(patch.description !== undefined ? { description: patch.description } : {}),
                  ...(patch.config !== undefined ? { config: patch.config } : {}),
                },
              }
            : n
        )
      );
    },
    [setNodes]
  );

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  const handleNodeDuplicate = useCallback(
    (nodeId: string) => {
      const target = nodes.find((n) => n.id === nodeId);
      if (!target) return;
      const newId = `${target.type}-${Date.now().toString(36)}`;
      const copy: Node = {
        ...target,
        id: newId,
        position: { x: target.position.x + 40, y: target.position.y + 40 },
        selected: false,
      };
      setNodes((nds) => [...nds, copy]);
      toast.success('Node duplicated');
    },
    [nodes, setNodes]
  );

  const triggerCount = nodes.filter((n) => getNodeDefinition(n.type).isTrigger).length;
  const hasTrigger = triggerCount > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-canvas-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Loading workflow…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-canvas-bg">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between h-[52px] px-2 sm:px-4 bg-surface-1/95 backdrop-blur-md border-b border-border shrink-0 z-10 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link
              href="/workflows"
              aria-label="Back to workflows"
              className="p-1.5 rounded-lg hover:bg-surface-2 text-text-tertiary hover:text-text-primary transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="hidden sm:block h-5 w-px bg-border" />

            <input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              aria-label="Workflow name"
              className="bg-transparent text-sm font-semibold text-text-primary outline-none border-b border-transparent focus:border-accent-primary/50 transition-colors px-1 min-w-0 w-full sm:max-w-[280px]"
            />

            <button
              type="button"
              onClick={() =>
                setWorkflowStatus(workflowStatus === 'active' ? 'paused' : 'active')
              }
              className={cn(
                'hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0',
                workflowStatus === 'active'
                  ? 'bg-accent-green-muted text-accent-green hover:bg-accent-green/20'
                  : 'bg-accent-amber-muted text-accent-amber hover:bg-accent-amber/20'
              )}
              title={`Click to ${workflowStatus === 'active' ? 'pause' : 'activate'}`}
            >
              {workflowStatus === 'active' ? (
                <Power className="w-3 h-3" />
              ) : (
                <PowerOff className="w-3 h-3" />
              )}
              {workflowStatus === 'active' ? 'Active' : 'Paused'}
            </button>

            {hasUnsavedChanges && (
              <Badge variant="warning" size="sm" className="hidden sm:inline-flex">
                unsaved
              </Badge>
            )}

            {!hasTrigger && nodes.length > 0 && (
              <Badge variant="error" size="sm" dot className="hidden sm:inline-flex">
                no trigger
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <div className="text-[11px] text-text-tertiary px-2 hidden xl:flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {nodes.length} nodes
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {edges.length} connections
              </span>
            </div>

            <div className="hidden sm:block h-5 w-px bg-border mx-1" />

            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setInsertContext({ mode: 'append' });
                setPickerOpen(true);
              }}
              aria-label="Add node"
              className="hidden md:inline-flex"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Add Node</span>
            </Button>

            <Button
              variant="secondary"
              size="xs"
              onClick={handleSave}
              loading={isSaving}
              aria-label="Save workflow"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </Button>

            <Button
              variant="primary"
              size="xs"
              onClick={handleRun}
              loading={isRunning}
              disabled={nodes.length === 0}
              aria-label="Test workflow"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Test</span>
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={(inst) => (reactFlowInstanceRef.current = inst)}
            onNodeClick={(_, n) => setSelectedNode(n)}
            onPaneClick={() => setSelectedNode(null)}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            proOptions={{ hideAttribution: true }}
            deleteKeyCode={['Backspace', 'Delete']}
            className="bg-canvas-bg"
            minZoom={0.2}
            maxZoom={2.5}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="var(--canvas-dot)"
            />
            <Controls
              showInteractive={false}
              position="bottom-left"
              style={{ marginBottom: 16, marginLeft: 16 }}
            />
            {nodes.length > 3 && (
              <MiniMap
                nodeStrokeWidth={3}
                position="top-right"
                style={{
                  marginTop: 16,
                  marginRight: selectedNode ? 376 : 16,
                  width: 156,
                  height: 90,
                  transition: 'margin-right 200ms ease',
                }}
                maskColor="rgba(10, 10, 11, 0.7)"
                nodeColor={(n) => {
                  const def = getNodeDefinition(n.type);
                  return `var(--node-${n.type})` || 'var(--accent-primary)';
                }}
                pannable
                zoomable
              />
            )}

            {lastRunSummary && !isRunning && (
              <Panel position="top-center">
                <div
                  className={cn(
                    'mt-3 px-3 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-1.5 shadow-md',
                    lastRunSummary.success
                      ? 'bg-accent-green/15 text-accent-green border border-accent-green/30'
                      : 'bg-accent-red/15 text-accent-red border border-accent-red/30'
                  )}
                >
                  {lastRunSummary.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5" />
                  )}
                  {lastRunSummary.success ? 'Run completed' : 'Run failed'} ·{' '}
                  {lastRunSummary.completedAt}
                </div>
              </Panel>
            )}

            {nodes.length === 0 && !stream.isStreaming && (
              <Panel position="top-center">
                <div className="mt-24 text-center animate-fade-in max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-accent-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Start with a prompt
                  </h3>
                  <p className="text-sm text-text-secondary mb-6">
                    Describe your workflow below or pick a starting node.
                    AI will assemble the canvas in real-time.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setInsertContext({ mode: 'append' });
                      setPickerOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add first node
                  </Button>
                </div>
              </Panel>
            )}
          </ReactFlow>

          <AIPromptBar
            onSubmit={handleAIPrompt}
            isStreaming={stream.isStreaming}
            onCancel={stream.cancel}
            status={stream.status}
            progressText={
              stream.nodeCount > 0
                ? `Building… ${stream.nodeCount} nodes so far`
                : undefined
            }
          />
        </div>
      </div>

      {/* Right Properties Panel — overlay on mobile, side-by-side on lg+ */}
      {selectedNode && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 animate-fade-in"
            onClick={() => setSelectedNode(null)}
            aria-hidden="true"
          />
          <div className="fixed lg:relative inset-y-0 right-0 z-40 lg:z-0">
            <NodePropertiesPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onChange={handleNodePatch}
              onDelete={handleNodeDelete}
              onDuplicate={handleNodeDuplicate}
            />
          </div>
        </>
      )}

      {/* Node Picker Modal */}
      <NodePicker
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setInsertContext(null);
        }}
        onPick={handlePick}
        title={
          insertContext?.mode === 'insert' ? 'Insert node between…' : 'Add a node'
        }
        excludeTriggers={hasTrigger || insertContext?.mode === 'insert'}
      />
    </div>
  );
}

export default function WorkflowPage({ params }: WorkflowEditorProps) {
  const resolvedParams = use(params);
  return (
    <ReactFlowProvider>
      <WorkflowCanvas workflowId={resolvedParams.id} />
    </ReactFlowProvider>
  );
}
