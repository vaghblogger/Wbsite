import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Share your automation goals and current stack. We respond quickly with practical next steps.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
