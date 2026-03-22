"""
CRM mock + optional Airtable / Google Sheets append (env-based).
"""
from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

_log = logging.getLogger(__name__)

# agent-engine/ (parent of app/)
_AGENT_ENGINE_ROOT = Path(__file__).resolve().parent.parent.parent
# Default: drop Google's JSON here and rename to this (or keep env override)
_DEFAULT_SHEETS_CREDS = _AGENT_ENGINE_ROOT / "google-sheets-credentials.json"


def sheets_creds_path() -> str:
    """
    Creds file location (never committed):
    1. GOOGLE_SHEETS_CREDS_FILE if set — absolute, or relative to agent-engine/
    2. Else agent-engine/google-sheets-credentials.json
    """
    env = os.getenv("GOOGLE_SHEETS_CREDS_FILE", "").strip()
    if env:
        p = Path(env)
        if p.is_absolute():
            return str(p)
        return str(_AGENT_ENGINE_ROOT / p)
    return str(_DEFAULT_SHEETS_CREDS)

IST = ZoneInfo("Asia/Kolkata")

_clients_by_phone: dict[str, dict] = {}
_tickets: list[dict] = []
_logs: list[dict] = []


def identify_client(phone: str) -> dict:
    phone = "".join(c for c in phone if c.isdigit() or c == "+")
    if phone in _clients_by_phone:
        c = _clients_by_phone[phone]
        return {"exists": True, "name": c.get("name"), "email": c.get("email"), "phone": phone}
    return {"exists": False, "phone": phone}


def upsert_client(phone: str, name: str | None = None, email: str | None = None) -> dict:
    phone = "".join(c for c in phone if c.isdigit() or c == "+")
    if phone not in _clients_by_phone:
        _clients_by_phone[phone] = {}
    if name:
        _clients_by_phone[phone]["name"] = name
    if email:
        _clients_by_phone[phone]["email"] = email
    _clients_by_phone[phone]["phone"] = phone
    return {"success": True, "client": _clients_by_phone[phone]}


def sync_calendar_mock(appointment_id: str) -> dict:
    """Placeholder for Google Calendar sync."""
    return {"synced": True, "calendar": "mock", "appointment_id": appointment_id}


def update_crm_record(phone: str, fields: dict) -> dict:
    upsert_client(phone, fields.get("name"), fields.get("email"))
    _append_airtable_sheets("crm_update", {"phone": phone, **fields})
    return {"success": True}


def create_ticket(
    phone: str,
    name: str,
    issue_customer_words: str,
    summary_for_team: str = "",
    customer_email: str = "",
    related_appointment: str = "",
) -> dict:
    """
    issue_customer_words: what they said (short).
    summary_for_team: AI rephrase for staff — neutral, actionable (Sheets column-friendly).
    """
    t = {
        "id": len(_tickets) + 1,
        "phone": phone,
        "name": name,
        "issue_customer_words": issue_customer_words,
        "summary_for_team": summary_for_team or issue_customer_words,
        "customer_email": (customer_email or "").strip(),
        "related_appointment": (related_appointment or "").strip(),
        "ts": datetime.now(IST).isoformat(),
    }
    _tickets.append(t)
    _append_airtable_sheets("ticket", t)
    return {"success": True, "ticket_id": t["id"]}


def log_interaction(
    phone: str,
    client_name: str,
    summary: str,
    action: str,
) -> dict:
    row = {
        "phone": phone,
        "client_name": client_name,
        "summary": summary,
        "action": action,
        "timestamp": datetime.now(IST).isoformat(),
    }
    _logs.append(row)
    _append_airtable_sheets("log", row)
    return {"success": True, "logged": True}


def _append_airtable_sheets(kind: str, payload: dict) -> None:
    """Best-effort Airtable / Sheets append when env set."""
    at_key = os.getenv("AIRTABLE_API_KEY", "").strip()
    base = os.getenv("AIRTABLE_BASE_ID", "").strip()
    if at_key and base:
        try:
            from pyairtable import Api

            table_name = os.getenv("AIRTABLE_LOG_TABLE", "FrontDeskLogs")
            Api(at_key).table(base, table_name).create({"Kind": kind, "Payload": json.dumps(payload)})
        except Exception as e:
            _log.warning("Airtable append failed (%s): %s", kind, e)
    # Google Sheets optional via service account file
    sheet_id = os.getenv("GOOGLE_SHEETS_LOG_ID", "").strip()
    if not sheet_id:
        return
    path = sheets_creds_path()
    if not os.path.isfile(path):
        _log.warning(
            "Google Sheets: GOOGLE_SHEETS_LOG_ID is set but creds missing. "
            "Put service-account JSON at: %s (or set GOOGLE_SHEETS_CREDS_FILE)",
            path,
        )
        return
    try:
        import gspread
        from google.oauth2.service_account import Credentials

        creds = Credentials.from_service_account_file(
            path,
            scopes=["https://www.googleapis.com/auth/spreadsheets"],
        )
        import gspread.exceptions as gexc

        gc = gspread.authorize(creds)
        sh = gc.open_by_key(sheet_id)
        # One tab per kind → filter by opening that tab (ticket | crm_update | log | healthcheck)
        tab = "".join(c for c in kind if c.isalnum() or c in ("_", "-"))[:99] or "log"
        try:
            ws = sh.worksheet(tab)
        except gexc.WorksheetNotFound:
            ws = sh.add_worksheet(title=tab, rows=500, cols=4)
            ws.append_row(["payload_json", "ts_ist"])
        ws.append_row(
            [json.dumps(payload, ensure_ascii=False), datetime.now(IST).isoformat()]
        )
    except Exception as e:
        _log.warning("Google Sheets append failed (%s): %s", kind, e, exc_info=True)
