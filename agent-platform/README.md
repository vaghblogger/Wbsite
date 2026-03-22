# AgentHub — AI Agent Library Platform

Visitors explore agents, chat (streaming), and watch **workflow nodes** animate over WebSocket.

## Philosophy (current)

| Idea | What it means |
|------|----------------|
| **Config-driven** | Cards, workflows, and tools come from the `agents` table + API — not hardcoded lists. |
| **AI Front Desk** | One **ReAct** engine (`configurable_front_desk`): same tools for every business; persona via **`preset_roles`** on the site (Role Picker) + optional per-row prompts. |
| **Plug-in agents** | New *distinct* behavior = new LangGraph + registry entry + DB row. New *preset* = edit JSON only. |
| **Gateway merge** | If Supabase has no `ai-front-desk` row, the gateway still injects it from fallback so the homepage never regresses. |

```
Frontend (Next.js)  <-->  Gateway (Bun)  <-->  Agent Engine (Python / LangGraph + OpenAI)
                                |
                           Supabase (Postgres)
```

| Service | Port | Tech |
|---------|------|------|
| Frontend | 3000 | Next.js, Tailwind, shadcn, React Flow, Framer Motion |
| Gateway | 3001 | Bun, REST + WebSocket |
| Agent Engine | 8000 | FastAPI, LangGraph ReAct, GPT-4o-mini |

## Quick start

1. **DB** — Run `supabase/schema.sql` (greenfield) **or** `supabase/migration_role_switcher.sql` (existing DB). See repo root `commands.txt`.

2. **Env**
   ```bash
   cp gateway/.env.example gateway/.env
   cp agent-engine/.env.example agent-engine/.env
   # OPENAI_API_KEY in agent-engine; SUPABASE_* in gateway
   ```

3. **Run** (three terminals): `agent-engine` → `gateway` → `frontend` (see `commands.txt`).

4. Open http://localhost:3000 — try **AI Front Desk** and switch roles.

## Adding capacity

- **New business persona (no code):** append to `ai-front-desk.preset_roles` in Supabase (or use migration upsert).
- **New agent with custom graph:** `agent-engine/app/graphs/…`, register in `registry.py`, `INSERT` into `agents`.

Full detail: [`docs/`](docs/README.md). **Sheets CRM logging:** [`docs/google-sheets-crm.md`](docs/google-sheets-crm.md).

## Project structure

```
agent-platform/
├── frontend/       # App Router, RolePicker, chat overrides → gateway
├── gateway/        # Bun, getAgents merge, chat → engine, WS events
├── agent-engine/   # front_desk_graph (ReAct), front_desk_tools, llm.py
├── supabase/       # schema.sql + migration_role_switcher.sql
└── docs/           # architecture, futureplan, configurable agents
```

## Docker

```bash
docker-compose up --build
```
