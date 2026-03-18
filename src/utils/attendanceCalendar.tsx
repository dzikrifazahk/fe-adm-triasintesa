import { format } from "date-fns";
import { AttendanceMap, IAttendance } from "@/types/attendance";

/**
 * Parse datetime string yang bisa:
 * - ISO: 2026-02-01T08:00:00Z
 * - SQL: 2026-02-01 08:00:00
 * - atau sudah yyyy-MM-dd
 */
function safeParseDate(input: string): Date | null {
  if (!input) return null;

  // sudah yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return new Date(input + "T00:00:00");
  }

  // SQL -> ISO-ish
  if (/^\d{4}-\d{2}-\d{2}\s/.test(input)) {
    return new Date(input.replace(" ", "T"));
  }

  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

export function getAttendanceDateKey(a: IAttendance): string | null {
  // prioritas pakai start_time, fallback ke created_at kalau ada di CommonColumn
  const dt =
    safeParseDate(a.start_time) ??
    // @ts-ignore (CommonColumn biasanya punya created_at)
    safeParseDate(a.created_at) ??
    null;

  if (!dt) return null;
  return format(dt, "yyyy-MM-dd");
}

export function buildAttendanceMap(list: IAttendance[]): AttendanceMap {
  const map: AttendanceMap = {};
  for (const a of list) {
    const key = getAttendanceDateKey(a);
    if (!key) continue;
    if (!map[key]) map[key] = [];
    map[key].push(a);
  }
  return map;
}

/**
 * Tentukan status dominan per hari (buat warna dot)
 * Kamu bebas adjust sesuai business rule kamu.
 */
export type CalendarMark =
  | "present"
  | "absent"
  | "late"
  | "leave"
  | "overtime"
  | "other";

function normalizeStatus(a: IAttendance): CalendarMark {
  // contoh logic:
  // - present: a.present == "1"/"true"/"YES"
  // - late: late_cut > 0
  // - overtime: ada overtime dan statusnya approved
  // - leave: type/status tertentu (sesuaikan)
  const presentVal = String(a.present ?? "").toLowerCase();
  const isPresent = presentVal === "1" || presentVal === "true" || presentVal === "yes";

  if (a.overtime && String(a.overtime.status).toLowerCase() === "approved") return "overtime";
  if (a.late_cut && a.late_cut > 0) return "late";

  // contoh leave:
  const type = String(a.type ?? "").toLowerCase();
  if (type.includes("leave") || type.includes("cuti") || type.includes("izin")) return "leave";

  if (isPresent) return "present";
  return "absent";
}

const PRIORITY: Record<CalendarMark, number> = {
  absent: 100,
  late: 80,
  leave: 70,
  overtime: 60,
  present: 10,
  other: 0,
};

function dominantMark(items: IAttendance[]): CalendarMark {
  return items.reduce((best, cur) => {
    const m = normalizeStatus(cur);
    return PRIORITY[m] > PRIORITY[best] ? m : best;
  }, normalizeStatus(items[0]));
}

/**
 * Convert AttendanceMap → react-day-picker modifiers
 */
export function buildAttendanceModifiers(attMap: AttendanceMap) {
  const out: Record<string, Date[]> = {
    present: [],
    absent: [],
    late: [],
    leave: [],
    overtime: [],
  };

  for (const [key, items] of Object.entries(attMap)) {
    if (!items?.length) continue;
    const d = safeParseDate(key); // key yyyy-MM-dd
    if (!d) continue;

    const mark = dominantMark(items);
    if (mark === "present") out.present.push(d);
    if (mark === "absent") out.absent.push(d);
    if (mark === "late") out.late.push(d);
    if (mark === "leave") out.leave.push(d);
    if (mark === "overtime") out.overtime.push(d);
  }

  return out;
}