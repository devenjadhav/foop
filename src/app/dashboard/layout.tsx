export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-14 items-center">
          <div className="font-semibold">Foop</div>
          <nav className="ml-8 flex gap-4 text-sm">
            <a href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </a>
            <a
              href="/dashboard/integrations/google-sheets"
              className="text-muted-foreground hover:text-foreground"
            >
              Google Sheets
            </a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
