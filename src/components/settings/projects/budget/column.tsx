"use client";

import { useEffect, useState } from "react"; // Mengimpor useEffect
import { IProject } from "@/types/project";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { formatCurrencyIDR, formatNumberIDR } from "@/utils/currencyFormatter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  ChevronRightIcon,
  ChevronUpIcon,
  MoreHorizontal,
} from "lucide-react";
import {
  FaCircleXmark,
  FaEye,
  FaFileCircleCheck,
  FaHandshakeSimple,
  FaHandshakeSimpleSlash,
  FaMoneyBillTransfer,
  FaPencil,
  FaTrash,
} from "react-icons/fa6";
import { IBudget } from "@/types/budget";
// import IBonus from "@/assets/ic/bonus-project.svg";

type childProps = {
  deleteData: (id: string) => void;
  editData: (id: string, tableModal: string) => void;
  viewDetailData: (id: string) => void;
  acceptProject: (id: string) => void;
  rejectProject: (id: string) => void;
  cancelProject: (id: string) => void;
  closeProject: (id: string) => void;
  bonusProject?: (id: string) => void;
  payment: (id: string) => void;
  cookies: any;
  isShowRealCost?: boolean;
};

export const budgetColumns = (props: childProps): ColumnDef<IBudget>[] => {
  return [
    {
      accessorFn: (row) => {
        if ("type" in row && typeof row.type === "string") {
          return (row as any).title;
        }

        return row.nama_budget ?? row.id;
      },
      id: "nama_budget",
      header: "Nama Budget",
      cell: ({ getValue, row }) => {
        const value = getValue() as string;

        const isParentRow = row.depth === 0;
        const canExpand =
          row.getCanExpand() && isParentRow && props.isShowRealCost;

        return (
          <div className="space-x-2 capitalize flex items-center">
            {canExpand && (
              <button
                onClick={row.getToggleExpandedHandler()}
                style={{ cursor: "pointer" }}
              >
                {row.getIsExpanded() ? <ChevronUpIcon /> : <ChevronRightIcon />}
              </button>
            )}
            <span>{value}</span>
          </div>
        );
      },
    },
    {
      accessorFn: (row) => {
        if ("type" in row && typeof row.type === "string") {
          return (row as any).type;
        }
        return row.type.type_budget || "-";
      },
      id: "type",
      header: "Tipe",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span>{value}</span>;
      },
    },
    {
      accessorFn: (row) => {
        if ("type" in row && typeof row.type === "string") {
          return (row as any).total;
        }

        return row.total_nominal;
      },
      id: "total_nominal",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nominal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ getValue }) => {
        const value = getValue();
        return <span>{formatCurrencyIDR(Number(value))}</span>;
      },
    },
    ...(!props.isShowRealCost
      ? [
          {
            accessorKey: "actions",
            header: "Aksi",
            cell: ({ row }: { row: any }) => {
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
                    <div className="flex flex-col gap-2">
                      {/* <DropdownMenuItem
                  className="border border-slate-500 cursor-pointer"
                  onClick={() => props.viewDetailData(data?.id ?? "")}
                >
                  <FaEye className="text-primary" />
                  Lihat Detail
                </DropdownMenuItem> */}
                      <DropdownMenuItem
                        className="border border-red-500 cursor-pointer"
                        onClick={() => props.deleteData(data?.id ?? "")}
                      >
                        <FaTrash className="text-red-400" />
                        Delete
                      </DropdownMenuItem>
                      {(props.cookies.role === 1 ||
                        props.cookies.role === 2 ||
                        props.cookies.role === 6) && (
                        <DropdownMenuItem
                          className="border border-yellow-500 cursor-pointer"
                          onClick={() => props.payment(data?.id ?? "")}
                        >
                          <FaMoneyBillTransfer className="text-green-500" />
                          Pembayaran
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="border border-yellow-500 cursor-pointer"
                        onClick={() => props.editData(data?.id ?? "", "budget")}
                      >
                        <FaPencil className="text-yellow-400" />
                        Edit
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]
      : [
          {
            accessorKey: "real_cost",
            header: "Real Cost",
            cell: ({ getValue, row }: any) => {
              const value = getValue();

              if (row.depth === 1) {
                return;
              }

              return <span>{formatCurrencyIDR(Number(value))}</span>;
            },
          },
        ]),
  ];
};
