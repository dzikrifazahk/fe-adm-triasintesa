"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  PaginationState,
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
import { DataTablePagination } from "@/components/data-table/pagination";
import { IMeta } from "@/types/common";
import { FaArrowRotateLeft, FaFilter } from "react-icons/fa6";
import { IProject } from "@/types/project";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { getDictionary } from "../../../../get-dictionary";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<IProject, TValue>[];
  data: IProject[];
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  onOpenFilter?: (value: boolean) => void;
  metadata?: IMeta;
  isClearPayload: (payload: boolean) => void;
  // dictionary: Awaited<ReturnType<typeof getDictionary>>["dashboard"];
}

export function ProjectsTable<TData, TValue>({
  columns,
  data,
  onPageChange,
  onPageSizeChange,
  onOpenFilter,
  metadata,
  isClearPayload,
  // dictionary,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const { isMobile } = useContext(MobileContext);

  const [pagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [search, setSearch] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    // onSearchChange(value);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    manualPagination: true,
    pageCount: metadata?.last_page ?? 0,
  });

  const handlePageChange = (newPage: number) => onPageChange?.(newPage);
  const handlePageSizeChange = (newPageSize: number) =>
    onPageSizeChange?.(newPageSize);

  const [rowSelected, setRowSelected] = useState<string | null>(null);

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
            items-start
          "
        >
          {/* <div className="flex flex-col gap-1 min-w-0">
            <div className="font-bold truncate">{dictionary.title}</div>
            <div className="text-xs text-gray-500 truncate">
              {dictionary.project_description}
            </div>
          </div>

          <div className={controlsWrapClass}>
            <div className={searchWrapperClass}>
              <Input
                placeholder={
                  dictionary?.projects.search_project_placeholder ?? "-"
                }
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
              onClick={() => onOpenFilter?.(true)}
              aria-label="Advanced filter"
            >
              <FaFilter />
            </Button>

            <Button
              variant="outline"
              className={`shrink-0 ${buttonWidthClass} cursor-pointer`}
              onClick={() => isGetData?.("is_refresh_project")}
              aria-label="Refresh"
            >
              <FaArrowRotateLeft />
            </Button>

            <Button
              className={`bg-iprimary-blue hover:bg-iprimary-blue-tertiary text-white shrink-0 ${buttonWidthClass} whitespace-nowrap cursor-pointer`}
              onClick={() => addData(true)}
            >
              {dictionary.projects.button_add_project ?? "-"}
            </Button>
          </div> */}
        </div>
      </div>

      {/* Tabel */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-center text-xs">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`cursor-pointer ${
                    rowSelected === row.id ? "bg-gray-100" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center text-xs">
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

      <DataTablePagination
        table={table}
        onPageChange={handlePageChange}
        lastPage={metadata?.last_page as number}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
}
