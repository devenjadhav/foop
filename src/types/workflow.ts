export type WorkflowStatus = "active" | "inactive" | "draft";

export interface WorkflowVersion {
  id: string;
  version: number;
  createdAt: Date;
  createdBy: string;
  changeDescription: string;
}

export interface WorkflowRun {
  id: string;
  status: "success" | "failed" | "running" | "cancelled";
  startedAt: Date;
  completedAt?: Date;
  triggeredBy: string;
  errorMessage?: string;
}

export interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition";
  label: string;
  data: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  enabled: boolean;
  userId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  versions: WorkflowVersion[];
  runs: WorkflowRun[];
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  triggerType: string;
  tags: string[];
}
