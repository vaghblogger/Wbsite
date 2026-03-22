import Link from "next/link";
import { Cpu } from "lucide-react";
import { CTA_TEXT, ctaBookHref } from "@/lib/cta";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background/80">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 p-1.5">
              <Cpu className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Vagh <span className="text-primary">Labs</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">AI solutions that drive growth.</p>
            <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
              <Link href="/services" className="hover:text-foreground">
                Services
              </Link>
              <Link href="/demo" className="hover:text-foreground">
                Demo
              </Link>
              <Link href="/case-studies" className="hover:text-foreground">
                Case studies
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </div>
            <Link
              href={ctaBookHref("footer")}
              className="rounded-lg border border-primary/35 bg-primary/10 px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/20"
            >
              {CTA_TEXT.primary}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
