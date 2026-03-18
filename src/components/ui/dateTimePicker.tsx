"use client";

import * as React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FaCalendar } from "react-icons/fa6";

type Props = {
  /** Controlled value */
  value?: Date;
  /** Fires whenever date OR time changes */
  onChange?: (d: Date | undefined) => void;
  /** Optional: control popover from parent if needed */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional placeholder */
  placeholder?: string;
  /** 12/24h display (we’ll keep 24h by default) */
  displayFormat?: string; // e.g. "MM/dd/yyyy HH:mm"
};

export function DateTimePicker24h({
  value,
  onChange,
  open,
  onOpenChange,
  placeholder = "MM/DD/YYYY HH:mm",
  displayFormat = "MM/dd/yyyy HH:mm",
}: Props) {
  // allow both controlled and uncontrolled usage
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(value);
  const isControlled = value !== undefined;
  const date = isControlled ? value : internalDate;

  const [isOpen, setIsOpen] = React.useState(false);
  const popoverOpen = open ?? isOpen;

  const setDate = (d?: Date) => {
    if (!isControlled) setInternalDate(d);
    onChange?.(d);
  };

  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setIsOpen(v);
  };

  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = React.useMemo(
    () => Array.from({ length: 12 }, (_, i) => i * 5),
    []
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    if (date) {
      // keep time when changing the day
      const d = new Date(selectedDate);
      d.setHours(date.getHours(), date.getMinutes(), 0, 0);
      setDate(d);
    } else {
      // init at 00:00
      const d = new Date(selectedDate);
      d.setHours(0, 0, 0, 0);
      setDate(d);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", valueStr: string) => {
    if (!date) return;
    const next = new Date(date);
    if (type === "hour") next.setHours(parseInt(valueStr, 10));
    if (type === "minute") next.setMinutes(parseInt(valueStr, 10));
    next.setSeconds(0, 0);
    setDate(next);
  };

  const selectedHour = date?.getHours();
  const selectedMinute = date?.getMinutes();

  return (
    <Popover open={popoverOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <FaCalendar className="mr-2 h-4 w-4" />
          {date ? format(date, displayFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />

          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            {/* Hours */}
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    type="button"
                    size="icon"
                    variant={selectedHour === hour ? "default" : "ghost"}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", String(hour))}
                  >
                    {hour.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>

            {/* Minutes (step 5) */}
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {minutes.map((m) => (
                  <Button
                    key={m}
                    type="button"
                    size="icon"
                    variant={selectedMinute === m ? "default" : "ghost"}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("minute", String(m))}
                  >
                    {m.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
