-- ============================================================================
-- GREENFIELD ONLY — empty Supabase project, no agents/messages tables yet
-- ============================================================================
-- If you already ran migrations or get: relation "agents" already exists
-- → DO NOT run this file. Use only migration_role_switcher.sql (and later deltas).
-- This script CREATEs tables + INSERTs seed rows. It is not idempotent on tables.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE agents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'general',
  workflow_json   JSONB NOT NULL DEFAULT '{}',
  tools           JSONB NOT NULL DEFAULT '[]',
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'beta', 'inactive')),
  accent_color    TEXT NOT NULL DEFAULT 'violet',
  icon            TEXT NOT NULL DEFAULT 'bot',
  agent_kind      TEXT NOT NULL DEFAULT '',
  prompt_config   JSONB NOT NULL DEFAULT '{}',
  instructions    TEXT NOT NULL DEFAULT '',
  restrictions    TEXT NOT NULL DEFAULT '',
  preset_roles    JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id       UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  session_id     TEXT NOT NULL,
  user_message   TEXT NOT NULL,
  agent_response TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_agent_id ON messages(agent_id);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Primary: configurable front desk (Role Picker on site)
INSERT INTO agents (slug, name, description, category, accent_color, icon, status, tools, agent_kind, workflow_json, preset_roles) VALUES
(
  'ai-front-desk',
  'AI Front Desk',
  'One configurable front-desk agent for any business. Visitors switch roles — same engine, different persona and guardrails.',
  'Front Desk',
  'violet',
  'headset',
  'active',
  '["identify_client","check_availability","book_appointment","sync_calendar","update_crm_record","get_client_appointments","update_appointment","cancel_appointment","create_ticket","log_interaction"]',
  'configurable_front_desk',
  '{"nodes":[{"id":"input","label":"User Message","position":{"x":250,"y":0}},{"id":"identify","label":"Identify","position":{"x":250,"y":100}},{"id":"intent","label":"Understand Intent","position":{"x":250,"y":200}},{"id":"tools","label":"Run Tools","position":{"x":250,"y":310}},{"id":"reply","label":"Generate Reply","position":{"x":250,"y":420}}],"edges":[{"source":"input","target":"identify"},{"source":"identify","target":"intent"},{"source":"intent","target":"tools"},{"source":"tools","target":"reply"}]}',
  '[
    {"id":"vision-eye-clinic","label":"Eye Clinic","icon":"eye","accent":"violet","welcome_message":"Hey! I''m Zuzu, the AI assistant from Vision Eye Clinic. How can I assist you today?","prompt_config":{"assistant_name":"Zuzu","business_name":"Vision Eye Clinic","playbook":"vision_eye_clinic","timezone":"Asia/Kolkata (IST)","hours":"Mon–Sat 9–7 IST","location":"12 MG Road, Near Trinity Circle, Bangalore 560001, Karnataka, India","services":"Eye consultations, vision testing, checkups, prescription evaluation","pricing":"Varies by consultation (INR); confirm on call or at visit","insurance":"Cashless / reimbursement per insurer","policy":"By availability and confirmation","contact":"Phone/WhatsApp"},"instructions":"","restrictions":"No medical diagnosis; no other patients'' data; no invented slots; never reveal tools.","quick_actions":[{"label":"Book Appointment","message":"I''d like to book an eye appointment","icon":"calendar"},{"label":"Check Availability","message":"What slots are available this week?","icon":"clock"},{"label":"My Appointments","message":"Show my upcoming appointments","icon":"list"},{"label":"Hours & Location","message":"What are your hours and where are you located?","icon":"map-pin"},{"label":"services","message":"What services do you offer and what do they cost?","icon":"info"},{"label":"Cancel / Reschedule","message":"I need to cancel or reschedule my appointment","icon":"x-circle"}]},
    {"id":"dental-care","label":"Dental","icon":"smile-plus","accent":"cyan","welcome_message":"Hi! Dana at Dental Care Clinic. How can I help?","prompt_config":{"assistant_name":"Dana","business_name":"Dental Care Clinic","timezone":"America/New_York","hours":"Mon–Fri 8–6 ET","location":"456 Oak Ave","services":"Cleanings, fillings","pricing":"From $120 cleaning","insurance":"PPO","policy":"24h cancel","contact":"Main number"},"instructions":"ET times; emergencies → create_ticket.","restrictions":"No prescribing; no diagnosis in chat.","quick_actions":[{"label":"Book Cleaning","message":"I''d like to book a dental cleaning","icon":"calendar"},{"label":"Emergency Pain","message":"I have a dental emergency — tooth pain","icon":"alert-triangle"},{"label":"Hours & Location","message":"What are your hours and address?","icon":"map-pin"},{"label":"Insurance Info","message":"What insurance plans do you accept?","icon":"shield"},{"label":"services","message":"What dental services and prices do you offer?","icon":"info"},{"label":"Cancel / Reschedule","message":"I need to cancel or reschedule","icon":"x-circle"}]},
    {"id":"corporate-reception","label":"Corporate","icon":"building-2","accent":"amber","welcome_message":"Alex at ACME Corp reception. What can I do for you?","prompt_config":{"assistant_name":"Alex","business_name":"ACME Corp","timezone":"America/Chicago","hours":"Mon–Fri 8:30–5:30 CT","location":"789 Corporate Blvd","services":"Scheduling, routing","pricing":"N/A","insurance":"N/A","policy":"Check-in required","contact":"reception@acme.com"},"instructions":"CT times; route visitors and deliveries.","restrictions":"No salaries; no unreleased products.","quick_actions":[{"label":"Schedule Meeting","message":"I''d like to schedule a meeting","icon":"calendar"},{"label":"Find a Person","message":"I''m looking for someone at the company","icon":"user"},{"label":"Visitor Check-in","message":"I''m here for a visit and need to check in","icon":"log-in"},{"label":"Delivery","message":"I have a delivery package","icon":"package"},{"label":"Office Hours","message":"What are the office hours?","icon":"clock"},{"label":"Job Inquiries","message":"I''m interested in job opportunities","icon":"briefcase"}]},
    {"id":"hotel-concierge","label":"Hotel","icon":"bed-double","accent":"emerald","welcome_message":"Aria at Grand Horizon Hotel. How may I help your stay?","prompt_config":{"assistant_name":"Aria","business_name":"Grand Horizon Hotel","timezone":"Europe/London","hours":"24/7","location":"London","services":"Rooms, spa, concierge","pricing":"From £180/night","insurance":"N/A","policy":"Check-in 3 PM","contact":"Front desk"},"instructions":"Warm tone; spa via check_availability.","restrictions":"No guest PII; no card details in chat.","quick_actions":[{"label":"Book a Room","message":"I''d like to reserve a room","icon":"bed-double"},{"label":"Room Service","message":"I''d like to order room service","icon":"utensils"},{"label":"Book Spa","message":"I''d like to book a spa session","icon":"sparkles"},{"label":"Local Tips","message":"What are the best things to see nearby?","icon":"map-pin"},{"label":"Airport Transfer","message":"I need an airport transfer","icon":"plane"},{"label":"Check-out Info","message":"What is the check-out time and process?","icon":"clock"}]}
  ]'::jsonb
),
(
  'customer-support',
  'Customer Support Agent',
  'Resolves customer issues by searching knowledge bases, tracking orders, and escalating when needed.',
  'Support',
  'cyan',
  'life-buoy',
  'active',
  '["knowledge_base", "order_tracker", "ticketing"]',
  '',
  '{
    "nodes": [
      {"id": "input", "label": "User Input", "position": {"x": 250, "y": 0}},
      {"id": "intent_detection", "label": "Classify Issue", "position": {"x": 250, "y": 100}},
      {"id": "knowledge_search", "label": "Search Knowledge Base", "position": {"x": 100, "y": 210}},
      {"id": "order_lookup", "label": "Track Order", "position": {"x": 400, "y": 210}},
      {"id": "resolution", "label": "Resolve or Escalate", "position": {"x": 250, "y": 320}},
      {"id": "response_generator", "label": "Generate Response", "position": {"x": 250, "y": 420}}
    ],
    "edges": [
      {"source": "input", "target": "intent_detection"},
      {"source": "intent_detection", "target": "knowledge_search"},
      {"source": "intent_detection", "target": "order_lookup"},
      {"source": "knowledge_search", "target": "resolution"},
      {"source": "order_lookup", "target": "resolution"},
      {"source": "resolution", "target": "response_generator"}
    ]
  }',
  '[]'::jsonb
),
(
  'lead-qualification',
  'Lead Qualification Agent',
  'Qualifies inbound leads through conversational scoring and routes hot leads to sales.',
  'Sales',
  'amber',
  'target',
  'active',
  '["crm", "lead_scorer", "email"]',
  '',
  '{
    "nodes": [
      {"id": "input", "label": "User Input", "position": {"x": 250, "y": 0}},
      {"id": "profile_enrichment", "label": "Enrich Profile", "position": {"x": 250, "y": 100}},
      {"id": "scoring", "label": "Score Lead", "position": {"x": 250, "y": 210}},
      {"id": "qualification", "label": "Qualify / Disqualify", "position": {"x": 250, "y": 320}},
      {"id": "response_generator", "label": "Generate Response", "position": {"x": 250, "y": 420}}
    ],
    "edges": [
      {"source": "input", "target": "profile_enrichment"},
      {"source": "profile_enrichment", "target": "scoring"},
      {"source": "scoring", "target": "qualification"},
      {"source": "qualification", "target": "response_generator"}
    ]
  }',
  '[]'::jsonb
),
(
  'research-agent',
  'Research Agent',
  'Deep research across sources; synthesizes reports. (Beta — extend engine when ready.)',
  'Research',
  'emerald',
  'search',
  'beta',
  '["web_search", "document_reader", "summarizer"]',
  '',
  '{
    "nodes": [
      {"id": "input", "label": "User Input", "position": {"x": 250, "y": 0}},
      {"id": "query_planning", "label": "Plan Research", "position": {"x": 250, "y": 100}},
      {"id": "web_search", "label": "Search Sources", "position": {"x": 100, "y": 210}},
      {"id": "doc_analysis", "label": "Analyze Documents", "position": {"x": 400, "y": 210}},
      {"id": "synthesis", "label": "Synthesize Findings", "position": {"x": 250, "y": 320}},
      {"id": "response_generator", "label": "Generate Report", "position": {"x": 250, "y": 420}}
    ],
    "edges": [
      {"source": "input", "target": "query_planning"},
      {"source": "query_planning", "target": "web_search"},
      {"source": "query_planning", "target": "doc_analysis"},
      {"source": "web_search", "target": "synthesis"},
      {"source": "doc_analysis", "target": "synthesis"},
      {"source": "synthesis", "target": "response_generator"}
    ]
  }',
  '[]'::jsonb
);
