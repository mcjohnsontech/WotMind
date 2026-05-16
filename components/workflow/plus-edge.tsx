'use client';

import { memo, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type PlusEdgeData = {
  onInsert?: (edgeId: string, source: string, target: string) => void;
};

function PlusEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  data,
  selected,
  style,
  markerEnd,
}: EdgeProps) {
  const [hover, setHover] = useState(false);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.4,
  });

  const edgeData = (data || {}) as PlusEdgeData;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected
            ? 'var(--accent-primary)'
            : hover
              ? 'var(--accent-primary)'
              : 'var(--border)',
          strokeWidth: 2,
          ...style,
        }}
      />
      {/* Wider invisible path for easier hover */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ cursor: 'pointer' }}
      />
      <EdgeLabelRenderer>
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              edgeData.onInsert?.(id, source, target);
            }}
            className={cn(
              'w-6 h-6 rounded-full bg-surface-1 border border-border flex items-center justify-center shadow-md',
              'transition-all duration-150',
              hover
                ? 'opacity-100 scale-110 border-accent-primary text-accent-primary bg-accent-primary/10'
                : 'opacity-0 scale-90 text-text-tertiary'
            )}
            title="Insert node"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const PlusEdge = memo(PlusEdgeComponent);

export const edgeTypes = {
  plus: PlusEdge,
  default: PlusEdge,
};
