import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zurich Customer Portal",
  description: "Zurich Insurance Customer Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="zurich">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
