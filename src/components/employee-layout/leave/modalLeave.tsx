"use client";

import { Modal } from "@/components/custom/modal";
import { ILeave } from "@/types/leave";
import { useContext, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaUmbrellaBeach } from "react-icons/fa6";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import { leaveService, userService } from "@/services";
import { Circle } from "lucide-react";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import axios from "axios";
import { IUser } from "@/types/user";
import { mapLeaveType } from "@/helpers/leaveConvertion";
import { DateTimePicker24h } from "@/components/ui/dateTimePicker";
import { format } from "date-fns";

interface ModalLeaveProps {
  isOpen: boolean;
  title: string;
  detailData?: ILeave | null;
  modalType: "create" | "edit" | "detail";
  onClose: () => void;
  isGetData: () => void;
  setIsLoading: (loading: boolean) => void;
  isNonAuthMode?: boolean;
}

export default function ModalLeave({
  isOpen,
  title,
  onClose,
  modalType,
  isGetData,
  detailData,
  setIsLoading,
  isNonAuthMode,
}: ModalLeaveProps) {
  const { isMobile } = useContext(MobileContext);
  const [id, setId] = useState("");

  const [users, setUsers] = useState<ComboboxItem<IUser>[]>([]);
  const [selectedUser, setSelectedUser] = useState<ComboboxItem<IUser> | null>(
    null
  );
  const [isPopoverUsersOpen, setPopoverUsersOpen] = useState(false);

  const [approvers, setApprovers] = useState<ComboboxItem<IUser>[]>([]);
  const [selectedApprover, setSelectedApprover] =
    useState<ComboboxItem<IUser> | null>(null);
  const [isPopoverApproverOpen, setPopoverApproverOpen] = useState(false);

  type TypeItem = ComboboxItem<{ code: number }>;
  const [types, setTypes] = useState<TypeItem[]>([]);
  const [selectedType, setSelectedType] = useState<TypeItem | null>(null);
  const [isPopoverTypeOpen, setPopoverTypeOpen] = useState(false);

  const [startDateTime, setStartDateTime] = useState<Date | undefined>(
    new Date(new Date().setSeconds(0, 0))
  );
  const [endDateTime, setEndDateTime] = useState<Date | undefined>(
    new Date(new Date().setSeconds(0, 0))
  );
  const [reason, setReason] = useState<string>("");

  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const clearForm = () => {
    setId("");
    setSelectedType(null);
    setSelectedUser(null);
    setSelectedApprover(null);
    setStartDateTime(new Date(new Date().setSeconds(0, 0)));
    setEndDateTime(new Date(new Date().setSeconds(0, 0)));
    setReason("");
    setAttachment(null);
    setAttachmentError(null);
  };

  const buildFormData = () => {
    const fd = new FormData();

    fd.append("type", String(selectedType?.value ?? ""));

    if (selectedUser?.value) {
      fd.append("user_id", String(selectedUser.value));
    }

    fd.append("pic_id", String(selectedApprover?.value ?? ""));

    fd.append("reason", reason || "");

    fd.append(
      "start_date",
      startDateTime ? format(startDateTime, "yyyy-MM-dd HH:mm") : ""
    );
    fd.append(
      "end_date",
      endDateTime ? format(endDateTime, "yyyy-MM-dd HH:mm") : ""
    );

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    fd.append("timezone", tz);

    if (attachment) {
      fd.append("attachment", attachment);
    }

    return fd;
  };

  const validateBeforeSubmit = () => {
    if (!selectedType?.value) {
      Swal.fire({
        icon: "warning",
        title: "Kategori cuti wajib dipilih",
        text: "Silakan pilih kategori cuti (Cuti).",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return false;
    }

    if (isNonAuthMode && !selectedUser?.value) {
      Swal.fire({
        icon: "warning",
        title: "Karyawan belum dipilih",
        text: "Silakan pilih karyawan terlebih dahulu.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return false;
    }

    if (!selectedApprover?.value) {
      Swal.fire({
        icon: "warning",
        title: "Atasan/Penyetuju belum dipilih",
        text: "Silakan pilih atasan/penyetuju cuti.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return false;
    }

    if (!startDateTime || !endDateTime) {
      Swal.fire({
        icon: "warning",
        title: "Waktu cuti belum diisi",
        text: "Start date dan end date cuti wajib diisi.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return false;
    }

    if (startDateTime > endDateTime) {
      Swal.fire({
        icon: "warning",
        title: "Range waktu tidak valid",
        text: "Start date tidak boleh lebih besar dari end date.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return false;
    }

    if (reason.trim().length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Alasan cuti belum diisi",
        text: "Silakan isi alasan cuti.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return false;
    }

    return true;
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setAttachment(null);
      setAttachmentError(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setAttachment(null);
      setAttachmentError(
        "File harus berupa PDF atau gambar (PNG/JPG/JPEG/GIF/WEBP)."
      );
      e.target.value = "";
      return;
    }

    const MAX_BYTES = 3 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setAttachment(null);
      setAttachmentError("Ukuran file maksimal 3 MB.");
      e.target.value = "";
      return;
    }

    setAttachment(file);
    setAttachmentError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateBeforeSubmit()) return;

    const fd = buildFormData();
    const confirmText =
      modalType === "create"
        ? "Apakah anda ingin mengajukan Cuti?"
        : "Apakah anda ingin mengubah pengajuan Cuti?";

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
      if (!result.isConfirmed) {
        Swal.fire({
          icon: "warning",
          title:
            modalType === "create"
              ? "Batal Mengajukan Cuti"
              : "Batal Mengubah Data Cuti",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
        return;
      }

      try {
        setIsLoading(true);
        const resp =
          modalType === "create"
            ? await leaveService.createLeave(fd as any)
            : await leaveService.updateLeave(String(id), fd as any);

        setIsLoading(false);

        clearForm();

        Swal.fire({
          icon: "success",
          title: `${resp.message}`,
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
        onClose();
        isGetData();
      } catch (e) {
        setIsLoading(false);
        if (axios.isAxiosError(e)) {
          const raw = e.response?.data?.message;
          let errorMessages: string[] = [];
          if (typeof raw === "string") errorMessages.push(raw);
          else if (Array.isArray(raw)) errorMessages = raw;
          else if (typeof raw === "object" && raw !== null) {
            for (const field in raw) {
              const fieldErrors = (raw as any)[field];
              if (Array.isArray(fieldErrors))
                errorMessages.push(`${field}: ${fieldErrors.join(", ")}`);
              else if (typeof fieldErrors === "string")
                errorMessages.push(`${field}: ${fieldErrors}`);
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
    });
  };

  const getUsers = async (search?: string) => {
    const filter = search ? { search } : {};
    const { data } = await userService.getAllUsers(filter);
    const mapped = data.map((e: IUser) => ({
      value: e.id,
      label: e.name,
      icon: Circle,
    }));
    setUsers(mapped);
    return mapped;
  };

  const getApprovers = async (search?: string) => {
    const filter = search ? { search, role_id: 2 } : { role_id: 2 };
    const { data } = await userService.getAllUsers(filter);
    const mapped = data.map((e: IUser) => ({
      value: e.id,
      label: e.name,
      icon: Circle,
    }));
    setApprovers(mapped);
    return mapped;
  };

  useEffect(() => {
    const base: TypeItem[] = [
      {
        value: "0",
        label: "Cuti",
        icon: Circle,
      },
      {
        value: "1",
        label: "Izin",
        icon: Circle,
      },
      {
        value: "2",
        label: "Sakit",
        icon: Circle,
      },
    ];
    setTypes(base);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    getApprovers();
    if (isNonAuthMode) {
      getUsers();
    }

    setStartDateTime(new Date(new Date().setSeconds(0, 0)));
    setEndDateTime(new Date(new Date().setSeconds(0, 0)));
    setAttachment(null);
    setAttachmentError(null);
  }, [isOpen, isNonAuthMode]);

  useEffect(() => {
    if (modalType === "edit" && detailData && isOpen) {
      if (detailData.user_id && detailData.user_name) {
        setSelectedUser({
          value: String(detailData.user_id),
          label: detailData.user_name,
          icon: Circle,
        });
      }

      if (
        (detailData as any).approver_id &&
        (detailData as any).approver_name
      ) {
        setSelectedApprover({
          value: String((detailData as any).approver_id),
          label: (detailData as any).approver_name,
          icon: Circle,
        });
      }

      if ((detailData as any).type !== undefined) {
        const found = types.find(
          (t) => String(t.value) === String((detailData as any).type)
        );
        if (found) setSelectedType(found);
      }

      if ((detailData as any).start_date) {
        const raw = String((detailData as any).start_date);
        let d = new Date(raw);
        if (isNaN(d.getTime())) {
          d = new Date(raw.replace(" ", "T"));
        }
        if (!isNaN(d.getTime())) setStartDateTime(d);
      }

      if ((detailData as any).end_date) {
        const raw = String((detailData as any).end_date);
        let d = new Date(raw);
        if (isNaN(d.getTime())) {
          d = new Date(raw.replace(" ", "T"));
        }
        if (!isNaN(d.getTime())) setEndDateTime(d);
      }

      setReason(detailData.reason ?? "");
      setId(String(detailData.id));
    } else {
      clearForm();
    }
  }, [isOpen, modalType, detailData, types]);

  return (
    <>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          onSubmit={handleSubmit}
          width="w-[90vw] md:w-[70vw] lg:w-[60vw]"
          onCancel={onClose}
        >
          <div className={`w-full space-y-6 p-4 ${isMobile ? "" : "px-8"}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaUmbrellaBeach className="w-5 h-5" />
                  Pengajuan Cuti
                </CardTitle>
                <CardDescription>
                  Masukkan detail pengajuan cuti karyawan.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Kategori Cuti + preview badge via mapLeaveType */}
                  <div className="space-y-1">
                    <label className="text-sm font-sans-bold">
                      Kategori Cuti <span className="text-red-500">*</span>
                    </label>
                    <ComboboxPopoverCustom
                      data={types}
                      selectedItem={selectedType}
                      onSelect={setSelectedType}
                      isOpen={isPopoverTypeOpen}
                      onOpenChange={setPopoverTypeOpen}
                      placeholder="Pilih kategori cuti"
                      onInputChange={() => {}}
                      height="h-10"
                    />

                    {selectedType && (
                      <div className="pt-1">
                        {(() => {
                          const { label, className } = mapLeaveType(
                            selectedType.value
                          );
                          return (
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${className}`}
                            >
                              {label}
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Karyawan (hanya jika non-auth mode) */}
                  {isNonAuthMode && (
                    <div className="space-y-1">
                      <label className="text-sm font-sans-bold">
                        Pilih Karyawan <span className="text-red-500">*</span>
                      </label>
                      <ComboboxPopoverCustom
                        data={users}
                        selectedItem={selectedUser}
                        onSelect={setSelectedUser}
                        isOpen={isPopoverUsersOpen}
                        onOpenChange={setPopoverUsersOpen}
                        placeholder="Cari Karyawan"
                        onInputChange={(q) => getUsers(q)}
                        height="h-10"
                      />
                    </div>
                  )}

                  {/* Approver / Atasan */}
                  <div className="space-y-1 lg:col-span-2">
                    <label className="text-sm font-sans-bold">
                      Atasan / Penyetuju <span className="text-red-500">*</span>
                    </label>
                    <ComboboxPopoverCustom
                      data={approvers}
                      selectedItem={selectedApprover}
                      onSelect={setSelectedApprover}
                      isOpen={isPopoverApproverOpen}
                      onOpenChange={setPopoverApproverOpen}
                      placeholder="Cari Atasan"
                      onInputChange={(q) => getApprovers(q)}
                      height="h-10"
                    />
                  </div>

                  {/* Start Datetime Cuti */}
                  <div className="space-y-1">
                    <label className="text-sm font-sans-bold">
                      Mulai Cuti <span className="text-red-500">*</span>
                    </label>
                    <DateTimePicker24h
                      value={startDateTime}
                      onChange={(d) => setStartDateTime(d)}
                      displayFormat="dd/MM/yyyy HH:mm"
                      placeholder="DD/MM/YYYY HH:mm"
                    />
                  </div>

                  {/* End Datetime Cuti */}
                  <div className="space-y-1">
                    <label className="text-sm font-sans-bold">
                      Selesai Cuti <span className="text-red-500">*</span>
                    </label>
                    <DateTimePicker24h
                      value={endDateTime}
                      onChange={(d) => setEndDateTime(d)}
                      displayFormat="dd/MM/yyyy HH:mm"
                      placeholder="DD/MM/YYYY HH:mm"
                    />
                  </div>

                  {/* Attachment */}
                  <div className="space-y-1 lg:col-span-2">
                    <label className="text-sm font-sans-bold">
                      Attachment (PDF / Image)
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleAttachmentChange}
                      className="block w-full text-xs text-muted-foreground 
                         file:mr-3 file:py-2 file:px-3 
                         file:rounded-md file:border 
                         file:text-xs file:font-medium 
                         file:bg-white file:text-foreground 
                         hover:file:bg-accent cursor-pointer"
                    />
                    {attachmentError && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {attachmentError}
                      </p>
                    )}
                    {attachment && !attachmentError && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        File terpilih: {attachment.name}
                      </p>
                    )}
                  </div>

                  {/* Alasan Cuti */}
                  <div className="space-y-1 lg:col-span-2">
                    <label className="text-sm font-sans-bold">
                      Alasan Cuti <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      className="w-full"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Tuliskan alasan pengajuan cuti"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Modal>
      )}
    </>
  );
}
