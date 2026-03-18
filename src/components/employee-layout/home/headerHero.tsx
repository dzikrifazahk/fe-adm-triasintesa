"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Clock, LogIn, LogOut } from "lucide-react";
import { useContext } from "react";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { useRealtimeClock } from "@/hooks/use-realtime-clock";

type Props = {
  name: string;
  roleTitle: string;
  companyLogoText?: string;
  timeZone?: string; // default Asia/Jakarta
  checkInAt?: string | null;
  checkOutAt?: string | null;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  disableCheckIn?: boolean;
  disableCheckOut?: boolean;
};

export default function HeaderHero({
  name,
  roleTitle,
  companyLogoText,
  timeZone = "Asia/Jakarta",
  checkInAt,
  checkOutAt,
  onCheckIn,
  onCheckOut,
  disableCheckIn,
  disableCheckOut,
}: Props) {
  const { isMobile } = useContext(MobileContext);
  const { time, date, tzAbbr } = useRealtimeClock({
    timeZone,
    withSeconds: true,
  });

  return (
    <div className="relative">
      <div className="bg-gradient-to-tr from-sky-600 to-sky-700 text-white shadow-lg p-5 md:p-6 min-h-[180px] md:min-h-[200px]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {companyLogoText && (
              <div className="text-xs md:text-sm opacity-90 mb-1 font-medium">
                {companyLogoText}
              </div>
            )}
            <h1 className="text-xl md:text-3xl font-bold tracking-wide leading-tight">
              {name}
            </h1>
            <p className="text-xs md:text-base opacity-90 mt-1">{roleTitle}</p>
          </div>

          <Avatar className="size-10 md:size-14 ring-2 ring-white/50 shrink-0">
            <AvatarFallback className="bg-white/20 text-white">
              {name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="pointer-events-auto w-full h-16 md:h-24 lg:h-28">
        <div className={`-translate-y-16 ${isMobile ? "mx-5" : ""}`}>
          <div className="mx-auto w-full md:w-[92%] bg-white/95 backdrop-blur border-sky-100 shadow-xl rounded-xl">
            <div className="px-4 md:px-5 py-3 border-b">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sky-800 min-w-0">
                  <CalendarDays className="size-4 shrink-0" />
                  <span className="text-xs lg:text-base truncate">
                    Hari Ini • {date}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 text-sky-900/90">
                  <Clock className="size-4 shrink-0" />
                  <span className="text-xs lg:text-base font-sans tabular-nums">
                    {time} {tzAbbr}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2 md:p-4 grid grid-cols-2 gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3 rounded-xl border bg-card p-2 md:p-3">
                <div className="size-8 md:size-9 lg:size-9 rounded-full grid place-items-center bg-sky-100 text-sky-600">
                  <LogIn className="size-4 md:size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] md:text-xs text-muted-foreground">
                    CHECK IN
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="font-semibold text-base md:text-lg tracking-tight">
                      {checkInAt ?? "--:--"}
                    </span>
                    <Badge
                      variant="secondary"
                      className="rounded-md text-[10px]"
                    >
                      {tzAbbr}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={onCheckIn}
                  disabled={disableCheckIn}
                  className="hidden md:flex shrink-0 bg-iprimary-blue hover:bg-iprimary-blue-tertiary cursor-pointer"
                >
                  Check In
                </Button>
              </div>

              <div className="flex items-center gap-2 md:gap-3 rounded-xl border bg-card p-2 md:p-3">
                <div className="size-8 md:size-9 lg:size-9 rounded-full grid place-items-center bg-amber-100 text-amber-600">
                  <LogOut className="size-4 md:size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] md:text-xs text-muted-foreground">
                    CHECK OUT
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="font-semibold text-base md:text-lg tracking-tight">
                      {checkOutAt ?? "--:--"}
                    </span>
                    <Badge
                      variant="secondary"
                      className="rounded-md text-[10px]"
                    >
                      {tzAbbr}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={onCheckOut}
                  disabled={disableCheckOut}
                  className="hidden md:flex shrink-0 bg-iprimary-red hover:bg-red-500-tertiary cursor-pointer"
                >
                  Check Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
