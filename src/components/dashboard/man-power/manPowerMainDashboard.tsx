import { IAttendance } from "@/types/attendance";
import { getDictionary } from "../../../../get-dictionary";
import { attendanceService, projectService } from "@/services";
import { useEffect, useState } from "react";
import { IMeta } from "@/types/common";
import useDebounce from "@/utils/useDebouncy";
import { useLoading } from "@/context/loadingContext";
import { DataTable, DataTableTop5Output } from "./data-table";
import { columns, columnTop5Output } from "./columns";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp } from "@tabler/icons-react";
import ManPowerSectionCard from "./manPowerSectionCard";
import { Calendar } from "@/components/ui/calendar";
import { set } from "date-fns";
import { ITop5Output } from "@/types/project";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["dashboard"];
}

const manPowerDictionary = {
  title: "Sumber Daya Manusia",
  description:
    "Kelola pinjaman, penggajian, absensi, dan lembur karyawan dengan mudah.",
  page_greetings: "Selamat datang di Halaman Sumber Daya Manusia",
  page_description:
    "Silakan pilih salah satu menu di atas untuk mulai mengelola pinjaman, penggajian, absensi, atau lembur karyawan.",
  apply_filter: "Terapkan Filter",
  cancel: "Batal",
  attendance: {
    title: "Kehadiran",
    description: "List Kehadiran",
    button_add_attendance: "Tambah Kehadiran",
    search_attendance_placeholder: "Cari Pegawai",
    select_attendance_placeholder: "Pilih Pegawai",
    column_filter: "Filter Kolom",
    select_status_placeholder: "Pilih Status",
    column: {
      name: "Name",
      division: "Division",
      date: "Date",
      status: "Status",
      actions: "Aksi",
    },
  },
  payroll: {
    title: "Penggajian",
    description: "Penggajian",
  },
  cash_advance: {
    title: "Kasbon",
    description: "List Kasbon",
  },
  overtime: {
    title: "Lembur",
    description: "List Lembur",
    button_add_overtime: "Tambah Lembur",
    search_overtime_placeholder: "Cari Pegawai",
    select_overtime_placeholder: "Pilih Pegawai",
    column_filter: "Filter Kolom",
    select_status_placeholder: "Pilih Status",
    column: {
      name: "Name",
      division: "Division",
      date: "Date",
      status: "Status",
      actions: "Actions",
    },
  },
};

export default function ManPowerMainDashboard({ dictionary }: Props) {
  const { setIsLoading } = useLoading();

  const [data, setData] = useState<IAttendance[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const [filterPayload, setFilterPayload] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [top5Output, setTop5Output] = useState<ITop5Output[]>([]);

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string,
    payload?: any
  ): Promise<IAttendance[]> => {
    let filterParams: Record<string, any> = {};
    if (pageSize || page) {
      filterParams = {
        page: page,
        per_page: pageSize,
        paginate: true,
        sort_type: "desc",
        sort_by: "created_at",
        show_overtime: 1,
      };
    }

    filterParams.search = search;

    if (payload) {
      filterParams = { ...filterParams, ...payload };
    }

    if (filterParams.date && Array.isArray(filterParams.date)) {
      filterParams.date = `[${filterParams.date.join(", ")}]`;
    }

    const { data, meta } = await attendanceService.getAttendances(filterParams);
    setData(data);
    setMetadata(meta);
    return data;
  };

  const getDataTop5Output = async () => {
    const { data } = await projectService.getTop5Output();

    setTop5Output(data);
  };

  const handleFilterChange = (payload: any) => {
    setFilterPayload(payload);

    getData(page, pageSize, debouncedSearch, payload);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getData(newPage, pageSize, debouncedSearch, filterPayload);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    getData(page, newPageSize, debouncedSearch, filterPayload);
  };

  useEffect(() => {
    setIsLoading(false);
    getData(page, pageSize);
    getDataTop5Output();
  }, []);

  useEffect(() => {
    getData(page, pageSize, debouncedSearch, filterPayload);
  }, [debouncedSearch]);

  return (
    <div className="p-4 space-y-5">
      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <ManPowerSectionCard />
          <div className="space-y-2">
            <h1 className="text-lg md:text-xl font-bold">Real Cost</h1>
            <DataTableTop5Output
              data={top5Output}
              columns={columnTop5Output()}
            />
          </div>
        </div>
        <div className="md:col-span-1">
          <div className="mx-auto w-full">
            <Calendar
              selected={date}
              mode="single"
              className="rounded-md border shadow-sm w-full"
              captionLayout="dropdown"
            />
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold">
              {manPowerDictionary.attendance.title}
            </h1>
            <p>{manPowerDictionary.attendance.description}</p>
          </div>
          <Button variant={"ghost"} asChild>
            <Link href={"/dashboard/man-power/attendance"}>
              Lihat Selengkapnya <ChevronRight />
            </Link>
          </Button>
        </div>
        <DataTable
          columns={columns({
            dictionary: manPowerDictionary,
          })}
          data={data}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          metadata={metadata}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          dictionary={manPowerDictionary}
        />
      </div>
    </div>
  );
}
