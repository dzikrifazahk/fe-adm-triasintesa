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
import { ArrowUpDown, Check, MoreHorizontal, X } from "lucide-react";
import { FaLock, FaPencil, FaTrash } from "react-icons/fa6";
import { getDictionary } from "../../../../get-dictionary";
import { IRole } from "@/types/role";

type childProps = {
  deleteData: (id: string) => void;
  assignPermission: (data: IRole) => void;
  editData: (id: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_roles"];
};

export const columns = (props: childProps): ColumnDef<IRole>[] => [
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
    id: `${props.dictionary.column.display_name}`,
    accessorFn: (row) => row.displayName || "-",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {props.dictionary.column.display_name}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: `${props.dictionary.column.name}`,
    accessorFn: (row) => row.name || "-",
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
    id: "description",
    accessorFn: (row) => row.description || "-",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {props.dictionary.column.description}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorFn: (row) => row.isSystem,
    id: `${props.dictionary.column.is_system}`,
    header: props.dictionary.column.is_system,
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
    header: "Actions",
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
            {/* <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(data.id)}
            >
              Copy payment ID
            </DropdownMenuItem> */}
            {/* <DropdownMenuSeparator /> */}
            <div className="flex flex-col gap-2">
              {data.isSystem !== true && (
                <DropdownMenuItem
                  className="border border-red-500 cursor-pointer"
                  onClick={() => props.deleteData(data?.id ?? "")}
                >
                  <FaTrash className="text-red-400" />
                  Delete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="border border-yellow-500 cursor-pointer"
                onClick={() => props.assignPermission(data ?? "")}
              >
                <FaLock className="text-blue-500" />
                Assign Permission
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border border-yellow-500 cursor-pointer"
                onClick={() => props.editData(data?.id ?? "")}
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
