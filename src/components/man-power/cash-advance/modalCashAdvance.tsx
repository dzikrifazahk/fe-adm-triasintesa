"use client";
import { Modal } from "@/components/custom/modal";
import { useContext, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaBusinessTime } from "react-icons/fa6";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import { cashAdvanceService, userService } from "@/services";
import { Circle } from "lucide-react";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import axios from "axios";
import { format } from "date-fns";
import { IUser } from "@/types/user";
import { IAddOrUpdateCashAdvance, ICashAdvance } from "@/types/cash-advance";
import { useCurrencyInput } from "@/utils/useCurrency";

interface ModalProjectsProps {
  isOpen: boolean;
  title: string;
  detailData?: ICashAdvance | null;
  modalType: string; // "create" | "edit"
  onClose: () => void;
  isGetData: () => void;
  setIsLoading: (loading: boolean) => void;
}

export default function ModalCashAdvance({
  isOpen,
  title,
  onClose,
  modalType,
  isGetData,
  detailData,
  setIsLoading,
}: ModalProjectsProps) {
  const { isMobile } = useContext(MobileContext);

  const [id, setId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ====== KARYAWAN (user_id) ======
  const [users, setUsers] = useState<ComboboxItem<IUser>[]>([]);
  const [selectedUser, setSelectedUser] = useState<ComboboxItem<IUser> | null>(
    null
  );
  const [isPopoverUsersOpen, setPopoverUsersOpen] = useState(false);

  // ====== PIC (approval / penanggung jawab) ======
  const [personInCharges, setPersonInCharges] = useState<ComboboxItem<IUser>[]>(
    []
  );
  const [selectedPersonInCharge, setSelectedPersonInCharge] =
    useState<ComboboxItem<IUser> | null>(null);
  const [isPopoverPersonInChargeOpen, setPopoverPersonInChargeOpen] =
    useState(false);

  // ====== Nilai & Catatan ======
  const [note, setNote] = useState<string>("");
  const {
    value: nominal,
    formattedValueNumeric: nominalFormatted,
    handleChange: handleNominalChange,
    setValue: setNominal,
  } = useCurrencyInput();

  // ====== Submit ======
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: IAddOrUpdateCashAdvance = {
      user_id: selectedUser?.value || "", // <-- tambah user_id
      nominal: Number(nominal),
      request_date: format(
        new Date(
          Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate()
          )
        ),
        "yyyy-MM-dd"
      ),
      reason: note,
      pic_id: selectedPersonInCharge?.value || "",
    };

    // Validasi sederhana
    if (
      !payload.user_id ||
      !payload.pic_id ||
      !payload.nominal ||
      !payload.reason
    ) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi data wajib",
        text: "Karyawan, PIC, Nominal, dan Catatan wajib diisi.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    const confirmText =
      modalType === "create"
        ? "Apakah Anda ingin mengajukan Cash Advance?"
        : "Apakah Anda ingin mengubah pengajuan Cash Advance?";

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
              ? "Batal Mengajukan Cash Advance"
              : "Batal Mengubah Data",
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
            ? await cashAdvanceService.createCashAdvance(payload)
            : await cashAdvanceService.updateCashAdvance(id, payload);

        setIsLoading(false);
        setIsModalOpen(false);
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
            errorMessages.push("Terjadi kesalahan yang tidak diketahui.");
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
    });
  };

  // ====== Data fetching ======
  const getPICs = async (search?: string) => {
    const filter = search ? { search, role_id: 2 } : { role_id: 2 };
    const { data } = await userService.getAllUsers(filter);
    setPersonInCharges(
      data.map((e: IUser) => ({
        value: e.id,
        label: e.name,
        icon: Circle,
      }))
    );
  };

  const getUsers = async (search?: string) => {
    const filter = search ? { search } : {};
    const { data } = await userService.getAllUsers(filter);
    setUsers(
      data.map((e: IUser) => ({
        value: e.id,
        label: e.name,
        icon: Circle,
      }))
    );
  };

  // ====== Effects ======
  useEffect(() => {
    setIsModalOpen(isOpen);
    getPICs();
    getUsers();

    if (modalType === "edit" && detailData) {
      // prefill edit
      // setSelectedUser({
      //   value: detailData.,
      //   label: detailData.user_name,
      //   icon: Circle,
      // });
      setSelectedPersonInCharge({
        value: detailData.pic_id,
        label: detailData.pic_name,
        icon: Circle,
      });
      setNominal(String(detailData.nominal));
      setNote(detailData.reason);
      setId(String(detailData.id));
    } else if (modalType === "create") {
      // reset saat create
      setSelectedUser(null);
      setSelectedPersonInCharge(null);
      setNominal("");
      setNote("");
      setId("");
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          onSubmit={handleSubmit}
          width={isMobile ? "w-[95vw]" : "w-[50vw]"}
          onCancel={onClose}
        >
          <div className={`w-full space-y-6 p-4 ${isMobile ? "" : "px-8"}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaBusinessTime className="w-5 h-5" />
                  Cash Advance
                </CardTitle>
                <CardDescription>
                  Masukkan detail pengajuan cash advance
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Pilih Karyawan (user_id) */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1 col-span-full lg:col-span-1">
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
                </div>

                {/* Pilih PIC */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1 col-span-full lg:col-span-1">
                    <label className="text-sm font-sans-bold">
                      Pilih PIC <span className="text-red-500">*</span>
                    </label>
                    <ComboboxPopoverCustom
                      data={personInCharges}
                      selectedItem={selectedPersonInCharge}
                      onSelect={setSelectedPersonInCharge}
                      isOpen={isPopoverPersonInChargeOpen}
                      onOpenChange={setPopoverPersonInChargeOpen}
                      placeholder="Cari PIC"
                      onInputChange={(q) => getPICs(q)}
                      height="h-10"
                    />
                  </div>
                </div>

                {/* Nominal & Catatan */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-sans-bold">
                      Nominal <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={nominalFormatted}
                      onChange={handleNominalChange}
                      placeholder="Nominal"
                      inputMode="numeric"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-sans-bold">
                      Catatan <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      className="w-full"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Catatan"
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
