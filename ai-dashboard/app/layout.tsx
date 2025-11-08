import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "AI Error Analyzer Dashboard",
  description: "Monitor AI analysis performance in real-time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground transition-colors">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="border-b p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">AI Error Analyzer</h1>
            <ThemeToggle />
          </header>
          <main className="max-w-7xl mx-auto p-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
