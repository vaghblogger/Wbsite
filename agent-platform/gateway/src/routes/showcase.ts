import {
  getAnalyticsPayload,
  getDocProcessingPayload,
  getIntegrationsPayload,
  getStrategyPayload,
} from "../services/showcase/mock-data";

async function parseBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function handleDocProcessingShowcase(req: Request): Promise<Response> {
  const body = await parseBody(req);
  const scenarioId = String(body.scenarioId || "invoice");
  return Response.json(getDocProcessingPayload(scenarioId));
}

export async function handleAnalyticsInsightsShowcase(req: Request): Promise<Response> {
  const body = await parseBody(req);
  const scenarioId = String(body.scenarioId || "revenue-pulse");
  const timeframe = String(body.timeframe || "30d");
  const perturbation = String(body.perturbation || "");
  return Response.json(getAnalyticsPayload(scenarioId, timeframe, perturbation));
}

export async function handleIntegrationsBlueprintShowcase(req: Request): Promise<Response> {
  const body = await parseBody(req);
  const scenarioId = String(body.scenarioId || "support-ops");
  return Response.json(getIntegrationsPayload(scenarioId));
}

export async function handleStrategyRoadmapShowcase(req: Request): Promise<Response> {
  const body = await parseBody(req);
  const profile = String(body.profile || "mid-market");
  return Response.json(getStrategyPayload(profile));
}

