"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { INotification } from "@/types/notification";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTablePagination } from "@/components/data-table/pagination";
import { IMeta } from "@/types/common";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<INotification, TValue>[];
  data: INotification[];
  isMobile?: boolean;
  isLoading?: boolean;
  align?: "align-top" | "align-middle" | "align-bottom";
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  metadata?: IMeta;
  isWithColumnSelection?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isMobile = false,
  isLoading = false,
  isWithColumnSelection = true,
  align = "align-top",
  onPageChange,
  onPageSizeChange,
  metadata,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();

  const columnsWithSelection = useMemo<ColumnDef<INotification, any>[]>(() => {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
        size: 32,
      },
      ...columns,
    ];
  }, [columns]);

  const table = useReactTable({
    data,
    columns: isWithColumnSelection ? columnsWithSelection : columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handlePageChange = (newPage: number) => onPageChange?.(newPage);
  const handlePageSizeChange = (newPageSize: number) =>
    onPageSizeChange?.(newPageSize);

  return (
    <>
      <Table className={cn(isMobile ? "table-mobile" : "")}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {!isLoading ? (
            table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, indexRow) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`${pathname}?uid=${row.original.id}`)
                  }
                >
                  {row.getVisibleCells().map((cell, indexCell) => {
                    if (isMobile) {
                      return (
                        <TableCell
                          key={cell.id}
                          className={align}
                          data-label={
                            (cell.column.columnDef.meta as { label?: string })
                              ?.label
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell key={cell.id} className={align}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    }
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow className="row-empty">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )
          ) : (
            <TableRow className="row-empty">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex items-center justify-center">
                  <Loader2Icon className="animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination
        table={table}
        onPageChange={handlePageChange}
        lastPage={metadata?.last_page as number}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
}
