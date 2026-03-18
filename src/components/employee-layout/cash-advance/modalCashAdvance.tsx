"use client";
import { Modal } from "@/components/custom/modal";
import { IAddOrUpdateOvertime, IOvertime } from "@/types/overtime";
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
import { IProject } from "@/types/project";
import {
  cashAdvanceService,
  overtimeService,
  projectService,
  taskService,
  userService,
} from "@/services";
import { Circle } from "lucide-react";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { ITasks } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { IUser } from "@/types/user";
import { IAddOrUpdateCashAdvance, ICashAdvance } from "@/types/cash-advance";
import { useCurrencyInput } from "@/utils/useCurrency";

interface ModalProjectsProps {
  isOpen: boolean;
  title: string;
  detailData?: ICashAdvance | null;
  modalType: string;
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

  const [personInCharges, setPersonInCharges] = useState<
    ComboboxItem<ITasks>[]
  >([]);
  const [selectedPersonInCharge, setSelectedPersonInCharge] =
    useState<ComboboxItem<ITasks> | null>(null);
  const [isPopoverPersonInChargeOpen, setPopoverPersonInChargeOpen] =
    useState(false);
  const [note, setNote] = useState<string>("");
  let {
    value: nominal,
    formattedValueNumeric: nominalFormatted,
    handleChange: handleNominalChange,
    formattedValueWithRp: nominalRp,
    setValue: setNominal,
  } = useCurrencyInput();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: IAddOrUpdateCashAdvance = {
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

    if (modalType === "create") {
      Swal.fire({
        icon: "warning",
        text: "Apakah anda ingin mengajukan Pinjaman?",
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
            const response = await cashAdvanceService.createCashAdvance(
              payload
            );
            setIsLoading(false);
            setIsModalOpen(false);
            Swal.fire({
              icon: "success",
              title: `${response.message}`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
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
              } else if (
                typeof rawMessage === "object" &&
                rawMessage !== null
              ) {
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

          // clearInput();
        } else if (result.isConfirmed === false) {
          // clearInput();
          Swal.fire({
            icon: "warning",
            title: "Batal Mengajukan Pinjaman",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      });
    } else {
      Swal.fire({
        icon: "warning",
        text: "Apakah anda ingin mengubah pengajuan Pinjaman ?",
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
            const response = await cashAdvanceService.updateCashAdvance(
              id,
              payload
            );
            setIsLoading(false);
            Swal.fire({
              icon: "success",
              title: `${response.message}`,
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
              } else if (
                typeof rawMessage === "object" &&
                rawMessage !== null
              ) {
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
          // clearInput();
        } else if (result.isConfirmed === false) {
          // clearInput();
          Swal.fire({
            icon: "warning",
            title: "Batal Mengubah Data",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      });
    }
  };

  const getPICs = async (search?: string) => {
    const filter = search ? { search: search, role_id: 2 } : { role_id: 2 };

    const { data } = await userService.getAllUsers(filter);
    setPersonInCharges(
      data.map((e: IUser) => ({
        value: e.id,
        label: e.name,
        icon: Circle,
      }))
    );
  };

  useEffect(() => {
    if (modalType === "edit" && detailData) {
      setSelectedPersonInCharge({
        value: detailData.pic_id,
        label: detailData.pic_name,
        icon: Circle,
      });
      setNominal(String(detailData.nominal));
      setNote(detailData.reason);
      setId(String(detailData.id));
    }
    setIsModalOpen(isOpen);
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
                  Pinjaman
                </CardTitle>
                <CardDescription>
                  Masukkan detail informasi pinjaman
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-sans-bold">
                      Nominal <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={nominalFormatted}
                        onChange={handleNominalChange}
                        placeholder="Nominal"
                      />
                    </div>
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
