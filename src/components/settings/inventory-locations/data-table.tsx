"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useContext, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IMeta } from "@/types/common";
import { getDictionary } from "../../../../get-dictionary";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { FaArrowRotateLeft } from "react-icons/fa6";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  addData: (isAddData: boolean) => void;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  metadata?: IMeta;
  onSearchChange: (searchValue: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["inventory_location_page_dic"];
  isGetData?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  addData,
  onPageChange,
  onPageSizeChange,
  metadata,
  onSearchChange,
  dictionary,
  isGetData,
}: DataTableProps<TData, TValue>) {
  // sorting
  const [sorting, setSorting] = React.useState<SortingState>([]);
  // filtering
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const { isMobile } = useContext(MobileContext);
  // visibility
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  // row selection with checkbox
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [search, setSearch] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange(value);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // pagination
    onSortingChange: setSorting, // sorting
    getSortedRowModel: getSortedRowModel(), // sorting
    onColumnFiltersChange: setColumnFilters, // filtering
    getFilteredRowModel: getFilteredRowModel(), // filtering
    onColumnVisibilityChange: setColumnVisibility, // visibility
    onRowSelectionChange: setRowSelection, // row selection
    state: {
      sorting, //sorting
      columnFilters, // filtering
      columnVisibility, // visibility
      rowSelection, // row selection
      pagination,
    },
    manualPagination: true,
    pageCount: metadata?.last_page ?? 0,
  });

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  const controlsWrapClass = isMobile
    ? "flex flex-col items-stretch gap-2"
    : "flex flex-wrap md:flex-row items-stretch md:items-center justify-start xl:justify-end gap-2";

  const searchWrapperClass = isMobile
    ? "w-full"
    : "flex-1 min-w-0 md:min-w-[260px] xl:min-w-[320px] max-w-full md:max-w-[420px]";

  const buttonWidthClass = isMobile ? "w-full" : "w-full md:w-auto";
  const dropdownAlign: "start" | "end" = isMobile ? "start" : "end";

  return (
    <>
      <div className="w-full pb-4">
        <div
          className="
                grid w-full gap-3 md:gap-4
                grid-cols-1
                xl:[grid-template-columns:minmax(0,1fr)_auto]
                items-start p-1
              "
        >
          <div className="flex flex-col gap-1 min-w-0">
            <div className="font-bold truncate">{dictionary.title}</div>
            <div className="text-xs text-gray-500 whitespace-normal break-words leading-relaxed">
              {dictionary.description}
            </div>
          </div>

          <div className={controlsWrapClass}>
            <div className={searchWrapperClass}>
              <Input
                placeholder={dictionary?.search_tank_placeholder ?? "-"}
                value={search}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`shrink-0 ${buttonWidthClass} whitespace-nowrap cursor-pointer`}
                  aria-label="Column filter"
                >
                  {dictionary?.column_filter ?? "-"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={dropdownAlign}
                className="max-h-[50vh] overflow-auto"
              >
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(value) => col.toggleVisibility(!!value)}
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              className={`shrink-0 ${buttonWidthClass} cursor-pointer`}
              onClick={() => isGetData?.()}
              aria-label="Refresh"
            >
              <FaArrowRotateLeft />
            </Button>

            <Button
              className={`bg-iprimary-blue hover:bg-iprimary-blue-tertiary text-white shrink-0 ${buttonWidthClass} whitespace-nowrap cursor-pointer`}
              onClick={() => addData(true)}
            >
              {dictionary.button_add_tank ?? "-"}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* <DataTablePagination
        table={table}
        onPageChange={handlePageChange}
        lastPage={metadata?.last_page as number}
        onPageSizeChange={handlePageSizeChange}
      /> */}
    </>
  );
}
