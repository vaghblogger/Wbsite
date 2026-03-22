"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { CTA_TEXT, ctaBookHref } from "@/lib/cta";
import { trackEvent } from "@/lib/analytics";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/demo", label: "Demo" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/agents/ai-front-desk", label: "Agents" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-violet-500/20 blur-md transition-colors group-hover:bg-violet-500/30" />
            <div className="relative rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 p-2">
              <Cpu className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Vagh <span className="text-primary">Labs</span>
          </span>
        </Link>

        <Link
          href={ctaBookHref("navbar")}
          onClick={() => trackEvent("cta_click", { placement: "navbar_mobile" })}
          className="rounded-lg border border-primary/40 bg-primary/15 px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/25 md:hidden"
        >
          Book
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-lg bg-muted"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
          </nav>
          <Link
            href={ctaBookHref("navbar")}
            onClick={() => trackEvent("cta_click", { placement: "navbar_primary" })}
            className="rounded-lg border border-primary/40 bg-primary/15 px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/25"
          >
            {CTA_TEXT.primary}
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
