import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ErrorNote, PageHeader, Panel, SkeletonRows } from "@/components/app-ui";
import { ScoreRing } from "@/components/brand";
import { RunAuditForm } from "@/components/run-audit";
import { Button } from "@/components/ui/button";
import { useAudit, type Opportunity } from "@/lib/data";
import { downloadAuditPdf } from "@/lib/pdf";
import { bandText, formatCls, formatMs, hostOf, vitalBand } from "@/lib/scoring";

export const Route = createFileRoute("/_authenticated/audits/$id")({
  head: () => ({ meta: [{ title: "Audit results — SitePilot" }] }),
  component: AuditPage,
});

function AuditPage() {
  const { id } = Route.useParams();
  const { data: a, isLoading, error } = useAudit(id);
  if (isLoading) return <AppShell><SkeletonRows rows={6} /></AppShell>;
  if (error || !a) return <AppShell><ErrorNote message="This audit couldn't be found." /></AppShell>;
  const opps = (a.opportunities as unknown as Opportunity[]) ?? [];
  const diags = (a.diagnostics as unknown as Opportunity[]) ?? [];
  const vitals = [
    ["LCP", formatMs(a.lcp_ms), vitalBand("lcp", a.lcp_ms)],
    ["CLS", formatCls(a.cls), vitalBand("cls", a.cls)],
    ["TBT", formatMs(a.tbt_ms), vitalBand("tbt", a.tbt_ms)],
    ["FCP", formatMs(a.fcp_ms), vitalBand("fcp", a.fcp_ms)],
    ["Speed Index", formatMs(a.si_ms), "none"],
  ] as const;
  return (
    <AppShell>
      <Link to="/audits" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> All audits</Link>
      <PageHeader
        title={hostOf(a.url)}
        description={`${a.strategy} · ${new Date(a.created_at).toLocaleString()}`}
        actions={<Button variant="hero" onClick={() => downloadAuditPdf(a)}><Download className="size-4" /> Download PDF</Button>}
      />
      <Panel className="mb-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <ScoreRing score={a.performance} label="Performance" />
        <ScoreRing score={a.accessibility} label="Accessibility" />
        <ScoreRing score={a.seo} label="SEO" />
        <ScoreRing score={a.best_practices} label="Best practices" />
      </Panel>
      <Panel className="mb-6">
        <h2 className="mb-4 font-semibold">Core metrics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {vitals.map(([l, v, b]) => (
            <div key={l} className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">{l}</p><p className={`mt-1 text-xl font-semibold ${bandText[b]}`}>{v}</p></div>
          ))}
        </div>
      </Panel>
      <IssueList title="Top opportunities" items={opps} empty="No big speed opportunities found — nice work." />
      <IssueList title="Diagnostics" items={diags} empty="No diagnostics flagged." />
      <Panel><h2 className="mb-3 font-semibold">Re-run this audit</h2><RunAuditForm defaultUrl={a.url} websiteId={a.website_id ?? undefined} /></Panel>
    </AppShell>
  );
}

function IssueList({ title, items, empty }: { title: string; items: Opportunity[]; empty: string }) {
  return (
    <Panel className="mb-6">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {!items.length ? <p className="text-sm text-muted-foreground">{empty}</p> : (
        <div className="space-y-2">
          {items.map((o) => (
            <details key={o.id} className="rounded-lg border border-border p-3">
              <summary className="cursor-pointer text-sm font-medium">{o.title}{o.displayValue && <span className="ml-2 text-xs text-warning">{o.displayValue}</span>}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{o.description.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")}</p>
            </details>
          ))}
        </div>
      )}
    </Panel>
  );
}
