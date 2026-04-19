"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Loader2, RefreshCcw } from "lucide-react";
import { getDictionary } from "../../../get-dictionary";
import { IInvJirigen } from "@/types/inventory";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>["inventory_page_dic"];

type Props = {
  dictionary: Dictionary;
  rows: IInvJirigen[];
  searchBarcode: string;
  refreshing: boolean;
  onSearchBarcodeChange: (value: string) => void;
  onSearch: () => void;
  onRefresh: () => void;
  formatDate: (value?: string | null) => string;
  getStatusClassName: (status?: string) => string;
};

export function InventoryRecentTable({
  dictionary,
  rows,
  searchBarcode,
  refreshing,
  onSearchBarcodeChange,
  onSearch,
  onRefresh,
  formatDate,
  getStatusClassName,
}: Props) {
  return (
    <Card className="border-[#DCE3F1] shadow-sm dark:border-[#34363B] dark:bg-[#26282D]">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>{dictionary.table.title}</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {dictionary.table.description}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder={dictionary.table.search_placeholder}
              value={searchBarcode}
              onChange={(event) => onSearchBarcodeChange(event.target.value)}
              className="sm:w-[220px]"
            />
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
        <div className="overflow-hidden rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dictionary.table.columns.barcode}</TableHead>
                <TableHead>{dictionary.table.columns.batch}</TableHead>
                <TableHead>{dictionary.table.columns.location}</TableHead>
                <TableHead>{dictionary.table.columns.status}</TableHead>
                <TableHead>{dictionary.table.columns.qc_status}</TableHead>
                <TableHead>{dictionary.table.columns.entry_date}</TableHead>
                <TableHead>{dictionary.table.columns.expiry_date}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {dictionary.table.empty}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.barcode}</TableCell>
                    <TableCell>{row.batch?.batchNumber || row.batchId}</TableCell>
                    <TableCell>
                      {row.location?.locationName ||
                        `${dictionary.table.location_fallback_prefix} #${row.locationId}`}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusClassName(row.status)}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.qcStatus}</TableCell>
                    <TableCell>{formatDate(row.entryDate)}</TableCell>
                    <TableCell>{formatDate(row.expiryDate)}</TableCell>
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
