import { createFileRoute, Link } from "@tanstack/react-router";
import { Gauge, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorNote, PageHeader, Panel, ScorePill, SkeletonRows } from "@/components/app-ui";
import { RunAuditForm } from "@/components/run-audit";
import { Button } from "@/components/ui/button";
import { useAudits, useDelete } from "@/lib/data";
import { hostOf } from "@/lib/scoring";

export const Route = createFileRoute("/_authenticated/audits/")({
  head: () => ({ meta: [{ title: "Audits — SitePilot" }] }),
  component: AuditsPage,
});

function AuditsPage() {
  const { data, isLoading, error } = useAudits();
  const del = useDelete("audits");
  return (
    <AppShell>
      <PageHeader title="Audits" description="Every audit you've run, newest first." />
      <Panel className="mb-6"><RunAuditForm /></Panel>
      <Panel>
        {error ? <ErrorNote message="Couldn't load audits." /> : isLoading ? <SkeletonRows /> : !data?.length ? (
          <EmptyState icon={Gauge} title="No audits yet" description="Enter a website above to run your first audit." />
        ) : (
          <div className="space-y-2">
            <div className="hidden grid-cols-[1fr_repeat(4,3.5rem)_2.5rem] gap-2 px-3 text-xs text-muted-foreground sm:grid"><span>Website</span><span>Perf</span><span>Access</span><span>SEO</span><span>Best</span><span /></div>
            {data.map((a) => (
              <div key={a.id} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm sm:grid-cols-[1fr_repeat(4,3.5rem)_2.5rem]">
                <Link to="/audits/$id" params={{ id: a.id }} className="min-w-0 hover:text-primary">
                  <p className="truncate font-mono">{hostOf(a.url)}</p>
                  <p className="text-xs text-muted-foreground">{a.strategy} · {new Date(a.created_at).toLocaleString()}</p>
                </Link>
                <span className="hidden sm:block"><ScorePill score={a.performance} /></span>
                <span className="hidden sm:block"><ScorePill score={a.accessibility} /></span>
                <span className="hidden sm:block"><ScorePill score={a.seo} /></span>
                <span className="hidden sm:block"><ScorePill score={a.best_practices} /></span>
                <Button size="icon" variant="ghost" aria-label="Delete audit" onClick={() => del.mutate(a.id, { onSuccess: () => toast.success("Audit deleted") })}><Trash2 className="size-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
