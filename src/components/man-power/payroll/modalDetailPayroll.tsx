"use client";

import { IPayroll } from "@/types/payroll";
import { getDictionary } from "../../../../get-dictionary";
import { ModalDetail } from "@/components/custom/modalDetail";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { parseISO, format, isValid } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ExternalLink } from "lucide-react";

export default function ModalDetailPayroll({
  dictionary,
  detailData,
  isOpen,
  title,
  onClose,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  detailData: IPayroll | null;
  isOpen: boolean;
  title: string;
  onClose: () => void;
}) {
  if (!detailData) return null;

  const toCurrency = (n?: number | null) =>
    typeof n === "number"
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(n)
      : "-";

  const safeFormat = (
    dateStr?: string | null,
    f: string = "dd MMM yyyy HH:mm",
  ) => {
    if (!dateStr) return "-";
    const tryIso = parseISO(dateStr);
    const d = isValid(tryIso) ? tryIso : new Date(dateStr);
    return isValid(d) ? format(d, f, { locale: idLocale }) : "-";
  };

  const [fromRaw, toRaw] =
    (detailData.datetime || "").split(",").map((s) => s.trim()) ?? [];
  const periodFrom = safeFormat(fromRaw, "dd MMM yyyy");
  const periodTo = safeFormat(toRaw, "dd MMM yyyy");

  const statusColor = (() => {
    switch (detailData.status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  })();

  const timezone =
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "Asia/Jakarta";
  return (
    <ModalDetail
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="w-[80vw]"
    >
      <div className="space-y-4 p-5">
        {/* Header ringkas */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <CardTitle className="text-lg">
                  {detailData.user_name ?? "-"}
                </CardTitle>
                <CardDescription>
                  Periode: {periodFrom} — {periodTo}
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className={`border ${statusColor} capitalize`}
                title={`Status: ${detailData.status ?? "-"}`}
              >
                {detailData.status ?? "-"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <MiniStat
              label="Total Kehadiran"
              value={detailData.total_attendance ?? 0}
            />
            <MiniStat
              label="Total Gaji Harian"
              value={toCurrency(detailData.total_daily_salary)}
            />
            <MiniStat
              label="Total Lembur"
              value={toCurrency(detailData.total_overtime)}
            />
            <MiniStat
              label="Potongan Telat"
              value={toCurrency(detailData.total_late_cut)}
            />
            <MiniStat
              label="Pinjaman"
              value={toCurrency(detailData.total_loan)}
            />
            <MiniStat
              label="Catatan"
              value={
                detailData.notes && detailData.notes !== "0"
                  ? detailData.notes
                  : "-"
              }
            />
          </CardContent>
        </Card>

        {/* Detail identitas & approval */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rincian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="Karyawan" value={detailData.user_name} />
              <DetailRow label="PIC" value={detailData.pic_name} />
              <DetailRow
                label="Disetujui Oleh"
                value={detailData.approved_name ?? "-"}
              />
              <DetailRow
                label="Waktu Persetujuan"
                value={safeFormat(detailData.approved_at)}
              />
              <DetailRow
                label="Dibuat"
                value={safeFormat(detailData.created_at)}
              />
              <DetailRow
                label="Diperbarui"
                value={safeFormat(detailData.updated_at)}
              />
              <DetailRow
                label="Alasan Approval"
                value={detailData.reason_approval ?? "-"}
                className="md:col-span-2"
              />
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <a
                // href={detailData.document_preview ?? "#"}
                href={
                  detailData.document_preview
                    ? `${detailData.document_preview}?timezone=${timezone}`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Preview Dokumen
                </Button>
              </a>
              <a
                // href={detailData.document_download ?? "#"}
                href={
                  detailData.document_download
                    ? `${detailData.document_download}?timezone=${timezone}`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <Button type="button" className="gap-2 cursor-pointer">
                  <ExternalLink className="h-4 w-4" />
                  Download Dokumen
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModalDetail>
  );
}

function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium truncate">{value ?? "-"}</div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold mt-0.5">
        {value !== undefined && value !== null ? value : "-"}
      </div>
    </div>
  );
}
