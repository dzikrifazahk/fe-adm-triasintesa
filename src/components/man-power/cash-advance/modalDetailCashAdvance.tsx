import { ModalDetail } from "@/components/custom/modalDetail";
import { getDictionary } from "../../../../get-dictionary";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format, isValid, parseISO } from "date-fns";
import { ICashAdvance } from "@/types/cash-advance";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";

function safeFormatDate(
  value?: string | Date | null,
  fmt = "dd MMM yyyy HH:mm"
) {
  if (!value) return "-";
  let d: Date;
  if (value instanceof Date) {
    d = value;
  } else {
    d = parseISO(value);
  }
  return isValid(d) ? format(d, fmt) : "-";
}

function formatRupiah(n?: number | null) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "-";
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `Rp ${n.toLocaleString("id-ID")}`;
  }
}

function StatusBadge({ status }: { status?: string | null }) {
  const s = (status ?? "-").toLowerCase();
  const color =
    s === "approved"
      ? "bg-green-100 text-green-700 border-green-200"
      : s === "rejected"
      ? "bg-red-100 text-red-700 border-red-200"
      : s === "pending" || s === "review"
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs rounded border ${color}`}
    >
      {status ?? "-"}
    </span>
  );
}

function SettledBadge({
  settled,
}: {
  settled: number | boolean | null | undefined;
}) {
  const isSettled = typeof settled === "boolean" ? settled : settled === 1;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs rounded border ${
        isSettled
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : "bg-orange-100 text-orange-700 border-orange-200"
      }`}
    >
      {isSettled ? "Telah terselesaikan" : "Belum terselesaikan"}
    </span>
  );
}

export default function ModalDetailCashAdvance({
  dictionary,
  detailData,
  isOpen,
  title,
  onClose,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
  detailData: ICashAdvance | null;
  isOpen: boolean;
  title: string;
  onClose: () => void;
}) {
  if (!detailData) return null;

  // Casting ringan supaya aman di akses
  const d = detailData as ICashAdvance;

  return (
    <ModalDetail
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="w-[80vw]"
    >
      <div className="p-5">
        <Card className="shadow-md border rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg">Detail Cash Advance</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Informasi detail pengajuan kasbon karyawan
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Baris 1 */}
            <div>
              <p className="text-xs text-muted-foreground">Dibuat oleh</p>
              <p className="font-medium">{(d as any)?.created_by ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Tanggal Permintaan
              </p>
              <p className="font-medium">{safeFormatDate(d.request_date)}</p>
            </div>

            {/* Baris 2 */}
            <div>
              <p className="text-xs text-muted-foreground">Nominal</p>
              <p className="font-medium">
                {formatCurrencyIDR(d.nominal as number)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="font-medium">
                <StatusBadge status={d.status} />
              </div>
            </div>

            {/* Baris 3 */}
            <div>
              <p className="text-xs text-muted-foreground">Disetujui oleh</p>
              <p className="font-medium">{d.approval_by ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Disetujui pada</p>
              <p className="font-medium">{safeFormatDate(d.approve_at)}</p>
            </div>

            {/* Baris 4 */}
            <div>
              <p className="text-xs text-muted-foreground">PIC</p>
              <p className="font-medium">
                {d.pic_name ?? "-"}{" "}
                {/* <span className="text-xs text-muted-foreground">
                  {d.pic_id ? `(ID: ${d.pic_id})` : ""}
                </span> */}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">Settlement</p>
              <div className="font-medium">
                <SettledBadge settled={d.is_settled} />
              </div>
            </div>

            {/* Baris 5 */}
            <div>
              <p className="text-xs text-muted-foreground">Alasan Pengajuan</p>
              <p className="font-medium">{d.reason ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Alasan Persetujuan
              </p>
              <p className="font-medium">{d.reason_approval ?? "-"}</p>
            </div>

            {/* Baris 6 (opsional latest) */}
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground">
                Sisa Kasbon Terakhir Yang Harus Dibayar
              </p>
              <p className="font-medium">
                {formatCurrencyIDR(d?.latest ?? "-")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModalDetail>
  );
}
