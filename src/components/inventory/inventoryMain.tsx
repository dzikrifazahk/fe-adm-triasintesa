"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getDictionary } from "../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { inventoryService } from "@/services";
import { InventoryBarcodeScanner } from "@/components/inventory/inventoryBarcodeScanner";
import { InventoryRecentTable } from "@/components/inventory/inventoryRecentTable";
import {
  IInvJirigen,
  IInvMovement,
  IInventoryLocation,
  IScanInPayload,
} from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CalendarRange,
  Loader2,
  MapPin,
  PackageCheck,
  ScanLine,
  ShieldCheck,
  Warehouse,
} from "lucide-react";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>["inventory_page_dic"];

type ListPayload<T> = { data: T[]; meta?: unknown };

type ScanInForm = {
  barcode: string;
  locationId: string;
  qcStatus: string;
  expiryDate: string;
};

const qcStatusOptions = ["PASS", "HOLD", "REJECT"] as const;

const emptyScanInForm: ScanInForm = {
  barcode: "",
  locationId: "",
  qcStatus: "PASS",
  expiryDate: "",
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

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID");
}

function statusClassName(status?: string): string {
  switch (status) {
    case "available":
      return "bg-emerald-600 text-white";
    case "reserved":
      return "bg-amber-600 text-white";
    case "shipped":
      return "bg-blue-600 text-white";
    case "sold":
      return "bg-violet-600 text-white";
    case "returned":
      return "bg-slate-600 text-white";
    default:
      return "bg-slate-500 text-white";
  }
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-[#34363B] dark:bg-[#26282D]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </div>
        </div>
        <div className={`rounded-2xl p-3 ${tone}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function InventoryMain({ dictionary }: { dictionary: Dictionary }) {
  const { setIsLoading } = useLoading();

  const [stocks, setStocks] = useState<IInvJirigen[]>([]);
  const [movements, setMovements] = useState<IInvMovement[]>([]);
  const [locations, setLocations] = useState<IInventoryLocation[]>([]);
  const [scanInForm, setScanInForm] = useState<ScanInForm>(emptyScanInForm);
  const [submittingScan, setSubmittingScan] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchBarcode, setSearchBarcode] = useState("");
  const [scannerRestartKey, setScannerRestartKey] = useState(0);

  const title = dictionary?.title ?? "Inventory";
  const description = dictionary?.hero_description ?? dictionary?.description ?? "";

  const fetchStocks = async (barcode?: string) => {
    const response = await inventoryService.getInvJirigen({
      page: 1,
      limit: 100,
      barcode: barcode || undefined,
    });
    const payload = unwrapData<ListPayload<IInvJirigen>>(response);
    setStocks(Array.isArray(payload?.data) ? payload.data : []);
  };

  const fetchMovements = async () => {
    const response = await inventoryService.getRecentInvMovements(10);
    const payload = unwrapData<IInvMovement[] | ListPayload<IInvMovement>>(response);
    if (Array.isArray(payload)) {
      setMovements(payload);
      return;
    }
    setMovements(Array.isArray(payload?.data) ? payload.data : []);
  };

  const fetchLocations = async () => {
    const response = await inventoryService.getInvLocations({
      page: 1,
      limit: 200,
      status: "active",
    });
    const payload = unwrapData<ListPayload<IInventoryLocation>>(response);
    setLocations(Array.isArray(payload?.data) ? payload.data : []);
  };

  const loadAll = async (barcode?: string) => {
    try {
      setRefreshing(true);
      setIsLoading(true);
      await Promise.all([fetchStocks(barcode), fetchMovements(), fetchLocations()]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: dictionary.toast.load_error_title,
        text: getErrorMessage(error),
      });
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableCount = useMemo(
    () => stocks.filter((item) => item.status === "available").length,
    [stocks],
  );

  const passCount = useMemo(
    () => stocks.filter((item) => item.qcStatus === "PASS").length,
    [stocks],
  );

  const recentStocks = useMemo(() => {
    return [...stocks]
      .sort((a, b) => {
        const first = new Date(b.entryDate || b.lastUpdated || 0).getTime();
        const second = new Date(a.entryDate || a.lastUpdated || 0).getTime();
        return first - second;
      })
      .slice(0, 12);
  }, [stocks]);

  const submitScanIn = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (!scanInForm.barcode || !scanInForm.locationId || !scanInForm.qcStatus) {
      Swal.fire({
        icon: "warning",
        title: dictionary.toast.validation_warning,
      });
      return;
    }

    const payload: IScanInPayload = {
      barcode: scanInForm.barcode.trim(),
      locationId: toNumber(scanInForm.locationId),
      qcStatus: scanInForm.qcStatus,
      expiryDate: scanInForm.expiryDate || undefined,
    };

    try {
      setSubmittingScan(true);
      await inventoryService.scanIn(payload);
      setScanInForm(emptyScanInForm);
      await loadAll(searchBarcode);
      setScannerRestartKey((prev) => prev + 1);

      Swal.fire({
        icon: "success",
        title: dictionary.toast.scan_success_title,
        toast: true,
        position: "top-right",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: dictionary.toast.scan_error_title,
        text: getErrorMessage(error),
      });
    } finally {
      setSubmittingScan(false);
    }
  };

  const handleRefresh = async () => {
    await loadAll(searchBarcode);
  };

  const handleSearch = async () => {
    await loadAll(searchBarcode);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6 overflow-y-auto">
      <section className="rounded-[28px] border border-[#D9E1F2] bg-[linear-gradient(135deg,#F8FBFF_0%,#EEF5FF_50%,#FFFFFF_100%)] p-6 shadow-sm dark:border-[#34363B] dark:bg-[linear-gradient(135deg,#1F2430_0%,#202B3C_50%,#26282D_100%)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-[#CFE0FF] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2B59FF] dark:border-[#3C4D72] dark:bg-[#26282D]/80 dark:text-[#8FB0FF]">
              {dictionary.hero_badge}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {description}
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
            <StatCard
              label={dictionary.stats.available}
              value={availableCount}
              tone="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              icon={<PackageCheck className="h-5 w-5" />}
            />
            <StatCard
              label={dictionary.stats.qc_pass}
              value={passCount}
              tone="bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
              icon={<ShieldCheck className="h-5 w-5" />}
            />
            <StatCard
              label={dictionary.stats.locations}
              value={locations.length}
              tone="bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
              icon={<Warehouse className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <Card className="overflow-hidden border-[#DCE3F1] shadow-sm dark:border-[#34363B] dark:bg-[#26282D]">
          <CardHeader className="border-b bg-white/80 dark:border-[#34363B] dark:bg-[#26282D]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#EAF2FF] p-3 text-[#2B59FF] dark:bg-[#22304A] dark:text-[#8FB0FF]">
                <ScanLine className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{dictionary.scanner.title}</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {dictionary.scanner.description}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={submitScanIn} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <InventoryBarcodeScanner
                  dictionary={dictionary}
                  value={scanInForm.barcode}
                  autoRestartKey={scannerRestartKey}
                  onChange={(barcode) =>
                    setScanInForm((prev) => ({
                      ...prev,
                      barcode,
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  {dictionary.form.location_label}
                </label>
                <select
                  className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-[#34363B] dark:bg-[#1F2023]"
                  value={scanInForm.locationId}
                  onChange={(event) =>
                    setScanInForm((prev) => ({
                      ...prev,
                      locationId: event.target.value,
                    }))
                  }
                >
                  <option value="">{dictionary.form.location_placeholder}</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.locationCode} - {location.locationName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  {dictionary.form.qc_status_label}
                </label>
                <select
                  className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-[#34363B] dark:bg-[#1F2023]"
                  value={scanInForm.qcStatus}
                  onChange={(event) =>
                    setScanInForm((prev) => ({
                      ...prev,
                      qcStatus: event.target.value,
                    }))
                  }
                >
                  {qcStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  {dictionary.form.expiry_date_label}
                </label>
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="date"
                    value={scanInForm.expiryDate}
                    onChange={(event) =>
                      setScanInForm((prev) => ({
                        ...prev,
                        expiryDate: event.target.value,
                      }))
                    }
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  type="submit"
                  disabled={submittingScan}
                  className="h-12 flex-1 bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
                >
                  {submittingScan ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {dictionary.form.submit_loading}
                    </>
                  ) : (
                    <>
                      <ScanLine className="mr-2 h-4 w-4" />
                      {dictionary.form.submit_button}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 sm:w-auto"
                  onClick={() => {
                    setScanInForm(emptyScanInForm);
                    setScannerRestartKey((prev) => prev + 1);
                  }}
                >
                  {dictionary.form.reset_button}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-[#DCE3F1] shadow-sm dark:border-[#34363B] dark:bg-[#26282D]">
            <CardHeader>
              <CardTitle>{dictionary.instructions.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl border bg-slate-50 p-3 dark:border-[#34363B] dark:bg-[#1F2023]">
                1. {dictionary.instructions.step_1}
              </div>
              <div className="rounded-2xl border bg-slate-50 p-3 dark:border-[#34363B] dark:bg-[#1F2023]">
                2. {dictionary.instructions.step_2}
              </div>
              <div className="rounded-2xl border bg-slate-50 p-3 dark:border-[#34363B] dark:bg-[#1F2023]">
                3. {dictionary.instructions.step_3}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#DCE3F1] shadow-sm dark:border-[#34363B] dark:bg-[#26282D]">
            <CardHeader>
              <CardTitle>{dictionary.locations.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {locations.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-500 dark:border-[#34363B] dark:text-slate-400">
                  {dictionary.locations.empty}
                </div>
              ) : (
                locations.slice(0, 8).map((location) => (
                  <div
                    key={location.id}
                    className="flex items-start gap-3 rounded-2xl border bg-slate-50 p-3 dark:border-[#34363B] dark:bg-[#1F2023]"
                  >
                    <div className="mt-0.5 rounded-xl bg-[#EAF2FF] p-2 text-[#2B59FF] dark:bg-[#22304A] dark:text-[#8FB0FF]">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {location.locationName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {location.locationCode} • {location.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_0.85fr]">
        <InventoryRecentTable
          dictionary={dictionary}
          rows={recentStocks}
          searchBarcode={searchBarcode}
          refreshing={refreshing}
          onSearchBarcodeChange={setSearchBarcode}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          formatDate={formatDate}
          getStatusClassName={statusClassName}
        />

        <Card className="border-[#DCE3F1] shadow-sm dark:border-[#34363B] dark:bg-[#26282D]">
          <CardHeader>
            <CardTitle>{dictionary.movements.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {movements.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-500 dark:border-[#34363B] dark:text-slate-400">
                {dictionary.movements.empty}
              </div>
            ) : (
              movements.map((movement) => (
                <div
                  key={movement.id}
                  className="rounded-2xl border bg-slate-50 p-4 dark:border-[#34363B] dark:bg-[#1F2023]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {movement.movementType}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(movement.movementDatetime)}
                      </div>
                    </div>
                    <Badge className="bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900">
                      {movement.quantity}
                    </Badge>
                  </div>
                  <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {movement.fromStatus} → {movement.toStatus}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {movement.referenceType}
                    {movement.referenceId ? ` #${movement.referenceId}` : ""}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
