"use client";

import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import {
  ArrowRight,
  ArrowLeft,
  LayoutTemplate,
  Users,
  Bell,
  BarChart3,
  FileText,
  Mail,
  Check,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const steps = [
  { label: "Welcome" },
  { label: "Create Workflow" },
  { label: "Integrations" },
  { label: "Templates" },
];

const templates = [
  {
    id: "lead-notification",
    name: "Lead Notification",
    description: "Get notified in Slack when a new lead comes in from your forms",
    icon: Bell,
    category: "Sales",
    popular: true,
  },
  {
    id: "weekly-report",
    name: "Weekly Report Generator",
    description: "Automatically compile and send weekly performance reports",
    icon: BarChart3,
    category: "Reporting",
    popular: true,
  },
  {
    id: "team-onboarding",
    name: "Team Onboarding",
    description: "Automate new employee onboarding tasks and documentation",
    icon: Users,
    category: "HR",
    popular: false,
  },
  {
    id: "document-approval",
    name: "Document Approval",
    description: "Streamline document review and approval workflows",
    icon: FileText,
    category: "Operations",
    popular: false,
  },
  {
    id: "email-to-task",
    name: "Email to Task",
    description: "Convert important emails into actionable tasks automatically",
    icon: Mail,
    category: "Productivity",
    popular: true,
  },
  {
    id: "blank",
    name: "Start from Scratch",
    description: "Build your workflow from the ground up with full control",
    icon: LayoutTemplate,
    category: "Custom",
    popular: false,
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { data, updateData, setCurrentStep } = useOnboarding();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    data.selectedTemplate
  );

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  const handleFinish = () => {
    updateData({ selectedTemplate });
    router.push("/onboarding/complete");
  };

  const handleBack = () => {
    router.push("/onboarding/integrations");
  };

  return (
    <div className="space-y-8">
      <ProgressIndicator currentStep={4} totalSteps={4} steps={steps} />

      <div className="text-center pt-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-6">
          <LayoutTemplate className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose a Template
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Start with a pre-built template or create your own from scratch.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          return (
            <Card
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              selected={isSelected}
              className="relative"
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              {template.popular && !isSelected && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                  <Star className="w-3 h-3" />
                  Popular
                </div>
              )}
              <div className="space-y-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    template.id === "blank" ? "bg-gray-100" : "bg-primary-50"
                  )}
                >
                  <template.icon
                    className={cn(
                      "w-6 h-6",
                      template.id === "blank"
                        ? "text-gray-500"
                        : "text-primary-600"
                    )}
                  />
                </div>
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {template.category}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between max-w-4xl mx-auto pt-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button onClick={handleFinish}>
          {selectedTemplate ? "Finish Setup" : "Skip & Finish"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
