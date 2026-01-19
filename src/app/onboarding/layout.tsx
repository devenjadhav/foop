"use client";

import { OnboardingProvider } from "@/components/onboarding/OnboardingContext";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </OnboardingProvider>
  );
}
