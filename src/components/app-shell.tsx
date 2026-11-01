import { Link } from "@tanstack/react-router";
import { BarChart3, FileText, Gauge, Globe, HelpCircle, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";
import { useSignOut } from "@/lib/auth";

const items = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/audits", label: "Audits", icon: Gauge },
  { to: "/websites", label: "Websites", icon: Globe },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help", icon: HelpCircle },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const signOut = useSignOut();
  return (
    <div className="min-h-screen bg-ambient md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface/50 p-4 md:flex md:sticky md:top-0 md:h-screen">
        <Logo to="/dashboard" className="mb-8 px-2" />
        <nav className="flex flex-1 flex-col gap-1">
          {items.map((i) => (
            <Link key={i.to} to={i.to} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" activeProps={{ className: "bg-accent text-foreground" }}>
              <i.icon className="size-4" /> {i.label}
            </Link>
          ))}
        </nav>
        <button onClick={signOut} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          <LogOut className="size-4" /> Sign out
        </button>
      </aside>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Logo to="/dashboard" />
        <button onClick={signOut} aria-label="Sign out" className="p-2"><LogOut className="size-5" /></button>
      </header>
      <main className="flex-1 px-4 pt-6 pb-24 sm:px-8 md:pb-10">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-background/95 py-2 backdrop-blur md:hidden">
        {items.slice(0, 5).map((i) => (
          <Link key={i.to} to={i.to} className="flex flex-col items-center gap-0.5 px-2 text-[10px] text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <i.icon className="size-5" /> {i.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
