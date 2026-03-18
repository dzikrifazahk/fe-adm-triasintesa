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
import { FaPencil, FaTrash } from "react-icons/fa6";
import { getDictionary } from "../../../../get-dictionary";
import { IOperation } from "@/types/operation";
import { Textarea } from "@/components/ui/textarea";
import { format, parse } from "date-fns";
import { toZonedTime } from "date-fns-tz";

type childProps = {
  deleteData: (id: string) => void;
  editData: (id: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_operation"];
};

export const formatTimeFromUtc = (time?: string | null) => {
  if (!time) return "-";

  const [h, m, s] = time.split(":").map(Number);
  const utcDate = new Date(Date.UTC(1970, 0, 1, h ?? 0, m ?? 0, s ?? 0));

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const zoned = toZonedTime(utcDate, tz);

  return format(zoned, "HH:mm:ss");
};

export const columns = (props: childProps): ColumnDef<IOperation>[] => [
  {
    accessorKey: "ontime_start",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {props.dictionary.column.ontime_start}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="ml-2">
        {formatTimeFromUtc(row.original?.ontime_start)}
      </span>
    ),
  },
  {
    accessorKey: "ontime_end",
    header: props.dictionary.column.ontime_end,
    cell: ({ row }) => (
      <span>{formatTimeFromUtc(row.original?.ontime_end)}</span>
    ),
  },
  {
    accessorKey: "late_time",
    header: props.dictionary.column.late_time,
    cell: ({ row }) => (
      <span>{formatTimeFromUtc(row.original?.late_time)}</span>
    ),
  },
  {
    accessorKey: "offtime",
    header: props.dictionary.column.offtime,
    cell: ({ row }) => <span>{formatTimeFromUtc(row.original?.offtime)}</span>,
  },
  {
    id: "projects",
    header: "Project",
    accessorFn: (row) => {
      const names = (row.projects ?? [])
        .map((p) => (p?.name ?? "").trim())
        .filter(Boolean);

      return names.length ? [...new Set(names)].join(", ") : "-";
    },
    cell: ({ row }) => {
      const names = (row.original.projects ?? [])
        .map((p) => (p?.name ?? "").trim())
        .filter(Boolean);

      const value = names.length ? [...new Set(names)].join(", ") : "-";

      return (
        <span className="block max-w-full truncate" title={value}>
          <Textarea value={value} readOnly disabled />
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const operation = row.original;
      return (
        <div className="w-full flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
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
                  onClick={() => props.editData(operation?.id ?? "")}
                >
                  <FaPencil className="text-yellow-400" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="border border-red-500 cursor-pointer"
                  onClick={() => props.deleteData?.(operation?.id ?? "")}
                >
                  <FaTrash className="text-red-400" />
                  Delete
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
