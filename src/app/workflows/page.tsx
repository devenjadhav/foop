import { WorkflowList } from "@/components/workflows/workflow-list";
import { mockWorkflows } from "@/data/workflows";

export default function WorkflowsPage() {
  return (
    <main className="container mx-auto py-10 px-4">
      <WorkflowList initialWorkflows={mockWorkflows} />
    </main>
  );
}
