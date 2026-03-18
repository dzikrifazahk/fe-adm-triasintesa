export enum AttendanceStatus {
  ONTIME = "ONTIME",
  LATE = "LATE",
  PRESENT = "PRESENT",
}

export const STATUS_CLASS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.ONTIME]: "bg-emerald-100 text-emerald-700",
  [AttendanceStatus.LATE]: "bg-amber-100 text-amber-700",
  [AttendanceStatus.PRESENT]: "bg-sky-100 text-sky-700",
};

export function toAttendanceStatus(value: string): AttendanceStatus {
  const v = (value ?? "").toLowerCase().trim();
  if (["ontime", "on_time", "on time"].includes(v)) return AttendanceStatus.ONTIME;
  if (v === "late") return AttendanceStatus.LATE;
  if (["present", "attendance", "attend"].includes(v)) return AttendanceStatus.PRESENT;
  return AttendanceStatus.PRESENT;
}