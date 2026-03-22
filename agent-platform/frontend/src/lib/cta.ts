export const CTA_TEXT = {
  primary: "Book a free AI strategy call",
  secondary: "See AI agents in action",
  contextual: "Discuss your use case",
} as const;

export const CTA_BOOK_PATH = "/book";

export type CtaSource =
  | "hero"
  | "navbar"
  | "footer"
  | "service"
  | "workflow"
  | "agent"
  | "chatbot"
  | "contact"
  | "book-section";

export function ctaBookHref(source: CtaSource, extra?: Record<string, string>): string {
  const params = new URLSearchParams({
    source,
    ...(extra ?? {}),
  });
  return `${CTA_BOOK_PATH}?${params.toString()}`;
}
