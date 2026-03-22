export type ShowcaseNodeDetail = {
  title: string;
  description: string;
};

/** Page-native layout: linear segments and parallel columns (top → bottom per column). */
export type WorkflowJourneyPhase =
  | { kind: "sequence"; stepIds: string[] }
  | { kind: "parallel"; title: string; columns: string[][]; laneLabels?: string[] };

export type WorkflowShowcaseVariant = {
  id: string;
  tabLabel: string;
  title: string;
  highLevel: string;
  journey: WorkflowJourneyPhase[];
  nodeIcons: Record<string, string>;
  stepLabels: Record<string, string>;
  details: Record<string, ShowcaseNodeDetail>;
  playbackOrder: string[];
};

export const WORKFLOW_SHOWCASE_VARIANTS: WorkflowShowcaseVariant[] = [
  {
    id: "marketing-automation",
    tabLabel: "Marketing Workflow",
    title: "Customer message automation",
    highLevel:
      "Routes customer requests through context gathering, AI intent routing, and downstream systems.",
    nodeIcons: {
      trigger: "inbox",
      parse: "file_check",
      crm: "users",
      history: "messages_square",
      merge_ctx: "git_merge",
      ai: "sparkles",
      route: "waypoints",
      book_appt: "calendar_clock",
      calendar: "calendar",
      ticket: "ticket",
      slack: "bell",
      merge_actions: "layers",
      compose: "pen_line",
      send: "send",
      log_db: "database",
    },
    stepLabels: {
      trigger: "Customer channel",
      parse: "Validate input",
      crm: "CRM lookup",
      history: "History lookup",
      merge_ctx: "Merge context",
      ai: "AI classify",
      route: "Route by intent",
      book_appt: "Prepare booking",
      calendar: "Schedule calendar",
      ticket: "Create ticket",
      slack: "Notify team",
      merge_actions: "Merge outcomes",
      compose: "Compose response",
      send: "Send response",
      log_db: "Audit log",
    },
    journey: [
      { kind: "sequence", stepIds: ["trigger", "parse"] },
      {
        kind: "parallel",
        title: "Load context in parallel",
        columns: [["crm"], ["history"]],
      },
      { kind: "sequence", stepIds: ["merge_ctx", "ai", "route"] },
      {
        kind: "parallel",
        title: "Execute intent branch",
        columns: [
          ["book_appt", "calendar"],
          ["ticket", "slack"],
        ],
        laneLabels: ["Scheduling path", "Support path"],
      },
      { kind: "sequence", stepIds: ["merge_actions", "compose", "send", "log_db"] },
    ],
    details: {
      trigger: {
        title: "Customer channel",
        description: "Incoming event from web chat, WhatsApp, email, or voice.",
      },
      parse: {
        title: "Validate input",
        description: "Normalizes payload and applies basic policy checks.",
      },
      crm: {
        title: "CRM lookup",
        description: "Reads account/contact context from your CRM system.",
      },
      history: {
        title: "History lookup",
        description: "Loads past messages so the assistant keeps conversation continuity.",
      },
      merge_ctx: {
        title: "Merge context",
        description: "Combines event, customer profile, and conversation history.",
      },
      ai: {
        title: "AI classify",
        description: "Classifies intent and drafts action-ready output.",
      },
      route: {
        title: "Route by intent",
        description: "Chooses scheduling vs support escalation branch.",
      },
      book_appt: {
        title: "Prepare booking",
        description: "Builds structured booking request from extracted fields.",
      },
      calendar: {
        title: "Schedule calendar",
        description: "Creates or updates appointment in calendar systems.",
      },
      ticket: {
        title: "Create ticket",
        description: "Opens support ticket for human follow-up.",
      },
      slack: {
        title: "Notify team",
        description: "Sends team alert with context and next action.",
      },
      merge_actions: {
        title: "Merge outcomes",
        description: "Rejoins both branches to continue a single response flow.",
      },
      compose: {
        title: "Compose response",
        description: "Formats final user response with policy-compliant text.",
      },
      send: {
        title: "Send response",
        description: "Returns message to the original user channel.",
      },
      log_db: {
        title: "Audit log",
        description: "Stores decision trail and action metadata for reporting.",
      },
    },
    playbackOrder: [
      "trigger",
      "parse",
      "crm",
      "history",
      "merge_ctx",
      "ai",
      "route",
      "book_appt",
      "calendar",
      "ticket",
      "slack",
      "merge_actions",
      "compose",
      "send",
      "log_db",
    ],
  },
  {
    id: "ai-receptionist",
    tabLabel: "AI Receptionist",
    title: "Reception desk workflow",
    highLevel:
      "Handles inbound calls or WhatsApp messages, verifies context, books or modifies appointments, and hands over to a human when needed.",
    nodeIcons: {
      inbound: "phone_call",
      identify: "users",
      understand: "sparkles",
      check_slots: "calendar",
      route_action: "waypoints",
      book: "calendar_clock",
      confirm_booking: "send",
      modify_appt: "file_check",
      cancel_appt: "ticket",
      handoff_human: "bell",
      sync_systems: "layers",
      close_log: "database",
    },
    stepLabels: {
      inbound: "Inbound call / message",
      identify: "Identify caller",
      understand: "Understand intent",
      check_slots: "Check availability",
      route_action: "Route request",
      book: "Book appointment",
      confirm_booking: "Send confirmation",
      modify_appt: "Reschedule / modify",
      cancel_appt: "Cancel appointment",
      handoff_human: "Handoff to human",
      sync_systems: "Sync CRM & calendar",
      close_log: "Log interaction",
    },
    journey: [
      { kind: "sequence", stepIds: ["inbound", "identify", "understand", "check_slots", "route_action"] },
      {
        kind: "parallel",
        title: "Execute receptionist action",
        columns: [
          ["book", "confirm_booking"],
          ["modify_appt", "cancel_appt", "handoff_human"],
        ],
        laneLabels: ["Booking path", "Change / escalation path"],
      },
      { kind: "sequence", stepIds: ["sync_systems", "close_log"] },
    ],
    details: {
      inbound: {
        title: "Inbound call / message",
        description: "Captures incoming requests from phone, WhatsApp, or similar messaging channels.",
      },
      identify: {
        title: "Identify caller",
        description: "Matches the person against CRM/contact records and gathers missing details.",
      },
      understand: {
        title: "Understand intent",
        description: "Detects whether the user wants to book, reschedule, cancel, or ask for help.",
      },
      check_slots: {
        title: "Check availability",
        description: "Looks up real-time appointment slots and any scheduling constraints.",
      },
      route_action: {
        title: "Route request",
        description: "Routes the conversation into booking, change/cancel, or escalation flow.",
      },
      book: {
        title: "Book appointment",
        description: "Creates the appointment with the selected slot and service details.",
      },
      confirm_booking: {
        title: "Send confirmation",
        description: "Sends confirmation message with date, time, and any prep instructions.",
      },
      modify_appt: {
        title: "Reschedule / modify",
        description: "Updates an existing booking to a new slot or revised details.",
      },
      cancel_appt: {
        title: "Cancel appointment",
        description: "Cancels the booking and notifies the user about the final status.",
      },
      handoff_human: {
        title: "Handoff to human",
        description: "Transfers the session to a human receptionist when AI confidence is low or policy requires it.",
      },
      sync_systems: {
        title: "Sync CRM & calendar",
        description: "Ensures CRM, calendar, and internal systems are updated consistently.",
      },
      close_log: {
        title: "Log interaction",
        description: "Stores the complete interaction trail for audit and reporting.",
      },
    },
    playbackOrder: [
      "inbound",
      "identify",
      "understand",
      "check_slots",
      "route_action",
      "book",
      "confirm_booking",
      "modify_appt",
      "cancel_appt",
      "handoff_human",
      "sync_systems",
      "close_log",
    ],
  },
];
