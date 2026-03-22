import Link from "next/link";
import { MessageSquare, Route, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ctaBookHref } from "@/lib/cta";

const demoItems = [
  {
    title: "Live chatbot demo",
    description:
      "Talk to the AI front desk and test real conversational flows for qualification, booking, and support.",
    href: "/agents/ai-front-desk",
    cta: "Open chatbot demo",
    icon: MessageSquare,
  },
  {
    title: "Workflow demo",
    description:
      "Explore automation flows that orchestrate tools, data, and AI decisions across your stack.",
    href: "/services/workflow-automation",
    cta: "Open workflow demo",
    icon: Route,
  },
  {
    title: "Use-case simulator",
    description:
      "Try preloaded scenarios for document extraction, analytics insights, and integration blueprints.",
    href: "/services/document-data-processing",
    cta: "Open scenario demos",
    icon: Sparkles,
  },
];

export default function DemoPage() {
  const promptIdeas = [
    "Book a consultation for next Tuesday afternoon",
    "Show me a workflow for onboarding new leads",
    "Summarize this week’s support performance and suggest actions",
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.14em] text-primary">Demo</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
          Test the AI experience before you book a call.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Start with one of the guided demos below. Each one includes realistic prompts and
          interactive feedback so you can evaluate response quality quickly.
        </p>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {demoItems.map((item) => (
          <article key={item.title} className="surface-elevated rounded-2xl p-6">
            <div className="inline-flex rounded-xl bg-primary/10 p-2 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            <Link href={item.href} className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex")}>
              {item.cta}
            </Link>
          </article>
        ))}
      </div>

      <div className="glass-card mt-8 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-primary">Suggested prompts</p>
        <ul className="mt-3 space-y-2">
          {promptIdeas.map((prompt) => (
            <li key={prompt} className="rounded-lg border border-border/70 bg-card/40 px-3 py-2 text-sm text-muted-foreground">
              {prompt}
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card mt-8 rounded-2xl p-6">
        <h2 className="font-display text-xl font-semibold text-foreground">Ready to map this to your stack?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Share your current tools and goals in a focused call, or send your requirements by email.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={ctaBookHref("workflow")} className={cn(buttonVariants({ size: "lg" }), "inline-flex")}>
            Book a strategy call
          </Link>
          <Link href="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "inline-flex")}>
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
