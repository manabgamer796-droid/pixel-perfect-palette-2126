import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: "signup" } =>
    s["mode"] === "signup" ? { mode: "signup" } : {},
  head: () => ({
    meta: [
      { title: "Sign in — SitePilot" },
      { name: "description", content: "Sign in or create your SitePilot account." },
      { property: "og:title", content: "Sign in — SitePilot" },
      { property: "og:description", content: "Sign in or create your SitePilot account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [signup, setSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent): Promise<unknown> {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    setBusy(true);
    const res = signup
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/dashboard" } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    if (signup && !res.data.session) return toast.success("Check your email to confirm your account.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ambient px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-border glass p-7">
        <Logo />
        <h1 className="text-2xl font-semibold">{signup ? "Create your account" : "Welcome back"}</h1>
        <Input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button variant="hero" className="w-full" disabled={busy}>{busy ? "Please wait…" : signup ? "Sign up" : "Sign in"}</Button>
        <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setSignup(!signup)}>
          {signup ? "Have an account? Sign in" : "New here? Create an account"}
        </button>
      </form>
    </div>
  );
}
