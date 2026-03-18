"use client";

import { Button } from "@/components/ui/button";
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
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import {
  FaEye,
  FaArrowRotateLeft,
  FaFileInvoiceDollar,
  FaMoneyBillTransfer,
} from "react-icons/fa6";
import { getUser } from "@/services/base.service";
import { useEffect, useState } from "react";
import { IPurchase } from "@/types/purchase";
import PurchaseStatusBadge from "@/components/purchase/purchaseStatusBadge";

type childProps = {
  viewDetailData: (id: string, actionsTitle: "details") => void;
};

export const columns = (props: childProps): ColumnDef<IPurchase>[] => {
  const [cookies, setCookie] = useState<any>(null);
  useEffect(() => {
    const user = getUser();
    setCookie(user);
  }, []);

  return [
    {
      id: "Doc. No",
      cell: ({ row }) => {
        const docNo = row.original.doc_no;
        const status = row.original.status_purchase?.name;
        return (
          <div className="flex flex-col gap-1">
            <span className="text-xs">{docNo}</span>
            <PurchaseStatusBadge status={status} locale="en" />
          </div>
        );
      },
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="text-xs">No. Dokumen</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      id: "Deskripsi",
      cell: ({ row }) => {
        const desc = row.original.description;
        return <span className="text-xs">{desc}</span>;
      },
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="text-xs">Deskripsi</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "Tanggal",
      header: "Tanggal",
      cell: ({ row }) => {
        const docType = row.original.doc_type;
        const dateStart = format(
          row.original?.date_start_create_purchase ?? "",
          "dd MMM yyyy",
          {
            locale: id,
          }
        );
        const dateEnd = format(
          row.original?.due_date_end_purchase ?? "",
          "dd MMM yyyy",
          {
            locale: id,
          }
        );

        return (
          <>
            <span>
              {docType === "FLASH CASH"
                ? dateStart
                : `${dateStart} - ${dateEnd}`}
            </span>
            <br />
          </>
        );
      },
    },
    {
      accessorKey: "Total",
      header: "Total",
      cell: ({ row }) => {
        // if (spbType === "BORONGAN") {
        let total = formatCurrencyIDR(Number(row.original?.total) ?? 0);
        // } else {
        //   total = formatCurrencyIDR(row.original?.total ?? "0");
        // }

        return (
          <>
            <span>{total}</span>
            <br />
          </>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const data = row.original;
        const purchaseStatus = data.status_purchase.name;
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
              <div className="flex flex-col gap-2">
                <DropdownMenuItem
                  className="border border-slate-500 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.viewDetailData(data?.doc_no ?? "", "details");
                  }}
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
};
