"use client";
import { ModalDetail } from "@/components/custom/modalDetail";
import { IUserDetail } from "@/types/user";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";

interface DetailModalUserProps {
  data?: IUserDetail | null;
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  onCancel: () => void;
}

export const DetailModalUser = ({
  data,
  isOpen,
  title,
  onClose,
  onSubmit,
  onCancel,
}: DetailModalUserProps) => {
  return (
    <>
      <ModalDetail
        isOpen={isOpen}
        title={title ?? "Detail Pengguna"}
        width="w-[85vw]"
        onClose={onClose}
        onSubmit={onSubmit}
        onCancel={onCancel}
      >
        <div className="w-full">
          <div className="m-3 flex flex-col gap-5">
            {/* USER INFORMATION */}
            <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
              Informasi Pengguna
            </div>

            <div className="flex flex-col sm:flex-row gap-5 px-3">
              <div className="flex flex-col w-full gap-2">
                <span className="text-sm sm:text-base font-sans-bold">
                  Nomor Pegawai
                </span>
                <span>{data?.nomor_karyawan ?? "-"}</span>
              </div>
              <div className="flex flex-col w-full gap-2">
                <span className="text-sm sm:text-base font-sans-bold">
                  Nama
                </span>
                <span>{data?.name ?? "-"}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 px-3">
              <div className="flex flex-col w-full gap-2">
                <span className="text-sm sm:text-base font-sans-bold">NIK</span>
                <span>{data?.nik ?? "-"}</span>
              </div>
              <div className="flex flex-col w-full gap-2">
                <span className="text-sm sm:text-base font-sans-bold">
                  Role Pengguna
                </span>
                <span>{data?.roles?.role_name ?? "-"}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 px-3">
              <div className="flex flex-col w-full gap-2">
                <span className="text-sm sm:text-base font-sans-bold">
                  Email
                </span>
                <span>{data?.email ?? "-"}</span>
              </div>
              <div className="flex flex-col w-full gap-2">
                <span className="text-sm sm:text-base font-sans-bold">
                  Divisi
                </span>
                <span>{data?.divisi?.name ?? "-"}</span>
              </div>
            </div>

            {/* ACCOUNT NUMBER INFORMATION */}
            <div className="text-lg font-semibold w-full bg-gray-100 rounded-md p-2">
              Informasi Rekening
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-3">
              <div className="flex flex-col gap-2">
                <span className="text-sm sm:text-base font-sans-bold">
                  Nama Bank
                </span>
                <span>{data?.bank_name ?? "-"}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm sm:text-base font-sans-bold">
                  Nomor Rekening
                </span>
                <span>{data?.account_number ?? "-"}</span>
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
                <span>{formatCurrencyIDR(data?.daily_salary) ?? "-"}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm sm:text-base font-sans-bold">
                  Gaji Per Jam
                </span>
                <span>{formatCurrencyIDR(data?.hourly_salary) ?? "-"}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm sm:text-base font-sans-bold">
                  Gaji Lembur
                </span>
                <span>
                  {formatCurrencyIDR(data?.hourly_overtime_salary) ?? "-"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm sm:text-base font-sans-bold">
                  Uang Transport
                </span>
                <span>{formatCurrencyIDR(data?.transport) ?? "-"}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm sm:text-base font-sans-bold">
                  Uang Makan
                </span>
                <span>{formatCurrencyIDR(data?.makan) ?? "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </ModalDetail>
    </>
  );
};
