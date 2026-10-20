import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
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
import { DataTablePagination } from "@/components/data-table/pagination";
import React, { useContext, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaArrowRotateLeft, FaFilter } from "react-icons/fa6";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { CustomerFilterPayload, ModalFilterCustomer } from "./modalFilterCustomer";

import { useFormText } from "@/hooks/use-form-text";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title: string;
  description: string;
  addData: () => void;
  page: number;
  pageSize: number;
  lastPage: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  search: string;
  onSearchChange: (searchValue: string) => void;
  onFilterChange: (payload: CustomerFilterPayload) => void;
  isClearPayload: () => void;
  isGetData: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
  description,
  addData,
  page,
  pageSize,
  lastPage,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  onFilterChange,
  isClearPayload,
  isGetData,
}: DataTableProps<TData, TValue>) {
  const t = useFormText();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
    },
    manualPagination: true,
    pageCount: lastPage,
  });
  const { isMobile } = useContext(MobileContext);

  const [isOpenModalFilter, setIsOpenModalFilter] = useState(false);

  const handleSubmitFilter = (payload: CustomerFilterPayload) => {
    setIsOpenModalFilter(false);
    onFilterChange(payload);
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
                  xl:grid-cols-[minmax(0,1fr)_auto]
                  items-start p-1
                "
        >
          <div className="flex flex-col gap-1 min-w-0">
            <div className="font-bold truncate">{title}</div>
            <div className="text-xs text-gray-500 whitespace-normal wrap-break-word leading-relaxed">
              {description}
            </div>
          </div>

          {/* Controls */}
          <div className={controlsWrapClass}>
            <div className={searchWrapperClass}>
              <Input
                placeholder={t.customer.search}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`shrink-0 ${buttonWidthClass} whitespace-nowrap cursor-pointer`}
                  aria-label={t.common.columnFilter}
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

            <Button
              variant="outline"
              className={`shrink-0 ${buttonWidthClass} cursor-pointer`}
              onClick={() => setIsOpenModalFilter(true)}
              aria-label={t.common.advancedFilter}
            >
              <FaFilter />
            </Button>

            <Button
              variant="outline"
              className={`shrink-0 ${buttonWidthClass} cursor-pointer`}
              onClick={isGetData}
              aria-label={t.common.refreshData}
            >
              <FaArrowRotateLeft />
            </Button>

            <Button
              className={`bg-iprimary-blue hover:bg-iprimary-blue-tertiary text-white shrink-0 ${buttonWidthClass} whitespace-nowrap cursor-pointer`}
              onClick={addData}
            >
              Tambah Customer
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  Tidak ada data customer.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        onPageChange={onPageChange}
        lastPage={lastPage}
        currentPage={page}
        currentPageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
      />
      <ModalFilterCustomer
        isOpen={isOpenModalFilter}
        onClose={() => setIsOpenModalFilter(false)}
        title="Advance Filter"
        onSubmit={handleSubmitFilter}
        isClearPayload={isClearPayload}
        width={`${isMobile ? "w-[70vw]" : "w-[30vw]"}`}
      />
    </>
  );
}
