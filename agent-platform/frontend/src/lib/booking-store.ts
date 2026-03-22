type BookingStatus = "pending" | "confirmed" | "failed" | "cancelled";

export type BookingRecord = {
  id: string;
  eventId: string;
  email: string;
  serviceSlug: string;
  durationMin: number;
  slotStartIso: string;
  slotEndIso: string;
  meetUrl?: string;
  calendarUrl?: string;
  status: BookingStatus;
  createdAt: string;
};

const byId = new Map<string, BookingRecord>();
const byEventId = new Map<string, string>();
const locks = new Set<string>();

export function lockSlot(key: string): boolean {
  if (locks.has(key)) return false;
  locks.add(key);
  return true;
}

export function unlockSlot(key: string): void {
  locks.delete(key);
}

export function upsertBooking(record: BookingRecord): BookingRecord {
  byId.set(record.id, record);
  byEventId.set(record.eventId, record.id);
  return record;
}

export function getBooking(id: string): BookingRecord | null {
  return byId.get(id) ?? null;
}

export function getBookingByEventId(eventId: string): BookingRecord | null {
  const id = byEventId.get(eventId);
  if (!id) return null;
  return byId.get(id) ?? null;
}

export function listBookingsByEmail(email: string): BookingRecord[] {
  return [...byId.values()].filter((b) => b.email.toLowerCase() === email.toLowerCase());
}
