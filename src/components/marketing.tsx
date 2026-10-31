import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo, ScoreRing, SampleBadge } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Product", href: "/#product" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how" },
] as const;

export function SiteNav() {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled ? "border-b border-border bg-background/75 backdrop-blur-xl" : "bg-transparent")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((n) => (
            <a key={n.label} href={n.href} className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              {n.label}
            </a>
          ))}
          <Link to="/pricing" className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Pricing
          </Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button asChild variant="hero" size="sm" className="h-9 px-4">
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="h-9">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild variant="hero" size="sm" className="h-9 px-4">
                <Link to="/auth" search={{ mode: "signup" }}>Get Started</Link>
              </Button>
            </>
          )}
        </div>
        <button className="grid size-10 place-items-center rounded-lg md:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-1 px-5 py-4">
              {nav.map((n) => (
                <a key={n.label} href={n.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                  {n.label}
                </a>
              ))}
              <Link to="/pricing" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-accent">Pricing</Link>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {user ? (
                  <Button asChild variant="hero" className="col-span-2"><Link to="/dashboard">Open dashboard</Link></Button>
                ) : (
                  <>
                    <Button asChild variant="outline"><Link to="/auth">Sign In</Link></Button>
                    <Button asChild variant="hero"><Link to="/auth" search={{ mode: "signup" }}>Get Started</Link></Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">Your Website. Under Control. Website intelligence and audit reporting for modern agencies.</p>
        </div>
        <FooterCol title="Product" links={[["Features", "/#features"], ["How It Works", "/#how"], ["Pricing", "/pricing"]]} />
        <FooterCol title="Support" links={[["FAQ", "/#faq"], ["Contact", "mailto:hello@sitepilot.app"], ["Sign In", "/auth"]]} />
        <FooterCol title="Legal" links={[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} SitePilot. All rights reserved.</span>
          <span>Audits powered by Google PageSpeed Insights.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map(([l, h]) => (
          <li key={l}>
            <a href={h} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const bars = [42, 58, 51, 66, 72, 64, 80, 77, 88, 84, 92, 95];

export function DashboardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-[2rem] bg-brand opacity-20 blur-3xl" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-lift backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-warning/70" />
            <span className="size-2.5 rounded-full bg-success/70" />
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">app.sitepilot / overview</span>
          <SampleBadge />
        </div>
        <div className="grid gap-4 p-4 sm:p-5">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[["Performance", 94], ["SEO", 88], ["Access.", 97], ["Best Pr.", 92]].map(([l, s], i) => (
              <motion.div key={l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="rounded-xl border border-border bg-card/70 p-2 sm:p-3">
                <ScoreRing score={s as number} size={compact ? 46 : 54} stroke={5} />
                <p className="mt-1.5 truncate text-center text-[10px] text-muted-foreground sm:text-[11px]">{l}</p>
              </motion.div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-card/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium">Audit activity</span>
              <span className="text-[11px] text-success">+18% this month</span>
            </div>
            <div className="flex h-24 items-end gap-1.5">
              {bars.map((b, i) => (
                <motion.div key={i} className="flex-1 rounded-t-sm bg-brand" initial={{ height: 0 }} animate={{ height: `${b}%` }} transition={{ delay: 0.5 + i * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
              ))}
            </div>
          </div>
          {!compact && (
            <div className="space-y-2">
              {[["northwind.studio", 96, "Complete"], ["acme-bakery.com", 71, "Complete"], ["lumen.health", 54, "Review"]].map(([u, s, st]) => (
                <div key={u as string} className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2 text-xs">
                  <span className="font-mono text-muted-foreground">{u}</span>
                  <span className="flex items-center gap-3">
                    <span className={cn("font-semibold", (s as number) >= 90 ? "text-success" : (s as number) >= 50 ? "text-warning" : "text-destructive")}>{s}</span>
                    <span className="text-muted-foreground">{st}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {!compact && (
        <>
          <motion.div className="absolute -left-6 top-24 hidden animate-float rounded-xl border border-border glass px-4 py-3 lg:block" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}>
            <p className="text-[11px] text-muted-foreground">LCP</p>
            <p className="font-display text-lg font-semibold text-success">1.8 s</p>
          </motion.div>
          <motion.div className="absolute -right-5 bottom-16 hidden animate-float rounded-xl border border-border glass px-4 py-3 [animation-delay:1.5s] lg:block" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}>
            <p className="text-[11px] text-muted-foreground">Issues fixed</p>
            <p className="font-display text-lg font-semibold">12 / 15</p>
          </motion.div>
        </>
      )}
    </div>
  );
}
