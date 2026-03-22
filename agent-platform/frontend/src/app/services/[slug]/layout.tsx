import type { Metadata } from "next";
import { getServiceDetail } from "@/data/core-services";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceDetail(slug);

  if (!service) {
    return {
      title: "Service",
      description: "Explore AI services tailored to your business goals.",
    };
  }

  return {
    title: service.title,
    description: service.description,
  };
}

export default function ServiceDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
