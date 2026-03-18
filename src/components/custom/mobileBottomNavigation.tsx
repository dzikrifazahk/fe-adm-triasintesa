"use client";

import { cn } from "@/lib/utils";
import { Home, Bell, CalendarDays, UserRound, Fingerprint } from "lucide-react";

type TabKey = "home" | "notif" | "schedule" | "profile";

export default function MobileBottomBar({
  activeTab = "home",
  onTabChange,
  onOpenAttendance,
  isCheckedIn,
  disableCheckIn,
  disableCheckOut,
}: {
  activeTab?: TabKey;
  onTabChange?: (key: TabKey) => void;
  onOpenAttendance?: () => void;
  isCheckedIn?: boolean | null;
  disableCheckIn?: boolean;
  disableCheckOut?: boolean;
}) {
  return (
    <>
      {/* --- BLUR SCRIM di belakang bar --- */}
      <div
        aria-hidden
        className={cn(
          "lg:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-none",
          // tinggi scrim + safe area, dengan fade to top
          "h-[110px] pb-[env(safe-area-inset-bottom)]",
          "bg-white/70 backdrop-blur-md",
          "[mask-image:linear-gradient(to_top,black_60%,transparent)]",
          // sedikit shadow ke atas biar lebih jelas pemisahnya
          "shadow-[0_-12px_30px_rgba(0,0,0,0.08)]"
        )}
      />

      {/* --- Bottom Bar --- */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 bottom-0 z-50",
          "pb-[env(safe-area-inset-bottom)]"
        )}
      >
        <div
          className={cn(
            "mx-3 mb-3 rounded-2xl bg-white/95 backdrop-blur border shadow-lg",
            "h-16 relative"
          )}
        >
          <div className="grid grid-cols-5 h-full">
            <NavItem
              label="Beranda"
              icon={Home}
              active={activeTab === "home"}
              onClick={() => onTabChange?.("home")}
            />
            <NavItem
              label="Notifikasi"
              icon={Bell}
              active={activeTab === "notif"}
              onClick={() => onTabChange?.("notif")}
            />
            <div />
            <NavItem
              label="Jadwal"
              icon={CalendarDays}
              active={activeTab === "schedule"}
              onClick={() => onTabChange?.("schedule")}
            />
            <NavItem
              label="Profil"
              icon={UserRound}
              active={activeTab === "profile"}
              onClick={() => onTabChange?.("profile")}
            />
          </div>

          {/* FAB Absen */}
          <button
            onClick={() => onOpenAttendance?.()}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 -top-6",
              "size-14 rounded-full grid place-items-center",
              "bg-sky-700 text-white shadow-xl ring-8 ring-white"
            )}
            aria-label="Absen"
          >
            <Fingerprint className="size-6" />
          </button>
        </div>
      </div>

      {/* Optional: spacer untuk konten agar tidak tertutup bar */}
      {/* <div className="h-[110px] lg:hidden" /> */}
    </>
  );
}

function NavItem({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center text-[11px] gap-1",
        "text-gray-500"
      )}
    >
      <Icon className={cn("size-5", active && "text-sky-700")} />
      <span
        className={cn(active ? "text-sky-700 font-medium" : "text-gray-500")}
      >
        {label}
      </span>
    </button>
  );
}
