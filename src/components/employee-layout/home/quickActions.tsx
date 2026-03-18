"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ClipboardList,
  CheckCheck,
  Clock4,
  FileText,
  Grid3X3,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FaHandHoldingDollar, FaMoneyBillTrendUp } from "react-icons/fa6";

const iconMap = {
  clock: Clock4,
  check: CheckCheck,
  hat: GraduationCap,
  list: ClipboardList,
  doc: FileText,
  grid: Grid3X3,
  kasbon: FaHandHoldingDollar,
  payroll: FaMoneyBillTrendUp,
} as const;

export type QuickIconKey = keyof typeof iconMap;

export default function QuickActions({
  items,
  onSelect,
  className,
}: {
  items: { key: string; title: string; icon: QuickIconKey }[];
  onSelect?: (key: string) => void;
  className?: string;
}) {
  return (
    <Card className={cn("mx-2 mb-3 lg:mx-5", className)}>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {items.map((it) => {
              const Icon = iconMap[it.icon];
              return (
                <Tooltip key={it.key}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onSelect?.(it.key)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2",
                        "rounded-2xl border bg-card hover:bg-accent/40 transition",
                        "p-3 cursor-pointer",
                        "min-h-[92px]"
                      )}
                    >
                      <span className="inline-flex size-10 rounded-xl bg-muted text-foreground/80 items-center justify-center">
                        <Icon className="size-5" />
                      </span>

                      <span className="text-xs sm:text-sm font-medium text-center leading-tight whitespace-normal break-words">
                        {it.title}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{it.title}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
