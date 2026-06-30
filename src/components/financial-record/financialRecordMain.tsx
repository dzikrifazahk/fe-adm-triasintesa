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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileClock,
  Plus,
  ReceiptText,
  RefreshCcw,
  Upload,
  WalletCards,
} from "lucide-react";
import { openSwal } from "@/lib/swal";
import { IFinancialRecordItem } from "@/types/financial-record";

type Dictionary = Awaited<
  ReturnType<typeof getDictionary>
>["financial_record_page_dic"];

type Props = {
  dictionary: Dictionary;
};

type FinancialStage = "submission" | "payment_request" | "paid";
type FinancialPriority = "high" | "medium" | "low";
type FinancialSource = "flash_cash" | "invoice" | "man_power" | "reimbursement";
type DateStatus = "open" | "due_date" | "overdue" | "paid";

type FinancialRecord = IFinancialRecordItem & {
  source: FinancialSource;
  priority: FinancialPriority;
};

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
  const copy = dictionary;
  const [activeTab, setActiveTab] = useState<FinancialStage>("submission");
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);
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

  async function loadRecords() {
    const response = await financialRecordService.getFinancialRecords({
      page: 1,
      limit: 200,
    });

    const rows = unwrapList<IFinancialRecordItem>(response).map((row) => ({
      ...row,
      source: row.source,
      sourceId: row.sourceId ?? null,
      amount: Number(row.amount || 0),
      priority: row.priority || getPriorityFromAmount(Number(row.amount || 0)),
      vendor: row.vendor || sourceLabels[row.source],
      dateStatus: row.dateStatus || (row.stage === "paid" ? "paid" : "open"),
    })) as FinancialRecord[];

    setRecords(rows.sort((a, b) => (b.date || "").localeCompare(a.date || "")));
  }

  async function handleRefetch() {
    setIsRefreshing(true);
    try {
      await loadRecords();
    } catch (error) {
      openSwal({ icon: "error", title: "Gagal memuat data", text: getErrorMessage(error) });
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    handleRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stageLabels: Record<FinancialStage, string> = {
    submission: copy?.tabs?.submission ?? "Submission",
    payment_request: copy?.tabs?.payment_request ?? "Payment Request",
    paid: copy?.tabs?.paid ?? "Paid",
  };

  const tabCounts = {
    submission: records.filter((record) => record.stage === "submission").length,
    payment_request: records.filter((record) => record.stage === "payment_request").length,
    paid: records.filter((record) => record.stage === "paid").length,
  };

  const stats = [
    {
      label: "Active expenses",
      value: formatCurrency(
        records.filter((record) => record.stage !== "paid").reduce((total, record) => total + record.amount, 0),
      ),
      hint: "Submission dan payment request",
      icon: CircleDollarSign,
    },
    {
      label: "Due / Overdue",
      value: `${records.filter((record) => record.stage !== "paid" && ["due_date", "overdue"].includes(record.dateStatus)).length} item`,
      hint: "Perlu perhatian finance",
      icon: ReceiptText,
    },
    {
      label: "Already paid",
      value: formatCurrency(records.filter((record) => record.stage === "paid").reduce((total, record) => total + record.amount, 0)),
      hint: `${tabCounts.paid} completed transactions`,
      icon: WalletCards,
    },
  ];

  const categories = useMemo(() => Array.from(new Set(records.map((record) => record.category))).sort(), [records]);
  const normalizedSearch = deferredSearchQuery.trim().toLowerCase();

  const filteredRecords = records.filter((record) => {
    if (record.stage !== activeTab) return false;
    const matchesSearch =
      !normalizedSearch ||
      [record.id, record.title, record.vendor, record.category, record.createdBy]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesCategory = categoryFilter === "all" || record.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredLastPage = Math.max(1, Math.ceil(filteredRecords.length / tablePageSize));
  const pagedFilteredRecords = filteredRecords.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);

  useEffect(() => {
    setTablePage(1);
  }, [activeTab, deferredSearchQuery, categoryFilter, tablePageSize]);

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
    const editingRecord = editingRecordId ? records.find((record) => record.id === editingRecordId) : null;
    if (!editingRecord && !attachment) {
      openSwal({ icon: "warning", title: "Attachment wajib diupload." });
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
        title: "Financial record berhasil disimpan",
        toast: true,
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      openSwal({ icon: "error", title: "Gagal menyimpan data", text: getErrorMessage(error) });
    }
  }

  async function handleMoveToPaymentRequest(recordId: string) {
    const record = records.find((item) => item.id === recordId);
    if (!record) return;
    try {
      await financialRecordService.moveFinancialRecordToPaymentRequest(record.ledgerId, {
        dueDate: record.dueDate || record.periodEndDate || record.date,
      });
      await handleRefetch();
    } catch (error) {
      openSwal({ icon: "error", title: "Gagal memindahkan record", text: getErrorMessage(error) });
    }
  }

  function openPaymentDialog(recordId: string) {
    setPaymentRecordId(recordId);
    setPaymentDate(todayString());
    setPaymentNotes("");
    setPaymentProof(null);
  }

  async function handleMarkPaid() {
    const record = records.find((item) => item.id === paymentRecordId);
    const fileError = validateFile(paymentProof);
    if (!record) return;
    if (!paymentProof) {
      openSwal({ icon: "warning", title: "Bukti pembayaran wajib diupload." });
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
        title: "Record sudah ditandai paid",
        toast: true,
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      openSwal({ icon: "error", title: "Gagal memproses pembayaran", text: getErrorMessage(error) });
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
              Kelola pengeluaran dari submission, payment request, sampai paid.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary" onClick={openCreateDialog}>
              <Plus className="size-4" />
              Add Expense
            </Button>
            <Button variant="outline" onClick={handleRefetch} disabled={isRefreshing}>
              <RefreshCcw className={cn("size-4", isRefreshing && "animate-spin")} />
              Re-fetch Data
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

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FinancialStage)} className="gap-4">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-2xl bg-slate-100 p-2 md:grid-cols-3">
            {(["submission", "payment_request", "paid"] satisfies FinancialStage[]).map((stage) => {
              const Icon = getStageIcon(stage);
              return (
                <TabsTrigger
                  key={stage}
                  value={stage}
                  className="flex min-h-[72px] justify-start rounded-xl px-4 py-3 text-left data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-iprimary-blue/10 p-2 text-iprimary-blue">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{stageLabels[stage]}</p>
                      <p className="text-xs text-slate-500">{tabCounts[stage]} transactions</p>
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
                rows={pagedFilteredRecords}
                page={tablePage}
                pageSize={tablePageSize}
                totalRows={filteredRecords.length}
                lastPage={filteredLastPage}
                onSearchChange={setSearchQuery}
                onCategoryFilterChange={setCategoryFilter}
                onClearFilters={clearFilters}
                onPageChange={(nextPage) => {
                  if (nextPage < 1 || nextPage > filteredLastPage) return;
                  setTablePage(nextPage);
                }}
                onPageSizeChange={(nextPageSize) => {
                  setTablePageSize(nextPageSize);
                  setTablePage(1);
                }}
                onEdit={(recordId) => {
                  const record = records.find((item) => item.id === recordId);
                  if (record) openEditDialog(record);
                }}
                onMoveToPaymentRequest={handleMoveToPaymentRequest}
                onMarkPaid={openPaymentDialog}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                priorityLabel={(priority) => priorityMeta[priority].label}
                priorityClassName={(priority) => priorityMeta[priority].className}
                dateStatusLabel={(status) => dateStatusMeta[status].label}
                dateStatusClassName={(status) => dateStatusMeta[status].className}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingRecordId ? "Edit Expense" : "Tambah Expense"}</DialogTitle>
            <DialogDescription>
              Attachment hanya gambar atau PDF dengan ukuran maksimal 3MB.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipe Pengeluaran</Label>
              <Select value={form.sourceType} onValueChange={(value) => handleSourceChange(value as FinancialSource)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flash_cash">Flash Cash</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="reimbursement">Reimbursement</SelectItem>
                  <SelectItem value="man_power">Man Power</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={(value) => handleFormChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sourceCategories[form.sourceType].map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Judul Expense</Label>
              <Input value={form.title} onChange={(event) => handleFormChange("title", event.target.value)} placeholder="Contoh: Pembelian material GRH" />
            </div>
            <div className="space-y-2">
              <Label>{form.sourceType === "reimbursement" ? "Claimant" : "Vendor / Penerima"}</Label>
              <Input value={form.vendor} onChange={(event) => handleFormChange("vendor", event.target.value)} placeholder="Nama vendor atau penerima" />
            </div>
            <div className="space-y-2">
              <Label>Nominal</Label>
              <Input type="number" min="0" value={form.amount} onChange={(event) => handleFormChange("amount", event.target.value)} placeholder="0" />
            </div>

            {!isRangeType ? (
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input type="date" value={form.expenseDate} onChange={(event) => handleFormChange("expenseDate", event.target.value)} />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input type="date" value={form.periodStartDate} onChange={(event) => handleFormChange("periodStartDate", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <Input type="date" value={form.periodEndDate} onChange={(event) => {
                    handleFormChange("periodEndDate", event.target.value);
                    handleFormChange("dueDate", event.target.value);
                  }} />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={(event) => handleFormChange("dueDate", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Attachment</Label>
              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm text-slate-600">
                <Upload className="size-4" />
                <span className="truncate">{attachment?.name || "Upload gambar / PDF"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea value={form.description} onChange={(event) => handleFormChange("description", event.target.value)} className="min-h-28" placeholder="Tambahkan catatan atau konteks pengeluaran" />
            </div>
          </div>

          {hasValidationError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Lengkapi tipe, judul, kategori, tanggal, dan nominal lebih dari 0.
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleSaveRecord} disabled={hasValidationError}>
              Simpan Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!paymentRecordId} onOpenChange={(open) => !open && setPaymentRecordId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Catat Pembayaran</DialogTitle>
            <DialogDescription>
              Isi tanggal pembayaran dan upload bukti pembayaran gambar atau PDF maksimal 3MB.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tanggal Pembayaran</Label>
              <Input type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bukti Pembayaran</Label>
              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm text-slate-600">
                <Upload className="size-4" />
                <span className="truncate">{paymentProof?.name || "Upload bukti pembayaran"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(event) => setPaymentProof(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea value={paymentNotes} onChange={(event) => setPaymentNotes(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentRecordId(null)}>Batal</Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleMarkPaid}>
              Simpan Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
