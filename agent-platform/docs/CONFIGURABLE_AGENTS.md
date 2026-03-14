# Configurable front-desk agent

One **engine** (same LangGraph ReAct graph + tools: identify, calendar, CRM, tickets, logging). Many **businesses** by changing only data—no new Python deploy for a new preset.

## Database columns (agents table)

| Column | Purpose |
|--------|---------|
| `agent_kind` | Set to `configurable_front_desk` so the gateway + engine route to the shared front-desk graph. |
| `prompt_config` | JSON: `assistant_name`, `business_name`, `timezone`, `hours`, … Optional **`playbook`**: any key loads `app/prompts/{playbook}_playbook.txt` (e.g. `vision_eye_clinic`, `dental_clinic`, `corporate_front_desk`, `hotel_front_desk`). Optional **`show_booking_calendar`: `"true"`** — sidebar calendar + booking shortcuts row (IST demo store). **Corporate** preset is aligned to **IST** and the same calendar as Eye/Dental (avoid mixing US timezones with tool ISOs). |
| `instructions` | How *this* business books, greets, escalates (variable). |
| `restrictions` | **Hard guardrails** — what the agent must **never** do or answer. |
| `preset_roles` | **JSON array** of role presets for the **Role Picker** (see below). Each preset can override `prompt_config`, `instructions`, `restrictions`, and `welcome_message`. |

## Role Picker (website UX)

- **Homepage**: One prominent card — **AI Front Desk** (`slug: ai-front-desk`).
- **Detail page** (`/agents/ai-front-desk`): If `preset_roles` is non-empty, the UI shows a **Role Picker** (Eye Clinic, Dental, Corporate, Hotel, …).
- **On role change** (no full reload): new `session_id`, chat cleared, workflow reset, client sends **chat overrides** on every message: `agent_kind`, `prompt_config`, `instructions`, `restrictions` from the selected preset. The first assistant line can be the preset’s `welcome_message` (injected in the UI).

## Prompt assembly (engine)

1. **Identity** — from merged `prompt_config` (assistant + business name).
2. **Business facts** — hours, location, pricing (only from config).
3. **Instructions** — preset/business workflow.
4. **Shared rules** — [`configurable_front_desk_base.txt`](../agent-engine/app/prompts/configurable_front_desk_base.txt) (tools, booking flow).
5. **Restrictions** — appended last; treated as absolute.

Built in [`prompt_builder.py`](../agent-engine/app/prompts/prompt_builder.py), used by [`front_desk_graph.py`](../agent-engine/app/graphs/front_desk_graph.py) (`create_react_agent` + **GPT-4o-mini** via [`llm.py`](../agent-engine/app/llm.py)).

## SQL migration (Supabase)

Run in order:

1. Base schema: [`supabase/schema.sql`](../supabase/schema.sql) (greenfield).
2. **Role switcher + unified agent**: [`supabase/migration_role_switcher.sql`](../supabase/migration_role_switcher.sql)  
   - Adds `preset_roles` (and expects `agent_kind` / config columns if you added them earlier).  
   - Deactivates legacy one-off slugs merged into front desk: `ai-receptionist`, `vision-eye-clinic`, `dental-care-clinic`, `zuzu`.  
   - Inserts **`ai-front-desk`** with full `preset_roles` seed.

If your DB already has `agent_kind`, `prompt_config`, etc., run only the parts of the migration you still need (at minimum: `preset_roles` column + insert/update for `ai-front-desk`).

## Engine routing

Slugs in **`FRONT_DESK_AGENT_IDS`** ([`registry.py`](../agent-engine/app/agents/registry.py)) all use the same graph:

- `ai-front-desk` (primary)
- `vision-eye-clinic`, `dental-care-clinic` (optional legacy slugs; still routable)

Adding another slug to that set registers it with `/health` and `/run` without a separate graph file.

## New preset (no code deploy)

1. Edit the **`ai-front-desk`** row: append an object to `preset_roles` with `id`, `label`, `icon`, `accent`, `welcome_message`, `prompt_config`, `instructions`, `restrictions`.
2. Reload the site — the Role Picker reads from the API.

## New standalone agent row (same engine)

1. `INSERT` with `agent_kind = 'configurable_front_desk'` and the same tool list / workflow_json as front desk (optional).
2. Add the slug to `FRONT_DESK_AGENT_IDS` in `registry.py` **or** chat only ever uses `ai-front-desk` with overrides (recommended for one card, many businesses).

## Restrictions — examples

- **Clinic:** No diagnosis, no prescribing, no other patients’ data, no invented slots.
- **Dental:** No antibiotics advice, no legal advice.
- **Corporate:** No salary discussion, no unreleased product details.

## Gateway fallback

If Supabase is missing **`ai-front-desk`** among active agents, the gateway **merges** [`fallback-agents.ts`](../gateway/src/services/fallback-agents.ts) so the homepage still shows AI Front Desk + `preset_roles`. For production, keep the row in the DB so message persistence resolves UUIDs correctly.

## Calendar API (engine + gateway proxy)

| Route | Purpose |
|-------|--------|
| `GET /calendar/slots?date=YYYY-MM-DD&session_id=` | Free slots for one IST day (engine); gateway: **`GET /api/calendar/slots`**. |
| `GET /calendar/next-bookable-days?count=2` | Next N IST weekdays with ≥1 free slot (skips Sunday / closed / end of day). Gateway: **`GET /api/calendar/next-bookable-days`**. |
| `GET /calendar/appointments?session_id=&phone=` | Merged session + phone appointments. Gateway: **`GET /api/calendar/appointments`**. |

## Gateway HTTP timeout

Bun’s default idle timeout is **10s** — too low for streaming **`POST /api/chat`**. Gateway sets configurable **`GATEWAY_IDLE_TIMEOUT`** (seconds, max 255). See [`gateway/src/index.ts`](../gateway/src/index.ts) and [FRONTEND.md](./FRONTEND.md) / gateway `.env.example`.

## Related docs

- [Add a front-desk preset (runbook)](./add-front-desk-preset.md)  
- [FRONTEND.md](./FRONTEND.md) — UI, dark theme, marquees, booking UX  
- [Phase 1 — OpenAI](./phase1-openai.md)  
- [Architecture](./architecture.md)  
- [Plug-and-play](./plug-and-play-guide.md)
