import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Foop</h1>
      <p className="text-muted-foreground mb-8">B2B Automation SaaS</p>
      <Button asChild>
        <a href="/dashboard">Go to Dashboard</a>
      </Button>
    </div>
  );
}
