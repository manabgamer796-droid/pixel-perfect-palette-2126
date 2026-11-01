import { createFileRoute, Link } from "@tanstack/react-router";
import { Gauge, FileText, Users, Search, LineChart, ShieldCheck, ArrowRight } from "lucide-react";
import { DashboardPreview, SiteFooter, SiteNav } from "@/components/marketing";
import { Reveal } from "@/components/brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SitePilot — Website audits & reports for agencies" },
      { name: "description", content: "Run Google PageSpeed audits, track scores over time and send polished client reports from one dashboard." },
      { property: "og:title", content: "SitePilot — Your Website. Under Control." },
      { property: "og:description", content: "Website intelligence and audit reporting for modern agencies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Gauge, title: "Instant audits", text: "Performance, SEO, accessibility and best practices in one run." },
  { icon: LineChart, title: "Score history", text: "See every site improve over time with clear trend charts." },
  { icon: FileText, title: "Client reports", text: "Download clean PDF reports ready to send to clients." },
  { icon: Users, title: "Client workspace", text: "Group websites by client and keep everything organised." },
  { icon: Search, title: "Fix priorities", text: "Top opportunities sorted by the time they will save." },
  { icon: ShieldCheck, title: "Private by default", text: "Your data is only visible to your account." },
];

const steps = [
  ["Add a website", "Paste any public URL and pick mobile or desktop."],
  ["Run the audit", "We test it with Google PageSpeed in under a minute."],
  ["Share results", "Review the fixes and send a report to your client."],
];

const faqs = [
  ["Is there a free plan?", "Yes — you can start free and upgrade when you need more audits."],
  ["Where do the scores come from?", "All audits use Google PageSpeed Insights, the same engine as Lighthouse."],
  ["Can I audit client sites?", "Any publicly reachable website can be audited."],
];

function Index() {
  return (
    <div className="min-h-screen bg-ambient">
      <SiteNav />
      <main>
        <section id="product" className="mx-auto grid max-w-7xl items-center gap-14 px-5 pt-32 pb-20 sm:px-8 lg:grid-cols-2 lg:pt-40">
          <Reveal>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Website intelligence for agencies</span>
            <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
              Your Website. <span className="text-gradient-brand">Under Control.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Audit any site, track its scores and hand clients a report they understand — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/auth" search={{ mode: "signup" }}>Get started free <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg"><Link to="/pricing">See pricing</Link></Button>
            </div>
          </Reveal>
          <Reveal delay={0.15}><DashboardPreview /></Reveal>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Reveal><h2 className="font-display text-3xl font-semibold sm:text-4xl">Everything you need to keep sites healthy</h2></Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="h-full rounded-2xl border border-border bg-card/60 p-6">
                  <f.icon className="size-6 text-primary" />
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Reveal><h2 className="font-display text-3xl font-semibold sm:text-4xl">How it works</h2></Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.08}>
                <div className="rounded-2xl border border-border bg-card/60 p-6">
                  <span className="font-mono text-sm text-primary">0{i + 1}</span>
                  <h3 className="mt-3 font-semibold">{t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
          <h2 className="font-display text-3xl font-semibold">Questions</h2>
          <div className="mt-8 space-y-3">
            {faqs.map(([q, a]) => (
              <details key={q} className="rounded-xl border border-border bg-card/60 p-5">
                <summary className="cursor-pointer font-medium">{q}</summary>
                <p className="mt-3 text-sm text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
