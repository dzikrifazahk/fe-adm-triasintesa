import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";

interface DataTablePaginationProps<TData> {
  isSelectItem?: boolean;
  table: Table<TData>;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  lastPage: number;
}

export const DataTablePagination = <TData,>({
  isSelectItem = false,
  table,
  onPageChange,
  onPageSizeChange,
  lastPage,
}: DataTablePaginationProps<TData>) => {
  const pageSizes = [5, 10, 20, 30, 40, 50];
  const [page, setPage] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState("10");
  const handlePageChange = (actions: string) => {
    let newPage: number = page;
    if(actions === "prev") {
      newPage = page - 1;
    }
    if(actions === "next") {
      if(newPage > lastPage) {
        newPage = lastPage
      } else {
        newPage = page + 1;
      }
    }

    setPage(newPage);

    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value);
    setSelectedPageSize(value);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      {isSelectItem && (
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}
    <span className="text-xs">Halaman {page} dari {lastPage}</span>
      <Select
        value={selectedPageSize}
        onValueChange={handlePageSizeChange} // Panggil fungsi handlePageSizeChange
      >
        <SelectTrigger className="w-auto">
          <SelectValue placeholder="Select Page Size" />
        </SelectTrigger>
        <SelectContent>
          {pageSizes.map((pageSize) => (
            <SelectItem key={pageSize} value={String(pageSize)}>
              {pageSize}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange("prev")}
        disabled={page === 1}
        className="cursor-pointer"
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange("next")}
        disabled={page === lastPage}
        className="cursor-pointer"
      >
        Next
      </Button>
    </div>
  );
};
