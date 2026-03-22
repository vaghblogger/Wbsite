"use client";

import { MarketingWorkflowExplorer } from "./marketing-workflow-explorer";
import { DocProcessingDemo } from "./doc-processing-demo";
import { AnalyticsInsightsDemo } from "./analytics-insights-demo";
import { IntegrationsBlueprintDemo } from "./integrations-blueprint-demo";
import { StrategyRoadmapDemo } from "./strategy-roadmap-demo";
import type { ServiceShowcaseConfig } from "@/data/service-showcases";

export function ServiceShowcaseRenderer({ config }: { config: ServiceShowcaseConfig }) {
  switch (config.demoKey) {
    case "workflow":
      return <MarketingWorkflowExplorer />;
    case "doc-processing":
      return <DocProcessingDemo config={config} />;
    case "analytics-insights":
      return <AnalyticsInsightsDemo config={config} />;
    case "integrations-blueprint":
      return <IntegrationsBlueprintDemo config={config} />;
    case "strategy-roadmap":
      return <StrategyRoadmapDemo config={config} />;
    default:
      return null;
  }
}

