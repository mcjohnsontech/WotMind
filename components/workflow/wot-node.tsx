'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Check, AlertCircle, Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getNodeDefinition } from '@/lib/workflow/node-registry';

export interface WotNodeData {
  label?: string;
  description?: string;
  status?: 'idle' | 'running' | 'completed' | 'failed' | 'pending' | 'streaming';
  config?: Record<string, unknown>;
  durationMs?: number;
  [key: string]: unknown;
}

const STATUS_RING: Record<string, string> = {
  idle: '',
  pending: 'ring-1 ring-text-tertiary/40',
  streaming: 'ring-2 ring-accent-primary/60 animate-pulse',
  running: 'ring-2 ring-accent-blue shadow-[0_0_24px_rgba(96,165,250,0.35)]',
  completed: 'ring-2 ring-accent-green/70',
  failed: 'ring-2 ring-accent-red/70',
};

function StatusBadge({ status }: { status: string }) {
  if (status === 'idle' || !status) return null;

  if (status === 'streaming') {
    return (
      <div className="absolute -top-2 -right-2 z-10 px-1.5 h-5 rounded-full bg-accent-primary text-text-inverse text-[9px] font-bold flex items-center gap-1 shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        AI
      </div>
    );
  }

  return (
    <div
      className={cn(
        'absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface-1 shadow-md',
        {
          'bg-text-tertiary': status === 'pending',
          'bg-accent-blue': status === 'running',
          'bg-accent-green': status === 'completed',
          'bg-accent-red': status === 'failed',
        }
      )}
    >
      {status === 'running' && <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />}
      {status === 'completed' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      {status === 'failed' && <AlertCircle className="w-2.5 h-2.5 text-white" />}
      {status === 'pending' && <Play className="w-2 h-2 text-white" fill="currentColor" />}
    </div>
  );
}

function WotNodeComponent({ data, type, selected }: NodeProps) {
  const nodeData = (data || {}) as WotNodeData;
  const nodeType = (type as string) || 'default';
  const def = getNodeDefinition(nodeType);
  const Icon = def.icon;
  const status = nodeData.status || 'idle';
  const isTrigger = def.isTrigger;

  return (
    <div
      className={cn(
        'group relative bg-surface-1 rounded-xl border border-border',
        'min-w-[220px] max-w-[260px]',
        'shadow-[0_4px_14px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.55)] transition-all duration-200',
        selected &&
          'border-accent-primary ring-2 ring-accent-primary/40 shadow-[0_0_24px_rgba(255,109,90,0.35)]',
        STATUS_RING[status]
      )}
    >
      <StatusBadge status={status} />

      <div className="flex items-start gap-3 px-3.5 py-3">
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border',
            def.bgColor,
            def.borderColor
          )}
        >
          <Icon className={cn('w-4.5 h-4.5', def.color)} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-[13px] font-semibold text-text-primary truncate leading-tight">
              {nodeData.label || def.name}
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-text-tertiary">
            {def.name}
          </p>
        </div>
      </div>

      {nodeData.description && (
        <div className="px-3.5 pb-3 -mt-1">
          <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">
            {nodeData.description}
          </p>
        </div>
      )}

      {(status === 'completed' || status === 'failed') && nodeData.durationMs != null && (
        <div className="px-3.5 pb-2.5 -mt-1">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium',
              status === 'completed'
                ? 'bg-accent-green/10 text-accent-green'
                : 'bg-accent-red/10 text-accent-red'
            )}
          >
            {nodeData.durationMs}ms
          </span>
        </div>
      )}

      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !bg-surface-3 !border-2 !border-border hover:!bg-accent-primary hover:!border-accent-primary transition-colors"
          style={{ left: -6 }}
        />
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-surface-3 !border-2 !border-border hover:!bg-accent-primary hover:!border-accent-primary transition-colors"
        style={{ right: -6 }}
      />
    </div>
  );
}

export const WotNode = memo(WotNodeComponent);

export const nodeTypes = {
  trigger: WotNode,
  webhook: WotNode,
  schedule: WotNode,
  ocr: WotNode,
  trust: WotNode,
  transfer: WotNode,
  audit: WotNode,
  condition: WotNode,
  filter: WotNode,
  ai: WotNode,
  notification: WotNode,
  database: WotNode,
  default: WotNode,
};
