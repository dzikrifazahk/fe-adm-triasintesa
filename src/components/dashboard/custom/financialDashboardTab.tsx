"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { dashboardService } from "@/services";
import { IFinancialDashboard } from "@/types/dashboard";
import { openSwal } from "@/lib/swal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardFilterSheet } from "./dashboardFilterSheet";
import { AlertOctagon, CheckCircle2, CircleDollarSign, FileClock } from "lucide-react";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
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

function defaultDateRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

const categoryChartConfig = {
  amount: { label: "Nominal", color: "var(--chart-4)" },
} satisfies ChartConfig;

export default function FinancialDashboardTab() {
  const initial = defaultDateRange();
  const [dateFrom, setDateFrom] = useState(initial.dateFrom);
  const [dateTo, setDateTo] = useState(initial.dateTo);
  const [data, setData] = useState<IFinancialDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getFinancialDashboard({
        dateFrom,
        dateTo,
      });
      setData(response);
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal memuat dashboard financial records",
        text: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    const defaults = defaultDateRange();
    setDateFrom(defaults.dateFrom);
    setDateTo(defaults.dateTo);
  };

  const stages = data?.recordsPerStage;
  const totalRecords = (stages?.submission ?? 0) + (stages?.payment_request ?? 0) + (stages?.paid ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Financial Records</h2>
          <p className="text-sm text-slate-500">
            Belanja perusahaan — {data?.period.from ?? dateFrom} s/d {data?.period.to ?? dateTo}
          </p>
        </div>
        <DashboardFilterSheet
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onApply={fetchData}
          onReset={handleReset}
          title="Filter Financial Records"
          description="Filter belanja perusahaan berdasarkan periode."
        />
      </div>

      {loading && !data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-slate-500">
                  <FileClock className="size-4" /> Total Records
                </CardDescription>
                <CardTitle className="text-2xl">{totalRecords}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                Submission {stages?.submission ?? 0} · Payment Req {stages?.payment_request ?? 0} · Paid {stages?.paid ?? 0}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-slate-500">
                  <CircleDollarSign className="size-4" /> Belum Terbayar
                </CardDescription>
                <CardTitle className="text-xl">{formatCurrency(data?.unpaidAmount ?? 0)}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                Gabungan stage submission & payment request
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-slate-500">
                  <CheckCircle2 className="size-4" /> Sudah Terbayar
                </CardDescription>
                <CardTitle className="text-xl">{formatCurrency(data?.paidAmount ?? 0)}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">Stage paid</CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-slate-500">
                  <AlertOctagon className="size-4" /> Telat Pembayaran
                </CardDescription>
                <CardTitle className="text-xl text-red-600">
                  {formatCurrency(data?.overdueAmount ?? 0)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                Belum stage paid & sudah lewat due date
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="rounded-2xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Records per Stage</CardTitle>
                <CardDescription>Submission → Payment Request → Paid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3">
                  <span className="text-sm text-amber-700">Submission</span>
                  <span className="font-semibold text-amber-700">{stages?.submission ?? 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-sky-50 p-3">
                  <span className="text-sm text-sky-700">Payment Request</span>
                  <span className="font-semibold text-sky-700">{stages?.payment_request ?? 0}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                  <span className="text-sm text-emerald-700">Paid</span>
                  <span className="font-semibold text-emerald-700">{stages?.paid ?? 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Nominal per Kategori</CardTitle>
                <CardDescription>Belanja terbesar berdasarkan kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={categoryChartConfig} className="h-64 w-full">
                  <BarChart data={data?.categoryBreakdown ?? []} layout="vertical">
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
