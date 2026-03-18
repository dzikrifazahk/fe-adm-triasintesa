"use client";
import { Modal } from "@/components/custom/modal";
import { IOvertime } from "@/types/overtime";
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
  budgetService,
  overtimeService,
  projectService,
  userService,
} from "@/services";
import { Circle } from "lucide-react";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import axios from "axios";
import { format } from "date-fns";
import { IUser } from "@/types/user";
import { IBudget } from "@/types/budget";
import { DateTimePicker24h } from "@/components/ui/dateTimePicker";
import { Checkbox } from "@/components/ui/checkbox";

interface ModalProjectsProps {
  isOpen: boolean;
  title: string;
  detailData?: IOvertime | null;
  modalType: "create" | "edit" | "detail";
  onClose: () => void;
  isGetData: () => void;
  setIsLoading: (loading: boolean) => void;
}

export default function ModalOvertime({
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
  const [clientTimezone, setClientTimezone] = useState<string>("UTC");

  const [projects, setProjects] = useState<ComboboxItem<IProject>[]>([]);
  const [selectedProject, setSelectedProject] =
    useState<ComboboxItem<IProject> | null>(null);
  const [isPopoverProjectOpen, setPopoverProjectOpen] = useState(false);

  const [users, setUsers] = useState<ComboboxItem<IUser>[]>([]);
  const [selectedUser, setSelectedUser] = useState<ComboboxItem<IUser> | null>(
    null
  );
  const [isPopoverUsersOpen, setPopoverUsersOpen] = useState(false);

  const [tasks, setTasks] = useState<ComboboxItem<IBudget>[]>([]);
  const [selectedTask, setSelectedTask] =
    useState<ComboboxItem<IBudget> | null>(null);
  const [isPopoverTaskOpen, setPopoverTaskOpen] = useState(false);

  const [personInCharges, setPersonInCharges] = useState<ComboboxItem<IUser>[]>(
    []
  );
  const [selectedPersonInCharge, setSelectedPersonInCharge] =
    useState<ComboboxItem<IUser> | null>(null);
  const [isPopoverPersonInChargeOpen, setPopoverPersonInChargeOpen] =
    useState(false);

  const [startTime, setStartTime] = useState<Date | undefined>(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const [endTime, setEndTime] = useState<Date | undefined>(
    new Date(new Date().setHours(0, 0, 0, 0))
  );

  const [note, setNote] = useState<string>("");

  const [isMeal, setIsMeal] = useState<boolean>(false);

  const fmtHM = (d?: Date) => (d ? format(d, "HH:mm") : "");

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("project_id", String(selectedProject?.value ?? ""));
    fd.append("budget_id", String(selectedTask?.value ?? ""));
    // selalu kirim tanggal hari ini
    fd.append("request_date", format(new Date(), "yyyy-MM-dd"));
    fd.append("reason", note || "");
    fd.append("pic_id", String(selectedPersonInCharge?.value ?? ""));
    fd.append(
      "start_time",
      startTime ? format(startTime, "yyyy-MM-dd HH:mm") : ""
    );
    fd.append("end_time", endTime ? format(endTime, "yyyy-MM-dd HH:mm") : "");
    fd.append("user_id", selectedUser?.value ?? "");
    fd.append("is_allow_meal", isMeal ? "1" : "0");
    fd.append("timezone", clientTimezone);
    return fd;
  };

  useEffect(() => {
    if (typeof window !== "undefined" && typeof Intl !== "undefined") {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        setClientTimezone(tz);
      }
    }
  }, []);

  const validateBeforeSubmit = () => {
    if (
      !selectedProject?.value ||
      !selectedTask?.value ||
      !selectedPersonInCharge?.value
    ) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi data wajib",
        text: "Proyek, Pekerjaan, dan PIC wajib dipilih.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return false;
    }
    if (!fmtHM(startTime) || !fmtHM(endTime)) {
      Swal.fire({
        icon: "warning",
        title: "Waktu belum diisi",
        text: "Start time dan End time wajib diisi.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;

    const fd = buildFormData();
    const confirmText =
      modalType === "create"
        ? "Apakah anda ingin mengajukan Lembur?"
        : "Apakah anda ingin mengubah pengajuan Lembur?";

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
              ? "Batal Mengajukan Lembur"
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
        // Kirim FormData
        const resp =
          modalType === "create"
            ? await overtimeService.createOvertime(fd as any)
            : await overtimeService.updateOvertime(String(id), fd as any);

        setIsLoading(false);
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

  const getProjects = async (search?: string) => {
    const filter = search ? { search } : {};
    const { data } = await projectService.getAllProjects(filter);
    const mapped = data.map((e: IProject) => ({
      value: e.id,
      label: e.name,
      icon: Circle,
    }));
    setProjects(mapped);
    return mapped;
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

  const getTasks = async (search?: string) => {
    if (!selectedProject?.value) {
      setTasks([]);
      return [];
    }
    const filter = search
      ? { search, project_id: selectedProject.value }
      : { project_id: selectedProject.value };
    const { data } = await budgetService.getAllBudget(filter);
    const mapped = data.map((e: IBudget) => ({
      value: e.id,
      label: e.nama_budget,
      icon: Circle,
    }));
    setTasks(mapped);
    return mapped;
  };

  const getPICs = async (search?: string) => {
    const filter = search ? { search, role_id: 3 } : { role_id: 3 };
    const { data } = await userService.getAllUsers(filter);
    const mapped = data.map((e: IUser) => ({
      value: e.id,
      label: e.name,
      icon: Circle,
    }));
    setPersonInCharges(mapped);
    return mapped;
  };

  useEffect(() => {
    if (!isOpen) return;
    getUsers();
    getProjects();
    getPICs();
  }, [isOpen]);

  useEffect(() => {
    if (modalType === "edit" && detailData && isOpen) {
      setSelectedProject({
        value: String(detailData.project_id),
        label: detailData.project_name,
        icon: Circle,
      });
      setSelectedTask({
        value: String(detailData.budget_id),
        label: detailData.budget_nama,
        icon: Circle,
      });
      setSelectedPersonInCharge({
        value: String(detailData.pic_id),
        label: detailData.pic_name,
        icon: Circle,
      });
      setSelectedUser({
        value: String(detailData.user_id),
        label: detailData.user_name,
        icon: Circle,
      });

      try {
        if ((detailData as any).start_time) {
          const [sh, sm] = String((detailData as any).start_time).split(":");
          setStartTime(
            new Date(
              new Date().setHours(Number(sh) || 0, Number(sm) || 0, 0, 0)
            )
          );
        }
        if ((detailData as any).end_time) {
          const [eh, em] = String((detailData as any).end_time).split(":");
          setEndTime(
            new Date(
              new Date().setHours(Number(eh) || 0, Number(em) || 0, 0, 0)
            )
          );
        }
      } catch {}

      if ((detailData as any)?.is_allow_meal != null) {
        const v = (detailData as any).is_allow_meal;
        setIsMeal(v === true || v === 1 || v === "1");
      }

      setId(String(detailData.id));
      setNote(detailData.reason ?? "");
    }
  }, [isOpen, modalType, detailData]);

  useEffect(() => {
    if (!selectedProject?.value) {
      setTasks([]);
      if (modalType !== "edit") setSelectedTask(null);
      return;
    }
    getTasks();
    if (modalType !== "edit") setSelectedTask(null);
  }, [selectedProject?.value, modalType]);

  return (
    <>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={title}
          onSubmit={handleSubmit}
          width={isMobile ? "w-[80vw]" : "w-[50vw]"}
          onCancel={onClose}
        >
          <div className={`w-full space-y-6 p-4 ${isMobile ? "" : "px-8"}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaBusinessTime className="w-5 h-5" />
                  Lembur
                </CardTitle>
                <CardDescription>
                  Masukkan detail informasi lembur
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
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

                {selectedUser && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1 col-span-full lg:col-span-1">
                      <label className="text-sm font-sans-bold">
                        Pilih Proyek <span className="text-red-500">*</span>
                      </label>
                      <ComboboxPopoverCustom
                        data={projects}
                        selectedItem={selectedProject}
                        onSelect={setSelectedProject}
                        isOpen={isPopoverProjectOpen}
                        onOpenChange={setPopoverProjectOpen}
                        placeholder="Cari Proyek"
                        onInputChange={(q) => getProjects(q)}
                        height="h-10"
                      />
                    </div>
                  </div>
                )}

                {selectedProject && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-full lg:col-span-1">
                        <label className="text-sm font-sans-bold">
                          Pilih Pekerjaan{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <ComboboxPopoverCustom
                          data={tasks}
                          selectedItem={selectedTask}
                          onSelect={setSelectedTask}
                          isOpen={isPopoverTaskOpen}
                          onOpenChange={setPopoverTaskOpen}
                          placeholder="Cari Pekerjaan"
                          onInputChange={(q) => getTasks(q)}
                          height="h-10"
                        />
                      </div>

                      <div className="space-y-1 col-span-full lg:col-span-1">
                        <label className="text-sm font-sans-bold">
                          Pilih PIC
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

                      {/* Start Time */}
                      <div className="space-y-1">
                        <label className="text-sm font-sans-bold">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <DateTimePicker24h
                          value={startTime}
                          onChange={(d) => setStartTime(d)}
                          displayFormat="dd/MM/yyyy HH:mm"
                          placeholder="DD/MM/YYYY HH:mm"
                        />
                      </div>

                      {/* End Time */}
                      <div className="space-y-1">
                        <label className="text-sm font-sans-bold">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <DateTimePicker24h
                          value={endTime}
                          onChange={(d) => setEndTime(d)}
                          displayFormat="dd/MM/yyyy HH:mm"
                          placeholder="DD/MM/YYYY HH:mm"
                        />
                      </div>

                      {/* isMeal */}
                      <div className="space-y-1 flex items-center gap-3">
                        <Checkbox
                          checked={isMeal}
                          onCheckedChange={(v) => setIsMeal(!!v)}
                          id="isMeal"
                        />
                        <label
                          htmlFor="isMeal"
                          className="text-sm font-sans-bold"
                        >
                          Tambahan Makan
                        </label>
                      </div>

                      {/* Note */}
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </Modal>
      )}
    </>
  );
}
