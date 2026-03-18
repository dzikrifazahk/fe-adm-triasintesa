"use client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { FaEye, FaPencil, FaTrash } from "react-icons/fa6";
import { ITasks } from "@/types/task";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";

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
};

export const taskColumns = (props: childProps): ColumnDef<ITasks>[] => {
  return [
    {
      accessorFn: (row) => row.nama_task ?? row.id,
      id: "nama_task",
      header: "Nama Pekerjaan",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span>{value}</span>;
      },
    },
    {
      accessorFn: (row) => row.type.type_task || "-",
      id: "type",
      header: "Tipe",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span>{value}</span>;
      },
    },
    {
      accessorKey: "nominal",
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
        const date = getValue();
        return <span>{formatCurrencyIDR(Number(date))}</span>;
      },
    },
    {
      accessorKey: "actions",
      header: "Aksi",
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
                <DropdownMenuItem
                  className="border border-yellow-500 cursor-pointer"
                  onClick={() => props.editData(data?.id ?? "", "task")}
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
  ];
};
