"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { getDictionary } from "../../get-dictionary";
import { Modal } from "./custom/modal";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import Swal from "sweetalert2";
import { useLoading } from "@/context/loadingContext";
import { authService } from "@/services";
import { deleteCookie, getCookies } from "cookies-next";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["primary_sidebar"];
  isOpen: boolean;
  title: string;
  onClose: () => void;
  isGetData: () => void;
}

export function ChangePasswordAuthenticated({
  dictionary,
  isOpen,
  title,
  onClose,
  isGetData,
}: Props) {
  const { setIsLoading } = useLoading();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [cookies, setCookies] = useState<any>(null);

  const passwordChecks = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
    };
  }, [newPassword]);

  const clearInput = () => {
    setCurrentPassword("");
    setNewPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setIsRuleDialogOpen(false);
  };

  const handleClose = () => {
    clearInput();
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin mengubah password ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (!result.isConfirmed)
        Swal.fire({
          icon: "info",
          text: "Perubahan tidak disimpan",
          position: "center",
          showConfirmButton: true,
        });
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          const response = await authService.changePasswordAuthenticated(
            currentPassword,
            newPassword,
          );

          if (response.statusCode === 200) {
            setIsLoading(false);
            clearInput();
            for (let key in cookies) {
              deleteCookie(key);
            }
            Swal.fire({
              icon: "success",
              title: "Perubahan berhasil disimpan, Silahkan login kembali",
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 1700,
            }).then(() => {
              window.location.replace("/");
            });
          }
        } catch (e: any) {
          setIsLoading(false);
          clearInput();

          let errorMessage = "Gagal menyimpan perubahan";

          if (e?.response?.data?.message) {
            if (Array.isArray(e.response.data.message)) {
              errorMessage = e.response.data.message.join(", ");
            } else {
              errorMessage = e.response.data.message;
            }
          }

          Swal.fire({
            icon: "error",
            text: errorMessage,
            position: "center",
            showConfirmButton: true,
          });
        }
      }
    });
  };

  useEffect(() => {
    const cookiesData = getCookies();
    setCookies(cookiesData);
  }, []);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        onCancel={handleClose}
        onSubmit={handleSubmit}
      >
        <div className="p-5">
          <div className="mb-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setIsRuleDialogOpen(true)}
                className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-iprimary-blue text-white transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-iprimary-blue/30"
                aria-label="Lihat aturan password"
              >
                <span className="absolute inset-0 rounded-full bg-iprimary-blue/30 animate-ping" />
                <span className="absolute inset-[-6px] rounded-full border border-iprimary-blue/25" />
                <span className="absolute inset-[-12px] rounded-full border border-iprimary-blue/15" />
                <span className="relative z-10">
                  <AlertCircle className="h-5 w-5" />
                </span>
              </button>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Ubah Password
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsRuleDialogOpen(true)}
                    className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-iprimary-blue transition hover:bg-blue-100"
                  >
                    Lihat aturan password
                  </button>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Masukkan password saat ini dan password baru untuk memperbarui
                  keamanan akun Anda.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Password Saat Ini <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="pr-12"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-slate-700"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Password Baru <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    className="pr-12"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-slate-700"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/60 px-3 py-2 text-xs text-slate-600">
                Tips: klik ikon alert biru untuk melihat panduan password dengan
                detail.
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <LockKeyhole className="h-5 w-5 text-iprimary-blue" />
              Aturan Password Baru
            </DialogTitle>
            <DialogDescription>
              Gunakan password yang kuat agar akun Anda lebih aman.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">
                Password baru sebaiknya memiliki:
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <PasswordRule
                  label="Minimal 8 karakter"
                  valid={passwordChecks.minLength}
                />
                <PasswordRule
                  label="Huruf besar"
                  valid={passwordChecks.hasUppercase}
                />
                <PasswordRule
                  label="Huruf kecil"
                  valid={passwordChecks.hasLowercase}
                />
                <PasswordRule label="Angka" valid={passwordChecks.hasNumber} />
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-600">
              Hindari menggunakan nama sendiri, tanggal lahir, atau kombinasi
              yang mudah ditebak.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PasswordRule({ label, valid }: { label: string; valid: boolean }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm transition ${
        valid
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {label}
    </div>
  );
}
