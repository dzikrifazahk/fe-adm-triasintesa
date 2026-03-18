import { ModalDetail } from "@/components/custom/modalDetail";
import { getDictionary } from "../../../../get-dictionary";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format, isValid, parseISO } from "date-fns";
import {
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Hourglass,
} from "lucide-react";
import { mapLeaveType } from "@/helpers/leaveConvertion";
import { mapLeaveStatus } from "@/helpers/leaveStatus";

export interface IRest {
  id: number;
  user_id: number;
  user_name: string;
  pic_id: number | null;
  pic_name: string | null;
  type: number;
  reason: string | null;
  reason_approval: string | null;
  start_date: string;
  end_date: string;
  attachment?: string | null;
  status: "waiting" | "approved" | "rejected" | string;
  approve_by?: string | null;
  approve_at?: string | null;
  created_at: string;
  updated_at: string;
}

export default function ModalDetailRest({
  dictionary,
  detailData,
  isOpen,
  title,
  onClose,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  detailData: IRest | null;
  isOpen: boolean;
  title: string;
  onClose: () => void;
}) {
  if (!detailData) return null;

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return "-";
    return format(parsed, "dd MMM yyyy, HH:mm");
  };

  const formatDateShort = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const parsed = parseISO(dateStr);
    if (!isValid(parsed)) return "-";
    return format(parsed, "dd MMM yyyy");
  };

  const leaveType = mapLeaveType(detailData.type);
  const statusMeta = mapLeaveStatus(detailData.status || "-");

  const rawStatus = (detailData.status || "").toLowerCase();
  const statusIcon =
    rawStatus === "approved" ? (
      <CheckCircle2 className="w-4 h-4 mr-1.5" />
    ) : rawStatus === "rejected" ? (
      <XCircle className="w-4 h-4 mr-1.5" />
    ) : (
      <Hourglass className="w-4 h-4 mr-1.5" />
    );

  const hasAttachment = !!detailData.attachment;

  return (
    <ModalDetail
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="w-[90vw] md:w-[70vw] lg:w-[60vw]"
    >
      <div className="p-4 md:p-6">
        <div className="rounded-2xl border shadow-md bg-white dark:bg-slate-950 overflow-hidden">
          {/* HEADER */}
          <div className="px-4 md:px-6 py-4 md:py-5 bg-sky-50/80 dark:bg-sky-950/40 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10">
                    <Clock className="w-4 h-4 text-sky-500" />
                  </span>
                  <h2 className="text-base md:text-lg font-semibold">
                    Detail Pengajuan Cuti / Izin
                  </h2>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Ringkasan pengajuan termasuk periode, tipe, dan status
                  persetujuan.
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* STATUS */}
                  <Badge
                    variant="outline"
                    className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusMeta.className}`}
                  >
                    {statusIcon}
                    <span className="text-xs md:text-[13px]">
                      {statusMeta.label}
                    </span>
                  </Badge>

                  {/* TYPE */}
                  <Badge
                    variant="outline"
                    className={`px-3 py-1 rounded-full text-[11px] font-medium ${leaveType.className}`}
                  >
                    {leaveType.label}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Dibuat: {formatDateTime(detailData.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="px-4 md:px-6 py-5 space-y-6">
            {/* PEMOHON & PIC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10">
                  <User className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                    PEMOHON
                  </p>
                  <p className="font-semibold text-sm md:text-base">
                    {detailData.user_name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    ID: {detailData.user_id}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                    PIC (PERSON IN CHARGE)
                  </p>
                  <p className="font-semibold text-sm md:text-base">
                    {detailData.pic_name ?? "-"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    PIC ID: {detailData.pic_id ?? "-"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* PERIODE */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                PERIODE PENGAJUAN
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="text-base text-muted-foreground">Mulai</p>
                    <p className="text-xs md:text-sm">
                      {formatDateTime(detailData.start_date)}
                    </p>
                  </div>

                  <div className="hidden sm:block flex-1">
                    <div className="h-px w-full bg-border" />
                  </div>

                  <div className="flex-1 sm:text-right">
                    <p className="text-base text-muted-foreground">Selesai</p>
                    <p className="text-xs md:text-sm">
                      {formatDateTime(detailData.end_date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* ALASAN & APPROVAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                  ALASAN PENGAJUAN
                </p>
                <p className="text-sm md:text-base font-medium">
                  {detailData.reason && detailData.reason !== "-"
                    ? detailData.reason
                    : "-"}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                  CATATAN PERSETUJUAN
                </p>
                <p className="text-sm md:text-base font-medium">
                  {detailData.reason_approval &&
                  detailData.reason_approval !== "-"
                    ? detailData.reason_approval
                    : "-"}
                </p>
                {detailData.approve_by && (
                  <p className="text-[11px] text-muted-foreground">
                    Disetujui oleh {detailData.approve_by} pada{" "}
                    {formatDateTime(detailData.approve_at)}
                  </p>
                )}
              </div>
            </div>

            {/* LAMPIRAN */}
            {hasAttachment && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                    LAMPIRAN
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">
                          File Lampiran
                        </span>
                        <span className="text-[11px] text-muted-foreground break-all">
                          {detailData.attachment}
                        </span>
                      </div>
                    </div>
                    <a
                      href={detailData.attachment ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
                    >
                      Lihat
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ModalDetail>
  );
}
