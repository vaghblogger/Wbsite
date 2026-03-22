"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ctaBookHref } from "@/lib/cta";
import { trackEvent } from "@/lib/analytics";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [timeline, setTimeline] = useState("");
  const [useCase, setUseCase] = useState("");
  const [stack, setStack] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, company, timeline, useCase, stack, message }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!data.ok) throw new Error(data.message || "Unable to submit right now.");
      setSuccess(true);
      trackEvent("contact_form_submit_success", {
        source: "contact-page",
        timeline: timeline || "unspecified",
        use_case: useCase || "unspecified",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit right now.");
      trackEvent("contact_form_submit_error", { source: "contact-page" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Contact us</h1>
      <p className="mt-2 text-muted-foreground">
        Share your use case, current tools, and timeline. We usually respond within one business day.
      </p>

      <form onSubmit={onSubmit} className="glass-card mt-8 space-y-4 rounded-2xl p-5 sm:p-7">
        <label htmlFor="name" className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Full name</span>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
          />
        </label>
        <label htmlFor="email" className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Work email</span>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.com"
            required
          />
        </label>
        <label htmlFor="company" className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Company</span>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Inc. (optional)"
          />
        </label>
        <label htmlFor="timeline" className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Desired timeline</span>
          <select
            id="timeline"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select timeline (optional)</option>
            <option value="this-month">This month</option>
            <option value="next-quarter">Next quarter</option>
            <option value="exploring">Just exploring</option>
          </select>
        </label>
        <label htmlFor="use-case" className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Primary use case</span>
          <select
            id="use-case"
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select use case (optional)</option>
            <option value="chatbot">AI chatbot or receptionist</option>
            <option value="workflow">Workflow automation</option>
            <option value="analytics">Analytics and insights</option>
            <option value="custom">Custom integrations</option>
          </select>
        </label>
        <label htmlFor="stack" className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Current stack</span>
          <Input
            id="stack"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            placeholder="HubSpot, Gmail, Sheets, Slack..."
          />
        </label>
        <label htmlFor="message" className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Project details</span>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What would you like to automate or improve?"
            className="min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </label>
        <button type="submit" disabled={loading} className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full")}>
          {loading ? "Sending..." : "Send message"}
        </button>
        {success ? <p className="text-sm text-emerald-500">Message sent. We will reply soon.</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </form>

      <div className="glass-card mt-5 rounded-xl p-4 text-sm text-muted-foreground">
        Need a faster path for this week?
        <Link href={ctaBookHref("contact")} className="ml-1 text-primary hover:text-primary/85">
          Book a call now.
        </Link>
      </div>
    </section>
  );
}
