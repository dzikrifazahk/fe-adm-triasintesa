"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, RefreshCcw } from "lucide-react";

type Props = {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  children?: ReactNode;
  title?: string;
  description?: string;
};

export function DashboardFilterSheet({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApply,
  onReset,
  children,
  title = "Filter Dashboard",
  description = "Sesuaikan periode dan kriteria untuk memperbarui data dashboard.",
}: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-xl border-slate-200">
          <Filter className="size-4" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 overflow-y-auto px-4">
          <div className="grid gap-2">
            <Label>Dari Tanggal</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
              className="rounded-xl border-slate-200"
            />
          </div>
          <div className="grid gap-2">
            <Label>Sampai Tanggal</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
              className="rounded-xl border-slate-200"
            />
          </div>

          {children}
        </div>

        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onReset}>
            <RefreshCcw className="size-4" />
            Reset
          </Button>
          <SheetClose asChild>
            <Button className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800" onClick={onApply}>
              Terapkan
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
