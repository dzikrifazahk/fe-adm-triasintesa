"use client";

import { useEffect, useState } from "react";
import { getDictionary } from "../../../get-dictionary";
import { reportService } from "@/services";
import {
  IReportFilterPayload,
  IReportPreview,
  IReportStats,
  ReportDepartment,
  ReportFormat,
  ReportType,
} from "@/types/report";
import axios from "axios";
import Swal from "sweetalert2";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ChartColumnBig,
  Download,
  FileBarChart2,
  FileSpreadsheet,
  RefreshCcw,
} from "lucide-react";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>["report_page_dic"];

type Props = {
  dictionary: Dictionary;
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getFilenameFromDisposition(disposition?: string): string | null {
  if (!disposition) return null;
  const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)/i);
  if (!fileNameMatch?.[1]) return null;
  return decodeURIComponent(fileNameMatch[1]);
}

export default function ReportMain({ dictionary }: Props) {
  const [reportType, setReportType] = useState<ReportType>("financial");
  const [reportFormat, setReportFormat] = useState<ReportFormat>("pdf");
  const [department, setDepartment] = useState<ReportDepartment>("all");
  const [dateFrom, setDateFrom] = useState("2026-04-01");
  const [dateTo, setDateTo] = useState("2026-04-15");
  const [keyword, setKeyword] = useState("");
  const [notes, setNotes] = useState("");
  const [stats, setStats] = useState<IReportStats>({
    template_count: 3,
    exports_month_count: 0,
    active_schedule_count: 0,
  });
  const [preview, setPreview] = useState<IReportPreview | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const reportTypeLabel = {
    financial: dictionary?.templates?.financial ?? "Monthly financial report",
    production: dictionary?.templates?.production ?? "Weekly production report",
    inventory: dictionary?.templates?.inventory ?? "Daily inventory report",
  };

  const formatLabel = {
    pdf: "PDF",
    xlsx: "XLSX",
    csv: "CSV",
  };

  const departmentLabel = {
    all: "All Department",
    finance: "Finance",
    operations: "Operations",
    warehouse: "Warehouse",
  };

  const buildPayload = (): IReportFilterPayload => ({
    reportType,
    reportFormat,
    dateFrom,
    dateTo,
    department,
    keyword: keyword.trim() || undefined,
    notes: notes.trim() || undefined,
  });

  const fetchStats = async () => {
    try {
      const response = await reportService.getReportStats();
      const payload = unwrapData<IReportStats>(response);
      setStats(payload);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat statistik report",
        text: getErrorMessage(error),
      });
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleGeneratePreview = async () => {
    try {
      setIsGenerating(true);
      const response = await reportService.getReportPreview(buildPayload());
      const payload = unwrapData<IReportPreview>(response);
      setPreview(payload);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal generate preview",
        text: getErrorMessage(error),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await reportService.exportReport(buildPayload());
      const disposition = response.headers?.["content-disposition"];
      const fileName =
        getFilenameFromDisposition(disposition) ||
        `report-${reportType}.${reportFormat}`;
      const blob = new Blob([response.data], {
        type: response.headers?.["content-type"] || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      await fetchStats();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal download report",
        text: getErrorMessage(error),
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setReportType("financial");
    setReportFormat("pdf");
    setDepartment("all");
    setDateFrom("2026-04-01");
    setDateTo("2026-04-15");
    setKeyword("");
    setNotes("");
    setPreview(null);
  };

  const applyTemplate = (nextType: ReportType) => {
    setReportType(nextType);
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-6 overflow-auto">
      <section className="relative shrink-0 overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.16),_transparent_24%),linear-gradient(135deg,_#0f172a_0%,_#132144_38%,_#0f766e_100%)] p-6 text-white shadow-sm lg:p-8">
        <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute -right-8 bottom-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.14),_transparent_60%)] lg:block" />
        <div className="relative flex flex-col gap-8">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
            <div className="space-y-4">
              <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white">
                {dictionary?.hero_badge ?? "Reporting workspace"}
              </Badge>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white lg:text-5xl">
                  {dictionary?.title ?? "Report"}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-100">
                  {dictionary?.description ??
                    "Generate operational and financial reports from one clean workspace."}
                </p>
                <p className="max-w-2xl text-sm leading-6 text-slate-300">
                  {dictionary?.page_description ??
                    "Choose the report type, period, and export format to prepare a summary that is ready to share."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 xl:items-end">
              <div className="flex flex-wrap gap-3 xl:justify-end">
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-white/20 bg-white/10 px-5 text-white hover:bg-white/15 hover:text-white"
                  onClick={handleGeneratePreview}
                  disabled={isGenerating}
                >
                  <FileBarChart2 className="size-4" />
                  {isGenerating
                    ? "Generating..."
                    : dictionary?.button_generate ?? "Generate Report"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-200">
                {dictionary?.stats?.templates ?? "Ready templates"}
              </p>
              <p className="mt-1 text-2xl font-semibold">{stats.template_count}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-200">
                {dictionary?.stats?.exports ?? "Exports this month"}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {stats.exports_month_count}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-slate-200">
                {dictionary?.stats?.scheduled ?? "Active schedules"}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {stats.active_schedule_count}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="gap-0 rounded-[24px] border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-5">
            <CardTitle className="text-xl text-slate-900">
              {dictionary?.form?.title ?? "Generate report"}
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-sm leading-6">
              {dictionary?.form?.description ??
                "Set the main parameters before creating a preview or exporting the report file."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{dictionary?.form?.report_type ?? "Report type"}</Label>
                <Select
                  value={reportType}
                  onValueChange={(value) => setReportType(value as ReportType)}
                >
                  <SelectTrigger className="w-full rounded-xl border-slate-200">
                    <SelectValue
                      placeholder={
                        dictionary?.form?.report_type_placeholder ??
                        "Select report type"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">
                      {reportTypeLabel.financial}
                    </SelectItem>
                    <SelectItem value="production">
                      {reportTypeLabel.production}
                    </SelectItem>
                    <SelectItem value="inventory">
                      {reportTypeLabel.inventory}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{dictionary?.form?.format ?? "File format"}</Label>
                <Select
                  value={reportFormat}
                  onValueChange={(value) =>
                    setReportFormat(value as ReportFormat)
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-slate-200">
                    <SelectValue
                      placeholder={
                        dictionary?.form?.format_placeholder ?? "Select format"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="xlsx">XLSX</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{dictionary?.form?.date_from ?? "Start date"}</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label>{dictionary?.form?.date_to ?? "End date"}</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label>{dictionary?.form?.department ?? "Department"}</Label>
                <Select
                  value={department}
                  onValueChange={(value) => setDepartment(value as ReportDepartment)}
                >
                  <SelectTrigger className="w-full rounded-xl border-slate-200">
                    <SelectValue
                      placeholder={
                        dictionary?.form?.department_placeholder ??
                        "Select department"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{departmentLabel.all}</SelectItem>
                    <SelectItem value="finance">
                      {departmentLabel.finance}
                    </SelectItem>
                    <SelectItem value="operations">
                      {departmentLabel.operations}
                    </SelectItem>
                    <SelectItem value="warehouse">
                      {departmentLabel.warehouse}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{dictionary?.form?.keyword ?? "Keyword"}</Label>
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder={
                    dictionary?.form?.keyword_placeholder ??
                    "Search project, vendor, or document number"
                  }
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{dictionary?.form?.notes ?? "Notes"}</Label>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={
                    dictionary?.form?.notes_placeholder ??
                    "Add notes for report export or distribution needs"
                  }
                  className="min-h-28 rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                onClick={handleGeneratePreview}
                disabled={isGenerating}
              >
                <ChartColumnBig className="size-4" />
                {isGenerating
                  ? "Generating..."
                  : dictionary?.button_generate ?? "Generate Report"}
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="size-4" />
                {isDownloading
                  ? "Downloading..."
                  : dictionary?.button_download ?? "Download"}
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200"
                onClick={handleReset}
              >
                <RefreshCcw className="size-4" />
                {dictionary?.button_reset ?? "Reset"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="gap-0 rounded-[24px] border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-5">
              <CardTitle className="text-xl text-slate-900">
                {dictionary?.preview?.title ?? "Report preview"}
              </CardTitle>
              <CardDescription className="mt-2 text-sm leading-6">
                {dictionary?.preview?.description ??
                  "Initial summary before the full report is generated."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-6">
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">
                      {dictionary?.preview?.summary_title ?? "Summary"}
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {preview?.summaryTitle || reportTypeLabel[reportType]}
                    </p>
                  </div>
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    {preview?.status
                      ? dictionary?.preview?.status_ready ?? "Ready to export"
                      : "Draft"}
                  </Badge>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-slate-500">
                      {dictionary?.preview?.range ?? "Period"}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {preview?.period.from || dateFrom} -{" "}
                      {preview?.period.to || dateTo}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-slate-500">
                      {dictionary?.preview?.format ?? "Format"}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {preview?.format || formatLabel[reportFormat]}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-slate-500">
                      {dictionary?.preview?.department ?? "Department"}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {preview?.departmentLabel || departmentLabel[department]}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-slate-500">
                      {dictionary?.preview?.items ?? "Counted items"}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {preview?.countedItems ?? 0} rows
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-white">
                  <p className="text-sm text-slate-300">
                    {dictionary?.preview?.totals ?? "Total amount"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {formatCurrency(preview?.totalAmount ?? 0)}
                  </p>
                </div>

                {reportType === "financial" && preview?.metrics ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-500">Invoiced</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatCurrency(preview.metrics.invoiced)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatCurrency(preview.metrics.paid)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs text-slate-500">Cash Net</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatCurrency(preview.metrics.net)}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">
                {dictionary?.templates?.title ?? "Quick templates"}
              </CardTitle>
              <CardDescription>
                {dictionary?.templates?.description ??
                  "Start faster with the most frequently used report templates."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <button
                type="button"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
                onClick={() => applyTemplate("financial")}
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {dictionary?.templates?.financial ??
                      "Monthly financial report"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">PDF / XLSX</p>
                </div>
                <FileBarChart2 className="size-5 text-slate-500" />
              </button>

              <button
                type="button"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
                onClick={() => applyTemplate("production")}
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {dictionary?.templates?.production ??
                      "Weekly production report"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">PDF / CSV</p>
                </div>
                <ChartColumnBig className="size-5 text-slate-500" />
              </button>

              <button
                type="button"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white"
                onClick={() => applyTemplate("inventory")}
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {dictionary?.templates?.inventory ??
                      "Daily inventory report"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">XLSX / CSV</p>
                </div>
                <FileSpreadsheet className="size-5 text-slate-500" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
