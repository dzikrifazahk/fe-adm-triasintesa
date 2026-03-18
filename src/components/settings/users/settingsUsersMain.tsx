"use client";

import { useEffect, useState } from "react";
import { columns } from "./column";
import { divisionService, userService } from "@/services";
import Swal from "sweetalert2";
import { IAddUser, IUser, IUserDetail } from "@/types/user";
import { IDivision } from "@/types/division";
import { IMeta } from "@/types/common";
import { useCurrencyInput } from "@/utils/useCurrency";
import { getUser } from "@/services/base.service";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import axios from "axios";
import useDebounce from "@/utils/useDebouncy";
import { getDictionary } from "../../../../get-dictionary";
import { Modal } from "@/components/custom/modal";
import { DetailModalUser } from "./modalDetailUser";
import { useLoading } from "@/context/loadingContext";
import { DataTable } from "./data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
export default function SettingsUsersMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_users"];
}) {
  const { setIsLoading } = useLoading();
  const [data, setData] = useState<IUser[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalResetPassOpen, setModalResetPassOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<
    "create" | "edit" | "detail" | null
  >(null);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [email, setEmail] = useState("");
  const [nik, setNik] = useState("");
  const [role, setRole] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [division, setDivision] = useState<IDivision[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedData, setSelectedData] = useState<IUserDetail | null>(null);
  const [selectedIdUser, setSelectedIdUser] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  let {
    value: dailySalary,
    formattedValueNumeric: dailySalaryFormatted,
    handleChange: handleDailySalaryChange,
    formattedValueWithRp: dailySalaryRp,
    setValue: setDailySalary,
  } = useCurrencyInput();

  let {
    value: hourlySalary,
    formattedValueNumeric: hourlySalaryFormatted,
    handleChange: handleHourlySalaryChange,
    formattedValueWithRp: hourlySalaryRp,
    setValue: setHourlySalary,
  } = useCurrencyInput();

  let {
    value: hourlyOvertimeSalary,
    formattedValueNumeric: hourlyOvertimeSalaryFormatted,
    handleChange: handleHourlyOvertimeSalary,
    formattedValueWithRp: hourlyOvertimeSalaryRp,
    setValue: setHourlyOvertimeSalary,
  } = useCurrencyInput();

  let {
    value: transportationAllowance,
    formattedValueNumeric: transportationAllowanceFormatted,
    handleChange: handleTransportationAllowanceChange,
    formattedValueWithRp: transportationAllowanceRp,
    setValue: setTransportationAllowance,
  } = useCurrencyInput();

  let {
    value: mealAllowance,
    formattedValueNumeric: mealAllowanceFormatted,
    handleChange: handleMealAllowanceChange,
    formattedValueWithRp: mealAllowanceRp,
    setValue: setMealAllowance,
  } = useCurrencyInput();

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();
  const [cookies, setCookie] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string,
    payload?: any
  ): Promise<IUser[]> => {
    let filterParams: Record<string, any> = {};
    if (pageSize || page) {
      filterParams = { page: page, per_page: pageSize };
    }

    filterParams.search = search;

    if (payload) {
      filterParams = { ...filterParams, ...payload };
    }

    if (filterParams.date && Array.isArray(filterParams.date)) {
      filterParams.date = `[${filterParams.date.join(", ")}]`;
    }
    const response = await userService.getUsers(filterParams);
    setData(response.data);
    setMetadata(response.meta);
    return response.data;
  };

  const getDivision = async (): Promise<void> => {
    try {
      const response = await divisionService.getDivisions();
      setDivision(response.data);
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  };

  useEffect(() => {
    getData(page, pageSize);
    getDivision();
    const user = getUser();
    if (user) {
      setCookie(user);
    }
    setIsLoading(false);
  }, []);

  const handleGetData = async (id: string) => {
    const { data } = await userService.getUser(id);
    getDivision();
    setId(id);
    setName(data.name ?? "");
    setEmail(data.email ?? "");
    setRole(String(data.roles.id) ?? "");
    setSelectedDivision(String(data?.divisi?.id) ?? "");
    setDailySalary(data.daily_salary ?? 0);
    setHourlySalary(data.hourly_salary ?? 0);
    setHourlyOvertimeSalary(data.hourly_overtime_salary ?? 0);
    setTransportationAllowance(data.transport ?? 0);
    setMealAllowance(data.makan ?? 0);
    setEmployeeNumber(data.nomor_karyawan ?? "");
    setBankName(data.bank_name ?? "");
    setAccountNumber(data.account_number ?? "");
    setNik(data.nik ?? "");
  };

  const handleEditData = async (id: string) => {
    await handleGetData(id);
    setTitle("Ubah Pengguna");
    setModalType("edit");
    toggleModal();
  };

  const handleCreateData = () => {
    setTitle("Tambah Pengguna");
    setModalType("create");
    getDivision();
    toggleModal();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getData(newPage, pageSize, debouncedSearch, filterPayload);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    getData(page, newPageSize, debouncedSearch, filterPayload);
  };

  const getUserDetail = async (id: string) => {
    setSelectedIdUser(id);
    const response = await userService.getUser(id);
    setSelectedData(response.data);
  };
  const handleDeleteData = (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus Pengguna ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const response = await userService.deleteUser(id);
        getData(page, pageSize, debouncedSearch, filterPayload);
        if (response.status_code === 200) {
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan ${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } else if (result.isConfirmed === false) {
        Swal.fire({
          icon: "warning",
          title: "Batal Hapus Data",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<IAddUser> = {};

    if (name) {
      payload.name = name;
    }
    if (email) {
      payload.email = email;
    }
    if (employeeNumber) {
      payload.nomor_karyawan = employeeNumber;
    }
    if (role !== null && role !== undefined) {
      payload.role = role;
    }
    if (
      selectedDivision !== null &&
      selectedDivision !== "null" &&
      selectedDivision !== undefined &&
      selectedDivision !== ""
    ) {
      payload.divisi = selectedDivision;
    }
    if (dailySalary !== null && dailySalary !== undefined) {
      payload.daily_salary = Number(dailySalary);
    }
    if (hourlySalary !== null && hourlySalary !== undefined) {
      payload.hourly_salary = Number(hourlySalary);
    }
    if (hourlyOvertimeSalary !== null && hourlyOvertimeSalary !== undefined) {
      payload.hourly_overtime_salary = Number(hourlyOvertimeSalary);
    }
    if (
      transportationAllowance !== null &&
      transportationAllowance !== undefined
    ) {
      payload.transport = Number(transportationAllowance);
    }
    if (mealAllowance !== null && mealAllowance !== undefined) {
      payload.makan = Number(mealAllowance);
    }
    if (bankName !== null && bankName !== undefined && bankName !== "") {
      payload.bank_name = bankName;
    }
    if (
      accountNumber !== null &&
      accountNumber !== undefined &&
      accountNumber !== ""
    ) {
      payload.account_number = accountNumber;
    }
    if (nik !== null && nik !== undefined && nik !== "") {
      payload.nik = nik;
    }

    if (modalType === "edit") {
      Swal.fire({
        icon: "warning",
        text: "Apakah anda ingin mengubah data Pengguna?",
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
            const response = await userService.updateUser(
              id,
              payload as IAddUser
            );
            getData(page, pageSize, debouncedSearch, filterPayload);
            setIsLoading(false);
            Swal.fire({
              icon: "success",
              title: `${response.message}`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
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
        } else if (result.isConfirmed === false) {
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
    } else {
      Swal.fire({
        icon: "warning",
        text: "Apakah anda ingin menambahkan Pengguna?",
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
            const response = await userService.createUser(payload as IAddUser);
            getData(page, pageSize, debouncedSearch, filterPayload);
            if (response.status_code === 200) {
              setIsLoading(false);
              Swal.fire({
                icon: "success",
                title: `${response.message}`,
                position: "top-right",
                toast: true,
                showConfirmButton: false,
                timer: 2000,
              });
            }
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
        } else if (result.isConfirmed === false) {
          clearInput();
          Swal.fire({
            icon: "warning",
            title: "Batal Tambah Data",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      });
    }
  };

  const handleCancel = () => {
    clearInput();
  };

  const handleChangeRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  const handleChangeDivision = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDivision(e.target.value);
  };

  const handleResetPassword = (id: string) => {
    setModalResetPassOpen(true);
    getUserDetail(id);
  };

  const handleSubmitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin Mengubah Password?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      // toast: true,
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          setModalResetPassOpen(false);
          const response = await userService.resetPassword(
            selectedIdUser,
            newPassword
          );
          getData(page, pageSize, debouncedSearch, filterPayload);
          if (response.status_code === 200) {
            setIsLoading(false);
            clearInput();
            Swal.fire({
              icon: "success",
              title: `${response.message}`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
          }
        } catch (e) {
          setIsLoading(false);
          clearInput();
          if (axios.isAxiosError(e)) {
            const message = e.response?.data?.message ?? "";
            Swal.fire({
              icon: "error",
              title: `Terjadi Kesalahan ${message}`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2500,
            });
          }
        }
        clearInput();
      } else if (result.isConfirmed === false) {
        clearInput();
        Swal.fire({
          icon: "warning",
          title: "Batal Hapus Data",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleModalDetailData = (id: string) => {
    setDetailModalOpen(!detailModalOpen);
    getUserDetail(id);
  };

  const clearInput = () => {
    setName("");
    setEmail("");
    setRole("");
    setDivision([]);
    setSelectedDivision("");
    setModalOpen(false);
    setId("");
    setModalType(null);
    setModalResetPassOpen(false);
    setTitle("");
    setHourlySalary("");
    setDailySalary("");
    setHourlyOvertimeSalary("");
    setTransportationAllowance("");
    setMealAllowance("");
    setNik("");
    setEmployeeNumber("");
    setBankName("");
    setAccountNumber("");
  };

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const [filterPayload, setFilterPayload] = useState("");
  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  useEffect(() => {
    getData(page, pageSize, debouncedSearch, filterPayload);
  }, [debouncedSearch]);

  useEffect(() => {
    getData(page, pageSize);
  }, []);

  const handleFilterChange = (payload: any) => {
    setFilterPayload(payload);
    getData(page, pageSize, debouncedSearch, payload);
  };

  const handleClearPayload = () => {
    setFilterPayload("");
    getData(page, pageSize);
    Swal.fire({
      icon: "success",
      title: "Filter Berhasil Dihapus",
      position: "top-right",
      toast: true,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleUnActiveUser = (id: string, status: string) => {
    const statusFormatted = status.toUpperCase();
    Swal.fire({
      icon: "warning",
      text: `Apakah ${
        statusFormatted === "AKTIF" ? "menonaktifkan" : "mengaktifkan"
      } Pengguna ini?`,
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
          if (statusFormatted === "AKTIF") {
            await userService.unActiveUser(id);
            Swal.fire({
              icon: "success",
              title: `Berhasil Menonaktifkan Pengguna`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
          } else {
            await userService.activateUser(id);
            Swal.fire({
              icon: "success",
              title: `Berhasil Mengaktifkan Pengguna`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
          }
          getData(page, pageSize, debouncedSearch, filterPayload);
          setIsLoading(false);
          clearInput();
        } catch (e) {
          setIsLoading(false);
          clearInput();
          if (axios.isAxiosError(e)) {
            const message = e.response?.data?.message ?? "";
            Swal.fire({
              icon: "error",
              title: `Terjadi Kesalahan ${message}`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2500,
            });
          }
        }
        clearInput();
      } else if (result.isConfirmed === false) {
        clearInput();
        Swal.fire({
          icon: "warning",
          title: "Batal",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleRefreshData = async () => {
    try {
      setIsLoading(true);
      await getData(page, pageSize, debouncedSearch, filterPayload);
      setIsLoading(false);
      Swal.fire({
        icon: "success",
        title: "Data berhasil di refresh",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      clearInput();
    } catch (e) {
      setIsLoading(false);
      clearInput();
      if (axios.isAxiosError(e)) {
        const message = e.response?.data?.message ?? "";
        Swal.fire({
          icon: "error",
          title: `Terjadi Kesalahan ${message}`,
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2500,
        });
      }
    }
  };
  return (
    <>
      <div className="w-full h-full">
        <Modal
          isOpen={isModalOpen}
          onClose={handleCancel}
          title={title}
          width="w-[80vw]"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        >
          <div className="w-full">
            <div className="m-3 flex flex-col">
              <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
                Informasi Karyawan
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-5 px-5">
                <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">
                    No Karyawan
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={employeeNumber}
                      onChange={(e) => setEmployeeNumber(e.target.value)}
                      placeholder="No Karyawan"
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">
                    Nama Pengguna
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Pengguna"
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">
                    Pilih Role Pengguna
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger
                      className="w-full text-primary truncate"
                      size="sm"
                      aria-label="Pilih Role Pengguna"
                    >
                      <SelectValue placeholder="Pilih Role Pengguna" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {(cookies?.roleId === 1 || cookies?.roleId === 2) && (
                        <>
                          <SelectItem value="1" className="rounded-lg">
                            Owner
                          </SelectItem>
                          <SelectItem value="2" className="rounded-lg">
                            Admin
                          </SelectItem>
                          <SelectItem value="3" className="rounded-lg">
                            Supervisor
                          </SelectItem>
                        </>
                      )}
                      <SelectItem value="4" className="rounded-lg">
                        Karyawan
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
                <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">
                    NIK
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="nik"
                      className="grow text-primary"
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      placeholder="NIK"
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">
                    Email
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="email"
                      className="grow text-primary"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">Divisi</span>
                  <Select
                    value={selectedDivision}
                    onValueChange={setSelectedDivision}
                    key={selectedDivision}
                    defaultValue={selectedDivision}
                  >
                    <SelectTrigger
                      className="w-full text-primary truncate"
                      size="sm"
                      aria-label="Pilih Divisi Pengguna"
                    >
                      <SelectValue placeholder="Pilih Divisi Pengguna" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {division.map((item) => (
                        <SelectItem
                          key={item.id}
                          value={String(item.id) || ""}
                          className="rounded-lg"
                        >
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
                Informasi Rekening Karyawan
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 p-5">
                <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">
                    Nama Bank
                    {/* <span className="text-red-500 ml-1">*</span> */}
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Nama Bank"
                      // required
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">
                    Nomor Rekening
                    {/* <span className="text-red-500 ml-1">*</span> */}
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Nomor Rekening"
                      // required
                    />
                  </label>
                </div>
              </div>

              <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
                Informasi Gaji Karyawan
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
                <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">
                    Gaji Harian
                    {/* <span className="text-red-500 ml-1">*</span> */}
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={dailySalaryRp}
                      onChange={handleDailySalaryChange}
                      placeholder="Gaji Harian"
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">
                    Gaji Per Jam
                    {/* <span className="text-red-500 ml-1">*</span> */}
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={hourlySalaryRp}
                      onChange={handleHourlySalaryChange}
                      placeholder="Gaji Per Jam"
                      required
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">
                    Lembur Per Jam
                    {/* <span className="text-red-500 ml-1">*</span> */}
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={hourlyOvertimeSalaryRp}
                      onChange={handleHourlyOvertimeSalary}
                      placeholder="Lembur Per Jam"
                      required
                    />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pl-5 pr-5">
                {/* <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">
                    Uang Transport
                    <span className="text-red-500 ml-1">*</span>
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={transportationAllowanceRp}
                      onChange={handleTransportationAllowanceChange}
                      placeholder="Uang Transport"
                      required
                    />
                  </label>
                </div> */}

                <div className="flex flex-col gap-2">
                  <span className="font-sans lg:text-lg text-sm">
                    Uang Makan
                    {/* <span className="text-red-500 ml-1">*</span> */}
                  </span>
                  <label className="input border-slate-400 flex items-center gap-2">
                    <Input
                      type="text"
                      className="grow text-primary"
                      value={mealAllowanceRp}
                      onChange={handleMealAllowanceChange}
                      placeholder="Uang Makan"
                      required
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <DetailModalUser
          isOpen={detailModalOpen}
          title={"Detail Pengguna"}
          data={selectedData}
          onClose={() => setDetailModalOpen(false)}
          onCancel={() => setDetailModalOpen(false)}
        />

        <Modal
          isOpen={isModalResetPassOpen}
          onClose={() => setModalResetPassOpen(false)}
          title={"Reset Password"}
          width="w-[80vw]"
          onSubmit={handleSubmitResetPassword}
          onCancel={() => setModalResetPassOpen(false)}
        >
          <div className="w-full">
            <div className="p-10">
              <span className="">Masukkan Password Baru</span>
              <div className="relative">
                <label className="input border-slate-400 flex items-center gap-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="grow text-primary"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                </label>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>
          </div>
        </Modal>

        <Card className="flex flex-col h-full">
          <CardContent className="flex-1 min-h-0 overflow-auto">
            <DataTable
              columns={columns({
                deleteData: handleDeleteData,
                editData: handleEditData,
                resetPassword: handleResetPassword,
                detailData: handleModalDetailData,
                unActiveUser: handleUnActiveUser,
                dictionary: dictionary,
              })}
              data={data}
              addData={handleCreateData}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              metadata={metadata}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              isClearPayload={handleClearPayload}
              dictionary={dictionary}
              isGetData={handleRefreshData}
            ></DataTable>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
