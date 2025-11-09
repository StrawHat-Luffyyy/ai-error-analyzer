import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "AI Error Analyzer",
  description: "Monitor AI analysis performance and history",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground transition-colors">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Header */}
          <header className="border-b border-border/40 p-4 flex justify-between items-center sticky top-0 bg-background z-50">
            <h1 className="text-xl font-semibold">AI Error Analyzer</h1>
            <ThemeToggle />
          </header>

          {/* Page Content */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
