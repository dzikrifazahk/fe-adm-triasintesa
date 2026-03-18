"use client";

import { Button } from "@/components/ui/button";
import { IAttendance } from "@/types/attendance";
import {
  AttendanceStatus,
  STATUS_CLASS,
  toAttendanceStatus,
} from "@/utils/attendanceStatuses";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { getDictionary } from "../../../../get-dictionary";
import { ITop5Output } from "@/types/project";

type childProps = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
};

export const columns = (props: childProps): ColumnDef<IAttendance>[] => [
  {
    accessorFn: (row) => row.created_by || "-",
    id: "Nama Pegawai",
    header: "Nama Pegawai",
    cell: ({ row }) => {
      const value = row.original.created_by || "-";
      const type = row.original.type || "-";

      const badgeColor = type === "ATTENDANCE" ? "bg-green-500" : "bg-red-500";

      return (
        <div className="flex flex-col ">
          <div className="text-md font-bold">{value}</div>
          <div>
            <span
              className={`inline-block ${badgeColor} text-white text-[9px] px-2 py-0.5 rounded-full`}
            >
              {type}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "project_name",
    id: "Nama Proyek",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Proyek
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorFn: (row) => row.budget_name || "-",
    id: "Nama Pekerjaan",
    header: "Nama Pekerjaan",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorFn: (row) => format(row.start_time, "dd MMM yyyy HH:mm:ss") || "-",
    id: "Jam Masuk",
    header: "Jam Masuk",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorFn: (row) => {
      if (row.end_time) {
        return format(new Date(row.end_time), "dd MMM yyyy HH:mm:ss");
      }
      return "-";
    },
    id: "Jam Keluar",
    header: "Jam Keluar",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorFn: (row) => {
      if (row.late_cut) {
        return formatCurrencyIDR(row.late_cut);
      }
      return "Rp. -";
    },
    id: "Late Cut",
    header: "Late Cut",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorFn: (row) => {
      if (row.bonus_ontime) {
        return formatCurrencyIDR(row.bonus_ontime);
      }
      return "Rp. -";
    },
    id: "Bonus Ontime",
    header: "Bonus Ontime",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorFn: (row) => row.status || "-",
    id: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const statusStyle = STATUS_CLASS[toAttendanceStatus(value)];
      const status: AttendanceStatus = AttendanceStatus.ONTIME;
      const statusStyle2 = STATUS_CLASS[status];

      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle}`}
        >
          {value}
        </span>
      );
    },
  },
];

export const columnTop5Output = (): ColumnDef<ITop5Output>[] => [
  {
    accessorKey: "id",
    header: "No. Dokumen",
  },
  {
    accessorKey: "name",
    header: "Nama Dokumen",
  },
  {
    accessorKey: "real_cost",
    header: "Real Cost",
    cell: ({ row }) => {
      const value = row.original.real_cost || 0;
      return <span>{formatCurrencyIDR(value)}</span>;
    },
  },
];
