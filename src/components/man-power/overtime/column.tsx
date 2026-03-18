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
import {
  FaEye,
  FaHandshake,
  FaHandshakeSlash,
  FaPencil,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";
import { getDictionary } from "../../../../get-dictionary";
import { format } from "date-fns";
import { IOvertime } from "@/types/overtime";

type childProps = {
  deleteData?: (id: string) => void;
  editData?: (id: string) => void;
  viewDetailData?: (id: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  roleId: number;
  approval: (id: string, action: string) => void;
};

export const columns = (props: childProps): ColumnDef<IOvertime>[] => [
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
    accessorFn: (row) => row.budget_nama || "-",
    id: "Nama Pekerjaan",
    header: "Nama Pekerjaan",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorFn: (row) => format(row.request_date, "dd MMM yyyy") || "-",
    id: "Request Date",
    header: "Tanggal Permintaan",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  // {
  //   accessorFn: (row) => row. || "-",
  //   id: "Duration",
  //   header: "Durasi",
  //   cell: ({ getValue }) => {
  //     const value = getValue() as string;
  //     return <span>{value} Jam</span>;
  //   },
  // },
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
    id: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const value = (getValue() as string)?.toLowerCase();

      const statusStyle = (() => {
        switch (value) {
          case "approved":
            return "bg-blue-100 text-blue-700";
          case "waiting":
            return "bg-amber-100 text-amber-700";
          case "rejected":
            return "bg-red-100 text-red-700";
          case "cancelled":
            return "bg-rose-100 text-rose-700";
          default:
            return "bg-gray-100 text-gray-700";
        }
      })();

      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyle}`}
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
              {status === "waiting" &&
                (roleNumber === 3 || roleNumber === 2 || roleNumber === 1) && (
                  <>
                    <DropdownMenuItem
                      className="border border-slate-500 cursor-pointer"
                      onClick={() =>
                        props.approval?.(data?.id ?? "", "approved")
                      }
                    >
                      <FaHandshake className="text-green-500" />
                      Approval
                    </DropdownMenuItem>
                  </>
                )}
              {(roleNumber === 4 ||
                roleNumber === 3 ||
                roleNumber === 2 ||
                roleNumber === 1) && (
                <>
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
                </>
              )}
              <DropdownMenuItem
                className="border border-slate-500 cursor-pointer"
                onClick={() => props.viewDetailData?.(data?.id ?? "")}
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
