import type { Audit, Opportunity } from "./data";
import { bandLabel, formatCls, formatMs, hostOf, scoreBand } from "./scoring";

export async function downloadAuditPdf(a: Audit) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(20);
  doc.text("SitePilot Audit Report", 14, y);
  y += 10;
  doc.setFontSize(11);
  doc.text(`${a.url}`, 14, y);
  y += 6;
  doc.text(`${a.strategy} · ${new Date(a.created_at).toLocaleString()}`, 14, y);
  y += 12;
  doc.setFontSize(14);
  doc.text("Scores", 14, y);
  y += 8;
  doc.setFontSize(11);
  for (const [l, s] of [["Performance", a.performance], ["Accessibility", a.accessibility], ["SEO", a.seo], ["Best practices", a.best_practices]] as const) {
    doc.text(`${l}: ${s ?? "—"} (${bandLabel(scoreBand(s))})`, 14, y);
    y += 6;
  }
  y += 6;
  doc.setFontSize(14);
  doc.text("Core metrics", 14, y);
  y += 8;
  doc.setFontSize(11);
  for (const [l, v] of [["Largest Contentful Paint", formatMs(a.lcp_ms)], ["Cumulative Layout Shift", formatCls(a.cls)], ["Total Blocking Time", formatMs(a.tbt_ms)], ["First Contentful Paint", formatMs(a.fcp_ms)], ["Speed Index", formatMs(a.si_ms)]]) {
    doc.text(`${l}: ${v}`, 14, y);
    y += 6;
  }
  const opps = (a.opportunities as unknown as Opportunity[]) ?? [];
  if (opps.length) {
    y += 6;
    doc.setFontSize(14);
    doc.text("Top opportunities", 14, y);
    y += 8;
    doc.setFontSize(10);
    for (const o of opps) {
      if (y > 275) { doc.addPage(); y = 20; }
      const line = doc.splitTextToSize(`• ${o.title}${o.displayValue ? ` — ${o.displayValue}` : ""}`, 180);
      doc.text(line, 14, y);
      y += line.length * 5 + 2;
    }
  }
  doc.save(`sitepilot-${hostOf(a.url)}-${a.created_at.slice(0, 10)}.pdf`);
}
