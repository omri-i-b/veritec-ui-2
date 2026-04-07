import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Veritec AI",
  description: "Legal document management powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full font-sans">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex flex-1 flex-col">{children}</main>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
