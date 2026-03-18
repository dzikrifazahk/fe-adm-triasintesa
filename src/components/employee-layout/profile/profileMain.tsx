"use client";

import { Modal } from "@/components/custom/modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { userService } from "@/services";
import { IAddUser, IUserDetail } from "@/types/user";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import axios from "axios";
import { getCookie } from "cookies-next";
import { EditIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function ProfileEmpMain() {
  const [user, setUser] = useState<IUserDetail | null>(null);
  const [showModal, setShowModal] = useState<{
    show: boolean;
    type: "user" | "bank";
    title: string;
  }>({
    show: false,
    title: "",
    type: "user",
  });
  const [isLoading, setIsLoading] = useState(false);

  const [formUser, setFormUser] = useState<{
    email: string;
    name: string;
    nik: string;
  }>();
  const [formBank, setFormBank] = useState<{
    bank_name: string;
    bank_account: string;
  }>();

  const getData = async (userId: number) => {
    try {
      const response = await userService.getUser(String(userId));
      setUser(response.data);
    } catch (error) {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<IAddUser> = {};

    if (formUser?.name) {
      payload.name = formUser.name;
    }
    if (formUser?.email) {
      payload.email = formUser?.email;
    }
    if (formUser?.nik) {
      payload.nik = formUser?.nik;
    }

    if (user?.daily_salary !== null && user?.daily_salary !== undefined) {
      payload.daily_salary = Number(user?.daily_salary);
    }
    if (user?.hourly_salary !== null && user?.hourly_salary !== undefined) {
      payload.hourly_salary = Number(user?.hourly_salary);
    }
    if (
      user?.hourly_overtime_salary !== null &&
      user?.hourly_overtime_salary !== undefined
    ) {
      payload.hourly_overtime_salary = Number(user?.hourly_overtime_salary);
    }
    if (user?.transport !== null && user?.transport !== undefined) {
      payload.transport = Number(user?.transport);
    }
    if (user?.makan !== null && user?.makan !== undefined) {
      payload.makan = Number(user?.makan);
    }

    if (
      formBank?.bank_name !== null &&
      formBank?.bank_name !== undefined &&
      formBank?.bank_name !== ""
    ) {
      payload.bank_name = formBank?.bank_name;
    }
    if (
      formBank?.bank_account !== null &&
      formBank?.bank_account !== undefined &&
      formBank?.bank_account !== ""
    ) {
      payload.account_number = formBank?.bank_account;
    }

    Swal.fire({
      icon: "warning",
      text: `Apakah anda ingin mengubah data ${
        showModal.type === "user" ? "karyawan" : "bank"
      } anda?`,
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
            String(user!.id || 0),
            payload as IAddUser
          );
          getData(Number(user!.id || 0));
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
          setShowModal({ show: false, title: "", type: "user" });
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
  };

  useEffect(() => {
    if (getCookie("userData")) {
      const cookieUser = JSON.parse(`${getCookie("userData")}`);

      getData(cookieUser.uniqueId);
    }
  }, [getCookie("userData")]);

  return (
    <div className="w-full p-5">
      <div className="font-sans-bold text-3xl mb-5">Profil Saya</div>

      <div className="flex flex-col gap-5">
        {/* USER INFORMATION */}
        <div className="w-full bg-gray-100 rounded-md p-2 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Informasi Pengguna</h1>
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() =>
              setShowModal({ show: true, type: "user", title: "Edit Pengguna" })
            }
          >
            <EditIcon /> Edit
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 px-3">
          <div className="flex flex-col w-full gap-2">
            <span className="text-sm sm:text-base font-sans-bold">
              Nomor Pegawai
            </span>
            <span>{user?.nomor_karyawan ?? "-"}</span>
          </div>
          <div className="flex flex-col w-full gap-2">
            <span className="text-sm sm:text-base font-sans-bold">Nama</span>
            <span>{user?.name ?? "-"}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 px-3">
          <div className="flex flex-col w-full gap-2">
            <span className="text-sm sm:text-base font-sans-bold">NIK</span>
            <span>{user?.nik ?? "-"}</span>
          </div>
          <div className="flex flex-col w-full gap-2">
            <span className="text-sm sm:text-base font-sans-bold">
              Role Pengguna
            </span>
            <span>{user?.roles?.role_name ?? "-"}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 px-3">
          <div className="flex flex-col w-full gap-2">
            <span className="text-sm sm:text-base font-sans-bold">Email</span>
            <span>{user?.email ?? "-"}</span>
          </div>
          <div className="flex flex-col w-full gap-2">
            <span className="text-sm sm:text-base font-sans-bold">Divisi</span>
            <span>{user?.divisi?.name ?? "-"}</span>
          </div>
        </div>

        {/* ACCOUNT NUMBER INFORMATION */}
        <div className="w-full bg-gray-100 rounded-md p-2 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Informasi Rekening</h1>
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() =>
              setShowModal({ show: true, type: "bank", title: "Edit Rekening" })
            }
          >
            <EditIcon /> Edit
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-3">
          <div className="flex flex-col gap-2">
            <span className="text-sm sm:text-base font-sans-bold">
              Nama Bank
            </span>
            <span>{user?.bank_name ?? "-"}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm sm:text-base font-sans-bold">
              Nomor Rekening
            </span>
            <span>{user?.account_number ?? "-"}</span>
          </div>
        </div>
        {/* SALARY INFORMATION */}
        <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
          Informasi Upah
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-3">
          <div className="flex flex-col gap-2">
            <span className="text-sm sm:text-base font-sans-bold">
              Gaji Harian
            </span>
            <span>{formatCurrencyIDR(user?.daily_salary) ?? "-"}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm sm:text-base font-sans-bold">
              Gaji Per Jam
            </span>
            <span>{formatCurrencyIDR(user?.hourly_salary) ?? "-"}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm sm:text-base font-sans-bold">
              Gaji Lembur
            </span>
            <span>
              {formatCurrencyIDR(user?.hourly_overtime_salary) ?? "-"}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm sm:text-base font-sans-bold">
              Uang Transport
            </span>
            <span>{formatCurrencyIDR(user?.transport) ?? "-"}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm sm:text-base font-sans-bold">
              Uang Makan
            </span>
            <span>{formatCurrencyIDR(user?.makan) ?? "-"}</span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal.show}
        onClose={() => setShowModal({ show: false, type: "user", title: "" })}
        title={showModal.title}
        width="w-[80vw]"
        onSubmit={handleSubmit}
        onCancel={() => setShowModal({ show: false, type: "user", title: "" })}
      >
        <div className="w-full">
          <div className="m-3 flex flex-col">
            {showModal.type === "user" && (
              <UserEditForm
                user={user ? user : ({} as IUserDetail)}
                onChange={(e) => setFormUser(e)}
              />
            )}
            {showModal.type === "bank" && (
              <BankEditForm
                user={user ? user : ({} as IUserDetail)}
                onChange={(e) => setFormBank(e)}
              />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function UserEditForm({
  user,
  onChange,
}: {
  user: IUserDetail;
  onChange: (data: { email: string; name: string; nik: string }) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [nik, setNik] = useState(user.nik);

  useEffect(() => {
    onChange({
      email,
      name,
      nik,
    });
  }, [name, email, nik]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <span className="font-sans lg:text-lg text-sm">
          Nama Karyawan
          <span className="text-red-500 ml-1">*</span>
        </span>
        <label className="input border-slate-400 gap-2">
          <Input
            type="text"
            className="grow text-primary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Karyawan"
            required
          />
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-sans lg:text-lg text-sm">
          Nik Karyawan
          <span className="text-red-500 ml-1">*</span>
        </span>
        <label className="input border-slate-400 gap-2">
          <Input
            type="text"
            className="grow text-primary"
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            placeholder="Nik Karyawan"
            required
          />
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-sans lg:text-lg text-sm">
          Email Karyawan
          <span className="text-red-500 ml-1">*</span>
        </span>
        <label className="input border-slate-400 gap-2">
          <Input
            type="text"
            className="grow text-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Karyawan"
            required
          />
        </label>
      </div>
    </div>
  );
}

function BankEditForm({
  user,
  onChange,
}: {
  user: IUserDetail;
  onChange: (data: { bank_name: string; bank_account: string }) => void;
}) {
  const [bank, setBank] = useState(user.bank_name);
  const [account, setAccount] = useState(user.account_number);

  useEffect(() => {
    onChange({
      bank_name: bank ?? "",
      bank_account: account ?? "",
    });
  }, [bank, account]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <span className="font-sans lg:text-lg text-sm">
          Nama Bank
          <span className="text-red-500 ml-1">*</span>
        </span>
        <label className="input border-slate-400 flex items-center gap-2">
          <Input
            type="text"
            className="grow text-primary"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="Nama Bank"
            required
          />
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-sans lg:text-lg text-sm">
          Nomor Rekening
          <span className="text-red-500 ml-1">*</span>
        </span>
        <label className="input border-slate-400 flex items-center gap-2">
          <Input
            type="text"
            className="grow text-primary"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="Nomor Rekening"
            required
          />
        </label>
      </div>
    </div>
  );
}
