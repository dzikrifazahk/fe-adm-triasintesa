"use client";

import { Modal } from "@/components/custom/modal";
import { useLoading } from "@/context/loadingContext";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { useContext, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Swal from "sweetalert2";
import axios from "axios";
import { cashAdvanceService } from "@/services";
import { useCurrencyInput } from "@/utils/useCurrency";
import { IPaymentCashAdvance } from "@/types/cash-advance";
import { format } from "date-fns";

interface Props {
  isOpen: boolean;
  title: string;
  id: string;
  onClose: () => void;
  isGetData: () => void;
}

type TStatus = "approved" | "rejected" | "cancelled";

export default function ModalPaymentCashAdvance({
  isOpen,
  title,
  onClose,
  id,
  isGetData,
}: Props) {
  const { isMobile } = useContext(MobileContext);
  const { setIsLoading } = useLoading();

  let {
    value: amount,
    formattedValueNumeric: amountFormatted,
    handleChange: handleAmountChange,
    formattedValueWithRp: mealAmountRp,
    setValue: setAmount,
  } = useCurrencyInput();

  // payment method & date
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());

  // 👉 NEW: payment file
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  const resetForm = () => {
    setAmount("");
    setPaymentMethod("");
    setPaymentDate(new Date());
    setPaymentFile(null); // 👉 reset file
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!amount.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nominal wajib diisi",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    if (!paymentMethod.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Payment method wajib diisi",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    if (!paymentDate) {
      Swal.fire({
        icon: "warning",
        title: "Payment date wajib dipilih",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    if (!paymentFile) {
      Swal.fire({
        icon: "warning",
        title: "Payment file wajib diupload",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    // 👉 BODY: gunakan FormData + payment_file
    const formData = new FormData();
    formData.append("nominal", String(Number(amount)));
    formData.append("payment_method", paymentMethod);
    formData.append("payment_date", format(paymentDate, "yyyy-MM-dd"));
    formData.append("payment_file", paymentFile); // <--- ini yang diminta

    const result = await Swal.fire({
      icon: "warning",
      text: `Apakah Anda yakin ingin melakukan pembayaran ?`,
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

      const response = await cashAdvanceService.paymentCashAdvance(
        id,
        formData
      );

      setIsLoading(false);
      Swal.fire({
        icon: "success",
        title: response?.message ?? "Berhasil menyimpan data",
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
        } else errorMessages.push("Terjadi kesalahan.");

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
          {/* Nominal */}
          <div className="space-y-1">
            <Label htmlFor="meal-amount" className="text-sm font-sans-bold">
              Nominal <span className="text-red-500">*</span>
            </Label>
            <Input
              id="meal-amount"
              type="text"
              placeholder="0"
              value={amountFormatted}
              onChange={handleAmountChange}
              className="h-10"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-1">
            <Label htmlFor="payment-method" className="text-sm font-sans-bold">
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <Input
              id="payment-method"
              type="text"
              placeholder="e.g. Cash, Transfer BCA, QRIS"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Contoh: Transfer BCA / Cash / QRIS
            </p>
          </div>

          {/* Payment Date */}
          <div className="space-y-1">
            <Label className="text-sm font-sans-bold">
              Payment Date <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-10"
                  type="button"
                >
                  {paymentDate
                    ? format(paymentDate, "yyyy-MM-dd")
                    : "Pilih tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 👉 Payment File */}
          <div className="space-y-1">
            <Label htmlFor="payment-file" className="text-sm font-sans-bold">
              Payment File <span className="text-red-500">*</span>
            </Label>
            <Input
              id="payment-file"
              type="file"
              // optional: batasi tipe file
              // accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setPaymentFile(e.target.files?.[0] ? e.target.files[0] : null)
              }
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Upload bukti pembayaran (PDF / gambar).
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
