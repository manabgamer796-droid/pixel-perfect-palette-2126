/** Pure helpers shared by the app, reports and tests. */

export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withProto);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    const host = u.hostname;
    if (!host.includes(".") || host.endsWith(".")) return null;
    if (/^(localhost|127\.|10\.|192\.168\.|0\.)/.test(host)) return null;
    if (!/^[a-z0-9.-]+$/i.test(host)) return null;
    u.hash = "";
    let out = u.toString();
    if (u.pathname === "/" && !u.search) out = out.replace(/\/$/, "");
    return out;
  } catch {
    return null;
  }
}

export type ScoreBand = "good" | "average" | "poor" | "none";

/** Lighthouse bands: 90–100 good, 50–89 needs improvement, 0–49 poor. */
export function scoreBand(score: number | null | undefined): ScoreBand {
  if (score == null || Number.isNaN(score)) return "none";
  if (score >= 90) return "good";
  if (score >= 50) return "average";
  return "poor";
}

export const bandText: Record<ScoreBand, string> = {
  good: "text-success",
  average: "text-warning",
  poor: "text-destructive",
  none: "text-muted-foreground",
};
export const bandStroke: Record<ScoreBand, string> = {
  good: "stroke-success",
  average: "stroke-warning",
  poor: "stroke-destructive",
  none: "stroke-muted-foreground",
};
export const bandBg: Record<ScoreBand, string> = {
  good: "bg-success/12 text-success border-success/25",
  average: "bg-warning/12 text-warning border-warning/25",
  poor: "bg-destructive/12 text-destructive border-destructive/25",
  none: "bg-muted text-muted-foreground border-border",
};

export function bandLabel(b: ScoreBand) {
  return b === "good" ? "Good" : b === "average" ? "Needs work" : b === "poor" ? "Poor" : "N/A";
}

export function formatMs(ms: number | null | undefined): string {
  if (ms == null) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.round(ms)} ms`;
}

export function formatCls(v: number | null | undefined): string {
  if (v == null) return "—";
  return Number(v).toFixed(3);
}

/** Core Web Vitals thresholds (lab values). */
export function vitalBand(metric: "lcp" | "cls" | "tbt" | "fcp", v: number | null | undefined): ScoreBand {
  if (v == null) return "none";
  const t = { lcp: [2500, 4000], cls: [0.1, 0.25], tbt: [200, 600], fcp: [1800, 3000] }[metric];
  if (v <= t[0]) return "good";
  if (v <= t[1]) return "average";
  return "poor";
}

export function average(nums: (number | null | undefined)[]): number | null {
  const v = nums.filter((n): n is number => typeof n === "number");
  if (!v.length) return null;
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
