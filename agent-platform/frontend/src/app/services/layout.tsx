import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore AI chatbot, workflow automation, analytics, and integration services designed for measurable business outcomes.",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
