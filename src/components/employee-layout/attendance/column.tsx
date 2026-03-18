"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { IContact } from "@/types/contact";
import { FaClipboardUser, FaEye, FaPencil, FaTrash } from "react-icons/fa6";
import { getDictionary } from "../../../../get-dictionary";
import { IAttendance } from "@/types/attendance";
import { format } from "date-fns";

type childProps = {
  deleteData?: (id: string) => void;
  editData?: (id: string) => void;
  viewDetailData?: (id: string) => void;
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
    accessorKey: "project_name",
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
    accessorFn: (row) => row.task_name || "-",
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
    accessorFn: (row) => row.status || "-",
    id: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const value = getValue() as string;

      const statusStyle =
        value.toLowerCase() === "in"
          ? "bg-green-100 text-green-700"
          : value.toLowerCase() === "out"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";

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
