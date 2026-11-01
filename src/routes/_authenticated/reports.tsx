import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, PageHeader, Panel, ScorePill, SkeletonRows } from "@/components/app-ui";
import { Button } from "@/components/ui/button";
import { useAudits } from "@/lib/data";
import { downloadAuditPdf } from "@/lib/pdf";
import { hostOf } from "@/lib/scoring";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — SitePilot" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data, isLoading } = useAudits();
  return (
    <AppShell>
      <PageHeader title="Reports" description="Download a client-ready PDF for any audit." />
      <Panel>
        {isLoading ? <SkeletonRows /> : !data?.length ? (
          <EmptyState icon={FileText} title="No reports yet" description="Reports appear here once you run an audit." action={<Button asChild variant="hero"><Link to="/audits">Run an audit</Link></Button>} />
        ) : (
          <div className="space-y-2">
            {data.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                <FileText className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{hostOf(a.url)} report</p>
                  <p className="text-xs text-muted-foreground">{a.strategy} · {new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <ScorePill score={a.performance} />
                <Button size="sm" variant="outline" onClick={() => downloadAuditPdf(a)}><Download className="size-4" /> PDF</Button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
