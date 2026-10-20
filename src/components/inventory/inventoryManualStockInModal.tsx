"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Copy,
  Minus,
  PackagePlus,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { useLoading } from "@/context/loadingContext";
import { inventoryService } from "@/services";
import {
  IInventoryItemMaster,
  IInventoryLocation,
  IManualStockInResult,
  ManualStockInSource,
} from "@/types/inventory";
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
import { Textarea } from "@/components/ui/textarea";

import { useFormText } from "@/hooks/use-form-text";
const MAX_QUANTITY = 500;

const SOURCE_OPTIONS: {
  value: ManualStockInSource;
  label: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    value: "purchase",
    label: "Pembelian",
    description: "Barang jadi dibeli dari supplier.",
    icon: <ShoppingBag className="h-5 w-5" />,
  },
  {
    value: "opening_stock",
    label: "Stok Awal / Opname",
    description: "Barang sudah ada di gudang tapi belum tercatat.",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    value: "other",
    label: "Lainnya",
    description: "Sumber lain, jelaskan di catatan.",
    icon: <Sparkles className="h-5 w-5" />,
  },
];

type FormState = {
  itemId: string;
  quantity: string;
  locationId: string;
  source: ManualStockInSource | "";
  referenceNo: string;
  entryDate: string;
  expiryDate: string;
  notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): FormState => ({
  itemId: "",
  quantity: "1",
  locationId: "",
  source: "",
  referenceNo: "",
  entryDate: today(),
  expiryDate: "",
  notes: "",
});

function unwrapData<T>(value: unknown): T {
  if (typeof value === "object" && value !== null && "data" in value) {
    return (value as { data: T }).data;
  }
  return value as T;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan";
}

function Step({
  number,
  title,
  hint,
  children,
}: {
  number: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-iprimary-blue text-sm font-semibold text-white">
        {number}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">{title}</div>
          {hint ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
      {children}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

export function InventoryManualStockInModal({
  isOpen,
  onOpenChange,
  items,
  locations,
  onSuccess,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: IInventoryItemMaster[];
  locations: IInventoryLocation[];
  onSuccess: () => void | Promise<void>;
}) {
  const t = useFormText();
  const { setIsLoading } = useLoading();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<IManualStockInResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const resetState = () => {
    setForm(emptyForm());
    setResult(null);
    setIsConfirming(false);
    setErrorMessage("");
    setCopied(false);
  };

  useEffect(() => {
    if (isOpen) resetState();
  }, [isOpen]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsConfirming(false);
    setErrorMessage("");
  };

  const selectedItem = items.find((item) => String(item.id) === form.itemId);
  const selectedLocation = locations.find(
    (location) => String(location.id) === form.locationId,
  );
  const quantity = Math.floor(Number(form.quantity) || 0);
  const quantityValid = quantity >= 1 && quantity <= MAX_QUANTITY;
  const uom = selectedItem?.uom || "unit";

  const missing = useMemo(() => {
    const list: string[] = [];
    if (!selectedItem) list.push("barang");
    if (!quantityValid) list.push(`jumlah (1–${MAX_QUANTITY})`);
    if (!selectedLocation) list.push("lokasi");
    if (!form.source) list.push("asal barang");
    return list;
  }, [selectedItem, quantityValid, selectedLocation, form.source]);

  const canSubmit = missing.length === 0 && !submitting;

  const changeQuantity = (delta: number) => {
    const next = Math.min(MAX_QUANTITY, Math.max(1, (quantity || 0) + delta));
    setField("quantity", String(next));
  };

  const handleSubmit = async () => {
    if (!canSubmit || !selectedItem || !selectedLocation || !form.source) return;

    try {
      setSubmitting(true);
      setErrorMessage("");
      setIsLoading(true);
      const response = await inventoryService.manualStockIn({
        itemId: selectedItem.id,
        quantity,
        locationId: selectedLocation.id,
        source: form.source,
        referenceNo: form.referenceNo.trim() || undefined,
        entryDate: form.entryDate || undefined,
        expiryDate: form.expiryDate || undefined,
        notes: form.notes.trim() || undefined,
      });
      const payload = unwrapData<IManualStockInResult>(response);
      setResult({
        count: payload?.count ?? quantity,
        barcodes: Array.isArray(payload?.barcodes) ? payload.barcodes : [],
      });
      setIsConfirming(false);
      await onSuccess();
    } catch (error) {
      setIsConfirming(false);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  const copyBarcodes = async () => {
    if (!result?.barcodes.length) return;
    try {
      await navigator.clipboard.writeText(result.barcodes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-iprimary-blue" />
            Stok Masuk Manual
          </DialogTitle>
          <DialogDescription>
            Untuk barang jadi yang masuk <b>tanpa proses produksi</b>, misalnya
            dibeli dari supplier atau stok lama yang belum tercatat.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              <div className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                {result.count} {uom} berhasil masuk ke stok
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {selectedItem?.itemName} • {selectedLocation?.locationName}
              </p>
            </div>

            {result.barcodes.length > 0 ? (
              <div className="rounded-2xl border p-4 dark:border-white/10">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Barcode yang dibuat
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tempel barcode ini di tiap unit agar bisa di-scan saat pengiriman.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyBarcodes}>
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Tersalin" : "Salin semua"}
                  </Button>
                </div>
                <div className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto rounded-lg bg-slate-50 p-2 font-mono text-xs text-slate-700 sm:grid-cols-2 dark:bg-white/5 dark:text-slate-200">
                  {result.barcodes.map((barcode) => (
                    <div key={barcode}>{barcode}</div>
                  ))}
                </div>
              </div>
            ) : null}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={resetState}
              >
                Input lagi
              </Button>
              <Button
                className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
                onClick={() => onOpenChange(false)}
              >
                Selesai
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6">
            <Step number={1} title="Pilih barang" hint="Barang harus sudah terdaftar di Master Item.">
              <Combobox
                options={items.map((item) => ({
                  value: String(item.id),
                  label: `${item.itemName} (${item.itemCode})`,
                }))}
                value={form.itemId}
                onValueChange={(value) => setField("itemId", value)}
                placeholder={t.inventory.searchItemOrCode}
                searchPlaceholder={t.inventory.typeItemOrCode}
                emptyText={t.inventory.itemNotFoundAddMaster}
              />
              {selectedItem ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Stok saat ini: <b>{selectedItem.stock ?? 0} {uom}</b>
                </p>
              ) : null}
            </Step>

            <Step number={2} title="Jumlah dan lokasi penyimpanan">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel required>Jumlah ({uom})</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => changeQuantity(-1)}
                      disabled={quantity <= 1}
                      aria-label={t.inventory.decreaseQty}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={MAX_QUANTITY}
                      value={form.quantity}
                      onChange={(e) => setField("quantity", e.target.value)}
                      className="text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => changeQuantity(1)}
                      disabled={quantity >= MAX_QUANTITY}
                      aria-label={t.inventory.increaseQty}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {!quantityValid && form.quantity !== "" ? (
                    <p className="mt-1 text-xs text-red-500">
                      Jumlah harus 1 sampai {MAX_QUANTITY} per sekali input.
                    </p>
                  ) : null}
                </div>
                <div>
                  <FieldLabel required>{t.common.location}</FieldLabel>
                  <Combobox
                    options={locations.map((location) => ({
                      value: String(location.id),
                      label: `${location.locationName} (${location.locationCode})`,
                    }))}
                    value={form.locationId}
                    onValueChange={(value) => setField("locationId", value)}
                    placeholder={t.common.selectLocation}
                    searchPlaceholder={t.common.searchLocation}
                    emptyText={t.inventory.activeLocationNotFound}
                  />
                </div>
              </div>
            </Step>

            <Step number={3} title="Asal barang">
              <div className="grid gap-2 sm:grid-cols-3">
                {SOURCE_OPTIONS.map((option) => {
                  const active = form.source === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setField("source", option.value)}
                      className={clsx(
                        "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition",
                        active
                          ? "border-iprimary-blue bg-blue-50 ring-1 ring-iprimary-blue dark:bg-blue-500/10"
                          : "border-slate-200 hover:border-iprimary-blue/50 dark:border-white/10"
                      )}
                    >
                      <span
                        className={clsx(
                          active
                            ? "text-iprimary-blue dark:text-blue-300"
                            : "text-slate-500 dark:text-slate-400"
                        )}
                      >
                        {option.icon}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {option.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div>
                <FieldLabel>{t.inventory.referenceNo}</FieldLabel>
                <Input
                  value={form.referenceNo}
                  onChange={(e) => setField("referenceNo", e.target.value)}
                  placeholder={t.inventory.referenceNoPlaceholder}
                  maxLength={100}
                />
              </div>
            </Step>

            <Step number={4} title="Detail tambahan" hint="Opsional, boleh dikosongkan.">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel>{t.common.entryDate}</FieldLabel>
                  <Input
                    type="date"
                    value={form.entryDate}
                    onChange={(e) => setField("entryDate", e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>{t.common.expiryDate}</FieldLabel>
                  <Input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setField("expiryDate", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>{t.common.notes}</FieldLabel>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder={t.inventory.manualNotesPlaceholder}
                  rows={2}
                />
              </div>
            </Step>

            <div
              className={clsx(
                "rounded-2xl border p-4 text-sm",
                missing.length === 0
                  ? "border-blue-200 bg-blue-50 text-slate-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-slate-200"
                  : "border-dashed border-slate-300 text-slate-500 dark:border-white/15 dark:text-slate-400"
              )}
            >
              {missing.length === 0 && selectedItem && selectedLocation ? (
                <div className="space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Ringkasan</div>
                  <div>
                    <b>{quantity} {uom}</b> {selectedItem.itemName} masuk ke{" "}
                    <b>{selectedLocation.locationName}</b>.
                  </div>
                  <div className="flex items-center gap-2">
                    Stok: {selectedItem.stock ?? 0}
                    <ArrowRight className="h-3.5 w-3.5" />
                    <b>{(selectedItem.stock ?? 0) + quantity} {uom}</b>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Sistem akan membuat {quantity} barcode otomatis, satu untuk tiap unit.
                  </div>
                </div>
              ) : (
                <>Lengkapi dulu: {missing.join(", ")}.</>
              )}
            </div>

            {errorMessage ? (
              <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-semibold">Gagal menyimpan stok masuk</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            ) : null}

            {isConfirming && selectedItem && selectedLocation ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                <div className="font-semibold">Yakin data sudah benar?</div>
                <div className="mt-1">
                  <b>{quantity} {uom}</b> {selectedItem.itemName} akan masuk ke{" "}
                  <b>{selectedLocation.locationName}</b>. Pastikan jumlahnya sesuai
                  barang fisik.
                </div>
              </div>
            ) : null}

            <DialogFooter className="gap-2">
              {isConfirming ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirming(false)}
                    disabled={submitting}
                  >
                    Periksa lagi
                  </Button>
                  <Button
                    className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {submitting ? "Menyimpan..." : "Ya, simpan"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Batal
                  </Button>
                  <Button
                    className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
                    disabled={!canSubmit}
                    onClick={() => setIsConfirming(true)}
                  >
                    <PackagePlus className="h-4 w-4" />
                    Simpan Stok Masuk
                  </Button>
                </>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
