"""
Mock clinic calendar in IST. Persists bookings to data/appointments.json (survives refresh).
Replace with Google Calendar API + DB in production.
"""
from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")
MAX_BOOK_AHEAD_DAYS = 14

_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
_DATA_FILE = _DATA_DIR / "appointments.json"

# session_id -> list of appointment dicts
_appointments: dict[str, list[dict]] = {}
_booked_starts: set[str] = set()


def _normalize_phone(phone: str) -> str:
    if not phone:
        return ""
    return re.sub(r"[^\d+]", "", phone.strip()) or phone.strip()


def _rebuild_from_flat(rows: list[dict]) -> None:
    global _appointments, _booked_starts
    _appointments = {}
    _booked_starts = set()
    for rec in rows:
        if not isinstance(rec, dict) or not rec.get("id"):
            continue
        sid = rec.get("session_id") or "default"
        _appointments.setdefault(sid, []).append(rec)
        _booked_starts.add(rec["start_iso_ist"])


def _load_disk() -> None:
    try:
        _DATA_DIR.mkdir(parents=True, exist_ok=True)
        if not _DATA_FILE.is_file():
            return
        raw = _DATA_FILE.read_text(encoding="utf-8")
        rows = json.loads(raw) if raw.strip() else []
        if isinstance(rows, list):
            _rebuild_from_flat(rows)
    except Exception:
        pass


def _save_disk() -> None:
    try:
        _DATA_DIR.mkdir(parents=True, exist_ok=True)
        flat: list[dict] = []
        seen: set[str] = set()
        for lst in _appointments.values():
            for a in lst:
                i = a.get("id")
                if i and i not in seen:
                    seen.add(i)
                    flat.append({**a, "session_id": a.get("session_id", "")})
        _DATA_FILE.write_text(json.dumps(flat, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception:
        pass


_load_disk()


def _parse_iso_ist(iso_str: str) -> datetime:
    s = iso_str.strip()
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=IST)
    return dt.astimezone(IST)


def _now_ist() -> datetime:
    return datetime.now(IST)


def booking_window_error(center: datetime) -> str | None:
    """None if OK; else short reason (past / too far)."""
    now = _now_ist()
    if center < now:
        return "past"
    if center.date() > (now.date() + timedelta(days=MAX_BOOK_AHEAD_DAYS)):
        return "too_far"
    return None


def check_availability_window(iso_requested: str) -> dict:
    center = _parse_iso_ist(iso_requested)
    bad = booking_window_error(center)
    if bad == "past":
        return {
            "available": False,
            "requested_iso_ist": center.isoformat(),
            "suggested_slots": [],
            "message": "Cannot book in the past. Pick a time from today onward (IST).",
            "reject_reason": "past",
        }
    if bad == "too_far":
        return {
            "available": False,
            "requested_iso_ist": center.isoformat(),
            "suggested_slots": [],
            "message": f"We only take bookings up to {MAX_BOOK_AHEAD_DAYS} days ahead. Choose an earlier date.",
            "reject_reason": "too_far",
        }
    window_start = center - timedelta(hours=8)
    window_end = center + timedelta(hours=8)
    alternatives = []
    step = timedelta(minutes=30)
    t = window_start
    now = _now_ist()
    max_dt = now + timedelta(days=MAX_BOOK_AHEAD_DAYS)
    while t <= window_end:
        if t.weekday() < 6 and 9 <= t.hour < 19 and t >= now and t <= max_dt:
            start_iso = t.isoformat()
            busy = any(
                abs((_parse_iso_ist(b) - t).total_seconds()) < 1800 for b in _booked_starts
            )
            if not busy and start_iso not in _booked_starts:
                alternatives.append(
                    {
                        "start_iso_ist": start_iso,
                        "label": t.strftime("%a %d %b, %I:%M %p IST"),
                    }
                )
        t += step
    requested_free = center.isoformat() not in _booked_starts
    for b in _booked_starts:
        bt = _parse_iso_ist(b)
        if abs((bt - center).total_seconds()) < 1800:
            requested_free = False
            break
    if requested_free and center.weekday() < 6 and 9 <= center.hour < 19:
        return {
            "available": True,
            "requested_iso_ist": center.isoformat(),
            "message": "Slot is available.",
        }
    near = sorted(
        alternatives,
        key=lambda x: abs((_parse_iso_ist(x["start_iso_ist"]) - center).total_seconds()),
    )[:2]
    return {
        "available": False,
        "requested_iso_ist": center.isoformat(),
        "suggested_slots": near,
        "message": "Requested time not available. Suggest alternatives.",
    }


def book_slot(
    session_id: str,
    start_iso_ist: str,
    appointment_type: str,
    patient_name: str,
    email: str,
    phone: str,
) -> dict:
    center = _parse_iso_ist(start_iso_ist)
    bad = booking_window_error(center)
    if bad == "past":
        return {
            "success": False,
            "error": "Cannot book in the past.",
        }
    if bad == "too_far":
        return {
            "success": False,
            "error": f"Bookings only up to {MAX_BOOK_AHEAD_DAYS} days ahead.",
        }
    if center.weekday() >= 6 or not (9 <= center.hour < 19):
        return {"success": False, "error": "Outside clinic hours or Sunday."}
    appt_id = str(uuid.uuid4())[:8]
    sid = (session_id or "").strip() or "default"
    rec = {
        "id": appt_id,
        "session_id": sid,
        "start_iso_ist": _parse_iso_ist(start_iso_ist).isoformat(),
        "type": appointment_type,
        "patient_name": patient_name,
        "email": email or "",
        "phone": _normalize_phone(phone) or phone,
        "clinic": "Vision Eye Clinic",
    }
    _booked_starts.add(rec["start_iso_ist"])
    _appointments.setdefault(sid, []).append(rec)
    _save_disk()
    return {"success": True, "appointment_id": appt_id, "details": rec}


def get_appointments_for_phone(session_id: str, phone: str) -> list[dict]:
    out = []
    pn = _normalize_phone(phone)
    for sid, lst in _appointments.items():
        for a in lst:
            if a.get("phone") == phone or (pn and _normalize_phone(a.get("phone", "")) == pn) or sid == session_id:
                out.append(a)
    return out


def cancel_appointment(session_id: str, appointment_id: str) -> dict:
    for sid, lst in list(_appointments.items()):
        for i, a in enumerate(lst):
            if a["id"] == appointment_id:
                _booked_starts.discard(a["start_iso_ist"])
                lst.pop(i)
                if not lst:
                    del _appointments[sid]
                _save_disk()
                return {"success": True, "cancelled_id": appointment_id}
    return {"success": False, "error": "Appointment not found"}


def _slot_busy(t: datetime) -> bool:
    start_iso = t.isoformat()
    if start_iso in _booked_starts:
        return True
    for b in _booked_starts:
        bt = _parse_iso_ist(b)
        if abs((bt - t).total_seconds()) < 1800:
            return True
    return False


def list_slots_for_date(date_yyyy_mm_dd: str, max_slots: int = 12) -> dict:
    try:
        y, m, d = map(int, date_yyyy_mm_dd.strip().split("-")[:3])
    except Exception:
        return {"ok": False, "error": "Invalid date; use YYYY-MM-DD", "slots": []}
    now = _now_ist()
    day_date = datetime(y, m, d, tzinfo=IST).date()
    if day_date < now.date():
        return {
            "ok": True,
            "date": date_yyyy_mm_dd,
            "slots": [],
            "message": "Cannot book past dates.",
        }
    if day_date > now.date() + timedelta(days=MAX_BOOK_AHEAD_DAYS):
        return {
            "ok": True,
            "date": date_yyyy_mm_dd,
            "slots": [],
            "message": f"Bookings only up to {MAX_BOOK_AHEAD_DAYS} days ahead.",
        }
    day_start = datetime(y, m, d, 9, 0, 0, tzinfo=IST)
    if day_start.weekday() >= 6:
        return {
            "ok": True,
            "date": date_yyyy_mm_dd,
            "slots": [],
            "message": "Clinic closed Sundays.",
        }
    slots = []
    step = timedelta(minutes=30)
    t = day_start
    end = datetime(y, m, d, 19, 0, 0, tzinfo=IST)
    if day_date == now.date():
        while t < end and t <= now:
            t += step
    while t < end and len(slots) < max_slots:
        if not _slot_busy(t):
            slots.append(
                {
                    "start_iso_ist": t.isoformat(),
                    "label": t.strftime("%I:%M %p").lstrip("0"),
                }
            )
        t += step
    return {"ok": True, "date": date_yyyy_mm_dd, "slots": slots}


def next_bookable_days(count: int = 2) -> dict:
    """
    Next N calendar days (IST) that have at least one free slot.
    Skips Sundays and days with no remaining slots (e.g. after hours or fully booked).
    """
    now = _now_ist()
    today = now.date()
    out: list[dict] = []
    for offset in range(0, MAX_BOOK_AHEAD_DAYS + 1):
        d = today + timedelta(days=offset)
        if d.weekday() >= 6:
            continue
        key = d.isoformat()
        r = list_slots_for_date(key, max_slots=1)
        if not r.get("slots"):
            continue
        if d == today:
            label = "Today"
        elif d == today + timedelta(days=1):
            label = "Tomorrow"
        else:
            label = d.strftime("%a %d %b")
        out.append({"date": key, "label": label})
        if len(out) >= count:
            break
    return {"ok": True, "days": out}


def list_slots_for_range(
    start_date: str, end_date: str, slots_per_day: int = 4
) -> dict:
    try:
        sy, sm, sd = map(int, start_date.strip().split("-")[:3])
        ey, em, ed = map(int, end_date.strip().split("-")[:3])
    except Exception:
        return {"ok": False, "error": "Dates must be YYYY-MM-DD", "days": []}
    today = _now_ist().date()
    d = datetime(sy, sm, sd, tzinfo=IST).date()
    if d < today:
        d = today
    end_d = datetime(ey, em, ed, tzinfo=IST).date()
    if end_d < d:
        end_d = d
    max_d = today + timedelta(days=MAX_BOOK_AHEAD_DAYS)
    if end_d > max_d:
        end_d = max_d
    if d > max_d:
        return {"ok": True, "start": start_date, "end": end_date, "days": []}
    days: list[dict] = []
    one_day = timedelta(days=1)
    while d <= end_d:
        key = d.isoformat()
        r = list_slots_for_date(key, max_slots=slots_per_day)
        if r.get("slots"):
            days.append({"date": key, "weekday": d.strftime("%A"), "slots": r["slots"]})
        d += one_day
    return {"ok": True, "start": start_date, "end": end_date, "days": days}


def get_session_appointments(session_id: str) -> list[dict]:
    return list(_appointments.get(session_id, []))


def get_merged_appointments(session_id: str, phone: str | None) -> list[dict]:
    """Session bookings plus any booking for this phone (persisted across refresh)."""
    by_id: dict[str, dict] = {}
    for a in get_session_appointments(session_id):
        by_id[a["id"]] = a
    pn = _normalize_phone(phone or "")
    if pn:
        for sid, lst in _appointments.items():
            for a in lst:
                ap = _normalize_phone(a.get("phone", ""))
                if ap == pn or ap.endswith(pn) or pn.endswith(ap):
                    by_id[a["id"]] = a
    return sorted(by_id.values(), key=lambda x: x.get("start_iso_ist", ""))


def update_appointment_time(session_id: str, appointment_id: str, new_start_iso_ist: str) -> dict:
    center = _parse_iso_ist(new_start_iso_ist)
    if booking_window_error(center):
        return {"success": False, "error": "New time must be within the booking window (not past, max 14 days ahead)."}
    for lst in _appointments.values():
        for a in lst:
            if a["id"] == appointment_id:
                _booked_starts.discard(a["start_iso_ist"])
                a["start_iso_ist"] = center.isoformat()
                _booked_starts.add(a["start_iso_ist"])
                _save_disk()
                return {"success": True, "appointment": a}
    return {"success": False, "error": "Not found"}
