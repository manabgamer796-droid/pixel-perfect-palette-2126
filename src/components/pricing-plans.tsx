import { Link } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { Reveal } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const plans = [
  { id: "starter", name: "Starter", price: 9, blurb: "For freelancers getting started with audits.", features: ["5 websites", "50 audits / month", "PDF reports", "Client CRM"] },
  { id: "professional", name: "Professional", price: 19, blurb: "For busy freelancers and small studios.", features: ["25 websites", "300 audits / month", "Branded PDF reports", "Analytics & trends"], featured: true },
  { id: "agency", name: "Agency", price: 49, blurb: "For agencies managing many clients.", features: ["Unlimited websites", "Unlimited audits", "Priority support", "Team seats (soon)"] },
] as const;

const matrix: [string, (string | boolean)[]][] = [
  ["Websites", ["5", "25", "Unlimited"]],
  ["Audits per month", ["50", "300", "Unlimited"]],
  ["Desktop & mobile audits", [true, true, true]],
  ["Client management", [true, true, true]],
  ["PDF & print reports", [true, true, true]],
  ["Analytics & trends", [false, true, true]],
  ["Priority support", [false, false, true]],
];

export function PricingPlans() {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <div className={cn("relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1", "featured" in p && p.featured ? "border-primary/50 bg-elevated/70 shadow-glow" : "border-border glass hover:shadow-lift")}>
              {"featured" in p && p.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold text-primary-foreground">Most popular</span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-semibold">${p.price}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="size-4 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant={"featured" in p && p.featured ? "hero" : "outline"} className="mt-8 w-full">
                <Link to="/auth" search={{ mode: "signup" }}>Start with {p.name}</Link>
              </Button>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Billing isn't active yet — every new account starts on Starter at no charge while we're in early access.</p>
      <Reveal className="mt-14 overflow-x-auto rounded-2xl border border-border glass">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-4 font-medium text-muted-foreground">Compare plans</th>
              {plans.map((p) => (
                <th key={p.id} className="p-4 text-center font-semibold">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map(([row, vals]) => (
              <tr key={row} className="border-b border-border last:border-0">
                <td className="p-4 text-muted-foreground">{row}</td>
                {vals.map((v, i) => (
                  <td key={i} className="p-4 text-center">
                    {v === true ? <Check className="mx-auto size-4 text-success" aria-label="Included" /> : v === false ? <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label="Not included" /> : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </>
  );
}
