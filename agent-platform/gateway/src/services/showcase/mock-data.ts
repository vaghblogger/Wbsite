export function getDocProcessingPayload(scenarioId: string) {
  if (scenarioId === "kyc-form") {
    return {
      steps: ["ingest", "ocr", "classify", "extract", "verify", "sync"],
      extractedFields: [
        { key: "Full Name", value: "Aanya Kapoor" },
        { key: "Document Type", value: "Passport" },
        { key: "DOB", value: "1992-08-14" },
        { key: "Address Match", value: "Verified" },
      ],
      confidence: 0.96,
      validationIssues: [],
      finalPayloadPreview: "KYC profile prepared for onboarding queue.",
    };
  }
  if (scenarioId === "contract") {
    return {
      steps: ["ingest", "ocr", "classify", "extract", "risk-check", "sync"],
      extractedFields: [
        { key: "Party A", value: "Acme Logistics" },
        { key: "Party B", value: "Northstar Retail" },
        { key: "Effective Date", value: "2026-02-01" },
        { key: "Renewal Clause", value: "Auto-renew (12 months)" },
      ],
      confidence: 0.91,
      validationIssues: ["Liability cap clause requires legal review."],
      finalPayloadPreview: "Contract summary sent to legal workflow.",
    };
  }
  return {
    steps: ["ingest", "ocr", "classify", "extract", "validate", "sync"],
    extractedFields: [
      { key: "Invoice #", value: "INV-2048" },
      { key: "Vendor", value: "BluePeak Supplies" },
      { key: "Total", value: "$12,480.00" },
      { key: "Due Date", value: "2026-04-08" },
    ],
    confidence: 0.94,
    validationIssues: [],
    finalPayloadPreview: "Invoice exported to AP queue + ERP sync.",
  };
}

export function getAnalyticsPayload(scenarioId: string, timeframe: string, perturbation?: string) {
  const signalTail = perturbation === "demand-drop" ? "Demand drop simulation active." : "Baseline scenario.";
  if (scenarioId === "support-health") {
    return {
      kpis: [
        { label: "Backlog", value: "1,248", delta: "+8.6%" },
        { label: "SLA Breach Risk", value: "13%", delta: "+2.4%" },
        { label: "Avg Resolution", value: "6.1h", delta: "+11.0%" },
      ],
      signals: ["Ticket inflow spikes after release days", signalTail],
      insights: ["Two queues account for most delay and escalations."],
      recommendedActions: ["Auto-route billing tickets to specialist team", "Add proactive status replies for known incidents"],
      riskFlags: [`${timeframe} trend suggests CSAT risk if backlog persists.`],
    };
  }
  if (scenarioId === "funnel-conversion") {
    return {
      kpis: [
        { label: "Lead->Demo", value: "24.1%", delta: "-3.2%" },
        { label: "Demo->Proposal", value: "47.6%", delta: "+1.8%" },
        { label: "Proposal->Close", value: "29.9%", delta: "-2.1%" },
      ],
      signals: ["Drop concentrated at checkout handoff", signalTail],
      insights: ["Response delay over 12h strongly correlates with drop-off."],
      recommendedActions: ["Introduce same-day follow-up automation", "Trigger rep assist on high-intent signals"],
      riskFlags: ["Pipeline velocity may decline next cycle without intervention."],
    };
  }
  return {
    kpis: [
      { label: "Revenue", value: "$412k", delta: "+5.2%" },
      { label: "Churn Risk", value: "8.4%", delta: "-1.1%" },
      { label: "Resolution Time", value: "5.2h", delta: "-9.0%" },
    ],
    signals: ["Checkout conversion dipped in APAC", signalTail],
    insights: ["Revenue softness is concentrated in a single high-volume segment."],
    recommendedActions: ["Launch checkout recovery for APAC traffic", "Prioritize enterprise ticket routing"],
    riskFlags: ["If unresolved for 2 weeks, churn risk may increase by 1.8%."],
  };
}

export function getIntegrationsPayload(scenarioId: string) {
  if (scenarioId === "sales-ops") {
    return {
      systems: [
        { name: "CRM", role: "Lead + opportunity source of truth" },
        { name: "Email Automation", role: "Nurture and follow-up journeys" },
        { name: "LLM Layer", role: "Qualification + message drafting" },
        { name: "Data Warehouse", role: "Performance and attribution reporting" },
      ],
      connections: [
        { from: "CRM", to: "LLM Layer", protocol: "API" },
        { from: "LLM Layer", to: "Email Automation", protocol: "Webhook" },
        { from: "CRM", to: "Data Warehouse", protocol: "ETL" },
      ],
      implementationPhases: ["Schema mapping", "Qualification logic rollout", "Journey automation testing", "Revenue attribution tuning"],
      riskNotes: ["Duplicate lead handling needs strict ID normalization."],
      effortBand: "5-7 weeks",
    };
  }
  if (scenarioId === "internal-copilot") {
    return {
      systems: [
        { name: "Knowledge Base", role: "Trusted source for retrieval" },
        { name: "Chat Interface", role: "Employee interaction surface" },
        { name: "LLM Layer", role: "Contextual answer + action planning" },
        { name: "Task Automation", role: "Execution and follow-through" },
      ],
      connections: [
        { from: "Knowledge Base", to: "LLM Layer", protocol: "RAG" },
        { from: "Chat Interface", to: "LLM Layer", protocol: "API" },
        { from: "LLM Layer", to: "Task Automation", protocol: "Event Bus" },
      ],
      implementationPhases: ["Knowledge ingestion", "Prompt/policy setup", "Copilot launch", "Governance + quality loop"],
      riskNotes: ["Source freshness policy required to avoid stale answers."],
      effortBand: "6-8 weeks",
    };
  }
  return {
    systems: [
      { name: "CRM", role: "Customer context source" },
      { name: "Helpdesk", role: "Ticket lifecycle + SLA routing" },
      { name: "LLM Layer", role: "Intent, summarization, and action generation" },
      { name: "Automation", role: "Workflow execution and orchestration" },
    ],
    connections: [
      { from: "CRM", to: "LLM Layer", protocol: "API" },
      { from: "Helpdesk", to: "Automation", protocol: "Webhook" },
      { from: "LLM Layer", to: "Automation", protocol: "Event Bus" },
    ],
    implementationPhases: [
      "Discovery and system inventory",
      "Connector setup and auth hardening",
      "Workflow testing in staging",
      "Production rollout and monitoring",
    ],
    riskNotes: ["Legacy API rate limits require queue buffering."],
    effortBand: "4-6 weeks",
  };
}

export function getStrategyPayload(profile: string) {
  if (profile === "early-stage") {
    return {
      phases: [
        { name: "Discover", summary: "Pick 1-2 high-leverage workflows with clear ROI." },
        { name: "Pilot", summary: "Deliver fast pilot for proof and team buy-in." },
        { name: "Scale", summary: "Replicate to adjacent workflows with standard patterns." },
        { name: "Govern", summary: "Introduce lightweight policy and quality controls." },
      ],
      milestones: ["Week 2: Use-case shortlist", "Week 4: Pilot launched", "Week 8: Scale plan ready"],
      estimatedOutcomes: ["10-18% time savings", "Faster customer response", "Lower manual overhead"],
      riskMatrix: ["Tool sprawl risk", "Prompt quality drift", "Limited integration capacity"],
      next90DaysPlan: ["Discovery sprint", "Pilot and KPI baseline", "Scale prep"],
    };
  }
  if (profile === "enterprise") {
    return {
      phases: [
        { name: "Discover", summary: "Cross-functional opportunity map + governance constraints." },
        { name: "Pilot", summary: "Controlled pilot in one business unit with auditability." },
        { name: "Scale", summary: "Platformized rollout across multiple units and systems." },
        { name: "Govern", summary: "Formal operating model with compliance and risk management." },
      ],
      milestones: ["Month 1: Governance baseline", "Month 2: Pilot signoff", "Month 4: Multi-BU rollout"],
      estimatedOutcomes: ["20-30% process acceleration", "Improved SLA compliance", "Reduced operational risk"],
      riskMatrix: ["Change management risk", "Data residency constraints", "Security review latency"],
      next90DaysPlan: ["Governance committee setup", "Pilot in one BU", "Platform enablement plan"],
    };
  }
  return {
    phases: [
      { name: "Discover", summary: "Audit opportunities, constraints, and expected outcomes." },
      { name: "Pilot", summary: "Ship one high-impact workflow with measurable KPIs." },
      { name: "Scale", summary: "Expand proven workflows across teams and systems." },
      { name: "Govern", summary: "Add controls, monitoring, and operating model." },
    ],
    milestones: [
      "Week 2: Prioritized use-case backlog",
      "Week 5: Pilot in production with baseline metrics",
      "Week 10: Multi-team rollout plan finalized",
    ],
    estimatedOutcomes: ["15-25% process time reduction", "Lower escalation volume", "Faster decision cycles"],
    riskMatrix: ["Data readiness risk", "Adoption risk", "Integration dependency risk"],
    next90DaysPlan: ["Discovery workshop", "Pilot implementation", "Governance handoff"],
  };
}

