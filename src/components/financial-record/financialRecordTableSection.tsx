"use client";

import { getDictionary } from "../../../get-dictionary";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRightLeft, CheckCircle2, FilePenLine, MoreHorizontal, Search } from "lucide-react";

type Dictionary = Awaited<
  ReturnType<typeof getDictionary>
>["financial_record_page_dic"];

type FinancialStage = "submission" | "payment_request" | "paid";
type FinancialPriority = "high" | "medium" | "low";
type DateStatus = "open" | "due_date" | "overdue" | "paid";

type FinancialRecordRow = {
  id: string;
  ledgerId: number;
  title: string;
  vendor: string;
  category: string;
  amount: number;
  date: string;
  periodStartDate?: string | null;
  periodEndDate?: string | null;
  dueDate?: string | null;
  paymentDate?: string | null;
  stage: FinancialStage;
  dateStatus: DateStatus;
  priority: FinancialPriority;
  createdBy: string;
  paidBy?: string | null;
};

type Props = {
  dictionary: Dictionary;
  title: string;
  searchQuery: string;
  categoryFilter: string;
  categories: string[];
  rows: FinancialRecordRow[];
  page: number;
  pageSize: number;
  totalRows: number;
  lastPage: number;
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onClearFilters: () => void;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextPageSize: number) => void;
  onEdit: (recordId: string) => void;
  onMoveToPaymentRequest: (recordId: string) => void;
  onMarkPaid: (recordId: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date?: string | null) => string;
  priorityLabel: (priority: FinancialPriority) => string;
  priorityClassName: (priority: FinancialPriority) => string;
  dateStatusLabel: (status: DateStatus) => string;
  dateStatusClassName: (status: DateStatus) => string;
};

export function FinancialRecordTableSection({
  dictionary,
  title,
  searchQuery,
  categoryFilter,
  categories,
  rows,
  page,
  pageSize,
  totalRows,
  lastPage,
  onSearchChange,
  onCategoryFilterChange,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onMoveToPaymentRequest,
  onMarkPaid,
  formatCurrency,
  formatDate,
  priorityLabel,
  priorityClassName,
  dateStatusLabel,
  dateStatusClassName,
}: Props) {
  const actionLabel = (record: FinancialRecordRow) => {
    if (record.stage === "submission") {
      return dictionary?.actions?.submission ?? "Send to payment request";
    }
    if (record.stage === "payment_request") {
      return dictionary?.actions?.payment_request ?? "Mark as paid";
    }
    return dictionary?.actions?.paid ?? "Paid";
  };

  const actionIcon = (record: FinancialRecordRow) =>
    record.stage === "payment_request" ? CheckCircle2 : ArrowRightLeft;

  const runPrimaryAction = (record: FinancialRecordRow) => {
    if (record.stage === "submission") onMoveToPaymentRequest(record.id);
    if (record.stage === "payment_request") onMarkPaid(record.id);
  };

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-[#34363B] dark:bg-[#1C1D21]">
      <CardHeader className="gap-4 border-b border-slate-100 pb-5 dark:border-[#34363B]">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl text-slate-900 dark:text-slate-100">{title}</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {totalRows} {dictionary?.tabs?.transactions_suffix ?? "records"}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_240px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={dictionary?.toolbar?.search_placeholder ?? "Search expense, vendor, category..."}
              className="h-11 rounded-xl border-slate-200 pl-9 dark:border-[#34363B] dark:bg-[#23252B]"
            />
          </div>
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="h-11 cursor-pointer rounded-xl border-slate-200 dark:border-[#34363B] dark:bg-[#23252B]">
              <SelectValue placeholder={dictionary?.toolbar?.all_category ?? "All categories"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                {dictionary?.toolbar?.all_category ?? "All categories"}
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="cursor-pointer">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11 rounded-xl" onClick={onClearFilters}>
            {dictionary?.button_reset ?? "Reset"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <div className="hidden overflow-hidden rounded-xl border border-slate-200 md:block dark:border-[#34363B]">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-[#23252B]">
              <TableRow>
                <TableHead className="px-4">{dictionary?.table?.expense ?? "Expense"}</TableHead>
                <TableHead>{dictionary?.table?.category ?? "Category"}</TableHead>
                <TableHead>{dictionary?.table?.amount ?? "Amount"}</TableHead>
                <TableHead>{dictionary?.table?.status ?? "Status"}</TableHead>
                <TableHead>{dictionary?.table?.date ?? "Date"}</TableHead>
                <TableHead className="px-4 text-right">{dictionary?.table?.actions ?? "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{record.title}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          <span>{record.id}</span>
                          <span>•</span>
                          <span>{record.vendor}</span>
                          <span>•</span>
                          <span>{dictionary?.table?.created_by_prefix ?? "By"} {record.createdBy}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{record.category}</p>
                        <Badge className={cn("rounded-full border-0", priorityClassName(record.priority))}>
                          {priorityLabel(record.priority)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(record.amount)}</TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full border", dateStatusClassName(record.dateStatus))}>
                        {dateStatusLabel(record.dateStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {record.stage === "paid"
                        ? formatDate(record.paymentDate)
                        : record.stage === "submission"
                          ? formatDate(record.date)
                          : formatDate(record.dueDate)}
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <RowActions
                        record={record}
                        actionLabel={actionLabel(record)}
                        actionIcon={actionIcon(record)}
                        onEdit={onEdit}
                        onPrimaryAction={runPrimaryAction}
                        actionsLabel={dictionary?.table?.actions ?? "Actions"}
                        editLabel={dictionary?.button_edit ?? "Edit"}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                    {dictionary?.table?.empty_title ?? "No matching data found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 md:hidden">
          {rows.length ? (
            rows.map((record) => (
              <div key={record.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#34363B] dark:bg-[#23252B]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{record.title}</p>
                    <p className="text-xs text-slate-500">{record.id} • {record.vendor}</p>
                  </div>
                  <RowActions
                    record={record}
                    actionLabel={actionLabel(record)}
                    actionIcon={actionIcon(record)}
                    onEdit={onEdit}
                    onPrimaryAction={runPrimaryAction}
                    actionsLabel={dictionary?.table?.actions ?? "Actions"}
                    editLabel={dictionary?.button_edit ?? "Edit"}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Info label={dictionary?.table?.category ?? "Category"} value={record.category} />
                  <Info label={dictionary?.table?.amount ?? "Amount"} value={formatCurrency(record.amount)} />
                  <Info
                    label={dictionary?.table?.date ?? "Date"}
                    value={record.stage === "paid" ? formatDate(record.paymentDate) : formatDate(record.dueDate || record.date)}
                  />
                  <div>
                    <p className="text-xs text-slate-500">{dictionary?.table?.status ?? "Status"}</p>
                    <Badge className={cn("mt-1 rounded-full border", dateStatusClassName(record.dateStatus))}>
                      {dateStatusLabel(record.dateStatus)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
              {dictionary?.table?.empty_title ?? "No matching data found"}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            {dictionary?.table?.showing_prefix ?? "Showing"} {rows.length} {dictionary?.table?.showing_middle ?? "of"} {totalRows} {dictionary?.table?.showing_suffix ?? "records"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-9 cursor-pointer rounded-md border bg-background px-2 text-sm"
              value={String(pageSize)}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>{size} / {dictionary?.table?.page_size_suffix ?? "page"}</option>
              ))}
            </select>
            <Button variant="outline" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              {dictionary?.table?.prev ?? "Prev"}
            </Button>
            <span className="text-sm">
              {dictionary?.table?.page_label ?? "Page"} {page} / {lastPage}
            </span>
            <Button variant="outline" onClick={() => onPageChange(page + 1)} disabled={page >= lastPage}>
              {dictionary?.table?.next ?? "Next"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RowActions({
  record,
  actionLabel,
  actionIcon: ActionIcon,
  onEdit,
  onPrimaryAction,
  actionsLabel,
  editLabel,
}: {
  record: FinancialRecordRow;
  actionLabel: string;
  actionIcon: typeof ArrowRightLeft;
  onEdit: (recordId: string) => void;
  onPrimaryAction: (record: FinancialRecordRow) => void;
  actionsLabel: string;
  editLabel: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{actionsLabel}</DropdownMenuLabel>
        {record.stage !== "paid" ? (
          <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(record.id)}>
            <FilePenLine className="size-4" />
            {editLabel}
          </DropdownMenuItem>
        ) : null}
        {record.stage !== "paid" ? (
          <DropdownMenuItem className="cursor-pointer" onClick={() => onPrimaryAction(record)}>
            <ActionIcon className="size-4" />
            {actionLabel}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
