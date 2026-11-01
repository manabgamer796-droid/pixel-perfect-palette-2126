import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { runAudit } from "@/lib/audit.functions";
import { useWebsites } from "@/lib/data";

export function RunAuditForm({ defaultUrl = "", websiteId }: { defaultUrl?: string; websiteId?: string }) {
  const [url, setUrl] = useState(defaultUrl);
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [busy, setBusy] = useState(false);
  const run = useServerFn(runAudit);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: sites } = useWebsites();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const match = websiteId ?? sites?.find((s) => s.url.replace(/\/$/, "") === url.trim().replace(/\/$/, ""))?.id ?? null;
      const r = await run({ data: { url, strategy, websiteId: match } });
      if (!r.ok) { toast.error(r.error); return; }
      qc.invalidateQueries({ queryKey: ["audits"] });
      toast.success("Audit complete");
      navigate({ to: "/audits/$id", params: { id: r.auditId } });
    } catch {
      toast.error("Something went wrong running the audit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="example.com" required className="h-11 flex-1" aria-label="Website URL" />
      <div className="flex rounded-lg border border-border p-1">
        {(["mobile", "desktop"] as const).map((s) => (
          <button key={s} type="button" onClick={() => setStrategy(s)} className={`rounded-md px-3 text-sm capitalize ${strategy === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{s}</button>
        ))}
      </div>
      <Button type="submit" variant="hero" className="h-11" disabled={busy}>
        {busy ? <><Loader2 className="size-4 animate-spin" /> Auditing… (up to 60s)</> : "Run audit"}
      </Button>
    </form>
  );
}
