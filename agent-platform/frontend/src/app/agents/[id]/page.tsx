"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Users,
  Mail,
  Database,
  Search,
  FileText,
  BarChart3,
  Ticket,
  Globe,
  Sparkles,
  Eye,
  UserCheck,
  CalendarCheck,
  BookOpen,
  RefreshCw,
  ClipboardList,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import { PageTransition } from "@/components/layout/page-transition";
import { ChatInterface } from "@/components/chat/chat-interface";
import { SessionCalendar } from "@/components/chat/session-calendar";
import { RolePicker } from "@/components/agents/role-picker";
import { useAgent } from "@/hooks/use-agents";
import { useChat } from "@/hooks/use-chat";
import { useWorkflowEvents } from "@/hooks/use-workflow-events";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccentColor } from "@/lib/utils";
import type { AgentPresetRole } from "@/types";
import { LogoGrid, type LogoItem } from "@/components/marketing/credibility-section";
import {
  CHATBOT_INTEGRATION_ITEMS,
  type Item,
} from "@/components/marketing/tech-stack";

function isLogoItem(item: Item): item is LogoItem {
  return item.kind === "si" || item.kind === "img";
}

function pickLogoItemsFrom(source: Item[], names: string[]): LogoItem[] {
  const byName = new Map<string, LogoItem>();
  for (const item of source) {
    if (!isLogoItem(item)) continue;
    const name = item.kind === "si" ? item.icon.title : item.alt;
    if (!byName.has(name)) byName.set(name, item);
  }
  const out: LogoItem[] = [];
  for (const name of names) {
    const item = byName.get(name);
    if (item) out.push(item);
  }
  return out;
}

/** Group 1: Natural chatbot channels — where users talk to the bot. */
const CHATBOT_CHANNEL_GROUPS: { title: string; names: string[] }[] = [
  { title: "Messaging", names: ["WhatsApp", "Telegram", "Discord", "LINE"] },
];

/** Group 2: Supporting integrations — power workflows & data (may or may not apply to every bot). */
const CHATBOT_SUPPORTING_GROUPS: { title: string; names: string[] }[] = [
  {
    title: "Email",
    names: ["Gmail", "Mailgun", "Proton Mail", "Brevo", "Mailchimp"],
  },
  {
    title: "Data & storage",
    names: [
      "Google Sheets",
      "Google Drive",
      "Airtable",
      "Notion",
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Redis",
      "Supabase",
    ],
  },
  { title: "Productivity", names: ["Trello", "Google Calendar", "Todoist", "Pushbullet"] },
  { title: "Sales & CRM", names: ["HubSpot", "Zendesk", "Intercom", "Zoho"] },
  { title: "Finance & commerce", names: ["Stripe", "Shopify"] },
  { title: "Developer tools", names: ["GitHub", "Jira", "Linear"] },
];

const toolIconMap: Record<string, React.ElementType> = {
  calendar: Calendar,
  crm: Users,
  email: Mail,
  knowledge_base: Database,
  order_tracker: BarChart3,
  ticketing: Ticket,
  lead_scorer: Sparkles,
  web_search: Globe,
  document_reader: FileText,
  summarizer: Search,
  identify_client: UserCheck,
  check_availability: CalendarCheck,
  list_available_slots: Calendar,
  book_appointment: BookOpen,
  sync_calendar: RefreshCw,
  update_crm_record: ClipboardList,
  get_client_appointments: Calendar,
  update_appointment: RefreshCw,
  cancel_appointment: Ticket,
  create_ticket: ScrollText,
  log_interaction: FileText,
};

const toolLabels: Record<string, string> = {
  calendar: "Calendar",
  crm: "CRM",
  email: "Email",
  knowledge_base: "Knowledge Base",
  order_tracker: "Order Tracker",
  ticketing: "Ticketing",
  lead_scorer: "Lead Scorer",
  web_search: "Web Search",
  document_reader: "Document Reader",
  summarizer: "Summarizer",
  identify_client: "Identify Client",
  check_availability: "Check Availability",
  list_available_slots: "Browse Slots",
  book_appointment: "Book Appointment",
  sync_calendar: "Sync Calendar",
  update_crm_record: "Update CRM",
  get_client_appointments: "Get Appointments",
  update_appointment: "Update Appointment",
  cancel_appointment: "Cancel Appointment",
  create_ticket: "Create Ticket",
  log_interaction: "Log Interaction",
};

/** Calendar sidebar + slot picker when preset opts in (or legacy Eye playbook). */
const showBookingCalendar = (role: AgentPresetRole | null) => {
  if (!role?.prompt_config) return false;
  const pc = role.prompt_config as Record<string, string>;
  if (String(pc.show_booking_calendar).toLowerCase() === "true")
    return true;
  return pc.playbook === "vision_eye_clinic";
};

/** Open booking UI when user clearly wants book / reschedule / slots. */
const BOOKING_INTENT =
  /book|appointment|reschedul|re-schedul|slot|availab|cleaning|visit|upcoming|cancel|move my|change my|different day|which date|pick a time|schedule a meeting|my upcoming|show my appointments/i;

/** Close booking shortcuts for info / routing flows (not scheduling). */
const NON_BOOKING_INTENT =
  /hours|where are you|location|address|job opportunit|careers|find a person|looking for someone|delivery|package|visitor|check-in|insurance plans|office hours|what services|what do you offer|job inquir|corporate visitor/i;

export default function AgentDetailPage() {
  const params = useParams();
  const slug = params.id as string;
  const { agent, loading } = useAgent(slug);

  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [activeRole, setActiveRole] = useState<AgentPresetRole | null>(null);
  const [bookingToolsOpen, setBookingToolsOpen] = useState(false);

  const hasRoles = agent?.preset_roles && agent.preset_roles.length > 0;

  const chatAgentName = activeRole
    ? activeRole.prompt_config?.assistant_name || activeRole.label
    : agent?.name || "Agent";

  const { messages, isStreaming, send, clear, setOverrides, injectWelcome } =
    useChat(slug, sessionId);

  const sendWithBookingIntent = useCallback(
    (text: string) => {
      const t = text.trim();
      if (BOOKING_INTENT.test(t)) setBookingToolsOpen(true);
      else if (NON_BOOKING_INTENT.test(t) && !BOOKING_INTENT.test(t))
        setBookingToolsOpen(false);
      send(text);
    },
    [send]
  );

  const clearChat = useCallback(() => {
    clear();
    setBookingToolsOpen(false);
  }, [clear]);

  const bookingCalendar = showBookingCalendar(activeRole);
  const showBookingShortcuts =
    bookingCalendar &&
    String(
      (activeRole?.prompt_config as Record<string, string> | undefined)
        ?.show_booking_shortcuts ?? "true"
    ).toLowerCase() !== "false";
  useEffect(() => {
    if (!bookingCalendar) setBookingToolsOpen(false);
  }, [bookingCalendar]);
  const calendarRefresh = messages.filter((m) => m.role === "assistant").length;
  const { calendarTick, calendarMergePhone } = useWorkflowEvents(sessionId);

  useEffect(() => {
    if (hasRoles && !activeRole) {
      const first = agent!.preset_roles![0];
      setActiveRole(first);
      setOverrides({
        prompt_config: first.prompt_config,
        instructions: first.instructions,
        restrictions: first.restrictions,
        agent_kind: agent!.agent_kind || "configurable_front_desk",
      });
      if (first.welcome_message) {
        injectWelcome(first.welcome_message);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRoles, agent]);

  const handleRoleChange = useCallback(
    (role: AgentPresetRole) => {
      if (role.id === activeRole?.id) return;
      setActiveRole(role);
      setBookingToolsOpen(false);
      clear();
      const newSession = crypto.randomUUID();
      setSessionId(newSession);
      setOverrides({
        prompt_config: role.prompt_config,
        instructions: role.instructions,
        restrictions: role.restrictions,
        agent_kind: agent?.agent_kind || "configurable_front_desk",
      });
      if (role.welcome_message) {
        setTimeout(() => injectWelcome(role.welcome_message!), 100);
      }
    },
    [activeRole, agent, clear, setOverrides, injectWelcome]
  );

  const openBookingTools = useCallback(() => setBookingToolsOpen(true), []);
  const closeBookingTools = useCallback(() => setBookingToolsOpen(false), []);

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <Skeleton className="h-8 w-40 sm:w-48 mb-6" />
          <div className="flex gap-2 overflow-hidden mb-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 min-w-[140px] flex-1 rounded-xl shrink-0" />
            ))}
          </div>
          <Skeleton className="w-full min-h-[min(520px,78dvh)] rounded-xl" />
        </div>
      </PageTransition>
    );
  }

  if (!agent) {
    return (
      <PageTransition>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Agent Not Found</h1>
          <p className="text-muted-foreground mb-8 text-sm sm:text-base px-2">
            The agent you are looking for does not exist.
          </p>
          <Link
            href="/"
            className="text-violet-400 hover:text-violet-300 transition-colors text-sm sm:text-base"
          >
            Go back home
          </Link>
        </div>
      </PageTransition>
    );
  }

  const accent = activeRole
    ? getAccentColor(activeRole.accent)
    : getAccentColor(agent.accent_color);

  const displayName =
    slug === "ai-front-desk"
      ? "AI Chatbots and Conversational AI"
      : agent.name;

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Header — stacks on narrow screens */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 mb-5 sm:mb-6"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/#services"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 touch-manipulation py-2 -my-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Core Services
            </Link>
            <div className="h-4 w-px bg-zinc-700 shrink-0 hidden sm:block" />
            <h1 className="text-lg sm:text-2xl font-bold truncate">{displayName}</h1>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] uppercase tracking-wider w-fit ${
              agent.status === "active"
                ? "border-emerald-500/30 text-emerald-400"
                : "border-amber-500/30 text-amber-400"
            }`}
          >
            <span
              className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${
                agent.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"
              }`}
            />
            {agent.status}
          </Badge>
        </motion.div>

        {hasRoles && activeRole && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-5 sm:mb-6"
          >
            <RolePicker
              roles={agent.preset_roles!}
              activeRoleId={activeRole.id}
              onRoleChange={handleRoleChange}
            />
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-sm sm:text-base text-muted-foreground mb-6 max-w-2xl leading-relaxed"
        >
          What to expect: the chat below shows how the AI handles real conversations—answering
          questions, checking availability, and booking appointments. Type a message or use the
          quick actions to see it in action.
        </motion.p>

        {/* Chat + optional calendar — full width mobile; split from lg */}
        <div
          className={`mb-8 flex flex-col gap-4 sm:gap-6 ${
            bookingCalendar ? "lg:grid lg:grid-cols-5 lg:items-start lg:gap-6" : ""
          }`}
        >
          <div
            className={`min-h-0 w-full ${
              bookingCalendar ? "lg:col-span-3" : ""
            }`}
            style={{ minHeight: "min(680px, 90dvh)" }}
          >
            <ChatInterface
              agentName={chatAgentName}
              sessionId={sessionId}
              messages={messages}
              isStreaming={isStreaming}
              onSend={sendWithBookingIntent}
              onClear={clearChat}
              quickActions={activeRole?.quick_actions}
              persistentQuickActions={activeRole?.persistent_quick_actions}
              accentText={accent.text}
              bookingCalendarRole={bookingCalendar}
              showBookingShortcuts={showBookingShortcuts}
              bookingToolsOpen={bookingToolsOpen}
              onOpenBookingTools={openBookingTools}
              onCloseBookingTools={closeBookingTools}
            />
          </div>

          {bookingCalendar && (
            <div className="w-full lg:col-span-2 lg:sticky lg:top-4 shrink-0">
              <SessionCalendar
                sessionId={sessionId}
                mergePhone={calendarMergePhone}
                refreshKey={calendarRefresh + calendarTick}
                accentText={accent.text}
                assistantName={chatAgentName}
                onPickSlot={(date, slot) =>
                  sendWithBookingIntent(
                    `Book a visit on ${date} at ${slot.label} IST. Use this exact time for availability — slot ${slot.start_iso_ist}`
                  )
                }
              />
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-t border-white/[0.06] pt-6 sm:pt-8"
        >
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl text-foreground mb-2 sm:mb-3">
            Integration possibilities for your chatbot
          </h3>
          <p className="text-sm text-muted-foreground/90 mb-8 max-w-2xl">
            Some integrations are the channels where users talk to your bot; others power workflows
            and data behind the scenes. Not every bot needs every integration—we pick what fits.
          </p>

          <div className="space-y-10 sm:space-y-12">
            <section className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-6 sm:p-8">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-violet-300/90 mb-1">
                Example of where your chatbot can run
              </h4>
              <p className="text-xs text-muted-foreground/80 mb-5 max-w-xl">
                Conversation channels—messaging, voice, email. These are where your users reach the
                bot.
              </p>
              <div className="space-y-5 sm:space-y-6">
                {CHATBOT_CHANNEL_GROUPS.map((cat) => {
                  const items = pickLogoItemsFrom(CHATBOT_INTEGRATION_ITEMS, cat.names);
                  return (
                    <div key={cat.title}>
                      <span className="text-xs font-medium text-muted-foreground/70">
                        {cat.title}
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2 sm:gap-3">
                        <LogoGrid items={items} className="flex flex-wrap gap-2 sm:gap-3" />
                        <a
                          href="/#services"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-12 min-w-[100px] max-w-[140px] shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
                        >
                          <Globe className="h-5 w-5 shrink-0 text-violet-400" strokeWidth={1.5} />
                          <span className="truncate text-center text-xs font-medium text-zinc-300">
                            Website chatbot
                          </span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-6 sm:p-8">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-violet-300/90 mb-1">
                Example of what it can connect to
              </h4>
              <p className="text-xs text-muted-foreground/80 mb-5 max-w-xl">
                Data, CRM, productivity, commerce—optional depending on your use case. We wire
                only what you need.
              </p>
              <div className="space-y-5 sm:space-y-6">
                {CHATBOT_SUPPORTING_GROUPS.map((cat) => {
                  const items = pickLogoItemsFrom(CHATBOT_INTEGRATION_ITEMS, cat.names);
                  const isSalesCrm = cat.title === "Sales & CRM";
                  return (
                    <div key={cat.title}>
                      <span className="text-xs font-medium text-muted-foreground/70">
                        {cat.title}
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2 sm:gap-3">
                        <LogoGrid items={items} className="flex flex-wrap gap-2 sm:gap-3" />
                        {isSalesCrm && (
                          <a
                            href="https://www.salesforce.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-12 min-w-[100px] max-w-[140px] shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08]"
                          >
                            <Building2 className="h-5 w-5 shrink-0 text-violet-400" strokeWidth={1.5} />
                            <span className="truncate text-center text-xs font-medium text-zinc-300">
                              Salesforce
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-10 rounded-2xl border border-violet-500/20 bg-violet-950/20 p-6 sm:p-8"
        >
          <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">
            Ready to deploy something similar for your business?
          </h3>
          <p className="text-sm text-muted-foreground/90 mb-4 max-w-2xl">
            We can map your use case, integrations, and rollout in a focused strategy call.
          </p>
          <Link
            href="/book?source=agent-detail"
            className="inline-flex rounded-lg border border-violet-500/35 bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-500/25"
          >
            Book a free AI strategy call
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  );
}
