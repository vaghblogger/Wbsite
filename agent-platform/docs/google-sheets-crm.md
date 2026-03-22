# Google Sheets as CRM log (tickets, CRM updates, interactions)

The agent engine **does not** use Google Sheets as a full CRM database. It **appends rows** whenever:

### Tabs = filter by kind

Each **kind** gets its **own worksheet tab** (auto-created). You don’t filter in one sheet — open the tab:

| Tab name | When |
|----------|------|
| **ticket** | **`create_ticket`** — complaints, refunds, escalation |
| **crm_update** | **`update_crm_record`** after booking / profile update |
| **log** | **`log_interaction`** |
| **healthcheck** | **`POST /health/sheets-test`** only |

Inside each tab: **column A** = full event **JSON**, **column B** = IST **timestamp**. Row 1 is the header (`payload_json` | `ts_ist`). **Sheet1** is no longer written by the app (legacy rows stay if you had any).

---

## What you need

### 1. Google Cloud project

1. [Google Cloud Console](https://console.cloud.google.com/) → create or select a project.
2. **APIs & Services → Enable APIs** → enable **Google Sheets API**.

### 2. Service account (simple path)

1. **IAM & Admin → Service Accounts → Create service account** (any name).
2. **Keys → Add key → JSON** → download.
3. **Save as** `agent-platform/agent-engine/google-sheets-credentials.json` (same folder as `app/`, `requirements.txt`).  
   That’s the **only** path you need — no long `/secure/...` env path.
4. File is **gitignored** — never commit it.

### 3. Spreadsheet

1. Create a **Google Sheet**.
2. Copy the **spreadsheet ID** from the URL:  
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`
3. **Share the sheet** with the service account email (looks like `something@project-id.iam.gserviceaccount.com`) as **Editor**. Without this, append will fail silently (caught in code).

### 4. Tabs

No manual setup. First write to each kind creates the tab and header row automatically.

### 5. Python dependency

In **agent-engine** (venv):

```bash
pip install gspread google-auth
```

(`gspread` is not always in minimal requirements; add to `requirements.txt` if you use Sheets.)

### 6. Environment variables (agent-engine)

| Variable | Required | Description |
|----------|----------|-------------|
| **`GOOGLE_SHEETS_LOG_ID`** | Yes | Spreadsheet ID from the URL |
| **`GOOGLE_SHEETS_CREDS_FILE`** | No | Only if you don’t use the default file below |

**Default creds path (no env):**  
`agent-engine/google-sheets-credentials.json`

Example **`.env`** (minimal):

```env
GOOGLE_SHEETS_LOG_ID=1abc...xyz
```

Optional: `GOOGLE_SHEETS_CREDS_FILE=other.json` (relative to `agent-engine/`, or absolute).

Restart **agent-engine** after changing env.

---

## Verify

**Fast test (no chat):** with agent-engine running:

```bash
curl -X POST http://localhost:8000/health/sheets-test
```

- Response `"ok": true` → open the sheet; you should see a row with **`healthcheck`** in column A (safe to delete).
- If `"ok": false` or rows never appear → read the **agent-engine terminal**: warnings now log why (missing file, permission, API).

**Via chat:** trigger a ticket → open the **ticket** tab → new row with full JSON in column A.

If nothing appears: check sharing with the service account, API enabled, path to JSON, and engine logs (exceptions are swallowed in `_append_airtable_sheets` — temporarily add logging if needed).

---

## Airtable (alternative)

Same hook supports Airtable instead of or **in addition to** Sheets:

- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_LOG_TABLE` (default `FrontDeskLogs`)

Each row: `Kind` + `Payload` (JSON string).

---

## Production notes

- Sheets is an **append-only log**, not authoritative CRM. For refunds, staff work from the sheet (or sync to a real CRM later).
- Restrict the service account to **one** spreadsheet; rotate keys periodically.
