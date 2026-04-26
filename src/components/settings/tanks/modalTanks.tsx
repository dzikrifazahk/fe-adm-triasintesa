"use client";

import { Modal } from "@/components/custom/modal";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { ITank, TankType } from "@/types/tanks";
import { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import Swal from "sweetalert2";
import { useLoading } from "@/context/loadingContext";
import { codeGeneratorService } from "@/services";

type Props = {
  isOpen: boolean;
  title: string;
  type: "create" | "edit" | "detail";
  detailData?: ITank | null;
  onClose: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  isGetData?: () => void;
};

const statusOptions = ["available", "in_use", "maintenance"];
const tankTypeOptions = [
  { value: "raw_material", label: "Bahan Baku" },
  { value: "softener", label: "Softener" },
  { value: "output_water", label: "Air Hasil" },
] as const;

const getTankTypeLabel = (value?: string | null) =>
  tankTypeOptions.find((item) => item.value === value)?.label || "-";

export function ModalUpsertTanks({
  isOpen,
  title,
  type,
  detailData,
  onClose,
  onCancel,
  isGetData,
}: Props) {
  const { isMobile } = useContext(MobileContext);
  const { setIsLoading } = useLoading();

  const [tankCode, setTankCode] = useState("");
  const [tankName, setTankName] = useState("");
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [location, setLocation] = useState("");
  const [tankType, setTankType] = useState<TankType | "">("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [isGeneratingTankCode, setIsGeneratingTankCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTankCode(detailData?.tankCode ?? "");
      setTankName(detailData?.tankName ?? "");
      setTotalCapacity(Number(detailData?.totalCapacity) || 0);
      setLocation(detailData?.location ?? "");
      setTankType((detailData?.tankType ?? "") as TankType | "");
      setStatus(detailData?.status ?? "");
      setNotes(detailData?.notes ?? "");
      setIsDetailEditing(false);
    }
  }, [isOpen, detailData?.tankCode, detailData?.tankName, detailData?.totalCapacity, detailData?.location, detailData?.tankType, detailData?.status, detailData?.notes]);

  const currentVolumeNumber = useMemo(() => {
    const raw = detailData?.currentVolume ?? 0;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [detailData]);

  const totalCapacityNumber = useMemo(() => {
    const raw = detailData?.totalCapacity ?? totalCapacity ?? 0;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [detailData, totalCapacity]);

  const percentage = useMemo(() => {
    if (!totalCapacityNumber || totalCapacityNumber <= 0) return 0;
    const percent = (currentVolumeNumber / totalCapacityNumber) * 100;
    return Math.max(0, Math.min(100, Math.round(percent)));
  }, [currentVolumeNumber, totalCapacityNumber]);

  const isReadOnly = type === "detail" && !isDetailEditing;
  const showTankPreview = type === "detail" || type === "edit";
  const canEditCode =
    type === "create" ||
    type === "edit" ||
    (type === "detail" && isDetailEditing);

  const clearInput = () => {
    setTankCode("");
    setTankName("");
    setTotalCapacity(0);
    setLocation("");
    setTankType("");
    setStatus("");
    setNotes("");
    setIsDetailEditing(false);
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (type === "detail" && !isDetailEditing) {
      return;
    }

    if (!tankType) {
      Swal.fire({
        icon: "warning",
        title: "Tipe tank wajib dipilih",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    const isEditMode =
      type === "edit" || (type === "detail" && isDetailEditing);

    Swal.fire({
      icon: "warning",
      text: isEditMode
        ? "Apakah anda ingin mengubah Tank?"
        : "Apakah anda ingin menambahkan Tank?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        setIsLoading(true);

        isGetData?.();
        Swal.fire({
          icon: "success",
          title: "Berhasil menyimpan data tank",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2000,
        });

        clearInput();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan data tank",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2500,
        });
      } finally {
        setIsLoading(false);
      }
    });
  };

  const formatNumber = (value?: string | number | null) => {
    const num = Number(value ?? 0);
    if (Number.isNaN(num)) return "0";
    return num.toLocaleString("en-US");
  };

  const getStatusBadgeClass = (value: string) => {
    switch (value) {
      case "available":
        return "bg-green-100 text-green-700 border-green-200";
      case "in_use":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleGenerateTankCode = async () => {
    try {
      setIsGeneratingTankCode(true);
      const response = await codeGeneratorService.preview("tank");
      setTankCode(response.value ?? "");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal generate kode tank",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2500,
      });
    } finally {
      setIsGeneratingTankCode(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={`${isMobile ? "w-[95vw]" : "w-[920px]"}`}
      onSubmit={handleSubmit}
      onCancel={onCancel ?? onClose}
      showConfirmButton={type !== "detail" || isDetailEditing}
    >
      <div className="max-h-[85vh] overflow-y-auto p-5">
        <div className="flex flex-col gap-6">
          {showTankPreview && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Tank Overview
                  </h3>
                  <p className="text-sm text-slate-500">
                    Visualisasi isi tank berdasarkan current volume dan total
                    capacity
                  </p>
                </div>

                {type === "detail" && !isDetailEditing && (
                  <button
                    type="button"
                    onClick={() => setIsDetailEditing(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-slate-900">
                  {tankName || detailData?.tankName || "-"}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {tankCode || detailData?.tankCode || "-"}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                    status || detailData?.status || "",
                  )}`}
                >
                  {(status || detailData?.status || "-").replaceAll("_", " ")}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {getTankTypeLabel(tankType || detailData?.tankType)}
                </span>
              </div>

              <div className="relative h-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                  style={{
                    height: `${percentage}%`,
                    background:
                      "linear-gradient(to top, #1565c0 0%, #039be5 100%)",
                  }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                  <div className="text-5xl font-bold text-slate-800">
                    {percentage}%
                  </div>

                  <div className="mt-3 rounded-full bg-white/75 px-4 py-2 text-sm font-medium text-slate-600 backdrop-blur-sm">
                    {formatNumber(currentVolumeNumber)} /{" "}
                    {formatNumber(totalCapacityNumber)} Liter
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                <InfoCard
                  label="Current Volume"
                  value={`${formatNumber(currentVolumeNumber)} Liter`}
                />
                <InfoCard
                  label="Total Capacity"
                  value={`${formatNumber(totalCapacityNumber)} Liter`}
                />
                <InfoCard
                  label="Location"
                  value={location || detailData?.location || "-"}
                />
                <InfoCard
                  label="Tipe"
                  value={getTankTypeLabel(tankType || detailData?.tankType)}
                />
                <InfoCard
                  label="Status"
                  value={(status || detailData?.status || "-").replaceAll(
                    "_",
                    " ",
                  )}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Tank Code" required>
              <div className="flex gap-2">
                <Input
                  value={tankCode}
                  onChange={(e) => setTankCode(e.target.value)}
                  placeholder="Masukkan kode tank"
                  disabled={!canEditCode}
                  required
                />
                {type === "create" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateTankCode}
                    disabled={isGeneratingTankCode}
                  >
                    {isGeneratingTankCode ? "Generating..." : "Generate"}
                  </Button>
                ) : null}
              </div>
            </Field>

            <Field label="Tank Name" required>
              <Input
                value={tankName}
                onChange={(e) => setTankName(e.target.value)}
                placeholder="Masukkan nama tank"
                disabled={isReadOnly}
                required
              />
            </Field>

            <Field label="Total Capacity" required>
              <Input
                type="number"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(Number(e.target.value))}
                placeholder="Masukkan total kapasitas"
                min={0}
                disabled={isReadOnly}
                required
              />
            </Field>

            <Field label="Location" required>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Masukkan lokasi"
                disabled={isReadOnly}
                required
              />
            </Field>

            <Field label="Tipe" required>
              <select
                value={tankType}
                onChange={(e) =>
                  setTankType((e.target.value || "") as TankType | "")
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isReadOnly}
                required
              >
                <option value="">Pilih tipe tank</option>
                {tankTypeOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status" required>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isReadOnly}
                required
              >
                <option value="">Pilih status</option>
                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {item.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Notes" className="md:col-span-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Masukkan catatan"
                rows={4}
                disabled={isReadOnly}
              />
            </Field>
          </div>

          {type === "detail" && !isDetailEditing && detailData && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-800">
                Detail Tambahan
              </h4>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoRow
                  label="Last Refill Date"
                  value={detailData.lastRefillDate}
                />
                <InfoRow label="Last Updated" value={detailData.lastUpdated} />
                <InfoRow label="Created At" value={detailData.createdAt} />
                <InfoRow label="Updated At" value={detailData.updatedAt} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-800">
        {value || "-"}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  const formatted =
    value && !Number.isNaN(Date.parse(value))
      ? new Date(value).toLocaleString()
      : value || "-";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-800">
        {formatted}
      </div>
    </div>
  );
}
