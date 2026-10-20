"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle2, Loader2, PackagePlus } from "lucide-react";
import { inventoryService } from "@/services";
import { IInventoryItemMaster, IInventoryLocation } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useFormText } from "@/hooks/use-form-text";
const LAST_LOCATION_KEY = "inventory:lastScanLocationId";

type Preview = {
  jirigenId: number;
  batchNumber: string;
  quantity: number;
  volumeLiter: number;
  barcodes: string[];
  alreadyInInventory: string[];
  item: { id: number; itemCode: string; itemName: string; uom?: string | null } | null;
  expiryDate: string | null;
  coaNumber: string | null;
};

type ScanResult = { count: number; skipped: number; barcodes: string[] };

function unwrap<T>(value: unknown): T {
  if (typeof value === "object" && value !== null && "data" in value) {
    return (value as { data: T }).data;
  }
  return value as T;
}

function listOf<T>(value: unknown): T[] {
  const payload = unwrap<{ data?: T[] } | T[]>(value);
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.data) ? payload.data : [];
}

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
  }
  return "Terjadi kesalahan";
}

function readLastLocation() {
  try {
    return window.localStorage.getItem(LAST_LOCATION_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveLastLocation(id: string) {
  try {
    window.localStorage.setItem(LAST_LOCATION_KEY, id);
  } catch {
    // storage tidak tersedia
  }
}

export function ModalScanProductionJirigen({
  jirigenId,
  onClose,
  onSuccess,
}: {
  jirigenId: string | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}) {
  const t = useFormText();
  const open = Boolean(jirigenId);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [locations, setLocations] = useState<IInventoryLocation[]>([]);
  const [items, setItems] = useState<IInventoryItemMaster[]>([]);
  const [locationId, setLocationId] = useState("");
  const [itemId, setItemId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    if (!jirigenId) return;
    let cancelled = false;
    setPreview(null);
    setResult(null);
    setError("");
    setConfirming(false);
    setLoading(true);

    (async () => {
      try {
        const [previewRes, locationRes, itemRes] = await Promise.all([
          inventoryService.previewProductionJirigen(jirigenId),
          inventoryService.getInvLocations({ page: 1, limit: 200, status: "active" }),
          inventoryService.getInventoryItems({ page: 1, limit: 200, isActive: true }),
        ]);
        if (cancelled) return;
        const data = unwrap<Preview>(previewRes);
        const locs = listOf<IInventoryLocation>(locationRes);
        setPreview(data);
        setLocations(locs);
        setItems(listOf<IInventoryItemMaster>(itemRes));
        setItemId(data.item ? String(data.item.id) : "");
        setExpiryDate(data.expiryDate ? String(data.expiryDate).slice(0, 10) : "");
        const last = readLastLocation();
        setLocationId(locs.some((l) => String(l.id) === last) ? last : "");
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [jirigenId]);

  const newCount = preview ? preview.quantity - preview.alreadyInInventory.length : 0;
  const selectedItem = items.find((i) => String(i.id) === itemId);
  const selectedLocation = locations.find((l) => String(l.id) === locationId);
  const missing = [!itemId && "produk", !locationId && "lokasi gudang"].filter(Boolean);

  const submit = async () => {
    if (!jirigenId || missing.length) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const res = await inventoryService.scanProductionJirigen(jirigenId, {
        locationId: Number(locationId),
        itemId: Number(itemId),
        expiryDate: expiryDate || undefined,
      });
      saveLastLocation(locationId);
      setResult(unwrap<ScanResult>(res));
      await onSuccess();
    } catch (e) {
      setConfirming(false);
      setError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const uom = selectedItem?.uom || preview?.item?.uom || "unit";

  return (
    <Dialog open={open} onOpenChange={(value) => !value && !submitting && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-iprimary-blue" />
            Scan Produksi ke Stok
          </DialogTitle>
          <DialogDescription>
            Semua jirigen di baris ini langsung masuk ke Stok Barang.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat data jirigen...
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              <div className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                {result.count} {uom} masuk ke stok
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {selectedItem?.itemName ?? preview?.item?.itemName} • {selectedLocation?.locationName}
                {result.skipped ? ` • ${result.skipped} barcode sudah ada sebelumnya (dilewati)` : ""}
              </p>
            </div>
            <DialogFooter>
              <Button className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary" onClick={onClose}>
                Selesai
              </Button>
            </DialogFooter>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-slate-50 p-4 text-sm sm:grid-cols-3 dark:border-white/10 dark:bg-white/5">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Batch</div>
                <div className="font-medium text-slate-900 dark:text-slate-100">{preview.batchNumber}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Jumlah</div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {preview.quantity} jirigen × {preview.volumeLiter} L
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">COA</div>
                <div className="font-medium text-slate-900 dark:text-slate-100">{preview.coaNumber ?? "-"}</div>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Barcode</div>
                <div className="font-mono text-xs text-slate-700 dark:text-slate-200">
                  {preview.barcodes.length > 1
                    ? `${preview.barcodes[0]} s/d ${preview.barcodes[preview.barcodes.length - 1]}`
                    : preview.barcodes[0]}
                </div>
              </div>
            </div>

            {preview.alreadyInInventory.length > 0 ? (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {preview.alreadyInInventory.length} dari {preview.quantity} barcode sudah ada di stok dan akan dilewati.
              </div>
            ) : null}

            <div className="grid gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t.common.product} <span className="ml-0.5 text-red-500">*</span>
                  {preview.item ? (
                    <span className="ml-1 text-xs font-normal text-slate-500">(dari production plan)</span>
                  ) : null}
                </label>
                <Combobox
                  options={items.map((i) => ({ value: String(i.id), label: `${i.itemName} (${i.itemCode})` }))}
                  value={itemId}
                  onValueChange={(v) => {
                    setItemId(v);
                    setConfirming(false);
                  }}
                  placeholder={t.common.selectProduct}
                  searchPlaceholder={t.common.searchProduct}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t.inventory.warehouseLocation} <span className="ml-0.5 text-red-500">*</span>
                  </label>
                  <Combobox
                    options={locations.map((l) => ({
                      value: String(l.id),
                      label: `${l.locationName} (${l.locationCode})`,
                    }))}
                    value={locationId}
                    onValueChange={(v) => {
                      setLocationId(v);
                      setConfirming(false);
                    }}
                    placeholder={t.common.selectLocation}
                    searchPlaceholder={t.common.searchLocation}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t.inventory.expiryDate}
                    {preview.expiryDate ? (
                      <span className="ml-1 text-xs font-normal text-slate-500">(dari COA)</span>
                    ) : null}
                  </label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => {
                      setExpiryDate(e.target.value);
                      setConfirming(false);
                    }}
                  />
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            ) : null}

            {confirming ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                <div className="font-semibold">Yakin data sudah benar?</div>
                <b>{newCount} {uom}</b> {selectedItem?.itemName} akan masuk ke{" "}
                <b>{selectedLocation?.locationName}</b>.
              </div>
            ) : missing.length ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">Lengkapi dulu: {missing.join(", ")}.</p>
            ) : null}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => (confirming ? setConfirming(false) : onClose())}
                disabled={submitting}
              >
                {confirming ? "Periksa lagi" : "Batal"}
              </Button>
              <Button
                className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
                disabled={submitting || missing.length > 0 || newCount <= 0}
                onClick={submit}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
                {submitting
                  ? "Menyimpan..."
                  : confirming
                    ? "Ya, masukkan ke stok"
                    : newCount <= 0
                      ? "Semua sudah di stok"
                      : `Masukkan ${newCount} ${uom} ke Stok`}
              </Button>
            </DialogFooter>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
