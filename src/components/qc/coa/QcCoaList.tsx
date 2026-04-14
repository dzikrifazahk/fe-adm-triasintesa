"use client";

import { useEffect, useMemo, useState } from "react";
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

type Dictionary = Awaited<
  ReturnType<typeof getDictionary>
>["quality_control_page_dic"];

function toList<T>(response: any): T[] {
  return response?.data?.data ?? response?.data ?? [];
}

function toMeta(response: any) {
  return response?.meta ?? response?.data?.meta ?? null;
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
  const { setIsLoading } = useLoading();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "";

  const [data, setData] = useState<ICoaCertificate[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
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

  const fetchCoa = async () => {
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
      if (meta?.totalPages) {
        setTotalPages(meta.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
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
  };

  useEffect(() => {
    fetchCoa();
  }, [page, limit]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchCoa();
    }, 500);
    return () => clearTimeout(delay);
  }, [filters]);

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
                <SelectItem value="conditional">Conditional</SelectItem>
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
                        <Link
                          href={`/${locale}/dashboard/qc/coa-certificates/${item.id}`}
                        >
                          <Button variant="outline" size="sm">
                            Detail
                          </Button>
                        </Link>
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
