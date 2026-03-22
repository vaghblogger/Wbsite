export type ShowcaseScenario = {
  id: string;
  label: string;
  description: string;
};

export type ShowcaseDemoKey =
  | "workflow"
  | "doc-processing"
  | "analytics-insights"
  | "integrations-blueprint"
  | "strategy-roadmap";

export type ServiceShowcaseConfig = {
  slug: string;
  title: string;
  highLevelSummary: string;
  interactionHint: string;
  demoKey: ShowcaseDemoKey;
  defaultScenarioId: string;
  scenarios: ShowcaseScenario[];
  ctaLabel?: string;
};

export const SERVICE_SHOWCASES_BY_SLUG: Record<string, ServiceShowcaseConfig> = {
  "workflow-automation": {
    slug: "workflow-automation",
    title: "Workflow Automation Demo",
    highLevelSummary:
      "Explore end-to-end automation patterns for customer operations and AI receptionist workflows.",
    interactionHint: "Choose a workflow, then press Play demo.",
    demoKey: "workflow",
    defaultScenarioId: "marketing-automation",
    ctaLabel: "Book a strategy call",
    scenarios: [
      {
        id: "marketing-automation",
        label: "Marketing Workflow",
        description: "Lead and customer request orchestration across CRM/support tools.",
      },
      {
        id: "ai-receptionist",
        label: "AI Receptionist",
        description: "Inbound call/message handling, appointments, and escalation.",
      },
    ],
  },
  "document-data-processing": {
    slug: "document-data-processing",
    title: "Document Pipeline Studio",
    highLevelSummary:
      "See how raw documents become clean, structured records with extraction, validation, and sync.",
    interactionHint: "Pick a document type and play the pipeline.",
    demoKey: "doc-processing",
    defaultScenarioId: "invoice",
    ctaLabel: "Discuss your use case",
    scenarios: [
      {
        id: "invoice",
        label: "Invoice",
        description: "Extract supplier, totals, tax, and due date from invoice PDFs.",
      },
      {
        id: "kyc-form",
        label: "KYC Form",
        description: "Parse identity fields and validation status from onboarding forms.",
      },
      {
        id: "contract",
        label: "Contract",
        description: "Classify clauses and key entities from legal agreements.",
      },
    ],
  },
  "analytics-insights": {
    slug: "analytics-insights",
    title: "Insights Control Room",
    highLevelSummary:
      "Watch analytics signals turn into prioritized recommendations and next-best actions.",
    interactionHint: "Set a scenario and timeframe, then run insight generation.",
    demoKey: "analytics-insights",
    defaultScenarioId: "revenue-pulse",
    ctaLabel: "Explore possibilities",
    scenarios: [
      {
        id: "revenue-pulse",
        label: "Revenue Pulse",
        description: "Monitor trends, drops, and opportunities in top-line performance.",
      },
      {
        id: "support-health",
        label: "Support Health",
        description: "Track backlog, response quality, and escalation pressure.",
      },
      {
        id: "funnel-conversion",
        label: "Funnel Conversion",
        description: "Analyze conversion steps and identify bottlenecks.",
      },
    ],
  },
  "integrations-custom": {
    slug: "integrations-custom",
    title: "Integration Blueprint Builder",
    highLevelSummary:
      "Preview how AI connects with your stack across CRM, helpdesk, data stores, and internal systems.",
    interactionHint: "Switch blueprint type and play deployment phases.",
    demoKey: "integrations-blueprint",
    defaultScenarioId: "support-ops",
    ctaLabel: "Book a strategy call",
    scenarios: [
      {
        id: "support-ops",
        label: "Support Operations",
        description: "Helpdesk + CRM + knowledge workflows with human handoff.",
      },
      {
        id: "sales-ops",
        label: "Sales Operations",
        description: "Lead qualification, CRM updates, and engagement automations.",
      },
      {
        id: "internal-copilot",
        label: "Internal Copilot",
        description: "Knowledge and workflow assistant across internal teams.",
      },
    ],
  },
  "strategy-roadmapping": {
    slug: "strategy-roadmapping",
    title: "AI Roadmap Planner",
    highLevelSummary:
      "Visualize how AI initiatives move from discovery to pilot, scale, and governance.",
    interactionHint: "Choose a company profile and play the phased roadmap.",
    demoKey: "strategy-roadmap",
    defaultScenarioId: "mid-market",
    ctaLabel: "Book Free AI Strategy Call",
    scenarios: [
      {
        id: "early-stage",
        label: "Early Stage",
        description: "Fast-validation roadmap with tight team and lean budget.",
      },
      {
        id: "mid-market",
        label: "Mid-Market",
        description: "Balanced roadmap with measurable wins and scalability planning.",
      },
      {
        id: "enterprise",
        label: "Enterprise",
        description: "Governance-first rollout across multiple functions and systems.",
      },
    ],
  },
};

export function getServiceShowcaseConfig(slug: string): ServiceShowcaseConfig | null {
  return SERVICE_SHOWCASES_BY_SLUG[slug] ?? null;
}

