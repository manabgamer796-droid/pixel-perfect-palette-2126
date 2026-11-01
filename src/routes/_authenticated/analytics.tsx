import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { EmptyState, PageHeader, Panel, SkeletonRows } from "@/components/app-ui";
import { ScoreRing } from "@/components/brand";
import { useAudits } from "@/lib/data";
import { average, hostOf } from "@/lib/scoring";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — SitePilot" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data, isLoading } = useAudits();
  const hosts = useMemo(() => [...new Set((data ?? []).map((a) => hostOf(a.url)))], [data]);
  const [host, setHost] = useState("all");
  const list = (data ?? []).filter((a) => host === "all" || hostOf(a.url) === host);
  const series = [...list].reverse().map((a) => ({
    date: new Date(a.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    Performance: a.performance, SEO: a.seo, Accessibility: a.accessibility, "Best practices": a.best_practices,
  }));
  return (
    <AppShell>
      <PageHeader
        title="Analytics"
        description="How your scores change over time."
        actions={
          <select value={host} onChange={(e) => setHost(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All websites</option>
            {hosts.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        }
      />
      {isLoading ? <SkeletonRows /> : !list.length ? (
        <EmptyState icon={BarChart3} title="No data yet" description="Run a few audits to see trends here." />
      ) : (
        <>
          <Panel className="mb-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <ScoreRing score={average(list.map((a) => a.performance))} label="Avg performance" />
            <ScoreRing score={average(list.map((a) => a.accessibility))} label="Avg accessibility" />
            <ScoreRing score={average(list.map((a) => a.seo))} label="Avg SEO" />
            <ScoreRing score={average(list.map((a) => a.best_practices))} label="Avg best practices" />
          </Panel>
          <Panel>
            <h2 className="mb-4 font-semibold">Score trend</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="Performance" stroke="var(--chart-1)" strokeWidth={2} />
                  <Line type="monotone" dataKey="SEO" stroke="var(--chart-2)" strokeWidth={2} />
                  <Line type="monotone" dataKey="Accessibility" stroke="var(--chart-3)" strokeWidth={2} />
                  <Line type="monotone" dataKey="Best practices" stroke="var(--chart-4)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </>
      )}
    </AppShell>
  );
}
