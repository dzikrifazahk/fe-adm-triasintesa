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
import React, { useContext, useEffect, useMemo, useState } from "react";
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
import { ModalFilterAttendance } from "./modalFilterAttendance";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal } from "@/components/custom/modal";
import { DateTimePicker24h } from "@/components/ui/dateTimePicker";
import Swal from "sweetalert2";
import { ITerminateOvertime } from "@/types/overtime";
import { format } from "date-fns";
import { overtimeService } from "@/services";
import axios from "axios";

type RowWithOvertime = {
  id?: string | number;
  overtime?: {
    id?: string | number;
  };
};

interface DataTableProps<TData extends RowWithOvertime, TValue> {
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
  syncGaji: () => void;
  onSelectedIdsChange?: (ids: (string | number)[]) => void;
  setIsLoading?: (loading: boolean) => void;
  isGetData?: () => void;
}

export function DataTable<TData extends RowWithOvertime, TValue>({
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
  syncGaji,
  onSelectedIdsChange,
  setIsLoading,
  isGetData,
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

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [endTime, setEndTime] = useState<Date | undefined>(
    new Date(new Date().setSeconds(0, 0))
  );

  const columnsWithSelection = useMemo<ColumnDef<TData, any>[]>(() => {
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

  const [search, setSearch] = useState("");

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
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

  // === Ambil selected IDs dari overtime.id (fallback ke id biasa kalau perlu) ===
  useEffect(() => {
    const ids = table
      .getSelectedRowModel()
      .rows.map((row) => {
        const original = row.original as RowWithOvertime;
        const rawId = original.overtime?.id ?? original.id;
        return rawId;
      })
      .filter((id): id is string | number => id !== undefined)
      .map((id) => (typeof id === "string" ? Number(id) : id))
      .filter((id) => !Number.isNaN(id));

    setSelectedIds(ids);
    if (onSelectedIdsChange) {
      onSelectedIdsChange(ids);
    }
  }, [rowSelection, table, onSelectedIdsChange]);

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

  const hasSelection = selectedIds.length > 0;

  const openEndModal = () => {
    setEndTime(new Date(new Date().setSeconds(0, 0)));
    setIsEndModalOpen(true);
  };

  const handleSubmitEndOvertime = (e: React.FormEvent) => {
    e.preventDefault();

    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!endTime) {
      Swal.fire({
        icon: "warning",
        title: "Waktu belum diisi",
        text: "Silakan pilih End Time.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    if (!selectedIds.length) {
      Swal.fire({
        icon: "warning",
        title: "Tidak ada lembur yang dipilih",
        text: "Silakan pilih minimal satu lembur.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const payload: ITerminateOvertime = {
      overtime_ids: selectedIds,
      end_time: format(endTime, "yyyy-MM-dd HH:mm"),
      timezone: clientTimezone,
    };

    // console.log(JSON.stringify(payload, null, 2));

    // Uncomment block ini kalau mau langsung call API terminate

    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin mengakhiri lembur terpilih?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (setIsLoading) setIsLoading(true);
          const response = await overtimeService.terminateOvertime(payload);
          if (setIsLoading) setIsLoading(false);

          setIsEndModalOpen(false);
          table.resetRowSelection();

          Swal.fire({
            icon: "success",
            title: `${response.message ?? "Berhasil mengakhiri lembur."}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });

          isGetData?.();
        } catch (e) {
          if (setIsLoading) setIsLoading(false);
          if (axios.isAxiosError(e)) {
            const rawMessage = e.response?.data?.message;
            let errorMessages: string[] = [];

            if (typeof rawMessage === "string") {
              errorMessages.push(rawMessage);
            } else if (Array.isArray(rawMessage)) {
              errorMessages = rawMessage;
            } else if (typeof rawMessage === "object" && rawMessage !== null) {
              for (const field in rawMessage) {
                if (Object.prototype.hasOwnProperty.call(rawMessage, field)) {
                  const fieldErrors = (rawMessage as any)[field];
                  if (Array.isArray(fieldErrors)) {
                    errorMessages.push(`${field}: ${fieldErrors.join(", ")}`);
                  } else if (typeof fieldErrors === "string") {
                    errorMessages.push(`${field}: ${fieldErrors}`);
                  }
                }
              }
            } else {
              errorMessages.push("Terjadi kesalahan.");
            }

            Swal.fire({
              icon: "error",
              title: "Terjadi Kesalahan",
              html: errorMessages.join("<br>"),
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 3000,
            });
          }
        }
      } else if (result.isConfirmed === false) {
        Swal.fire({
          icon: "warning",
          title: "Batal Mengakhiri Lembur",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });

  };

  const closeEndModal = () => {
    setIsEndModalOpen(false);
  };

  return (
    <>
      <div className="w-full h-full overflow-auto">
        <div className="flex flex-col md:flex-row items-center pb-4 gap-2 justify-between p-1">
          <div className="w-full md:w-auto flex gap-2">
            <Button
              className="btn bg-iprimary-blue text-white cursor-pointer hover:bg-iprimary-blue-tertiary w-full md:w-auto"
              onClick={() => syncGaji()}
            >
              Sync Gaji
            </Button>
            {hasSelection && (
              <Button
                className="w-full md:w-auto cursor-pointer"
                variant="destructive"
                onClick={openEndModal}
              >
                End Overtime
              </Button>
            )}
          </div>

          <div className="w-full flex flex-col md:flex-row md:w-auto gap-2">
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
        {isEndModalOpen && (
          <Modal
            isOpen={isEndModalOpen}
            onClose={closeEndModal}
            title="End Overtime"
            onSubmit={handleSubmitEndOvertime}
            onCancel={closeEndModal}
            width={isMobile ? "w-[80vw]" : "w-[30vw]"}
          >
            <div className="space-y-4 p-5">
              <p className="text-sm text-muted-foreground">
                Anda akan mengakhiri lembur untuk{" "}
                <span className="font-semibold">{selectedIds.length}</span> data
                terpilih.
              </p>
              <div className="space-y-1">
                <label className="text-sm font-sans-bold">
                  End Time <span className="text-red-500">*</span>
                </label>
                <DateTimePicker24h
                  value={endTime}
                  onChange={(d) => setEndTime(d)}
                  displayFormat="dd/MM/yyyy HH:mm"
                  placeholder="DD/MM/YYYY HH:mm"
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}
