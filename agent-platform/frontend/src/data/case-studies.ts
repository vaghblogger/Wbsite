export type CaseStudy = {
  slug: string;
  title: string;
  industry: string;
  problem: string;
  solution: string;
  result: string;
  metric: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "healthcare-front-desk-automation",
    title: "Healthcare front desk automation",
    industry: "Healthcare",
    problem:
      "The clinic team was spending most of the day answering repetitive questions and manually booking appointments.",
    solution:
      "We deployed a role-based AI front desk with calendar synchronization, quick triage flows, and escalation rules.",
    result:
      "The staff reduced repetitive call load and could focus on in-clinic coordination and patient support.",
    metric: "42% faster booking turnaround",
  },
  {
    slug: "b2b-support-workflow-orchestration",
    title: "B2B support workflow orchestration",
    industry: "B2B SaaS",
    problem:
      "Support requests were fragmented across chat, email, and CRM, causing delayed handoffs and missed follow-ups.",
    solution:
      "We implemented an AI-assisted workflow that classifies requests, updates CRM records, and triggers owner actions.",
    result:
      "Escalations became predictable and support teams maintained SLA compliance with fewer manual routing steps.",
    metric: "31% reduction in manual follow-up operations",
  },
  {
    slug: "analytics-reporting-acceleration",
    title: "Analytics reporting acceleration",
    industry: "Growth and operations",
    problem:
      "Leaders waited days for consolidated reports from multiple tools, slowing weekly decision-making.",
    solution:
      "We built an AI data pipeline that aggregates metrics, summarizes anomalies, and drafts executive-ready insights.",
    result:
      "Teams reviewed performance faster and launched experiments with a tighter weekly execution cycle.",
    metric: "Weekly reporting reduced from days to minutes",
  },
];

export function getCaseStudy(slug: string): CaseStudy | null {
  return CASE_STUDIES.find((study) => study.slug === slug) ?? null;
}
