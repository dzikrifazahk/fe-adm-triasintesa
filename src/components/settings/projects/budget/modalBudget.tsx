"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/custom/modal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import axios from "axios";

import { useCurrencyInput } from "@/utils/useCurrency";
import { budgetService } from "@/services";
import { IAddOrUpdateBudget, IBudget } from "@/types/budget";
import { DownloadIcon, UploadIcon } from "lucide-react";

function normalizeRupiah(raw: string) {
  const number_string = (raw ?? "").replace(/[^0-9]/g, "");
  const parsed = parseInt(number_string || "0", 10);
  return isNaN(parsed) ? 0 : parsed;
}

interface ItemRowData {
  id: number;
  name: string;
  unit: string;
  nominal_per_unit: string;
  qty: string;
}

interface Props {
  isOpen: boolean;
  title: string;
  detailData?: IBudget | null;
  modalType: "create" | "edit";
  onClose: () => void;
  isGetData: (tableModal: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  projectId?: string;
}

/* -------------------- Currency Input (per item) -------------------- */
const NominalPerUnitInput: React.FC<{
  value: string;
  onChange: (raw: string) => void;
  inputId?: string;
  placeholder?: string;
}> = ({ value, onChange, inputId, placeholder }) => {
  const {
    value: raw,
    setValue,
    formattedValueWithRp,
    handleChange,
  } = useCurrencyInput();

  useEffect(() => {
    setValue(value ?? "");
  }, [value, setValue]);

  const onLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e); // update internal hook
    const onlyRaw = e.target.value.replace(/[^0-9,]/g, "");
    onChange(onlyRaw);
  };

  return (
    <Input
      id={inputId}
      value={formattedValueWithRp}
      onChange={onLocalChange}
      placeholder={placeholder ?? "Masukkan nominal / unit"}
      inputMode="numeric"
    />
  );
};

/* -------------------- Main Component -------------------- */
export const BudgetModal: React.FC<Props> = ({
  isOpen,
  title,
  onClose,
  modalType,
  isGetData,
  detailData,
  isLoading,
  setIsLoading,
  projectId,
}) => {
  const [importMode, setImportMode] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const TEMPLATE_HREF = "/templates/budget-template.zip";

  const [taskId, setTaskId] = useState<string>("");
  const [namaBudget, setNamaBudget] = useState<string>("");
  const [taskType, setTaskType] = useState<string>("");

  const [hasItems, setHasItems] = useState<boolean>(false);

  const {
    value: nominalRaw,
    formattedValueWithRp: nominalRp,
    handleChange: handleNominalChange,
    setValue: setNominalRaw,
  } = useCurrencyInput();

  const nextItemId = useRef<number>(1);
  const makeItem = (): ItemRowData => ({
    id: nextItemId.current++,
    name: "",
    unit: "",
    nominal_per_unit: "",
    qty: "",
  });
  const [items, setItems] = useState<ItemRowData[]>([makeItem()]);

  const addItem = () => setItems((prev) => [...prev, makeItem()]);
  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  const updateItem = (id: number, field: keyof ItemRowData, value: string) => {
    setItems((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === "qty" ? value.replace(/[^\d]/g, "") : value,
            }
          : row
      )
    );
  };

  // Total otomatis dari items
  const totalFromItems = useMemo(() => {
    return items.reduce((acc, it) => {
      const perUnit = normalizeRupiah(it.nominal_per_unit);
      const qty = parseFloat(it.qty || "0") || 0;
      return acc + perUnit * qty;
    }, 0);
  }, [items]);

  /* ------------ Prefill saat edit / create ------------ */
  useEffect(() => {
    // reset import UI each open
    setImportMode(false);
    setImportFile(null);

    if (modalType === "edit" && detailData) {
      setTaskId(detailData.id ?? "");
      setNamaBudget(detailData.nama_budget ?? "");

      const typeId = String(detailData.type?.id ?? "");
      setTaskType(typeId);

      const apiHasItems = Boolean(detailData.has_items);
      // 👉 kalau tipe Jasa (1), paksa hasItems = false
      setHasItems(typeId === "1" ? false : apiHasItems);

      if (
        apiHasItems &&
        typeId !== "1" && // 👉 kalau jasa, abaikan budget_item
        Array.isArray(detailData.budget_item) &&
        detailData.budget_item.length > 0
      ) {
        setItems(
          detailData.budget_item.map((it) => ({
            id: nextItemId.current++,
            name: it.name ?? "",
            unit: it.unit ?? "",
            nominal_per_unit: String(it.nominal_per_unit ?? ""),
            qty: String(it.qty ?? ""),
          }))
        );
        setNominalRaw(""); // total nominal diabaikan saat pakai items
      } else {
        setItems([makeItem()]);
        setNominalRaw(String(detailData.total_nominal ?? "0"));
      }
      return;
    }

    if (modalType === "create") {
      setTaskId("");
      setNamaBudget("");
      setTaskType("");
      setHasItems(false);
      setItems([makeItem()]);
      setNominalRaw("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* -------------------- Import Handlers -------------------- */
  const handleImportSubmit = async () => {
    if (!importFile) {
      Swal.fire({
        icon: "error",
        title: "Silakan pilih file terlebih dahulu.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const fd = new FormData();
    fd.append("file", importFile);

    Swal.fire({
      icon: "warning",
      text: "Import data dari Excel sekarang?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        setIsLoading(true);
        const response = await budgetService.importBudgetExcel(fd);

        isGetData("budget");
        Swal.fire({
          icon: "success",
          title: "Berhasil mengimpor data.",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
        onClose();
      } catch (e) {
        setIsLoading(false);
        if (axios.isAxiosError(e)) {
          const rawMessage = (e.response?.data as any)?.message;
          const msgs: string[] = [];
          if (typeof rawMessage === "string") msgs.push(rawMessage);
          else if (Array.isArray(rawMessage)) msgs.push(...rawMessage);
          else if (rawMessage && typeof rawMessage === "object") {
            for (const k in rawMessage) {
              const v = rawMessage[k];
              if (Array.isArray(v)) msgs.push(`${k}: ${v.join(", ")}`);
              else if (typeof v === "string") msgs.push(`${k}: ${v}`);
            }
          }
          Swal.fire({
            icon: "error",
            title: "Gagal import",
            html: msgs.join("<br>") || "Periksa format file Anda.",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 3000,
          });
        }
      } finally {
        setIsLoading(false);
      }
    });
  };

  /* -------------------- Submit (Manual Form) -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (importMode) {
      // safeguard: should not go here because UI hides Submit in import mode
      return;
    }

    if (!namaBudget || !taskType) {
      Swal.fire({
        icon: "error",
        title: "Semua field wajib diisi (Nama & Tipe).",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const payload: IAddOrUpdateBudget = {
      project_id: projectId ?? "",
      nama_budget: namaBudget,
      type: taskType,
      total_nominal: hasItems ? null : normalizeRupiah(nominalRaw),
      items:
        hasItems && taskType !== "1" // 👉 Jasa tidak kirim items
          ? items
              .filter(
                (x) =>
                  (x.name ?? "").trim() !== "" &&
                  (x.unit ?? "").trim() !== "" &&
                  normalizeRupiah(x.nominal_per_unit) > 0 &&
                  (parseFloat(x.qty || "0") || 0) > 0
              )
              .map((x) => ({
                name: x.name,
                unit: x.unit,
                nominal_per_unit: normalizeRupiah(x.nominal_per_unit),
                qty: Number(x.qty || "0"),
              }))
          : [],
    };

    if (!hasItems && !(payload.total_nominal && payload.total_nominal > 0)) {
      Swal.fire({
        icon: "error",
        title: "Total nominal wajib diisi saat tidak ada items.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const confirmText =
      modalType === "create"
        ? "Apakah anda ingin menambahkan Anggaran?"
        : "Apakah anda ingin mengubah Anggaran?";
    const successText =
      modalType === "create"
        ? "Berhasil Menambahkan Anggaran"
        : "Berhasil Mengubah Anggaran";

    Swal.fire({
      icon: "warning",
      text: confirmText,
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        setIsLoading(true);
        if (modalType === "create") {
          await budgetService.createBudget(payload);
        } else {
          await budgetService.updateBudget(String(taskId), payload);
        }

        onClose();
        isGetData("budget");

        Swal.fire({
          icon: "success",
          title: successText,
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const rawMessage = (e.response?.data as any)?.message;
          const msgs: string[] = [];
          if (typeof rawMessage === "string") msgs.push(rawMessage);
          else if (Array.isArray(rawMessage)) msgs.push(...rawMessage);
          else if (rawMessage && typeof rawMessage === "object") {
            for (const k in rawMessage) {
              const v = rawMessage[k];
              if (Array.isArray(v)) msgs.push(`${k}: ${v.join(", ")}`);
              else if (typeof v === "string") msgs.push(`${k}: ${v}`);
            }
          }
          Swal.fire({
            icon: "error",
            title: "Terjadi Kesalahan",
            html: msgs.join("<br>") || "Gagal memproses permintaan.",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 3000,
          });
        }
      } finally {
        setIsLoading(false);
      }
    });
  };

  /* -------------------- UI -------------------- */
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onSubmit={importMode ? undefined : handleSubmit}
      onCancel={onClose}
      width="w-[95vw] md:w-3/4 lg:w-[70vw]"
      showConfirmButton={!importMode}
    >
      <div className="flex flex-col gap-5 p-5">
        {/* ===== Toggle Import Mode ===== */}
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <input
              id="import_mode"
              type="checkbox"
              className="h-4 w-4"
              checked={importMode}
              onChange={(e) => setImportMode(e.target.checked)}
            />
            <Label htmlFor="import_mode" className="text-sm">
              Import dari Excel
            </Label>
          </div>
          {importMode ? (
            <div className="text-xs text-muted-foreground">
              Mode import aktif.
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Mode form manual aktif.
            </div>
          )}
        </div>

        {/* ===== Import UI (ONLY) ===== */}
        {importMode && (
          <div className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <div className="text-base font-semibold">
                  Import Data Budget
                </div>
                <div className="text-xs text-muted-foreground">
                  Unduh template, isi data, lalu unggah kembali.
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Download Template */}
                <div className="space-y-1.5">
                  <Label>Template Excel</Label>
                  <a
                    href={TEMPLATE_HREF}
                    download
                    className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    Unduh Template
                    <DownloadIcon className="w-4 h-4 ml-2" />
                  </a>
                  <p className="text-[11px] text-muted-foreground">
                    Simpan file ini, isi sesuai kolom, lalu unggah pada bagian
                    kanan.
                  </p>
                </div>

                {/* Upload File */}
                <div className="space-y-1.5">
                  <Label>Masukkan File</Label>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                  />
                  {importFile && (
                    <p className="text-[11px] text-muted-foreground">
                      File dipilih:{" "}
                      <span className="font-medium">{importFile.name}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  className="cursor-pointer inline-flex items-center"
                  onClick={handleImportSubmit}
                  disabled={isLoading || !importFile}
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Submit Import
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    setImportFile(null);
                    setImportMode(false);
                  }}
                  disabled={isLoading}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Manual Form UI (hidden in import mode) ===== */}
        {!importMode && (
          <>
            {/* Nama Budget */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">Nama Budget</Label>
              <Input
                type="text"
                value={namaBudget}
                onChange={(e) => setNamaBudget(e.target.value)}
                placeholder="Masukkan nama budget"
                required
              />
            </div>

            {/* Tipe */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">Tipe</Label>
              <Select
                key={taskType}
                value={taskType}
                onValueChange={(val) => {
                  setTaskType(val);
                  // 👉 kalau Jasa (1), paksa tidak punya items
                  if (val === "1") {
                    setHasItems(false);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tipe</SelectLabel>
                    <SelectItem value="1">Jasa</SelectItem>
                    <SelectItem value="2">Material</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Jika TIDAK punya items → tampilkan Total Nominal (wajib) */}
            {!hasItems && (
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">
                  Total Nominal <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={nominalRp}
                  onChange={handleNominalChange}
                  placeholder="Masukkan total nominal"
                  inputMode="numeric"
                />
              </div>
            )}
            {hasItems && taskType !== "1" && (
              <div className="text-xs text-muted-foreground">
                Total nominal dihitung otomatis dari items
              </div>
            )}

            {/* Toggle punyai items → hanya kalau tipe BUKAN Jasa */}
            {taskType !== "1" && (
              <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <input
                    id="has_items"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={hasItems}
                    onChange={(e) => setHasItems(e.target.checked)}
                  />
                  <Label htmlFor="has_items" className="text-sm">
                    Punya item (rinci per unit)
                  </Label>
                </div>
              </div>
            )}

            {/* Jika punya items → builder items + ringkasan total */}
            {hasItems && taskType !== "1" && (
              <div className="rounded-2xl border">
                <div className="flex items-center justify-between border-b p-4">
                  <div>
                    <div className="text-base font-semibold">Items</div>
                    <div className="text-xs text-muted-foreground">
                      Isi nama, unit, nominal per unit, dan qty.
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addItem}
                    className="cursor-pointer"
                  >
                    + Tambah Item
                  </Button>
                </div>

                <div className="p-4 space-y-4">
                  {items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="rounded-xl border p-4 space-y-4 bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          Item #{idx + 1}
                        </div>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeItem(it.id)}
                            className="h-8 cursor-pointer"
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      {/* Grid atas: 3 kolom di >=md, 1 kolom di mobile */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`name_${it.id}`}>Nama</Label>
                          <Input
                            id={`name_${it.id}`}
                            value={it.name}
                            onChange={(e) =>
                              updateItem(it.id, "name", e.target.value)
                            }
                            placeholder="Contoh: Aspal"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`unit_${it.id}`}>Unit</Label>
                          <Input
                            id={`unit_${it.id}`}
                            value={it.unit}
                            onChange={(e) =>
                              updateItem(it.id, "unit", e.target.value)
                            }
                            placeholder="Contoh: kg / m3"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`npu_${it.id}`}>
                            Nominal per Unit
                          </Label>
                          <NominalPerUnitInput
                            inputId={`npu_${it.id}`}
                            value={it.nominal_per_unit}
                            onChange={(raw) =>
                              updateItem(it.id, "nominal_per_unit", raw)
                            }
                            placeholder="Masukkan harga / unit"
                          />
                        </div>
                      </div>

                      {/* Grid bawah: 2 kolom di >=md, 1 kolom di mobile */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`qty_${it.id}`}>Qty</Label>
                          <Input
                            id={`qty_${it.id}`}
                            value={it.qty}
                            onChange={(e) =>
                              updateItem(it.id, "qty", e.target.value)
                            }
                            inputMode="numeric"
                            placeholder="Contoh: 10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Total Item (otomatis)</Label>
                          <Input
                            value={(() => {
                              const perUnit = normalizeRupiah(
                                it.nominal_per_unit
                              );
                              const qty = parseFloat(it.qty || "0") || 0;
                              const total = perUnit * qty;
                              return new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                              }).format(total);
                            })()}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t p-4">
                  <div className="text-sm text-muted-foreground">
                    Total seluruh items (otomatis)
                  </div>
                  <div className="text-base font-semibold">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(totalFromItems)}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
