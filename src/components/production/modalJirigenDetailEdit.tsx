"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Pencil } from "lucide-react";
import { inventoryService, productionPlanService } from "@/services";
import { IProductionJirigen } from "@/types/production";
import { openSwal } from "@/lib/swal";
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
import { Textarea } from "@/components/ui/textarea";

import { useFormText } from "@/hooks/use-form-text";
export type JirigenModalState = { mode: "detail" | "edit"; jirigen: IProductionJirigen } | null;

function toLocalInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
  }
  return "Terjadi kesalahan";
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}

export function ModalJirigenDetailEdit({
  state,
  onClose,
  onChangeMode,
  onSaved,
  formatDate,
}: {
  state: JirigenModalState;
  onClose: () => void;
  onChangeMode: (mode: "detail" | "edit") => void;
  onSaved: () => void | Promise<void>;
  formatDate: (value?: string) => string;
}) {
  const t = useFormText();
  const jirigen = state?.jirigen;
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [loadingBarcodes, setLoadingBarcodes] = useState(false);
  const [form, setForm] = useState({ jirigenNumber: "", volumeLiter: "", productionDatetime: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jirigen) return;
    setError("");
    setForm({
      jirigenNumber: String(jirigen.jirigenNumber ?? ""),
      volumeLiter: String(Number(jirigen.volumeLiter ?? 0)),
      productionDatetime: toLocalInput(jirigen.productionDatetime),
      notes: jirigen.notes ?? "",
    });
    if (state?.mode !== "detail") return;
    let cancelled = false;
    setLoadingBarcodes(true);
    inventoryService
      .previewProductionJirigen(jirigen.id)
      .then((res) => {
        const data = (res?.data ?? res) as { barcodes?: string[] };
        if (!cancelled) setBarcodes(Array.isArray(data?.barcodes) ? data.barcodes : []);
      })
      .catch(() => !cancelled && setBarcodes([]))
      .finally(() => !cancelled && setLoadingBarcodes(false));
    return () => {
      cancelled = true;
    };
  }, [jirigen, state?.mode]);

  const inStock = jirigen?.inStockCount ?? 0;
  const qty = Number(jirigen?.jirigenNumber ?? 0);
  const vol = Number(jirigen?.volumeLiter ?? 0);

  const save = async () => {
    if (!jirigen) return;
    const nextQty = Number(form.jirigenNumber);
    const nextVol = Number(form.volumeLiter);
    if (!Number.isInteger(nextQty) || nextQty < 1) return setError("Jumlah jirigen minimal 1.");
    if (!(nextVol > 0)) return setError("Volume per jirigen harus lebih dari 0.");
    if (!form.productionDatetime) return setError("Waktu produksi wajib diisi.");
    try {
      setSaving(true);
      setError("");
      await productionPlanService.updateProductionJirigen(String(jirigen.id), {
        jirigenNumber: nextQty,
        volumeLiter: nextVol,
        productionDatetime: new Date(form.productionDatetime).toISOString(),
        notes: form.notes,
      });
      onClose();
      await onSaved();
      setTimeout(() => {
        openSwal({
          icon: "success",
          title: "Data jirigen berhasil diperbarui",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2000,
        });
      }, 250);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(state)} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{state?.mode === "edit" ? "Edit Jirigen" : "Detail Jirigen"}</DialogTitle>
          <DialogDescription>
            {jirigen?.batch?.batchNumber ?? `Batch #${jirigen?.batchId}`} • {qty} jirigen × {vol} L
          </DialogDescription>
        </DialogHeader>

        {state?.mode === "detail" && jirigen ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Row label={t.common.batch} value={jirigen.batch?.batchNumber ?? `#${jirigen.batchId}`} />
              <Row label={t.common.quantity} value={`${qty} jirigen`} />
              <Row label={t.production.volumePerJirigen} value={`${vol.toLocaleString("id-ID")} L`} />
              <Row label={t.production.totalVolume} value={`${(qty * vol).toLocaleString("id-ID")} L`} />
              <Row label={t.production.productionTime} value={formatDate(jirigen.productionDatetime)} />
              <Row label={t.production.inStock} value={`${inStock} / ${qty}`} />
            </div>
            <Row label={t.common.notes} value={jirigen.notes || "-"} />
            <div className="rounded-xl border p-3 dark:border-white/10">
              <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Barcode</div>
              {loadingBarcodes ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
                </div>
              ) : (
                <div className="grid max-h-40 grid-cols-1 gap-1 overflow-y-auto font-mono text-xs text-slate-700 sm:grid-cols-2 dark:text-slate-200">
                  {barcodes.length ? barcodes.map((code) => <div key={code}>{code}</div>) : "-"}
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
              <Button
                className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
                onClick={() => onChangeMode("edit")}
              >
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </DialogFooter>
          </div>
        ) : null}

        {state?.mode === "edit" && jirigen ? (
          <div className="space-y-3">
            {inStock > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                Sebagian jirigen ini sudah masuk stok. Jumlah, volume, dan waktu produksi dikunci karena
                menentukan barcode; hanya catatan yang bisa diubah.
              </div>
            ) : (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-200">
                Mengubah jumlah, volume, atau waktu produksi dapat mengubah nomor barcode di batch ini —
                cetak ulang label setelah menyimpan.
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t.production.jirigenQty} <span className="ml-0.5 text-red-500">*</span>
                </span>
                <Input
                  type="number"
                  min={1}
                  value={form.jirigenNumber}
                  disabled={inStock > 0}
                  onChange={(e) => setForm((p) => ({ ...p, jirigenNumber: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t.production.volumePerJirigen} <span className="ml-0.5 text-red-500">*</span>
                </span>
                <Input
                  type="number"
                  min={1}
                  value={form.volumeLiter}
                  disabled={inStock > 0}
                  onChange={(e) => setForm((p) => ({ ...p, volumeLiter: e.target.value }))}
                />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t.production.productionTime} <span className="ml-0.5 text-red-500">*</span>
              </span>
              <Input
                type="datetime-local"
                value={form.productionDatetime}
                disabled={inStock > 0}
                onChange={(e) => setForm((p) => ({ ...p, productionDatetime: e.target.value }))}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.common.notes}</span>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              />
            </label>
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            ) : null}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Batal
              </Button>
              <Button
                className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
                onClick={save}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
