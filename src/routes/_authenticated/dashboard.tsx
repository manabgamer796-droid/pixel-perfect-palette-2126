import { createFileRoute, Link } from "@tanstack/react-router";
import { Gauge } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, PageHeader, Panel, ScorePill, SkeletonRows } from "@/components/app-ui";
import { ScoreRing } from "@/components/brand";
import { RunAuditForm } from "@/components/run-audit";
import { useSession } from "@/lib/auth";
import { useAudits, useClients, useWebsites } from "@/lib/data";
import { average, hostOf } from "@/lib/scoring";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SitePilot" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useSession();
  const { data: audits, isLoading } = useAudits();
  const { data: sites } = useWebsites();
  const { data: clients } = useClients();
  const recent = audits?.slice(0, 6) ?? [];
  return (
    <AppShell>
      <PageHeader title={`Welcome back${user?.email ? `, ${user.email.split("@")[0]}` : ""}`} description="Here's what's happening with your websites." />
      <Panel className="mb-6">
        <h2 className="mb-3 font-semibold">Run a new audit</h2>
        <RunAuditForm />
      </Panel>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[["Audits", audits?.length ?? 0], ["Websites", sites?.length ?? 0], ["Clients", clients?.length ?? 0]].map(([l, v]) => (
          <Panel key={l as string}><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 text-3xl font-semibold">{v}</p></Panel>
        ))}
        <Panel className="flex items-center justify-center"><ScoreRing score={average(audits?.map((a) => a.performance) ?? [])} size={70} label="Avg performance" /></Panel>
      </div>
      <Panel>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Recent audits</h2><Link to="/audits" className="text-sm text-primary">View all</Link></div>
        {isLoading ? <SkeletonRows /> : recent.length === 0 ? (
          <EmptyState icon={Gauge} title="No audits yet" description="Run your first audit above to see scores here." />
        ) : (
          <div className="space-y-2">
            {recent.map((a) => (
              <Link key={a.id} to="/audits/$id" params={{ id: a.id }} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-accent">
                <span className="truncate font-mono">{hostOf(a.url)} <span className="text-xs text-muted-foreground">· {a.strategy}</span></span>
                <span className="flex gap-1.5"><ScorePill score={a.performance} /><ScorePill score={a.seo} /></span>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
