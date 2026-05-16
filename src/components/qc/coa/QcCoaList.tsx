"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Swal from "sweetalert2";
import { getDictionary } from "../../../../get-dictionary";
import { qcCoaService } from "@/services";
import { useLoading } from "@/context/loadingContext";
import { ICoaCertificate } from "@/types/qc-coa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import QcPagination from "@/components/qc/QcPagination";
import { Eye, MoreHorizontal } from "lucide-react";

type Dictionary = Awaited<
  ReturnType<typeof getDictionary>
>["quality_control_page_dic"];

function toList<T>(response: unknown): T[] {
  const payload = response as {
    data?: {
      data?: T[];
    } | T[];
  };
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

function toMeta(response: unknown) {
  const payload = response as {
    meta?: unknown;
    data?: {
      meta?: unknown;
    };
  };
  return payload?.meta ?? payload?.data?.meta ?? null;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function QcCoaList({
  dictionary,
}: {
  dictionary: Dictionary;
}) {
  const actionItemClassName =
    "cursor-pointer rounded-md border px-3 py-2 focus:bg-slate-50 dark:focus:bg-[#1F2023]";

  const { setIsLoading } = useLoading();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "";

  const [data, setData] = useState<ICoaCertificate[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    coaNumber: "",
    batchId: "",
    conclusion: "",
  });

  const pageTitle = useMemo(
    () => dictionary?.title ?? "Kontrol Kualitas",
    [dictionary]
  );

  const fetchCoa = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await qcCoaService.getCoaCertificates({
        page,
        limit,
        coaNumber: filters.coaNumber || undefined,
        batchId: filters.batchId || undefined,
        conclusion: filters.conclusion || undefined,
      });
      setData(toList<ICoaCertificate>(response));
      const meta = toMeta(response);
      if (meta && typeof meta === "object" && "totalPages" in meta) {
        setTotalPages(meta.totalPages as number);
      } else {
        setTotalPages(1);
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat COA",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoadingList(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchCoa();
  }, [page, fetchCoa]);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchCoa();
    }, 500);
    return () => clearTimeout(delay);
  }, [filters, fetchCoa]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {pageTitle} - COA Certificates
        </h1>
        <p className="text-sm text-slate-500">
          Daftar certificate of analysis.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>COA List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-3">
            <Input
              placeholder="COA Number"
              value={filters.coaNumber}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, coaNumber: e.target.value }))
              }
            />
            <Input
              placeholder="Batch ID"
              value={filters.batchId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, batchId: e.target.value }))
              }
            />
            <Select
              value={filters.conclusion || undefined}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, conclusion: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Conclusion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>COA Number</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Conclusion</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingList ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : data.length ? (
                  data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.coaNumber}
                      </TableCell>
                      <TableCell>{item.batch?.batchNumber ?? item.batchId}</TableCell>
                      <TableCell>{formatDate(item.issueDate)}</TableCell>
                      <TableCell>{formatDate(item.expiryDate)}</TableCell>
                      <TableCell>{item.conclusion}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
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
                                  asChild
                                  className={`${actionItemClassName} border-slate-300`}
                                >
                                  <Link
                                    href={`/${locale}/dashboard/qc/coa-certificates/${item.id}`}
                                  >
                                    <Eye className="text-slate-600" />
                                    Detail
                                  </Link>
                                </DropdownMenuItem>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Belum ada COA.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <QcPagination
            page={page}
            totalPages={totalPages}
            onPageChange={(value) => setPage(value)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
