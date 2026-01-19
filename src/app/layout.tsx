import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foop - B2B Automation SaaS",
  description: "Automate your B2B workflows",
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
