"use client";

import { startTransition, useDeferredValue, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRightLeft,
  BanknoteArrowDown,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileClock,
  FilePenLine,
  Filter,
  Plus,
  ReceiptText,
  RefreshCcw,
  Search,
  WalletCards,
} from "lucide-react";

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

type FinancialRecord = {
  id: string;
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
  title: string;
  vendor: string;
  category: string;
  amount: string;
  date: string;
  stage: FinancialStage;
  status: FinancialStatus;
  priority: FinancialPriority;
  createdBy: string;
  notes: string;
};

const initialRecords: FinancialRecord[] = [
  {
    id: "FR-2401",
    title: "Pengadaan bahan kemasan April",
    vendor: "PT Sentra Packaging",
    category: "Operational",
    amount: 12500000,
    date: "2026-04-12",
    stage: "submission",
    status: "need_review",
    notes: "Perlu validasi quantity dan harga satuan.",
    priority: "high",
    createdBy: "Anisa Putri",
  },
  {
    id: "FR-2402",
    title: "Biaya maintenance mixer line A",
    vendor: "CV Teknik Utama",
    category: "Maintenance",
    amount: 8750000,
    date: "2026-04-11",
    stage: "submission",
    status: "waiting_budget",
    notes: "Menunggu persetujuan budget dari finance manager.",
    priority: "medium",
    createdBy: "Rifqi Maulana",
  },
  {
    id: "FR-2403",
    title: "Pembelian spare part filling machine",
    vendor: "Mesin Makmur",
    category: "Procurement",
    amount: 15250000,
    date: "2026-04-10",
    stage: "payment_request",
    status: "need_review",
    notes: "Lampiran invoice sudah lengkap, tinggal approval akhir.",
    priority: "high",
    createdBy: "Vina Lestari",
  },
  {
    id: "FR-2404",
    title: "Transport vendor pengiriman dokumen",
    vendor: "PT Lintas Express",
    category: "Logistics",
    amount: 1450000,
    date: "2026-04-09",
    stage: "payment_request",
    status: "ready_to_pay",
    notes: "Siap dijadwalkan untuk pembayaran batch minggu ini.",
    priority: "low",
    createdBy: "Dimas Saputra",
  },
  {
    id: "FR-2405",
    title: "Pembayaran listrik gudang produksi",
    vendor: "PLN",
    category: "Utilities",
    amount: 6320000,
    date: "2026-04-07",
    stage: "paid",
    status: "paid",
    notes: "Sudah dibayar melalui transfer virtual account.",
    priority: "medium",
    createdBy: "Maya Salsabila",
  },
  {
    id: "FR-2406",
    title: "Sewa forklift tambahan",
    vendor: "PT Sewa Alat Cepat",
    category: "Operational",
    amount: 4200000,
    date: "2026-04-06",
    stage: "paid",
    status: "paid",
    notes: "Digunakan untuk kebutuhan loading akhir kuartal.",
    priority: "low",
    createdBy: "Dion Pratama",
  },
];

const defaultFormState: FormState = {
  title: "",
  vendor: "",
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

function buildNewRecordId(records: FinancialRecord[]) {
  const highestNumber = records.reduce((maxValue, record) => {
    const numericPart = Number(record.id.replace(/\D/g, ""));
    return Number.isNaN(numericPart)
      ? maxValue
      : Math.max(maxValue, numericPart);
  }, 2400);

  return `FR-${highestNumber + 1}`;
}

function getStageIcon(stage: FinancialStage) {
  if (stage === "submission") return FileClock;
  if (stage === "payment_request") return CreditCard;
  return CheckCircle2;
}

function nextStage(stage: FinancialStage): FinancialStage {
  if (stage === "submission") return "payment_request";
  if (stage === "payment_request") return "paid";
  return "paid";
}

function nextStatus(stage: FinancialStage): FinancialStatus {
  if (stage === "submission") return "need_review";
  if (stage === "payment_request") return "ready_to_pay";
  return "paid";
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
    setForm({
      ...defaultFormState,
      stage: nextStageValue,
      status: nextStageValue === "paid" ? "paid" : "need_review",
      date: "2026-04-15",
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
      title: record.title,
      vendor: record.vendor,
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

  function handleSaveRecord() {
    const parsedAmount = Number(form.amount);

    if (
      !form.title.trim() ||
      !form.vendor.trim() ||
      !form.createdBy.trim() ||
      !form.date ||
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return;
    }

    startTransition(() => {
      setRecords((currentRecords) => {
        if (editingRecordId) {
          return currentRecords.map((record) =>
            record.id === editingRecordId
              ? {
                  ...record,
                  ...form,
                  amount: parsedAmount,
                }
              : record,
          );
        }

        return [
          {
            id: buildNewRecordId(currentRecords),
            title: form.title.trim(),
            vendor: form.vendor.trim(),
            category: form.category.trim(),
            amount: parsedAmount,
            date: form.date,
            stage: form.stage,
            status: form.status,
            notes: form.notes.trim(),
            priority: form.priority,
            createdBy: form.createdBy.trim(),
          },
          ...currentRecords,
        ];
      });
    });

    setIsDialogOpen(false);
  }

  function handleAdvanceStage(recordId: string) {
    setRecords((currentRecords) =>
      currentRecords.map((record) => {
        if (record.id !== recordId || record.stage === "paid") return record;

        const updatedStage = nextStage(record.stage);

        return {
          ...record,
          stage: updatedStage,
          status: nextStatus(updatedStage),
        };
      }),
    );
  }

  function handleRefetch() {
    setIsRefreshing(true);

    window.setTimeout(() => {
      startTransition(() => {
        setRecords((currentRecords) =>
          currentRecords.map((record, index) => {
            if (index !== 0 || record.stage === "paid") return record;

            return {
              ...record,
              status:
                record.stage === "submission" ? "need_review" : "ready_to_pay",
            };
          }),
        );
        setLastRefetchedAt(
          new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      });
      setIsRefreshing(false);
    }, 700);
  }

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
  }

  const hasValidationError =
    !form.title.trim() ||
    !form.vendor.trim() ||
    !form.createdBy.trim() ||
    !form.date ||
    Number(form.amount) <= 0;

  return (
    <>
      <div className="flex min-h-0 w-full flex-1 flex-col gap-6 overflow-auto">
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_35%),linear-gradient(135deg,_#0f172a_0%,_#132144_42%,_#1d4ed8_100%)] p-6 text-white shadow-sm lg:p-8">
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
          <TabsList className="grid h-auto w-full grid-cols-1 items-stretch gap-2 rounded-[24px] bg-slate-100 p-2 overflow-visible lg:grid-cols-3">
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
                  className="flex min-h-[76px] min-w-0 flex-col items-start justify-between gap-3 rounded-[18px] border-0 px-5 py-4 text-left data-[state=active]:bg-white data-[state=active]:shadow-md sm:flex-row sm:items-center"
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
                      <p className="truncate text-base font-semibold text-slate-900">
                        {stageLabels[stage]}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tabCounts[stage]}{" "}
                        {copy?.tabs?.transactions_suffix ?? "transaksi"}
                      </p>
                    </div>
                  </div>

                  {stage !== "paid" ? (
                    <div className="shrink-0 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                      {stage === "submission"
                        ? `${reviewCounts.submission} ${
                            copy?.tabs?.review_suffix ?? "review"
                          }`
                        : `${reviewCounts.payment_request} ${
                            copy?.tabs?.review_suffix ?? "review"
                          }`}
                    </div>
                  ) : (
                    <div className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
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
                  <Card className="gap-0 rounded-[24px] border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <CardTitle className="text-xl text-slate-900">
                            {stageLabels[stage]}
                          </CardTitle>
                          <CardDescription className="mt-2 max-w-2xl text-sm leading-6">
                            {stageDescriptions[stage]}
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
                            onChange={(event) =>
                              setSearchQuery(event.target.value)
                            }
                            placeholder={
                              copy?.toolbar?.search_placeholder ??
                              "Cari judul, vendor, ID, kategori..."
                            }
                            className="h-11 rounded-xl border-slate-200 pl-9"
                          />
                        </div>

                        <Select
                          value={categoryFilter}
                          onValueChange={(value) =>
                            setCategoryFilter(value as FilterCategory)
                          }
                        >
                          <SelectTrigger className="h-11 w-full rounded-xl border-slate-200">
                            <SelectValue
                              placeholder={
                                copy?.toolbar?.category_placeholder ??
                                "Filter kategori"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              {copy?.toolbar?.all_category ?? "Semua kategori"}
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
                          className="h-11 rounded-xl border-slate-200"
                          onClick={clearFilters}
                        >
                          <Filter className="size-4" />
                          {copy?.button_filter ?? "Filters"}
                        </Button>
                      </div>

                      <div className="overflow-hidden rounded-[22px] border border-slate-200">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow className="hover:bg-slate-50">
                              <TableHead className="px-4">
                                {copy?.table?.expense ?? "Expense"}
                              </TableHead>
                              <TableHead>
                                {copy?.table?.category ?? "Kategori"}
                              </TableHead>
                              <TableHead>
                                {copy?.table?.amount ?? "Nominal"}
                              </TableHead>
                              <TableHead>
                                {copy?.table?.status ?? "Status"}
                              </TableHead>
                              <TableHead>
                                {copy?.table?.date ?? "Tanggal"}
                              </TableHead>
                              <TableHead className="px-4 text-right">
                                {copy?.table?.actions ?? "Aksi"}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredRecords.length > 0 ? (
                              filteredRecords.map((record) => (
                                <TableRow key={record.id}>
                                  <TableCell className="px-4 py-4">
                                    <div className="space-y-1">
                                      <p className="font-semibold text-slate-900">
                                        {record.title}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                        <span>{record.id}</span>
                                        <span className="text-slate-300">
                                          •
                                        </span>
                                        <span>{record.vendor}</span>
                                        <span className="text-slate-300">
                                          •
                                        </span>
                                        <span>
                                          {copy?.table?.created_by_prefix ??
                                            "By"}{" "}
                                          {record.createdBy}
                                        </span>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-2">
                                      <p className="font-medium text-slate-800">
                                        {record.category}
                                      </p>
                                      <Badge
                                        className={cn(
                                          "rounded-full border-0",
                                          priorityMeta[record.priority]
                                            .className,
                                        )}
                                      >
                                        {copy?.priorities?.[record.priority] ??
                                          priorityMeta[record.priority].label}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-semibold text-slate-900">
                                    {formatCurrency(record.amount)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={cn(
                                        "rounded-full border",
                                        statusMeta[record.status].className,
                                      )}
                                    >
                                      {copy?.statuses?.[record.status] ??
                                        statusMeta[record.status].label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-slate-600">
                                    {formatDate(record.date)}
                                  </TableCell>
                                  <TableCell className="px-4">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={() => openEditDialog(record)}
                                      >
                                        <FilePenLine className="size-4" />
                                        {copy?.button_edit ?? "Edit"}
                                      </Button>
                                      {record.stage !== "paid" ? (
                                        <Button
                                          className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                                          onClick={() =>
                                            handleAdvanceStage(record.id)
                                          }
                                        >
                                          <ArrowRightLeft className="size-4" />
                                          {record.stage === "submission"
                                            ? (copy?.button_update_stage ??
                                              "Ubah")
                                            : (copy?.button_mark_paid ??
                                              "Bayar")}
                                        </Button>
                                      ) : null}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="px-4 py-12 text-center"
                                >
                                  <div className="mx-auto max-w-md space-y-2">
                                    <p className="text-base font-semibold text-slate-900">
                                      {copy?.table?.empty_title ??
                                        "Tidak ada data yang cocok"}
                                    </p>
                                    <p className="text-sm leading-6 text-slate-500">
                                      {copy?.table?.empty_description ??
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

            <div className="space-y-2">
              <Label htmlFor="expense-vendor">
                {copy?.form?.vendor_label ?? "Vendor"}
              </Label>
              <Input
                id="expense-vendor"
                value={form.vendor}
                onChange={(event) =>
                  handleFormChange("vendor", event.target.value)
                }
                placeholder={copy?.form?.vendor_placeholder ?? "Nama vendor"}
              />
            </div>

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
              <Label>{copy?.form?.category_label ?? "Kategori"}</Label>
              <Select
                value={form.category}
                onValueChange={(value) => handleFormChange("category", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Operational",
                    "Maintenance",
                    "Procurement",
                    "Logistics",
                    "Utilities",
                  ].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
