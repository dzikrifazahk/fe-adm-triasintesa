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
import { MoreHorizontal } from "lucide-react";
import {
  FaDochub,
  FaEye,
  FaHandshake,
  FaHandshakeSlash,
  FaPaperclip,
  FaPencil,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";
import { getDictionary } from "../../../../get-dictionary";
import { format } from "date-fns";
import { IPayroll } from "@/types/payroll";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";

type childProps = {
  deleteData?: (id: string) => void;
  deleteDocument?: (id: string) => void;
  editData?: (id: string) => void;
  viewDetailData?: (id: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  approval?: (id: string) => void;
};

export const columns = (props: childProps): ColumnDef<IPayroll>[] => [
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
    accessorFn: (row) => row.user_name || "-",
    id: "Nama Pegawai",
    header: "Nama Pegawai",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorFn: (row) => row.pic_name || "-",
    id: "Nama PIC",
    header: "Nama PIC",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorFn: (row) => row.datetime || "-",
    id: "Tanggal",
    header: "Tanggal",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const [startDate, endDate] = value.split(",").map((date) => date.trim());
      return (
        <span>
          {format(startDate, "dd MMMM yyyy")} -{" "}
          {format(endDate, "dd MMMM yyyy")}
        </span>
      );
    },
  },
  {
    accessorFn: (row) => row.total_attendance || "-",
    id: "Total Kehadiran",
    header: "Total Kehadiran",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value} Hari</span>;
    },
  },
  {
    accessorFn: (row) => row.total_daily_salary || "-",
    id: "Total Penghasilan",
    header: "Total Penghasilan",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <span>{formatCurrencyIDR(value)}</span>;
    },
  },

  {
    accessorFn: (row) => row.total_overtime || "-",
    id: "Total Overtime",
    header: "Total Overtime",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <span>{formatCurrencyIDR(value)}</span>;
    },
  },
  {
    accessorFn: (row) => row.notes || "-",
    id: "description",
    header: "Deskripsi",
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
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
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
              {status === "waiting" && (
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
                className="border border-red-500 cursor-pointer"
                onClick={() => props.deleteDocument?.(data?.id ?? "")}
              >
                <FaPaperclip className="text-red-400" />
                Delete Document
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                className="border border-yellow-500 cursor-pointer"
                onClick={() => props.editData?.(data?.id ?? "")}
              >
                <FaPencil className="text-yellow-400" />
                Edit
              </DropdownMenuItem> */}
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
