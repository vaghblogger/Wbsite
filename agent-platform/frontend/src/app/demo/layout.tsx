import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "Try live AI chatbot, workflow, and use-case simulation demos to evaluate your automation opportunities.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
