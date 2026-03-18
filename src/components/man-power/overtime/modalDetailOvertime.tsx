"use client";

import { ModalDetail } from "@/components/custom/modalDetail";
import { getDictionary } from "../../../../get-dictionary";
import { IOvertime } from "@/types/overtime";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, isValid, parseISO } from "date-fns";

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  detailData: IOvertime | null;
  isOpen: boolean;
  title: string;
  onClose: () => void;
};

function KeyValue({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-sm font-medium break-words">{value ?? "-"}</div>
    </div>
  );
}

function safeFormatDateTime(dateStr?: string | null, fallback = "-") {
  if (!dateStr) return fallback;

  try {
    // coba parse ISO dulu
    const parsed = parseISO(dateStr);
    if (isValid(parsed)) {
      return format(parsed, "dd/MM/yyyy HH:mm");
    }

    // kalau bukan ISO, coba new Date biasa
    const d = new Date(dateStr);
    if (isValid(d)) {
      return format(d, "dd/MM/yyyy HH:mm");
    }
  } catch {
    // ignore
  }

  return fallback;
}

function StatusBadge({ status }: { status?: string | null }) {
  const val = (status ?? "").toLowerCase();

  let color = "bg-yellow-50 text-yellow-700 border border-yellow-200"; // default pending
  let label = status ?? "-";

  if (val === "approved") {
    color = "bg-emerald-50 text-emerald-700 border border-emerald-200";
  } else if (val === "rejected") {
    color = "bg-red-50 text-red-700 border border-red-200";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  );
}

export default function ModalDetailOvertime({
  dictionary,
  detailData,
  isOpen,
  title,
  onClose,
}: Props) {
  if (!detailData) return null;

  const requestDateText = safeFormatDateTime(detailData.request_date);
  const startTimeText = format(detailData.start_time, "dd/MM/yyyy HH:mm")
    ? format(detailData.start_time, "dd/MM/yyyy HH:mm")
    : "-";
  const endTimeText = format(detailData.end_time, "dd/MM/yyyy HH:mm")
    ? format(detailData.end_time, "dd/MM/yyyy HH:mm")
    : "-";

  return (
    <ModalDetail
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="w-[96vw] md:w-[80vw] lg:w-[60vw]"
    >
      <div className="p-4 md:p-6">
        <Card className="shadow-sm border rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base md:text-lg">
                  Detail Lembur
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-muted-foreground">
                  Informasi detail permintaan lembur karyawan
                </CardDescription>
                {detailData.user_name && (
                  <span className="text-xs text-muted-foreground">
                    Karyawan:{" "}
                    <span className="font-medium text-foreground">
                      {detailData.user_name}
                    </span>
                  </span>
                )}
              </div>

              <div className="flex flex-col items-start md:items-end gap-2">
                <StatusBadge status={detailData.status} />
                {detailData.created_by && (
                  <span className="text-[11px] text-muted-foreground">
                    Dibuat oleh{" "}
                    <span className="font-medium text-foreground">
                      {detailData.created_by}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4 space-y-6">
            {/* Info utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <KeyValue label="Tanggal Permintaan" value={requestDateText} />
              <KeyValue
                label="Proyek"
                value={
                  <>
                    {detailData.project_name ?? "-"}
                    {detailData.project_id && (
                      <span className="block text-xs text-muted-foreground">
                        ID: {detailData.project_id}
                      </span>
                    )}
                  </>
                }
              />
              <KeyValue label="Tugas / Budget" value={detailData.budget_nama} />
              <KeyValue
                label="PIC (Person in Charge)"
                value={detailData.pic_name}
              />
              <KeyValue
                label="Status"
                value={<StatusBadge status={detailData.status} />}
              />
              <KeyValue label="Karyawan" value={detailData.user_name ?? "-"} />
            </div>

            {/* Waktu lembur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KeyValue label="Waktu Mulai" value={startTimeText} />
              <KeyValue label="Waktu Selesai" value={endTimeText} />
            </div>

            {/* Alasan Lembur */}
            <div className="grid grid-cols-1 gap-3">
              <span className="text-xs text-muted-foreground">
                Alasan Lembur
              </span>
              <div className="rounded-lg border bg-muted/30 p-3 text-sm min-h-[60px]">
                {detailData.reason || "-"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModalDetail>
  );
}
