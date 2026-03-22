import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCaseStudy } from "@/data/case-studies";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6">
      <Link
        href="/case-studies"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to case studies
      </Link>

      <header>
        <p className="text-xs uppercase tracking-[0.14em] text-primary">{study.industry}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">{study.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{study.metric}</p>
      </header>

      <section className="mt-8 space-y-6">
        <div className="surface-elevated rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground">Problem</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">{study.problem}</p>
        </div>
        <div className="surface-elevated rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground">Solution</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">{study.solution}</p>
        </div>
        <div className="surface-elevated rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground">Result</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">{study.result}</p>
        </div>
      </section>
    </article>
  );
}
