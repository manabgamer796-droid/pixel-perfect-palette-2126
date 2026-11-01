import { createFileRoute } from "@tanstack/react-router";
import { Globe, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState, PageHeader, Panel, ScorePill, SkeletonRows } from "@/components/app-ui";
import { RunAuditForm } from "@/components/run-audit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { friendlyDbError, useAudits, useClients, useDelete, useUpsert, useWebsites, type Website } from "@/lib/data";
import { normalizeUrl } from "@/lib/scoring";

export const Route = createFileRoute("/_authenticated/websites")({
  head: () => ({ meta: [{ title: "My Websites — SitePilot" }] }),
  component: WebsitesPage,
});

function WebsitesPage() {
  const { data, isLoading } = useWebsites();
  const { data: audits } = useAudits();
  const { data: clients } = useClients();
  const del = useDelete("websites");
  const [edit, setEdit] = useState<Website | "new" | null>(null);
  const [auditing, setAuditing] = useState<Website | null>(null);
  return (
    <AppShell>
      <PageHeader title="My Websites" description="Sites you track regularly." actions={<Button variant="hero" onClick={() => setEdit("new")}><Plus className="size-4" /> Add website</Button>} />
      <Panel>
        {isLoading ? <SkeletonRows /> : !data?.length ? (
          <EmptyState icon={Globe} title="No websites yet" description="Add a website to track its scores over time." action={<Button variant="hero" onClick={() => setEdit("new")}>Add website</Button>} />
        ) : (
          <div className="space-y-2">
            {data.map((w) => {
              const last = audits?.find((a) => a.website_id === w.id);
              const client = clients?.find((c) => c.id === w.client_id);
              return (
                <div key={w.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{w.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">{w.url}{client && ` · ${client.name}`}</p>
                  </div>
                  <ScorePill score={last?.performance} />
                  <Button size="sm" variant="outline" onClick={() => setAuditing(w)}>Audit</Button>
                  <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEdit(w)}><Pencil className="size-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => del.mutate(w.id, { onSuccess: () => toast.success("Website removed") })}><Trash2 className="size-4" /></Button>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
      {edit && <WebsiteDialog site={edit === "new" ? null : edit} onClose={() => setEdit(null)} />}
      <Dialog open={!!auditing} onOpenChange={(o) => !o && setAuditing(null)}>
        <DialogContent><DialogHeader><DialogTitle>Audit {auditing?.name}</DialogTitle></DialogHeader>{auditing && <RunAuditForm defaultUrl={auditing.url} websiteId={auditing.id} />}</DialogContent>
      </Dialog>
    </AppShell>
  );
}

function WebsiteDialog({ site, onClose }: { site: Website | null; onClose: () => void }) {
  const [name, setName] = useState(site?.name ?? "");
  const [url, setUrl] = useState(site?.url ?? "");
  const [clientId, setClientId] = useState(site?.client_id ?? "");
  const { data: clients } = useClients();
  const save = useUpsert("websites");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = normalizeUrl(url);
    if (!u) return void toast.error("Please enter a valid public URL.");
    save.mutate(
      { id: site?.id, values: { name: name.trim(), url: u, client_id: clientId || null } },
      { onSuccess: () => { toast.success("Saved"); onClose(); }, onError: (e) => toast.error(friendlyDbError(e.message)) },
    );
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{site ? "Edit website" : "Add website"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          <Input placeholder="example.com" value={url} onChange={(e) => setUrl(e.target.value)} required maxLength={500} />
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="">No client</option>
            {clients?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Button type="submit" variant="hero" className="w-full" disabled={save.isPending}>Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
