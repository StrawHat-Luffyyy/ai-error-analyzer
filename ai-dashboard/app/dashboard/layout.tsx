import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border/40 bg-background p-4 relative after:content-[''] after:absolute after:top-0 after:right-0 after:h-full after:w-px after:bg-border/40">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex justify-center p-6 overflow-auto">
        <div className="w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
