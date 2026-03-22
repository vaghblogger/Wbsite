# Agent platform docs

| Doc | What it covers |
|-----|----------------|
| [architecture.md](./architecture.md) | End-to-end system, Mermaid diagrams, frontend/gateway/engine/DB, event protocol |
| [CONFIGURABLE_AGENTS.md](./CONFIGURABLE_AGENTS.md) | AI Front Desk, `preset_roles`, Role Picker, migrations, prompt columns |
| [phase1-openai.md](./phase1-openai.md) | Phase 1 LLM (GPT-4o-mini, ReAct, key files) |
| [plug-and-play-guide.md](./plug-and-play-guide.md) | Adding agents: classic graph vs front-desk presets, gateway merge behavior |
| [futureplan.md](./futureplan.md) | Roadmap: real tools, security, leads, analytics, infra |
| [google-sheets-crm.md](./google-sheets-crm.md) | Google Sheets (or Airtable) for ticket / CRM append logs |
| [FRONTEND.md](./FRONTEND.md) | Dark-only UI, homepage tech marquees, booking calendar UX, env vars |

**Supabase:** greenfield = [`../supabase/schema.sql`](../supabase/schema.sql) (full `agents` columns + **ai-front-desk** first). Existing DBs = [`../supabase/migration_role_switcher.sql`](../supabase/migration_role_switcher.sql) (columns + upsert + deactivate legacy). Optional patch: [`migration_preset_roles_eye_dental_calendar.sql`](../supabase/migration_preset_roles_eye_dental_calendar.sql).

**Gateway:** set **`GATEWAY_IDLE_TIMEOUT`** (e.g. `120`) for long streaming chat — see [`gateway/.env.example`](../gateway/.env.example).
