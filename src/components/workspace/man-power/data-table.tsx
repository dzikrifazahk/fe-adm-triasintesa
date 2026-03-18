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
import { DataTablePagination } from "@/components/data-table/pagination";
import { IMeta } from "@/types/common";
import { getDictionary } from "../../../../get-dictionary";
import { FaFilter } from "react-icons/fa6";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { ModalFilterAttendance } from "@/components/man-power/attendance/modalFilterAttendance";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  addData: (isAddData: boolean) => void;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  metadata?: IMeta;
  onSearchChange: (searchValue: string) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  onFilterChange?: (payload: any) => void;
  isClearPayload: (payload: boolean) => void;
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
  onFilterChange,
  isClearPayload,
}: DataTableProps<TData, TValue>) {
  const { isMobile } = useContext(MobileContext);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [search, setSearch] = useState("");
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange(value);
  };

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
  //  const handleCloseModalFilter = (payload: any) => {
  //   setIsOpenModalFilter(false);
  //   if (onFilterChange) {
  //     onFilterChange(payload);
  //   }
  // };
  const [isOpenModalFilter, setIsOpenModalFilter] = useState(false);
  const handleOpenModalFilter = () => {
    setIsOpenModalFilter(true);
  };
  const handleCloseModalFilter = (payload: any) => {
    setIsOpenModalFilter(false);
    if (onFilterChange) {
      onFilterChange(payload);
    }
  };
  return (
    <>
      <div className="w-full h-full overflow-auto">
        <div className="flex flex-col md:flex-row items-center pb-4 gap-2 justify-between">
          <div className="w-full md:w-auto">
            {/* <Button
              className="btn bg-iprimary-blue text-white cursor-pointer hover:bg-iprimary-blue-tertiary w-full md:w-auto"
              onClick={() => addData(true)}
            >
              {dictionary.attendance.button_add_attendance ?? "-"}
            </Button> */}
          </div>

          <div className="w-full flex flex-col md:flex-row md:w-auto gap-2 p-1">
            <div className="w-full md:w-auto">
              <Input
                placeholder={
                  dictionary?.attendance?.search_attendance_placeholder ?? "-"
                }
                value={search}
                onChange={handleSearchChange}
                className="w-full md:max-w-sm"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="md:ml-auto w-full md:w-auto"
                >
                  {dictionary?.attendance.column_filter ?? "-"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
              className="md:ml-auto w-full md:w-auto cursor-pointer"
              onClick={handleOpenModalFilter}
            >
              <FaFilter />
            </Button>
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
        <DataTablePagination
          table={table}
          onPageChange={handlePageChange}
          lastPage={metadata?.last_page as number}
          onPageSizeChange={handlePageSizeChange}
        />
        <ModalFilterAttendance
          isOpen={isOpenModalFilter}
          onClose={() => setIsOpenModalFilter(false)}
          title="Advance Filter"
          onSubmit={handleCloseModalFilter}
          isClearPayload={isClearPayload}
          dictionary={dictionary}
          width={isMobile ? "w-[70vw]" : "w-[30vw]"}
        />
      </div>
    </>
  );
}
