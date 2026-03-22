const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3001";
const FETCH_TIMEOUT_MS = 2500;

async function postJson<TResponse>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<TResponse | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${GATEWAY_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as TResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export type DocProcessingResponse = {
  steps: string[];
  extractedFields: Array<{ key: string; value: string }>;
  confidence: number;
  validationIssues: string[];
  finalPayloadPreview: string;
};

export type AnalyticsInsightsResponse = {
  kpis: Array<{ label: string; value: string; delta: string }>;
  signals: string[];
  insights: string[];
  recommendedActions: string[];
  riskFlags: string[];
};

export type IntegrationsBlueprintResponse = {
  systems: Array<{ name: string; role: string }>;
  connections: Array<{ from: string; to: string; protocol: string }>;
  implementationPhases: string[];
  riskNotes: string[];
  effortBand: string;
};

export type StrategyRoadmapResponse = {
  phases: Array<{ name: string; summary: string }>;
  milestones: string[];
  estimatedOutcomes: string[];
  riskMatrix: string[];
  next90DaysPlan: string[];
};

export function runDocProcessingShowcase(params: {
  scenarioId: string;
  sampleId: string;
  mode: "static" | "simulated" | "live";
}) {
  return postJson<DocProcessingResponse>("/api/showcase/doc-processing/run", params);
}

export function runAnalyticsInsightsShowcase(params: {
  scenarioId: string;
  timeframe: "7d" | "30d" | "90d";
  perturbation?: string;
}) {
  return postJson<AnalyticsInsightsResponse>("/api/showcase/analytics/insights", params);
}

export function runIntegrationsBlueprintShowcase(params: {
  scenarioId: string;
  stackInputs?: string[];
  complianceMode?: string;
}) {
  return postJson<IntegrationsBlueprintResponse>("/api/showcase/integrations/blueprint", params);
}

export function runStrategyRoadmapShowcase(params: {
  profile: string;
  constraints?: string[];
  priorities?: string[];
}) {
  return postJson<StrategyRoadmapResponse>("/api/showcase/strategy/roadmap", params);
}

