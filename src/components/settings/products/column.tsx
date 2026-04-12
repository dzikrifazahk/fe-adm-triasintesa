"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Check, MoreHorizontal, X } from "lucide-react";
import { FaPencil, FaTrash } from "react-icons/fa6";
import { getDictionary } from "../../../../get-dictionary";
import { IProduct } from "@/types/product";

type ChildProps = {
  deleteData: (id: string) => void;
  editData: (data: IProduct) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_products"];
};

export const columns = (props: ChildProps): ColumnDef<IProduct>[] => [
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
    id: `${props.dictionary.column.title}`,
    accessorFn: (row) => row.title || "-",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {props.dictionary.column.title}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: `${props.dictionary.column.slug}`,
    accessorFn: (row) => row.slug || "-",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {props.dictionary.column.slug}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: `${props.dictionary.column.status}`,
    accessorFn: (row) => row.isActive,
    header: props.dictionary.column.status,
    cell: ({ getValue }) => {
      const value = Boolean(getValue());
      return (
        <span
          className={`flex items-center justify-center w-6 h-6 rounded-full ${
            value ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {value ? (
            <Check className="text-green-600 w-3 h-3" />
          ) : (
            <X className="text-red-600 w-3 h-3" />
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: props.dictionary.column.actions,
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
              <DropdownMenuItem
                className="border border-yellow-500 cursor-pointer"
                onClick={() => props.editData(data)}
              >
                <FaPencil className="text-yellow-400" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border border-red-500 cursor-pointer"
                onClick={() => props.deleteData(data?.id ?? "")}
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
