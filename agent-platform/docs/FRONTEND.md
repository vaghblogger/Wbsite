# Frontend (Next.js)

## Theme

- **Dark only** — `html` is always `class="dark"`; `ThemeProvider` uses `forcedTheme="dark"`. There is **no light theme** and **no theme toggle**.
- Styling uses Tailwind + CSS variables from [`globals.css`](../frontend/src/app/globals.css) under `.dark`.

## Homepage

- **Hero** → **Agent Library** (`#agents`) → **Technologies & integrations** (marquee).
- **Tech stack section** ([`tech-stack.tsx`](../frontend/src/components/marketing/tech-stack.tsx)): two infinite CSS marquees (pause on hover; respects `prefers-reduced-motion`). Logos from **`simple-icons`** plus local [`public/logos/`](../frontend/public/logos/) (e.g. `n8n.svg`, `langgraph.svg`). CTA to [n8n integrations](https://n8n.io/integrations/).
- Dependencies include **`simple-icons`** (brand SVG paths).

## AI Front Desk chat UI

- **Calendar sidebar** — shown when `prompt_config.show_booking_calendar === "true"` (or legacy Eye playbook). Shared **IST** demo calendar via gateway → engine.
- **Booking shortcuts** (Today / Tomorrow / Other day, slot picker) open after **booking intent** (e.g. book, appointment, cancel, schedule a meeting) or when the user taps **“Book or reschedule — show calendar & shortcuts”**. Sending **non-booking** messages (hours, location, jobs, delivery, visitor, find a person, etc.) **closes** the shortcut strip so it doesn’t stay up for info-only flows. Sidebar calendar stays visible for calendar roles.
- **`prompt_config.show_booking_shortcuts: "false"`** — hides the entry bar and shortcut strip entirely (calendar sidebar only). Typing booking intent still works in chat; use this for roles where shortcuts are optional.
- **Next two bookable days** — shortcuts call **`GET /api/calendar/next-bookable-days`** (engine skips Sundays and days with no free slots, e.g. after hours).
- **“Other day”** sends a message so the agent asks which date; see playbooks + [`configurable_front_desk_base.txt`](../agent-engine/app/prompts/configurable_front_desk_base.txt).
- Session calendar help text uses the preset **assistant name** (not a fixed brand).
- **Quick actions** — collapsed by default; expanded area is a fixed **3×3** grid (nine cells), **3 columns × 3 rows** always. Up to nine actions fill cells left→right, top→bottom; empty cells stay blank. More than nine actions show only the first nine unless presets are trimmed.

## Env

- **`NEXT_PUBLIC_GATEWAY_URL`** — gateway base (default `http://localhost:3001`).
- **`NEXT_PUBLIC_WS_URL`** — WebSocket base for agent events (default `ws://localhost:3001`).

## Related

- [CONFIGURABLE_AGENTS.md](./CONFIGURABLE_AGENTS.md) — presets, `show_booking_calendar`
- [Architecture](./architecture.md) — gateway routes
