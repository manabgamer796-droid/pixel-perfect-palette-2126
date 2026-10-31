import { createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useSession, useSignOut } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SitePilot" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useSession();
  const signOut = useSignOut();
  return (
    <div className="min-h-screen bg-ambient px-5 py-8 sm:px-10">
      <div className="flex items-center justify-between">
        <Logo to="/dashboard" />
        <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
      </div>
      <h1 className="mt-12 text-3xl font-semibold">Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}</h1>
      <p className="mt-2 text-muted-foreground">Here's what's happening with your websites.</p>
    </div>
  );
}
