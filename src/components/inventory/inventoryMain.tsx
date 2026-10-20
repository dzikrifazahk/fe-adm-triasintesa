"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { openSwal } from "@/lib/swal";
import { getDictionary } from "../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { inventoryService } from "@/services";
import { InventoryDetailModal } from "@/components/inventory/inventoryDetailModal";
import { InventoryRecentTable } from "@/components/inventory/inventoryRecentTable";
import { InventoryManualStockInModal } from "@/components/inventory/inventoryManualStockInModal";
import {
  IInvJirigen,
  IInventorySummary,
  IInvMovement,
  IInventoryItemMaster,
  IInventoryLocation,
  InventoryStatus,
} from "@/types/inventory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  MapPin,
  MoveRight,
} from "lucide-react";

import { Combobox } from "@/components/ui/combobox";
import { InventoryBarcodeLookupModal } from "@/components/inventory/inventoryBarcodeLookupModal";
import { InventoryOverview, type StockFilters } from "@/components/inventory/inventoryOverview";
import { useFormText } from "@/hooks/use-form-text";
type Dictionary = Awaited<ReturnType<typeof getDictionary>>["inventory_page_dic"];

type ListPayload<T> = { data: T[]; meta?: unknown };
type PaginatedMeta = {
  page?: number;
  limit?: number;
  totalPages?: number;
  totalItems?: number;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
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

const MOVEMENT_LABELS: Record<string, string> = {
  scan_in: "Scan Masuk",
  manual_in: "Stok Masuk Manual",
  status_change: "Perubahan Status",
  purchase: "Pembelian",
  opening_stock: "Stok Awal / Opname",
  other: "Lainnya",
  production: "Produksi",
  manual: "Manual",
};

const movementLabel = (value?: string | null) =>
  value ? MOVEMENT_LABELS[value] ?? value.replaceAll("_", " ") : "-";

export default function InventoryMain({ dictionary }: { dictionary: Dictionary }) {
  const t = useFormText();
  const { setIsLoading } = useLoading();

  const [stocks, setStocks] = useState<IInvJirigen[]>([]);
  const [movements, setMovements] = useState<IInvMovement[]>([]);
  const [locations, setLocations] = useState<IInventoryLocation[]>([]);
  const [itemMasters, setItemMasters] = useState<IInventoryItemMaster[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchBarcode, setSearchBarcode] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false);
  const [isManualInModalOpen, setIsManualInModalOpen] = useState(false);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [lookupBarcode, setLookupBarcode] = useState("");
  const [summary, setSummary] = useState<IInventorySummary | null>(null);
  const [filters, setFilters] = useState<StockFilters>({ locationId: "", category: "", status: "" });
  // ref agar semua pemanggil loadAll memakai filter terbaru
  const filtersRef = useRef(filters);
  const [editingRow, setEditingRow] = useState<IInvJirigen | null>(null);
  const [editForm, setEditForm] = useState({ itemId: "", locationId: "", expiryDate: "" });
  const [editError, setEditError] = useState("");
  const [selectedDetailRow, setSelectedDetailRow] = useState<IInvJirigen | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


  const fetchStocks = async (
    barcode?: string,
    nextPage = page,
    nextPageSize = pageSize,
  ) => {
    const f = filtersRef.current;
    const response = await inventoryService.getInvItems({
      page: nextPage,
      limit: nextPageSize,
      search: barcode?.trim() || undefined,
      locationId: f.locationId ? Number(f.locationId) : undefined,
      category: f.category || undefined,
      status: f.status || undefined,
    });
    const payload = unwrapData<ListPayload<IInvJirigen>>(response);
    setStocks(Array.isArray(payload?.data) ? payload.data : []);
    // backend: { page, limit, totalPages, totalItems }
    const meta = (payload?.meta as PaginatedMeta | undefined) ?? {};
    setPage(meta.page ?? meta.current_page ?? nextPage);
    setPageSize(meta.limit ?? meta.per_page ?? nextPageSize);
    setLastPage(Math.max(meta.totalPages ?? meta.last_page ?? 1, 1));
    setTotalRows(meta.totalItems ?? meta.total ?? payload?.data?.length ?? 0);
  };

  const fetchSummary = async () => {
    const f = filtersRef.current;
    const response = await inventoryService.getInventorySummary(
      f.locationId ? Number(f.locationId) : undefined,
    );
    setSummary(unwrapData<IInventorySummary>(response));
  };

  const handleFiltersChange = (next: StockFilters) => {
    filtersRef.current = next;
    setFilters(next);
    setPage(1);
    void loadAll(searchBarcode, 1, pageSize);
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
        fetchSummary(),
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

    setEditForm({
      itemId: row.itemId ? String(row.itemId) : "",
      locationId: row.locationId ? String(row.locationId) : "",
      expiryDate: row.expiryDate ? String(row.expiryDate).slice(0, 10) : "",
    });
    setEditError("");
    setEditingRow(row);
  };

  const submitEditRow = async () => {
    if (!editingRow) return;
    const itemId = Number(editForm.itemId || 0);
    const locationId = Number(editForm.locationId || 0);
    if (!itemId || !locationId) {
      setEditError("Item dan lokasi wajib diisi.");
      return;
    }

    try {
      setIsLoading(true);
      await inventoryService.updateInvItemEntry(editingRow.id, {
        itemId,
        locationId,
        expiryDate: editForm.expiryDate || undefined,
      });
      setEditingRow(null);
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
      setEditError(getErrorMessage(error));
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
      <InventoryOverview
        summary={summary}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        search={searchBarcode}
        onSearchChange={setSearchBarcode}
        onSearchSubmit={handleSearch}
        onCheckBarcode={(barcode) => {
          setLookupBarcode(barcode ?? "");
          setIsLookupModalOpen(true);
        }}
        onAddStock={() => setIsManualInModalOpen(true)}
        onOpenLocations={() => setIsLocationsModalOpen(true)}
        onOpenMovements={() => setIsMovementsModalOpen(true)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        formatDate={formatDate}
        getStatusClassName={statusClassName}
      />

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

      <Dialog open={!!editingRow} onOpenChange={(open) => !open && setEditingRow(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Barcode: <b>{editingRow?.barcode ?? "-"}</b>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                {t.common.item} <span className="text-red-500">*</span>
              </label>
              <Combobox
                options={itemMasters.map((item) => ({
                  value: String(item.id),
                  label: `${item.itemCode} - ${item.itemName}`,
                }))}
                value={editForm.itemId}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, itemId: value }))}
                placeholder={t.common.selectItem}
                searchPlaceholder={t.common.searchItem}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                {t.common.location} <span className="text-red-500">*</span>
              </label>
              <Combobox
                options={locations.map((location) => ({
                  value: String(location.id),
                  label: `${location.locationCode} - ${location.locationName}`,
                }))}
                value={editForm.locationId}
                onValueChange={(value) => setEditForm((prev) => ({ ...prev, locationId: value }))}
                placeholder={t.common.selectLocation}
                searchPlaceholder={t.common.searchLocation}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                {t.common.expiryDate}
              </label>
              <Input
                type="date"
                value={editForm.expiryDate}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, expiryDate: event.target.value }))
                }
              />
            </div>
            {editError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {editError}
              </div>
            ) : null}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingRow(null)}>
              Batal
            </Button>
            <Button
              className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
              onClick={submitEditRow}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InventoryBarcodeLookupModal
        isOpen={isLookupModalOpen}
        onOpenChange={setIsLookupModalOpen}
        initialBarcode={lookupBarcode}
        dictionary={dictionary}
        formatDate={formatDate}
        getStatusClassName={statusClassName}
        movementLabel={movementLabel}
      />

      <InventoryManualStockInModal
        isOpen={isManualInModalOpen}
        onOpenChange={setIsManualInModalOpen}
        items={itemMasters}
        locations={locations}
        onSuccess={() => loadAll(searchBarcode, 1, pageSize)}
      />

      <InventoryDetailModal
        data={selectedDetailRow}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onCancel={() => setIsDetailModalOpen(false)}
        formatDate={formatDate}
        getStatusClassName={statusClassName}
      />

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
                        {movementLabel(movement.movementType)}
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
                    {movementLabel(movement.referenceType)}
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
