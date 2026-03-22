export type CoreServiceCard = {
  title: string;
  description: string;
  href: string;
  icon: string;
};

export type ServiceDetail = {
  title: string;
  description: string;
  bullets?: string[];
  demoCtaLabel: string;
  demoCtaHref: string;
};

export const CORE_SERVICE_CARDS: CoreServiceCard[] = [
  {
    title: "AI Chatbots & Conversational AI",
    description:
      "Custom AI Chatbots & Conversational AI for support, sales, front desk, and engagement—including 24/7 AI receptionists—that feel human and scale.",
    href: "/agents/ai-front-desk",
    icon: "message-circle",
  },
  {
    title: "Workflow & Process Automation",
    description:
      "Automate repetitive tasks and connect your tools with AI-driven workflows so nothing falls through the cracks.",
    href: "/services/workflow-automation",
    icon: "workflow",
  },
  {
    title: "Intelligent Document & Data Processing",
    description:
      "Extract, classify, and summarize from documents and data—cut manual entry and errors.",
    href: "/services/document-data-processing",
    icon: "file-text",
  },
  {
    title: "AI-Powered Analytics & Insights",
    description:
      "Surface actionable insights from your data with reporting, forecasting, and recommendations.",
    href: "/services/analytics-insights",
    icon: "bar-chart-3",
  },
  {
    title: "AI Integrations & Custom Solutions",
    description:
      "Integrate AI into your CRM, helpdesk, and internal tools with APIs and tailored builds.",
    href: "/services/integrations-custom",
    icon: "plug",
  },
  {
    title: "AI Strategy & Roadmapping",
    description:
      "From discovery to rollout: prioritize use cases, choose the right AI, and implement with a clear roadmap.",
    href: "/services/strategy-roadmapping",
    icon: "map",
  },
];

const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  "ai-chatbots": {
    title: "AI Chatbots & Conversational AI",
    description:
      "We build custom AI Chatbots & Conversational AI that handle support, sales, and front-desk interactions—including 24/7 AI receptionists—so your team can focus on strategy. Our solutions feel human, scale instantly, and integrate with your existing tools.",
    bullets: [
      "Support and FAQ that resolve common issues and escalate when needed",
      "AI receptionists for appointment booking, lead capture, and after-hours coverage",
      "Sales and engagement bots that qualify leads and book demos",
      "Multi-channel deployment: web, WhatsApp, voice, and more",
    ],
    demoCtaLabel: "See AI agents in action",
    demoCtaHref: "/agents/ai-front-desk",
  },
  "workflow-automation": {
    title: "Workflow & Process Automation",
    description:
      "Connect your apps and automate repetitive workflows with AI in the loop. We design and implement flows that trigger on events, process data, and keep your operations running smoothly—so nothing falls through the cracks.",
    bullets: [
      "Event-driven automation across CRM, helpdesk, and internal tools",
      "AI-assisted routing, classification, and response drafting",
      "Scheduled and on-demand workflows for reports and syncs",
      "Built on proven platforms with custom logic where you need it",
    ],
    demoCtaLabel: "Book a free AI strategy call",
    demoCtaHref: "/book?source=service-workflow-automation",
  },
  "document-data-processing": {
    title: "Intelligent Document & Data Processing",
    description:
      "Extract, classify, and summarize from documents and unstructured data. Reduce manual data entry, cut errors, and speed up processing for invoices, forms, tickets, and more.",
    bullets: [
      "Document extraction and classification (invoices, forms, contracts)",
      "Structured data from emails and tickets for CRM and helpdesk",
      "Summarization and key-point extraction for long content",
      "Custom pipelines tuned to your formats and workflows",
    ],
    demoCtaLabel: "Discuss your use case",
    demoCtaHref: "/book?source=service-document-data-processing",
  },
  "analytics-insights": {
    title: "AI-Powered Analytics & Insights",
    description:
      "Turn your data into actionable insights with AI-driven reporting, forecasting, and recommendations. Surface what matters so you can make faster, better decisions.",
    bullets: [
      "Automated reporting and dashboards that stay up to date",
      "Forecasting and trend detection for planning and ops",
      "Natural-language queries over your data",
      "Alerts and recommendations when metrics move",
    ],
    demoCtaLabel: "Book a free AI strategy call",
    demoCtaHref: "/book?source=service-analytics-insights",
  },
  "integrations-custom": {
    title: "AI Integrations & Custom Solutions",
    description:
      "We integrate AI into your existing stack—CRM, helpdesk, internal tools—with APIs and tailored agent builds. Get the power of AI where you already work, without a full rip-and-replace.",
    bullets: [
      "API integrations for LLMs and agents into your products",
      "Custom agents and workflows for CRM, support, and ops",
      "Embeddings and search for knowledge bases and docs",
      "Ongoing support and iteration as your needs evolve",
    ],
    demoCtaLabel: "Book a free AI strategy call",
    demoCtaHref: "/book?source=service-integrations-custom",
  },
  "strategy-roadmapping": {
    title: "AI Strategy & Roadmapping",
    description:
      "From discovery to rollout: we help you prioritize use cases, choose the right AI and tools, and implement with a clear roadmap. Start with a free strategy call to align on goals and next steps.",
    bullets: [
      "Discovery workshops to map pain points and opportunities",
      "Prioritized roadmap: quick wins and longer-term initiatives",
      "Vendor and build-vs-buy guidance",
      "Implementation support and change management",
    ],
    demoCtaLabel: "Book a free AI strategy call",
    demoCtaHref: "/book?source=service-strategy-roadmapping",
  },
};

export function getServiceDetail(slug: string): ServiceDetail | null {
  return SERVICE_DETAILS[slug] ?? null;
}

export const SERVICE_SLUGS = Object.keys(SERVICE_DETAILS);
