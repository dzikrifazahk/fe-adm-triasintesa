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
  FaMoneyBill,
  FaPencil,
  FaTrash,
} from "react-icons/fa6";
import { getDictionary } from "../../../../get-dictionary";
import { format } from "date-fns";
import { ICashAdvance } from "@/types/cash-advance";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";

type childProps = {
  deleteData?: (id: string) => void;
  editData?: (id: string) => void;
  viewDetailData?: (id: string) => void;
  payment?: (id: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  roleId: number;
  approval?: (id: string) => void;
};

export const columns = (props: childProps): ColumnDef<ICashAdvance>[] => [
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
    accessorFn: (row) => row.nominal || "-",
    id: "nominal",
    header: "Nominal",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <span>{formatCurrencyIDR(value)}</span>;
    },
  },
  {
    accessorFn: (row) => row.request_date || "-",
    id: "Request Date",
    header: "Tanggal Permintaan",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{format(value, "dd MMMM yyyy")}</span>;
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
    id: "status_pembayaran",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status Pembayaran
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isSettled = row.original.is_settled; // 0 / 1
      const latest = Number(row.original.latest ?? 0); // pastikan number
      const nominal = Number(row.original.nominal ?? 0); // total tagihan

      let label = "-";
      let style = "bg-gray-100 text-gray-700 border border-gray-200"; // default / fallback

      // Rule 1: telah dibayar (isSettled = 1 && latest = 0)
      if (isSettled === 1 && latest === 0) {
        label = "Telah dibayar";
        style = "bg-blue-100 text-blue-700";
      }
      // Rule 2: belum terselesaikan (isSettled = 0 && latest != nominal)
      else if (isSettled === 0 && latest !== nominal) {
        label = "Belum terselesaikan";
        style = "bg-orange-100 text-orange-700 border border-orange-200";
      }
      // Rule 3: belum ada pembayaran (isSettled = 0 && latest = nominal)
      else if (isSettled === 0 && latest === nominal) {
        label = "Belum ada pembayaran";
        style = "bg-red-100 text-red-700";
      }

      return (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${style}`}
        >
          {label}
        </span>
      );
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
              {(status === "waiting" || status === "approved") &&
                (roleNumber === 2 || roleNumber === 1) && (
                  <>
                    {status === "approved" && (
                      <DropdownMenuItem
                        className="border border-slate-500 cursor-pointer"
                        onClick={() => props.payment?.(data?.id ?? "")}
                      >
                        <FaMoneyBill className="text-green-500" />
                        Payment
                      </DropdownMenuItem>
                    )}
                    {status !== "approved" && (
                      <>
                        <DropdownMenuItem
                          className="border border-slate-500 cursor-pointer"
                          onClick={() => props.approval?.(data?.id ?? "")}
                        >
                          <FaHandshake className="text-green-500" />
                          Approval
                        </DropdownMenuItem>
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
