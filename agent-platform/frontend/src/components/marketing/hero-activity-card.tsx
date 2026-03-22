"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const ACTIVITIES: string[] = [
  "WhatsApp lead captured",
  "Appointment scheduled",
  "Customer question answered",
  "CRM updated",
  "Invoice generated",
  "Lead qualified and routed",
  "Meeting room booked",
  "Support ticket resolved",
  "Follow-up email sent",
  "Calendar event created",
  "Contact synced to CRM",
  "Payment reminder sent",
  "Quote generated",
  "Order status updated",
  "Feedback request sent",
  "Demo scheduled",
  "Document processed",
  "Form submission received",
  "Visitor checked in",
  "Room service order placed",
  "Spa booking confirmed",
  "Password reset completed",
  "Account verified",
  "Refund processed",
  "Shipping notification sent",
  "Inventory updated",
  "Price quote sent",
  "Contract signed",
  "NDA sent for signature",
  "Interview scheduled",
  "Candidate moved to next round",
  "Offer letter sent",
  "Onboarding task completed",
  "Training module assigned",
  "Timesheet submitted",
  "Expense approved",
  "PTO request approved",
  "IT ticket resolved",
  "Device provisioned",
  "Access granted",
  "Knowledge base article updated",
  "FAQ suggestion added",
  "Chat handoff to human",
  "Sentiment flagged positive",
  "Urgent ticket escalated",
  "SLA reminder triggered",
  "Recurring meeting set",
  "Webinar registration confirmed",
  "Waitlist spot opened",
  "Subscription renewed",
  "Trial extended",
  "Upgrade completed",
  "Downgrade processed",
  "API key issued",
  "Webhook delivered",
  "Data export completed",
  "Report generated",
  "Dashboard refreshed",
  "Alert acknowledged",
  "Anomaly detected and logged",
  "Backup verified",
  "Sync completed",
  "Duplicate merged",
  "Record archived",
  "Bulk update applied",
  "Import finished",
  "Export queued",
  "Template applied",
  "Workflow triggered",
  "Approval chain completed",
  "Reminder scheduled",
  "Recurring task created",
  "Project milestone updated",
  "Budget alert sent",
  "Vendor invoice matched",
  "Purchase order sent",
  "Delivery confirmed",
  "Return initiated",
  "Warranty registered",
  "Review request sent",
  "Loyalty points awarded",
  "Coupon applied",
  "Cart abandoned follow-up sent",
  "Wishlist item back in stock",
  "Price drop alert sent",
  "Reorder suggestion sent",
  "Survey response received",
  "NPS score recorded",
  "Referral link shared",
  "Affiliate commission calculated",
  "Campaign performance logged",
  "A/B test variant assigned",
  "Conversion tracked",
  "Session recorded",
  "Heatmap data captured",
  "Bot handoff completed",
  "Intent classified",
  "Entity extracted",
  "Translation requested",
  "Summary generated",
  "Next best action suggested",
  "Churn risk score updated",
  "Upsell opportunity flagged",
  "Cross-sell recommendation sent",
  "Reactivation email sent",
  "Win-back campaign triggered",
  "Feedback loop closed",
  "Bug report triaged",
  "Feature request logged",
  "Beta invite sent",
  "Release notes published",
  "Changelog updated",
  "Status page updated",
  "Outage notification sent",
  "Maintenance window scheduled",
  "Certificate renewed",
  "Domain verified",
  "SSL provisioned",
];

const VISIBLE_COUNT = 7;
const ROTATE_INTERVAL_MIN = 1800;
const ROTATE_INTERVAL_MAX = 3500;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function HeroActivityCard() {
  const [items, setItems] = useState<{ id: string; text: string }[]>(() =>
    Array.from({ length: VISIBLE_COUNT }, (_, i) => ({
      id: getRandomId(),
      text: ACTIVITIES[i % ACTIVITIES.length],
    }))
  );

  const rotate = useCallback(() => {
    setItems((prev) => {
      const next = pickRandom(ACTIVITIES);
      return [...prev.slice(1), { id: getRandomId(), text: next }];
    });
  }, []);

  useEffect(() => {
    const t = setInterval(
      rotate,
      ROTATE_INTERVAL_MIN +
        Math.random() * (ROTATE_INTERVAL_MAX - ROTATE_INTERVAL_MIN)
    );
    return () => clearInterval(t);
  }, [rotate]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative w-full max-w-md sm:max-w-lg"
    >
      {/* Glow behind card */}
      <div
        className="absolute -inset-px rounded-2xl bg-gradient-to-b from-violet-500/25 to-transparent opacity-70 blur-2xl"
        aria-hidden
      />
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="relative rounded-2xl border border-white/10 bg-zinc-900/90 p-6 shadow-xl shadow-violet-950/20 backdrop-blur sm:p-8"
      >
        {/* Live header */}
        <div className="mb-5 flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">
            Live
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Activity stream
          </span>
        </div>
        {/* Rotating log lines: new task appended at end, others move up */}
        <ul className="space-y-2.5 min-h-[11rem]">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map(({ id, text }, index) => {
              const isNew = index === items.length - 1;
              return (
                <motion.li
                  key={id}
                  layout
                  initial={isNew ? { opacity: 0, y: 16 } : false}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundColor: isNew
                      ? ["rgba(139, 92, 246, 0.12)", "rgba(139, 92, 246, 0.04)", "transparent"]
                      : "transparent",
                  }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                  transition={
                    isNew
                      ? {
                          opacity: { duration: 0.3 },
                          y: { type: "spring", stiffness: 400, damping: 30 },
                          backgroundColor: {
                            duration: 1.2,
                            times: [0, 0.4, 1],
                          },
                        }
                      : { duration: 0.25 }
                  }
                  className="flex items-center gap-3 rounded-lg px-2 py-1 -mx-2 text-sm text-muted-foreground overflow-hidden"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/25 text-violet-400">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="truncate">{text}</span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
        <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground/70">
          Updates every few seconds
        </p>
      </motion.div>
    </motion.div>
  );
}
