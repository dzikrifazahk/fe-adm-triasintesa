"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { IMeta } from "@/types/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IProduct } from "@/types/purchase";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { FaEye } from "react-icons/fa6";

interface DataTableProps<TData, TValue> {
  columns?: ColumnDef<IProduct, TValue>[];
  data: IProduct[];
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  metadata?: IMeta;
  viewDetailData: (item: IProduct) => void;
}

type VendorGroup = {
  vendorId: number | string;
  vendorName: string;
  products: IProduct[];
};

// helper untuk kunci unik selection per product
function productKey(p: IProduct) {
  const v = p.vendor?.id ?? p.vendor?.name ?? "UNKNOWN_VENDOR";
  const pid = (p as any).id ?? p.product_name ?? "UNKNOWN_PRODUCT";
  return `${v}::${pid}`;
}

export function DataTableDetail<TData, TValue>({
  data,
  viewDetailData,
}: DataTableProps<TData, TValue>) {
  // === Group by vendor ===
  const groups: VendorGroup[] = React.useMemo(() => {
    const map = new Map<string | number, VendorGroup>();
    for (const p of data ?? []) {
      const vId = p.vendor?.id ?? p.vendor?.name ?? "UNKNOWN";
      const vName = p.vendor?.name ?? "Unknown Vendor";
      if (!map.has(vId)) {
        map.set(vId, { vendorId: vId, vendorName: vName, products: [] });
      }
      map.get(vId)!.products.push(p);
    }
    return Array.from(map.values()).sort((a, b) =>
      String(a.vendorName).localeCompare(String(b.vendorName))
    );
  }, [data]);

  // === Selection state (keyed by productKey) ===
  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({});

  const allProductKeys = React.useMemo(() => data.map(productKey), [data]);
  const allSelected =
    allProductKeys.length > 0 && allProductKeys.every((k) => rowSelection[k]);

  const toggleAll = () => {
    if (!allSelected) {
      const next: Record<string, boolean> = {};
      for (const k of allProductKeys) next[k] = true;
      setRowSelection(next);
    } else {
      setRowSelection({});
    }
  };

  const toggleOne = (p: IProduct) => {
    const k = productKey(p);
    setRowSelection((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  // === Pagination per vendor (bukan per product) ===
  const [selectedPageSize, setSelectedPageSize] = React.useState(5);
  const [currentPage, setCurrentPage] = React.useState(0);
  const vendorsPerPage = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  const totalPages = Math.max(1, Math.ceil(groups.length / selectedPageSize));
  const pageSlice = React.useMemo(
    () =>
      groups.slice(
        currentPage * selectedPageSize,
        (currentPage + 1) * selectedPageSize
      ),
    [groups, currentPage, selectedPageSize]
  );

  const handleNextPage = () =>
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  const handlePrevPage = () =>
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value);
    setSelectedPageSize(newSize);
    setCurrentPage(0);
  };

  return (
    <div className="w-full min-w-0">
      <div className="rounded-md border overflow-x-auto">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              {/* Master checkbox column */}
              <TableHead className="text-xs text-center whitespace-nowrap w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="cursor-pointer"
                />
              </TableHead>

              <TableHead className="text-xs text-left whitespace-nowrap">
                Nama Produk
              </TableHead>
              <TableHead className="text-xs text-center whitespace-nowrap">
                Qty
              </TableHead>
              <TableHead className="text-xs text-right whitespace-nowrap">
                Harga
              </TableHead>
              <TableHead className="text-xs text-right whitespace-nowrap">
                Subtotal
              </TableHead>
              <TableHead className="text-xs text-center whitespace-nowrap">
                PPN
              </TableHead>
              <TableHead className="text-xs text-center whitespace-nowrap">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageSlice.length > 0 ? (
              pageSlice.map((g) => (
                <React.Fragment key={g.vendorId}>
                  {/* Vendor header row */}
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="font-bold text-xs bg-muted/40"
                    >
                      {g.vendorName}
                    </TableCell>
                  </TableRow>

                  {/* Product rows for this vendor */}
                  {g.products.map((product, idx) => {
                    const k = productKey(product);
                    const checked = !!rowSelection[k];

                    return (
                      <TableRow key={`${g.vendorId}-${idx}`}>
                        {/* Row checkbox */}
                        <TableCell className="text-center whitespace-nowrap w-10">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOne(product)}
                            className="cursor-pointer"
                          />
                        </TableCell>

                        <TableCell
                          className="text-xs whitespace-nowrap max-w-[240px] truncate"
                          title={product.product_name}
                        >
                          {product.product_name ?? "-"}
                        </TableCell>

                        <TableCell className="text-xs text-center whitespace-nowrap">
                          {product.stok ?? 0}
                        </TableCell>

                        <TableCell className="text-xs text-right whitespace-nowrap">
                          {formatCurrencyIDR(Number(product.harga ?? 0))}
                        </TableCell>

                        <TableCell className="text-xs text-right whitespace-nowrap">
                          {formatCurrencyIDR(
                            Number(product.subtotal_harga_product ?? 0)
                          )}
                        </TableCell>

                        <TableCell className="text-xs text-center whitespace-nowrap">
                          {product.ppn?.rate != null
                            ? `${product.ppn.rate}%`
                            : "-"}
                        </TableCell>

                        <TableCell className="text-xs text-center whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel className="text-center">
                                Actions
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                className="border border-slate-500 cursor-pointer"
                                onClick={() => viewDetailData(product)}
                              >
                                <FaEye className="mr-2" />
                                Lihat Detail
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Tidak ada data produk
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (per vendor) */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <span className="text-xs">
          Halaman {Math.min(currentPage + 1, totalPages)} dari {totalPages}
        </span>

        <Select
          value={String(selectedPageSize)}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Page Size" />
          </SelectTrigger>
          <SelectContent>
            {vendorsPerPage.map((ps) => (
              <SelectItem key={ps} value={String(ps)}>
                {ps}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
