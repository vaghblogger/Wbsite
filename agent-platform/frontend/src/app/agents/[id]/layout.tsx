import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

function humanizeSlug(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const title = id === "ai-front-desk" ? "AI Chatbots and Conversational AI" : humanizeSlug(id);

  return {
    title,
    description:
      "Interact with live AI agents, role presets, and workflow-aware chat experiences tailored to business operations.",
  };
}

export default function AgentDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
