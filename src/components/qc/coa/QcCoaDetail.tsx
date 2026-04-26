"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { qcCoaService } from "@/services";
import { ICoaCertificate } from "@/types/qc-coa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Dictionary = Awaited<
  ReturnType<typeof getDictionary>
>["quality_control_page_dic"];

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

export default function QcCoaDetail({
  coaId,
  dictionary,
}: {
  coaId: string;
  dictionary: Dictionary;
}) {
  const { setIsLoading } = useLoading();
  const [coa, setCoa] = useState<ICoaCertificate | null>(null);
  const [loading, setLoading] = useState(true);

  const pageTitle = useMemo(
    () => dictionary?.title ?? "Kontrol Kualitas",
    [dictionary]
  );

  const loadCoa = useCallback(async () => {
    setLoading(true);
    try {
      const response = await qcCoaService.getCoaCertificate(coaId);
      setCoa(response?.data ?? response);
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
      setLoading(false);
    }
  }, [coaId]);

  useEffect(() => {
    loadCoa();
  }, [coaId, loadCoa]);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const handlePrint = useCallback(async () => {
    try {
      setIsLoading(true);
      const pdfBlob = await qcCoaService.getCoaPrintBlob(coaId);
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal membuka print preview",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [coaId, setIsLoading]);

  if (loading) {
    return <p className="text-sm text-slate-500">Memuat COA...</p>;
  }

  if (!coa) {
    return <p className="text-sm text-slate-500">Data COA tidak ditemukan.</p>;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {pageTitle} - COA Detail
        </h1>
        <p className="text-sm text-slate-500">{coa.coaNumber} • Dokumen turunan QC</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Ringkasan COA</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handlePrint}>
              Print Preview
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">Product</p>
            <p className="font-medium">GRH Water Aquadest</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Batch</p>
            <p className="font-medium">{coa.batchNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Issue Date</p>
            <p className="font-medium">{formatDate(coa.issueDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Expiry Date</p>
            <p className="font-medium">{formatDate(coa.expiryDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Conclusion</p>
            <p className="font-medium">{coa.conclusion}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Issued Date</p>
            <p className="font-medium">{formatDate(coa.issueDate)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Spesifikasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coa.items?.length ? (
                  coa.items.map((item, index) => (
                    <TableRow key={`${item.parameter}-${index}`}>
                      <TableCell>{item.orderNo ?? index + 1}</TableCell>
                      <TableCell>{item.parameter}</TableCell>
                      <TableCell>{item.testMethod ?? "-"}</TableCell>
                      <TableCell>{item.specification ?? "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Belum ada item.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
