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
  getExpandedRowModel,
  ExpandedState,
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
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/data-table/pagination";
import { IMeta } from "@/types/common";
import { FaFilter } from "react-icons/fa6";
import { getDictionary } from "../../../../../get-dictionary";
import { IBudget } from "@/types/budget";
import { Loader2 } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  addData: (isAddData: boolean) => void;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  metadata?: IMeta;
  onSearchChange: (searchValue: string) => void;
  onFilterChange?: (payload: any) => void;
  isClearPayload: (payload: boolean) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_projects"];
  isShowRealCost?: boolean;
  setIsShowRealCost?: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading?: boolean;
}

export function BudgetTable<TData, TValue>({
  columns,
  data,
  addData,
  onPageChange,
  onPageSizeChange,
  metadata,
  onSearchChange,
  onFilterChange,
  isClearPayload,
  dictionary,
  isShowRealCost,
  setIsShowRealCost,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  // sorting
  const [sorting, setSorting] = React.useState<SortingState>([]);
  // filtering
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  // visibility
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  // row selection with checkbox
  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

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
      expanded,
    },
    getSubRows: (row: any) => row.children,
    getRowCanExpand: (row) => {
      const originalRow = row.original as any;
      return (
        isShowRealCost &&
        originalRow.children &&
        Array.isArray(originalRow.children) &&
        originalRow.children.length > 0
      );
    },
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: true,
    pageCount: metadata?.last_page ?? 0,
  });

  const [isFilterModalOpen, setFilterModalOpen] = useState(false);

  const toggleFilterModal = () => {
    setFilterModalOpen(!isFilterModalOpen);
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

  // modalFilter
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
    <div>
      <div className="flex flex-col md:flex-row items-center pb-4 gap-2 justify-between">
        <div className="w-full md:w-auto space-x-2">
          <Button
            className="btn bg-iprimary-blue text-white cursor-pointer hover:bg-iprimary-blue-tertiary w-full md:w-auto"
            onClick={() => addData(true)}
          >
            {dictionary.budgeting.button_add_budget ?? "-"}
          </Button>
          <Button
            variant={"outline"}
            className="btn   cursor-pointer  w-full md:w-auto"
            onClick={() => setIsShowRealCost?.(!isShowRealCost)}
          >
            {isShowRealCost
              ? dictionary.budgeting.button_hide_real_cost
              : dictionary.budgeting.button_show_real_cost}
          </Button>
        </div>

        <div className="w-full flex flex-col md:flex-row md:w-auto gap-2">
          <div className="w-full md:w-auto">
            <Input
              placeholder={
                dictionary?.budgeting.search_budget_placeholder ?? "-"
              }
              value={search}
              onChange={handleSearchChange}
              className="w-full md:max-w-sm"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="md:ml-auto w-full md:w-auto">
                {dictionary?.column_filter ?? "-"}
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
            className="md:ml-auto w-full md:w-auto"
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 ">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-center" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isParentRow = row.depth === 0;
                const isChildRow = row.depth > 0;

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={isChildRow ? "bg-gray-50" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={isChildRow ? "pl-12" : ""}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
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
    </div>
  );
}
