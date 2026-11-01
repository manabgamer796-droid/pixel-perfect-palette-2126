import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Panel } from "@/components/app-ui";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({ meta: [{ title: "Help — SitePilot" }] }),
  component: HelpPage,
});

const faqs = [
  ["How do I run an audit?", "Type a website address on the Overview or Audits page, choose mobile or desktop, and press Run audit. It takes up to a minute."],
  ["What do the colours mean?", "Green (90–100) is good, amber (50–89) needs work, red (0–49) is poor."],
  ["What are LCP, CLS and TBT?", "LCP is how fast the main content shows, CLS is how much the page jumps around, and TBT is how long the page is frozen while loading."],
  ["How do I send a report to a client?", "Open Reports or any audit and press Download PDF, then email the file."],
  ["Why did my audit fail?", "The site must be public and reachable. If many audits fail, the shared Google quota may be used up — try again later."],
];

function HelpPage() {
  return (
    <AppShell>
      <PageHeader title="Help" description="Answers to common questions." />
      <Panel className="max-w-3xl space-y-3">
        {faqs.map(([q, a]) => (
          <details key={q} className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-medium">{q}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
        <p className="pt-2 text-sm text-muted-foreground">Still stuck? Email <a className="text-primary" href="mailto:hello@sitepilot.app">hello@sitepilot.app</a>.</p>
      </Panel>
    </AppShell>
  );
}
