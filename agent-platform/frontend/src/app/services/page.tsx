import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CoreServiceCard } from "@/components/marketing/core-service-card";
import { CORE_SERVICE_CARDS } from "@/data/core-services";

export default function ServicesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.14em] text-primary">Services</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
          End-to-end AI services for support, operations, and growth.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Choose the starting point that matches your bottleneck today, then expand into
          deeper automation as results compound.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CORE_SERVICE_CARDS.map((card, index) => (
          <CoreServiceCard
            key={card.href}
            title={card.title}
            description={card.description}
            href={card.href}
            icon={card.icon}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
