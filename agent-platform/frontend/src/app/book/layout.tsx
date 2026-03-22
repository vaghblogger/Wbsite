import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an AI Strategy Call",
  description:
    "Book a 30 or 60 minute AI strategy session tailored to your workflows, integrations, and growth goals.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
