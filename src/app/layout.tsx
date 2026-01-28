import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Hospice Tracker | M&A Intelligence Platform",
  description: "Real-time hospice acquisition intelligence. Track targets, analyze markets, and close deals faster.",
  keywords: ["hospice", "M&A", "acquisition", "healthcare", "private equity", "due diligence"],
  openGraph: {
    title: "Hospice Tracker",
    description: "Real-time hospice acquisition intelligence platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
