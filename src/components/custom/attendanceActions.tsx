"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Camera, Circle, LogIn, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ComboboxItem, ComboboxPopoverCustom } from "./comboboxProperCustom";
import { IProject } from "@/types/project";
import { IBudget } from "@/types/budget";
import { projectService, budgetService, attendanceService } from "@/services";
import Swal from "sweetalert2";
import CameraCaptureModal from "./CameraCaptureModal";
import { useLoading } from "@/context/loadingContext";
import { IOvertime } from "@/types/overtime";

/** helper: base64 dataURL -> File */
function dataURLtoFile(dataUrl: string, filename: string) {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1] ?? "");
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

type AttendanceActionsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  onCheckIn?: () => void;
  onCheckOut?: () => void;

  /** status */
  isCheckedIn?: boolean | null;
  isCheckedOut?: boolean | null;
  isOvertime?: boolean | null; // true = mode lembur
  overtimeFinish?: boolean | null; // true = lembur sudah selesai
  checkInStatus?: boolean | null;
  disableCheckIn?: boolean;
  disableCheckOut?: boolean;

  overtimeData?: IOvertime | null; // { project_id, budget_id, ... }

  className?: string;
};

export default function AttendanceActions({
  open,
  onOpenChange,
  onCheckIn,
  onCheckOut,
  isCheckedIn,
  isCheckedOut,
  isOvertime,
  overtimeFinish,
  checkInStatus,
  disableCheckIn,
  disableCheckOut,
  overtimeData,
  className,
}: AttendanceActionsProps) {
  const { setIsLoading } = useLoading();
  const drawerContainerRef = useRef<HTMLDivElement>(null);

  // ======= data (Regular) =======
  const [projects, setProjects] = useState<ComboboxItem<IProject>[]>([]);
  const [tasks, setTasks] = useState<ComboboxItem<IBudget>[]>([]);

  // pilihan user (Regular)
  const [selectedProject, setSelectedProject] =
    useState<ComboboxItem<IProject> | null>(null);
  const [selectedTask, setSelectedTask] =
    useState<ComboboxItem<IBudget> | null>(null);

  // UI combobox
  const [openProjectCombo, setOpenProjectCombo] = useState(false);
  const [openTaskCombo, setOpenTaskCombo] = useState(false);

  // foto
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // lokasi (background)
  const [loc, setLoc] = useState<{ lat?: number; lon?: number } | null>(null);
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle"
  );

  // ======= fetchers =======
  const getProjects = async (search?: string) => {
    const filter = search ? { search } : {};
    const { data } = await projectService.getAllProjects(filter);
    setProjects(
      data.map((e: IProject) => ({
        value: e.id,
        label: e.name,
        icon: Circle,
      }))
    );
  };

  const getProjectDetail = async (id?: string | number | null) => {
    if (!id) return setSelectedProject(null);
    try {
      const { data } = await projectService.getProject(String(id));
      const proj = Array.isArray(data) ? data[0] : data; // antisipasi shape
      setSelectedProject({
        value: proj.id,
        label: proj.name,
        icon: Circle,
      });
    } catch {
      setSelectedProject({
        value: id as any,
        label: `Project #${id}`,
        icon: Circle,
      });
    }
  };

  const getTasks = async (search?: string) => {
    const pid = selectedProject?.value;
    if (!pid) {
      return Swal.fire({
        target: drawerContainerRef.current || document.body,
        icon: "warning",
        title: "Pilih proyek dahulu",
        timer: 1400,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
      });
    }
    const filter = search
      ? { search, project_id: pid, type: 1 }
      : { project_id: pid, type: 1 };
    const { data } = await budgetService.getBudgets(filter);
    setTasks(
      data.map((e: IBudget) => ({
        value: e.id,
        label: e.nama_budget,
        icon: Circle,
      }))
    );
  };

  const getTaskDetail = async (id?: string | number | null) => {
    if (!id) return setSelectedTask(null);
    try {
      const data = await budgetService.getBudget(String(id));
      const t = Array.isArray(data) ? data[0] : data;
      setSelectedTask({
        value: t.id,
        label: t.nama_budget,
        icon: Circle,
      });
    } catch {
      setSelectedTask({
        value: id as any,
        label: `Task #${id}`,
        icon: Circle,
      });
    }
  };

  // ======= geolocation background =======
  const getCurrentLocation = (): Promise<{ lat?: number; lon?: number }> =>
    new Promise((resolve, reject) => {
      const secure =
        typeof window !== "undefined" &&
        (window.isSecureContext ||
          /^https:\/\//.test(window?.location?.origin ?? ""));
      const isLocalhost =
        typeof window !== "undefined" &&
        /^(http:\/\/localhost|http:\/\/127\.0\.0\.1)/.test(
          window?.location?.origin ?? ""
        );
      if (!secure && !isLocalhost)
        return reject(new Error("Not secure context for geolocation"));
      if (!("geolocation" in navigator))
        return reject(new Error("Geolocation not supported"));

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });

  // ambil lokasi saat drawer dibuka + prefill OT
  useEffect(() => {
    if (!open) return;

    setLocStatus("loading");
    setLoc(null);
    getCurrentLocation()
      .then((L) => {
        setLoc(L);
        setLocStatus("ok");
      })
      .catch(() => setLocStatus("err"));

    if (isOvertime && overtimeData) {
      getProjectDetail(overtimeData.project_id);
      getTaskDetail(overtimeData.budget_id);
    } else if (!isOvertime) {
      getProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // reset task saat project regular berubah
  useEffect(() => {
    if (isOvertime) return; // OT tidak memicu fetch task regular
    setSelectedTask(null);
    setTasks([]);
    if (selectedProject?.value) getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject?.value, isOvertime]);

  // ======= derived =======
  const canPickTask = !!selectedProject?.value;
  const canOpenCamera = canPickTask && !!selectedTask?.value;

  const canCheckInRegular =
    !!selectedProject?.value && !!selectedTask?.value && !!photo && !!loc;

  const notYetAttendance = checkInStatus === false || !isCheckedIn;

  // Overtime: project & task dari overtimeData (prefill)
  const otProjectId = overtimeData?.project_id ?? selectedProject?.value;
  const otBudgetId = overtimeData?.budget_id ?? selectedTask?.value;

  const overtimeDone = !!isOvertime && !!overtimeFinish;
  const canClockOutOvertime =
    !!otProjectId && !!otBudgetId && !!photo && !!loc && !overtimeDone;

  // ======= HANDLE SUBMIT (FormData) =======
  async function handleSubmit(mode: "REGULAR" | "OVERTIME") {
    if (mode === "REGULAR" && !canCheckInRegular) {
      return Swal.fire({
        target: drawerContainerRef.current || document.body,
        icon: "warning",
        title: "Lengkapi Data",
        text: "Pilih proyek, task, ambil foto, dan aktifkan lokasi.",
        timer: 1600,
        showConfirmButton: false,
        position: "top-right",
        toast: true,
      });
    }
    if (mode === "OVERTIME" && !canClockOutOvertime) {
      return Swal.fire({
        target: drawerContainerRef.current || document.body,
        icon: "info",
        title: overtimeDone ? "Overtime sudah selesai" : "Lengkapi Data",
        text: overtimeDone
          ? "Tidak perlu clock-out lagi."
          : "Ambil foto terlebih dahulu dan pastikan lokasi aktif.",
        timer: 1600,
        showConfirmButton: false,
        position: "top-right",
        toast: true,
      });
    }

    const confirm = await Swal.fire({
      target: drawerContainerRef.current || document.body,
      icon: "question",
      title:
        mode === "OVERTIME"
          ? "Lakukan Clock-Out Lembur sekarang?"
          : "Lakukan Check-In sekarang?",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    let latitude: number | undefined = loc?.lat;
    let longitude: number | undefined = loc?.lon;
    try {
      const latest = await getCurrentLocation();
      latitude = latest.lat ?? latitude;
      longitude = latest.lon ?? longitude;
    } catch {
      /* keep existing */
    }

    const fd = new FormData();

    if (mode === "REGULAR") {
      fd.append("project_id", String(selectedProject!.value));
      fd.append("budget_id", String(selectedTask!.value));
      fd.append("type", "0"); // regular
      fd.append("location_in", "Default");
      fd.append("location_lat_in", latitude != null ? String(latitude) : "");
      fd.append("location_long_in", longitude != null ? String(longitude) : "");
      fd.append("image", dataURLtoFile(photo!, "checkin-photo.png"));
    } else {
      fd.append("project_id", String(otProjectId!));
      fd.append("budget_id", String(otBudgetId!));
      fd.append("type", "1"); // overtime
      fd.append("location_out", "Default");
      fd.append("location_lat_out", latitude != null ? String(latitude) : "");
      fd.append(
        "location_long_out",
        longitude != null ? String(longitude) : ""
      );
      fd.append("image", dataURLtoFile(photo!, "overtime-checkout-photo.png"));
    }

    try {
      setIsLoading(true);
      const res = await attendanceService.createAttendance(fd);

      Swal.fire({
        target: drawerContainerRef.current || document.body,
        icon: "success",
        title: res?.message ?? "Berhasil",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 1800,
      });

      if (mode === "REGULAR") onCheckIn?.();
      else onCheckOut?.();

      onOpenChange(false);
    } catch (e: any) {
      const raw = e?.response?.data?.message;
      let msgs: string[] = [];
      if (typeof raw === "string") msgs = [raw];
      else if (Array.isArray(raw)) msgs = raw;
      else if (typeof raw === "object" && raw) {
        for (const k in raw) {
          const v = raw[k];
          if (Array.isArray(v)) msgs.push(`${k}: ${v.join(", ")}`);
          else if (typeof v === "string") msgs.push(`${k}: ${v}`);
        }
      } else msgs = ["Terjadi kesalahan saat mengirim data."];

      Swal.fire({
        target: drawerContainerRef.current || document.body,
        icon: "error",
        title: "Gagal",
        html: msgs.join("<br/>"),
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2600,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        ref={drawerContainerRef}
        className={cn(
          "rounded-t-2xl mx-auto w-full",
          "h-[85vh] max-h-[85vh] flex flex-col"
        )}
      >
        {/* Header */}
        <DrawerHeader className="px-4 sm:px-6 md:px-8 pt-4 pb-2">
          <DrawerTitle className="text-base">
            {isOvertime
              ? overtimeDone
                ? "Overtime Selesai"
                : "Clock-Out Overtime"
              : notYetAttendance
              ? "Absen"
              : "Anda sudah Check-in"}
          </DrawerTitle>
        </DrawerHeader>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pb-6">
          {/* === REGULAR CHECK-IN === */}
          {!isOvertime && notYetAttendance && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kiri: Project & Task & Lokasi */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <Label className="mb-1">Pilih Proyek</Label>
                  <ComboboxPopoverCustom
                    data={projects}
                    selectedItem={selectedProject}
                    onSelect={setSelectedProject}
                    isOpen={openProjectCombo}
                    onOpenChange={setOpenProjectCombo}
                    placeholder="Cari Proyek"
                    onInputChange={(q) => getProjects(q)}
                    height="h-12 sm:h-10"
                  />
                </div>

                <div className="flex flex-col">
                  <Label className="mb-1">Pilih Task</Label>
                  <ComboboxPopoverCustom
                    data={tasks}
                    selectedItem={selectedTask}
                    onSelect={setSelectedTask}
                    isOpen={openTaskCombo}
                    onOpenChange={(v) =>
                      !!selectedProject?.value ? setOpenTaskCombo(v) : undefined
                    }
                    placeholder={
                      !!selectedProject?.value
                        ? "Cari Task"
                        : "Pilih proyek dulu"
                    }
                    onInputChange={(q) =>
                      !!selectedProject?.value ? getTasks(q) : undefined
                    }
                    height="h-12 sm:h-10"
                    isDisable={!selectedProject?.value}
                  />
                </div>

                {/* Lokasi ringkas */}
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <MapPin className="size-4" />
                  {/* {locStatus === "ok" && loc
                    ? `Lokasi siap (${loc.lat?.toFixed(4)}, ${loc.lon?.toFixed(
                        4
                      )})`
                    : locStatus === "loading"
                    ? "Mengambil lokasi…"
                    : "Lokasi tidak tersedia (periksa izin)"} */}
                  {locStatus === "err" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => {
                        setLocStatus("loading");
                        getCurrentLocation()
                          .then((L) => {
                            setLoc(L);
                            setLocStatus("ok");
                          })
                          .catch(() => setLocStatus("err"));
                      }}
                    >
                      Coba Lagi
                    </Button>
                  )}
                </div>
              </div>

              {/* Kanan: Kamera */}
              <RightCameraBlock
                photo={photo}
                setPhoto={setPhoto}
                isCameraOpen={isCameraOpen}
                setIsCameraOpen={setIsCameraOpen}
                canOpenCamera={
                  !!selectedProject?.value && !!selectedTask?.value
                }
                warnTarget={drawerContainerRef as RefObject<HTMLDivElement>}
              />
            </div>
          )}

          {/* === OVERTIME MODE === */}
          {isOvertime && (
            <div className="space-y-4">
              {overtimeDone ? (
                <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-emerald-800 text-sm">
                  <b>Overtime sudah selesai.</b> Clock-out lembur telah
                  tercatat. Terima kasih.
                </div>
              ) : (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-800 text-sm">
                  <b>Overtime aktif</b> — dimulai otomatis pukul <b>17:00</b>.
                  Silakan lakukan <b>Clock-Out Overtime</b> saat selesai.
                </div>
              )}

              {/* Project & Task (prefilled readonly) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <Label className="mb-1">Proyek (Overtime)</Label>
                    <ComboboxPopoverCustom
                      data={projects}
                      selectedItem={selectedProject || null}
                      onSelect={() => {}}
                      isOpen={false}
                      onOpenChange={() => {}}
                      placeholder="Proyek lembur"
                      height="h-12 sm:h-10"
                      isDisable
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label className="mb-1">Task (Overtime)</Label>
                    <ComboboxPopoverCustom
                      data={tasks}
                      selectedItem={selectedTask || null}
                      onSelect={() => {}}
                      isOpen={false}
                      onOpenChange={() => {}}
                      placeholder="Task lembur"
                      height="h-12 sm:h-10"
                      isDisable
                    />
                  </div>
                </div>

                {/* Lokasi */}
                {/* <div className="flex flex-col justify-end">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <MapPin className="size-4" />
                    {locStatus === "ok" && loc
                      ? `Lokasi siap (${loc.lat?.toFixed(
                          4
                        )}, ${loc.lon?.toFixed(4)})`
                      : locStatus === "loading"
                      ? "Mengambil lokasi…"
                      : "Lokasi tidak tersedia (periksa izin)"}
                  </div>
                </div> */}
              </div>

              <RightCameraBlock
                photo={photo}
                setPhoto={setPhoto}
                isCameraOpen={isCameraOpen}
                setIsCameraOpen={setIsCameraOpen}
                canOpenCamera={!overtimeDone}
                warnTarget={drawerContainerRef as RefObject<HTMLDivElement>}
                disabledReason={
                  overtimeDone ? "Overtime sudah selesai" : undefined
                }
              />
            </div>
          )}

          {!isOvertime && !notYetAttendance && (
            <div
              className={cn(
                "rounded-xl border p-4 sm:p-5 mt-2 transition-all duration-300",
                overtimeFinish
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-sky-300 bg-sky-50 text-sky-800"
              )}
            >
              <div className="flex items-start sm:items-center gap-3">
                {overtimeFinish ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 sm:h-7 sm:w-7 text-sky-600 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 4h10M5 11h14m-7 4v6m0 0H8m4 0h4"
                    />
                  </svg>
                )}

                <div>
                  <p className="font-medium text-base sm:text-lg mb-1">
                    {overtimeFinish
                      ? "Check-Out Lembur Selesai"
                      : "Kamu Sudah Check-In"}
                  </p>
                  <p className="text-sm sm:text-[15px] opacity-80 leading-relaxed">
                    {overtimeFinish
                      ? "Kamu telah menyelesaikan lembur hari ini. Terima kasih atas kerja kerasmu!"
                      : "Silakan lanjutkan pekerjaanmu. Jangan lupa check-out saat hari kerja berakhir."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky bottom CTA: Regular */}
        {!isOvertime && notYetAttendance && (
          <div className="sticky bottom-0 inset-x-0 bg-background/80 backdrop-blur border-t px-4 sm:px-6 md:px-8 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
            <Button
              onClick={() => handleSubmit("REGULAR")}
              disabled={disableCheckIn || !canCheckInRegular}
              className="w-full h-12 bg-iprimary-blue hover:bg-iprimary-blue-tertiary"
            >
              <LogIn className="mr-2 size-4" />
              Check In
            </Button>
          </div>
        )}

        {/* Sticky bottom CTA: Overtime */}
        {isOvertime && (
          <div className="sticky bottom-0 inset-x-0 bg-background/80 backdrop-blur border-t px-4 sm:px-6 md:px-8 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
            <Button
              onClick={() => handleSubmit("OVERTIME")}
              disabled={!canClockOutOvertime}
              variant={overtimeDone ? "outline" : "default"}
              className={cn(
                "w-full h-12",
                overtimeDone
                  ? "cursor-not-allowed opacity-70"
                  : "bg-iprimary-blue hover:bg-iprimary-blue-tertiary"
              )}
            >
              {overtimeDone ? "Overtime Selesai" : "Clock-Out Overtime"}
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

/** Kartu kamera reusable (dipakai di regular & overtime) */
function RightCameraBlock({
  photo,
  setPhoto,
  isCameraOpen,
  setIsCameraOpen,
  canOpenCamera,
  warnTarget,
  disabledReason,
}: {
  photo: string | null;
  setPhoto: (v: string | null) => void;
  isCameraOpen: boolean;
  setIsCameraOpen: (v: boolean) => void;
  canOpenCamera: boolean;
  warnTarget?: React.RefObject<HTMLElement>;
  disabledReason?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      <div className="w-full rounded border overflow-hidden">
        <div className="relative w-full aspect-[4/3] bg-muted/30">
          {photo ? (
            <img
              src={photo}
              alt="Captured"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Belum Ada Gambar
            </div>
          )}
        </div>
      </div>

      {photo ? (
        <div className="flex w-full gap-2">
          <Button
            onClick={() => setPhoto(null)}
            variant="destructive"
            className="h-12 md:h-10 text-base md:text-sm flex-1"
          >
            Hapus Gambar
          </Button>
          <Button
            onClick={() =>
              canOpenCamera
                ? setIsCameraOpen(true)
                : Swal.fire({
                    target: (warnTarget?.current as any) || document.body,
                    icon: "info",
                    title: disabledReason ?? "Aksi tidak tersedia",
                    timer: 1400,
                    toast: true,
                    showConfirmButton: false,
                    position: "top-right",
                  })
            }
            disabled={!canOpenCamera}
            variant="outline"
            className="h-12 md:h-10 text-base md:text-sm flex-1 gap-2"
          >
            <Camera className="w-4 h-4" /> Ganti Gambar
          </Button>
        </div>
      ) : (
        <Button
          onClick={() =>
            canOpenCamera
              ? setIsCameraOpen(true)
              : Swal.fire({
                  target: (warnTarget?.current as any) || document.body,
                  icon: "info",
                  title: disabledReason ?? "Pilih data yang diperlukan dulu",
                  timer: 1400,
                  toast: true,
                  showConfirmButton: false,
                  position: "top-right",
                })
          }
          disabled={!canOpenCamera}
          variant="outline"
          className="h-12 md:h-10 text-base md:text-sm w-full gap-2"
        >
          <Camera className="w-4 h-4" /> Buka Kamera
        </Button>
      )}

      <CameraCaptureModal
        open={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => setPhoto(img)}
      />
    </div>
  );
}
