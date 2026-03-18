"use client";

import { useContext, useEffect, useState } from "react";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import { Modal } from "@/components/custom/modal";
import { Card, CardContent } from "@/components/ui/card";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { attendanceService, userService } from "@/services";
import { IUserSelect } from "@/types/user";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Circle } from "lucide-react";

import { format } from "date-fns";
import axios from "axios";

interface Props {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  isGetData: () => void;
  setIsLoading: (loading: boolean) => void;
}

export default function SyncSalaryModal({
  isOpen,
  title,
  onClose,
  isGetData,
  setIsLoading,
}: Props) {
  const { isMobile } = useContext(MobileContext);

  const [employee, setEmployee] = useState<ComboboxItem<IUserSelect>[]>([]);
  const [selectedEmployees, setSelectedEmployees] =
    useState<ComboboxItem<IUserSelect> | null>(null);
  const [isPopoverEmployeeOpen, setPopoverEmployeeOpen] = useState(false);

  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (isOpen) {
      getUsers();
    }
  }, [isOpen]);

  const getUsers = async (search?: string) => {
    const params = search ? { search } : (undefined as any);
    try {
      const { data } = await userService.getAllUsers(params);
      setEmployee(
        data.map((e: IUserSelect) => ({
          value: e.id,
          label: e.name,
          icon: Circle,
        }))
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Terjadi kesalahan saat memuat data karyawan!",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const clearInput = () => {
    setSelectedEmployees(null);
    setStartDate(new Date());
    setEndDate(new Date());
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployees) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Silakan pilih karyawan terlebih dahulu.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    if (!startDate || !endDate) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Silakan pilih periode tanggal (start dan end).",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    if (startDate > endDate) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Tanggal mulai tidak boleh lebih besar dari tanggal akhir.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const employeeId =
      (selectedEmployees as any)?.employee_id ??
      (selectedEmployees as any)?.value;

    if (!employeeId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "employee_id tidak ditemukan dari data karyawan terpilih.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const fd = new FormData();
    fd.append("start_date", format(startDate, "yyyy-MM-dd"));
    fd.append("end_date", format(endDate, "yyyy-MM-dd"));
    fd.append("user_id", employeeId);

    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin melakukan sinkronisasi gaji?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          const { data } = await attendanceService.syncSalary(fd);
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Proses sinkronisasi gaji berhasil.",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });

          isGetData();
          onClose();
        } catch (e) {
          setIsLoading(false);
          if (axios.isAxiosError(e)) {
            const rawMessage = e.response?.data?.message;
            let errorMessages: string[] = [];

            if (typeof rawMessage === "string") {
              errorMessages.push(rawMessage);
            } else if (Array.isArray(rawMessage)) {
              errorMessages = rawMessage;
            } else if (typeof rawMessage === "object" && rawMessage !== null) {
              for (const field in rawMessage) {
                if (Object.prototype.hasOwnProperty.call(rawMessage, field)) {
                  const fieldErrors = rawMessage[field];
                  if (Array.isArray(fieldErrors)) {
                    errorMessages.push(`${field}: ${fieldErrors.join(", ")}`);
                  } else if (typeof fieldErrors === "string") {
                    errorMessages.push(`${field}: ${fieldErrors}`);
                  }
                }
              }
            } else {
              errorMessages.push("Terjadi kesalahan.");
            }

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

        clearInput();
      } else if (result.isConfirmed === false) {
        clearInput();
        Swal.fire({
          icon: "warning",
          title: "Batal Sinkronisasi Gaji",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        onSubmit={handleSubmit}
        width={isMobile ? "w-[95vw]" : "w-[50vw]"}
        onCancel={onClose}
      >
        <Card className="border-none shadow-none">
          <CardContent className="pt-4">
            <div className="space-y-4">
              {/* Pilih Karyawan */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-sans-bold">
                    Pilih Karyawan <span className="text-red-500">*</span>
                  </label>
                  <ComboboxPopoverCustom
                    data={employee}
                    selectedItem={selectedEmployees}
                    onSelect={setSelectedEmployees}
                    isOpen={isPopoverEmployeeOpen}
                    onOpenChange={setPopoverEmployeeOpen}
                    placeholder="Cari Karyawan"
                    onInputChange={(q) => {
                      getUsers(q);
                    }}
                    height="h-10"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-sm font-sans-bold">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !startDate ? "text-muted-foreground" : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "dd MMM yyyy")
                        ) : (
                          <span>Pilih tanggal mulai</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      sideOffset={4}
                    >
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="text-sm font-sans-bold">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !endDate ? "text-muted-foreground" : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "dd MMM yyyy")
                        ) : (
                          <span>Pilih tanggal akhir</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      sideOffset={4}
                    >
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Modal>
    </>
  );
}
