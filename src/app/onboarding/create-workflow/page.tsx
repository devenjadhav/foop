"use client";

import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowRight, ArrowLeft, Workflow, FileText, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

const steps = [
  { label: "Welcome" },
  { label: "Create Workflow" },
  { label: "Integrations" },
  { label: "Templates" },
];

export default function CreateWorkflowPage() {
  const router = useRouter();
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [workflowName, setWorkflowName] = useState(data.workflowName);
  const [workflowDescription, setWorkflowDescription] = useState(data.workflowDescription);
  const [error, setError] = useState("");

  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  const handleNext = () => {
    if (!workflowName.trim()) {
      setError("Please enter a workflow name");
      return;
    }
    updateData({ workflowName, workflowDescription });
    router.push("/onboarding/integrations");
  };

  const handleBack = () => {
    router.push("/onboarding");
  };

  return (
    <div className="space-y-8">
      <ProgressIndicator currentStep={2} totalSteps={4} steps={steps} />

      <div className="text-center pt-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-6">
          <Workflow className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Create Your First Workflow
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          A workflow is an automated process that connects your apps and services.
          Let&apos;s give yours a name.
        </p>
      </div>

      <Card className="max-w-xl mx-auto">
        <div className="space-y-6">
          <div>
            <label htmlFor="workflowName" className="block text-sm font-medium text-gray-700 mb-2">
              Workflow Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="workflowName"
                type="text"
                value={workflowName}
                onChange={(e) => {
                  setWorkflowName(e.target.value);
                  setError("");
                }}
                placeholder="e.g., Slack to Notion Sync"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="workflowDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="workflowDescription"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Describe what this workflow does..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="bg-primary-50 rounded-lg p-4">
            <h4 className="font-medium text-primary-900 mb-2">Pro Tip</h4>
            <p className="text-sm text-primary-700">
              Use descriptive names that explain the trigger and action, like
              &quot;New Lead → CRM Entry&quot; or &quot;Daily Report Generator&quot;.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between max-w-xl mx-auto pt-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext}>
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
