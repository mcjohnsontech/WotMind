'use client';

import { cn } from '@/lib/utils/cn';
import {
  Upload,
  ScanText,
  Shield,
  ArrowRightLeft,
  ClipboardCheck,
  GitBranch,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

interface NodeTypeItem {
  type: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const availableNodes: NodeTypeItem[] = [
  {
    type: 'trigger',
    label: 'Trigger',
    description: 'Start your workflow',
    icon: Upload,
    color: 'text-node-trigger',
    bgColor: 'bg-node-trigger/10',
  },
  {
    type: 'ocr',
    label: 'OCR Extract',
    description: 'Extract data from images',
    icon: ScanText,
    color: 'text-node-ocr',
    bgColor: 'bg-node-ocr/10',
  },
  {
    type: 'trust',
    label: 'Trust Verify',
    description: 'Verify document authenticity',
    icon: Shield,
    color: 'text-node-trust',
    bgColor: 'bg-node-trust/10',
  },
  {
    type: 'transfer',
    label: 'Transfer',
    description: 'Execute bank transfer',
    icon: ArrowRightLeft,
    color: 'text-node-transfer',
    bgColor: 'bg-node-transfer/10',
  },
  {
    type: 'audit',
    label: 'Audit Log',
    description: 'Record to audit trail',
    icon: ClipboardCheck,
    color: 'text-node-audit',
    bgColor: 'bg-node-audit/10',
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch based on logic',
    icon: GitBranch,
    color: 'text-node-condition',
    bgColor: 'bg-node-condition/10',
  },
  {
    type: 'ai',
    label: 'AI Check',
    description: 'Run AI risk assessment',
    icon: Sparkles,
    color: 'text-node-ai',
    bgColor: 'bg-node-ai/10',
  },
];

interface NodePaletteProps {
  onAddNode: (type: string, label: string) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const handleDragStart = (
    e: React.DragEvent,
    nodeType: string,
    label: string
  ) => {
    e.dataTransfer.setData('application/reactflow-type', nodeType);
    e.dataTransfer.setData('application/reactflow-label', label);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest px-1 mb-2">
        Drag to add
      </p>
      {availableNodes.map((node) => {
        const Icon = node.icon;
        return (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => handleDragStart(e, node.type, node.label)}
            onClick={() => onAddNode(node.type, node.label)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing',
              'border border-transparent hover:border-border hover:bg-surface-2/80',
              'transition-all duration-150 group'
            )}
          >
            <div
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
                node.bgColor
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', node.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-text-primary truncate">
                {node.label}
              </p>
              <p className="text-[10px] text-text-tertiary truncate">
                {node.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
