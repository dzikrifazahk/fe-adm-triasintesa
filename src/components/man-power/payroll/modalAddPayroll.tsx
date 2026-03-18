"use client";

import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import { Modal } from "@/components/custom/modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { IUser } from "@/types/user";
import { payrollService, userService } from "@/services";
import { Circle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { DateRangeCustom } from "@/components/custom/dateRangeCustom";
import { useLoading } from "@/context/loadingContext";
import Swal from "sweetalert2";
import { IAddPayroll } from "@/types/payroll";
import axios, { AxiosError } from "axios";
import { useCurrencyInput } from "@/utils/useCurrency";

interface ModalPayrollProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  isGetData: () => void;
}

export default function ModalAddPayroll({
  isOpen,
  title,
  onClose,
  isGetData,
}: ModalPayrollProps) {
  const { setIsLoading } = useLoading();

  const [users, setUsers] = useState<ComboboxItem<IUser>[]>([]);
  const [pics, setPics] = useState<ComboboxItem<IUser>[]>([]);
  const [selectedUser, setSelectedUser] = useState<ComboboxItem<IUser> | null>(
    null
  );
  const [selectedPIC, setSelectedPIC] = useState<ComboboxItem<IUser> | null>(
    null
  );

  const [isAllLoan, setIsAllLoan] = useState(false);

  // Loan
  let {
    value: loan,
    formattedValueNumeric: loanFormatted,
    handleChange: handleLoanChange,
    setValue: setLoan,
  } = useCurrencyInput();

  // NEW: Bonus
  let {
    value: bonus,
    formattedValueNumeric: bonusFormatted,
    handleChange: handleBonusChange,
    setValue: setBonus,
  } = useCurrencyInput();

  // NEW: Transport
  let {
    value: transport,
    formattedValueNumeric: transportFormatted,
    handleChange: handleTransportChange,
    setValue: setTransport,
  } = useCurrencyInput();

  const [notes, setNotes] = useState("");

  const [range, setRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Combobox popover states
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isPicOpen, setIsPicOpen] = useState(false);

  // Auto-normalize loan saat pakai semua pinjaman
  useEffect(() => {
    if (isAllLoan) setLoan("0");
  }, [isAllLoan, setLoan]);

  // Reset semua input
  const clearForm = () => {
    setSelectedUser(null);
    setSelectedPIC(null);
    setIsAllLoan(false);
    setLoan("0");
    setBonus("0"); // NEW
    setTransport("0"); // NEW
    setNotes("");
    setRange({ from: undefined, to: undefined });
    setIsUserOpen(false);
    setIsPicOpen(false);
  };

  // Fetch users & pics
  const getUsers = async () => {
    const { data } = await userService.getAllUsers();
    const formatted = data.map((u: IUser) => ({
      value: u.id,
      label: u.name,
      icon: Circle,
      raw: u,
    }));
    setUsers(formatted);
    setPics(
      formatted.filter(
        (u: any) => u.raw.role === "Admin" || u.raw.role === "Owner"
      )
    );
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Format tanggal untuk payload
  const startDateStr = useMemo(
    () => (range?.from ? format(range.from, "yyyy-MM-dd") : ""),
    [range?.from]
  );
  const endDateStr = useMemo(
    () => (range?.to ? format(range.to, "yyyy-MM-dd") : ""),
    [range?.to]
  );

  const isSubmitDisabled = useMemo(() => {
    return !selectedUser || !selectedPIC || !range?.from || !range?.to;
  }, [selectedUser, selectedPIC, range]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    const payload: IAddPayroll = {
      user_id: Number(selectedUser?.value),
      pic_id: Number(selectedPIC?.value),
      is_all_loan: isAllLoan,
      loan: Number(loan || 0),
      // NEW fields
      bonus: Number(bonus || 0),
      transport: Number(transport || 0),
      start_date: startDateStr,
      end_date: endDateStr,
      notes,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menambahkan Payroll?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result: any) => {
      if (!result.isConfirmed) {
        Swal.fire({
          icon: "warning",
          title: "Batal Menambahkan Data",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
        return;
      }

      try {
        setIsLoading(true);
        const response = await payrollService.createPayroll(payload);
        isGetData();
        setIsLoading(false);

        Swal.fire({
          icon: "success",
          title: `${response.message}`,
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });

        clearForm();
        onClose();
      } catch (err: unknown) {
        setIsLoading(false);

        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<{
            message?: string;
            errors?: any;
          }>;
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            "Terjadi kesalahan pada server";

          Swal.fire({
            icon: "error",
            title: "Gagal menambahkan payroll",
            text: errorMessage,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2500,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal menambahkan payroll",
            text: "Terjadi kesalahan tak terduga",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2500,
          });
        }
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        clearForm();
        onClose();
      }}
      title={title}
      width="w-[90vw] md:w-[80vw]"
      onSubmit={handleSubmit}
      onCancel={() => {
        clearForm();
        onClose();
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
        {/* User */}
        <div>
          <Label className="mb-1 block">
            Karyawan <span className="text-red-500">*</span>
          </Label>
          <ComboboxPopoverCustom
            data={users}
            selectedItem={selectedUser}
            onSelect={setSelectedUser}
            isOpen={isUserOpen}
            onOpenChange={setIsUserOpen}
            placeholder="Pilih karyawan"
            height="h-10"
          />
        </div>

        {/* PIC */}
        <div>
          <Label className="mb-1 block">
            PIC <span className="text-red-500">*</span>
          </Label>
          <ComboboxPopoverCustom
            data={pics}
            selectedItem={selectedPIC}
            onSelect={setSelectedPIC}
            isOpen={isPicOpen}
            onOpenChange={setIsPicOpen}
            placeholder="Pilih PIC"
            height="h-10"
          />
        </div>

        {/* Date Range */}
        <div className="md:col-span-2">
          <Label className="mb-1 block">
            Periode Payroll <span className="text-red-500">*</span>
          </Label>
          <DateRangeCustom
            value={range}
            onChange={setRange}
            widthButton="w-full"
            placeHolder="Pilih rentang tanggal"
          />

          <div className="mt-2 text-xs text-muted-foreground">
            Start date:{" "}
            <span className="font-medium">{startDateStr || "-"}</span> · End
            date: <span className="font-medium">{endDateStr || "-"}</span>
          </div>
        </div>

        {/* is_all_loan */}
        <div className="flex items-center gap-2 mt-2">
          <Checkbox
            id="is_all_loan"
            checked={isAllLoan}
            onCheckedChange={(checked) => setIsAllLoan(!!checked)}
          />
          <Label htmlFor="is_all_loan">Gunakan Semua Pinjaman</Label>
        </div>

        {/* loan */}
        <div>
          <Label className="mb-1 block">Jumlah Pinjaman</Label>
          <Input
            type="text"
            value={loanFormatted}
            onChange={handleLoanChange}
            placeholder="0"
            disabled={isAllLoan}
            className={isAllLoan ? "bg-gray-100 cursor-not-allowed" : ""}
          />
        </div>

        {/* NEW: bonus */}
        <div>
          <Label className="mb-1 block">Nominal Bonus</Label>
          <Input
            type="text"
            value={bonusFormatted}
            onChange={handleBonusChange}
            placeholder="0"
          />
        </div>

        {/* NEW: transport */}
        <div>
          <Label className="mb-1 block">Nominal Transport</Label>
          <Input
            type="text"
            value={transportFormatted}
            onChange={handleTransportChange}
            placeholder="0"
          />
        </div>

        {/* notes */}
        <div className="md:col-span-2">
          <Label className="mb-1 block">Catatan</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan tambahan (opsional)"
            rows={3}
          />
        </div>
      </div>

      {isSubmitDisabled && (
        <div className="px-5 pb-3 text-xs text-red-500">
          Pastikan Karyawan, PIC, dan rentang tanggal sudah dipilih.
        </div>
      )}
    </Modal>
  );
}
