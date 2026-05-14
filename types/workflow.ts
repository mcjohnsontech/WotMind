export type WorkflowStatus = 'active' | 'paused' | 'archived';
export type RunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'blocked';
export type StepType = 'trigger' | 'ocr' | 'trust' | 'transfer' | 'audit';
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  nodes: WorkflowNodeConfig[];
  edges: WorkflowEdgeConfig[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowNodeConfig {
  id: string;
  type: StepType;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface WorkflowEdgeConfig {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  user_id: string;
  status: RunStatus;
  trigger_data?: Record<string, unknown>;
  result_data?: Record<string, unknown>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface RunStep {
  id: string;
  run_id: string;
  step_type: StepType;
  step_index: number;
  status: StepStatus;
  input_data?: Record<string, unknown>;
  output_data?: Record<string, unknown>;
  error_message?: string;
  duration_ms?: number;
  started_at?: string;
  completed_at?: string;
}
