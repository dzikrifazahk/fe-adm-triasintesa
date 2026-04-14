"use client";

import { Modal } from "@/components/custom/modal";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import {
  IAddOrUpdateInventoryLocation,
  IInventoryLocations,
} from "@/types/inventory-locations";
import { useContext, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import Swal from "sweetalert2";
import { useLoading } from "@/context/loadingContext";
import { inventoryLocationsService } from "@/services";

type Props = {
  isOpen: boolean;
  title: string;
  type: "create" | "edit" | "detail";
  detailData?: IInventoryLocations | null;
  onClose: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  isGetData?: () => void;
};

const statusOptions = ["active", "inactive"];

export function ModalUpsertInventoryLocations({
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

  const [locationCode, setLocationCode] = useState("");
  const [locationName, setLocationName] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [isDetailEditing, setIsDetailEditing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLocationCode(detailData?.locationCode ?? "");
    setLocationName(detailData?.locationName ?? "");
    setStatus(detailData?.status ?? "");
    setNotes(detailData?.notes ?? "");
    setIsDetailEditing(false);
  }, [detailData, isOpen]);

  const isReadOnly = type === "detail" && !isDetailEditing;
  const isEditMode = type === "edit" || (type === "detail" && isDetailEditing);

  const clearInput = () => {
    setLocationCode("");
    setLocationName("");
    setStatus("");
    setNotes("");
    setIsDetailEditing(false);
    onClose();
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (type === "detail" && !isDetailEditing) return;

    const payload: IAddOrUpdateInventoryLocation = {
      locationCode,
      locationName,
      status,
      notes,
    };

    Swal.fire({
      icon: "warning",
      text: isEditMode
        ? "Apakah anda ingin mengubah inventory location?"
        : "Apakah anda ingin menambahkan inventory location?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        setIsLoading(true);

        if (isEditMode) {
          await inventoryLocationsService.updateInventoryLocation(
            String(detailData?.id),
            payload,
          );
        } else {
          await inventoryLocationsService.createInventoryLocation(payload);
        }

        await isGetData?.();
        Swal.fire({
          icon: "success",
          title: "Berhasil menyimpan inventory location",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2000,
        });

        clearInput();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan inventory location",
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

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={`${isMobile ? "w-[95vw]" : "w-[760px]"}`}
      onSubmit={handleSubmit}
      onCancel={onCancel ?? onClose}
      showConfirmButton={type !== "detail" || isDetailEditing}
    >
      <div className="max-h-[85vh] overflow-y-auto p-5">
        <div className="flex flex-col gap-6">
          {type === "detail" && detailData && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Inventory Location Overview
                  </h3>
                  <p className="text-sm text-slate-500">
                    Informasi utama inventory location yang sedang dipilih.
                  </p>
                </div>

                {!isDetailEditing && (
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

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoCard label="Location Code" value={detailData.locationCode} />
                <InfoCard label="Location Name" value={detailData.locationName} />
                <InfoCard label="Status" value={detailData.status} />
                <InfoCard label="Notes" value={detailData.notes || "-"} />
                <InfoCard label="Created At" value={formatDate(detailData.createdAt)} />
                <InfoCard label="Updated At" value={formatDate(detailData.updatedAt)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Location Code" required>
              <Input
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
                placeholder="Masukkan kode lokasi"
                disabled={isReadOnly}
                required
              />
            </Field>

            <Field label="Location Name" required>
              <Input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Masukkan nama lokasi"
                disabled={isReadOnly}
                required
              />
            </Field>

            <Field label="Status" required className="md:col-span-2">
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
                    {item}
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
