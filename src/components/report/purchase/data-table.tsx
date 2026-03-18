"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  Row,
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/data-table/pagination";
import { IMeta } from "@/types/common";
import { Input } from "@/components/ui/input";
import { FaArrowRotateLeft, FaFileExcel, FaFilter } from "react-icons/fa6";
import { IPurchase } from "@/types/purchase";
import { useContext, useState } from "react";
import { MobileContext } from "@/hooks/use-mobile-ssr";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<IPurchase, TValue>[];
  data: IPurchase[];
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  metadata?: IMeta;
  selectedData?: (row: IPurchase) => void;
  onSearchChange: (searchValue: string) => void;
  onFilterChange?: (payload: any) => void;
  isClearPayload: (payload: boolean) => void;
  searchValue: string;
  isLoading?: boolean;
  isExportExcel: (boolean: boolean) => void;
  isGetData?: () => void;
  onOpenFilter?: (value: boolean) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onPageChange,
  onPageSizeChange,
  metadata,
  selectedData,
  onSearchChange,
  onFilterChange,
  isClearPayload,
  searchValue,
  isLoading = false,
  isExportExcel,
  isGetData,
  onOpenFilter,
}: DataTableProps<TData, TValue>) {
  const { isMobile } = useContext(MobileContext);
  // sorting
  const [sorting, setSorting] = React.useState<SortingState>([]);
  // filtering
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  // visibility
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  // row selection
  const [rowSelection, setRowSelection] = React.useState({});
  const [rowSelected, setRowSelected] = React.useState<IPurchase | undefined>();

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [search, setSearch] = useState("");

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

  const [isOpenModalFilter, setIsOpenModalFilter] = React.useState(false);

  const handleRowClick = (row: IPurchase) => {
    setRowSelected(row);
    selectedData?.(row);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
  };

  const handleOpenModalFilter = () => setIsOpenModalFilter(true);

  const handlePageChange = (newPage: number) => onPageChange?.(newPage);
  const handlePageSizeChange = (newPageSize: number) =>
    onPageSizeChange?.(newPageSize);

  const handleCloseModalFilter = (payload: any) => {
    setIsOpenModalFilter(false);
    onFilterChange?.(payload);
  };
  const controlsWrapClass = isMobile
    ? "flex flex-col items-stretch gap-2"
    : "flex flex-wrap md:flex-row items-stretch md:items-center justify-start xl:justify-end gap-2";

  const searchWrapperClass = isMobile
    ? "w-full"
    : "flex-1 min-w-0 md:min-w-[260px] xl:min-w-[320px] max-w-full md:max-w-[420px]";
  const buttonWidthClass = isMobile ? "w-full" : "w-full md:w-auto";
  const SKELETON_ROWS = 6;
  const dropdownAlign: "start" | "end" = isMobile ? "start" : "end";

  return (
    <div className="w-full min-w-0 pb-4">
      {/* Controls */}
      <div
        className="
                  grid w-full gap-3 md:gap-4
                  grid-cols-1
                  xl:[grid-template-columns:minmax(0,1fr)_auto]
                  items-start pb-4
                "
      >
        <div className="w-full md:w-20">
          <Button
            className={`bg-green-600 hover:bg-green-700 text-white shrink-0 ${buttonWidthClass} whitespace-nowrap cursor-pointer`}
            onClick={() => isExportExcel(true)}
          >
            <FaFileExcel className="" />
            Export
          </Button>
        </div>
        <div className={controlsWrapClass}>
          <div className={searchWrapperClass}>
            <Input
              placeholder={"search project"}
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
                Filter Kolom
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

          {/* <Button
            variant="outline"
            className={`shrink-0 ${buttonWidthClass} cursor-pointer`}
            onClick={() => onOpenFilter?.(true)}
            aria-label="Advanced filter"
          >
            <FaFilter />
          </Button> */}

          <Button
            variant="outline"
            className={`shrink-0 ${buttonWidthClass} cursor-pointer`}
            onClick={() => isGetData?.()}
            aria-label="Refresh"
          >
            <FaArrowRotateLeft />
          </Button>
        </div>
      </div>

      {/* Table wrapper with horizontal scroll */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="w-full table-auto">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-center text-xs whitespace-nowrap"
                  >
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
            {isLoading ? (
              // Skeleton rows saat loading
              Array.from({ length: SKELETON_ROWS }).map((_, rowIdx) => (
                <TableRow key={`skeleton-${rowIdx}`}>
                  {columns.map((_, colIdx) => (
                    <TableCell
                      key={`skeleton-cell-${rowIdx}-${colIdx}`}
                      className="px-2 py-3"
                    >
                      <div className="h-4 w-full max-w-[160px] rounded bg-muted animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<IPurchase>) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row.original)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-center text-xs whitespace-nowrap max-w-[240px] truncate"
                      title={String(
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        ) as any
                      )}
                    >
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

      {/* Example modal hook-up (commented in your code) */}
      {/* <ModalFilterSPB
        isOpen={isOpenModalFilter}
        isDashboard={false}
        onClose={() => setIsOpenModalFilter(false)}
        title="Advance Filter"
        onSubmit={handleCloseModalFilter}
        isClearPayload={isClearPayload}
      /> */}
    </div>
  );
}
