"use client";

import { Modal } from "@/components/custom/modal";
import { useLoading } from "@/context/loadingContext";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { useContext, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Swal from "sweetalert2";
import axios from "axios";
import { overtimeService } from "@/services";
import { useCurrencyInput } from "@/utils/useCurrency";

interface Props {
  isOpen: boolean;
  title: string;
  id: string;
  onClose: () => void;
  isGetData: () => void;
  action: string;
}

type TStatus = "approved" | "rejected" | "cancelled";

interface IApprovalOvertimePayload {
  status: TStatus;
  reason_approval?: string | null;
  is_overtime_meal: boolean;
  makan?: number | null;
}

export default function ModalApprovalOvertime({
  isOpen,
  title,
  onClose,
  id,
  isGetData,
  action,
}: Props) {
  const { isMobile } = useContext(MobileContext);
  const { setIsLoading } = useLoading();

  const [status, setStatus] = useState<TStatus | "">("");
  const [reasonApproval, setReasonApproval] = useState<string>("");
  const [isOvertimeMeal, setIsOvertimeMeal] = useState<"true" | "false">(
    "false"
  );

  let {
    value: mealAmount,
    formattedValueNumeric: mealAmountFormatted,
    handleChange: handleMealAmountChange,
    formattedValueWithRp: mealAmountRp,
    setValue: setMealAmount,
  } = useCurrencyInput();

  const resetForm = () => {
    setStatus("");
    setReasonApproval("");
    setIsOvertimeMeal("false");
    setMealAmount("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi minimal
    if (!status) {
      Swal.fire({
        icon: "warning",
        title: "Status wajib dipilih",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    if (status === "rejected" && !reasonApproval.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Alasan wajib diisi untuk status Rejected",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    const isMeal = isOvertimeMeal === "true";
    if (isMeal) {
      const n = Number(mealAmount);
      if (!mealAmount || isNaN(n) || n <= 0) {
        Swal.fire({
          icon: "warning",
          title: "Nominal makan harus lebih dari 0",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2500,
        });
        return;
      }
    }

    const payload: IApprovalOvertimePayload = {
      status: status as TStatus,
      reason_approval: reasonApproval?.trim() || null,
      is_overtime_meal: isMeal,
      makan: isMeal ? Number(mealAmount) : null,
    };

    const confirmText =
      status === "approved"
        ? "Menyetujui"
        : status === "rejected"
        ? "Menolak"
        : "Membatalkan";

    const result = await Swal.fire({
      icon: "warning",
      text: `Apakah Anda yakin ingin ${confirmText} pengajuan lembur ini?`,
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    });

    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);
      const res = await overtimeService.overtimeApproval(id, payload as any);

      setIsLoading(false);
      Swal.fire({
        icon: "success",
        title: res?.message ?? "Berhasil menyimpan approval",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      resetForm();
      onClose();
      isGetData();
    } catch (e) {
      setIsLoading(false);
      if (axios.isAxiosError(e)) {
        const rawMessage = e.response?.data?.message;
        let errorMessages: string[] = [];
        if (typeof rawMessage === "string") errorMessages.push(rawMessage);
        else if (Array.isArray(rawMessage)) errorMessages = rawMessage;
        else if (typeof rawMessage === "object" && rawMessage !== null) {
          for (const field in rawMessage) {
            const fieldErrors = (rawMessage as any)[field];
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(`${field}: ${fieldErrors.join(", ")}`);
            } else if (typeof fieldErrors === "string") {
              errorMessages.push(`${field}: ${fieldErrors}`);
            }
          }
        } else errorMessages.push("Terjadi kesalahan yang tidak diketahui.");

        Swal.fire({
          icon: "error",
          title: "Terjadi Kesalahan",
          html: errorMessages.join("<br>"),
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        });
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          resetForm();
          onClose();
        }}
        title={title}
        onSubmit={handleSubmit}
        width={isMobile ? "w-[95vw]" : "w-[40vw]"}
        onCancel={() => {
          resetForm();
          onClose();
        }}
      >
        <div className="w-full p-2 sm:p-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-sans-bold">Status</Label>
              <RadioGroup
                value={status}
                onValueChange={(v) => setStatus(v as TStatus)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <div className="flex items-center space-x-2 rounded-lg border p-3">
                  <RadioGroupItem value="approved" id="status-approved" />
                  <Label htmlFor="status-approved">Approved</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-3">
                  <RadioGroupItem value="rejected" id="status-rejected" />
                  <Label htmlFor="status-rejected">Rejected</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-3">
                  <RadioGroupItem value="cancelled" id="status-cancelled" />
                  <Label htmlFor="status-cancelled">Cancelled</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Reason Approval */}
            <div className="space-y-1">
              <Label
                htmlFor="reason_approval"
                className="text-sm font-sans-bold"
              >
                Alasan Approval{" "}
                {status === "rejected" && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Textarea
                id="reason_approval"
                value={reasonApproval}
                onChange={(e) => setReasonApproval(e.target.value)}
                placeholder="Tuliskan alasan..."
                className="min-h-[90px]"
              />
            </div>

            {/* Overtime Meal */}
            <div className="space-y-2">
              <Label className="text-sm font-sans-bold">Overtime Meal</Label>
              <RadioGroup
                value={isOvertimeMeal}
                onValueChange={(v) => setIsOvertimeMeal(v as "true" | "false")}
                className="grid grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-2 rounded-lg border p-3">
                  <RadioGroupItem value="true" id="meal-yes" />
                  <Label htmlFor="meal-yes">Ya</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-3">
                  <RadioGroupItem value="false" id="meal-no" />
                  <Label htmlFor="meal-no">Tidak</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Makan amount */}
            {isOvertimeMeal === "true" && (
              <div className="space-y-1">
                <Label htmlFor="meal-amount" className="text-sm font-sans-bold">
                  Nominal Makan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="meal-amount"
                  type="text"
                  placeholder="0"
                  value={mealAmountFormatted}
                  onChange={handleMealAmountChange}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Masukkan angka (contoh: 25000)
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
