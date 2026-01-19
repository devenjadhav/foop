import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foop - Workflow Builder",
  description: "B2B Automation SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
