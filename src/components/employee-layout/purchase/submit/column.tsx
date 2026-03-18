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
import { format } from "date-fns";
import { IPayroll } from "@/types/payroll";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import {
  FaCheck,
  FaClipboardUser,
  FaExclamation,
  FaTrash,
} from "react-icons/fa6";
import { getDictionary } from "../../../../../get-dictionary";
import { IPurchase } from "@/types/purchase";
import { getStatusStyle } from "@/helpers/purchaseStatusHelper";

type childProps = {
  viewDetailData?: (taxId: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  printPayslip?: (id: string) => void;
  roleId: number;
};

export const columns = (props: childProps): ColumnDef<IPurchase>[] => [
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
    accessorFn: (row) => row.doc_no || "-",
    id: "Doc No.",
    header: "Doc No.",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    id: "Proyek",
    header: "Proyek",
    cell: ({ row }) => {
      const value = row.original?.project?.name ?? "-";
      return <span>{value}</span>;
    },
  },
  {
    id: "Tanggal",
    header: "Start Date - Due Date",
    cell: ({ row }) => {
      const startDate = row.original.date_start_create_purchase;
      const dueDate = row.original.due_date_end_purchase;
      return (
        <span>
          {format(startDate, "dd MMMM yyyy")} -{" "}
          {format(dueDate, "dd MMMM yyyy")}
        </span>
      );
    },
  },
  {
    id: "Description",
    header: "Deskripsi",
    cell: ({ row }) => {
      const value = row.original?.description ?? "-";
      return <span>{value}</span>;
    },
  },
  {
    id: "Nominal",
    header: "Nominal Purchase",
    cell: ({ row }) => {
      const value = row.original?.sub_total_purchase ?? "-";
      return <span>{formatCurrencyIDR(value)}</span>;
    },
  },
  {
    accessorFn: (row) => row.status_purchase?.name || "-",
    id: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const value = (getValue() as string) || "-";
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(
            value
          )}`}
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
      const status = row.original.status_purchase?.name || "";
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
                className="border border-red-500 cursor-pointer"
                // onClick={() => props.printPayslip?.(data?.id ?? "")}
              >
                <FaTrash className="text-red-500" />
                Delete Purchase
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border border-yellow-500 cursor-pointer"
                // onClick={() => props.printPayslip?.(data?.id ?? "")}
              >
                <FaExclamation className="text-yellow-500" />
                Tolak Purchase
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border border-green-500 cursor-pointer"
                // onClick={() => props.printPayslip?.(data?.id ?? "")}
              >
                <FaCheck className="text-green-700" />
                Accept Purchase
              </DropdownMenuItem>
              {status === "Rejected" && (
                <DropdownMenuItem
                  className="border border-green-500 cursor-pointer"
                  // onClick={() => props.printPayslip?.(data?.id ?? "")}
                >
                  <FaClipboardUser className="text-green-700" />
                  Activate Purchase
                </DropdownMenuItem>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
