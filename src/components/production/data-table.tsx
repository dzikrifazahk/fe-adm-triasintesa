"use client";

import { DataTablePagination } from "@/components/data-table/pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IMeta } from "@/types/common";
import { IProductionPlan } from "@/types/production";
import { Table } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { getDictionary } from "../../../get-dictionary";

type DataTableProps = {
  data: IProductionPlan[];
  metadata?: IMeta;
  loadingTable?: boolean;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  editData?: (id: string) => void;
  deleteData?: (id: string) => void;
  resetData?: (id: string) => void;
  viewData?: (id: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["production_page_dic"]["production_plan"]["table"];
};

const tablePlaceholder = {} as Table<IProductionPlan>;

function formatPlanDate(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return "-";

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const isStartValid = start && !Number.isNaN(start.getTime());
  const isEndValid = end && !Number.isNaN(end.getTime());

  if (isStartValid && isEndValid) {
    return `${format(start, "dd MMM yyyy")} - ${format(end, "dd MMM yyyy")}`;
  }

  if (isStartValid) return format(start, "dd MMM yyyy");
  if (isEndValid) return format(end, "dd MMM yyyy");

  return "-";
}

export function DataTable({
  data,
  metadata,
  loadingTable = false,
  onPageChange,
  onPageSizeChange,
  editData,
  deleteData,
  resetData,
  viewData,
  dictionary,
}: DataTableProps) {
  return (
    <div className="mt-4 flex h-full min-h-0 flex-col w-full">
      <div className="rounded-xl border border-[#E5E7EB] dark:border-[#3A3D44] p-2 sm:p-3 w-full">
        {/* Header desktop */}
        <div className="flex justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] dark:border-[#3A3D44] dark:bg-[#2E3138] px-4 py-3 text-sm font-semibold text-[#6B7280] dark:text-slate-300">
          <div className="w-28 shrink-0">{dictionary.header_plan}</div>
          <div className="w-fit shrink-0 text-center ">{dictionary.header_actions}</div>
        </div>

        {/* Body */}
        <div className="mt-2 flex min-h-0 flex-col gap-2 overflow-y-auto">
          {loadingTable ? (
            <div className="rounded-xl border border-dashed border-[#D1D5DB] dark:border-[#4B5563] px-4 py-8 text-center text-sm text-muted-foreground dark:text-slate-400">
              {dictionary.loading}
            </div>
          ) : data.length ? (
            data.map((plan) => {
              const planId = String(plan.id ?? "");
              return (
                <div
                  key={planId}
                  className="rounded-xl border border-[#E5E7EB] bg-white dark:border-[#3A3D44] dark:bg-[#26282D] px-2 py-3 transition hover:bg-[#F9FAFB] dark:hover:bg-[#2E3138] sm:px-4 cursor-pointer"
                  onClick={() => viewData?.(planId)}
                >
                  {/* Mobile */}
                  <div className="flex flex-col gap-3 sm:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {/* <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-sm font-semibold text-[#4338CA]">
                          {getTankInitials(plan)}
                        </div> */}

                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[#111827] dark:text-slate-100">
                            {plan.tank?.tankName ||
                              plan.tank?.tankCode ||
                              dictionary.fallback_name}
                          </div>
                          <div className="mt-0.5 text-xs text-[#6B7280] dark:text-slate-400">
                            {dictionary.tank_label}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 shrink-0 rounded-full p-0"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">{dictionary.open_actions}</span>
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              editData?.(planId);
                            }}
                            disabled={!editData}
                          >
                            {dictionary.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteData?.(planId);
                            }}
                            disabled={!deleteData}
                            className="text-red-600 focus:text-red-600"
                          >
                            {dictionary.delete}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              resetData?.(planId);
                            }}
                            disabled={!resetData}
                          >
                            Reset Plan Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-lg bg-[#F9FAFB] dark:bg-[#2E3138] px-3 py-2">
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280] dark:text-slate-400">
                          {dictionary.target}
                        </div>
                        <div className="truncate text-sm font-semibold text-[#111827] dark:text-slate-100">
                          {plan.targetJirigenTotal?.toLocaleString("id-ID") ??
                            0}
                        </div>
                      </div>

                      <div className="min-w-0 text-right">
                        <div className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280] dark:text-slate-400">
                          {dictionary.period}
                        </div>
                        <div className="truncate text-sm font-medium text-[#111827] dark:text-slate-100">
                          {formatPlanDate(plan.startDate, plan.endDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="min-w-28 flex-1">
                      <div className="truncate text-sm font-medium text-[#111827] dark:text-slate-100">
                        {formatPlanDate(plan.startDate)} - {formatPlanDate(plan.endDate)}
                      </div>
                      {/* <div className="truncate text-xs text-[#6B7280] dark:text-slate-400"> */}
                        {/* {plan.} */}
                      {/* </div> */}
                      <div className="truncate text-xs text-[#6B7280] dark:text-slate-400">
                        {plan?.targetJirigenTotal || 0} {dictionary.jirigen_unit}
                      </div>
                    </div>

                    <div className="flex w-[56px] shrink-0 justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 rounded-full p-0"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">{dictionary.open_actions}</span>
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              editData?.(planId);
                            }}
                            disabled={!editData}
                          >
                            {dictionary.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteData?.(planId);
                            }}
                            disabled={!deleteData}
                            className="text-red-600 focus:text-red-600"
                          >
                            {dictionary.delete}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              resetData?.(planId);
                            }}
                            disabled={!resetData}
                          >
                            Reset Plan Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-[#D1D5DB] dark:border-[#4B5563] px-4 py-8 text-center text-sm text-muted-foreground dark:text-slate-400">
              {dictionary.empty}
            </div>
          )}
        </div>
      </div>

      <div className="">
        <DataTablePagination
          table={tablePlaceholder}
          lastPage={metadata?.last_page ?? 1}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          // layout="vertical"
        />
      </div>
    </div>
  );
}
