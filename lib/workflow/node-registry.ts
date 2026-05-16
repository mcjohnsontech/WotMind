import {
  Upload,
  ScanText,
  Shield,
  ArrowRightLeft,
  ClipboardCheck,
  GitBranch,
  Sparkles,
  Webhook,
  Mail,
  Database,
  Clock,
  Filter,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type NodeCategory =
  | 'trigger'
  | 'action'
  | 'logic'
  | 'ai'
  | 'finance'
  | 'data';

export interface NodeFieldOption {
  label: string;
  value: string;
}

export interface NodeField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'boolean' | 'currency';
  placeholder?: string;
  description?: string;
  required?: boolean;
  default?: string | number | boolean;
  options?: NodeFieldOption[];
}

export interface NodeDefinition {
  type: string;
  name: string;
  description: string;
  category: NodeCategory;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  ringColor: string;
  isTrigger?: boolean;
  fields: NodeField[];
}

export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  trigger: {
    type: 'trigger',
    name: 'Manual Trigger',
    description: 'Start workflow manually or via webhook',
    category: 'trigger',
    icon: Upload,
    color: 'text-node-trigger',
    bgColor: 'bg-node-trigger/10',
    borderColor: 'border-node-trigger/40',
    ringColor: 'ring-node-trigger',
    isTrigger: true,
    fields: [
      {
        key: 'triggerType',
        label: 'Trigger Type',
        type: 'select',
        default: 'manual',
        options: [
          { label: 'Manual', value: 'manual' },
          { label: 'Webhook', value: 'webhook' },
          { label: 'Schedule', value: 'schedule' },
          { label: 'File Upload', value: 'upload' },
        ],
        description: 'How this workflow starts',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'What kicks off this workflow?',
      },
    ],
  },
  ocr: {
    type: 'ocr',
    name: 'OCR Extract',
    description: 'Extract structured data from documents via Gemini Vision',
    category: 'ai',
    icon: ScanText,
    color: 'text-node-ocr',
    bgColor: 'bg-node-ocr/10',
    borderColor: 'border-node-ocr/40',
    ringColor: 'ring-node-ocr',
    fields: [
      {
        key: 'documentType',
        label: 'Document Type',
        type: 'select',
        default: 'receipt',
        options: [
          { label: 'Receipt', value: 'receipt' },
          { label: 'Invoice', value: 'invoice' },
          { label: 'ID Document', value: 'id' },
          { label: 'Bank Statement', value: 'statement' },
        ],
      },
      {
        key: 'confidenceThreshold',
        label: 'Minimum Confidence',
        type: 'number',
        default: 0.7,
        description: 'Reject extractions below this score (0–1)',
      },
    ],
  },
  trust: {
    type: 'trust',
    name: 'Trust Verify',
    description: 'Duplicate, vendor, anomaly and velocity checks',
    category: 'ai',
    icon: Shield,
    color: 'text-node-trust',
    bgColor: 'bg-node-trust/10',
    borderColor: 'border-node-trust/40',
    ringColor: 'ring-node-trust',
    fields: [
      {
        key: 'blockThreshold',
        label: 'Block Threshold',
        type: 'number',
        default: 0.4,
        description: 'Trust score below this is blocked',
      },
      {
        key: 'flagThreshold',
        label: 'Flag Threshold',
        type: 'number',
        default: 0.7,
        description: 'Trust score below this requires approval',
      },
    ],
  },
  ai: {
    type: 'ai',
    name: 'AI Risk Engine',
    description: 'Multi-check AI risk assessment with pattern learning',
    category: 'ai',
    icon: Sparkles,
    color: 'text-node-ai',
    bgColor: 'bg-node-ai/10',
    borderColor: 'border-node-ai/40',
    ringColor: 'ring-node-ai',
    fields: [
      {
        key: 'maxAmount',
        label: 'Max Amount (₦)',
        type: 'currency',
        default: 100000,
        description: 'Auto-block if exceeds this',
      },
      {
        key: 'velocityWindow',
        label: 'Velocity Window (min)',
        type: 'number',
        default: 60,
      },
      {
        key: 'velocityLimit',
        label: 'Max Runs in Window',
        type: 'number',
        default: 5,
      },
    ],
  },
  condition: {
    type: 'condition',
    name: 'Condition',
    description: 'Branch the workflow based on previous results',
    category: 'logic',
    icon: GitBranch,
    color: 'text-node-condition',
    bgColor: 'bg-node-condition/10',
    borderColor: 'border-node-condition/40',
    ringColor: 'ring-node-condition',
    fields: [
      {
        key: 'field',
        label: 'Field',
        type: 'text',
        placeholder: 'trust.score',
        description: 'Dot path into previous node output',
      },
      {
        key: 'operator',
        label: 'Operator',
        type: 'select',
        default: 'gte',
        options: [
          { label: 'Greater than', value: 'gt' },
          { label: 'Greater or equal', value: 'gte' },
          { label: 'Less than', value: 'lt' },
          { label: 'Less or equal', value: 'lte' },
          { label: 'Equals', value: 'eq' },
          { label: 'Not equals', value: 'neq' },
        ],
      },
      {
        key: 'value',
        label: 'Compare value',
        type: 'text',
        placeholder: '0.7',
      },
    ],
  },
  transfer: {
    type: 'transfer',
    name: 'Bank Transfer',
    description: 'Execute a payout via Squad API',
    category: 'finance',
    icon: ArrowRightLeft,
    color: 'text-node-transfer',
    bgColor: 'bg-node-transfer/10',
    borderColor: 'border-node-transfer/40',
    ringColor: 'ring-node-transfer',
    fields: [
      {
        key: 'beneficiaryAccount',
        label: 'Beneficiary Account',
        type: 'text',
        placeholder: '0123456789',
      },
      {
        key: 'beneficiaryBank',
        label: 'Bank Code',
        type: 'text',
        placeholder: '058',
      },
      {
        key: 'narration',
        label: 'Narration',
        type: 'text',
        placeholder: 'Reimbursement payment',
      },
    ],
  },
  audit: {
    type: 'audit',
    name: 'Audit Log',
    description: 'Record event to the immutable audit trail',
    category: 'data',
    icon: ClipboardCheck,
    color: 'text-node-audit',
    bgColor: 'bg-node-audit/10',
    borderColor: 'border-node-audit/40',
    ringColor: 'ring-node-audit',
    fields: [
      {
        key: 'severity',
        label: 'Severity',
        type: 'select',
        default: 'info',
        options: [
          { label: 'Info', value: 'info' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' },
        ],
      },
      {
        key: 'eventType',
        label: 'Event Type',
        type: 'text',
        placeholder: 'workflow.completed',
      },
    ],
  },
  webhook: {
    type: 'webhook',
    name: 'Webhook',
    description: 'Receive external HTTP triggers',
    category: 'trigger',
    icon: Webhook,
    color: 'text-accent-blue',
    bgColor: 'bg-accent-blue/10',
    borderColor: 'border-accent-blue/40',
    ringColor: 'ring-accent-blue',
    isTrigger: true,
    fields: [
      { key: 'path', label: 'Path', type: 'text', placeholder: '/hook/abc' },
      {
        key: 'method',
        label: 'Method',
        type: 'select',
        default: 'POST',
        options: [
          { label: 'POST', value: 'POST' },
          { label: 'GET', value: 'GET' },
          { label: 'PUT', value: 'PUT' },
        ],
      },
    ],
  },
  schedule: {
    type: 'schedule',
    name: 'Schedule',
    description: 'Trigger on a cron schedule',
    category: 'trigger',
    icon: Clock,
    color: 'text-accent-purple',
    bgColor: 'bg-accent-purple/10',
    borderColor: 'border-accent-purple/40',
    ringColor: 'ring-accent-purple',
    isTrigger: true,
    fields: [
      {
        key: 'cron',
        label: 'Cron Expression',
        type: 'text',
        placeholder: '0 9 * * *',
        default: '0 9 * * *',
      },
    ],
  },
  notification: {
    type: 'notification',
    name: 'Send Notification',
    description: 'Send SMS, WhatsApp or email',
    category: 'action',
    icon: Mail,
    color: 'text-accent-amber',
    bgColor: 'bg-accent-amber/10',
    borderColor: 'border-accent-amber/40',
    ringColor: 'ring-accent-amber',
    fields: [
      {
        key: 'channel',
        label: 'Channel',
        type: 'select',
        default: 'sms',
        options: [
          { label: 'SMS', value: 'sms' },
          { label: 'WhatsApp', value: 'whatsapp' },
          { label: 'Email', value: 'email' },
        ],
      },
      {
        key: 'to',
        label: 'Recipient',
        type: 'text',
        placeholder: '+2348012345678',
      },
      {
        key: 'message',
        label: 'Message',
        type: 'textarea',
        placeholder: 'Your transfer of ₦{{amount}} was successful',
      },
    ],
  },
  filter: {
    type: 'filter',
    name: 'Filter',
    description: 'Stop workflow unless condition matches',
    category: 'logic',
    icon: Filter,
    color: 'text-text-secondary',
    bgColor: 'bg-surface-3',
    borderColor: 'border-border',
    ringColor: 'ring-text-secondary',
    fields: [
      {
        key: 'expression',
        label: 'Expression',
        type: 'text',
        placeholder: 'ocr.amount > 1000',
      },
    ],
  },
  database: {
    type: 'database',
    name: 'Database Query',
    description: 'Read or write to Supabase',
    category: 'data',
    icon: Database,
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/10',
    borderColor: 'border-accent-green/40',
    ringColor: 'ring-accent-green',
    fields: [
      {
        key: 'operation',
        label: 'Operation',
        type: 'select',
        default: 'insert',
        options: [
          { label: 'Insert', value: 'insert' },
          { label: 'Update', value: 'update' },
          { label: 'Select', value: 'select' },
        ],
      },
      {
        key: 'table',
        label: 'Table',
        type: 'text',
        placeholder: 'transactions',
      },
    ],
  },
};

export const FALLBACK_NODE: NodeDefinition = {
  type: 'default',
  name: 'Custom',
  description: 'Custom node',
  category: 'action',
  icon: Zap,
  color: 'text-accent-primary',
  bgColor: 'bg-accent-primary/10',
  borderColor: 'border-accent-primary/40',
  ringColor: 'ring-accent-primary',
  fields: [],
};

export function getNodeDefinition(type: string | undefined): NodeDefinition {
  if (!type) return FALLBACK_NODE;
  return NODE_DEFINITIONS[type] || FALLBACK_NODE;
}

export const ALL_NODES: NodeDefinition[] = Object.values(NODE_DEFINITIONS);

export const CATEGORIES: Array<{
  id: NodeCategory;
  label: string;
  description: string;
}> = [
  { id: 'trigger', label: 'Triggers', description: 'How workflows start' },
  { id: 'ai', label: 'AI & Verification', description: 'Smart checks and analysis' },
  { id: 'finance', label: 'Finance', description: 'Transfers and payments' },
  { id: 'action', label: 'Actions', description: 'Send notifications, alerts' },
  { id: 'logic', label: 'Logic', description: 'Branching and filtering' },
  { id: 'data', label: 'Data', description: 'Storage and audit' },
];
