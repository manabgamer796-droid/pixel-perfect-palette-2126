import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/marketing";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — SitePilot" },
      { name: "description", content: "The terms for using SitePilot." },
      { property: "og:title", content: "Terms of Service — SitePilot" },
      { property: "og:description", content: "The terms for using SitePilot." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-ambient">
      <SiteNav />
      <main className="mx-auto max-w-3xl space-y-4 px-5 pt-32 pb-20 text-muted-foreground">
        <h1 className="font-display text-4xl font-semibold text-foreground">Terms of Service</h1>
        <p>Only audit websites you own or have permission to test. Don't use SitePilot to overload or attack any site.</p>
        <p>Audit scores come from Google PageSpeed Insights and are provided as-is.</p>
        <p>We may update these terms; continued use means you accept the changes.</p>
      </main>
      <SiteFooter />
    </div>
  ),
});
