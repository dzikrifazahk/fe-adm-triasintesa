"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { openSwal, showSwalValidationMessage } from "@/lib/swal";
import { getDictionary } from "../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { inventoryService } from "@/services";
import { InventoryBarcodeScanner } from "@/components/inventory/inventoryBarcodeScanner";
import { InventoryDetailModal } from "@/components/inventory/inventoryDetailModal";
import { InventoryRecentTable } from "@/components/inventory/inventoryRecentTable";
import {
  IInvJirigen,
  IInvMovement,
  IInventoryItemMaster,
  IInventoryLocation,
  InventoryStatus,
  IScanInPayload,
} from "@/types/inventory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  BookOpenText,
  CalendarRange,
  Loader2,
  MapPin,
  MoveRight,
  PackageCheck,
  ScanLine,
  Warehouse,
} from "lucide-react";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>["inventory_page_dic"];

type ListPayload<T> = { data: T[]; meta?: unknown };
type PaginatedMeta = {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
};

type ScanInForm = {
  itemId: string;
  barcode: string;
  locationId: string;
  expiryDate: string;
};

const emptyScanInForm: ScanInForm = {
  itemId: "",
  barcode: "",
  locationId: "",
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
  icon: ReactNode;
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

function ActionButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[92px] w-full items-start gap-4 rounded-2xl border border-[#DCE3F1] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#B8CCFF] hover:shadow-md dark:border-[#34363B] dark:bg-[#26282D] dark:hover:border-[#4661A8]"
    >
      <div className="rounded-2xl bg-[#EAF2FF] p-3 text-[#2B59FF] transition group-hover:bg-[#DDE9FF] dark:bg-[#22304A] dark:text-[#8FB0FF]">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-slate-900 dark:text-slate-100">{title}</div>
        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </button>
  );
}

export default function InventoryMain({ dictionary }: { dictionary: Dictionary }) {
  const { setIsLoading } = useLoading();

  const [stocks, setStocks] = useState<IInvJirigen[]>([]);
  const [movements, setMovements] = useState<IInvMovement[]>([]);
  const [locations, setLocations] = useState<IInventoryLocation[]>([]);
  const [itemMasters, setItemMasters] = useState<IInventoryItemMaster[]>([]);
  const [scanInForm, setScanInForm] = useState<ScanInForm>(emptyScanInForm);
  const [submittingScan, setSubmittingScan] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchBarcode, setSearchBarcode] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [scannerRestartKey, setScannerRestartKey] = useState(0);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false);
  const [selectedDetailRow, setSelectedDetailRow] = useState<IInvJirigen | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const title = dictionary?.title ?? "Inventory";
  const description = dictionary?.hero_description ?? dictionary?.description ?? "";

  const fetchStocks = async (
    barcode?: string,
    nextPage = page,
    nextPageSize = pageSize,
  ) => {
    const response = await inventoryService.getInvItems({
      page: nextPage,
      limit: nextPageSize,
      barcode: barcode || undefined,
    });
    const payload = unwrapData<ListPayload<IInvJirigen>>(response);
    setStocks(Array.isArray(payload?.data) ? payload.data : []);
    const meta = (payload?.meta as PaginatedMeta | undefined) ?? {};
    setPage(meta.current_page ?? nextPage);
    setPageSize(meta.per_page ?? nextPageSize);
    setLastPage(meta.last_page ?? 1);
    setTotalRows(meta.total ?? payload?.data?.length ?? 0);
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

  const fetchItemMasters = async () => {
    const response = await inventoryService.getInventoryItems({
      page: 1,
      limit: 200,
      isActive: true,
    });
    const payload = unwrapData<ListPayload<IInventoryItemMaster>>(response);
    setItemMasters(Array.isArray(payload?.data) ? payload.data : []);
  };

  const loadAll = async (barcode?: string, nextPage = page, nextPageSize = pageSize) => {
    try {
      setRefreshing(true);
      setIsLoading(true);
      await Promise.all([
        fetchStocks(barcode, nextPage, nextPageSize),
        fetchMovements(),
        fetchLocations(),
        fetchItemMasters(),
      ]);
    } catch (error) {
      openSwal({
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

  const scanDraftCount = useMemo(() => {
    return [scanInForm.itemId, scanInForm.barcode, scanInForm.locationId, scanInForm.expiryDate]
      .filter(Boolean).length;
  }, [scanInForm]);

  const submitScanIn = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!scanInForm.barcode || !scanInForm.locationId) {
      openSwal({
        icon: "warning",
        title: dictionary.toast.validation_warning,
      });
      return;
    }

    const payload: IScanInPayload = {
      itemId: scanInForm.itemId ? toNumber(scanInForm.itemId) : undefined,
      barcode: scanInForm.barcode.trim(),
      locationId: toNumber(scanInForm.locationId),
      expiryDate: scanInForm.expiryDate || undefined,
    };

    try {
      setSubmittingScan(true);
      await inventoryService.scanIn(payload);
      setScanInForm(emptyScanInForm);
      await loadAll(searchBarcode);
      setScannerRestartKey((prev) => prev + 1);
      setIsScanModalOpen(false);

      openSwal({
        icon: "success",
        title: dictionary.toast.scan_success_title,
        toast: true,
        position: "top-right",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      openSwal({
        icon: "error",
        title: dictionary.toast.scan_error_title,
        text: getErrorMessage(error),
      });
    } finally {
      setSubmittingScan(false);
    }
  };

  const handleRefresh = async () => {
    await loadAll(searchBarcode, page, pageSize);
  };

  const handleSearch = async () => {
    setPage(1);
    await loadAll(searchBarcode, 1, pageSize);
  };

  const handleViewRow = (row: IInvJirigen) => {
    setSelectedDetailRow(row);
    setIsDetailModalOpen(true);
  };

  const handleChangeStatus = async (id: number, status: InventoryStatus) => {
    try {
      setIsLoading(true);
      await inventoryService.updateInvJirigenStatus(id, status);
      await loadAll(searchBarcode, page, pageSize);
      openSwal({
        icon: "success",
        title: "Status inventory berhasil diperbarui",
        toast: true,
        position: "top-right",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal memperbarui status inventory",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRow = async (row: IInvJirigen) => {
    if (row.status !== "available") {
      openSwal({
        icon: "warning",
        title: "Hanya item status available yang bisa diedit",
      });
      return;
    }

    const itemOptions = itemMasters
      .map((item) => {
        const selected = row.itemId === item.id ? "selected" : "";
        return `<option value="${item.id}" ${selected}>${item.itemCode} - ${item.itemName}</option>`;
      })
      .join("");
    const locationOptions = locations
      .map((location) => {
        const selected = row.locationId === location.id ? "selected" : "";
        return `<option value="${location.id}" ${selected}>${location.locationCode} - ${location.locationName}</option>`;
      })
      .join("");
    const expiryValue = row.expiryDate ? row.expiryDate.slice(0, 10) : "";

    const result = await openSwal({
      title: "Edit Inventory Item",
      html: `
        <div style="display:flex;flex-direction:column;gap:10px;text-align:left">
          <label>Item</label>
          <select id="inv-item-id" class="swal2-input" style="margin:0">${itemOptions}</select>
          <label>Location</label>
          <select id="inv-location-id" class="swal2-input" style="margin:0">${locationOptions}</select>
          <label>Expiry Date</label>
          <input id="inv-expiry-date" type="date" class="swal2-input" style="margin:0" value="${expiryValue}" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const itemId = Number(
          (document.getElementById("inv-item-id") as HTMLSelectElement)?.value || 0,
        );
        const locationId = Number(
          (document.getElementById("inv-location-id") as HTMLSelectElement)?.value || 0,
        );
        const expiryDate =
          (document.getElementById("inv-expiry-date") as HTMLInputElement)?.value || undefined;
        if (!itemId || !locationId) {
          showSwalValidationMessage("Item dan location wajib diisi.");
          return null;
        }
        return { itemId, locationId, expiryDate };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    try {
      setIsLoading(true);
      await inventoryService.updateInvItemEntry(row.id, result.value);
      await loadAll(searchBarcode, page, pageSize);
      openSwal({
        icon: "success",
        title: "Inventory berhasil diperbarui",
        toast: true,
        position: "top-right",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal mengedit inventory",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRow = async (row: IInvJirigen) => {
    if (row.status !== "available") {
      openSwal({
        icon: "warning",
        title: "Hanya item status available yang bisa dihapus",
      });
      return;
    }

    const confirmation = await openSwal({
      icon: "warning",
      title: "Hapus item inventory ini?",
      text: `Barcode: ${row.barcode}`,
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });
    if (!confirmation.isConfirmed) return;

    try {
      setIsLoading(true);
      await inventoryService.deleteInvItemEntry(row.id);
      await loadAll(searchBarcode, page, pageSize);
      openSwal({
        icon: "success",
        title: "Inventory berhasil dihapus",
        toast: true,
        position: "top-right",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal menghapus inventory",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6 overflow-y-auto">
      <section className="rounded-[28px] border border-[#D9E1F2] bg-[linear-gradient(135deg,#F8FBFF_0%,#EEF5FF_45%,#FFFFFF_100%)] p-6 shadow-sm dark:border-[#34363B] dark:bg-[linear-gradient(135deg,#1F2430_0%,#202B3C_40%,#26282D_100%)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
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

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[420px]">
            <StatCard
              label={dictionary.stats.available}
              value={availableCount}
              tone="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              icon={<PackageCheck className="h-5 w-5" />}
            />
            <StatCard
              label={dictionary.stats.locations}
              value={locations.length}
              tone="bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
              icon={<Warehouse className="h-5 w-5" />}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-4">
          <ActionButton
            icon={<ScanLine className="h-5 w-5" />}
            title={dictionary.scanner.title}
            description="Buka form scan dan input inventory dalam modal terpisah."
            onClick={() => setIsScanModalOpen(true)}
          />
          <ActionButton
            icon={<BookOpenText className="h-5 w-5" />}
            title={dictionary.instructions.title}
            description="Lihat langkah operasional scan inventory sebelum proses input."
            onClick={() => setIsGuideModalOpen(true)}
          />
          <ActionButton
            icon={<MapPin className="h-5 w-5" />}
            title={dictionary.locations.title}
            description="Tampilkan daftar lokasi aktif yang bisa dipilih saat scan."
            onClick={() => setIsLocationsModalOpen(true)}
          />
          <ActionButton
            icon={<MoveRight className="h-5 w-5" />}
            title={dictionary.movements.title}
            description="Pantau perpindahan inventory terbaru tanpa memenuhi halaman utama."
            onClick={() => setIsMovementsModalOpen(true)}
          />
        </div>
      </section>

      <section>
        <InventoryRecentTable
          dictionary={dictionary}
          rows={stocks}
          searchBarcode={searchBarcode}
          refreshing={refreshing}
          page={page}
          pageSize={pageSize}
          lastPage={lastPage}
          totalRows={totalRows}
          onSearchBarcodeChange={setSearchBarcode}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onPageChange={(nextPage) => {
            void loadAll(searchBarcode, nextPage, pageSize);
          }}
          onPageSizeChange={(nextPageSize) => {
            setPage(1);
            setPageSize(nextPageSize);
            void loadAll(searchBarcode, 1, nextPageSize);
          }}
          onChangeStatus={handleChangeStatus}
          onViewRow={handleViewRow}
          onEditRow={handleEditRow}
          onDeleteRow={handleDeleteRow}
          formatDate={formatDate}
          getStatusClassName={statusClassName}
        />
      </section>

      <InventoryDetailModal
        data={selectedDetailRow}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onCancel={() => setIsDetailModalOpen(false)}
        formatDate={formatDate}
        getStatusClassName={statusClassName}
      />

      <Dialog
        open={isScanModalOpen}
        onOpenChange={(open) => {
          setIsScanModalOpen(open);
          if (!open) {
            setScannerRestartKey((prev) => prev + 1);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{dictionary.scanner.title}</DialogTitle>
            <DialogDescription>{dictionary.scanner.description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_320px]">
            <form onSubmit={submitScanIn} className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  {dictionary.form.item_label ?? "Item"}
                </label>
                <select
                  className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-[#34363B] dark:bg-[#1F2023]"
                  value={scanInForm.itemId}
                  onChange={(event) =>
                    setScanInForm((prev) => ({
                      ...prev,
                      itemId: event.target.value,
                    }))
                  }
                >
                  <option value="">
                    {dictionary.form.item_placeholder ?? "Pilih item"}
                  </option>
                  {itemMasters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemCode} - {item.itemName}
                    </option>
                  ))}
                </select>
              </div>

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

              <div className="grid gap-4 md:grid-cols-2">
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
              </div>

              <DialogFooter className="border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setScanInForm(emptyScanInForm);
                    setScannerRestartKey((prev) => prev + 1);
                  }}
                >
                  {dictionary.form.reset_button}
                </Button>
                <Button
                  type="submit"
                  disabled={submittingScan}
                  className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
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
              </DialogFooter>
            </form>

            <div className="space-y-4">
              <Card className="border-[#DCE3F1] shadow-none dark:border-[#34363B] dark:bg-[#1F2023]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Ringkasan Input</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="rounded-2xl border bg-slate-50 p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                    Draft terisi <span className="font-semibold">{scanDraftCount}/4</span> field.
                  </div>
                  <div className="rounded-2xl border bg-slate-50 p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                    Lokasi aktif tersedia <span className="font-semibold">{locations.length}</span>.
                  </div>
                  <div className="rounded-2xl border bg-slate-50 p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                    Stock available saat ini <span className="font-semibold">{availableCount}</span>.
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#DCE3F1] shadow-none dark:border-[#34363B] dark:bg-[#1F2023]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{dictionary.instructions.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="rounded-2xl border bg-slate-50 p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                    1. {dictionary.instructions.step_1}
                  </div>
                  <div className="rounded-2xl border bg-slate-50 p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                    2. {dictionary.instructions.step_2}
                  </div>
                  <div className="rounded-2xl border bg-slate-50 p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                    3. {dictionary.instructions.step_3}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isGuideModalOpen} onOpenChange={setIsGuideModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dictionary.instructions.title}</DialogTitle>
            <DialogDescription>
              Panduan singkat agar proses scan inventory lebih rapi dan konsisten.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-600 dark:border-[#34363B] dark:bg-[#1F2023] dark:text-slate-300">
              1. {dictionary.instructions.step_1}
            </div>
            <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-600 dark:border-[#34363B] dark:bg-[#1F2023] dark:text-slate-300">
              2. {dictionary.instructions.step_2}
            </div>
            <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-600 dark:border-[#34363B] dark:bg-[#1F2023] dark:text-slate-300">
              3. {dictionary.instructions.step_3}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLocationsModalOpen} onOpenChange={setIsLocationsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dictionary.locations.title}</DialogTitle>
            <DialogDescription>
              Referensi lokasi aktif untuk penempatan inventory saat proses scan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {locations.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-4 text-sm text-slate-500 dark:border-[#34363B] dark:text-slate-400">
                {dictionary.locations.empty}
              </div>
            ) : (
              locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-start gap-3 rounded-2xl border bg-slate-50 p-4 dark:border-[#34363B] dark:bg-[#1F2023]"
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
                    {location.notes ? (
                      <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {location.notes}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMovementsModalOpen} onOpenChange={setIsMovementsModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{dictionary.movements.title}</DialogTitle>
            <DialogDescription>
              Ringkasan perpindahan status dan lokasi inventory yang paling baru.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
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
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-medium capitalize text-slate-900 dark:text-slate-100">
                        {movement.movementType}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(movement.movementDatetime)} • {movement.movedBy}
                      </div>
                    </div>
                    <Badge className="w-fit bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900">
                      Qty {movement.quantity}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Badge variant="outline">{movement.fromStatus}</Badge>
                    <MoveRight className="h-4 w-4" />
                    <Badge variant="outline">{movement.toStatus}</Badge>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {movement.fromLocation?.locationName ?? "-"} ke{" "}
                    {movement.toLocation?.locationName ?? "-"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {movement.referenceType}
                    {movement.referenceId ? ` #${movement.referenceId}` : ""}
                  </div>
                  {movement.notes ? (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {movement.notes}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
