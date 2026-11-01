import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Panel } from "@/components/app-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { usePrefs, useProfile } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — SitePilot" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const { data: profile } = useProfile(user?.id);
  const { data: prefs } = usePrefs(user?.id);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [pw, setPw] = useState("");
  useEffect(() => { setName(profile?.full_name ?? ""); setCompany(profile?.company ?? ""); }, [profile]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: name.trim() || null, company: company.trim() || null });
    if (error) return void toast.error("Couldn't save your profile.");
    qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Profile saved");
  }
  async function togglePref(k: "audit_complete" | "weekly_summary" | "product_updates", v: boolean) {
    if (!user) return;
    const { error } = await supabase.from("notification_preferences").upsert({ user_id: user.id, ...(prefs ?? {}), [k]: v, updated_at: new Date().toISOString() });
    if (error) return void toast.error("Couldn't save preference.");
    qc.invalidateQueries({ queryKey: ["prefs"] });
  }
  async function changePw(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return void toast.error("Password must be at least 8 characters.");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return void toast.error(error.message);
    setPw("");
    toast.success("Password updated");
  }

  return (
    <AppShell>
      <PageHeader title="Settings" description={user?.email ?? ""} />
      <div className="grid max-w-2xl gap-6">
        <Panel>
          <h2 className="mb-4 font-semibold">Profile</h2>
          <form onSubmit={saveProfile} className="space-y-3">
            <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
            <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={100} />
            <Button type="submit" variant="hero">Save profile</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">Plan: <span className="capitalize text-foreground">{profile?.plan ?? "free"}</span></p>
        </Panel>
        <Panel>
          <h2 className="mb-4 font-semibold">Notifications</h2>
          {([["audit_complete", "Audit finished"], ["weekly_summary", "Weekly summary"], ["product_updates", "Product updates"]] as const).map(([k, l]) => (
            <label key={k} className="flex items-center justify-between py-2 text-sm">
              {l}
              <Switch checked={prefs?.[k] ?? k !== "product_updates"} onCheckedChange={(v) => togglePref(k, v)} />
            </label>
          ))}
        </Panel>
        <Panel>
          <h2 className="mb-4 font-semibold">Change password</h2>
          <form onSubmit={changePw} className="flex gap-2">
            <Input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <Button type="submit" variant="outline">Update</Button>
          </form>
        </Panel>
      </div>
    </AppShell>
  );
}
