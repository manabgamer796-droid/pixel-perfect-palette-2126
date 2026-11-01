import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [
    { title: "Reset your password — SitePilot" },
    { name: "description", content: "Get a link to reset your SitePilot password." },
    { property: "og:title", content: "Reset your password — SitePilot" },
    { property: "og:description", content: "Get a link to reset your SitePilot password." },
  ] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) return void toast.error(error.message);
    setSent(true);
  }
  return (
    <div className="grid min-h-screen place-items-center bg-ambient px-5">
      <div className="w-full max-w-sm rounded-2xl border border-border glass p-6">
        <Logo />
        <h1 className="mt-6 text-2xl font-semibold">Forgot password</h1>
        {sent ? <p className="mt-4 text-sm text-muted-foreground">Check your email for a reset link.</p> : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" variant="hero" className="w-full">Send reset link</Button>
          </form>
        )}
        <Link to="/auth" className="mt-4 block text-sm text-primary">Back to sign in</Link>
      </div>
    </div>
  );
}
