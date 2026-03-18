"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { IAdjustmentAttendance, IAttendance } from "@/types/attendance";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaEye } from "react-icons/fa6";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import {
  AttendanceStatus,
  STATUS_CLASS,
  toAttendanceStatus,
} from "@/utils/attendanceStatuses";
import { getDictionary } from "../../../../../get-dictionary";

type childProps = {
  viewDetailData?: (id: string, data: IAttendance) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  roleId: number;
};

export const adjustmentColumns = (
  props: childProps,
): ColumnDef<IAdjustmentAttendance>[] => [
  {
    accessorFn: (row) => row.pic_name || "-",
    id: "Nama PIC",
    header: "Nama PIC",
    cell: ({ row }) => {
      const value = row.original.pic_name || "-";
      const requestBy = row.original.request_by || "-";

      return (
        <div className="flex flex-col">
          <div className="text-md font-bold">{value}</div>
          <span className="text-xs text-gray-500">{requestBy}</span>
        </div>
      );
    },
  },

  {
    accessorFn: (row) =>
      row.old_start_time
        ? format(new Date(row.old_start_time), "dd MMM yyyy HH:mm:ss")
        : "-",
    id: "old_start_time",
    header: "Jam Masuk Lama",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },

  {
    accessorFn: (row) =>
      row.old_end_time
        ? format(new Date(row.old_end_time), "dd MMM yyyy HH:mm:ss")
        : "-",
    id: "old_end_time",
    header: "Jam Keluar Lama",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },

  {
    accessorFn: (row) =>
      row.new_start_time
        ? format(new Date(row.new_start_time), "dd MMM yyyy HH:mm:ss")
        : "-",
    id: "new_start_time",
    header: "Jam Masuk Baru",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },

  {
    accessorFn: (row) =>
      row.new_end_time
        ? format(new Date(row.new_end_time), "dd MMM yyyy HH:mm:ss")
        : "-",
    id: "new_end_time",
    header: "Jam Keluar Baru",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },

  {
    accessorKey: "reason",
    header: "Alasan",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value || "-"}</span>;
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const value = (getValue() as string) || "-";

      const statusColor =
        value === "waiting"
          ? "bg-yellow-100 text-yellow-700"
          : value === "approved"
            ? "bg-green-100 text-green-700"
            : value === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700";

      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
        >
          {value}
        </span>
      );
    },
  },

  {
    accessorKey: "actions",
    header: props.dictionary.attendance.column.actions,
    cell: ({ row }) => {
      const data = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          {/* <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-center">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="border border-slate-500 cursor-pointer"
              onClick={() => props.viewDetailData?.(String(data.id), data)}
            >
              <FaEye className="text-primary" />
              Lihat Detail
            </DropdownMenuItem>
          </DropdownMenuContent> */}
        </DropdownMenu>
      );
    },
  },
];
