import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foop - B2B Automation SaaS",
  description: "Automate your business workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
