"use client";

import { getDictionary } from "../../../get-dictionary";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRightLeft, FilePenLine, Filter, Search } from "lucide-react";

type Dictionary = Awaited<
  ReturnType<typeof getDictionary>
>["financial_record_page_dic"];

type FinancialStage = "submission" | "payment_request" | "paid";
type FinancialPriority = "high" | "medium" | "low";
type FinancialStatus =
  | "need_review"
  | "waiting_budget"
  | "ready_to_pay"
  | "paid";

type FinancialRecordRow = {
  id: string;
  title: string;
  vendor: string;
  category: string;
  amount: number;
  date: string;
  stage: FinancialStage;
  status: FinancialStatus;
  priority: FinancialPriority;
  createdBy: string;
};

type Props = {
  dictionary: Dictionary;
  title: string;
  description: string;
  searchQuery: string;
  categoryFilter: string;
  categories: string[];
  rows: FinancialRecordRow[];
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onClearFilters: () => void;
  onEdit: (recordId: string) => void;
  onAdvanceStage: (recordId: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  priorityLabel: (priority: FinancialPriority) => string;
  priorityClassName: (priority: FinancialPriority) => string;
  statusLabel: (status: FinancialStatus) => string;
  statusClassName: (status: FinancialStatus) => string;
};

export function FinancialRecordTableSection({
  dictionary,
  title,
  description,
  searchQuery,
  categoryFilter,
  categories,
  rows,
  onSearchChange,
  onCategoryFilterChange,
  onClearFilters,
  onEdit,
  onAdvanceStage,
  formatCurrency,
  formatDate,
  priorityLabel,
  priorityClassName,
  statusLabel,
  statusClassName,
}: Props) {
  return (
    <Card className="gap-0 rounded-[24px] border-slate-200 shadow-sm dark:border-[#34363B] dark:bg-[#1C1D21]">
      <CardHeader className="border-b border-slate-100 pb-5 dark:border-[#34363B]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-sm leading-6 dark:text-slate-400">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={
                dictionary?.toolbar?.search_placeholder ??
                "Cari judul, vendor, ID, kategori..."
              }
              className="h-11 rounded-xl border-slate-200 pl-9 dark:border-[#34363B] dark:bg-[#23252B] dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <Select
            value={categoryFilter}
            onValueChange={onCategoryFilterChange}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 dark:border-[#34363B] dark:bg-[#23252B] dark:text-slate-100">
              <SelectValue
                placeholder={
                  dictionary?.toolbar?.category_placeholder ?? "Filter kategori"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {dictionary?.toolbar?.all_category ?? "Semua kategori"}
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="h-11 rounded-xl border-slate-200 dark:border-[#34363B] dark:bg-[#23252B] dark:text-slate-100 dark:hover:bg-[#2A2D33]"
            onClick={onClearFilters}
          >
            <Filter className="size-4" />
            {dictionary?.button_filter ?? "Filters"}
          </Button>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-slate-200 dark:border-[#34363B]">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-[#23252B]">
              <TableRow className="hover:bg-slate-50 dark:hover:bg-[#23252B]">
                <TableHead className="px-4">
                  {dictionary?.table?.expense ?? "Expense"}
                </TableHead>
                <TableHead>
                  {dictionary?.table?.category ?? "Kategori"}
                </TableHead>
                <TableHead>
                  {dictionary?.table?.amount ?? "Nominal"}
                </TableHead>
                <TableHead>
                  {dictionary?.table?.status ?? "Status"}
                </TableHead>
                <TableHead>
                  {dictionary?.table?.date ?? "Tanggal"}
                </TableHead>
                <TableHead className="px-4 text-right">
                  {dictionary?.table?.actions ?? "Aksi"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {record.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>{record.id}</span>
                          <span className="text-slate-300 dark:text-slate-600">
                            •
                          </span>
                          <span>{record.vendor}</span>
                          <span className="text-slate-300 dark:text-slate-600">
                            •
                          </span>
                          <span>
                            {dictionary?.table?.created_by_prefix ?? "By"}{" "}
                            {record.createdBy}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {record.category}
                        </p>
                        <Badge
                          className={cn("rounded-full border-0", priorityClassName(record.priority))}
                        >
                          {priorityLabel(record.priority)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(record.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn("rounded-full border", statusClassName(record.status))}
                      >
                        {statusLabel(record.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {formatDate(record.date)}
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="rounded-xl dark:border-[#34363B] dark:bg-[#23252B] dark:text-slate-100 dark:hover:bg-[#2A2D33]"
                          onClick={() => onEdit(record.id)}
                        >
                          <FilePenLine className="size-4" />
                          {dictionary?.button_edit ?? "Edit"}
                        </Button>
                        {record.stage !== "paid" ? (
                          <Button
                            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                            onClick={() => onAdvanceStage(record.id)}
                          >
                            <ArrowRightLeft className="size-4" />
                            {record.stage === "submission"
                              ? (dictionary?.button_update_stage ?? "Ubah")
                              : (dictionary?.button_mark_paid ?? "Bayar")}
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="px-4 py-12 text-center">
                    <div className="mx-auto max-w-md space-y-2">
                      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {dictionary?.table?.empty_title ?? "Tidak ada data yang cocok"}
                      </p>
                      <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {dictionary?.table?.empty_description ??
                          "Coba ubah kata kunci pencarian atau reset filter untuk melihat data lain di tab ini."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
