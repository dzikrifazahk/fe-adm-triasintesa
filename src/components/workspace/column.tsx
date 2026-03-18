"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import IEdit from "@/assets/ic/edit-ic.svg";
import { IProject } from "@/types/project";
import { useEffect, useState } from "react";
import { getUser } from "@/services/base.service";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

type childProps = {
  deleteData: (id: string) => void;
  editData: (id: string) => void;
};

export const columns = (props: childProps): ColumnDef<IProject>[] => {
  const [cookies, setCookie] = useState<any>(null);

  useEffect(() => {
    const user = getUser();
    setCookie(user);
  }, []);

  const columns: ColumnDef<IProject>[] = [
    {
      accessorFn: (row) => row.name || "-",
      id: "Name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center text-xs"
        >
          Nama
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row, getValue }) => {
        const value = getValue() as string;
        return (
          <>
            <div className="">{value}</div>
          </>
        );
      },
    },
    {
      accessorFn: (row) => row.request_status_owner?.name || "-",
      id: "Status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-center text-xs"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row, getValue }) => {
        const value = getValue() as string;
        const unapprove = row.original?.total_spb_unapproved_for_role || "";

        const bonusStatus = row.original?.status_bonus_project?.id ?? null;
        let statusClass = "";
        if (value === "Pending") {
          statusClass = "bg-[#FFEFC7] border border-[#FDDF8A]";
        } else if (value === "Active") {
          statusClass = "bg-[#D1FADF] border border-[#A0F2C1]";
        } else if (value === "Rejected" || value === "Cancel") {
          statusClass = "bg-[#FEE4E2] border border-[#FDCFCB]";
        } else if (value === "Closed") {
          if (bonusStatus === "2") {
            statusClass = "bg-[#946AEA] border border-[#E8D6FE]";
          } else {
            statusClass = "bg-[#D1E0FF] border border-[#B2CDFF] text-[#1C69FF]";
          }
        }

        return (
          <>
            <div className="flex h-10 relative items-center">
              <div className="w-full flex justify-center h-2 items-center">
                <span
                  className={`p-2 flex justify-center items-center w-4 rounded-full ${statusClass}`}
                ></span>
              </div>
              <div className="absolute top-0 right-0 h-full w-10">
                <div className="text-[7px] bg-red-500 text-white w-4 rounded-full font-bold">
                  {unapprove}
                </div>
              </div>
            </div>
          </>
        );
      },
    },
  ];
  if (cookies?.role === 3 || cookies?.role === 1) {
    columns.push({
      accessorKey: "actions",
      header: "Aksi",
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
              <div className="flex flex-col gap-2">
                <DropdownMenuItem
                  className="border border-yellow-500 cursor-pointer"
                  onClick={() => props.editData(tax?.id ?? "")}
                >
                  <FaEdit className="text-yellow-400" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="border border-red-500 cursor-pointer"
                  onClick={() => props.deleteData(tax?.id ?? "")}
                >
                  <FaTrash className="text-red-400" />
                  Delete
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return columns;
};
