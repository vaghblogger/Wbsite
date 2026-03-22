"""LangChain tools for configurable front desk. Session-bound tools close over session_id so bookings stay tied to the chat (contextvars can be lost in some runtimes)."""
from __future__ import annotations

import json

from langchain_core.tools import tool

from app.tools import vision_calendar as cal
from app.tools import vision_crm as crm


def set_front_desk_context(session_id: str, phone: str) -> None:
    """Kept for compatibility; booking uses closed-over session_id from make_front_desk_tools."""


def make_front_desk_tools(session_id: str):
    """Per-request tools so book_appointment/update/cancel always use this chat's session_id."""
    sid = (session_id or "").strip() or "default"

    @tool
    def identify_client(phone: str) -> str:
        """Look up patient by phone number. Use the WhatsApp/call phone when known."""
        return json.dumps(crm.identify_client(phone), ensure_ascii=False)

    @tool
    def check_availability(iso_datetime_ist: str) -> str:
        """Check slot availability. Pass ISO 8601 datetime in IST (e.g. 2025-03-20T14:30:00+05:30). Checks 8 hours before and after."""
        return json.dumps(cal.check_availability_window(iso_datetime_ist), ensure_ascii=False)

    @tool
    def book_appointment(
        start_iso_ist: str,
        appointment_type: str,
        patient_full_name: str,
        email: str,
        phone: str,
    ) -> str:
        """Book after user explicitly confirmed. All times IST ISO."""
        crm.upsert_client(phone, patient_full_name, email)
        return json.dumps(
            cal.book_slot(
                sid, start_iso_ist, appointment_type, patient_full_name, email, phone
            ),
            ensure_ascii=False,
        )

    @tool
    def sync_calendar(appointment_id: str) -> str:
        """Sync appointment to clinic calendar."""
        return json.dumps(crm.sync_calendar_mock(appointment_id), ensure_ascii=False)

    @tool
    def update_crm_record(phone: str, name: str, email: str) -> str:
        """Update CRM record after booking or updates."""
        return json.dumps(
            crm.update_crm_record(phone, {"name": name, "email": email}), ensure_ascii=False
        )

    @tool
    def get_client_appointments(phone: str) -> str:
        """List appointments for this phone."""
        return json.dumps(cal.get_appointments_for_phone(sid, phone), ensure_ascii=False)

    @tool
    def update_appointment(appointment_id: str, new_start_iso_ist: str) -> str:
        """Reschedule appointment."""
        return json.dumps(
            cal.update_appointment_time(sid, appointment_id, new_start_iso_ist), ensure_ascii=False
        )

    @tool
    def cancel_appointment(appointment_id: str) -> str:
        """Cancel confirmed appointment."""
        return json.dumps(cal.cancel_appointment(sid, appointment_id), ensure_ascii=False)

    @tool
    def create_ticket(
        full_name: str,
        phone: str,
        issue_customer_words: str,
        summary_for_team: str,
        customer_email: str = "",
        related_appointment: str = "",
    ) -> str:
        """Escalate to humans (refund, complaint). issue_customer_words = short quote of what they said.
        summary_for_team = one clear neutral sentence for staff (rephrased by you). Optional email and appointment hint."""
        return json.dumps(
            crm.create_ticket(
                phone,
                full_name,
                issue_customer_words,
                summary_for_team=summary_for_team,
                customer_email=customer_email or "",
                related_appointment=related_appointment or "",
            ),
            ensure_ascii=False,
        )

    @tool
    def log_interaction(
        client_name: str, phone: str, conversation_summary: str, action_taken: str
    ) -> str:
        """Log interaction to CRM."""
        return json.dumps(
            crm.log_interaction(phone, client_name, conversation_summary, action_taken),
            ensure_ascii=False,
        )

    @tool
    def list_available_slots(start_date: str, end_date: str) -> str:
        """List free appointment slots across a date range (YYYY-MM-DD to YYYY-MM-DD). Use when user asks 'this week', 'next few days', or any multi-day availability query."""
        return json.dumps(cal.list_slots_for_range(start_date, end_date), ensure_ascii=False)

    return [
        identify_client,
        check_availability,
        list_available_slots,
        book_appointment,
        sync_calendar,
        update_crm_record,
        get_client_appointments,
        update_appointment,
        cancel_appointment,
        create_ticket,
        log_interaction,
    ]


# Default graph build uses "default" session (tests / one-off)
FRONT_DESK_TOOLS = make_front_desk_tools("default")
