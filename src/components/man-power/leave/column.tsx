"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { FaEye, FaHandshake, FaPencil, FaTrash } from "react-icons/fa6";
import { getDictionary } from "../../../../get-dictionary";
import { format } from "date-fns";
import { ILeave } from "@/types/leave";
import { Badge } from "@/components/ui/badge";
import { mapLeaveType } from "@/helpers/leaveConvertion";
import { mapLeaveStatus } from "@/helpers/leaveStatus";

type childProps = {
  deleteData?: (id: number) => void;
  editData?: (id: number) => void;
  viewDetailData?: (id: number) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  roleId: number;
  approval: (id: number) => void;
};

export const columns = (props: childProps): ColumnDef<ILeave>[] => [
  {
    accessorFn: (row) => row.user_name || "-",
    id: "Nama Pegawai",
    header: "Nama Pegawai",
    cell: (row) => {
      const value = row.getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    id: "PIC",
    accessorKey: "PIC",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-md"
        >
          Nama PIC
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.original.pic_name || "-";
      return <span>{value}</span>;
    },
  },
  {
    id: "Kategori Cuti",
    accessorKey: "type",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-md"
        >
          Kategori Cuti
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => {
      const rawType = row.original.type; // 0 | 1 | 2
      const meta = mapLeaveType(rawType);

      return (
        <Badge
          variant="outline"
          className={`px-3 py-1 rounded-full text-xs font-medium ${meta.className}`}
        >
          {meta.label}
        </Badge>
      );
    },
  },
  {
    accessorFn: (row) => format(row.created_at, "dd/MM/yyyy HH:mm") || "-",
    id: "Request Date",
    header: "Tanggal Permintaan",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorFn: (row) => format(row.start_date, "dd/MM/yyyy HH:mm") || "-",
    id: "Tanggal Mulai",
    header: "Tanggal Mulai",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorFn: (row) => format(row.end_date, "dd/MM/yyyy HH:mm") || "-",
    id: "Tanggal Selesai",
    header: "Tanggal Selesai",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorFn: (row) => row.reason || "-",
    id: "Alasan",
    header: "Alasan / Deskripsi",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorFn: (row) => row.status || "-",
    id: "Status",
    header: "Status",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const meta = mapLeaveStatus(value);

      return (
        <Badge
          variant="outline"
          className={`px-3 py-1 rounded-full text-xs font-medium ${meta.className}`}
        >
          {meta.label}
        </Badge>
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
              {status === "waiting" &&
                (roleNumber === 3 || roleNumber === 2 || roleNumber === 1) && (
                  <>
                    <DropdownMenuItem
                      className="border border-slate-500 cursor-pointer"
                      onClick={() => props.approval?.(data?.id ?? "")}
                    >
                      <FaHandshake className="text-green-500" />
                      Approval
                    </DropdownMenuItem>
                  </>
                )}
              <DropdownMenuItem
                className="border border-red-500 cursor-pointer"
                onClick={() => props.deleteData?.(data?.id ?? "")}
              >
                <FaTrash className="text-red-400" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border border-yellow-500 cursor-pointer"
                onClick={() => props.editData?.(data?.id ?? "")}
              >
                <FaPencil className="text-yellow-400" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border border-slate-500 cursor-pointer"
                onClick={() => props.viewDetailData?.(data.id ?? "")}
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
