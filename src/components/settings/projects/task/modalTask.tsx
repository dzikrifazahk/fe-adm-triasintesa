"use client";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import { Modal } from "@/components/custom/modal";
import { Input } from "@/components/ui/input";
import { projectService, taskService } from "@/services";
import { IProject } from "@/types/project";
import { ITasks, IAddOrUpdateTask } from "@/types/task";
import { Circle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrencyInput } from "@/utils/useCurrency";
import Swal from "sweetalert2";
import axios from "axios";

interface Props {
  isOpen: boolean;
  title: string;
  detailData?: ITasks | null;
  modalType: string;
  onClose: () => void;
  isGetData: (tableModal: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  projectId: string;
}

export const ModalTask = ({
  isOpen,
  title,
  onClose,
  modalType,
  isGetData,
  detailData,
  isLoading,
  setIsLoading,
  projectId,
}: Props) => {
  const [isPopoverProjectOpen, setPopoverProjectOpen] = useState(false);

  const [taskId, setTaskId] = useState<string | "">();
  const [namaTask, setNamaTask] = useState<string>("");
  const [taskType, setTaskType] = useState<string>("");

  const {
    value: nominal,
    formattedValueNumeric: nominalFormatted,
    handleChange: handleNominalChange,
    formattedValueWithRp: nominalRp,
    setValue: setNominal,
  } = useCurrencyInput();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !namaTask || !taskType) {
      alert("Semua field wajib diisi.");
      return;
    }

    const payload: IAddOrUpdateTask = {
      project_id: projectId,
      nama_task: namaTask,
      type: taskType,
      nominal: Number(nominal),
    };

    const confirmText =
      modalType === "create"
        ? "Apakah anda ingin menambahkan pekerjaan?"
        : "Apakah anda ingin mengubah pekerjaan?";

    const successText =
      modalType === "create"
        ? "Berhasil Menambahkan Pekerjaan"
        : "Berhasil Mengubah Pekerjaan";

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
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          let response;
          if (modalType === "create") {
            response = await taskService.createTask(payload);
          } else {
            response = await taskService.updateTask(String(taskId), payload);
          }
          isGetData("task");
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: successText,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (e) {
          setIsLoading(false);
          if (axios.isAxiosError(e)) {
            const errorMessages: string[] = [];
            const message = e.response?.data?.message ?? "";
            if (message) {
              for (const field in message) {
                if (message.hasOwnProperty(field)) {
                  errorMessages.push(`${field}: ${message[field].join(", ")}`);
                }
              }
            }
            Swal.fire({
              icon: "error",
              title: `Terjadi Kesalahan ${errorMessages}`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2500,
            });
          }
        }
        onClose();
      } else {
        onClose();
        Swal.fire({
          icon: "warning",
          title: "Batal Ubah Data",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  useEffect(() => {
    if (modalType === "edit" && detailData) {
      setTaskId(detailData.id ?? "");
      setNamaTask(detailData.nama_task ?? "");
      setTaskType(detailData?.type?.id ?? "");
      setNominal(String(detailData.nominal ?? ""));
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onSubmit={handleSubmit}
      onCancel={onClose}
      width="w-1/2"
    >
      <div className="flex flex-col gap-4 p-5">
        {/* Project Selection */}
        {/* <div className="w-full flex flex-col gap-2">
          <label className="font-semibold text-sm">Pilih Project</label>
          <ComboboxPopoverCustom
            data={projects}
            selectedItem={selectedProject}
            onSelect={setSelectedProject}
            isOpen={isPopoverProjectOpen}
            onOpenChange={setPopoverProjectOpen}
            placeholder="Pilih Project"
          />
        </div> */}

        {/* Nama Task */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Nama Task</label>
          <Input
            type="text"
            name="nama_task"
            value={namaTask}
            onChange={(e) => setNamaTask(e.target.value)}
            className="input input-bordered w-full border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Masukkan nama task"
            required
          />
        </div>

        {/* Nominal */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Nominal</label>
          <Input
            type="text"
            value={nominalRp}
            onChange={handleNominalChange}
            className="input input-bordered w-full border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Masukkan nominal"
          />
        </div>
        
        {/* Tipe Task */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Tipe</label>
          <Select
            key={taskType}
            defaultValue={taskType}
            value={taskType}
            onValueChange={setTaskType}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {/* <SelectLabel>Tipe</SelectLabel> */}
                <SelectItem value="1">Jasa</SelectItem>
                <SelectItem value="2">Material</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Modal>
  );
};
