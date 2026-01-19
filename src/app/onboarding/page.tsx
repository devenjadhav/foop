"use client";

import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Zap, ArrowRight, Sparkles, Shield, Clock } from "lucide-react";
import { useEffect } from "react";

const steps = [
  { label: "Welcome" },
  { label: "Create Workflow" },
  { label: "Integrations" },
  { label: "Templates" },
];

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Setup",
    description: "Get your first automation running in minutes, not hours.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption and SOC 2 compliance built-in.",
  },
  {
    icon: Clock,
    title: "Save Hours Weekly",
    description: "Automate repetitive tasks and focus on what matters.",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const { setCurrentStep } = useOnboarding();

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const handleGetStarted = () => {
    router.push("/onboarding/create-workflow");
  };

  return (
    <div className="space-y-8">
      <ProgressIndicator currentStep={1} totalSteps={4} steps={steps} />

      <div className="text-center pt-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-6">
          <Sparkles className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Foop
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Your journey to effortless B2B automation starts here. Let&apos;s set up
          your first workflow in just a few steps.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-4">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 mb-4">
              <feature.icon className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-500">{feature.description}</p>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <Button size="lg" onClick={handleGetStarted}>
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      <p className="text-center text-sm text-gray-400">
        This will only take about 3 minutes
      </p>
    </div>
  );
}
