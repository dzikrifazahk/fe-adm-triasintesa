"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { dashboardService } from "@/services";
import { IProductControlDashboard } from "@/types/dashboard";
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
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardFilterSheet } from "./dashboardFilterSheet";
import { AlertTriangle, Beaker, Droplets, Factory } from "lucide-react";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan";
}

function defaultDateRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

const productionChartConfig = {
  actual: { label: "Actual", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-3)" },
} satisfies ChartConfig;

const qcChartConfig = {
  count: { label: "Jumlah", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function ProductControlDashboardTab() {
  const initial = defaultDateRange();
  const [dateFrom, setDateFrom] = useState(initial.dateFrom);
  const [dateTo, setDateTo] = useState(initial.dateTo);
  const [data, setData] = useState<IProductControlDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getProductControlDashboard({
        dateFrom,
        dateTo,
      });
      setData(response);
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal memuat dashboard product control",
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

  const qcData = [
    { status: "Approved", count: data?.qc.breakdown.approved ?? 0 },
    { status: "Rejected", count: data?.qc.breakdown.rejected ?? 0 },
    { status: "Pending", count: data?.qc.breakdown.pending ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Product Control</h2>
          <p className="text-sm text-slate-500">
            Produksi, QC, Inventory & Tank — {data?.period.from ?? dateFrom} s/d {data?.period.to ?? dateTo}
          </p>
        </div>
        <DashboardFilterSheet
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onApply={fetchData}
          onReset={handleReset}
          title="Filter Product Control"
          description="Filter data produksi, QC, dan inventory berdasarkan periode."
        />
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
                  <Factory className="size-4" /> Production Yield
                </CardDescription>
                <CardTitle className="text-2xl">
                  {data?.productionYield.efficiency ?? 0}%
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                {data?.productionYield.actual ?? 0} / {data?.productionYield.target ?? 0} jirigen
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-slate-500">
                  <Beaker className="size-4" /> QC Pass Rate
                </CardDescription>
                <CardTitle className="text-2xl">{data?.qc.passRate ?? 0}%</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                {data?.qc.breakdown.approved ?? 0} lolos / {data?.qc.breakdown.rejected ?? 0} gagal uji
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-slate-500">
                  <AlertTriangle className="size-4" /> Low Stock Alert
                </CardDescription>
                <CardTitle className="text-2xl">{data?.inventory.lowStockCount ?? 0}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                Item di bawah batas minimum stock
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-slate-500">
                  <Droplets className="size-4" /> Tank Volume In/Out
                </CardDescription>
                <CardTitle className="text-2xl">
                  {(data?.tanks.volumeIn ?? 0).toLocaleString("id-ID")} L
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-500">
                Keluar: {(data?.tanks.volumeOut ?? 0).toLocaleString("id-ID")} L
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Production Yield & Efficiency</CardTitle>
                <CardDescription>Actual vs target produksi harian</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={productionChartConfig} className="h-64 w-full">
                  <LineChart data={data?.productionYield.series ?? []}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} width={32} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line dataKey="actual" stroke="var(--color-actual)" strokeWidth={2} dot={false} />
                    <Line dataKey="target" stroke="var(--color-target)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">QC Pass/Fail Rate</CardTitle>
                <CardDescription>Hasil uji quality control periode ini</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={qcChartConfig} className="h-64 w-full">
                  <BarChart data={qcData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} width={32} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Tank Utilization</CardTitle>
                <CardDescription>Volume tangki saat ini vs kapasitas maksimal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(data?.tanks.utilization ?? []).map((tank) => (
                  <div key={tank.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {tank.tankName} ({tank.tankCode})
                      </span>
                      <span className="text-slate-500">
                        {tank.currentVolume.toLocaleString("id-ID")} / {tank.totalCapacity.toLocaleString("id-ID")} L
                      </span>
                    </div>
                    <Progress value={tank.utilizationPct} />
                  </div>
                ))}
                {!data?.tanks.utilization.length ? (
                  <p className="text-sm text-slate-400">Belum ada data tank.</p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Low Stock Items</CardTitle>
                <CardDescription>Item gudang di bawah batas minimum</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Min</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data?.inventory.lowStockItems ?? []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium text-slate-800">{item.itemName}</p>
                          <p className="text-xs text-slate-400">{item.itemCode}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive">{item.stock}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-500">{item.minStock}</TableCell>
                      </TableRow>
                    ))}
                    {!data?.inventory.lowStockItems.length ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-sm text-slate-400">
                          Semua stok aman.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
