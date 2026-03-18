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
import { ArrowUpDown, Download, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import {
  FaEye,
  FaMoneyBillTransfer,
  FaBackward,
  FaReceipt,
  FaTrash,
  FaXmark,
  FaPen,
  FaFileInvoiceDollar,
} from "react-icons/fa6";
import { getUser } from "@/services/base.service";
import { useEffect, useState } from "react";
import { IPurchase } from "@/types/purchase";
import PurchaseStatusBadge from "@/components/purchase/purchaseStatusBadge";
import { FaCheckCircle } from "react-icons/fa";

type childProps = {
  editData: (id: string, actionsTitle: "edit") => void;
  viewDetailData: (id: string, actionsTitle: "details") => void;
  verify: (id: string, actionsTitle: "verify") => void;
  deleteData: (id: string) => void;
  download: (id: string) => void;
  reject: (id: string, actionsTitle: "reject") => void;
  activate: (id: string, actionsTitle: "activate") => void;
};

export const columns = (props: childProps): ColumnDef<IPurchase>[] => {
  const [cookies, setCookie] = useState<any>(null);
  useEffect(() => {
    const user = getUser();
    setCookie(user);
  }, []);

  return [
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
                  onClick={() =>
                    props.viewDetailData(data?.doc_no ?? "", "details")
                  }
                >
                  <FaEye className="text-primary" />
                  Lihat Detail
                </DropdownMenuItem>

                {(cookies.roleId === 1 || cookies.roleId === 2) && (
                  <>
                    {purchaseStatus !== "Rejected" && (
                      <>
                        <DropdownMenuItem
                          className="border border-green-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            props.verify(data?.doc_no ?? "", "verify");
                          }}
                        >
                          {/* <FaCheckCircle className="text-green-500" /> */}
                          <FaFileInvoiceDollar className="text-green-500" />
                          Payment Request
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="border border-red-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            props.reject(data?.doc_no ?? "", "reject");
                          }}
                        >
                          <FaXmark className="text-red-500" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="border border-yellow-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            props.editData(data?.doc_no ?? "", "edit");
                          }}
                        >
                          <FaPen className="text-yellow-500" />
                          Edit
                        </DropdownMenuItem>
                      </>
                    )}
                    {purchaseStatus === "Rejected" && (
                      <DropdownMenuItem
                        className="border border-green-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          props.activate(data?.doc_no ?? "", "activate");
                        }}
                      >
                        <FaCheckCircle className="text-green-500" />
                        Activate
                      </DropdownMenuItem>
                    )}

                    {/* <DropdownMenuItem
                      className="border border-yellow-500 cursor-pointer"
                      onClick={() => props.printResult(data?.doc_no ?? "")}
                    >
                      <FaReceipt className="text-primary-light" />
                      Cetak SPB
                    </DropdownMenuItem> */}

                    <DropdownMenuItem
                      className="border border-iprimary-blue cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.download(data?.doc_no ?? "");
                      }}
                    >
                      <Download className="text-iprimary-blue" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="border border-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.deleteData(data?.doc_no ?? "");
                      }}
                    >
                      <FaTrash className="text-red-500" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
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
  ];
};
