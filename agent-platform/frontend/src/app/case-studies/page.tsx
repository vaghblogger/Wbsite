import Link from "next/link";
import { CASE_STUDIES } from "@/data/case-studies";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CaseStudiesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.14em] text-primary">Case studies</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
          Problem to solution to measurable result.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
          A snapshot of outcomes delivered with conversational AI, workflow orchestration, and
          integration-first automation.
        </p>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CASE_STUDIES.map((study) => (
          <article key={study.slug} className="surface-elevated rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-primary">{study.industry}</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{study.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{study.metric}</p>
            <Link
              href={`/case-studies/${study.slug}`}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-5 inline-flex")}
            >
              Read case study
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
