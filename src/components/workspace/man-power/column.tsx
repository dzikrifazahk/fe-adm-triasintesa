"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { getDictionary } from "../../../../get-dictionary";
import { IAttendance } from "@/types/attendance";
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
import { AttendanceStatus, STATUS_CLASS, toAttendanceStatus } from "@/utils/attendanceStatuses";

type childProps = {
  deleteData?: (id: string) => void;
  editData?: (id: string) => void;
  viewDetailData?: (id: string, data: IAttendance) => void;
  printPayslip?: (id: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  roleId: number;
};

export const columns = (props: childProps): ColumnDef<IAttendance>[] => [
  //   {
  //     id: "select",
  //     header: ({ table }) => (
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && "indeterminate")
  //         }
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     ),
  //     cell: ({ row }) => (
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     ),
  //     enableSorting: false,
  //     enableHiding: false,
  //   },
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
    id: "start_time",
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
    id: "end_time",
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
    id: "late_cut",
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
    id: "bonus_ontime",
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

      // const statusStyle =
      //   value.toLowerCase() === "in"
      //     ? "bg-green-100 text-green-700"
      //     : value.toLowerCase() === "out"
      //     ? "bg-red-100 text-red-700"
      //     : "bg-gray-100 text-gray-700";

      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle}`}
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
      const status = row.original.status;
      const roleNumber = props.roleId;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-center">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex flex-col gap-2">
              <DropdownMenuItem
                className="border border-slate-500 cursor-pointer"
                onClick={() => props.viewDetailData?.(data?.id ?? "", data)}
              >
                <FaEye className="text-primary" />
                Lihat Detail
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
