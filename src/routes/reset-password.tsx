import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Choose a new password — SitePilot" },
    { name: "description", content: "Set a new password for your SitePilot account." },
    { property: "og:title", content: "Choose a new password — SitePilot" },
    { property: "og:description", content: "Set a new password for your SitePilot account." },
  ] }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return void toast.error("Password must be at least 8 characters.");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return void toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  }
  return (
    <div className="grid min-h-screen place-items-center bg-ambient px-5">
      <div className="w-full max-w-sm rounded-2xl border border-border glass p-6">
        <Logo />
        <h1 className="mt-6 text-2xl font-semibold">Choose a new password</h1>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <Input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} required />
          <Button type="submit" variant="hero" className="w-full">Update password</Button>
        </form>
      </div>
    </div>
  );
}
