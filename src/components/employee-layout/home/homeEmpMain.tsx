"use client";
import { useEffect, useMemo, useState } from "react";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import HeaderHero from "./headerHero";
import AttendanceList from "./attendanceList";
import QuickActions from "./quickActions";
import { attendanceService } from "@/services";
import Swal from "sweetalert2";
import { AxiosError } from "axios";
import { getUser } from "@/services/base.service";
import { IUser } from "@/types/user";
import mapRoleToString from "@/utils/setRole";
import MobileBottomBar from "@/components/custom/mobileBottomNavigation";
import AttendanceActions from "@/components/custom/attendanceActions";
import { format } from "date-fns";
import { IOvertime } from "@/types/overtime";
import { usePathname, useRouter } from "next/navigation";
import { isLocale } from "@/middleware";
import { i18n } from "../../../../i18n-config";

export default function HomeEmpMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
}) {
  const { setIsLoading } = useLoading();
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split("/");
  const locale = isLocale(segments[1]) ? segments[1] : i18n.defaultLocale;

  // Demo states (replace with API integration later)
  const [openAttendance, setOpenAttendance] = useState(false);
  const [checkInAt, setCheckInAt] = useState<string | null>(null);
  const [checkOutAt, setCheckOutAt] = useState<string | null>(null);
  const [userData, setUserData] = useState<IUser | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<boolean | null>(null);
  const [checkOutStatus, setCheckOutStatus] = useState<boolean | null>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [overtimeData, setOvertimeData] = useState<IOvertime | null>(null);
  const [isOvertimeFinish, setIsOvertimeFinish] = useState<boolean | null>(
    null
  );
  const today = useMemo(() => new Date(), []);

  const getCICOStatus = async () => {
    try {
      const { data } = await attendanceService.getAttendance();
      setAttendanceData(data);
      setCheckInAt(format(data.start_time, "HH:mm") ?? null);
      setCheckOutAt(format(data.end_time, "HH:mm") ?? null);
    } catch (error: any) {
      // console.log(error.response.data.message);
      // console.log(error.status);
      if (
        error.status === 400 &&
        error.response.data.message.toLowerCase() === "user not attendance now!"
      ) {
        setCheckInStatus(false);
        setCheckOutStatus(false);
        Swal.fire({
          icon: "warning",
          title: "Oops...",
          text: "Anda belum melakukan check in!",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  };

  const getOvertimeData = async () => {
    try {
      const { data } = await attendanceService.getOvertime();
      setOvertimeData(data);
    } catch (error: any) {
      if (
        error.status === 400 &&
        error.response.data.message.toLowerCase() ===
          "overtime already finished"
      ) {
        setIsOvertimeFinish(true);
      }
      if (
        error.status === 400 &&
        error.response.data.message.toLowerCase() === "overtime not found"
      ) {
        setOvertimeData(null);
        setIsOvertimeFinish(false);
      }
    }
  };

  const handleGetDataCheckIn = () => {
    getCICOStatus();
  };

  const handleGetDataCheckOut = () => {
    getCICOStatus();
    getOvertimeData();
  };

  useEffect(() => {
    const user = getUser();
    setUserData(user);
    getCICOStatus();
  }, []);

  useEffect(() => {
    if (checkInAt && checkOutAt) {
      getOvertimeData();
    }
  }, [checkInAt, checkOutAt]);

  return (
    <>
      <div className="w-full h-full">
        <HeaderHero
          name={`${userData?.name ?? "-"}`}
          roleTitle={`${
            mapRoleToString(Number(userData?.roleId)) ?? undefined
          }  ${userData?.divisi?.name ? `-` + userData?.divisi?.name : ""}`}
          companyLogoText="PT Dama Karya Makmur"
          checkInAt={checkInAt}
          checkOutAt={checkOutAt}
          onCheckIn={() => setOpenAttendance(true)}
          onCheckOut={() => setOpenAttendance(true)}
          disableCheckIn={!!checkInAt}
          disableCheckOut={!checkInAt || !!checkOutAt}
        />

        {overtimeData && (
          <div className="mx-4 mb-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6 text-yellow-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">
                  Anda memiliki lembur hari ini
                </h3>
                <p className="text-xs text-yellow-700">
                  1 tugas lembur terdaftar. Pastikan Anda melakukan check-in
                  lembur.
                </p>
              </div>
            </div>
            <button
              className="rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700 transition"
              onClick={() => {
                // misalnya buka modal attendance
                setOpenAttendance(true);
              }}
            >
              Lihat
            </button>
          </div>
        )}

        <QuickActions
          items={[
            { key: "attendance", title: "Kehadiran", icon: "clock" },
            // { key: "act", title: "Aktivitas", icon: "check" },
            // { key: "task", title: "Daftar Tugas", icon: "list" },
            { key: "leave", title: "Cuti", icon: "hat" },
            { key: "overtime", title: "Lembur", icon: "doc" },
            { key: "cash-advance", title: "Kasbon", icon: "kasbon" },
            { key: "payroll", title: "Penggajian", icon: "payroll" },
            { key: "more", title: "Lainnya", icon: "grid" },
          ]}
          onSelect={(k) => {
            if (
              k === "leave" ||
              k === "cash-advance" ||
              k === "payroll" ||
              k === "overtime" ||
              k === "attendance"
            ) {
              router.push(`/${locale}/${k}`);
            }
            console.log("");
          }}
        />

        {/* <AttendanceList
          title="Kehadiran"
          seeAllHref="#"
          items={[
            {
              id: "1",
              dateLabel: "Kemarin (31 August 2025)",
              status: "Tidak Hadir",
              subtle: "",
            },
            {
              id: "2",
              dateLabel: "Saturday, 30 Aug 2025",
              status: "Tidak Hadir",
              subtle: "-2 10881 Jam 8 Menit",
            },
          ]}
        /> */}
      </div>

      <MobileBottomBar
        activeTab="home"
        onTabChange={(k) => {
          if (k == "profile") {
            router.push(`/${locale}/profile`);
          }
        }}
        isCheckedIn={!!checkInAt}
        disableCheckIn={!!checkInAt}
        disableCheckOut={!checkInAt || !!checkOutAt}
        onOpenAttendance={() => setOpenAttendance(true)}
      />

      <AttendanceActions
        open={openAttendance}
        onOpenChange={setOpenAttendance}
        checkInStatus={checkInStatus}
        isCheckedIn={!!checkInAt}
        isCheckedOut={!!checkOutAt}
        isOvertime={!!overtimeData}
        overtimeData={overtimeData}
        disableCheckIn={!!checkInAt}
        disableCheckOut={!checkInAt || !!checkOutAt}
        onCheckIn={handleGetDataCheckIn}
        onCheckOut={handleGetDataCheckOut}
        overtimeFinish={isOvertimeFinish}
      />
    </>
  );
}
