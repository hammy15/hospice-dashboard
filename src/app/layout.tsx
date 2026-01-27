import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Hospice Acquisition Intelligence",
  description: "Decision-grade hospice acquisition target analysis and intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className="antialiased mesh-bg min-h-screen">
        <ThemeProvider>
          <Navigation />
          <main className="pt-20 pb-12">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
