import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foop - B2B Automation SaaS",
  description: "Connect and automate your business workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
