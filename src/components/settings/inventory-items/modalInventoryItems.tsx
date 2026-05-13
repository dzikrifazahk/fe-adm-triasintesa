"use client";

import { Modal } from "@/components/custom/modal";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { IAddOrUpdateInventoryItem, IInventoryItem } from "@/types/inventory-item";
import { useContext, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Swal from "sweetalert2";
import { useLoading } from "@/context/loadingContext";
import { inventoryService } from "@/services";

type Props = {
  isOpen: boolean;
  title: string;
  type: "create" | "edit" | "detail";
  detailData?: IInventoryItem | null;
  onClose: () => void;
  onCancel?: () => void;
  isGetData?: () => void;
};

export function ModalUpsertInventoryItems({
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

  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [uom, setUom] = useState("");
  const [category, setCategory] = useState("");
  const [isDetailEditing, setIsDetailEditing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setItemCode(detailData?.itemCode ?? "");
    setItemName(detailData?.itemName ?? "");
    setUom(detailData?.uom ?? "");
    setCategory(detailData?.category ?? "");
    setIsDetailEditing(false);
  }, [detailData, isOpen]);

  const isReadOnly = type === "detail" && !isDetailEditing;
  const isEditMode = type === "edit" || (type === "detail" && isDetailEditing);

  const clearInput = () => {
    setItemCode("");
    setItemName("");
    setUom("");
    setCategory("");
    setIsDetailEditing(false);
    onClose();
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (type === "detail" && !isDetailEditing) return;

    const payload: IAddOrUpdateInventoryItem = {
      itemCode,
      itemName,
      uom: uom || undefined,
      category: category || undefined,
    };

    Swal.fire({
      icon: "warning",
      text: isEditMode
        ? "Apakah anda ingin mengubah item?"
        : "Apakah anda ingin menambahkan item?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        setIsLoading(true);

        if (isEditMode) {
          await inventoryService.updateInventoryItem(String(detailData?.id), payload);
        } else {
          await inventoryService.createInventoryItem(payload);
        }

        await isGetData?.();
        Swal.fire({
          icon: "success",
          title: "Berhasil menyimpan item",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2000,
        });

        clearInput();
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan item",
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
                  <h3 className="text-base font-semibold text-slate-900">Item Overview</h3>
                  <p className="text-sm text-slate-500">Informasi utama item yang sedang dipilih.</p>
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
                <InfoCard label="Item Code" value={detailData.itemCode} />
                <InfoCard label="Item Name" value={detailData.itemName} />
                <InfoCard label="UOM" value={detailData.uom || "-"} />
                <InfoCard label="Category" value={detailData.category || "-"} />
                <InfoCard label="Status" value={detailData.isActive ? "active" : "inactive"} />
                <InfoCard label="Created At" value={formatDate(detailData.createdAt)} />
                <InfoCard label="Updated At" value={formatDate(detailData.updatedAt)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Item Code" required>
              <Input
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                placeholder="Masukkan kode item"
                disabled={isReadOnly}
                required
              />
            </Field>

            <Field label="Item Name" required>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Masukkan nama item"
                disabled={isReadOnly}
                required
              />
            </Field>

            <Field label="UOM">
              <Input
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                placeholder="PCS"
                disabled={isReadOnly}
              />
            </Field>

            <Field label="Category">
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="CONTAINER"
                disabled={isReadOnly}
              />
            </Field>
          </div>

          {type === "detail" && !isDetailEditing ? (
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Tutup</Button>
            </div>
          ) : null}
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
      <div className="mt-1 text-sm font-semibold text-slate-800">{value || "-"}</div>
    </div>
  );
}
