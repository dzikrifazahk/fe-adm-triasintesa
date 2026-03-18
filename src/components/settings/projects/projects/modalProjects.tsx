import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  contactService,
  projectService,
  userService,
  operationService,
} from "@/services";
import {
  Circle,
  MapPin,
  Plus,
  Search,
  Users,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import { IContact } from "@/types/contact";
import { Checkbox } from "@/components/ui/checkbox";
import { IUser, IUserSelect } from "@/types/user";
import { IAddProject, IProject } from "@/types/project";
import Swal from "sweetalert2";
import { useCurrencyInput } from "@/utils/useCurrency";
import axios from "axios";
import { Modal } from "@/components/custom/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FaAddressBook, FaAlignJustify, FaClock } from "react-icons/fa6";
import MapSsr from "@/components/custom/Maps/Map";
import { IAddOperation, IOperation } from "@/types/operation";
import { TimePicker } from "@/components/custom/timePicker";
import { convertToDate } from "@/utils/convertHHMMSS";
import { useLoading } from "@/context/loadingContext";
import { Textarea } from "@/components/ui/textarea";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

interface ModalProjectsProps {
  isOpen: boolean;
  title: string;
  detailData?: IProject | null;
  modalType: "create" | "edit";
  onClose: () => void;
  isGetData: (tableModal: string) => void;
  isLoading: boolean;
}

type LocationDraft = {
  name: string;
  is_default: boolean;
  radius: string;
  latitude: number;
  longitude: number;
};

type OpMode = "existing" | "new";

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const formatTimeFromUtc = (time?: string | null) => {
  if (!time) return "-";

  const [h, m, s] = time.split(":").map(Number);
  const utcDate = new Date(Date.UTC(1970, 0, 1, h ?? 0, m ?? 0, s ?? 0));

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const zoned = toZonedTime(utcDate, tz);

  return format(zoned, "HH:mm:ss");
};

const formatTimeInTz = (value?: string | Date | null) => {
  if (!value) return "00:00:00";

  if (typeof value === "string" && /^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  try {
    const zoned = toZonedTime(value, tz);
    return format(zoned, "HH:mm:ss");
  } catch {
    return typeof value === "string" ? value : "00:00:00";
  }
};

export const ModalProjects = ({
  isOpen,
  title,
  onClose,
  modalType,
  isGetData,
  detailData,
  isLoading,
}: ModalProjectsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setIsLoading } = useLoading();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const totalSteps = 3;
  const nextStep = () =>
    setCurrentStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  const prevStep = () =>
    setCurrentStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));

  const [clients, setClients] = useState<ComboboxItem<IContact>[]>([]);
  // const [users, setUsers] = useState<IUser[]>([]);
  // const [checkedUsers, setCheckedUsers] = useState<Set<string>>(new Set());
  const [projectType, setProjectType] = useState<string>("");
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ComboboxItem<{
    id: string;
    name: string;
  }> | null>(null);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [isDocumentNumberDisabled, setIsDocumentNumberDisabled] =
    useState(false);

  let {
    value: billing,
    formattedValueNumeric: billingFormatted,
    handleChange: handleBillingChange,
    setValue: setBilling,
  } = useCurrencyInput();

  let {
    value: costEstimate,
    formattedValueNumeric: costEstimateFormatted,
    handleChange: handleCostEstimateChange,
    setValue: setCostEstimate,
  } = useCurrencyInput();

  let { value: margin, setValue: setMargin } = useCurrencyInput();

  let {
    value: wholesale,
    formattedValueNumeric: wholesaleFormatted,
    handleChange: handleWholesaleChange,
    setValue: setWholesale,
  } = useCurrencyInput();

  const [percent, setPercent] = useState<number | undefined>(0);
  const [isWholesale, setIsWholesale] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  const [employee, setEmployee] = useState<IUserSelect[]>([]);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<IUserSelect[]>([]);
  const usersArray = selectedEmployees.map((e) => e.id);
  const [userLocationMap, setUserLocationMap] = useState<
    Record<string, string>
  >({});

  const filteredEmployees: IUserSelect[] = employee
    .filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
        (typeof emp.role === "string" &&
          emp.role.toLowerCase().includes(searchEmployee.toLowerCase()))
    )
    .map((emp) => ({
      id: emp.id,
      name: emp.name,
      role: emp.role ?? "-",
    }));

  const addEmployee = (e: IUserSelect) => {
    if (!selectedEmployees.find((x) => x.id === e.id)) {
      setSelectedEmployees((prev) => [...prev, e]);
      setUserLocationMap((prev) => ({ ...prev, [e.id as string]: "none" }));
    }
    setSearchEmployee("");
  };

  const removeEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
    setUserLocationMap((prev) => {
      const n = { ...prev };
      delete n[employeeId];
      return n;
    });
  };

  const [locationsDraft, setLocationsDraft] = useState<LocationDraft[]>([]);
  const [locName, setLocName] = useState("");
  const [locRadius, setLocRadius] = useState("");
  const [locIsDefault, setLocIsDefault] = useState(false);
  const [locMarker, setLocMarker] = useState<[number, number] | null>(null);
  const [locLat, setLocLat] = useState<number | null>(null);
  const [locLng, setLocLng] = useState<number | null>(null);
  const [editingLocIndex, setEditingLocIndex] = useState<number | null>(null);

  // --------- Operational hours mode/list/selection ----------
  const [opMode, setOpMode] = useState<OpMode>("existing"); // default existing
  const [operations, setOperations] = useState<IOperation[]>([]);
  const [selectedExistingOpId, setSelectedExistingOpId] = useState<string>("");

  // --------- Time pickers untuk jam operasional BARU ----------
  const toHMS = (d?: Date) =>
    d instanceof Date && !isNaN(d.getTime())
      ? `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`
      : "00:00:00";

  const [ontimeStart, setOntimeStart] = useState<Date | undefined>(
    convertToDate("00:00:00")
  );
  const [ontimeEnd, setOntimeEnd] = useState<Date | undefined>(
    convertToDate("00:00:00")
  );
  const [lateTime, setLateTime] = useState<Date | undefined>(
    convertToDate("00:00:00")
  );
  const [offTime, setOffTime] = useState<Date | undefined>(
    convertToDate("00:00:00")
  );

  const [operationalHourId, setOperationalHourId] = useState<string>("");

  const clearLocForm = () => {
    setLocName("");
    setLocRadius("");
    setLocIsDefault(false);
    setLocMarker(null);
    setLocLat(null);
    setLocLng(null);
    setEditingLocIndex(null);
  };

  const upsertLocation = () => {
    if (!locName.trim() || !locRadius || locLat == null || locLng == null) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi lokasi",
        text: "Nama, radius, dan titik peta wajib diisi.",
        timer: 1600,
        showConfirmButton: false,
        toast: true,
        position: "top-right",
      });
      return;
    }

    const payload: LocationDraft = {
      name: locName.trim(),
      radius: String(locRadius),
      is_default: locIsDefault,
      latitude: locLat,
      longitude: locLng,
    };

    setLocationsDraft((prev) => {
      let next = [...prev];

      if (editingLocIndex != null) {
        next[editingLocIndex] = payload;
      } else {
        next.push(payload);
      }

      if (payload.is_default) {
        next = next.map((l, idx) => ({
          ...l,
          is_default:
            editingLocIndex != null
              ? idx === editingLocIndex
              : idx === next.length - 1,
        }));
      }

      return next;
    });

    clearLocForm();
  };

  const editLocation = (idx: number) => {
    const l = locationsDraft[idx];
    setEditingLocIndex(idx);
    setLocName(l.name);
    setLocRadius(l.radius);
    setLocIsDefault(l.is_default);
    setLocLat(l.latitude);
    setLocLng(l.longitude);
    setLocMarker([l.latitude, l.longitude]);
  };

  const deleteLocation = (idx: number) => {
    Swal.fire({
      title: "Hapus lokasi dari draft?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    }).then((r) => {
      if (r.isConfirmed) {
        setLocationsDraft((prev) => prev.filter((_, i) => i !== idx));
        setUserLocationMap((prev) => {
          const n: Record<string, string> = {};
          Object.entries(prev).forEach(([uid, locIdx]) => {
            if (locIdx === String(idx)) n[uid] = "none";
            else if (locIdx !== "none") {
              const curr = Number(locIdx);
              n[uid] = curr > idx ? String(curr - 1) : String(curr);
            } else n[uid] = "none";
          });
          return n;
        });
        if (editingLocIndex === idx) clearLocForm();
      }
    });
  };

  useEffect(() => {
    setIsModalOpen(isOpen);
    if (!isOpen) return;

    const fetchInit = async () => {
      getClients();
      // getUsers();
      getEmployee();

      try {
        const filter: any = { request_status_owner: 2 };
        const { data } = await operationService.getOperations(filter);
        const list: IOperation[] = Array.isArray(data) ? data : [];
        setOperations(list);
        if (!selectedExistingOpId && list.length > 0) {
          const firstId = String(
            (list[0] as any).id ?? (list[0] as any)._id ?? ""
          );
          setSelectedExistingOpId(firstId);
        }
      } catch {
        setOperations([]);
      }

      if (modalType === "edit" && detailData) {
        setId(detailData.id);
        setName(detailData.name);
        setDate(detailData.date);
        setBilling(detailData.billing);
        setCostEstimate(detailData.cost_estimate);
        setProjectType(detailData?.type_projects?.id ?? "");
        setSelectedClient({
          value: detailData?.client?.id ?? "-",
          label: detailData?.client?.name ?? "-",
          icon: Circle,
        });
        setPercent(detailData.percent);
        setMargin(detailData.margin);
        setDocumentNumber(detailData.no_dokumen_project ?? "");
        setIsDocumentNumberDisabled(!!detailData.no_dokumen_project);
        if (detailData.harga_type_project > 0) {
          setIsWholesale(true);
          setWholesale(String(detailData.harga_type_project));
        } else {
          setIsWholesale(false);
        }

        const existingId = String(
          (detailData as any).operational_hour_id ??
            (detailData as any).operationalHourId ??
            ""
        );
        if (existingId) {
          setOpMode("existing");
          setSelectedExistingOpId(existingId);
        } else {
          setOpMode("existing");
        }
        setOperationalHourId("");
      } else {
        // create: default pakai existing
        setOpMode("existing");
        setOperationalHourId("");
      }
      setCurrentStep(1);
    };

    fetchInit();
  }, [isOpen]);

  // Hitung margin/percent otomatis
  useEffect(() => {
    if (billing && costEstimate) {
      const b = Number(billing) || 0;
      const c = Number(costEstimate) || 0;
      if (b === 0) {
        setMargin("0");
        setPercent(0);
        return;
      }
      const m = b - c;
      const p = Number(((m / (b || 1)) * 100).toFixed(2));
      setMargin(String(m));
      setPercent(p);
    }
  }, [billing, costEstimate, setMargin]);

  const getClients = async (search?: string) => {
    const filter = search
      ? { search: search, contact_type: 2 }
      : { contact_type: 2 };
    const { data } = await contactService.getAllContacts(filter);
    setClients(
      data.map((e: IContact) => ({
        value: e.id,
        label: e.name,
        icon: Circle,
      }))
    );
  };

  // const getUsers = async () => {
  //   const { data } = await userService.getAllUsers();
  //   setUsers(data);
  // };

  const getEmployee = async () => {
    const { data } = await userService.getUsers();
    setEmployee(data);
  };

  const handleAttachmentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const f = event.target.files?.[0];
    if (!f) return;
    if (!allowedTypes.includes(f.type)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        position: "top-right",
        toast: true,
        text: "Hanya PDF, JPG, JPEG, PNG, HEIC, atau XLSX.",
      });
      return;
    }
    setFile(f);
  };

  // ------------ VALIDATION PER STEP ------------
  const canGoNext = useMemo(() => {
    if (currentStep === 1) {
      if (!name.trim() || !date || !selectedClient?.value) return false;
      if (isDocumentNumberDisabled && !documentNumber.trim()) return false;
      if (opMode === "existing" && !selectedExistingOpId) return false;
      return true;
    }
    if (currentStep === 2) {
      return locationsDraft.length > 0;
    }
    return true;
  }, [
    currentStep,
    name,
    date,
    selectedClient,
    isDocumentNumberDisabled,
    documentNumber,
    locationsDraft.length,
    opMode,
    selectedExistingOpId,
  ]);

  // ------------ SUBMIT ------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 3) {
      if (!canGoNext) {
        Swal.fire({
          icon: "warning",
          title: "Lengkapi data",
          text:
            currentStep === 1
              ? "Isi Project Information dengan lengkap."
              : "Tambahkan minimal 1 lokasi.",
          toast: true,
          showConfirmButton: false,
          timer: 1800,
          position: "top-right",
        });
        return;
      }
      nextStep();
      return;
    }

    // 0) Konfirmasi DULU
    const confirmText =
      modalType === "create"
        ? "Apakah anda ingin menambahkan Proyek?"
        : "Apakah anda ingin mengubah Proyek?";

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const result = await Swal.fire({
      icon: "warning",
      text: confirmText,
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    });

    if (!result.isConfirmed) {
      Swal.fire({
        icon: "warning",
        title: "Dibatalkan",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const formData = new FormData();

    try {
      setIsLoading(true);

      // 1) Tentukan operational_hour_id sesuai mode
      let finalOperationalHourId = "";

      if (opMode === "new") {
        const opPayload: IAddOperation = {
          ontime_start: toHMS(ontimeStart),
          ontime_end: toHMS(ontimeEnd),
          late_time: toHMS(lateTime),
          offtime: toHMS(offTime),
          timezone: tz,
        };

        const opRes = await operationService.createOperation(opPayload);
        finalOperationalHourId =
          opRes?.data?.id ||
          opRes?.data?.operation?.id ||
          opRes?.data?.data?.id ||
          opRes?.id ||
          "";

        if (!finalOperationalHourId) {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: "Gagal membuat Jam Operasional",
            text: "ID jam operasional tidak ditemukan dari response API.",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2500,
          });
          return;
        }
      } else {
        if (!selectedExistingOpId) {
          setIsLoading(false);
          Swal.fire({
            icon: "warning",
            title: "Pilih Jam Operasional",
            text: "Silakan pilih salah satu jam operasional yang sudah ada.",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
          return;
        }
        finalOperationalHourId = selectedExistingOpId;
      }

      setOperationalHourId(String(finalOperationalHourId));

      // 2) Susun payload Project
      const payload: IAddProject = {
        client_id: String(selectedClient?.value),
        name,
        date,
        billing: Number(billing) ?? 0,
        cost_estimate: Number(costEstimate) ?? 0,
        margin: Number(margin) ?? 0,
        percent: percent ? percent : 0,
        harga_type_project: Number(wholesale) ?? 0,
        type_projects: projectType,
        no_dokumen_project: documentNumber ?? "",
        operational_hour_id: String(finalOperationalHourId),
      };

      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      if (isWholesale && wholesale) {
        payload.harga_type_project = Number(wholesale);
      }
      if (file) {
        formData.append("attachment_file", file);
      }

      // 3) Create / Update project
      let projectIdFinal = id;
      let successMessage = "";

      if (modalType === "create") {
        const response = await projectService.createProject(formData);
        projectIdFinal =
          response?.data?.id || response?.data?.project?.id || "";
        successMessage = response.message;
      } else {
        const response = await projectService.updateProject(id, formData);
        if (response.status_code === 200) {
          successMessage = response.message;
        }
      }

      // 4) Tambah lokasi + assignment
      if (projectIdFinal && locationsDraft.length > 0) {
        for (let i = 0; i < locationsDraft.length; i++) {
          const l = locationsDraft[i];
          const locRes = await projectService.addProjectLocation({
            project_id: projectIdFinal,
            name: l.name,
            radius: l.radius,
            is_default: l.is_default,
            latitude: String(l.latitude),
            longitude: String(l.longitude),
          });

          const locationId = locRes?.data?.id;
          if (locationId) {
            const usersForThisLocation = selectedEmployees.filter(
              (emp) => userLocationMap[emp.id as string] === String(i)
            );

            if (usersForThisLocation.length > 0) {
              const formAssign = new FormData();
              formAssign.append("project_id", projectIdFinal);
              formAssign.append("location_id", locationId);

              usersForThisLocation.forEach((user) => {
                formAssign.append("user_id[]", String(user.id));
              });

              await projectService.setUsersAndLocationProject(formAssign);
            }
          }
        }
      }

      setIsLoading(false);

      Swal.fire({
        icon: "success",
        title: successMessage || "Proyek berhasil disimpan",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });

      isGetData("project");
      onClose();
    } catch (e) {
      setIsLoading(false);

      if (axios.isAxiosError(e)) {
        const errorMessages: string[] = [];
        const message = e.response?.data?.message;
        if (message) {
          for (const field in message) {
            if (Object.prototype.hasOwnProperty.call(message, field)) {
              errorMessages.push(`${field}: ${message[field].join(", ")}`);
            }
          }
        }
        Swal.fire({
          icon: "error",
          title: `Terjadi Kesalahan${
            errorMessages.length > 0 ? ": " + errorMessages.join(", ") : ""
          }`,
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2500,
        });
      }
    }
  };

  // ------------ UI HELPERS ------------
  const StepBadge = ({ index, label }: { index: number; label: string }) => {
    const active = currentStep === index;
    const done = currentStep > index;
    return (
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex items-center justify-center w-8 h-8 rounded-full border",
            active ? "bg-iprimary-blue text-white " : "",
            done ? "bg-emerald-500 text-white border-emerald-500" : "",
            !active && !done ? "bg-muted text-foreground/70 border-muted" : "",
          ].join(" ")}
        >
          {done ? <CheckCircle2 className="w-5 h-5" /> : index}
        </div>
        <div
          className={[
            "text-sm font-medium",
            active ? "text-foreground" : "text-foreground/70",
          ].join(" ")}
        >
          {label}
        </div>
      </div>
    );
  };

  const Stepper = () => (
    <div className="w-full px-4 md:px-8">
      <div className="flex items-center justify-between">
        <StepBadge index={1} label="Project Information" />
        <div className="flex-1 h-px bg-border mx-2 md:mx-4" />
        <StepBadge index={2} label="Locations" />
        <div className="flex-1 h-px bg-border mx-2 md:mx-4" />
        <StepBadge index={3} label="Users & Assignment" />
      </div>
    </div>
  );

  return (
    <>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={onClose}
          title={title}
          onSubmit={handleSubmit}
          onCancel={onClose}
          showConfirmButton={false}
          closeOnBackdropClick={false}
        >
          <div className="w-full space-y-6 p-4 px-6 md:px-8">
            {/* STEPPER */}
            <Card>
              <CardHeader>
                <CardTitle>Setup Proyek</CardTitle>
                <CardDescription>
                  Lengkapi langkah-langkah berikut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Stepper />
              </CardContent>
            </Card>

            {/* STEP 1: PROJECT INFORMATION */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FaAddressBook className="w-5 h-5" />
                      Nomor Dokumen
                    </CardTitle>
                    <CardDescription>
                      Sisipkan Nomor Dokumen Manual
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <section className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="disable-checkbox"
                          checked={isDocumentNumberDisabled}
                          onCheckedChange={(val) =>
                            setIsDocumentNumberDisabled(!!val)
                          }
                        />
                        <label htmlFor="disable-checkbox" className="text-sm">
                          Tambahkan Nomor Dokumen Manual
                        </label>
                      </div>
                      {isDocumentNumberDisabled && (
                        <div className="w-full sm:w-[300px] space-y-1">
                          <label
                            htmlFor="docNum"
                            className="text-sm font-medium"
                          >
                            Nomor Dokumen
                          </label>
                          <Input
                            id="docNum"
                            type="text"
                            value={documentNumber}
                            onChange={(e) => setDocumentNumber(e.target.value)}
                            placeholder="Nomor Dokumen"
                            required
                          />
                        </div>
                      )}
                    </section>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FaAlignJustify className="w-5 h-5" />
                      Informasi Proyek
                    </CardTitle>
                    <CardDescription>Detail Informasi Proyek</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <section className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium">
                            Nama Proyek <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama Proyek"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium">
                            Tanggal <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-1 col-span-full lg:col-span-1">
                          <label className="text-sm font-medium">
                            Pilih Klien <span className="text-red-500">*</span>
                          </label>
                          <ComboboxPopoverCustom
                            data={clients}
                            selectedItem={selectedClient}
                            onSelect={setSelectedClient}
                            isOpen={isPopoverOpen}
                            onOpenChange={setPopoverOpen}
                            placeholder="Cari Klien"
                            onInputChange={(q) => getClients(q)}
                            height="h-10"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium">Billing</label>
                          <Input
                            value={billingFormatted}
                            onChange={handleBillingChange}
                            placeholder="Billing"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium">
                            Lampiran
                          </label>
                          <Input
                            type="file"
                            accept=".pdf, .jpeg, .jpg, .png, .xlsx, .heic"
                            onChange={handleAttachmentChange}
                          />
                        </div>
                      </div>
                    </section>
                  </CardContent>
                </Card>

                {/* ===== Jam Operasional: Existing vs New ===== */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FaClock className="w-5 h-5" />
                      Jam Operasional Proyek
                    </CardTitle>
                    <CardDescription>
                      Pakai yang sudah ada atau buat baru
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Toggle mode */}
                    <div className="flex items-center gap-6">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="opMode"
                          value="existing"
                          checked={opMode === "existing"}
                          onChange={() => setOpMode("existing")}
                        />
                        <span>Pakai jam operasional yang sudah ada</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="opMode"
                          value="new"
                          checked={opMode === "new"}
                          onChange={() => setOpMode("new")}
                        />
                        <span>Buat jam operasional baru</span>
                      </label>
                    </div>

                    {opMode === "existing" ? (
                      <>
                        {/* Table + single select */}
                        <div className="rounded-md border overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/40">
                              <tr className="text-left">
                                <th className="p-3 w-10">Pilih</th>
                                <th className="p-3">On Time Start</th>
                                <th className="p-3">On Time End</th>
                                <th className="p-3">Late Time</th>
                                <th className="p-3">Off Time</th>
                                <th className="p-3">Projects</th>
                              </tr>
                            </thead>
                            <tbody>
                              {operations.length === 0 ? (
                                <tr>
                                  <td
                                    className="p-3 text-center text-muted-foreground"
                                    colSpan={5}
                                  >
                                    Tidak ada data jam operasional.
                                  </td>
                                </tr>
                              ) : (
                                operations.map((op) => {
                                  const id = String(
                                    (op as any).id ?? (op as any)._id ?? ""
                                  );

                                  const onS = formatTimeFromUtc(
                                    (op as any).ontime_start
                                  );
                                  const onE = formatTimeFromUtc(
                                    (op as any).ontime_end
                                  );
                                  const l = formatTimeFromUtc(
                                    (op as any).late_time
                                  );
                                  const off = formatTimeFromUtc(
                                    (op as any).offtime
                                  );

                                  const projectNames = (() => {
                                    if (
                                      !Array.isArray(op.projects) ||
                                      op.projects.length === 0
                                    )
                                      return "-";
                                    const names = op.projects
                                      .map((p: any) =>
                                        typeof p === "string"
                                          ? p.trim()
                                          : (p?.name ?? "").trim()
                                      )
                                      .filter(Boolean);
                                    if (names.length === 0) return "-";
                                    return [...new Set(names)].join(", ");
                                  })();

                                  return (
                                    <tr key={id} className="border-t">
                                      <td className="p-3">
                                        <input
                                          type="radio"
                                          name="opExisting"
                                          checked={selectedExistingOpId === id}
                                          onChange={() =>
                                            setSelectedExistingOpId(id)
                                          }
                                        />
                                      </td>
                                      <td className="p-3 font-mono">{onS}</td>
                                      <td className="p-3 font-mono">{onE}</td>
                                      <td className="p-3 font-mono">{l}</td>
                                      <td className="p-3 font-mono">{off}</td>
                                      <td
                                        className="p-3 font-mono max-w-[260px] truncate"
                                        title={projectNames}
                                      >
                                        <Textarea
                                          defaultValue={projectNames}
                                          readOnly
                                          disabled
                                          className="min-h-10 "
                                        />
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Pilih salah satu konfigurasi jam operasional yang
                          tersedia.
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Time Pickers untuk jam operasional BARU */}
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 border p-5 rounded-lg">
                          <div className="flex flex-col gap-1">
                            <Label>On Time Start</Label>
                            <TimePicker
                              date={ontimeStart}
                              setDate={setOntimeStart}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label>On Time End</Label>
                            <TimePicker
                              date={ontimeEnd}
                              setDate={setOntimeEnd}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label>Late Time</Label>
                            <TimePicker date={lateTime} setDate={setLateTime} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label>Off Time</Label>
                            <TimePicker date={offTime} setDate={setOffTime} />
                          </div>

                          <div className="md:col-span-2 text-xs text-muted-foreground">
                            Jam di atas akan{" "}
                            <b>dibuat sebagai Jam Operasional baru</b> saat
                            menyimpan proyek.
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* STEP 2: LOCATIONS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Tambah Lokasi Proyek
                    </CardTitle>
                    <CardDescription>
                      Buat satu atau lebih lokasi untuk proyek ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Nama Lokasi <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={locName}
                          onChange={(e) => setLocName(e.target.value)}
                          placeholder="Contoh: Gudang Timur"
                        />

                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={locIsDefault}
                            onCheckedChange={(v) => setLocIsDefault(!!v)}
                          />
                          <span>Jadikan lokasi utama</span>
                        </div>

                        <Label className="text-sm font-medium">
                          Radius <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-40"
                            value={locRadius}
                            onChange={(e) => setLocRadius(e.target.value)}
                            placeholder="Km"
                          />
                          <span className="font-semibold">KM</span>
                        </div>

                        {locMarker && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-sm font-medium">
                                Latitude
                              </Label>
                              <Input value={String(locLat)} disabled />
                            </div>
                            <div>
                              <Label className="text-sm font-medium">
                                Longitude
                              </Label>
                              <Input value={String(locLng)} disabled />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={upsertLocation}
                            className="w-full bg-iprimary-blue hover:bg-iprimary-blue-tertiary cursor-pointer"
                          >
                            {editingLocIndex != null
                              ? "Update Lokasi"
                              : "Tambah ke Daftar"}
                          </Button>
                          {editingLocIndex != null && (
                            <Button
                              type="button"
                              onClick={clearLocForm}
                              variant="secondary"
                              className="w-full"
                            >
                              Batal Edit
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="font-bold text-sm">
                          Pilih titik di peta
                        </Label>
                        <Label className="text-sm text-gray-500">
                          Klik pada peta untuk memilih lokasi
                        </Label>
                        <div className="rounded-md overflow-hidden border">
                          <MapSsr
                            marker={locMarker}
                            setMarker={setLocMarker}
                            onLocationSelect={(latitude, longitude) => {
                              setLocLat(latitude);
                              setLocLng(longitude);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Daftar Lokasi</CardTitle>
                    <CardDescription>
                      Lokasi yang akan disimpan untuk proyek ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {locationsDraft.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-6 border rounded-lg text-center text-muted-foreground">
                        <MapPin className="h-8 w-8 mb-2" />
                        <p className="text-sm font-medium">Belum ada lokasi</p>
                        <p className="text-xs">Tambahkan minimal satu lokasi</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {locationsDraft.map((l, idx) => (
                          <Card
                            key={idx}
                            className={l.is_default ? "border-emerald-500" : ""}
                          >
                            <CardHeader className="flex flex-row items-center justify-between">
                              <div>
                                <CardTitle className="text-sm font-bold">
                                  {l.name}{" "}
                                  {l.is_default && (
                                    <span className="text-emerald-600 text-xs font-medium">
                                      (utama)
                                    </span>
                                  )}
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                  {l.radius} KM
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => editLocation(idx)}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => deleteLocation(idx)}
                                  className="cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="grid gap-1 text-xs text-muted-foreground">
                              <div>
                                Lat/Long: {l.latitude} / {l.longitude}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* STEP 3: USERS & ASSIGNMENT */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Tim Proyek & Penempatan Lokasi
                    </CardTitle>
                    <CardDescription>
                      Pilih karyawan dan tentukan lokasi kerjanya
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Cari karyawan berdasarkan nama atau role..."
                        value={searchEmployee}
                        onChange={(e) => setSearchEmployee(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {searchEmployee && (
                      <div className="border rounded-lg max-h-48 overflow-y-auto">
                        {filteredEmployees.length > 0 ? (
                          filteredEmployees.map((emp) => (
                            <div
                              key={emp.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                              onClick={() => addEmployee(emp)}
                            >
                              <div>
                                <div className="font-medium">{emp.name}</div>
                                <div className="text-sm text-gray-500">
                                  {emp.role}
                                </div>
                              </div>
                              <Plus className="w-4 h-4 text-gray-400" />
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            Tidak ada karyawan yang ditemukan
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected & Assignment */}
                    <div className="space-y-2">
                      <Label>
                        Karyawan Terpilih ({selectedEmployees.length})
                      </Label>
                      {selectedEmployees.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          Belum ada karyawan yang dipilih
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedEmployees.map((emp) => (
                            <div
                              key={emp.id}
                              className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 bg-blue-50 rounded-lg"
                            >
                              <div>
                                <div className="font-medium">{emp.name}</div>
                                <div className="text-sm text-gray-600">
                                  {emp.role}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="w-[240px]">
                                  {/* pilih lokasi penempatan */}
                                  <select
                                    className="w-full border rounded-md h-10 px-3 text-sm bg-white"
                                    value={
                                      userLocationMap[emp.id ?? "default-id"]
                                    }
                                    onChange={(e) =>
                                      setUserLocationMap((prev) => ({
                                        ...prev,
                                        [emp.id as string]: e.target.value,
                                      }))
                                    }
                                  >
                                    <option value="none">
                                      — Tidak ditempatkan —
                                    </option>
                                    {locationsDraft.map((l, idx) => (
                                      <option key={idx} value={String(idx)}>
                                        {l.name} {l.is_default ? "(utama)" : ""}{" "}
                                        — {l.radius} KM
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEmployee(emp.id ?? "")}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {locationsDraft.length === 0 && (
                      <div className="text-xs text-amber-600">
                        * Tambahkan lokasi di Step 2 untuk bisa melakukan
                        assignment per lokasi.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="cursor-pointer"
              >
                Kembali
              </Button>

              <div className="flex gap-2">
                {currentStep < totalSteps ? (
                  <Button
                    className="bg-iprimary-blue cursor-pointer hover:bg-iprimary-blue-tertiary"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (canGoNext) nextStep();
                      else {
                        Swal.fire({
                          icon: "warning",
                          title: "Lengkapi data",
                          text:
                            currentStep === 1
                              ? "Isi Project Information dengan lengkap."
                              : "Tambahkan minimal 1 lokasi.",
                          toast: true,
                          showConfirmButton: false,
                          timer: 1800,
                          position: "top-right",
                        });
                      }
                    }}
                  >
                    Lanjut
                  </Button>
                ) : (
                  <Button
                    className="bg-iprimary-blue hover:bg-iprimary-blue-tertiary cursor-pointer"
                    type="submit"
                  >
                    Simpan Proyek
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
