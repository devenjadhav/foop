"use client";

import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  CheckCircle2,
  ArrowRight,
  Workflow,
  Plug,
  LayoutTemplate,
  Rocket,
} from "lucide-react";

export default function CompletePage() {
  const { data } = useOnboarding();

  const handleGoToDashboard = () => {
    // In a real app, this would navigate to the dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div className="space-y-8">
      <div className="text-center pt-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          You&apos;re All Set!
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Congratulations! Your Foop account is ready. Here&apos;s a summary of
          what you&apos;ve set up.
        </p>
      </div>

      <Card className="max-w-xl mx-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Setup Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Workflow className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">First Workflow</p>
              <p className="font-medium text-gray-900">
                {data.workflowName || "Not created"}
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Plug className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Integrations</p>
              <p className="font-medium text-gray-900">
                {data.selectedIntegrations.length > 0
                  ? `${data.selectedIntegrations.length} connected`
                  : "None selected"}
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Template</p>
              <p className="font-medium text-gray-900">
                {data.selectedTemplate
                  ? data.selectedTemplate
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")
                  : "Starting from scratch"}
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
        </div>
      </Card>

      <div className="max-w-xl mx-auto space-y-4">
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 border-0 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Ready to automate?</h4>
              <p className="text-sm text-primary-100">
                Your workspace is set up and waiting for you.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={handleGoToDashboard}
            className="bg-gray-900 hover:bg-gray-800"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400">
        Need help? Check out our{" "}
        <a href="#" className="text-primary-600 hover:underline">
          documentation
        </a>{" "}
        or{" "}
        <a href="#" className="text-primary-600 hover:underline">
          contact support
        </a>
        .
      </p>
    </div>
  );
}
