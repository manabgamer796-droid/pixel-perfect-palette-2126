import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { EmptyState, PageHeader, Panel, SkeletonRows } from "@/components/app-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { friendlyDbError, useClients, useDelete, useUpsert, useWebsites, type Client } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/clients")({
  head: () => ({ meta: [{ title: "Clients — SitePilot" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const { data, isLoading } = useClients();
  const { data: sites } = useWebsites();
  const del = useDelete("clients");
  const [edit, setEdit] = useState<Client | "new" | null>(null);
  return (
    <AppShell>
      <PageHeader title="Clients" description="The people and businesses you work for." actions={<Button variant="hero" onClick={() => setEdit("new")}><Plus className="size-4" /> Add client</Button>} />
      <Panel>
        {isLoading ? <SkeletonRows /> : !data?.length ? (
          <EmptyState icon={Users} title="No clients yet" description="Add a client, then link their websites." action={<Button variant="hero" onClick={() => setEdit("new")}>Add client</Button>} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.map((c) => (
              <div key={c.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{c.name}</p>
                    {c.business_name && <p className="text-sm text-muted-foreground">{c.business_name}</p>}
                  </div>
                  <div className="flex">
                    <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEdit(c)}><Pencil className="size-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => del.mutate(c.id, { onSuccess: () => toast.success("Client removed") })}><Trash2 className="size-4" /></Button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{[c.email, c.phone].filter(Boolean).join(" · ")}</p>
                <p className="mt-2 text-xs">{sites?.filter((s) => s.client_id === c.id).length ?? 0} websites</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
      {edit && <ClientDialog client={edit === "new" ? null : edit} onClose={() => setEdit(null)} />}
    </AppShell>
  );
}

function ClientDialog({ client, onClose }: { client: Client | null; onClose: () => void }) {
  const [f, setF] = useState({ name: client?.name ?? "", business_name: client?.business_name ?? "", email: client?.email ?? "", phone: client?.phone ?? "", notes: client?.notes ?? "" });
  const save = useUpsert("clients");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const values = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim() || null]));
    save.mutate({ id: client?.id, values }, { onSuccess: () => { toast.success("Saved"); onClose(); }, onError: (e) => toast.error(friendlyDbError(e.message)) });
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{client ? "Edit client" : "Add client"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Name" value={f.name} onChange={set("name")} required maxLength={100} />
          <Input placeholder="Business name" value={f.business_name} onChange={set("business_name")} maxLength={100} />
          <Input type="email" placeholder="Email" value={f.email} onChange={set("email")} maxLength={255} />
          <Input placeholder="Phone" value={f.phone} onChange={set("phone")} maxLength={40} />
          <Textarea placeholder="Notes" value={f.notes} onChange={set("notes")} maxLength={2000} />
          <Button type="submit" variant="hero" className="w-full" disabled={save.isPending}>Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
