import type { Metadata } from "next";
import { getCaseStudy } from "@/data/case-studies";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    return {
      title: "Case Study",
      description: "Read how AI automation projects move from problem to measurable results.",
    };
  }

  return {
    title: study.title,
    description: `${study.problem} ${study.metric}`,
  };
}

export default function CaseStudyDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
