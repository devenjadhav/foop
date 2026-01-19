"use client";

import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ArrowRight,
  ArrowLeft,
  Plug,
  Check,
  Mail,
  MessageSquare,
  Database,
  Calendar,
  FileSpreadsheet,
  Trello,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Welcome" },
  { label: "Create Workflow" },
  { label: "Integrations" },
  { label: "Templates" },
];

const integrations = [
  {
    id: "slack",
    name: "Slack",
    description: "Team messaging and collaboration",
    icon: MessageSquare,
    color: "bg-purple-500",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Email communication",
    icon: Mail,
    color: "bg-red-500",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Notes and documentation",
    icon: Database,
    color: "bg-gray-800",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Scheduling and events",
    icon: Calendar,
    color: "bg-blue-500",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Spreadsheets and data",
    icon: FileSpreadsheet,
    color: "bg-green-500",
  },
  {
    id: "trello",
    name: "Trello",
    description: "Project management",
    icon: Trello,
    color: "bg-sky-500",
  },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(
    data.selectedIntegrations
  );

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  const toggleIntegration = (id: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    updateData({ selectedIntegrations });
    router.push("/onboarding/templates");
  };

  const handleBack = () => {
    router.push("/onboarding/create-workflow");
  };

  return (
    <div className="space-y-8">
      <ProgressIndicator currentStep={3} totalSteps={4} steps={steps} />

      <div className="text-center pt-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-6">
          <Plug className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Connect Your First Integration
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Select the apps you want to connect. You can always add more later.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {integrations.map((integration) => {
          const isSelected = selectedIntegrations.includes(integration.id);
          return (
            <Card
              key={integration.id}
              onClick={() => toggleIntegration(integration.id)}
              selected={isSelected}
              className="relative"
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    integration.color
                  )}
                >
                  <integration.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {integration.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {integration.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedIntegrations.length > 0 && (
        <p className="text-center text-sm text-gray-500">
          {selectedIntegrations.length} integration
          {selectedIntegrations.length > 1 ? "s" : ""} selected
        </p>
      )}

      <div className="flex justify-between max-w-3xl mx-auto pt-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleNext}>
            Skip for now
          </Button>
          <Button onClick={handleNext} disabled={selectedIntegrations.length === 0}>
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
