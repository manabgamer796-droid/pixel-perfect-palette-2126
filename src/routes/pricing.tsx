import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/marketing";
import { PricingPlans } from "@/components/pricing-plans";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — SitePilot" },
      { name: "description", content: "Simple plans for freelancers and agencies: Starter, Professional and Agency." },
      { property: "og:title", content: "Pricing — SitePilot" },
      { property: "og:description", content: "Simple plans for freelancers and agencies." },
    ],
  }),
  component: () => (
    <div className="bg-ambient">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8">
        <h1 className="mb-12 text-center text-4xl font-semibold sm:text-5xl">Simple, honest pricing</h1>
        <PricingPlans />
      </main>
      <SiteFooter />
    </div>
  ),
});
