"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import Image from "next/image";
import { IContact } from "@/types/contact";
import { FaEye, FaPencil, FaTrash } from "react-icons/fa6";
import { getDictionary } from "../../../../get-dictionary";

type childProps = {
  deleteData: (taxId: string) => void;
  editData: (taxId: string) => void;
  viewDetailData: (taxId: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_contact"];
};

export const columns = (props: childProps): ColumnDef<IContact>[] => [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {props.dictionary.column.name}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorFn: (row) => row.contact_type?.name || "-",
    id: "contact_type",
    header: "Tipe Kontak",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <span>{value}</span>;
    },
  },
  {
    accessorKey: "pic_name",
    header: "PIC",
  },
  {
    accessorKey: "phone",
    header: props.dictionary.column.phone,
  },
  {
    accessorKey: "bank_name",
    header: props.dictionary.column.bank_name,
  },
  {
    accessorKey: "account_name",
    header: props.dictionary.column.account_number,
  },
  {
    accessorKey: "account_number",
    header: props.dictionary.column.account_number,
  },
  {
    accessorKey: "actions",
    header: props.dictionary.column.actions,
    cell: ({ row }) => {
      const tax = row.original;
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
            {/* <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(tax.id)}
            >
              Copy payment ID
            </DropdownMenuItem> */}
            {/* <DropdownMenuSeparator /> */}
            <div className="flex flex-col gap-2">
              <DropdownMenuItem
                className="border border-slate-500 cursor-pointer"
                onClick={() => props.viewDetailData(tax?.id ?? "")}
              >
                <FaEye className="text-primary" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border border-red-500 cursor-pointer"
                onClick={() => props.deleteData(tax?.id ?? "")}
              >
                <FaTrash className="text-red-400" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border border-yellow-500 cursor-pointer"
                onClick={() => props.editData(tax?.id ?? "")}
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
