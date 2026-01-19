import type { Workflow } from "@/types/workflow";

export const mockWorkflow: Workflow = {
  id: "wf-001",
  name: "New Lead Notification",
  description: "Sends a Slack notification when a new lead is added to the CRM",
  status: "active",
  enabled: true,
  userId: "user-123",
  triggerType: "webhook",
  tags: ["sales", "notifications"],
  currentVersion: 3,
  createdAt: new Date("2024-11-15T10:00:00Z"),
  updatedAt: new Date("2025-01-10T14:30:00Z"),
  lastRunAt: new Date("2025-01-18T09:15:00Z"),
  nodes: [
    { id: "n1", type: "trigger", label: "Webhook Trigger", data: {}, position: { x: 0, y: 0 } },
    { id: "n2", type: "action", label: "Send Slack Message", data: {}, position: { x: 200, y: 0 } },
  ],
  edges: [{ id: "e1", source: "n1", target: "n2" }],
  versions: [
    { id: "v3", version: 3, createdAt: new Date("2025-01-10T14:30:00Z"), createdBy: "John Doe", changeDescription: "Updated Slack channel to #sales-leads" },
    { id: "v2", version: 2, createdAt: new Date("2024-12-20T11:00:00Z"), createdBy: "John Doe", changeDescription: "Added lead score filter" },
    { id: "v1", version: 1, createdAt: new Date("2024-11-15T10:00:00Z"), createdBy: "John Doe", changeDescription: "Initial version" },
  ],
  runs: [
    { id: "r1", status: "success", startedAt: new Date("2025-01-18T09:15:00Z"), completedAt: new Date("2025-01-18T09:15:02Z"), triggeredBy: "webhook" },
    { id: "r2", status: "success", startedAt: new Date("2025-01-17T16:42:00Z"), completedAt: new Date("2025-01-17T16:42:01Z"), triggeredBy: "webhook" },
    { id: "r3", status: "failed", startedAt: new Date("2025-01-17T14:20:00Z"), completedAt: new Date("2025-01-17T14:20:03Z"), triggeredBy: "webhook", errorMessage: "Slack API rate limit exceeded" },
    { id: "r4", status: "success", startedAt: new Date("2025-01-16T11:05:00Z"), completedAt: new Date("2025-01-16T11:05:02Z"), triggeredBy: "webhook" },
    { id: "r5", status: "success", startedAt: new Date("2025-01-15T09:30:00Z"), completedAt: new Date("2025-01-15T09:30:01Z"), triggeredBy: "manual" },
  ],
};

export function getWorkflowById(id: string): Workflow | null {
  if (id === "wf-001" || id === "1") {
    return mockWorkflow;
  }
  return null;
}
