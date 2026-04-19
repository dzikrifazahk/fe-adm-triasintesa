"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { getDictionary } from "../../../get-dictionary";
import { financialRecordService } from "@/services";
import { FinancialRecordTableSection } from "@/components/financial-record/financialRecordTableSection";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BanknoteArrowDown,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileClock,
  Plus,
  ReceiptText,
  RefreshCcw,
  WalletCards,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import {
  IFlashCashRecord,
  IInvoiceRecord,
  IManPowerRecord,
  IReimbursementRecord,
} from "@/types/financial-record";

type Dictionary = Awaited<
  ReturnType<typeof getDictionary>
>["financial_record_page_dic"];

type Props = {
  dictionary: Dictionary;
};

type FinancialStage = "submission" | "payment_request" | "paid";
type FinancialPriority = "high" | "medium" | "low";
type FinancialStatus =
  | "need_review"
  | "waiting_budget"
  | "ready_to_pay"
  | "paid";
type FinancialSource = "flash_cash" | "invoice" | "man_power" | "reimbursement";

type FinancialRecord = {
  id: string;
  source: FinancialSource;
  sourceId: number;
  title: string;
  vendor: string;
  category: string;
  amount: number;
  date: string;
  stage: FinancialStage;
  status: FinancialStatus;
  notes: string;
  priority: FinancialPriority;
  createdBy: string;
};

type FilterStatus = "all" | FinancialStatus;
type FilterCategory = "all" | string;

type FormState = {
  source: FinancialSource;
  title: string;
  vendor: string;
  invoiceNumber: string;
  salesOrderId: string;
  customerId: string;
  dueDate: string;
  paymentMethod: "cash" | "termin";
  flashType: "in" | "out";
  referenceType: string;
  recordType: string;
  category: string;
  amount: string;
  date: string;
  stage: FinancialStage;
  status: FinancialStatus;
  priority: FinancialPriority;
  createdBy: string;
  notes: string;
};

const initialRecords: FinancialRecord[] = [];

const defaultFormState: FormState = {
  source: "flash_cash",
  title: "",
  vendor: "",
  invoiceNumber: "",
  salesOrderId: "",
  customerId: "",
  dueDate: "2026-04-15",
  paymentMethod: "cash",
  flashType: "out",
  referenceType: "manual",
  recordType: "man_power",
  category: "Operational",
  amount: "",
  date: "2026-04-15",
  stage: "submission",
  status: "need_review",
  priority: "medium",
  createdBy: "",
  notes: "",
};

const stageMeta: Record<FinancialStage, { accent: string }> = {
  submission: {
    accent: "from-blue-600 via-blue-500 to-cyan-400",
  },
  payment_request: {
    accent: "from-amber-500 via-orange-500 to-rose-400",
  },
  paid: {
    accent: "from-emerald-600 via-teal-500 to-cyan-400",
  },
};

const statusMeta: Record<
  FinancialStatus,
  { label: string; className: string; needsReview: boolean }
> = {
  need_review: {
    label: "Perlu Review",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    needsReview: true,
  },
  waiting_budget: {
    label: "Menunggu Budget",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    needsReview: false,
  },
  ready_to_pay: {
    label: "Siap Dibayar",
    className: "border-violet-200 bg-violet-50 text-violet-700",
    needsReview: false,
  },
  paid: {
    label: "Paid",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    needsReview: false,
  },
};

const priorityMeta: Record<
  FinancialPriority,
  { label: string; className: string }
> = {
  high: {
    label: "High",
    className: "bg-rose-50 text-rose-700",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-50 text-amber-700",
  },
  low: {
    label: "Low",
    className: "bg-emerald-50 text-emerald-700",
  },
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getReviewCount(records: FinancialRecord[], stage: FinancialStage) {
  return records.filter(
    (record) => record.stage === stage && statusMeta[record.status].needsReview,
  ).length;
}

function getStageIcon(stage: FinancialStage) {
  if (stage === "submission") return FileClock;
  if (stage === "payment_request") return CreditCard;
  return CheckCircle2;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapData<T>(value: unknown): T {
  if (isRecord(value) && "data" in value) {
    return value.data as T;
  }
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

function toInt(value: string, fallback = 0): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function mapInvoiceStatusToWorkflow(
  status: IInvoiceRecord["status"],
): { stage: FinancialStage; financialStatus: FinancialStatus } {
  if (status === "paid") return { stage: "paid", financialStatus: "paid" };
  if (status === "issued" || status === "partial_paid" || status === "overdue") {
    return { stage: "payment_request", financialStatus: "ready_to_pay" };
  }
  return { stage: "submission", financialStatus: "need_review" };
}

function mapManPowerStatusToWorkflow(
  status: IManPowerRecord["status"],
): { stage: FinancialStage; financialStatus: FinancialStatus } {
  if (status === "paid") return { stage: "paid", financialStatus: "paid" };
  if (status === "approved") {
    return { stage: "payment_request", financialStatus: "ready_to_pay" };
  }
  if (status === "rejected") {
    return { stage: "submission", financialStatus: "waiting_budget" };
  }
  return { stage: "submission", financialStatus: "need_review" };
}

function mapReimbursementStatusToWorkflow(
  status: IReimbursementRecord["status"],
): { stage: FinancialStage; financialStatus: FinancialStatus } {
  if (status === "approved") {
    return { stage: "payment_request", financialStatus: "ready_to_pay" };
  }
  if (status === "rejected") {
    return { stage: "submission", financialStatus: "waiting_budget" };
  }
  return { stage: "submission", financialStatus: "need_review" };
}

export default function FinancialRecordMain({ dictionary }: Props) {
  const copy = dictionary;
  const [activeTab, setActiveTab] = useState<FinancialStage>("submission");
  const [records, setRecords] = useState<FinancialRecord[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [lastRefetchedAt, setLastRefetchedAt] = useState("Baru saja");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  async function loadRecords() {
    const [flashCashRes, invoicesRes, manPowerRes, reimbursementRes] =
      await Promise.all([
        financialRecordService.getFlashCash({ page: 1, limit: 100 }),
        financialRecordService.getInvoices({ page: 1, limit: 100 }),
        financialRecordService.getManPowerRecords({ page: 1, limit: 100 }),
        financialRecordService.getReimbursements({ page: 1, limit: 100 }),
      ]);

    const flashCashRows = unwrapList<IFlashCashRecord>(flashCashRes).map((row) => {
      const approved = Boolean(row.approvedAt);
      const stage: FinancialStage = approved ? "paid" : "submission";
      const financialStatus: FinancialStatus = approved
        ? "paid"
        : row.requiresApproval
          ? "need_review"
          : "waiting_budget";
      return {
        id: `FC-${row.id}`,
        source: "flash_cash" as const,
        sourceId: row.id,
        title: row.description || `Flash Cash ${row.category}`,
        vendor: row.referenceType || "Flash Cash",
        category: `Flash Cash / ${row.category}`,
        amount: Number(row.amount || 0),
        date: row.transactionDate,
        stage,
        status: financialStatus,
        notes: row.description || "",
        priority: getPriorityFromAmount(Number(row.amount || 0)),
        createdBy: row.approvedBy || "Finance",
      };
    });

    const invoiceRows = unwrapList<IInvoiceRecord>(invoicesRes).map((row) => {
      const workflow = mapInvoiceStatusToWorkflow(row.status);
      return {
        id: `INV-${row.id}`,
        source: "invoice" as const,
        sourceId: row.id,
        title: `Invoice ${row.invoiceNumber}`,
        vendor: `Customer #${row.customerId}`,
        category: "Invoice",
        amount: Number(row.grandTotal || 0),
        date: row.invoiceDate,
        stage: workflow.stage,
        status: workflow.financialStatus,
        notes: row.notes || "",
        priority: getPriorityFromAmount(Number(row.grandTotal || 0)),
        createdBy: "Sales",
      };
    });

    const manPowerRows = unwrapList<IManPowerRecord>(manPowerRes).map((row) => {
      const workflow = mapManPowerStatusToWorkflow(row.status);
      return {
        id: `MP-${row.id}`,
        source: "man_power" as const,
        sourceId: row.id,
        title: row.description || "Man Power",
        vendor: "Man Power",
        category: "Man Power",
        amount: Number(row.amount || 0),
        date: row.recordDate,
        stage: workflow.stage,
        status: workflow.financialStatus,
        notes: row.notes || "",
        priority: getPriorityFromAmount(Number(row.amount || 0)),
        createdBy: "HR/GA",
      };
    });

    const reimbursementRows = unwrapList<IReimbursementRecord>(
      reimbursementRes,
    ).map((row) => {
      const workflow = mapReimbursementStatusToWorkflow(row.status);
      return {
        id: `REIM-${row.id}`,
        source: "reimbursement" as const,
        sourceId: row.id,
        title: row.description || "Reimbursement",
        vendor: row.requestedBy || "Employee",
        category: `Reimbursement / ${row.category}`,
        amount: Number(row.amount || 0),
        date: row.expenseDate,
        stage: workflow.stage,
        status: workflow.financialStatus,
        notes: row.rejectionReason || "",
        priority: getPriorityFromAmount(Number(row.amount || 0)),
        createdBy: row.requestedBy || "Employee",
      };
    });

    setRecords(
      [...flashCashRows, ...invoiceRows, ...manPowerRows, ...reimbursementRows]
        .sort((a, b) => b.date.localeCompare(a.date)),
    );
  }

  useEffect(() => {
    handleRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = Array.from(
    new Set(records.map((record) => record.category)),
  ).sort();

  const tabCounts = {
    submission: records.filter((record) => record.stage === "submission")
      .length,
    payment_request: records.filter(
      (record) => record.stage === "payment_request",
    ).length,
    paid: records.filter((record) => record.stage === "paid").length,
  };

  const reviewCounts = {
    submission: getReviewCount(records, "submission"),
    payment_request: getReviewCount(records, "payment_request"),
  };

  const normalizedSearch = deferredSearchQuery.trim().toLowerCase();

  const filteredRecords = records.filter((record) => {
    if (record.stage !== activeTab) return false;

    const matchesSearch =
      normalizedSearch.length === 0 ||
      [
        record.id,
        record.title,
        record.vendor,
        record.category,
        record.createdBy,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || record.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const activeTabMeta = stageMeta[activeTab];
  const activeTabTotal = tabCounts[activeTab];
  const activeTabAmount = filteredRecords.reduce(
    (total, record) => total + record.amount,
    0,
  );
  const stageLabels = {
    submission: copy?.tabs?.submission ?? "Pengajuan",
    payment_request: copy?.tabs?.payment_request ?? "Permintaan Pembayaran",
    paid: copy?.tabs?.paid ?? "Telah Dibayar",
  };
  const stageDescriptions = {
    submission:
      copy?.tabs?.submission_description ??
      "Expense baru masuk dan menunggu pengecekan awal.",
    payment_request:
      copy?.tabs?.payment_request_description ??
      "Expense yang siap masuk proses pembayaran.",
    paid:
      copy?.tabs?.paid_description ??
      "Riwayat pembayaran yang sudah selesai diproses.",
  };
  const actionLabels = {
    submission: copy?.actions?.submission ?? "Kirim ke permintaan pembayaran",
    payment_request: copy?.actions?.payment_request ?? "Tandai sudah dibayar",
    paid: copy?.actions?.paid ?? "Sudah selesai",
  };

  const stats = [
    {
      label: copy?.stats?.active_total ?? "Total expense aktif",
      value: formatCurrency(
        records
          .filter((record) => record.stage !== "paid")
          .reduce((total, record) => total + record.amount, 0),
      ),
      hint:
        copy?.stats?.active_total_hint ??
        "Akumulasi pengajuan dan permintaan pembayaran",
      icon: CircleDollarSign,
    },
    {
      label: copy?.stats?.need_review ?? "Perlu review",
      value: `${reviewCounts.submission + reviewCounts.payment_request} item`,
      hint:
        copy?.stats?.need_review_hint ?? "Prioritas untuk tim finance hari ini",
      icon: ReceiptText,
    },
    {
      label: copy?.stats?.paid_total ?? "Sudah dibayar",
      value: formatCurrency(
        records
          .filter((record) => record.stage === "paid")
          .reduce((total, record) => total + record.amount, 0),
      ),
      hint: `${tabCounts.paid} ${
        copy?.stats?.paid_total_hint_suffix ?? "transaksi terselesaikan"
      }`,
      icon: WalletCards,
    },
  ];

  function resetForm(nextStageValue: FinancialStage = activeTab) {
    const today = new Date().toISOString().slice(0, 10);
    setForm({
      ...defaultFormState,
      stage: nextStageValue,
      status: nextStageValue === "paid" ? "paid" : "need_review",
      date: today,
      dueDate: today,
    });
  }

  function openCreateDialog() {
    setEditingRecordId(null);
    resetForm(activeTab);
    setIsDialogOpen(true);
  }

  function openEditDialog(record: FinancialRecord) {
    setEditingRecordId(record.id);
    setForm({
      source: record.source,
      title: record.title,
      vendor: record.vendor,
      invoiceNumber: record.source === "invoice" ? record.title.replace(/^Invoice\s+/i, "") : "",
      salesOrderId: "",
      customerId: "",
      dueDate: record.date,
      paymentMethod: "cash",
      flashType: "out",
      referenceType: "manual",
      recordType: record.source === "man_power" ? "man_power" : "man_power",
      category: record.category,
      amount: String(record.amount),
      date: record.date,
      stage: record.stage,
      status: record.status,
      priority: record.priority,
      createdBy: record.createdBy,
      notes: record.notes,
    });
    setIsDialogOpen(true);
  }

  function handleFormChange<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSaveRecord() {
    const parsedAmount = Number(form.amount);
    const trimmedTitle = form.title.trim();
    const trimmedVendor = form.vendor.trim();
    const trimmedCategory = form.category.trim();
    const trimmedNotes = form.notes.trim();

    if (
      !trimmedTitle ||
      !form.createdBy.trim() ||
      !form.date ||
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return;
    }

    try {
      const editingRecord = editingRecordId
        ? records.find((record) => record.id === editingRecordId)
        : null;
      const source = editingRecord?.source ?? form.source;
      const sourceId = editingRecord?.sourceId;

      if (source === "flash_cash") {
        const payload = {
          transactionDate: form.date,
          type: form.flashType,
          category: trimmedCategory,
          amount: parsedAmount,
          description: trimmedTitle,
          referenceType: form.referenceType || "manual",
        };
        if (sourceId) {
          await financialRecordService.updateFlashCash(sourceId, payload);
        } else {
          await financialRecordService.createFlashCash(payload);
        }
      }

      if (source === "invoice") {
        const invoiceNumber =
          form.invoiceNumber.trim() ||
          trimmedTitle.replace(/\s+/g, "-").toUpperCase().slice(0, 20) ||
          `INV-${Date.now()}`;
        const payload = {
          salesOrderId: toInt(form.salesOrderId, 0),
          customerId: toInt(form.customerId, 0),
          invoiceNumber,
          invoiceDate: form.date,
          dueDate: form.dueDate || form.date,
          subtotal: parsedAmount,
          taxAmount: 0,
          discountAmount: 0,
          grandTotal: parsedAmount,
          paymentMethod: form.paymentMethod,
          paymentTermDays: 30,
          notes: trimmedNotes || undefined,
        };
        if (sourceId) {
          await financialRecordService.updateInvoice(sourceId, payload);
        } else {
          await financialRecordService.createInvoice(payload);
        }
      }

      if (source === "man_power") {
        const payload = {
          recordDate: form.date,
          recordType: form.recordType.trim() || "man_power",
          amount: parsedAmount,
          description: trimmedTitle,
          notes: trimmedNotes || undefined,
        };
        if (sourceId) {
          await financialRecordService.updateManPowerRecord(sourceId, payload);
        } else {
          await financialRecordService.createManPowerRecord(payload);
        }
      }

      if (source === "reimbursement") {
        const payload = {
          expenseDate: form.date,
          category: trimmedCategory || "reimbursement",
          amount: parsedAmount,
          description: trimmedTitle,
        };
        if (sourceId) {
          await financialRecordService.updateReimbursement(sourceId, payload);
        } else {
          await financialRecordService.createReimbursement(payload);
        }
      }

      setIsDialogOpen(false);
      await handleRefetch();
      Swal.fire({
        icon: "success",
        title: "Data berhasil disimpan",
        toast: true,
        position: "top-end",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan data",
        text: getErrorMessage(error),
      });
    }
  }

  async function handleAdvanceStage(recordId: string) {
    const record = records.find((item) => item.id === recordId);
    if (!record || record.stage === "paid") return;

    try {
      if (record.source === "invoice") {
        if (record.stage === "submission") {
          await financialRecordService.issueInvoice(record.sourceId);
        } else {
          await financialRecordService.createPayment({
            invoiceId: record.sourceId,
            paymentDate: new Date().toISOString().slice(0, 10),
            amount: record.amount,
            paymentMethod: "cash",
          });
        }
      }

      if (record.source === "man_power") {
        if (record.stage === "submission") {
          await financialRecordService.approveManPowerRecord(record.sourceId);
        } else {
          await financialRecordService.markManPowerPaid(record.sourceId);
        }
      }

      if (record.source === "reimbursement" && record.stage === "submission") {
        await financialRecordService.approveReimbursement(record.sourceId);
      }

      if (record.source === "flash_cash" && record.stage === "submission") {
        await financialRecordService.approveFlashCash(record.sourceId);
      }

      await handleRefetch();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal update stage",
        text: getErrorMessage(error),
      });
    }
  }

  async function handleRefetch() {
    setIsRefreshing(true);
    try {
      await loadRecords();
      setLastRefetchedAt(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data",
        text: getErrorMessage(error),
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
  }

  const hasBaseError =
    !form.title.trim() || !form.createdBy.trim() || !form.date || Number(form.amount) <= 0;
  const hasInvoiceError =
    form.source === "invoice" &&
    (!form.invoiceNumber.trim() || !form.customerId.trim() || !form.salesOrderId.trim() || !form.dueDate);
  const hasSourceError =
    (form.source === "flash_cash" && !form.category.trim()) ||
    (form.source === "reimbursement" && !form.category.trim()) ||
    (form.source === "man_power" && !form.recordType.trim()) ||
    (form.source !== "invoice" && !form.vendor.trim());
  const hasValidationError = hasBaseError || hasInvoiceError || hasSourceError;

  return (
    <>
      <div className="flex min-h-0 w-full flex-1 flex-col gap-6 overflow-auto">
        <section className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_35%),linear-gradient(135deg,_#0f172a_0%,_#132144_42%,_#1d4ed8_100%)] p-6 text-white shadow-sm lg:p-8">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.18),_transparent_60%)] lg:block" />
          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-3">
                <Badge className="w-fit border border-white/20 bg-white/10 text-white">
                  {copy?.hero_badge ?? "Financial record workspace"}
                </Badge>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold tracking-tight lg:text-4xl">
                    {dictionary?.title ?? "Financial Record"}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-200 lg:text-base">
                    {copy?.hero_description ??
                      "Kelola pengajuan expense, lanjutkan ke permintaan pembayaran, lalu simpan histori pembayaran dalam satu workspace yang rapi dan mudah direview."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-white text-slate-950 hover:bg-slate-100"
                  onClick={openCreateDialog}
                >
                  <Plus className="size-4" />
                  {copy?.button_add_expense ?? "Tambah Expense"}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                  onClick={handleRefetch}
                  disabled={isRefreshing}
                >
                  <RefreshCcw
                    className={cn("size-4", isRefreshing && "animate-spin")}
                  />
                  {copy?.button_refetch ?? "Re-fetch Data"}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {stats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-200">{item.label}</p>
                        <p className="text-2xl font-semibold">{item.value}</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-2">
                        <Icon className="size-5 text-cyan-100" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{item.hint}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as FinancialStage)}
          className="gap-5"
        >
          <TabsList className="grid h-auto w-full grid-cols-1 items-stretch gap-2 overflow-visible rounded-[24px] bg-slate-100 p-2 dark:bg-[#1F2023] lg:grid-cols-3">
            {(
              [
                "submission",
                "payment_request",
                "paid",
              ] satisfies FinancialStage[]
            ).map((stage) => {
              const Icon = getStageIcon(stage);

              return (
                <TabsTrigger
                  key={stage}
                  value={stage}
                  className="flex min-h-[76px] min-w-0 flex-col items-start justify-between gap-3 rounded-[18px] border border-transparent px-5 py-4 text-left text-slate-700 transition-colors data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:shadow-md dark:text-slate-300 dark:data-[state=active]:border-[#34363B] dark:data-[state=active]:bg-[#26282D] dark:data-[state=active]:shadow-none sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "shrink-0 rounded-2xl bg-gradient-to-br p-2.5 text-white shadow-sm",
                        stageMeta[stage].accent,
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                        {stageLabels[stage]}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {tabCounts[stage]}{" "}
                        {copy?.tabs?.transactions_suffix ?? "transaksi"}
                      </p>
                    </div>
                  </div>

                  {stage !== "paid" ? (
                    <div className="shrink-0 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-slate-800">
                      {stage === "submission"
                        ? `${reviewCounts.submission} ${
                            copy?.tabs?.review_suffix ?? "review"
                          }`
                        : `${reviewCounts.payment_request} ${
                            copy?.tabs?.review_suffix ?? "review"
                          }`}
                    </div>
                  ) : (
                    <div className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      {copy?.tabs?.done ?? "Selesai"}
                    </div>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {(
            ["submission", "payment_request", "paid"] satisfies FinancialStage[]
          ).map((stage) => (
            <TabsContent key={stage} value={stage} className="w-full">
              <Card className="overflow-hidden border-0 bg-transparent p-0 shadow-none w-full">
                <div className="w-full">
                  <FinancialRecordTableSection
                    dictionary={copy}
                    title={stageLabels[stage]}
                    description={stageDescriptions[stage]}
                    searchQuery={searchQuery}
                    categoryFilter={categoryFilter}
                    categories={categories}
                    rows={filteredRecords}
                    onSearchChange={setSearchQuery}
                    onCategoryFilterChange={(value) =>
                      setCategoryFilter(value as FilterCategory)
                    }
                    onClearFilters={clearFilters}
                    onEdit={(recordId) => {
                      const record = records.find((item) => item.id === recordId);
                      if (record) openEditDialog(record);
                    }}
                    onAdvanceStage={handleAdvanceStage}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    priorityLabel={(priority) =>
                      copy?.priorities?.[priority] ?? priorityMeta[priority].label
                    }
                    priorityClassName={(priority) =>
                      priorityMeta[priority].className
                    }
                    statusLabel={(status) =>
                      copy?.statuses?.[status] ?? statusMeta[status].label
                    }
                    statusClassName={(status) =>
                      statusMeta[status].className
                    }
                  />
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecordId
                ? (copy?.form?.edit_title ?? "Edit Expense")
                : (copy?.form?.create_title ?? "Tambah Expense")}
            </DialogTitle>
            <DialogDescription>
              {copy?.form?.description ??
                "Lengkapi data expense agar mudah dicari, direview, dan dipindahkan antar tahapan proses keuangan."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="expense-title">
                {copy?.form?.title_label ?? "Judul Expense"}
              </Label>
              <Input
                id="expense-title"
                value={form.title}
                onChange={(event) =>
                  handleFormChange("title", event.target.value)
                }
                placeholder={
                  copy?.form?.title_placeholder ??
                  "Contoh: Pengadaan bahan baku tambahan"
                }
              />
            </div>

            {form.source !== "invoice" ? (
              <div className="space-y-2">
                <Label htmlFor="expense-vendor">
                  {form.source === "reimbursement"
                    ? "Claimant"
                    : copy?.form?.vendor_label ?? "Vendor"}
                </Label>
                <Input
                  id="expense-vendor"
                  value={form.vendor}
                  onChange={(event) =>
                    handleFormChange("vendor", event.target.value)
                  }
                  placeholder={
                    form.source === "reimbursement"
                      ? "Nama pengaju klaim"
                      : copy?.form?.vendor_placeholder ?? "Nama vendor"
                  }
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice Number</Label>
                <Input
                  id="invoice-number"
                  value={form.invoiceNumber}
                  onChange={(event) =>
                    handleFormChange("invoiceNumber", event.target.value)
                  }
                  placeholder="INV-2026-0001"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="expense-created-by">
                {copy?.form?.requester_label ?? "Requester"}
              </Label>
              <Input
                id="expense-created-by"
                value={form.createdBy}
                onChange={(event) =>
                  handleFormChange("createdBy", event.target.value)
                }
                placeholder={
                  copy?.form?.requester_placeholder ?? "Nama pengaju"
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tipe Record</Label>
              <Select
                value={form.source}
                onValueChange={(value) =>
                  handleFormChange("source", value as FinancialSource)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tipe record" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flash_cash">Flash Cash</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="man_power">Man Power</SelectItem>
                  <SelectItem value="reimbursement">Reimbursement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.source === "flash_cash" ? (
              <div className="space-y-2">
                <Label>Tipe Cash</Label>
                <Select
                  value={form.flashType}
                  onValueChange={(value) =>
                    handleFormChange("flashType", value as "in" | "out")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih tipe cash" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Cash In</SelectItem>
                    <SelectItem value="out">Cash Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {form.source === "invoice" ? (
              <div className="space-y-2">
                <Label htmlFor="customer-id">Customer ID</Label>
                <Input
                  id="customer-id"
                  type="number"
                  min="1"
                  value={form.customerId}
                  onChange={(event) =>
                    handleFormChange("customerId", event.target.value)
                  }
                  placeholder="1"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{copy?.form?.category_label ?? "Kategori"}</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => handleFormChange("category", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {(form.source === "flash_cash"
                      ? ["Operational", "Logistics", "Utilities", "Maintenance"]
                      : form.source === "reimbursement"
                        ? ["Transport", "Meal", "Accommodation", "Medical", "Office"]
                        : ["Operational", "Maintenance", "Procurement", "Logistics", "Utilities"]
                    ).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="expense-amount">
                {copy?.form?.amount_label ?? "Nominal"}
              </Label>
              <Input
                id="expense-amount"
                type="number"
                min="0"
                value={form.amount}
                onChange={(event) =>
                  handleFormChange("amount", event.target.value)
                }
                placeholder={copy?.form?.amount_placeholder ?? "0"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-date">
                {copy?.form?.date_label ?? "Tanggal"}
              </Label>
              <Input
                id="expense-date"
                type="date"
                value={form.date}
                onChange={(event) =>
                  handleFormChange("date", event.target.value)
                }
              />
            </div>

            {form.source === "invoice" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sales-order-id">Sales Order ID</Label>
                  <Input
                    id="sales-order-id"
                    type="number"
                    min="1"
                    value={form.salesOrderId}
                    onChange={(event) =>
                      handleFormChange("salesOrderId", event.target.value)
                    }
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      handleFormChange("dueDate", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={form.paymentMethod}
                    onValueChange={(value) =>
                      handleFormChange("paymentMethod", value as "cash" | "termin")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih metode bayar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="termin">Termin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : null}

            {form.source === "flash_cash" ? (
              <div className="space-y-2">
                <Label htmlFor="reference-type">Reference Type</Label>
                <Input
                  id="reference-type"
                  value={form.referenceType}
                  onChange={(event) =>
                    handleFormChange("referenceType", event.target.value)
                  }
                  placeholder="manual / sales_order / payment"
                />
              </div>
            ) : null}

            {form.source === "man_power" ? (
              <div className="space-y-2">
                <Label htmlFor="record-type">Record Type</Label>
                <Input
                  id="record-type"
                  value={form.recordType}
                  onChange={(event) =>
                    handleFormChange("recordType", event.target.value)
                  }
                  placeholder="overtime / salary / service_fee"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>{copy?.form?.stage_label ?? "Tahap"}</Label>
              <Select
                value={form.stage}
                onValueChange={(value) =>
                  handleFormChange("stage", value as FinancialStage)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tahap" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submission">
                    {stageLabels.submission}
                  </SelectItem>
                  <SelectItem value="payment_request">
                    {stageLabels.payment_request}
                  </SelectItem>
                  <SelectItem value="paid">{stageLabels.paid}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{copy?.form?.status_label ?? "Status"}</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  handleFormChange("status", value as FinancialStatus)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="need_review">
                    {copy?.statuses?.need_review ?? "Perlu Review"}
                  </SelectItem>
                  <SelectItem value="waiting_budget">
                    {copy?.statuses?.waiting_budget ?? "Menunggu Budget"}
                  </SelectItem>
                  <SelectItem value="ready_to_pay">
                    {copy?.statuses?.ready_to_pay ?? "Siap Dibayar"}
                  </SelectItem>
                  <SelectItem value="paid">
                    {copy?.statuses?.paid ?? "Paid"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>{copy?.form?.priority_label ?? "Prioritas"}</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  handleFormChange("priority", value as FinancialPriority)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    {copy?.priorities?.high ?? "High"}
                  </SelectItem>
                  <SelectItem value="medium">
                    {copy?.priorities?.medium ?? "Medium"}
                  </SelectItem>
                  <SelectItem value="low">
                    {copy?.priorities?.low ?? "Low"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="expense-notes">
                {copy?.form?.notes_label ?? "Catatan"}
              </Label>
              <Textarea
                id="expense-notes"
                value={form.notes}
                onChange={(event) =>
                  handleFormChange("notes", event.target.value)
                }
                placeholder={
                  copy?.form?.notes_placeholder ??
                  "Tambahkan catatan review, invoice, atau konteks pembayaran"
                }
                className="min-h-28"
              />
            </div>
          </div>

          {hasValidationError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {copy?.form?.validation ??
                "Lengkapi judul, vendor, requester, tanggal, dan nominal lebih dari 0 sebelum menyimpan."}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {copy?.button_cancel ?? "Batal"}
            </Button>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={handleSaveRecord}
              disabled={hasValidationError}
            >
              {editingRecordId
                ? (copy?.button_save_changes ?? "Simpan Perubahan")
                : (copy?.button_save ?? "Simpan Expense")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
