"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { FaEye } from "react-icons/fa6";

import { format } from "date-fns";
import { ICashAdvanceMutation } from "@/types/cash-advance";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import { getDictionary } from "../../../../../get-dictionary";

type childProps = {
  viewDetailData?: (id: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  roleId: number;
};

export const cashAdvanceColumns = (
  props: childProps
): ColumnDef<ICashAdvanceMutation>[] => [
  {
    id: "request_info",
    header: "Request",
    cell: ({ row }) => {
      const requestedBy = row.original.request_by || "-";
      const createdAtRaw = row.original.created_at;
      let createdAtText = "-";

      if (createdAtRaw) {
        try {
          createdAtText = format(new Date(createdAtRaw), "dd/MM/yyyy HH:mm");
        } catch {
          createdAtText = String(createdAtRaw);
        }
      }

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{requestedBy}</span>
          <span className="text-xs text-muted-foreground">{createdAtText}</span>
        </div>
      );
    },
  },

  {
    id: "category",
    header: "Kategori",
    cell: ({ row }) => {
      const paymentAt = row.original.payment_at;
      const desc = (row.original.description ?? "").toLowerCase();

      let category = "-";

      if (!paymentAt) {
        if (desc.includes("loan") && desc.includes("approved")) {
          category = "Peminjaman";
        } else {
          category = "Peminjaman";
        }
      } else {
        category = "Pembayaran";
      }

      let style =
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";

      if (category === "Peminjaman") {
        style += " bg-blue-100 text-blue-700";
      } else if (category === "Pembayaran") {
        style += " bg-emerald-100 text-emerald-700";
      } else {
        style += " bg-slate-100 text-slate-700";
      }

      return <span className={style}>{category}</span>;
    },
  },

  {
    accessorFn: (row) => row.description || "-",
    id: "description",
    header: "Deskripsi",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <span className="text-sm text-muted-foreground break-words">
          {value}
        </span>
      );
    },
  },

  {
    id: "nominal",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nominal
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </Button>
    ),
    cell: ({ row }) => {
      const increase = Number(row.original.increase ?? 0);
      const decrease = Number(row.original.decrease ?? 0);

      let sign = "";
      let amount = 0;
      let className = "text-sm font-semibold";

      if (increase > 0 && decrease === 0) {
        // uang pinjaman masuk
        sign = "+";
        amount = increase;
        className += " text-emerald-600";
      } else if (decrease > 0 && increase === 0) {
        // pembayaran / pengurangan
        sign = "-";
        amount = decrease;
        className += " text-red-600";
      } else {
        // fallback (misal 0 / data aneh)
        amount = increase || decrease || 0;
        className += " text-foreground";
      }

      const formatted = formatCurrencyIDR(Math.abs(amount));

      return (
        <span className={`${className} whitespace-nowrap`}>
          {sign && `${sign} `} {formatted}
        </span>
      );
    },
  },
  {
    accessorFn: (row) => row.description || "-",
    id: "Sisa Pembayaran",
    header: "Sisa Pembayaran",
    cell: ({ row }) => {
      const value = formatCurrencyIDR(row.original.total) || "-";
      return (
        <span className="text-sm text-muted-foreground break-words">
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
              <DropdownMenuItem
                className="border border-slate-500 cursor-pointer"
                onClick={() => props.viewDetailData?.(String(data?.id ?? ""))}
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
