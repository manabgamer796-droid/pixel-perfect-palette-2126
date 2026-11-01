import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/marketing";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SitePilot" },
      { name: "description", content: "How SitePilot collects, uses and protects your data." },
      { property: "og:title", content: "Privacy Policy — SitePilot" },
      { property: "og:description", content: "How SitePilot collects, uses and protects your data." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-ambient">
      <SiteNav />
      <main className="mx-auto max-w-3xl space-y-4 px-5 pt-32 pb-20 text-muted-foreground">
        <h1 className="font-display text-4xl font-semibold text-foreground">Privacy Policy</h1>
        <p>We store your account details, the websites you add and the audit results you run, so we can show them back to you.</p>
        <p>Website URLs are sent to Google PageSpeed Insights to perform audits. We never sell your data.</p>
        <p>You can delete your websites, clients and audits at any time. Contact hello@sitepilot.app with questions.</p>
      </main>
      <SiteFooter />
    </div>
  ),
});
