import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface DataTablePaginationProps<TData> {
  isSelectItem?: boolean;
  table: Table<TData>;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  lastPage: number;
  currentPage?: number;
  currentPageSize?: number;
  layout?: string;
}

export const DataTablePagination = <TData,>({
  isSelectItem = false,
  table,
  onPageChange,
  onPageSizeChange,
  lastPage,
  currentPage = 1,
  currentPageSize = 10,
  layout = "horizontal",
}: DataTablePaginationProps<TData>) => {
  const pageSizes = [5, 10, 20, 30, 40, 50];
  const handlePageChange = (actions: string) => {
    let newPage: number = currentPage;
    if (actions === "prev") {
      newPage = currentPage - 1;
    }
    if (actions === "next") {
      if (newPage > lastPage) {
        newPage = lastPage;
      } else {
        newPage = currentPage + 1;
      }
    }
    if (newPage < 1) newPage = 1;

    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  return (
    <>
      {layout === "vertical" ? (
        <>
          <div className="w-full min-w-0 overflow-x-auto py-4">
            <div className="flex flex-col min-w-max justify-end gap-2 w-full">
              {isSelectItem && (
                <div className="flex-1 text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="whitespace-nowrap text-xs">
                  Halaman {currentPage} dari {lastPage}
                </span>
                <Select
                  value={String(currentPageSize)}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-auto shrink-0">
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
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange("prev")}
                disabled={currentPage <= 1}
                className="shrink-0 cursor-pointer"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange("next")}
                disabled={currentPage >= lastPage}
                className="shrink-0 cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          {" "}
          <div className="w-full min-w-0 overflow-x-auto py-4">
            <div className="flex min-w-max items-center justify-end gap-2">
              {isSelectItem && (
                <div className="flex-1 text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
              )}
              <span className="whitespace-nowrap text-xs">
                Halaman {currentPage} dari {lastPage}
              </span>
              <Select
                value={String(currentPageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-auto shrink-0">
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
                disabled={currentPage <= 1}
                className="shrink-0 cursor-pointer"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange("next")}
                disabled={currentPage >= lastPage}
                className="shrink-0 cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
