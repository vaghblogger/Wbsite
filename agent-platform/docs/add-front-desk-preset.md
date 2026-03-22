# Add a front-desk preset (runbook)

Use this when you want a **new vertical** (e.g. another clinic type) on **AI Front Desk** without forking the engine.

## Checklist

1. **Preset JSON**  
   Add an object to `agents.preset_roles` for slug `ai-front-desk` (or edit the same in [`fallback-agents.ts`](../gateway/src/services/fallback-agents.ts) for offline fallback):
   - `id`, `label`, `icon`, `accent`, `welcome_message`
   - `prompt_config`: at minimum `assistant_name`, `business_name`, `timezone`, `hours`, `location`, `services`, `pricing`, `insurance`, `policy`, `contact`
   - Optional **`playbook`**: snake_case key → engine loads `app/prompts/{playbook}_playbook.txt` (e.g. `dental_clinic` → `dental_clinic_playbook.txt`)
   - Optional **`show_booking_calendar`: `"true"`** — sidebar **calendar** (always for that role) + **booking shortcuts** after intent: user taps *Book or reschedule* or sends booking-related text; shortcuts use **next two bookable IST days** from the engine (not raw calendar tomorrow if Sunday / no slots). **Other day** sends a chat line so the agent asks which date.
   - `instructions` — short extra notes, or `""` if the playbook covers behavior
   - `restrictions` — hard guardrails
   - `quick_actions` — Role Picker chips
   - Optional **`persistent_quick_actions`** — booking shortcuts when calendar UI is on

2. **Playbook file (optional but recommended)**  
   - Copy structure from `vision_eye_clinic_playbook.txt` or `dental_clinic_playbook.txt` under [`agent-engine/app/prompts/`](../agent-engine/app/prompts/).  
   - Name: **`{your_playbook_key}_playbook.txt`**.  
   - Set `prompt_config.playbook` to `{your_playbook_key}` (no `_playbook.txt` suffix).

3. **Engine**  
   No code change needed for new playbooks — [`prompt_builder.py`](../agent-engine/app/prompts/prompt_builder.py) loads by key when the file exists. Redeploy/restart **agent-engine** after adding a new `.txt` file.

4. **Gateway + frontend fallback**  
   Keep [`fallback-agents.ts`](../gateway/src/services/fallback-agents.ts) and [`use-agents.ts`](../frontend/src/hooks/use-agents.ts) in sync with DB presets so the UI matches when Supabase is down.

5. **Supabase**  
   Re-run or patch [`migration_role_switcher.sql`](../supabase/migration_role_switcher.sql) (upserts `ai-front-desk`), or `UPDATE agents SET preset_roles = ... WHERE slug = 'ai-front-desk'`.

6. **Sheets / tickets (optional)**  
   Same spreadsheet and tabs by ticket kind by default. For strict separation per brand, use a separate `GOOGLE_SHEETS_LOG_ID` per deploy or extend ticket payload later.

7. **Smoke test**  
   Restart **gateway** + **agent-engine**, open `/agents/ai-front-desk`, pick the new role, confirm welcome + booking UI (if `show_booking_calendar` is true) + one book flow.

## Propagating Eye Clinic learnings to every preset

Eye was the reference implementation. Keep **all** presets aligned as follows:

| Layer | What to sync |
|-------|----------------|
| **Shared base** | [`configurable_front_desk_base.txt`](../agent-engine/app/prompts/configurable_front_desk_base.txt) — tools, OTHER DAY, slot line, calendar merge. Any new global rule goes here first. |
| **Playbook per vertical** | Eye → `vision_eye_clinic_playbook.txt`; Dental → `dental_clinic_playbook.txt`; Corporate → `corporate_front_desk_playbook.txt`; Hotel → `hotel_front_desk_playbook.txt`. Add a playbook file + `prompt_config.playbook` so long `instructions` stay out of JSON. |
| **Fallback triple** | Same `preset_roles` in [`fallback-agents.ts`](../gateway/src/services/fallback-agents.ts), [`use-agents.ts`](../frontend/src/hooks/use-agents.ts), and Supabase migration — otherwise offline/demo drifts. |
| **UI** | Dark-only app; calendar copy uses **assistant name**. Booking shortcuts + `next-bookable-days` for any role with `show_booking_calendar`. |
| **Engine** | One graph for all; de-branded fallbacks; Sheets by ticket kind. |

When you change Eye’s playbook, ask: **does base.txt need the same rule for everyone?** If yes, add to base. If vertical-only, add the same paragraph to Dental/Corporate/Hotel playbooks.

## Related

- [CONFIGURABLE_AGENTS.md](./CONFIGURABLE_AGENTS.md) — columns, Role Picker, routing, calendar API  
- [FRONTEND.md](./FRONTEND.md) — homepage marquees, theme, gateway env
