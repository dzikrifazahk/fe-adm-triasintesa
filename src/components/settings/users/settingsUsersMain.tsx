"use client";

import { useCallback, useEffect, useState } from "react";
import { columns } from "./column";
import { userService } from "@/services";
import Swal from "sweetalert2";
import { IUser } from "@/types/user";
import { IMeta } from "@/types/common";
import axios from "axios";
import useDebounce from "@/utils/useDebouncy";
import { getDictionary } from "../../../../get-dictionary";
import { DetailModalUser } from "./modalDetailUser";
import { useLoading } from "@/context/loadingContext";
import { DataTable } from "./data-table";
import { Card, CardContent } from "@/components/ui/card";
import { ModalUpsertUser, UserUpsertForm } from "./modalUpsertUser";

const initialForm: UserUpsertForm = {
  email: "",
  username: "",
  roleId: "",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
  bio: "",
  dob: "",
  gender: "",
  avatarFile: null,
  currentAvatarUrl: "",
};

export default function SettingsUsersMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_users"];
}) {
  const { setIsLoading } = useLoading();

  const [data, setData] = useState<IUser[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<
    "create" | "edit" | "detail" | null
  >(null);

  const [id, setId] = useState("");
  const [, setName] = useState("");
  const [, setEmployeeNumber] = useState("");
  const [, setEmail] = useState("");
  const [, setNik] = useState("");
  const [selectedData, setSelectedData] = useState<IUser | null>(null);
  const [, setSelectedIdUser] = useState<string>("");
  const [, setNewPassword] = useState("");
  const [, setUsername] = useState<string>("");
  const [form, setForm] = useState<UserUpsertForm>(initialForm);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();
  const [detailModalOpen, setDetailModalOpen] = useState(false);


  const handleFormChange = <K extends keyof UserUpsertForm>(
    field: K,
    value: UserUpsertForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getData = useCallback(async (
    currentPage?: number,
    currentPageSize?: number,
    search?: string,
    payload?: unknown,
  ): Promise<IUser[]> => {
    let filterParams: Record<string, unknown> = {};

    if (currentPageSize || currentPage) {
      filterParams = { page: currentPage, limit: currentPageSize };
    }

    filterParams.search = search;

    if (payload) {
      filterParams = { ...filterParams, ...payload };
    }

    if (filterParams.date && Array.isArray(filterParams.date)) {
      filterParams.date = `[${filterParams.date.join(", ")}]`;
    }

    const { data } = await userService.getUsers(filterParams);
    setData(data.data);
    setMetadata(data.meta);
    return data.data;
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const buildPayload = () => {
    const userDetail: {
      fullName: string;
      phoneNumber?: string;
      address?: string;
      city?: string;
      country?: string;
      postalCode?: string;
      bio?: string;
      dateOfBirth?: string;
      gender?: string;
    } = {
      fullName: form.fullName,
    };

    if (form.phone.trim()) {
      userDetail.phoneNumber = form.phone;
    }

    if (form.address.trim()) {
      userDetail.address = form.address;
    }

    if (form.city.trim()) {
      userDetail.city = form.city;
    }

    if (form.country.trim()) {
      userDetail.country = form.country;
    }

    if (form.postalCode.trim()) {
      userDetail.postalCode = form.postalCode;
    }

    if (form.bio.trim()) {
      userDetail.bio = form.bio;
    }

    if (form.dob.trim()) {
      userDetail.dateOfBirth = form.dob;
    }

    if (form.gender.trim()) {
      userDetail.gender = form.gender;
    }

    const payload: {
      email: string;
      username: string;
      roleId: string;
      userDetail: typeof userDetail;
    } = {
      email: form.email,
      username: form.username,
      roleId: form.roleId,
      userDetail,
    };

    return payload;
  };

  const uploadUserImage = async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    await userService.uploadUserAvatar(userId, formData);
  };

  const handleEditData = async (userId: string) => {
    const { data } = await userService.getUser(userId);

    setFormFromData(data);
    setId(userId);
    setTitle("Ubah Pengguna");
    setModalType("edit");
    setModalOpen(true);
  };

  const handleCreateData = () => {
    setTitle("Tambah Pengguna");
    setModalType("create");
    setForm(initialForm);
    setModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const getUserDetail = async (item: IUser) => {
    setSelectedIdUser(item.id ?? "");
    setSelectedData(item ?? null);
  };

  const handleDeleteData = (userId: string) => {
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
        try {
          await userService.deleteUser(userId);
          await getData(page, pageSize, debouncedSearch, filterPayload);
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: `Successfully Deleted Data`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan`,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = buildPayload();

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


            if (form.avatarFile) {
              await uploadUserImage(id, form.avatarFile);
            }

            await getData(page, pageSize, debouncedSearch, filterPayload);

            setIsLoading(false);
            Swal.fire({
              icon: "success",
              title: `Successfully Updated Data`,
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

            const response = await userService.createUser(payload);
            const createdUserId =
              response?.data?.id ??
              response?.data?.data?.id ??
              response?.result?.data?.id;

            if (form.avatarFile && createdUserId) {
              await uploadUserImage(createdUserId, form.avatarFile);
            }

            await getData(page, pageSize, debouncedSearch, filterPayload);

            setIsLoading(false);
            Swal.fire({
              icon: "success",
              title: `Successfully Created Data`,
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

  const handleResetPassword = (userId: string) => {
    setSelectedIdUser(userId);
    Swal.fire({
      title: "Reset Password",
      input: "password",
      inputPlaceholder: "Masukkan password baru",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (!result.isConfirmed || !result.value) return;
      try {
        setIsLoading(true);
        await userService.resetPassword(userId, String(result.value));
        Swal.fire({
          icon: "success",
          title: "Password berhasil direset",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const message = e.response?.data?.message ?? "Terjadi kesalahan";
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan ${message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2500,
          });
        }
      } finally {
        setIsLoading(false);
      }
    });
  };


  const setFormFromData = (item: IUser) => {
    setForm({
      email: item.email ?? "",
      username: item.username ?? "",
      roleId: String(item.role?.id ?? ""),
      fullName: item.userDetail?.fullName ?? "",
      phone: item.userDetail?.phoneNumber ?? "",
      address: item.userDetail?.address ?? "",
      city: item.userDetail?.city ?? "",
      country: item.userDetail?.country ?? "",
      postalCode: item.userDetail?.postalCode ?? "",
      bio: item.userDetail?.bio ?? "",
      dob: item.userDetail?.dateOfBirth ?? "",
      gender: item.userDetail?.gender ?? "",
      avatarFile: null,
      currentAvatarUrl: item.userDetail?.avatarUrl ?? "",
    });
  };

  const handleModalDetailData = (item: IUser) => {
    setDetailModalOpen(!detailModalOpen);
    getUserDetail(item);
  };

  const clearInput = () => {
    setForm(initialForm);

    setEmail("");
    setUsername("");
    setNewPassword("");
    setName("");
    setEmployeeNumber("");
    setNik("");

    setModalOpen(false);
    setModalType(null);
    setId("");
  };

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const [filterPayload, setFilterPayload] = useState<unknown>(undefined);

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  useEffect(() => {
    void getData(page, pageSize, debouncedSearch, filterPayload);
  }, [page, pageSize, debouncedSearch, filterPayload, getData]);

  const handleFilterChange = (payload: unknown) => {
    setFilterPayload(payload);
    getData(page, pageSize, debouncedSearch, payload);
  };

  const handleClearPayload = () => {
    setFilterPayload(undefined);
    setPage(1);

    Swal.fire({
      icon: "success",
      title: "Filter Berhasil Dihapus",
      position: "top-right",
      toast: true,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleUnActiveUser = (userId: string, status: string) => {
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
            await userService.unActiveUser(userId);
            Swal.fire({
              icon: "success",
              title: `Berhasil Menonaktifkan Pengguna`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
          } else {
            await userService.activateUser(userId);
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

  const handleResendPassword = async (userId: string) => {
    Swal.fire({
      icon: "warning",
      text: `Apakah anda ingin mengirim ulang password ke pengguna ini?`,
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
          await userService.resendPassword(userId);
          setIsLoading(false);

          Swal.fire({
            icon: "success",
            title: `Password berhasil dikirim ulang`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (e) {
          setIsLoading(false);

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
      } else if (result.isConfirmed === false) {
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

  return (
    <>
      <div className="w-full h-full">
        <ModalUpsertUser
          isOpen={isModalOpen}
          title={title}
          type={modalType === "edit" ? "edit" : "create"}
          values={form}
          onChange={handleFormChange}
          onClose={handleCancel}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />

        <DetailModalUser
          isOpen={detailModalOpen}
          title={"Detail Pengguna"}
          data={selectedData}
          onClose={() => setDetailModalOpen(false)}
          onCancel={() => setDetailModalOpen(false)}
        />

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
                resendPassword: handleResendPassword,
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
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
