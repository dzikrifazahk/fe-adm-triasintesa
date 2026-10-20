"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { FaEye, FaPencil, FaPowerOff, FaTrash } from "react-icons/fa6";
import { ICustomer } from "@/types/customer";

type ChildProps = {
  detailData: (id: number) => void;
  editData: (data: ICustomer) => void;
  toggleStatus: (data: ICustomer) => void;
  deleteData: (id: number) => void;
};

const getStatusBadgeClass = (value?: string | null) => {
  switch (value) {
    case "aktif":
      return "bg-green-100 text-green-700 border-green-200";
    case "nonaktif":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const sortableHeader = (label: string) => {
  const SortableHeader = ({
    column,
  }: {
    column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | "asc" | "desc" };
  }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
  return SortableHeader;
};

export const columns = (props: ChildProps): ColumnDef<ICustomer>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "Kode",
    accessorFn: (row) => row.customerCode || "-",
    header: sortableHeader("Kode"),
  },
  {
    id: "Perusahaan",
    accessorFn: (row) => row.companyName || "-",
    header: sortableHeader("Perusahaan"),
  },
  {
    id: "PIC",
    accessorFn: (row) => row.contactPerson || "-",
    header: sortableHeader("PIC"),
  },
  {
    id: "Email",
    accessorFn: (row) => row.email || "-",
    header: "Email",
  },
  {
    id: "Phone",
    accessorFn: (row) => row.phone || "-",
    header: "Phone",
  },
  {
    id: "Status",
    accessorFn: (row) => row.status || "-",
    header: sortableHeader("Status"),
    cell: ({ row }) => {
      const status = row.original.status;
      if (!status) return "-";
      return (
        <span
          className={`inline-block whitespace-nowrap rounded-md border px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
            status,
          )}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const data = row.original;
      const isActive = data.status === "aktif";
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-center">Actions</DropdownMenuLabel>
            <div className="flex flex-col gap-2">
              <DropdownMenuItem
                className="border border-slate-500 cursor-pointer"
                onClick={() => props.detailData(data.id)}
              >
                <FaEye className="text-primary" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border border-yellow-500 cursor-pointer"
                onClick={() => props.editData(data)}
              >
                <FaPencil className="text-yellow-400" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border border-blue-500 cursor-pointer"
                onClick={() => props.toggleStatus(data)}
              >
                <FaPowerOff className="text-blue-500" />
                {isActive ? "Nonaktifkan" : "Aktifkan"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border border-red-500 cursor-pointer"
                onClick={() => props.deleteData(data.id)}
              >
                <FaTrash className="text-red-400" />
                Delete
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
