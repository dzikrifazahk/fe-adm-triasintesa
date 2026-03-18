"use client";
import { useEffect, useState } from "react";

export function useRealtimeClock({
  timeZone = "Asia/Jakarta",
  withSeconds = true,
} = {}) {
  const [now, setNow] = useState<Date | null>(null); // null saat SSR -> aman

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const map: Record<string, string> = {
    "Asia/Jakarta": "WIB",
    "Asia/Makassar": "WITA",
    "Asia/Jayapura": "WIT",
  };

  // Saat belum hydrated, kembalikan placeholder stabil
  if (!now) {
    return {
      hydrated: false,
      time: "--:--:--",
      date: "— — —",
      tzAbbr: map[timeZone] ?? "UTC",
    };
  }

  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hour12: false,
    timeZone,
  }).format(now);

  const date = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone,
  }).format(now);

  const tzAbbr =
    map[timeZone] ??
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" })
      .format(now)
      .split(" ")
      .pop();

  return { hydrated: true, time, date, tzAbbr };
}
