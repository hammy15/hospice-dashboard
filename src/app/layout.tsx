import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

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
    <html lang="en">
      <body className="antialiased mesh-bg min-h-screen">
        <Navigation />
        <main className="pt-20 pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
