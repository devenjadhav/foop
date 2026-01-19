export type WorkflowStatus = "active" | "inactive" | "draft" | "error";

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  lastRun: Date | null;
  createdAt: Date;
  updatedAt: Date;
  runsCount: number;
  trigger: string;
}
