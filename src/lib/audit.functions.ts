import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizeUrl } from "./scoring";

const Input = z.object({
  url: z.string().min(3).max(500),
  strategy: z.enum(["mobile", "desktop"]),
  websiteId: z.string().uuid().nullable().optional(),
});

type Lhr = {
  categories?: Record<string, { score: number | null }>;
  audits?: Record<
    string,
    {
      id: string;
      title: string;
      description?: string;
      score: number | null;
      scoreDisplayMode?: string;
      displayValue?: string;
      numericValue?: number;
      details?: { type?: string; overallSavingsMs?: number };
    }
  >;
};

export type AuditResult =
  | { ok: true; auditId: string }
  | { ok: false; error: string; kind: "config" | "invalid" | "upstream" | "db" };

const pct = (s: number | null | undefined) => (s == null ? null : Math.round(s * 100));

export const runAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }): Promise<AuditResult> => {
    const url = normalizeUrl(data.url);
    if (!url) return { ok: false, kind: "invalid", error: "Please enter a valid public website URL." };

    const key = process.env["PAGESPEED_API_KEY"];
    const qs = new URLSearchParams({ url, strategy: data.strategy });
    for (const c of ["performance", "accessibility", "seo", "best-practices"]) qs.append("category", c);
    if (key) qs.set("key", key);

    let json: { lighthouseResult?: Lhr; loadingExperience?: unknown; error?: { message?: string; code?: number } };
    try {
      const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${qs}`);
      json = await res.json();
      if (!res.ok || json.error) {
        const code = json.error?.code ?? res.status;
        console.error("PSI error", code, json.error?.message);
        if (code === 429)
          return {
            ok: false,
            kind: "config",
            error: key
              ? "The PageSpeed API quota was reached. Please try again later."
              : "The shared PageSpeed quota is exhausted. Add a PageSpeed API key to run audits reliably.",
          };
        if (code === 400 || code === 500)
          return { ok: false, kind: "upstream", error: "Google couldn't load this page. Check the URL is reachable and try again." };
        return { ok: false, kind: "upstream", error: "The PageSpeed service is unavailable right now." };
      }
    } catch (e) {
      console.error(e);
      return { ok: false, kind: "upstream", error: "Couldn't reach the PageSpeed service." };
    }

    const lhr = json.lighthouseResult ?? {};
    const cats = lhr.categories ?? {};
    const audits = lhr.audits ?? {};
    const num = (id: string) => audits[id]?.numericValue ?? null;

    const all = Object.values(audits);
    const opportunities = all
      .filter((a) => a.details?.type === "opportunity" && (a.score ?? 1) < 0.9)
      .sort((a, b) => (b.details?.overallSavingsMs ?? 0) - (a.details?.overallSavingsMs ?? 0))
      .slice(0, 12)
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: (a.description ?? "").slice(0, 600),
        displayValue: a.displayValue ?? null,
        savingsMs: a.details?.overallSavingsMs ?? null,
        score: a.score,
      }));
    const diagnostics = all
      .filter(
        (a) =>
          a.details?.type !== "opportunity" &&
          a.score !== null &&
          a.score < 0.9 &&
          (a.scoreDisplayMode === "binary" || a.scoreDisplayMode === "numeric" || a.scoreDisplayMode === "metricSavings"),
      )
      .slice(0, 20)
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: (a.description ?? "").slice(0, 600),
        displayValue: a.displayValue ?? null,
        score: a.score,
      }));

    const { data: row, error } = await context.supabase
      .from("audits")
      .insert({
        user_id: context.userId,
        website_id: data.websiteId ?? null,
        url,
        strategy: data.strategy,
        performance: pct(cats["performance"]?.score),
        accessibility: pct(cats["accessibility"]?.score),
        seo: pct(cats["seo"]?.score),
        best_practices: pct(cats["best-practices"]?.score),
        lcp_ms: num("largest-contentful-paint"),
        cls: num("cumulative-layout-shift"),
        tbt_ms: num("total-blocking-time"),
        fcp_ms: num("first-contentful-paint"),
        si_ms: num("speed-index"),
        field_data: (json.loadingExperience as never) ?? null,
        opportunities: opportunities as never,
        diagnostics: diagnostics as never,
      })
      .select("id")
      .single();
    if (error || !row) {
      console.error(error);
      return { ok: false, kind: "db", error: "The audit ran but couldn't be saved. Please try again." };
    }
    return { ok: true, auditId: row.id };
  });
