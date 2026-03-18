"use client";

import { useContext, useEffect, useState } from "react";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import { Modal } from "@/components/custom/modal";
import { Card, CardContent } from "@/components/ui/card";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { adjusmentService, attendanceService, userService } from "@/services";
import { IUserSelect } from "@/types/user";
import Swal from "sweetalert2";

import axios from "axios";
import { format } from "date-fns";
import { Circle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker24h } from "@/components/ui/dateTimePicker";
import { IAttendance } from "@/types/attendance";

interface Props {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  isGetData: () => void;
  setIsLoading: (loading: boolean) => void;
  attendanceData: IAttendance | null;
}

export default function AdjustmentModal({
  isOpen,
  title,
  onClose,
  isGetData,
  setIsLoading,
  attendanceData,
}: Props) {
  const { isMobile } = useContext(MobileContext);

  const [pics, setPICS] = useState<ComboboxItem<IUserSelect>[]>([]);
  const [selectedPIC, setSelectedPIC] =
    useState<ComboboxItem<IUserSelect> | null>(null);
  const [isPopoverPICOpen, setPopoverPICOpen] = useState(false);

  const [startTime, setStartTime] = useState<Date | undefined>(
    new Date(new Date().setSeconds(0, 0))
  );
  const [endTime, setEndTime] = useState<Date | undefined>(
    new Date(new Date().setSeconds(0, 0))
  );

  const [reason, setReason] = useState("");

  const formatDisplayDateTime = (
    val?: string | Date | null
  ): string | undefined => {
    if (!val) return "-";
    let d: Date;
    if (typeof val === "string") {
      const parsed = new Date(val);
      if (isNaN(parsed.getTime())) {
        return val;
      }
      d = parsed;
    } else {
      d = val;
    }
    return format(d, "dd/MM/yyyy HH:mm");
  };

  useEffect(() => {
    if (isOpen) {
      getPics();

      if (attendanceData) {
        const rawStart =
          (attendanceData as any)?.start_time ??
          (attendanceData as any)?.clock_in;
        const rawEnd =
          (attendanceData as any)?.end_time ??
          (attendanceData as any)?.clock_out;

        if (rawStart) {
          const d = new Date(rawStart);
          if (!isNaN(d.getTime())) {
            setStartTime(d);
          }
        }

        if (rawEnd) {
          const d = new Date(rawEnd);
          if (!isNaN(d.getTime())) {
            setEndTime(d);
          }
        }

        if ((attendanceData as any)?.reason) {
          setReason((attendanceData as any).reason);
        }
      }
    } else {
      clearInput();
    }
  }, [isOpen]);

  const getPics = async (search?: string) => {
    const params = search ? { search, role_id: 2 } : { role_id: 2 };
    try {
      const { data } = await userService.getAllUsers(params);
      setPICS(
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
        text: "Terjadi kesalahan saat memuat data PIC!",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const clearInput = () => {
    setSelectedPIC(null);
    setStartTime(new Date(new Date().setSeconds(0, 0)));
    setEndTime(new Date(new Date().setSeconds(0, 0)));
    setReason("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPIC) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Silakan pilih PIC terlebih dahulu.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    if (!startTime || !endTime) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Silakan isi Start Time dan End Time.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    if (startTime > endTime) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Start Time tidak boleh lebih besar dari End Time.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const pic =
      (selectedPIC as any)?.employee_id ?? (selectedPIC as any)?.value;

    if (!pic) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "employee_id tidak ditemukan dari data PIC terpilih.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    if (!attendanceData?.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Data attendance tidak ditemukan.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const fd = new FormData();
    fd.append(
      "new_start_time",
      startTime ? format(startTime, "yyyy-MM-dd HH:mm:ss") : ""
    );
    fd.append(
      "new_end_time",
      endTime ? format(endTime, "yyyy-MM-dd HH:mm:ss") : ""
    );
    fd.append("pic_id", String(pic));
    fd.append("attendance_id", String(attendanceData.id));
    fd.append("reason", reason);

    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin melakukan adjustment attendance?",
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
          const { data } = await adjusmentService.addAdjustment(fd);

          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: data?.message || "Proses adjustment attendance berhasil.",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });

          isGetData();
          onClose();
          clearInput();
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
                  const fieldErrors = (rawMessage as any)[field];
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
      } else if (result.isConfirmed === false) {
        clearInput();
        Swal.fire({
          icon: "warning",
          title: "Batal Adjustment Attendance",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const oldStart =
    (attendanceData as any)?.start_time ??
    (attendanceData as any)?.clock_in ??
    null;
  const oldEnd =
    (attendanceData as any)?.end_time ??
    (attendanceData as any)?.clock_out ??
    null;

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
          <CardContent className="">
            <div className="space-y-4">
              {/* Info lama */}
              {attendanceData && (
                <div className="rounded-md bg-muted px-3 py-2 text-xs md:text-sm">
                  <p className="font-semibold mb-1">Waktu Lama</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] md:text-xs text-muted-foreground">
                        Start Time Lama
                      </span>
                      <span className="font-medium">
                        {formatDisplayDateTime(oldStart)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] md:text-xs text-muted-foreground">
                        End Time Lama
                      </span>
                      <span className="font-medium">
                        {formatDisplayDateTime(oldEnd)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pilih PIC + New Time */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-sans-bold">
                    Pilih PIC <span className="text-red-500">*</span>
                  </label>
                  <ComboboxPopoverCustom
                    data={pics}
                    selectedItem={selectedPIC}
                    onSelect={setSelectedPIC}
                    isOpen={isPopoverPICOpen}
                    onOpenChange={setPopoverPICOpen}
                    placeholder="Cari PIC"
                    onInputChange={(q) => {
                      getPics(q);
                    }}
                    height="h-10"
                  />
                </div>

                {/* Start Time baru */}
                <div className="space-y-1">
                  <label className="text-sm font-sans-bold">
                    Start Time Baru <span className="text-red-500">*</span>
                  </label>
                  <DateTimePicker24h
                    value={startTime}
                    onChange={(d) => setStartTime(d)}
                    displayFormat="dd/MM/yyyy HH:mm"
                    placeholder="DD/MM/YYYY HH:mm"
                  />
                </div>

                {/* End Time baru */}
                <div className="space-y-1">
                  <label className="text-sm font-sans-bold">
                    End Time Baru <span className="text-red-500">*</span>
                  </label>
                  <DateTimePicker24h
                    value={endTime}
                    onChange={(d) => setEndTime(d)}
                    displayFormat="dd/MM/yyyy HH:mm"
                    placeholder="DD/MM/YYYY HH:mm"
                  />
                </div>

                {/* Alasan */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-sans-bold">
                    Alasan Perubahan <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    className="w-full"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tuliskan alasan adjustment attendance"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Modal>
    </>
  );
}
