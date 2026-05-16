"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Loader2, MoreHorizontal, RefreshCcw, Search } from "lucide-react";
import { getDictionary } from "../../../get-dictionary";
import { IInvJirigen } from "@/types/inventory";
import { FaPencil, FaTrash } from "react-icons/fa6";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>["inventory_page_dic"];

type Props = {
  dictionary: Dictionary;
  rows: IInvJirigen[];
  searchBarcode: string;
  refreshing: boolean;
  onSearchBarcodeChange: (value: string) => void;
  onSearch: () => void;
  onRefresh: () => void;
  onChangeStatus: (id: number, status: IInvJirigen["status"]) => void;
  onViewRow: (row: IInvJirigen) => void;
  onEditRow: (row: IInvJirigen) => void;
  onDeleteRow: (row: IInvJirigen) => void;
  formatDate: (value?: string | null) => string;
  getStatusClassName: (status?: string) => string;
};

export function InventoryRecentTable(props: Props) {
  const {
    dictionary,
    rows,
    searchBarcode,
    refreshing,
    onSearchBarcodeChange,
    onSearch,
    onRefresh,
    onViewRow,
    onEditRow,
    onDeleteRow,
    formatDate,
    getStatusClassName,
  } = props;

  const actionItemClassName =
    "cursor-pointer rounded-md border px-3 py-2 focus:bg-slate-50 dark:focus:bg-[#1F2023]";

  const getBatchLabel = (row: IInvJirigen): string => {
    const itemCode = row.item?.itemCode?.toLowerCase() ?? "";
    const itemName = row.item?.itemName?.toLowerCase() ?? "";
    const itemCategory = row.item?.category?.toLowerCase() ?? "";
    const isJirigenItem =
      itemCode.startsWith("jirigen") ||
      itemName.includes("jirigen") ||
      itemCategory.includes("jirigen");

    if (!isJirigenItem) {
      return "-";
    }

    if (row.batch?.batchNumber) {
      return row.batch.batchNumber;
    }

    if (row.batchId) {
      return String(row.batchId);
    }

    return "-";
  };

  return (
    <Card className="border-[#DCE3F1] shadow-sm dark:border-[#34363B] dark:bg-[#26282D]">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>{dictionary.table.title}</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {dictionary.table.description}
            </p>
            <div className="mt-3">
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                {rows.length} data ditampilkan
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={dictionary.table.search_placeholder}
                value={searchBarcode}
                onChange={(event) => onSearchBarcodeChange(event.target.value)}
                className="sm:w-[240px] pl-10"
              />
            </div>
            <Button variant="outline" onClick={onSearch}>
              {dictionary.table.search_button}
            </Button>
            <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-[#DCE3F1] dark:border-[#34363B]">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 dark:bg-[#1F2023]">
                <TableHead>{dictionary.table.columns.item ?? "Item"}</TableHead>
                <TableHead>{dictionary.table.columns.barcode}</TableHead>
                <TableHead>{dictionary.table.columns.batch}</TableHead>
                <TableHead>{dictionary.table.columns.location}</TableHead>
                <TableHead>{dictionary.table.columns.status}</TableHead>
                <TableHead>{dictionary.table.columns.entry_date}</TableHead>
                <TableHead>{dictionary.table.columns.expiry_date}</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {dictionary.table.empty}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} className="align-top">
                    <TableCell className="font-medium">
                      <div className="font-medium">{row.item?.itemName || "-"}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {row.item?.itemCode || "Tanpa kode item"}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{row.barcode}</TableCell>
                    <TableCell>{getBatchLabel(row)}</TableCell>
                    <TableCell>
                      {row.location?.locationName ||
                        `${dictionary.table.location_fallback_prefix} #${row.locationId}`}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusClassName(row.status)}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(row.entryDate)}</TableCell>
                    <TableCell>{formatDate(row.expiryDate)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        {/* <select
                          className="h-9 rounded-md border bg-background px-2 text-sm"
                          value={row.status}
                          onChange={(event) =>
                            onChangeStatus(
                              row.id,
                              event.target.value as IInvJirigen["status"],
                            )
                          }
                        >
                          <option value="available">available</option>
                          <option value="reserved">reserved</option>
                          <option value="shipped">shipped</option>
                          <option value="sold">sold</option>
                          <option value="returned">returned</option>
                        </select> */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open actions</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-center">
                              Actions
                            </DropdownMenuLabel>
                            <div className="flex flex-col gap-2 p-1">
                              <DropdownMenuItem
                                className={`${actionItemClassName} border-slate-300`}
                                onClick={() => onViewRow(row)}
                              >
                                <Eye className="text-slate-600" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`${actionItemClassName} border-yellow-500`}
                                onClick={() => onEditRow(row)}
                                disabled={row.status !== "available"}
                              >
                                <FaPencil className="text-yellow-400" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`${actionItemClassName} border-red-500`}
                                onClick={() => onDeleteRow(row)}
                                disabled={row.status !== "available"}
                              >
                                <FaTrash className="text-red-500" />
                                Hapus
                              </DropdownMenuItem>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
