import { INotification } from "@/types/notification";
import { ColumnDef } from "@tanstack/react-table";
import { format, formatDistance, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export const columns = (): ColumnDef<INotification>[] => [
  {
    accessorKey: "created_at",
    header: "Dibuat pada",
    cell: ({ row }) =>
      format(new Date(row.original.created_at || ""), "EEEE, dd MMM yyyy", {
        locale: id,
      }),
  },
  {
    accessorKey: "category",
    header: "Kategori",
  },
  {
    accessorKey: "title",
    header: "Judul",
  },
  {
    accessorKey: "request_by.name",
    header: "Dibuat oleh",
  },
  {
    accessorKey: "read_by.name",
    header: "Terbaca oleh",
    cell: ({ row }) => row.original.read_by?.name || "-",
  },
  {
    accessorKey: "read_by.read_at",
    header: "Terbaca",
    cell: ({ row }) =>
      row.original.read_by?.read_at
        ? format(
            new Date(row.original.read_by.read_at || ""),
            "EEEE, dd MMM yyyy",
            {
              locale: id,
            }
          )
        : "-",
  },
];
