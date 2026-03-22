import type { MetadataRoute } from "next";
import { SERVICE_SLUGS } from "@/data/core-services";
import { CASE_STUDIES } from "@/data/case-studies";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vaghlabs.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/services", "/demo", "/case-studies", "/contact", "/book", "/agents/ai-front-desk"];

  const serviceRoutes = SERVICE_SLUGS.map((slug) => `/services/${slug}`);
  const caseStudyRoutes = CASE_STUDIES.map((study) => `/case-studies/${study.slug}`);

  return [...staticRoutes, ...serviceRoutes, ...caseStudyRoutes].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
