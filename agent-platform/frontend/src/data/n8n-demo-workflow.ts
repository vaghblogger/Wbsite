/**
 * WhatsApp AI Agent — single end-to-end workflow for the <n8n-demo> component.
 *
 * n8n-demo expects connections keyed and referenced by node NAME (not id).
 * Flow: WhatsApp Message → Parse and Validate → [Lookup CRM ‖ Load History] →
 * Merge Context → AI Agent → Route by Intent →
 *   true: Book Appointment → Google Calendar ──┐
 *   false: Create Ticket → Notify Slack ───────┼→ Merge Actions →
 * Compose Reply → Send WhatsApp Reply → Log to Database
 */
export const N8N_DEMO_WORKFLOW = {
  nodes: [
    { id: "n1", name: "WhatsApp Message", type: "n8n-nodes-base.webhook", position: [100, 300], parameters: { path: "whatsapp-in", httpMethod: "POST" }, typeVersion: 1 },
    { id: "n2", name: "Parse and Validate", type: "n8n-nodes-base.set", position: [320, 300], parameters: {}, typeVersion: 3.4 },
    { id: "n3", name: "Lookup CRM Contact", type: "n8n-nodes-base.hubspot", position: [560, 140], parameters: { operation: "getAll", resource: "contact" }, typeVersion: 1 },
    { id: "n4", name: "Load Chat History", type: "n8n-nodes-base.httpRequest", position: [560, 460], parameters: { url: "={{ $json.apiHost }}/history", method: "GET" }, typeVersion: 4.1 },
    { id: "n5", name: "Merge Context", type: "n8n-nodes-base.merge", position: [800, 300], parameters: { mode: "combine" }, typeVersion: 3 },
    { id: "n6", name: "AI Agent", type: "n8n-nodes-base.openAi", position: [1040, 300], parameters: { operation: "message", model: "gpt-4o-mini" }, typeVersion: 1.2 },
    { id: "n7", name: "Route by Intent", type: "n8n-nodes-base.if", position: [1280, 300], parameters: { conditions: {} }, typeVersion: 2 },
    { id: "n8", name: "Book Appointment", type: "n8n-nodes-base.set", position: [1520, 140], parameters: {}, typeVersion: 3.4 },
    { id: "n9", name: "Google Calendar", type: "n8n-nodes-base.httpRequest", position: [1740, 140], parameters: { url: "={{ $json.calApi }}/events", method: "POST" }, typeVersion: 4.1 },
    { id: "n10", name: "Create Support Ticket", type: "n8n-nodes-base.httpRequest", position: [1520, 460], parameters: { url: "={{ $json.deskApi }}/tickets", method: "POST" }, typeVersion: 4.1 },
    { id: "n11", name: "Notify Team via Slack", type: "n8n-nodes-base.slack", position: [1740, 460], parameters: { channel: "#support" }, typeVersion: 2.1 },
    { id: "n12", name: "Merge Actions", type: "n8n-nodes-base.merge", position: [1960, 300], parameters: { mode: "combine" }, typeVersion: 3 },
    { id: "n13", name: "Compose Reply", type: "n8n-nodes-base.set", position: [2180, 300], parameters: {}, typeVersion: 3.4 },
    { id: "n14", name: "Send WhatsApp Reply", type: "n8n-nodes-base.httpRequest", position: [2400, 300], parameters: { url: "={{ $json.waApi }}/send", method: "POST" }, typeVersion: 4.1 },
    { id: "n15", name: "Log to Database", type: "n8n-nodes-base.httpRequest", position: [2620, 300], parameters: { url: "={{ $json.dbApi }}/logs", method: "POST" }, typeVersion: 4.1 },
  ],
  connections: {
    "WhatsApp Message": { main: [[{ node: "Parse and Validate", type: "main", index: 0 }]] },
    "Parse and Validate": { main: [[{ node: "Lookup CRM Contact", type: "main", index: 0 }, { node: "Load Chat History", type: "main", index: 0 }]] },
    "Lookup CRM Contact": { main: [[{ node: "Merge Context", type: "main", index: 0 }]] },
    "Load Chat History": { main: [[{ node: "Merge Context", type: "main", index: 1 }]] },
    "Merge Context": { main: [[{ node: "AI Agent", type: "main", index: 0 }]] },
    "AI Agent": { main: [[{ node: "Route by Intent", type: "main", index: 0 }]] },
    "Route by Intent": { main: [[{ node: "Book Appointment", type: "main", index: 0 }], [{ node: "Create Support Ticket", type: "main", index: 0 }]] },
    "Book Appointment": { main: [[{ node: "Google Calendar", type: "main", index: 0 }]] },
    "Google Calendar": { main: [[{ node: "Merge Actions", type: "main", index: 0 }]] },
    "Create Support Ticket": { main: [[{ node: "Notify Team via Slack", type: "main", index: 0 }]] },
    "Notify Team via Slack": { main: [[{ node: "Merge Actions", type: "main", index: 1 }]] },
    "Merge Actions": { main: [[{ node: "Compose Reply", type: "main", index: 0 }]] },
    "Compose Reply": { main: [[{ node: "Send WhatsApp Reply", type: "main", index: 0 }]] },
    "Send WhatsApp Reply": { main: [[{ node: "Log to Database", type: "main", index: 0 }]] },
  },
} as const;

export type N8nDemoWorkflowJson = typeof N8N_DEMO_WORKFLOW;
