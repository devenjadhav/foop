import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Google Sheets</CardTitle>
            <CardDescription>
              Connect to Google Sheets for data import and export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/dashboard/integrations/google-sheets">Configure</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>More Integrations</CardTitle>
            <CardDescription>
              Additional integrations coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
