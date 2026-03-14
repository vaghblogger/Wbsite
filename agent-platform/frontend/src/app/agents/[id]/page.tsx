"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
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
              href="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 touch-manipulation py-2 -my-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="h-4 w-px bg-zinc-700 shrink-0 hidden sm:block" />
            <h1 className="text-lg sm:text-2xl font-bold truncate">{agent.name}</h1>
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
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4">
            Tools Used
          </h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {agent.tools.map((tool) => {
              const Icon = toolIconMap[tool] || Sparkles;
              const label = toolLabels[tool] || tool;
              return (
                <div
                  key={tool}
                  className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] max-w-full"
                >
                  <div
                    className={`${accent.bg} ${accent.border} border rounded-lg p-1 sm:p-1.5 shrink-0`}
                  >
                    <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${accent.text}`} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium truncate">{label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
