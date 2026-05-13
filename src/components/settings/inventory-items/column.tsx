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
import { FaEye, FaPencil, FaTrash } from "react-icons/fa6";
import { getDictionary } from "../../../../get-dictionary";
import { IInventoryItem } from "@/types/inventory-item";
import { format } from "date-fns";

type ChildProps = {
  deleteData: (id: string) => void;
  editData: (id: string) => void;
  viewDetailData: (id: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["inventory_item_page_dic"];
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : format(date, "dd/MM/yyyy");
};

export const columns = (props: ChildProps): ColumnDef<IInventoryItem>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
    id: props.dictionary.column.item_code,
    accessorFn: (row) => row.itemCode || "-",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {props.dictionary.column.item_code}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: props.dictionary.column.item_name,
    accessorFn: (row) => row.itemName || "-",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {props.dictionary.column.item_name}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: props.dictionary.column.uom,
    accessorFn: (row) => row.uom || "-",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {props.dictionary.column.uom}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: props.dictionary.column.category,
    accessorFn: (row) => row.category || "-",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {props.dictionary.column.category}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: "Stock",
    accessorFn: (row) => row.stock ?? 0,
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Stock
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: props.dictionary.column.is_active,
    accessorFn: (row) => (row.isActive ? "active" : "inactive"),
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {props.dictionary.column.is_active}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: props.dictionary.column.created_at,
    accessorFn: (row) => formatDate(row.createdAt),
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {props.dictionary.column.created_at}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: props.dictionary.column.updated_at,
    accessorFn: (row) => formatDate(row.updatedAt),
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        {props.dictionary.column.updated_at}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
            <DropdownMenuLabel className="text-center">{props.dictionary.column.actions}</DropdownMenuLabel>
            <div className="flex flex-col gap-2">
              <DropdownMenuItem className="cursor-pointer border border-slate-500" onClick={(event) => {
                event.stopPropagation();
                props.viewDetailData(String(data.id));
              }}>
                <FaEye className="text-primary" />
                {props.dictionary.action.view_detail}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer border border-yellow-500" onClick={() => props.editData(String(data.id))}>
                <FaPencil className="text-yellow-400" />
                {props.dictionary.action.edit}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer border border-red-500" onClick={() => props.deleteData(String(data.id))}>
                <FaTrash className="text-red-400" />
                {props.dictionary.action.delete}
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
