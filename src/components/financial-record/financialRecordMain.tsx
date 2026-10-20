"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getDictionary } from "../../../get-dictionary";
import { financialRecordService } from "@/services";
import { FinancialRecordTableSection } from "@/components/financial-record/financialRecordTableSection";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileClock,
  FileText,
  Info,
  NotebookPen,
  Paperclip,
  Plus,
  ReceiptText,
  RefreshCcw,
  Save,
  StickyNote,
  Tag,
  Type,
  Upload,
  Users,
  Wallet,
  WalletCards,
  X,
} from "lucide-react";
import { openSwal } from "@/lib/swal";
import { IFinancialRecordItem } from "@/types/financial-record";
import { Combobox } from "@/components/ui/combobox";

import { CurrencyInput } from "@/components/ui/currency-input";
import { useFormText } from "@/hooks/use-form-text";
type Dictionary = Awaited<
  ReturnType<typeof getDictionary>
>["financial_record_page_dic"];

type Props = {
  dictionary: Dictionary;
};

const NOTES_MAX_LENGTH = 500;

const EXPENSE_TYPE_OPTIONS: { value: FinancialSource; label: string; icon: React.ReactNode }[] = [
  { value: "flash_cash", label: "Flash Cash", icon: <Wallet className="size-4" /> },
  { value: "invoice", label: "Invoice", icon: <FileText className="size-4" /> },
  { value: "reimbursement", label: "Reimbursement", icon: <ReceiptText className="size-4" /> },
  { value: "man_power", label: "Man Power", icon: <Users className="size-4" /> },
];

function FieldIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300",
        className,
      )}
    >
      {children}
    </span>
  );
}

function FormSection({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]",
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-iprimary-blue dark:bg-blue-500/15 dark:text-blue-300">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FormLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">
      {children}
      {required ? <span className="text-red-500">*</span> : null}
    </Label>
  );
}

function IconCurrencyInput({
  icon,
  className,
  ...props
}: React.ComponentProps<typeof CurrencyInput> & { icon: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-1.5 flex items-center">
        {icon}
      </span>
      <CurrencyInput className={cn("h-11 pl-12", className)} {...props} />
    </div>
  );
}

function IconInput({
  icon,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { icon: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-1.5 flex items-center">
        {icon}
      </span>
      <Input className={cn("h-11 pl-12", className)} {...props} />
    </div>
  );
}

type FinancialStage = "submission" | "payment_request" | "paid";
type FinancialPriority = "high" | "medium" | "low";
type FinancialSource = "flash_cash" | "invoice" | "man_power" | "reimbursement";
type DateStatus = "open" | "due_date" | "overdue" | "paid";

type FinancialRecord = IFinancialRecordItem & {
  source: FinancialSource;
  priority: FinancialPriority;
};

type PaginationMeta = {
  totalItems?: number;
  total?: number;
  totalPages?: number;
  last_page?: number;
  current_page?: number;
  page?: number;
  per_page?: number;
  limit?: number;
};

type StageCache = Record<FinancialStage, FinancialRecord[]>;
type StageTotals = Record<FinancialStage, number>;

type FormState = {
  sourceType: FinancialSource;
  title: string;
  vendor: string;
  category: string;
  amount: string;
  expenseDate: string;
  periodStartDate: string;
  periodEndDate: string;
  dueDate: string;
  description: string;
};

const todayString = () => new Date().toISOString().slice(0, 10);

const defaultFormState = (): FormState => {
  const today = todayString();
  return {
    sourceType: "flash_cash",
    title: "",
    vendor: "",
    category: "Operational",
    amount: "",
    expenseDate: today,
    periodStartDate: today,
    periodEndDate: today,
    dueDate: today,
    description: "",
  };
};

const sourceLabels: Record<FinancialSource, string> = {
  flash_cash: "Flash Cash",
  invoice: "Invoice",
  reimbursement: "Reimbursement",
  man_power: "Man Power",
};

const sourceCategories: Record<FinancialSource, string[]> = {
  flash_cash: ["Operational", "Logistics", "Utilities", "Maintenance"],
  invoice: ["Supplier Invoice", "Purchase", "Operational", "Utilities"],
  reimbursement: ["Transport", "Meal", "Accommodation", "Medical", "Office"],
  man_power: ["Salary", "Overtime", "Daily Worker", "Service Fee"],
};

const allCategories = Array.from(new Set(Object.values(sourceCategories).flat())).sort();

const priorityMeta: Record<FinancialPriority, { label: string; className: string }> = {
  high: { label: "High", className: "bg-rose-50 text-rose-700" },
  medium: { label: "Medium", className: "bg-amber-50 text-amber-700" },
  low: { label: "Low", className: "bg-emerald-50 text-emerald-700" },
};

const dateStatusMeta: Record<DateStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "border-sky-200 bg-sky-50 text-sky-700" },
  due_date: { label: "Due Date", className: "border-amber-200 bg-amber-50 text-amber-700" },
  overdue: { label: "Overdue", className: "border-red-200 bg-red-50 text-red-700" },
  paid: { label: "Paid", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapData<T>(value: unknown): T {
  if (isRecord(value) && "data" in value) return value.data as T;
  return value as T;
}

function unwrapList<T>(value: unknown): T[] {
  const payload = unwrapData<{ data?: T[] } | T[]>(value);
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.data) ? payload.data : [];
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan.";
}

function getPriorityFromAmount(amount: number): FinancialPriority {
  if (amount >= 10000000) return "high";
  if (amount >= 3000000) return "medium";
  return "low";
}

function validateFile(file?: File | null): string | null {
  if (!file) return null;
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(file.type)) return "Attachment hanya boleh gambar JPG/PNG/WebP atau PDF.";
  if (file.size > 3_000_000) return "Ukuran file maksimal 3MB.";
  return null;
}

function appendIfValue(formData: FormData, key: string, value?: string | null) {
  if (value !== undefined && value !== null && String(value).trim()) {
    formData.append(key, String(value));
  }
}

function getStageIcon(stage: FinancialStage) {
  if (stage === "submission") return FileClock;
  if (stage === "payment_request") return CreditCard;
  return CheckCircle2;
}

export default function FinancialRecordMain({ dictionary }: Props) {
  const t = useFormText();
  const copy = dictionary;
  const [activeTab, setActiveTab] = useState<FinancialStage>("submission");
  const [recordsByStage, setRecordsByStage] = useState<StageCache>({
    submission: [],
    payment_request: [],
    paid: [],
  });
  const [stageTotals, setStageTotals] = useState<StageTotals>({
    submission: 0,
    payment_request: 0,
    paid: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [paymentRecordId, setPaymentRecordId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState(todayString());
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  async function loadRecords(stage: FinancialStage = activeTab) {
    const response = await financialRecordService.getFinancialRecords({
      stage,
      page: tablePage,
      limit: tablePageSize,
      search: deferredSearchQuery.trim() || undefined,
      category: categoryFilter === "all" ? undefined : categoryFilter,
    });

    const payload = unwrapData<{ data?: IFinancialRecordItem[]; meta?: PaginationMeta } | IFinancialRecordItem[]>(response);
    const sourceRows = Array.isArray(payload) ? payload : payload.data ?? [];
    const meta = Array.isArray(payload) ? undefined : payload.meta;
    const rows = sourceRows.map((row) => ({
      ...row,
      source: row.source,
      sourceId: row.sourceId ?? null,
      amount: Number(row.amount || 0),
      priority: row.priority || getPriorityFromAmount(Number(row.amount || 0)),
      vendor: row.vendor || sourceLabels[row.source],
      dateStatus: row.dateStatus || (row.stage === "paid" ? "paid" : "open"),
    })) as FinancialRecord[];

    setRecordsByStage((current) => ({
      ...current,
      [stage]: rows,
    }));
    setStageTotals((current) => ({
      ...current,
      [stage]: Number(meta?.totalItems ?? meta?.total ?? sourceRows.length),
    }));
    setLastPage(Number(meta?.totalPages ?? meta?.last_page ?? 1));
  }

  async function handleRefetch() {
    setIsRefreshing(true);
    try {
      await loadRecords(activeTab);
    } catch (error) {
      openSwal({ icon: "error", title: "Gagal memuat data", text: getErrorMessage(error) });
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    handleRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tablePage, tablePageSize, deferredSearchQuery, categoryFilter]);

  const stageLabels: Record<FinancialStage, string> = {
    submission: copy?.tabs?.submission ?? "Submission",
    payment_request: copy?.tabs?.payment_request ?? "Payment Request",
    paid: copy?.tabs?.paid ?? "Paid",
  };

  const activeRecords = recordsByStage[activeTab];
  const visitedRecords = Object.values(recordsByStage).flat();
  const tabCounts = stageTotals;

  const stats = [
    {
      label: copy?.stats?.active_total ?? "Active expenses",
      value: formatCurrency(
        visitedRecords.filter((record) => record.stage !== "paid").reduce((total, record) => total + record.amount, 0),
      ),
      hint: copy?.stats?.active_total_hint ?? "Submission dan payment request",
      icon: CircleDollarSign,
    },
    {
      label: copy?.stats?.need_review ?? "Due / Overdue",
      value: `${visitedRecords.filter((record) => record.stage !== "paid" && ["due_date", "overdue"].includes(record.dateStatus)).length} ${copy?.stats?.items_suffix ?? "item"}`,
      hint: copy?.stats?.need_review_hint ?? "Perlu perhatian finance",
      icon: ReceiptText,
    },
    {
      label: copy?.stats?.paid_total ?? "Already paid",
      value: formatCurrency(visitedRecords.filter((record) => record.stage === "paid").reduce((total, record) => total + record.amount, 0)),
      hint: `${tabCounts.paid} ${copy?.stats?.paid_total_hint_suffix ?? "completed transactions"}`,
      icon: WalletCards,
    },
  ];

  const categories = useMemo(() => allCategories, []);

  useEffect(() => {
    setTablePage(1);
  }, [deferredSearchQuery, categoryFilter]);

  function openCreateDialog() {
    setEditingRecordId(null);
    setForm(defaultFormState());
    setAttachment(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(record: FinancialRecord) {
    const meta = record.sourceMeta || {};
    const notes = typeof meta.notes === "string" ? meta.notes : record.notes;
    setEditingRecordId(record.id);
    setForm({
      sourceType: record.source,
      title: record.title,
      vendor: record.vendor,
      category: record.category,
      amount: String(record.amount),
      expenseDate: record.date || todayString(),
      periodStartDate: record.periodStartDate || record.date || todayString(),
      periodEndDate: record.periodEndDate || record.dueDate || record.date || todayString(),
      dueDate: record.dueDate || record.periodEndDate || record.date || todayString(),
      description: notes || "",
    });
    setAttachment(null);
    setIsDialogOpen(true);
  }

  function handleFormChange<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSourceChange(sourceType: FinancialSource) {
    setForm((current) => ({
      ...current,
      sourceType,
      category: sourceCategories[sourceType][0],
    }));
  }

  function buildFormData() {
    const formData = new FormData();
    formData.append("sourceType", form.sourceType);
    formData.append("title", form.title.trim());
    formData.append("category", form.category.trim());
    formData.append("amount", String(Number(form.amount)));
    appendIfValue(formData, "vendor", form.vendor.trim());
    appendIfValue(formData, "description", form.description.trim());
    appendIfValue(formData, "dueDate", form.dueDate);
    if (form.sourceType === "flash_cash") {
      formData.append("expenseDate", form.expenseDate);
    } else {
      formData.append("periodStartDate", form.periodStartDate);
      formData.append("periodEndDate", form.periodEndDate);
    }
    if (attachment) formData.append("attachment", attachment);
    return formData;
  }

  async function handleSaveRecord() {
    const fileError = validateFile(attachment);
    const editingRecord = editingRecordId ? activeRecords.find((record) => record.id === editingRecordId) : null;
    if (!editingRecord && !attachment) {
      openSwal({ icon: "warning", title: copy?.form?.attachment_required ?? "Attachment is required." });
      return;
    }
    if (fileError) {
      openSwal({ icon: "warning", title: fileError });
      return;
    }

    try {
      const formData = buildFormData();
      if (editingRecord) {
        await financialRecordService.updateFinancialRecord(editingRecord.ledgerId, formData);
      } else {
        await financialRecordService.createFinancialRecord(formData);
      }

      setIsDialogOpen(false);
      await handleRefetch();
      openSwal({
        icon: "success",
        title: copy?.toast?.save_success ?? "Financial record saved",
        toast: true,
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      openSwal({ icon: "error", title: copy?.toast?.save_error ?? "Failed to save data", text: getErrorMessage(error) });
    }
  }

  async function handleMoveToPaymentRequest(recordId: string) {
    const record = activeRecords.find((item) => item.id === recordId);
    if (!record) return;
    try {
      await financialRecordService.moveFinancialRecordToPaymentRequest(record.ledgerId, {
        dueDate: record.dueDate || record.periodEndDate || record.date,
      });
      await handleRefetch();
    } catch (error) {
      openSwal({ icon: "error", title: copy?.toast?.move_error ?? "Failed to move record", text: getErrorMessage(error) });
    }
  }

  function openPaymentDialog(recordId: string) {
    setPaymentRecordId(recordId);
    setPaymentDate(todayString());
    setPaymentNotes("");
    setPaymentProof(null);
  }

  async function handleMarkPaid() {
    const record = activeRecords.find((item) => item.id === paymentRecordId);
    const fileError = validateFile(paymentProof);
    if (!record) return;
    if (!paymentProof) {
      openSwal({ icon: "warning", title: copy?.form?.payment_proof_required ?? "Payment proof is required." });
      return;
    }
    if (fileError) {
      openSwal({ icon: "warning", title: fileError });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("paymentDate", paymentDate);
      appendIfValue(formData, "notes", paymentNotes);
      formData.append("paymentProof", paymentProof);
      await financialRecordService.markFinancialRecordPaid(record.ledgerId, formData);
      setPaymentRecordId(null);
      await handleRefetch();
      openSwal({
        icon: "success",
        title: copy?.toast?.paid_success ?? "Record marked as paid",
        toast: true,
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      openSwal({ icon: "error", title: copy?.toast?.paid_error ?? "Failed to process payment", text: getErrorMessage(error) });
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setCategoryFilter("all");
    setTablePage(1);
  }

  const isRangeType = form.sourceType !== "flash_cash";
  const hasValidationError =
    !form.title.trim() ||
    !form.category.trim() ||
    Number(form.amount) <= 0 ||
    (form.sourceType === "flash_cash" ? !form.expenseDate : !form.periodStartDate || !form.periodEndDate);

  return (
    <>
      <div className="flex min-h-0 w-full flex-1 flex-col gap-5 overflow-auto">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">
              {dictionary?.title ?? "Financial Record"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {copy?.description ?? "Kelola pengeluaran dari submission, payment request, sampai paid."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary" onClick={openCreateDialog}>
              <Plus className="size-4" />
              {copy?.button_add_expense ?? "Add Expense"}
            </Button>
            <Button variant="outline" onClick={handleRefetch} disabled={isRefreshing}>
              <RefreshCcw className={cn("size-4", isRefreshing && "animate-spin")} />
              {copy?.button_refetch ?? "Re-fetch Data"}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="rounded-2xl border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-2 text-iprimary-blue">
                      <Icon className="size-5" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{item.hint}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setTablePage(1);
            setActiveTab(value as FinancialStage);
          }}
          className="gap-4"
        >
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-2xl bg-slate-100 p-2 md:grid-cols-3">
            {(["submission", "payment_request", "paid"] satisfies FinancialStage[]).map((stage) => {
              const Icon = getStageIcon(stage);
              return (
                <TabsTrigger
                  key={stage}
                  value={stage}
                  className="flex min-h-[72px] cursor-pointer justify-start rounded-xl px-4 py-3 text-left data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-iprimary-blue/10 p-2 text-iprimary-blue">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{stageLabels[stage]}</p>
                      <p className="text-xs text-slate-500">
                        {tabCounts[stage]} {copy?.tabs?.transactions_suffix ?? "transactions"}
                      </p>
                    </div>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(["submission", "payment_request", "paid"] satisfies FinancialStage[]).map((stage) => (
            <TabsContent key={stage} value={stage}>
              <FinancialRecordTableSection
                dictionary={copy}
                title={stageLabels[stage]}
                searchQuery={searchQuery}
                categoryFilter={categoryFilter}
                categories={categories}
                rows={recordsByStage[stage]}
                page={tablePage}
                pageSize={tablePageSize}
                totalRows={tabCounts[stage]}
                lastPage={lastPage}
                onSearchChange={setSearchQuery}
                onCategoryFilterChange={setCategoryFilter}
                onClearFilters={clearFilters}
                onPageChange={(nextPage) => {
                  if (nextPage < 1 || nextPage > lastPage) return;
                  setTablePage(nextPage);
                }}
                onPageSizeChange={(nextPageSize) => {
                  setTablePageSize(nextPageSize);
                  setTablePage(1);
                }}
                onEdit={(recordId) => {
                  const record = activeRecords.find((item) => item.id === recordId);
                  if (record) openEditDialog(record);
                }}
                onMoveToPaymentRequest={handleMoveToPaymentRequest}
                onMarkPaid={openPaymentDialog}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                priorityLabel={(priority) => priorityMeta[priority].label}
                priorityClassName={(priority) => priorityMeta[priority].className}
                dateStatusLabel={(status) => copy?.statuses?.[status] ?? dateStatusMeta[status].label}
                dateStatusClassName={(status) => dateStatusMeta[status].className}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-3xl">
          <DialogHeader className="flex-row items-start gap-4 space-y-0 px-6 pt-6 text-left">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-iprimary-blue dark:bg-blue-500/15 dark:text-blue-300">
              <FileText className="size-6" />
            </span>
            <div className="space-y-1">
              <DialogTitle className="text-2xl">
                {editingRecordId
                  ? copy?.form?.edit_title ?? "Edit Expense"
                  : copy?.form?.create_title ?? "Tambah Expense"}
              </DialogTitle>
              <DialogDescription>
                Lengkapi informasi pengeluaran dan unggah bukti pembayaran.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-4 px-6">
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-iprimary-blue dark:bg-blue-500/10 dark:text-blue-300">
              <Info className="size-5 shrink-0" />
              {copy?.form?.attachment_hint ?? "Attachment hanya gambar atau PDF dengan ukuran maksimal 3MB."}
            </div>

            <FormSection
              icon={<NotebookPen className="size-4" />}
              title="Informasi Utama"
              description="Pilih tipe, kategori, dan masukkan judul pengeluaran."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FormLabel required>{copy?.form?.expense_type_label ?? "Tipe Pengeluaran"}</FormLabel>
                  <Combobox
                    options={EXPENSE_TYPE_OPTIONS}
                    value={form.sourceType}
                    onValueChange={(value) => handleSourceChange(value as FinancialSource)}
                    placeholder={t.finance.selectExpenseType}
                    searchable={false}
                    className="h-11 pl-1.5 bg-background"
                    icon={
                      <FieldIcon className="bg-blue-50 text-iprimary-blue dark:bg-blue-500/15 dark:text-blue-300">
                        {EXPENSE_TYPE_OPTIONS.find((option) => option.value === form.sourceType)?.icon ?? (
                          <Wallet className="size-4" />
                        )}
                      </FieldIcon>
                    }
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel required>{copy?.form?.category_label ?? "Kategori"}</FormLabel>
                  <Combobox
                    options={sourceCategories[form.sourceType].map((category) => ({
                      value: category,
                      label: category,
                    }))}
                    value={form.category}
                    onValueChange={(value) => handleFormChange("category", value)}
                    placeholder={t.common.selectCategory}
                    searchPlaceholder={t.common.searchCategory}
                    className="h-11 pl-1.5 bg-background capitalize"
                    contentClassName="capitalize"
                    icon={
                      <FieldIcon className="bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                        <Tag className="size-4" />
                      </FieldIcon>
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <FormLabel required>{copy?.form?.title_label ?? "Judul Expense"}</FormLabel>
                  <IconInput
                    icon={<FieldIcon><Type className="size-4" /></FieldIcon>}
                    value={form.title}
                    onChange={(event) => handleFormChange("title", event.target.value)}
                    placeholder={copy?.form?.title_placeholder ?? "Contoh: Pengadaan bahan baku tambahan"}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              icon={<CalendarDays className="size-4" />}
              title="Detail Transaksi"
              description="Isi informasi vendor, nominal, dan tanggal transaksi."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FormLabel>
                    {form.sourceType === "reimbursement"
                      ? copy?.form?.claimant_label ?? "Claimant"
                      : copy?.form?.vendor_label ?? "Vendor"}
                  </FormLabel>
                  <IconInput
                    icon={<FieldIcon><Building2 className="size-4" /></FieldIcon>}
                    value={form.vendor}
                    onChange={(event) => handleFormChange("vendor", event.target.value)}
                    placeholder={copy?.form?.vendor_placeholder ?? "Nama vendor"}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel required>{copy?.form?.amount_label ?? "Nominal"}</FormLabel>
                  <IconCurrencyInput
                    icon={
                      <FieldIcon className="bg-emerald-50 text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                        Rp
                      </FieldIcon>
                    }
                    showPrefix={false}
                    value={form.amount}
                    onValueChange={(value) => handleFormChange("amount", value)}
                    placeholder={copy?.form?.amount_placeholder ?? "0"}
                  />
                </div>

                {!isRangeType ? (
                  <div className="space-y-2">
                    <FormLabel required>{copy?.form?.date_label ?? "Tanggal"}</FormLabel>
                    <IconInput
                      icon={<FieldIcon><CalendarDays className="size-4" /></FieldIcon>}
                      type="date"
                      value={form.expenseDate}
                      onChange={(event) => handleFormChange("expenseDate", event.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <FormLabel required>{copy?.form?.period_start_label ?? "Tanggal Mulai"}</FormLabel>
                      <IconInput
                        icon={<FieldIcon><CalendarDays className="size-4" /></FieldIcon>}
                        type="date"
                        value={form.periodStartDate}
                        onChange={(event) => handleFormChange("periodStartDate", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormLabel required>{copy?.form?.period_end_label ?? "Tanggal Selesai"}</FormLabel>
                      <IconInput
                        icon={<FieldIcon><CalendarDays className="size-4" /></FieldIcon>}
                        type="date"
                        value={form.periodEndDate}
                        onChange={(event) => {
                          handleFormChange("periodEndDate", event.target.value);
                          handleFormChange("dueDate", event.target.value);
                        }}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <FormLabel>{copy?.form?.due_date_label ?? "Due Date"}</FormLabel>
                  <IconInput
                    icon={<FieldIcon><CalendarDays className="size-4" /></FieldIcon>}
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => handleFormChange("dueDate", event.target.value)}
                  />
                </div>
              </div>
            </FormSection>

            <div className="grid gap-4 md:grid-cols-2">
              <FormSection
                icon={<Paperclip className="size-4" />}
                title={copy?.form?.attachment_label ?? "Attachment"}
                description="Unggah bukti pengeluaran."
              >
                <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-blue-200 bg-background px-4 py-4 text-center transition hover:border-iprimary-blue hover:bg-blue-50/50 dark:border-blue-400/30 dark:hover:bg-blue-500/5">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
                  />
                  {attachment ? (
                    <>
                      <FileText className="size-6 text-iprimary-blue dark:text-blue-300" />
                      <span className="max-w-full truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {attachment.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {(attachment.size / 1024 / 1024).toFixed(2)} MB • klik untuk ganti
                      </span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          setAttachment(null);
                        }}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-red-500 hover:underline"
                      >
                        <X className="size-3" /> Hapus file
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="size-6 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm font-medium text-iprimary-blue dark:text-blue-300">
                        {copy?.form?.attachment_placeholder ?? "Upload gambar / PDF"}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Maksimal 3MB per file</span>
                    </>
                  )}
                </label>
              </FormSection>

              <FormSection
                icon={<StickyNote className="size-4" />}
                title={copy?.form?.notes_label ?? "Catatan"}
                description="Tambahkan catatan review, invoice, atau konteks pembayaran."
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-2 top-2">
                    <FieldIcon><NotebookPen className="size-4" /></FieldIcon>
                  </span>
                  <Textarea
                    value={form.description}
                    onChange={(event) => handleFormChange("description", event.target.value)}
                    maxLength={NOTES_MAX_LENGTH}
                    className="min-h-28 bg-background pl-12"
                    placeholder={copy?.form?.notes_placeholder ?? "Tambahkan catatan review, invoice, atau konteks pembayaran"}
                  />
                </div>
                <div className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">
                  {form.description.length}/{NOTES_MAX_LENGTH}
                </div>
              </FormSection>
            </div>

            {hasValidationError ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                {copy?.form?.validation ?? "Lengkapi tipe, judul, kategori, tanggal, dan nominal lebih dari 0."}
              </div>
            ) : null}
          </div>

          <DialogFooter className="border-t px-6 py-4 dark:border-white/10">
            <Button variant="outline" className="h-11 px-6" onClick={() => setIsDialogOpen(false)}>
              {copy?.button_cancel ?? "Batal"}
            </Button>
            <Button
              className="h-11 bg-iprimary-blue px-6 text-white hover:bg-iprimary-blue-tertiary"
              onClick={handleSaveRecord}
              disabled={hasValidationError}
            >
              <Save className="size-4" />
              {editingRecordId ? copy?.button_save_changes ?? "Simpan Perubahan" : copy?.button_save ?? "Simpan Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!paymentRecordId} onOpenChange={(open) => !open && setPaymentRecordId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{copy?.payment?.title ?? "Record Payment"}</DialogTitle>
            <DialogDescription>
              {copy?.payment?.description ?? "Fill payment date and upload payment proof image or PDF up to 3MB."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{copy?.payment?.date_label ?? "Payment Date"} <span className="ml-0.5 text-red-500">*</span></Label>
              <Input type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{copy?.payment?.proof_label ?? "Payment Proof"} <span className="ml-0.5 text-red-500">*</span></Label>
              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm text-slate-600">
                <Upload className="size-4" />
                <span className="truncate">
                  {paymentProof?.name || copy?.payment?.proof_placeholder || "Upload payment proof"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(event) => setPaymentProof(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <div className="space-y-2">
              <Label>{copy?.form?.notes_label ?? "Notes"}</Label>
              <Textarea value={paymentNotes} onChange={(event) => setPaymentNotes(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentRecordId(null)}>{copy?.button_cancel ?? "Cancel"}</Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleMarkPaid}>
              {copy?.payment?.save_button ?? "Save Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
