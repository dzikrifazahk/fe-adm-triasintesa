"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AlertTriangle, Factory, Loader2, MoveRight, PackageSearch, SearchX } from "lucide-react";
import { getDictionary } from "../../../get-dictionary";
import { inventoryService } from "@/services";
import { IBarcodeInfo } from "@/types/inventory";
import { InventoryBarcodeScanner } from "@/components/inventory/inventoryBarcodeScanner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>["inventory_page_dic"];

function unwrap<T>(value: unknown): T {
  if (typeof value === "object" && value !== null && "data" in value) {
    return (value as { data: T }).data;
  }
  return value as T;
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{value || "-"}</div>
    </div>
  );
}

/** Cek detail produk dari barcode (webcam / input manual). Read-only. */
export function InventoryBarcodeLookupModal({
  isOpen,
  onOpenChange,
  dictionary,
  formatDate,
  getStatusClassName,
  movementLabel,
  initialBarcode,
}: {
  initialBarcode?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dictionary: Dictionary;
  formatDate: (value?: string | null) => string;
  getStatusClassName: (status?: string) => string;
  movementLabel: (value?: string | null) => string;
}) {
  const [barcode, setBarcode] = useState("");
  const [info, setInfo] = useState<IBarcodeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setBarcode("");
      setInfo(null);
      setRestartKey((k) => k + 1);
    } else if (initialBarcode) {
      setBarcode(initialBarcode);
    }
  }, [isOpen, initialBarcode]);

  useEffect(() => {
    const code = barcode.trim();
    if (code.length < 4) {
      setInfo(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await inventoryService.getBarcodeInfo(code);
        if (!cancelled) setInfo(unwrap<IBarcodeInfo>(res));
      } catch {
        if (!cancelled) setInfo(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [barcode]);

  const inv = info?.inventory;
  const prod = info?.production;
  const warnings = (info?.warnings ?? []).filter((w) => !/sudah tercatat di inventory/i.test(w));
  const notFound = info && !inv && !prod;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageSearch className="h-5 w-5 text-iprimary-blue" />
            Cek Barcode
          </DialogTitle>
          <DialogDescription>
            Scan barcode dengan webcam atau ketik manual untuk melihat detail produk. Tidak mengubah stok.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <InventoryBarcodeScanner
            dictionary={dictionary}
            value={barcode}
            autoRestartKey={restartKey}
            onChange={setBarcode}
          />

          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 rounded-2xl border border-dashed p-4 text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Mencari data barcode...
              </div>
            ) : !info ? (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
                Hasil scan akan tampil di sini.
              </div>
            ) : notFound ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                <SearchX className="h-8 w-8" />
                Barcode <b className="font-mono">{info.barcode}</b> tidak ditemukan di stok maupun data produksi.
              </div>
            ) : (
              <>
                {inv ? (
                  <div className="space-y-3 rounded-2xl border p-4 dark:border-white/10">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{inv.itemName}</div>
                        <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {inv.itemCode} • {info.barcode}
                        </div>
                      </div>
                      <Badge className={getStatusClassName(inv.status)}>{inv.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Info label="Lokasi" value={inv.locationName ? `${inv.locationName} (${inv.locationCode})` : "-"} />
                      <Info label="Satuan" value={inv.uom} />
                      <Info label="Tanggal masuk" value={formatDate(inv.entryDate)} />
                      <Info label="Expiry" value={inv.expiryDate ? formatDate(inv.expiryDate) : "-"} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    Barcode ini belum masuk stok. Masukkan lewat Input Produksi → Scan Produksi.
                  </div>
                )}

                {prod ? (
                  <div className="space-y-2 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-400/30 dark:bg-blue-500/10">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <Factory className="h-4 w-4 text-iprimary-blue dark:text-blue-300" /> Data produksi
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <Info label="Batch" value={prod.batchNumber} />
                      <Info label="Jirigen ke" value={`#${prod.sequence}`} />
                      <Info label="Volume" value={`${prod.volumeLiter} L`} />
                      <Info label="Diproduksi" value={formatDate(prod.productionDatetime)} />
                      <Info label="QC" value={<span className="capitalize">{info.qc?.finalStatus ?? "-"}</span>} />
                      <Info
                        label="COA"
                        value={info.coa ? `${info.coa.coaNumber} (${info.coa.conclusion})` : "-"}
                      />
                    </div>
                  </div>
                ) : null}

                {warnings.length ? (
                  <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200">
                    {warnings.map((w) => (
                      <li key={w} className="flex items-start gap-1.5">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {w}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {inv?.movements?.length ? (
                  <div className="rounded-2xl border p-4 dark:border-white/10">
                    <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Riwayat pergerakan</div>
                    <div className="space-y-2">
                      {inv.movements.map((m, i) => (
                        <div key={i} className="rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-white/5">
                          <div className="flex justify-between gap-2">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {movementLabel(m.movementType)}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">{formatDate(m.movementDatetime)}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1 text-slate-600 dark:text-slate-300">
                            {m.fromStatus} <MoveRight className="h-3 w-3" /> {m.toStatus}
                            {m.toLocation ? ` • ${m.toLocation}` : ""}
                          </div>
                          {m.notes ? <div className="mt-1 text-slate-500 dark:text-slate-400">{m.notes}</div> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
