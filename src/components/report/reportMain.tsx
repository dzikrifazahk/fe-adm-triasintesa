"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDictionary } from "../../../get-dictionary";
import { reportService } from "@/services";
import {
  ICreateReportJobPayload,
  IReportJob,
  IReportModule,
  IReportStats,
  ReportJobStatus,
} from "@/types/report";
import axios from "axios";
import { openSwal } from "@/lib/swal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Clock,
  Database,
  Download,
  FileSpreadsheet,
  Info,
  ListChecks,
  Loader2,
  RefreshCcw,
  Trash2,
  XCircle,
} from "lucide-react";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>["report_page_dic"];

type Props = {
  dictionary: Dictionary;
};

type PaginationMeta = {
  totalItems?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapData<T>(value: unknown): T {
  if (isRecord(value) && "data" in value) {
    return value.data as T;
  }
  return value as T;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
    if (isRecord(message)) return JSON.stringify(message);
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan";
}

function getFilenameFromDisposition(disposition?: string): string | null {
  if (!disposition) return null;
  const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)/i);
  if (!fileNameMatch?.[1]) return null;
  return decodeURIComponent(fileNameMatch[1]);
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG: Record<
  ReportJobStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  starting: {
    label: "Starting",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: <Clock className="size-3.5" />,
  },
  processing: {
    label: "Processing",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: <Loader2 className="size-3.5 animate-spin" />,
  },
  completed: {
    label: "Complete",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <CheckCircle2 className="size-3.5" />,
  },
  failed: {
    label: "Failed",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: <XCircle className="size-3.5" />,
  },
};

const JOBS_POLL_INTERVAL_MS = 5_000;

export default function ReportMain({ dictionary }: Props) {
  const [activeTab, setActiveTab] = useState<"generate" | "scheduler">("generate");

  // Generate form state
  const [modules, setModules] = useState<IReportModule[]>([]);
  const [selectedModuleKey, setSelectedModuleKey] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scheduler state
  const [jobs, setJobs] = useState<IReportJob[]>([]);
  const [jobsMeta, setJobsMeta] = useState<PaginationMeta>();
  const [jobsPage, setJobsPage] = useState(1);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [downloadingJobId, setDownloadingJobId] = useState<number | null>(null);

  const [stats, setStats] = useState<IReportStats & { completed_job_count?: number }>({
    template_count: 0,
    exports_month_count: 0,
    active_schedule_count: 0,
  });

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const selectedModule = useMemo(
    () => modules.find((module) => module.key === selectedModuleKey),
    [modules, selectedModuleKey],
  );

  const allFieldsSelected =
    Boolean(selectedModule) &&
    selectedModule!.fields.length > 0 &&
    selectedFields.length === selectedModule!.fields.length;

  const fetchStats = useCallback(async () => {
    try {
      const response = await reportService.getReportStats();
      setStats(unwrapData<IReportStats>(response));
    } catch {
      // stats are non-critical; silently keep the previous values
    }
  }, []);

  const fetchModules = useCallback(async () => {
    try {
      const response = await reportService.getReportModules();
      const payload = unwrapData<IReportModule[]>(response);
      setModules(Array.isArray(payload) ? payload : []);
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal memuat daftar module report",
        text: getErrorMessage(error),
      });
    }
  }, []);

  const fetchJobs = useCallback(
    async (page?: number) => {
      try {
        setIsLoadingJobs(true);
        const response = await reportService.getReportJobs({
          page: page ?? jobsPage,
          limit: 10,
        });
        const payload = unwrapData<{ data: IReportJob[]; meta?: PaginationMeta }>(
          response,
        );
        setJobs(payload?.data ?? []);
        setJobsMeta(payload?.meta);
      } catch (error) {
        openSwal({
          icon: "error",
          title: "Gagal memuat report scheduler",
          text: getErrorMessage(error),
        });
      } finally {
        setIsLoadingJobs(false);
      }
    },
    [jobsPage],
  );

  useEffect(() => {
    fetchModules();
    fetchJobs(1);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchJobs(jobsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsPage]);

  // Poll the scheduler while a job is still starting/processing so the
  // status and the download button refresh automatically
  const hasActiveJob = jobs.some(
    (job) => job.status === "starting" || job.status === "processing",
  );

  useEffect(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    if (!hasActiveJob) return;

    pollingRef.current = setInterval(() => {
      fetchJobs(jobsPage);
      fetchStats();
    }, JOBS_POLL_INTERVAL_MS);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [hasActiveJob, jobsPage, fetchJobs, fetchStats]);

  const handleModuleChange = (moduleKey: string) => {
    setSelectedModuleKey(moduleKey);
    setSelectedFields([]);
    setDateFrom("");
    setDateTo("");
  };

  const toggleField = (fieldKey: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((key) => key !== fieldKey)
        : [...prev, fieldKey],
    );
  };

  const toggleAllFields = () => {
    if (!selectedModule) return;
    setSelectedFields(
      allFieldsSelected ? [] : selectedModule.fields.map((field) => field.key),
    );
  };

  const handleGenerate = async () => {
    if (!selectedModule) {
      openSwal({
        icon: "warning",
        title: dictionary?.job_form?.module_required ?? "Pilih module terlebih dahulu",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    if (selectedFields.length === 0) {
      openSwal({
        icon: "warning",
        title: dictionary?.job_form?.fields_required ?? "Pilih minimal satu field",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
      openSwal({
        icon: "warning",
        title: "Tanggal mulai tidak boleh melebihi tanggal akhir",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    const payload: ICreateReportJobPayload = {
      moduleKey: selectedModule.key,
      fields: selectedFields,
    };

    if (selectedModule.supportsDateRange) {
      if (dateFrom) payload.dateFrom = dateFrom;
      if (dateTo) payload.dateTo = dateTo;
    }

    try {
      setIsSubmitting(true);
      await reportService.createReportJob(payload);

      openSwal({
        icon: "success",
        title:
          dictionary?.job_form?.queued ??
          "Report masuk antrian scheduler. Cek status di tab Report Scheduler.",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 3000,
      });

      setActiveTab("scheduler");
      setJobsPage(1);
      await fetchJobs(1);
      await fetchStats();
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal membuat report job",
        text: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (job: IReportJob) => {
    try {
      setDownloadingJobId(job.id);
      const response = await reportService.downloadReportJob(job.id);
      const disposition = response.headers?.["content-disposition"];
      const fileName =
        getFilenameFromDisposition(disposition) ||
        job.fileName ||
        `report-${job.moduleKey}-${job.id}.xlsx`;
      const blob = new Blob([response.data], {
        type:
          response.headers?.["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal download report",
        text: getErrorMessage(error),
      });
    } finally {
      setDownloadingJobId(null);
    }
  };

  const handleDeleteJob = (job: IReportJob) => {
    openSwal({
      icon: "warning",
      text: `Hapus report job #${job.id} (${job.moduleLabel})?`,
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#1d4ed8",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await reportService.deleteReportJob(job.id);
        await fetchJobs(jobsPage);
        await fetchStats();
        openSwal({
          icon: "success",
          title: "Report job dihapus",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (error) {
        openSwal({
          icon: "error",
          title: "Gagal menghapus report job",
          text: getErrorMessage(error),
        });
      }
    });
  };

  const steps = [
    {
      icon: <Database className="size-5" />,
      title: dictionary?.steps?.step1_title ?? "1. Pilih Module",
      description:
        dictionary?.steps?.step1_desc ??
        "Pilih sumber data (Financial Record, Sales Order, Inventory, dll).",
    },
    {
      icon: <ListChecks className="size-5" />,
      title: dictionary?.steps?.step2_title ?? "2. Pilih Field",
      description:
        dictionary?.steps?.step2_desc ??
        "Centang field yang ingin ditampilkan pada report excel.",
    },
    {
      icon: <ClipboardList className="size-5" />,
      title: dictionary?.steps?.step3_title ?? "3. Generate & Monitor",
      description:
        dictionary?.steps?.step3_desc ??
        "Report diproses oleh scheduler: Starting → Processing → Complete.",
    },
    {
      icon: <Download className="size-5" />,
      title: dictionary?.steps?.step4_title ?? "4. Download Excel",
      description:
        dictionary?.steps?.step4_desc ??
        "Setelah status Complete, download file excel dari Report Scheduler.",
    },
  ];

  const totalPages = jobsMeta?.totalPages ?? 1;

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-6 overflow-auto">
      {/* Hero — blue & white main theme */}
      <section className="relative shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-6 text-white shadow-sm lg:p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit rounded-full border border-white/30 bg-white/10 px-3 py-1 text-white">
                {dictionary?.hero_badge ?? "Reporting workspace"}
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
                {dictionary?.title ?? "Report"}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-blue-50 lg:text-base">
                {dictionary?.page_description ??
                  "Pilih module dan field yang dibutuhkan, generate report lewat scheduler, lalu download hasilnya dalam format excel."}
              </p>
            </div>

            <div className="grid w-full grid-cols-3 gap-3 lg:w-auto lg:min-w-[420px]">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs text-blue-100">
                  {dictionary?.stats?.modules ?? "Module tersedia"}
                </p>
                <p className="mt-1 text-2xl font-semibold">{modules.length}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs text-blue-100">
                  {dictionary?.stats?.scheduled ?? "Job aktif"}
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {stats.active_schedule_count}
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs text-blue-100">
                  {dictionary?.stats?.completed ?? "Report selesai"}
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {stats.completed_job_count ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* Step-by-step documentation */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.title}
                className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  {step.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-blue-100">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "generate" | "scheduler")}
        className="w-full"
      >
        <TabsList className="h-11 w-full justify-start gap-1 rounded-2xl border border-blue-100 bg-blue-50/70 p-1 sm:w-fit">
          <TabsTrigger
            value="generate"
            className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <FileSpreadsheet className="mr-2 size-4" />
            {dictionary?.tabs?.generate ?? "Generate Report"}
          </TabsTrigger>
          <TabsTrigger
            value="scheduler"
            className="rounded-xl px-4 py-2 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Clock className="mr-2 size-4" />
            {dictionary?.tabs?.scheduler ?? "Report Scheduler"}
            {hasActiveJob && (
              <span className="ml-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Generate ── */}
        <TabsContent value="generate" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="gap-0 rounded-3xl border-blue-100 bg-white shadow-sm">
              <CardHeader className="border-b border-blue-50 pb-5">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <Database className="size-5 text-blue-600" />
                  {dictionary?.job_form?.module_title ?? "Pilih module data"}
                </CardTitle>
                <CardDescription className="mt-1 text-sm leading-6">
                  {dictionary?.job_form?.module_description ??
                    "Report mengambil raw data dari module yang dipilih."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label>{dictionary?.job_form?.module_label ?? "Module"}</Label>
                  <Select value={selectedModuleKey} onValueChange={handleModuleChange}>
                    <SelectTrigger className="w-full rounded-xl border-blue-200">
                      <SelectValue
                        placeholder={
                          dictionary?.job_form?.module_placeholder ??
                          "Pilih module report"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {modules.map((module) => (
                        <SelectItem key={module.key} value={module.key}>
                          {module.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedModule && (
                    <p className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-800">
                      <Info className="mt-0.5 size-4 shrink-0" />
                      {selectedModule.description}
                    </p>
                  )}
                </div>

                {selectedModule?.supportsDateRange && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarRange className="size-4 text-blue-600" />
                      {dictionary?.job_form?.date_range ?? "Rentang tanggal (opsional)"}
                    </Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => setDateFrom(event.target.value)}
                        className="rounded-xl border-blue-200"
                      />
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(event) => setDateTo(event.target.value)}
                        className="rounded-xl border-blue-200"
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">
                    {dictionary?.job_form?.summary_title ?? "Ringkasan"}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs leading-5">
                    <li>
                      Module:{" "}
                      <span className="font-semibold text-blue-700">
                        {selectedModule?.label ?? "-"}
                      </span>
                    </li>
                    <li>
                      Field dipilih:{" "}
                      <span className="font-semibold text-blue-700">
                        {selectedFields.length}
                      </span>
                      {selectedModule ? ` / ${selectedModule.fields.length}` : ""}
                    </li>
                    <li>
                      Periode:{" "}
                      <span className="font-semibold text-blue-700">
                        {selectedModule?.supportsDateRange
                          ? `${dateFrom || "semua"} s/d ${dateTo || "semua"}`
                          : "semua data"}
                      </span>
                    </li>
                    <li>
                      Format output:{" "}
                      <span className="font-semibold text-blue-700">Excel (.xlsx)</span>
                    </li>
                  </ul>
                </div>

                <Button
                  className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleGenerate}
                  disabled={isSubmitting || !selectedModule || selectedFields.length === 0}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="size-4" />
                  )}
                  {isSubmitting
                    ? "Mengirim ke scheduler..."
                    : dictionary?.button_generate ?? "Generate Report"}
                </Button>
              </CardContent>
            </Card>

            <Card className="gap-0 rounded-3xl border-blue-100 bg-white shadow-sm">
              <CardHeader className="border-b border-blue-50 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                      <ListChecks className="size-5 text-blue-600" />
                      {dictionary?.job_form?.fields_title ?? "Pilih field report"}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm leading-6">
                      {dictionary?.job_form?.fields_description ??
                        "Hanya field yang dicentang yang akan muncul di file excel."}
                    </CardDescription>
                  </div>
                  {selectedModule && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={toggleAllFields}
                    >
                      {allFieldsSelected
                        ? dictionary?.job_form?.unselect_all ?? "Hapus semua"
                        : dictionary?.job_form?.select_all ?? "Pilih semua"}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {!selectedModule ? (
                  <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-8 text-center">
                    <Database className="size-10 text-blue-300" />
                    <p className="text-sm font-medium text-slate-600">
                      {dictionary?.job_form?.empty_module ??
                        "Pilih module terlebih dahulu untuk melihat daftar field."}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedModule.fields.map((field) => {
                      const checked = selectedFields.includes(field.key);
                      return (
                        <label
                          key={field.key}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                            checked
                              ? "border-blue-300 bg-blue-50 text-blue-900"
                              : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/40"
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleField(field.key)}
                          />
                          <span>
                            <span className="block font-medium">{field.label}</span>
                            <span className="block text-xs text-slate-400">
                              {field.key}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2: Report Scheduler ── */}
        <TabsContent value="scheduler" className="mt-4">
          <Card className="gap-0 rounded-3xl border-blue-100 bg-white shadow-sm">
            <CardHeader className="border-b border-blue-50 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                    <Clock className="size-5 text-blue-600" />
                    {dictionary?.scheduler?.title ?? "Report Scheduler"}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm leading-6">
                    {dictionary?.scheduler?.description ??
                      "Pantau status generate report. Download excel tersedia setelah status Complete."}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    fetchJobs(jobsPage);
                    fetchStats();
                  }}
                  disabled={isLoadingJobs}
                >
                  <RefreshCcw
                    className={`size-4 ${isLoadingJobs ? "animate-spin" : ""}`}
                  />
                  {dictionary?.scheduler?.refresh ?? "Refresh"}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {jobs.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-8 text-center">
                  <ClipboardList className="size-10 text-blue-300" />
                  <p className="text-sm font-medium text-slate-600">
                    {dictionary?.scheduler?.empty ??
                      "Belum ada report job. Buat report dari tab Generate Report."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-blue-100">
                  <table className="w-full min-w-[860px] text-sm">
                    <thead>
                      <tr className="bg-blue-600 text-left text-white">
                        <th className="px-4 py-3 font-semibold">#</th>
                        <th className="px-4 py-3 font-semibold">
                          {dictionary?.scheduler?.column_module ?? "Module"}
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          {dictionary?.scheduler?.column_fields ?? "Field"}
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          {dictionary?.scheduler?.column_period ?? "Periode"}
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          {dictionary?.scheduler?.column_status ?? "Status"}
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          {dictionary?.scheduler?.column_rows ?? "Rows"}
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          {dictionary?.scheduler?.column_created ?? "Dibuat"}
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          {dictionary?.scheduler?.column_actions ?? "Aksi"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job, index) => {
                        const statusConfig = STATUS_CONFIG[job.status];
                        return (
                          <tr
                            key={job.id}
                            className={`border-t border-blue-50 ${
                              index % 2 === 1 ? "bg-blue-50/40" : "bg-white"
                            }`}
                          >
                            <td className="px-4 py-3 font-medium text-slate-500">
                              {job.id}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {job.moduleLabel}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {job.fields?.length ?? 0} field
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {job.dateFrom || job.dateTo
                                ? `${job.dateFrom ?? "…"} s/d ${job.dateTo ?? "…"}`
                                : "Semua data"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
                              >
                                {statusConfig.icon}
                                {statusConfig.label}
                              </span>
                              {job.status === "failed" && job.errorMessage && (
                                <p className="mt-1 max-w-56 truncate text-xs text-red-500">
                                  {job.errorMessage}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {job.status === "completed" ? job.totalRows : "-"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {formatDateTime(job.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
                                  disabled={
                                    job.status !== "completed" ||
                                    downloadingJobId === job.id
                                  }
                                  onClick={() => handleDownload(job)}
                                >
                                  {downloadingJobId === job.id ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <Download className="size-4" />
                                  )}
                                  Excel
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                                  disabled={job.status === "processing"}
                                  onClick={() => handleDeleteJob(job)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-blue-200"
                    disabled={jobsPage <= 1}
                    onClick={() => setJobsPage((prev) => Math.max(1, prev - 1))}
                  >
                    {dictionary?.scheduler?.prev ?? "Sebelumnya"}
                  </Button>
                  <span className="text-sm text-slate-600">
                    {jobsPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-blue-200"
                    disabled={jobsPage >= totalPages}
                    onClick={() => setJobsPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    {dictionary?.scheduler?.next ?? "Berikutnya"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
