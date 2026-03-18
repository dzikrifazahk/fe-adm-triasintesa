"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { AttendanceMap, IAttendance } from "@/types/attendance";

import { buildAttendanceModifiers } from "@/utils/attendanceCalendar";

interface Props {
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;

  attendanceMap?: AttendanceMap;
  onDayDetailClick?: (dateKey: string, items: IAttendance[]) => void;

  widthButton?: string;
  borderColor?: string;
  placeHolder?: string;
  className?: string;
}

export function DateRangeAttendanceCustom({
  value,
  onChange,
  attendanceMap = {},
  onDayDetailClick,
  className,
  widthButton,
  borderColor,
  placeHolder,
}: Props) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => setDate(value), [value]);

  const modifiers = React.useMemo(
    () => buildAttendanceModifiers(attendanceMap),
    [attendanceMap]
  );

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onChange?.(newDate);
  };

  const handleDayClick = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    const items = attendanceMap?.[key];
    if (items?.length) onDayDetailClick?.(key, items);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              widthButton || "w-[300px]",
              borderColor || "",
              "justify-start text-left font-normal",
              !date?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeHolder ?? "Pick a date"}</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            onDayClick={handleDayClick}
            modifiers={modifiers}
            classNames={{ day: "relative" }}
            modifiersClassNames={{
              present:
                "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-emerald-500",
              absent:
                "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-red-500",
              late:
                "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-amber-500",
              leave:
                "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-sky-500",
              overtime:
                "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-purple-500",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}