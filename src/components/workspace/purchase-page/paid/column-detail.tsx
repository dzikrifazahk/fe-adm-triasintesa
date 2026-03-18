"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import { FaEye } from "react-icons/fa6";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { IProduct } from "@/types/purchase";

type childProps = {
  deleteData: (taxId: string) => void;
  editData: (taxId: string) => void;
};

export const columnsDetail = (props: childProps): ColumnDef<IProduct>[] => [
  {
    id: "nama_produk",
    header: "Nama Produk",
  },
  {
    id: "status",
    header: "Status",
  },
  {
    accessorKey: "actions",
    header: "Actions",
  },
];
