"use client";

import { useState } from "react";
import { getDictionary } from "../../../get-dictionary";
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
  CalendarRange,
  ChartColumnBig,
  Download,
  FileBarChart2,
  FileSpreadsheet,
  Layers3,
  RefreshCcw,
} from "lucide-react";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>["report_page_dic"];

type Props = {
  dictionary: Dictionary;
};

type ReportType = "financial" | "production" | "inventory";
type ReportFormat = "pdf" | "xlsx" | "csv";
type Department = "all" | "finance" | "operations" | "warehouse";

export default function ReportMain({ dictionary }: Props) {
  const [reportType, setReportType] = useState<ReportType>("financial");
  const [reportFormat, setReportFormat] = useState<ReportFormat>("pdf");
  const [department, setDepartment] = useState<Department>("all");
  const [dateFrom, setDateFrom] = useState("2026-04-01");
  const [dateTo, setDateTo] = useState("2026-04-15");
  const [keyword, setKeyword] = useState("");
  const [notes, setNotes] = useState("");

  const stats = [
    {
      label: dictionary?.stats?.templates ?? "Ready templates",
      value: "03",
      hint:
        dictionary?.stats?.templates_hint ??
        "Most-used report formats by the team",
      icon: Layers3,
    },
    {
      label: dictionary?.stats?.exports ?? "Exports this month",
      value: "18",
      hint:
        dictionary?.stats?.exports_hint ??
        "Reports that have already been downloaded",
      icon: Download,
    },
    {
      label: dictionary?.stats?.scheduled ?? "Active schedules",
      value: "04",
      hint:
        dictionary?.stats?.scheduled_hint ?? "Automated reports still running",
      icon: RefreshCcw,
    },
  ];

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
                >
                  <FileBarChart2 className="size-4" />
                  {dictionary?.button_generate ?? "Generate Report"}
                </Button>
              </div>
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
                  onValueChange={(value) => setDepartment(value as Department)}
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
              <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                <ChartColumnBig className="size-4" />
                {dictionary?.button_generate ?? "Generate Report"}
              </Button>
              <Button variant="outline" className="rounded-xl border-slate-200">
                <Download className="size-4" />
                {dictionary?.button_download ?? "Download"}
              </Button>
              <Button variant="outline" className="rounded-xl border-slate-200">
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
                      {reportTypeLabel[reportType]}
                    </p>
                  </div>
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    {dictionary?.preview?.status_ready ?? "Ready to export"}
                  </Badge>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-slate-500">
                      {dictionary?.preview?.range ?? "Period"}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {dateFrom} - {dateTo}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-slate-500">
                      {dictionary?.preview?.format ?? "Format"}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatLabel[reportFormat]}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-slate-500">
                      {dictionary?.preview?.department ?? "Department"}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {departmentLabel[department]}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-sm text-slate-500">
                      {dictionary?.preview?.items ?? "Counted items"}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      248 rows
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-white">
                  <p className="text-sm text-slate-300">
                    {dictionary?.preview?.totals ?? "Total amount"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold">Rp 184.250.000</p>
                </div>
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
              <button className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white">
                <div>
                  <p className="font-medium text-slate-900">
                    {dictionary?.templates?.financial ??
                      "Monthly financial report"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">PDF / XLSX</p>
                </div>
                <FileBarChart2 className="size-5 text-slate-500" />
              </button>

              <button className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white">
                <div>
                  <p className="font-medium text-slate-900">
                    {dictionary?.templates?.production ??
                      "Weekly production report"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">PDF / CSV</p>
                </div>
                <ChartColumnBig className="size-5 text-slate-500" />
              </button>

              <button className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300 hover:bg-white">
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
