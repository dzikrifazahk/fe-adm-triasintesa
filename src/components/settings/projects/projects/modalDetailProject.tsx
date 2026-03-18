"use client";

import { ModalDetail } from "@/components/custom/modalDetail";
import { getDictionary } from "../../../../../get-dictionary";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FaClock,
  FaCreditCard,
  FaDiagramProject,
  FaFly,
  FaLocationDot,
  FaPencil,
  FaUpRightFromSquare,
  FaUsers,
  FaXmark,
} from "react-icons/fa6";
import {
  IAddProjectLocation,
  IProject,
  IProjectLocation,
  IProjectUsers,
} from "@/types/project";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  contactService,
  operationService,
  projectService,
  userService,
} from "@/services";
import { useLoading } from "@/context/loadingContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp } from "@tabler/icons-react";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import { IContact } from "@/types/contact";
import { Circle, Save, Trash2, X, Users, Search, Plus } from "lucide-react";
import { useCurrencyInput } from "@/utils/useCurrency";
import { Input } from "@/components/ui/input";
import { format, isValid, parseISO } from "date-fns";
import { getStatusClassProject } from "@/helpers/getStatusClassProject";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MapSsr from "@/components/custom/Maps/Map";
import { Label } from "@/components/ui/label";
import { IUser, IUserSelect } from "@/types/user";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "@/components/custom/timePicker";
import { convertToDate, toTimeString } from "@/utils/convertHHMMSS";
import { formatTimeFromUtc } from "../../operation/column";

export default function ModalDetailProject({
  dictionary,
  projectId,
  isOpen,
  title,
  onClose,
  isGetData,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_projects"];
  projectId: string;
  isOpen: boolean;
  title: string;
  onClose: () => void;
  isGetData: (tableModal: string) => void;
}) {
  const { setIsLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState<IProject | null>(null);
  const [projectLocation, setProjectLocation] = useState<IProjectLocation[]>(
    []
  );

  const [editingLocationId, setEditingLocationId] = useState<number | null>(
    null
  );
  const [editingModeProjectLocation, setEditingModeProjectLocation] =
    useState<boolean>(false);

  const [locationFormValues, setLocationFormValues] = useState({
    name: "",
    radius: "",
    latitude: "",
    longitude: "",
    is_default: false,
  });

  // Map state
  const [locMarker, setLocMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locLat, setLocLat] = useState<string>("");
  const [locLng, setLocLng] = useState<string>("");

  // Users state
  const [projectUsers, setProjectUsers] = useState<IProjectUsers[]>([]);
  const [editingModeProjectUsers, setEditingModeProjectUsers] = useState(false);

  const [clients, setClients] = useState<ComboboxItem<IContact>[]>([]);
  const [selectedClient, setSelectedClient] = useState<ComboboxItem<{
    id: string;
    name: string;
  }> | null>(null);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Employee selection for edit mode users
  const [searchEmployee, setSearchEmployee] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<IUserSelect[]>([]);
  const [userLocationMap, setUserLocationMap] = useState<
    Record<string, string>
  >({});
  const [users, setUsers] = useState<IUser[]>([]);
  let {
    value: billing,
    formattedValueNumeric: billingFormatted,
    handleChange: handleBillingChange,
    setValue: setBilling,
  } = useCurrencyInput();

  const [formValues, setFormValues] = useState({
    name: "",
    noDokumen: "",
    date: "",
    file: null as File | null,
  });

  const ZERO_TIME = "00:00:00";
  const [editingOperational, setEditingOperational] = useState(false);
  const [operationalHourId, setOperationalHourId] = useState<number | null>(
    null
  );
  const [onTimeStart, setOnTimeStart] = useState<Date | undefined>(() =>
    convertToDate(ZERO_TIME)
  );
  const [onTimeEnd, setOnTimeEnd] = useState<Date | undefined>(() =>
    convertToDate(ZERO_TIME)
  );
  const [lateTime, setLateTime] = useState<Date | undefined>(() =>
    convertToDate(ZERO_TIME)
  );
  const [offTime, setOffTime] = useState<Date | undefined>(() =>
    convertToDate(ZERO_TIME)
  );
  const canEditOperational = () =>
    !isEditMode && !editingModeProjectLocation && !editingModeProjectUsers;

  const handleSaveOperational = async () => {
    if (operationalHourId == null) {
      Swal.fire({
        icon: "warning",
        text: "Apakah anda menambahkan jam operational?",
        showDenyButton: true,
        confirmButtonText: "Ya",
        confirmButtonColor: "#2a56b8",
        denyButtonText: "Tidak",
        position: "center",
        showConfirmButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            setIsLoading(true);
            const { message, data } = await operationService.createOperation({
              ontime_start: toTimeString(onTimeStart),
              ontime_end: toTimeString(onTimeEnd),
              late_time: toTimeString(lateTime),
              offtime: toTimeString(offTime),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });

            try {
              const frmData = new FormData();
              frmData.append("client_id", String(projectData?.client.id ?? ""));
              frmData.append("operational_hour_id", String(data.id));
              const res = await projectService.updateProject(
                projectId,
                frmData
              );
              setIsLoading(false);
              Swal.fire({
                icon: "success",
                title: `${message}`,
                position: "top-right",
                toast: true,
                showConfirmButton: false,
                timer: 2000,
              });
              await getProjectDetail(projectId);
            } catch (e) {
              setIsLoading(false);
              Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Gagal menyimpan data proyek",
                position: "top-right",
                toast: true,
                showConfirmButton: false,
                timer: 2000,
              });
            }
          } catch (e) {
            setIsLoading(false);
            Swal.fire({
              icon: "error",
              title: "Gagal",
              text: "Gagal menghapus lokasi",
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
          }
        } else if (result.isConfirmed === false) {
          Swal.fire({
            icon: "warning",
            title: "Batal menghapus lokasi",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      });
    } else {
    }
  };

  const handleInputChange = (key: string, value: string | File | null) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

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

  const getProjectDetail = async (projectId: string) => {
    const { data } = await projectService.getProject(projectId);
    setProjectData(data[0]);
    return data[0];
  };

  const getProjectLocation = async (projectId: string) => {
    const { data } = await projectService.getProjectLocations(projectId);
    setProjectLocation(data || []);
    return data;
  };

  const getProjectUsers = async (projectId: string) => {
    const { data } = await projectService.getAssignedUsers(projectId);
    setProjectUsers(data || []);
    return data;
  };

  const getUsers = async () => {
    const { data } = await userService.getAllUsers();
    setUsers(data || []);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const detail = await getProjectDetail(projectId);
        const locations = await getProjectLocation(projectId);
        const users = await getProjectUsers(projectId);
        await getUsers();
        setProjectData(detail || null);
        setProjectLocation(locations || []);
        setProjectUsers(users || []);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Terjadi Kesalahan",
          text: "Terjadi kesalahan saat mengambil data.",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };
    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen, projectId, setIsLoading]);

  useEffect(() => {
    if (projectData) {
      setFormValues({
        name: projectData.name ?? "",
        noDokumen: projectData.no_dokumen_project ?? "",
        date: projectData.date ?? "",
        file: null,
      });
      setBilling(projectData.billing ?? 0);
      if (projectData.client) {
        setSelectedClient({
          value: projectData.client.id,
          label: projectData.client.name,
          icon: Circle,
        });
      }
    }
  }, [projectData, setBilling]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("name", formValues.name);
      formData.append("no_dokumen_project", formValues.noDokumen);
      formData.append("date", formValues.date);
      formData.append("billing", String(billing));
      formData.append("client_id", String(selectedClient?.value));
      if (formValues.file) {
        formData.append("attachment_file", formValues.file);
      }
      await projectService.updateProject(projectId, formData);
      getProjectDetail(projectId);
      isGetData("project");
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data proyek berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
        position: "top-right",
        toast: true,
      });
      setIsEditMode(false);
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menyimpan data proyek",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toRoleString = (raw: any) =>
    typeof raw === "string" ? raw : raw?.name ?? raw?.kode_divisi ?? raw ?? "-";

  // === Project Location Handlers (Updated Flow) ===
  const handleSelectLocation = (location: IProjectLocation) => {
    setEditingLocationId(Number(location.id));
    const latStr = `${location.latitude ?? ""}`;
    const lngStr = `${location.longitude ?? ""}`;

    setLocationFormValues({
      name: location.name ?? "",
      radius: String(location.radius ?? ""),
      latitude: latStr,
      longitude: lngStr,
      is_default: location.is_default ?? false,
    });

    const latNum = Number(latStr);
    const lngNum = Number(lngStr);
    if (!Number.isNaN(latNum) && !Number.isNaN(lngNum)) {
      setLocMarker({ lat: latNum, lng: lngNum });
      setLocLat(latStr);
      setLocLng(lngStr);
    } else {
      setLocMarker(null);
      setLocLat("");
      setLocLng("");
    }
  };

  const handleCancelEditLocation = () => {
    setEditingLocationId(null);
    setLocationFormValues({
      name: "",
      radius: "",
      latitude: "",
      longitude: "",
      is_default: false,
    });
    setLocMarker(null);
    setLocLat("");
    setLocLng("");
  };

  const handleSaveLocation = async () => {
    if (!editingLocationId) return;
    const latitudeToSave = locLat || locationFormValues.latitude;
    const longitudeToSave = locLng || locationFormValues.longitude;

    if (!latitudeToSave || !longitudeToSave) {
      Swal.fire({
        icon: "warning",
        title: "Lokasi belum dipilih",
        text: "Klik titik pada peta untuk menentukan latitude dan longitude.",
        position: "top-right",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setIsLoading(true);
    try {
      const locationPayload: IAddProjectLocation = {
        name: locationFormValues.name,
        radius: locationFormValues.radius,
        latitude: latitudeToSave,
        longitude: longitudeToSave,
        is_default: locationFormValues.is_default,
      };
      await projectService.changeProjectLocation(
        String(editingLocationId),
        locationPayload
      );
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Lokasi berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
        position: "top-right",
        toast: true,
      });
      await getProjectLocation(projectId);
      handleCancelEditLocation();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal memperbarui lokasi",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLocation = (idx: number) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus lokasi ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#2a56b8",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          const response = await projectService.deleteProjectLocation(
            String(idx)
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
          await getProjectLocation(projectId);
          await getProjectUsers(projectId);
        } catch (e) {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Gagal menghapus lokasi",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } else if (result.isConfirmed === false) {
        Swal.fire({
          icon: "warning",
          title: "Batal menghapus lokasi",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const toggleEditModeProjectLocation = (to?: boolean) => {
    const next = typeof to === "boolean" ? to : !editingModeProjectLocation;

    // Guard: larang jika edit mode users/proyek aktif
    if (next && (isEditMode || editingModeProjectUsers)) {
      Swal.fire({
        icon: "warning",
        title: "Tidak bisa edit lokasi",
        text: "Matikan mode edit lain terlebih dahulu.",
        position: "top-right",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setEditingModeProjectLocation(next);
    if (!next) {
      handleCancelEditLocation();
    }
  };

  // ================== Edit Mode Users Helpers ==================
  // Sumber data karyawan untuk pencarian — dari API users
  const employee: IUserSelect[] = useMemo(
    () =>
      (users || []).map((u: any) => ({
        id: u?.id?.toString() ?? "",
        name: u?.name ?? "(tanpa nama)",
        role: toRoleString(u?.divisi?.name ?? u?.role ?? "-"),
      })),
    [users]
  );

  const locationsDraft = projectLocation; // alias agar sesuai snippet

  const filteredEmployees: IUserSelect[] = useMemo(() => {
    const q = searchEmployee.toLowerCase();
    return employee
      .filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          (typeof emp.role === "string" && emp.role.toLowerCase().includes(q))
      )
      .map((emp) => ({
        id: emp.id,
        name: emp.name,
        role: emp.role ?? "-",
      }));
  }, [employee, searchEmployee]);

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

  // ==========================
  // PERMINTAAN ANDA: Saat edit mode, tampilkan HANYA user yang sudah terpilih (dari getProjectUsers).
  // Semua users API hanya dipakai untuk SEARCH.
  // ==========================
  const toggleEditModeProjectUsers = (to?: boolean) => {
    const next = typeof to === "boolean" ? to : !editingModeProjectUsers;

    // Guard: larang jika edit mode project info/lokasi aktif
    if (next && (isEditMode || editingModeProjectLocation)) {
      Swal.fire({
        icon: "warning",
        title: "Tidak bisa edit pengguna",
        text: "Matikan mode edit lain terlebih dahulu.",
        position: "top-right",
        toast: true,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (next) {
      // === MASUK EDIT MODE ===
      // 1) Buat peta: id lokasi -> index di locationsDraft (String(idx)) agar cocok dengan <SelectItem value={String(idx)}>
      const locationIndexById: Record<string, string> = {};
      locationsDraft.forEach((loc, idx) => {
        if (loc?.id != null) locationIndexById[String(loc.id)] = String(idx);
      });

      // 2) selectedEmployees diisi dari API getProjectUsers (BUKAN semua users)
      const selectedFromProject: IUserSelect[] = (projectUsers || []).map(
        (pu) => ({
          id: pu.user?.id?.toString() ?? "",
          name: pu.user?.name ?? "(tanpa nama)",
          role: pu.user?.divisi?.name ?? pu.user?.role.name ?? "-",
          // toRoleString(
          //   (pu.user as any)?.divisi ?? (pu.user as any)?.role ?? "-"
          // ),
        })
      );
      setSelectedEmployees(selectedFromProject);

      // 3) isi map user->lokasi dengan index lokasi (String(idx)) atau "none"
      const initMap: Record<string, string> = {};
      (projectUsers || []).forEach((pu) => {
        const uid = pu.user?.id?.toString();
        if (!uid) return;
        if (pu.location?.id != null) {
          const locId = String(pu.location.id);
          initMap[uid] = locationIndexById[locId] ?? "none";
        } else {
          initMap[uid] = "none";
        }
      });
      setUserLocationMap(initMap);
    }

    setEditingModeProjectUsers(next);
  };

  // Saat BUKAN edit mode, muat tampilan awal dari data existing projectUsers (tetap seperti sebelumnya)
  useEffect(() => {
    if (editingModeProjectUsers) return;

    if (
      projectUsers &&
      projectUsers.length > 0 &&
      selectedEmployees.length === 0
    ) {
      const locationIndexById: Record<string, string> = {};
      projectLocation.forEach((loc, idx) => {
        if (loc?.id != null) locationIndexById[String(loc.id)] = String(idx);
      });

      const initialSelected: IUserSelect[] = projectUsers.map((pu) => ({
        id: pu.user?.id?.toString() ?? "",
        name: pu.user?.name ?? "(tanpa nama)",
        role: pu.user?.divisi?.name ?? pu.user?.role?.name ?? "-",
        // toRoleString(
        //   (pu.user as any)?.divisi ?? (pu.user as any)?.role ?? "-"
        // ),
      }));

      setSelectedEmployees(initialSelected);

      const initMap: Record<string, string> = {};
      projectUsers.forEach((pu) => {
        if (!pu.user?.id) return;
        const userId = pu.user.id.toString();
        if (pu.location?.id != null) {
          const locIdStr = String(pu.location.id);
          initMap[userId] =
            locationIndexById[locIdStr] !== undefined
              ? locationIndexById[locIdStr]
              : "none";
        } else {
          initMap[userId] = "none";
        }
      });
      setUserLocationMap(initMap);
    }
  }, [
    projectUsers,
    projectLocation,
    editingModeProjectUsers,
    selectedEmployees.length,
  ]);

  const handleSaveUsersAssignment = async () => {
    const users_detail = selectedEmployees.map((emp) => {
      const locIdx = emp.id !== undefined ? userLocationMap[emp.id] : undefined;
      let locationId: string | null = null;

      if (locIdx && locIdx !== "none") {
        const loc = locationsDraft[Number(locIdx)];
        if (loc?.id) locationId = String(loc.id);
      }

      return {
        user_id: emp.id,
        location_id: locationId, // bisa null kalau tidak ditempatkan
      };
    });

    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menyimpan perubahan?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#2a56b8",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          const payload = { users_detail };
          const { message, data } =
            await projectService.bulkSetUsersAndLocationProject(
              String(projectId),
              payload
            );
          await getProjectUsers(String(projectId));
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: "Tersimpan",
            text: "Data berhasil disimpan.",
            position: "top-right",
            toast: true,
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (e) {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Data gagal disimpan.",
            position: "top-right",
            toast: true,
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } else {
        setIsLoading(false);
        Swal.fire({
          icon: "warning",
          title: "Batal",
          text: "Batal mengubah data.",
          position: "top-right",
          toast: true,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <ModalDetail
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="w-[80vw]"
    >
      <div className="p-5 space-y-5">
        {/* Card Informasi Proyek */}
        <div className="grid grid-cols-3 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <Card className="@container/card ">
            <CardHeader>
              <CardDescription>Real Cost</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {formatCurrencyIDR(
                  projectData?.cost_progress_project?.real_cost || 0
                )}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp />
                  +12.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">
                Real cost didapatkan dari perhitungan man power dan material
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card ">
            <CardHeader>
              <CardDescription>Purchase Cost</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {formatCurrencyIDR(
                  projectData?.cost_progress_project?.purchase_cost || 0
                )}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp />
                  +12.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">
                Purchase cost didapatkan dari pengeluaran kegiatan pada proyek
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card ">
            <CardHeader>
              <CardDescription>Man Power Cost</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {formatCurrencyIDR(
                  projectData?.cost_progress_project?.payroll_cost || 0
                )}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp />
                  +12.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="text-muted-foreground">
                Man power cost didapatkan dari pengeluaran penggunaaan man power
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Kartu Informasi Proyek */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FaDiagramProject className="w-5 h-5" />
                  Informasi Proyek
                </CardTitle>
                <CardDescription>Detail informasi proyek</CardDescription>
              </div>
              <div className="flex gap-2">
                {isEditMode ? (
                  <>
                    <Button
                      type="button"
                      className="bg-green-500 text-white cursor-pointer hover:bg-green-600"
                      onClick={handleSave}
                    >
                      <FaFly className="mr-1" /> Simpan
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditMode(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    className="bg-yellow-400 cursor-pointer hover:bg-yellow-500"
                    onClick={() => setIsEditMode(true)}
                  >
                    <FaPencil className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </>
            ) : isEditMode ? (
              <div className="flex flex-col w-full gap-4">
                <div className="flex w-full gap-4">
                  <div className="flex flex-col w-full">
                    <span className="font-bold text-sm">Nama Proyek</span>
                    <Input
                      value={formValues.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Nama Proyek"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <span className="font-bold text-sm">No Dokumen</span>
                    <Input
                      value={formValues.noDokumen}
                      onChange={(e) =>
                        handleInputChange("noDokumen", e.target.value)
                      }
                      placeholder="No Dokumen"
                    />
                  </div>
                </div>
                <div className="flex w-full gap-4">
                  <div className="flex flex-col w-full">
                    <span className="font-bold text-sm">Nama Client</span>
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
                  <div className="flex flex-col w-full gap-1">
                    <span className="font-bold text-sm">Status Proyek</span>
                    <span
                      className={`text-sm px-2 py-1 rounded-md font-medium inline-block w-fit self-start ${getStatusClassProject(
                        projectData?.request_status_owner?.name
                      )}`}
                    >
                      {projectData?.request_status_owner?.name ?? ""}
                    </span>
                  </div>
                </div>
                <div className="flex w-full gap-4">
                  <div className="flex flex-col w-full">
                    <span className="font-bold text-sm">Tanggal Proyek</span>
                    <Input
                      type="date"
                      value={formValues.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <span className="font-bold text-sm">File</span>
                    <Input
                      type="file"
                      onChange={(e) =>
                        handleInputChange("file", e.target.files?.[0] || null)
                      }
                    />
                    {/* tampilkan file sebelumnya */}
                    {projectData?.file_attachment?.name && (
                      <a
                        href={projectData?.file_attachment?.link ?? "#"}
                        target="_blank"
                        className="text-blue-500 text-sm mt-1"
                      >
                        {projectData?.file_attachment?.name}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex w-full gap-4">
                  <div className="flex flex-col w-full">
                    <span className="font-bold text-sm">Billing</span>
                    <Input
                      value={billingFormatted}
                      onChange={handleBillingChange}
                      placeholder="Billing"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <span className="font-bold text-sm">Margin</span>
                    <span className="text-sm">{projectData?.margin ?? ""}</span>
                  </div>
                </div>
                <div className="flex w-full gap-4">
                  <div className="flex flex-col w-full">
                    <span className="font-bold text-sm">
                      Status Cost Progress
                    </span>
                    <span className="text-sm p-1">
                      {projectData?.cost_progress_project
                        ?.status_cost_progres ?? ""}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col w-full gap-4">
                  <div className="flex w-full ">
                    <div className="flex flex-col w-full">
                      <span className="font-bold text-sm">Nama Proyek</span>{" "}
                      <span className="text-sm">{projectData?.name ?? ""}</span>
                    </div>
                    <div className="flex flex-col w-full">
                      <span className="font-bold text-sm">No Dokumen</span>{" "}
                      <span className="text-sm">
                        {projectData?.no_dokumen_project ?? projectData?.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full">
                    <div className="flex flex-col w-full">
                      <span className="font-bold text-sm">Nama Client</span>{" "}
                      <span className="text-sm">
                        {projectData?.client?.name ?? ""}
                      </span>
                    </div>
                    <div className="flex flex-col w-full gap-1">
                      <span className="font-bold text-sm">Status Proyek</span>
                      <span
                        className={`text-sm px-2 py-1 rounded-md font-medium inline-block w-fit self-start ${getStatusClassProject(
                          projectData?.request_status_owner?.name
                        )}`}
                      >
                        {projectData?.request_status_owner?.name ?? ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full">
                    <div className="flex flex-col w-full">
                      <span className="font-bold text-sm">Tanggal Proyek</span>{" "}
                      <span className="text-sm">
                        {projectData?.date
                          ? format(parseISO(projectData.date), "dd MMM yyyy")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex flex-col w-full">
                      <span className="font-bold text-sm">File</span>{" "}
                      {projectData?.file_attachment?.name ? (
                        <a
                          className="text-sm flex gap-2 items-center"
                          href={projectData?.file_attachment?.link ?? "#"}
                          target="_blank"
                        >
                          <FaUpRightFromSquare className="text-blue-500" />
                          <i className="underline text-blue-500">Click Here</i>
                        </a>
                      ) : (
                        <span className="text-sm">Tidak ada file</span>
                      )}
                    </div>
                  </div>
                  <div className="flex w-full">
                    <div className="flex flex-col w-full">
                      <span className="font-bold text-sm">Billing</span>{" "}
                      <span className="text-sm">
                        {formatCurrencyIDR(Number(projectData?.billing ?? 0))}
                      </span>
                    </div>
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-bold">Margin</span>{" "}
                      <span className="text-sm">
                        {formatCurrencyIDR(Number(projectData?.margin ?? 0))}
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full">
                    <div className="flex flex-col w-full">
                      <span className="font-bold text-sm">
                        Status Cost Progress
                      </span>{" "}
                      <span className="text-sm">
                        {projectData?.cost_progress_project
                          ?.status_cost_progres ?? ""}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ===================== Operational Hours ===================== */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex gap-2">
                  <FaClock />
                  Jam Operasional
                </CardTitle>

                <CardDescription>Jam kerja proyek</CardDescription>
              </div>

              {!editingOperational ? (
                <Button
                  className="bg-yellow-400 hover:bg-yellow-500 cursor-pointer"
                  type="button"
                  onClick={() => {
                    if (!canEditOperational()) {
                      Swal.fire({
                        icon: "warning",
                        title: "Tidak bisa masuk edit",
                        text: "Matikan mode edit lain terlebih dahulu.",
                        position: "top-right",
                        toast: true,
                        timer: 2000,
                        showConfirmButton: false,
                      });
                      return;
                    }
                    setOperationalHourId(
                      projectData?.operational_hour?.id ?? null
                    );
                    setEditingOperational(true);
                  }}
                >
                  <FaPencil className="w-4 h-4 mr-1" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                    onClick={handleSaveOperational}
                    type="button"
                  >
                    Simpan
                  </Button>
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      const op = projectData?.operational_hour;
                      setOnTimeStart(convertToDate(ZERO_TIME));
                      setOnTimeEnd(convertToDate(ZERO_TIME));
                      setLateTime(convertToDate(ZERO_TIME));
                      setOffTime(convertToDate(ZERO_TIME));
                      setEditingOperational(false);
                    }}
                  >
                    Batal
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </>
            ) : !editingOperational ? (
              <>
                {projectData?.operational_hour == null ? (
                  <div className="rounded-lg border border-dashed p-4 bg-amber-50 text-amber-800 flex items-start gap-3">
                    <FaClock className="mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">
                        Jam operasional belum diatur
                      </div>
                      <div className="text-sm">
                        Set terlebih dahulu agar aturan on-time & keterlambatan
                        berlaku.
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 bg-iprimary-blue hover:bg-iprimary-blue-tertiary cursor-pointer"
                      onClick={() => {
                        if (!canEditOperational()) {
                          Swal.fire({
                            icon: "warning",
                            title: "Tidak bisa masuk edit",
                            text: "Matikan mode edit lain terlebih dahulu.",
                            position: "top-right",
                            toast: true,
                            timer: 2000,
                            showConfirmButton: false,
                          });
                          return;
                        }
                        setOnTimeStart(convertToDate(ZERO_TIME));
                        setOnTimeEnd(convertToDate(ZERO_TIME));
                        setLateTime(convertToDate(ZERO_TIME));
                        setOffTime(convertToDate(ZERO_TIME));
                        setOperationalHourId(null);
                        setEditingOperational(true);
                      }}
                    >
                      Set sekarang
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        On-time Start
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <span className="text-lg font-semibold tabular-nums">
                          {formatTimeFromUtc(
                            projectData?.operational_hour?.ontime_start
                          )}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Tepat waktu mulai
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        On-time End
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <span className="text-lg font-semibold tabular-nums">
                          {formatTimeFromUtc(
                            projectData?.operational_hour?.ontime_end
                          )}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Batas on-time
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        Late Time
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <span className="text-lg font-semibold tabular-nums">
                          {formatTimeFromUtc(
                            projectData?.operational_hour?.late_time
                          )}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Mulai terlambat
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        Offtime
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <span className="text-lg font-semibold tabular-nums">
                          {formatTimeFromUtc(
                            projectData?.operational_hour?.offtime
                          )}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                          Pulang
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // ======= EDIT MODE =======
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">On-time Start</Label>
                  <TimePicker date={onTimeStart} setDate={setOnTimeStart} />
                  <p className="text-[11px] text-muted-foreground">
                    Contoh: 07:00:00
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">On-time End</Label>
                  <TimePicker date={onTimeEnd} setDate={setOnTimeEnd} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Late Time</Label>
                  <TimePicker date={lateTime} setDate={setLateTime} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Offtime</Label>
                  <TimePicker date={offTime} setDate={setOffTime} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* ===================== END Operational Hours ===================== */}

        {/* ===================== Project Location (UPDATED) ===================== */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex gap-2">
                  <FaLocationDot />
                  Lokasi Proyek
                </CardTitle>
                <CardDescription>Daftar lokasi proyek</CardDescription>
              </div>
              {!editingModeProjectLocation ? (
                <Button
                  type="button"
                  className="bg-yellow-400 cursor-pointer hover:bg-yellow-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEditMode || editingModeProjectUsers) {
                      Swal.fire({
                        icon: "warning",
                        title: "Tidak bisa edit lokasi",
                        text: "Matikan mode edit lain terlebih dahulu.",
                        position: "top-right",
                        toast: true,
                        timer: 2000,
                        showConfirmButton: false,
                      });
                      return;
                    }
                    toggleEditModeProjectLocation(true);
                  }}
                >
                  <FaPencil className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEditModeProjectLocation(false);
                  }}
                >
                  Selesai
                </Button>
              )}
            </div>

            {editingModeProjectLocation && (
              <div className="mt-3 text-xs text-muted-foreground">
                Klik salah satu kartu lokasi untuk memuat data ke form di bawah,
                pilih titik di peta untuk mengisi Latitude/Longitude (field
                dikunci), lalu simpan. Gunakan tombol{" "}
                <span className="font-medium">Selesai</span> untuk keluar dari
                mode edit lokasi.
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* LIST Lokasi */}
            {loading ? (
              <>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </>
            ) : projectLocation.length === 0 && !editingModeProjectLocation ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                Belum ada lokasi
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectLocation.map((l, idx) => {
                  const isSelected =
                    editingModeProjectLocation &&
                    editingLocationId !== null &&
                    Number(editingLocationId) === Number(l.id);

                  return (
                    <Card
                      key={idx}
                      onClick={() =>
                        editingModeProjectLocation
                          ? handleSelectLocation(l)
                          : undefined
                      }
                      className={[
                        l.is_default ? "border-emerald-500" : "",
                        editingModeProjectLocation
                          ? "cursor-pointer hover:border-blue-300"
                          : "",
                        isSelected ? "ring-2 ring-blue-500" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
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

                        {editingModeProjectLocation && (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLocation(Number(l?.id ?? 0));
                              }}
                              className="cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="grid gap-1 text-xs text-muted-foreground">
                        <div>
                          Lat/Long: {l.latitude} / {l.longitude}
                        </div>
                        {isSelected && (
                          <div className="text-[11px] text-blue-600">
                            Lokasi dipilih • Data telah dimuat ke form di atas
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            {/* FORM EDIT Lokasi */}
            {editingModeProjectLocation && (
              <div className="rounded-lg border p-3">
                <div className="mb-2 text-sm font-medium">
                  Form Edit Lokasi{" "}
                  {editingLocationId ? `(ID: ${editingLocationId})` : ""}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Nama Lokasi</span>
                    <Input
                      name="name"
                      value={locationFormValues.name}
                      onChange={(e) =>
                        setLocationFormValues((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Nama Lokasi"
                      disabled={!editingLocationId}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Radius (KM)</span>
                    <Input
                      name="radius"
                      value={locationFormValues.radius}
                      onChange={(e) =>
                        setLocationFormValues((prev) => ({
                          ...prev,
                          radius: e.target.value,
                        }))
                      }
                      placeholder="Radius"
                      disabled={!editingLocationId}
                    />
                  </div>
                </div>

                <div className="space-y-1 mt-3">
                  <Label className="font-bold text-sm">
                    Pilih titik di peta
                  </Label>
                  <Label className="text-sm text-gray-500">
                    Klik pada peta untuk memilih lokasi
                  </Label>
                  <div className="rounded-md overflow-hidden border">
                    <MapSsr
                      marker={[locMarker?.lat ?? 0, locMarker?.lng ?? 0]}
                      setMarker={(pos) => {
                        if (pos) {
                          setLocMarker({ lat: pos[0], lng: pos[1] });
                        } else {
                          setLocMarker(null);
                        }
                      }}
                      onLocationSelect={(
                        latitude: number,
                        longitude: number
                      ) => {
                        setLocLat(String(latitude));
                        setLocLng(String(longitude));
                        setLocationFormValues((prev) => ({
                          ...prev,
                          latitude: String(latitude),
                          longitude: String(longitude),
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 mt-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Latitude</span>
                    <Input
                      name="latitude"
                      value={locationFormValues.latitude}
                      placeholder="Latitude"
                      disabled
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Longitude</span>
                    <Input
                      name="longitude"
                      value={locationFormValues.longitude}
                      placeholder="Longitude"
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={locationFormValues.is_default}
                    disabled={!editingLocationId}
                    onChange={(e) =>
                      setLocationFormValues((prev) => ({
                        ...prev,
                        is_default: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-blue-500"
                  />
                  <label htmlFor="isDefault" className="text-sm cursor-pointer">
                    Jadikan lokasi utama
                  </label>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveLocation}
                    disabled={!editingLocationId}
                    className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-60"
                  >
                    <Save className="w-4 h-4 mr-1" /> Simpan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEditLocation}
                    disabled={!editingLocationId}
                    className="disabled:opacity-60"
                  >
                    <X className="w-4 h-4 mr-1" /> Batal
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* =================== END Project Location (UPDATED) =================== */}

        {/* TERMIN PROJECT */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2">
              <FaCreditCard />
              Pembayaran Proyek
            </CardTitle>
            <CardDescription>Riwayat pembayaran klien proyek</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </>
            ) : projectUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                Belum ada pembayaran
              </div>
            ) : (
              <div className="flex flex-col gap-5 border border-slate-300 m-3 p-3 rounded-lg">
                <div className="">
                  {projectData?.riwayat_termin &&
                  projectData?.riwayat_termin.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Tanggal</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>File</TableHead>
                          <TableHead className="text-right">Nominal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projectData?.riwayat_termin.map((e, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {isValid(new Date(e?.tanggal))
                                ? format(new Date(e?.tanggal), "dd MMM yyyy")
                                : ""}
                            </TableCell>
                            <TableCell>
                              {e?.riwayat_type_termin_proyek?.name ?? ""}
                            </TableCell>
                            <TableCell>{e?.deskripsi_termin ?? ""}</TableCell>
                            <TableCell>
                              {e?.file_attachment && (
                                <a
                                  href={e?.file_attachment?.link ?? ""}
                                  className="text-blue-500 italic text-xs underline"
                                  target="_blank"
                                >
                                  Klik Disini
                                </a>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrencyIDR(Number(e?.harga_termin) ?? "")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={4}>Total</TableCell>
                          <TableCell className="text-right">
                            {formatCurrencyIDR(
                              Number(projectData?.harga_total_termin_proyek)
                            ) ?? ""}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4}>Sisa Pembayaran</TableCell>
                          <TableCell className="text-right">
                            {formatCurrencyIDR(
                              Number(projectData?.sisa_pembayaran_termin)
                            ) ?? ""}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Tidak ada data pembayaran.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===================== Project User (EDIT MODE) ===================== */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex gap-2">
                  <FaUsers />
                  Pengguna Proyek
                </CardTitle>
                <CardDescription>Orang yang terlibat di proyek</CardDescription>
              </div>

              {!editingModeProjectUsers ? (
                <Button
                  type="button"
                  className="bg-yellow-400 cursor-pointer hover:bg-yellow-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEditMode || editingModeProjectLocation) {
                      Swal.fire({
                        icon: "warning",
                        title: "Tidak bisa edit pengguna",
                        text: "Matikan mode edit lain terlebih dahulu.",
                        position: "top-right",
                        toast: true,
                        timer: 2000,
                        showConfirmButton: false,
                      });
                      return;
                    }
                    toggleEditModeProjectUsers(true);
                  }}
                >
                  <FaPencil className="w-5 h-5" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveUsersAssignment();
                    }}
                  >
                    Simpan Penugasan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEditModeProjectUsers(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {loading ? (
              <>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </>
            ) : (
              // Tampilan SAMA seperti edit; hanya search yang di-disable saat bukan edit
              <div className="space-y-4">
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
                    {/* Search - disable saat bukan edit */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Cari karyawan berdasarkan nama atau role..."
                        value={searchEmployee}
                        onChange={(e) => setSearchEmployee(e.target.value)}
                        className="pl-10"
                        disabled={!editingModeProjectUsers}
                      />
                    </div>

                    {/* Hasil pencarian hanya muncul saat edit mode & ada query */}
                    {editingModeProjectUsers && searchEmployee && (
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

                    {/* Selected & Assignment — tetap tampil, sesuai data state */}
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
                                  <Select
                                    value={
                                      userLocationMap[emp.id ?? "default-id"]
                                    }
                                    onValueChange={(v) =>
                                      setUserLocationMap((prev) => ({
                                        ...prev,
                                        [emp.id as string]: v,
                                      }))
                                    }
                                    disabled={!editingModeProjectUsers}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih lokasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">
                                        — Tidak ditempatkan —
                                      </SelectItem>
                                      {locationsDraft.map((l, idx) => (
                                        <SelectItem
                                          key={idx}
                                          value={String(idx)}
                                        >
                                          {l.name}{" "}
                                          {l.is_default ? "(utama)" : ""} —{" "}
                                          {l.radius} KM
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEmployee(emp.id ?? "")}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                  disabled={!editingModeProjectUsers}
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
          </CardContent>
        </Card>
        {/* =================== END Project User (EDIT MODE) =================== */}
      </div>
    </ModalDetail>
  );
}
