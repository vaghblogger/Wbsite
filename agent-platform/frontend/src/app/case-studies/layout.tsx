import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "See real-world AI automation outcomes from discovery through deployment and measurable business impact.",
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
