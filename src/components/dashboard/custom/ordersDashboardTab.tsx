"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { dashboardService } from "@/services";
import { IOrdersDashboard } from "@/types/dashboard";
import { openSwal } from "@/lib/swal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardFilterSheet } from "./dashboardFilterSheet";
import { Package, TrendingUp, Truck, Wallet } from "lucide-react";

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

const orderVolumeChartConfig = {
  count: { label: "Jumlah Order", color: "var(--chart-1)" },
} satisfies ChartConfig;

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-2)" },
} satisfies ChartConfig;

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "processing", label: "Processing" },
  { value: "ready_to_ship", label: "Ready to Ship" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersDashboardTab() {
  const initial = defaultDateRange();
  const [dateFrom, setDateFrom] = useState(initial.dateFrom);
  const [dateTo, setDateTo] = useState(initial.dateTo);
  const [status, setStatus] = useState("all");
  const [data, setData] = useState<IOrdersDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getOrdersDashboard({
        dateFrom,
        dateTo,
        status: status === "all" ? undefined : status,
      });
      setData(response);
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal memuat dashboard orders",
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
    setStatus("all");
  };

  const deliveryBreakdown = data?.deliveryStatusBreakdown;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Orders Overview</h2>
          <p className="text-sm text-slate-500">
            Sales Order & Shipping — {data?.period.from ?? dateFrom} s/d {data?.period.to ?? dateTo}
          </p>
        </div>
        <DashboardFilterSheet
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onApply={fetchData}
          onReset={handleReset}
          title="Filter Orders"
          description="Filter order berdasarkan periode dan status."
        >
          <div className="grid gap-2">
            <Label>Status Order</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full rounded-xl border-slate-200">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DashboardFilterSheet>
      </div>

      {loading && !data ? (
        <div className="grid gap-4 md:grid-cols-4">
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
                  <Package className="size-4" /> Order Volume
                </CardDescription>
                <CardTitle className="text-2xl">{data?.orderVolume.total ?? 0}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                {data?.orderVolume.cancelled ?? 0} cancelled dalam periode ini
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-slate-500">
                  <Truck className="size-4" /> Shipping Lead Time (SLA)
                </CardDescription>
                <CardTitle className="text-2xl">
                  {data?.shippingLeadTimeAvgDays ?? 0} hari
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                Rata-rata order dibuat sampai diterima konsumen
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-slate-500">
                  <TrendingUp className="size-4" /> Fulfillment Rate
                </CardDescription>
                <CardTitle className="text-2xl">{data?.fulfillmentRate ?? 0}%</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                Order selesai tepat waktu vs total order masuk
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-slate-500">
                  <Wallet className="size-4" /> Revenue
                </CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(data?.revenue ?? 0)}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                Margin approx. {data?.profitMargin ?? 0}% (COGS: {formatCurrency(data?.approxCogs ?? 0)})
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Order Volume Trend</CardTitle>
                <CardDescription>Jumlah pesanan masuk harian</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={orderVolumeChartConfig} className="h-64 w-full">
                  <AreaChart data={data?.orderVolume.series ?? []}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} width={32} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      dataKey="count"
                      type="monotone"
                      fill="var(--color-count)"
                      fillOpacity={0.25}
                      stroke="var(--color-count)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Revenue Trend</CardTitle>
                <CardDescription>Pendapatan bulanan dari order selesai</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueChartConfig} className="h-64 w-full">
                  <BarChart data={data?.revenueTrend ?? []}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} width={32} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Delivery Status Breakdown</CardTitle>
                <CardDescription>Status pengiriman real-time</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Pending</p>
                  <p className="mt-1 text-xl font-semibold">{deliveryBreakdown?.pending ?? 0}</p>
                </div>
                <div className="rounded-xl bg-sky-50 p-3 text-center">
                  <p className="text-xs text-sky-600">In Transit</p>
                  <p className="mt-1 text-xl font-semibold text-sky-700">
                    {deliveryBreakdown?.in_transit ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-center">
                  <p className="text-xs text-emerald-600">Delivered</p>
                  <p className="mt-1 text-xl font-semibold text-emerald-700">
                    {deliveryBreakdown?.delivered ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-red-50 p-3 text-center">
                  <p className="text-xs text-red-600">Delayed</p>
                  <p className="mt-1 text-xl font-semibold text-red-700">
                    {deliveryBreakdown?.delayed ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-xs text-slate-500">Returned</p>
                  <p className="mt-1 text-xl font-semibold">{deliveryBreakdown?.returned ?? 0}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Cash Flow Monitoring</CardTitle>
                <CardDescription>Arus kas masuk vs keluar periode ini</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                  <span className="text-sm text-emerald-700">Cash In</span>
                  <span className="font-semibold text-emerald-700">
                    {formatCurrency(data?.cashFlow.cashIn ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-red-50 p-3">
                  <span className="text-sm text-red-700">Cash Out</span>
                  <span className="font-semibold text-red-700">
                    {formatCurrency(data?.cashFlow.cashOut ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-900 p-3 text-white">
                  <span className="text-sm">Net Cash Flow</span>
                  <Badge className="border-white/20 bg-white/10 text-white">
                    {formatCurrency(data?.cashFlow.net ?? 0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
