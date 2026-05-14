export type AuditEventType =
  | 'receipt.uploaded'
  | 'ocr.started'
  | 'ocr.completed'
  | 'ocr.failed'
  | 'trust.started'
  | 'trust.approved'
  | 'trust.flagged'
  | 'trust.blocked'
  | 'transfer.initiated'
  | 'transfer.confirmed'
  | 'transfer.failed'
  | 'workflow.run.started'
  | 'workflow.run.completed'
  | 'workflow.run.failed';

export type AuditSeverity = 'info' | 'warn' | 'error' | 'critical';

export interface AuditEvent {
  id: string;
  user_id: string;
  run_id?: string;
  event_type: AuditEventType;
  entity_type?: string;
  entity_id?: string;
  metadata: Record<string, unknown>;
  severity: AuditSeverity;
  created_at: string;
}
