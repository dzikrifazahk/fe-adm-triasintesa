"use client";

import { ModalDetail } from "@/components/custom/modalDetail";
import { Badge } from "@/components/ui/badge";
import { IInvJirigen } from "@/types/inventory";
import { Archive, Boxes, CalendarClock, MapPin, Package2, ScanBarcode } from "lucide-react";

type InventoryDetailData = IInvJirigen & {
  jirigen?: {
    jirigenNumber?: number | null;
    volumeLiter?: string | null;
    productionDatetime?: string | null;
    notes?: string | null;
  };
};

type Props = {
  data?: InventoryDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  formatDate: (value?: string | null) => string;
  getStatusClassName: (status?: string) => string;
};

export function InventoryDetailModal({
  data,
  isOpen,
  onClose,
  onCancel,
  formatDate,
  getStatusClassName,
}: Props) {
  const itemName = data?.item?.itemName || "Inventory Item";
  const itemCode = data?.item?.itemCode || "-";
  const locationName = data?.location?.locationName || "-";
  const locationCode = data?.location?.locationCode || "-";
  const batchNumber = data?.batch?.batchNumber || (data?.batchId ? `#${data.batchId}` : "-");

  return (
    <ModalDetail
      isOpen={isOpen}
      title={`Detail Inventory ${data?.barcode ? `- ${data.barcode}` : ""}`}
      width="w-[95vw] max-w-[980px]"
      onClose={onClose}
      onCancel={onCancel}
    >
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-[#DCE3F1] bg-[linear-gradient(135deg,#F8FBFF_0%,#EEF5FF_55%,#FFFFFF_100%)] p-6 shadow-sm dark:border-[#34363B] dark:bg-[linear-gradient(135deg,#1F2430_0%,#202B3C_55%,#26282D_100%)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-3xl bg-white p-4 text-[#2B59FF] shadow-sm dark:bg-[#1F2023] dark:text-[#8FB0FF]">
                  <Package2 className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2B59FF] dark:text-[#8FB0FF]">
                    Inventory Overview
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {itemName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Kode item {itemCode} • Barcode {data?.barcode || "-"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusClassName(data?.status)}>
                  {data?.status || "-"}
                </Badge>
                <Badge variant="outline">Batch {batchNumber}</Badge>
                <Badge variant="outline">{data?.item?.uom || "No UOM"}</Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Informasi Utama">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={<ScanBarcode className="h-4 w-4" />}
                  label="Barcode"
                  value={data?.barcode}
                />
                <InfoItem
                  icon={<Archive className="h-4 w-4" />}
                  label="Kategori"
                  value={data?.item?.category}
                />
                <InfoItem
                  icon={<Boxes className="h-4 w-4" />}
                  label="Batch"
                  value={batchNumber}
                />
                <InfoItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Master Location"
                  value={`${locationCode} - ${locationName}`}
                />
              </div>
            </SectionCard>

            <SectionCard title="Waktu & Status">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={<CalendarClock className="h-4 w-4" />}
                  label="Entry Date"
                  value={formatDate(data?.entryDate)}
                />
                <InfoItem
                  icon={<CalendarClock className="h-4 w-4" />}
                  label="Expiry Date"
                  value={formatDate(data?.expiryDate)}
                />
                <InfoItem
                  icon={<CalendarClock className="h-4 w-4" />}
                  label="Last Updated"
                  value={formatDate(data?.lastUpdated)}
                />
                <InfoItem
                  icon={<Archive className="h-4 w-4" />}
                  label="Stock Master"
                  value={
                    data?.item?.stock !== undefined && data?.item?.stock !== null
                      ? `${data.item.stock} ${data.item?.uom || ""}`.trim()
                      : "-"
                  }
                />
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_0.9fr]">
            <SectionCard title="Ringkasan Item">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem label="Nama Item" value={itemName} />
                <InfoItem label="Kode Item" value={itemCode} />
                <InfoItem label="UOM" value={data?.item?.uom} />
                <InfoItem label="Location Status" value={data?.location?.status} />
              </div>
            </SectionCard>

            <SectionCard title="Info Jirigen">
              <div className="grid gap-4">
                <InfoItem
                  label="Nomor Jirigen"
                  value={
                    data?.jirigen?.jirigenNumber !== undefined &&
                    data?.jirigen?.jirigenNumber !== null
                      ? String(data.jirigen.jirigenNumber)
                      : "-"
                  }
                />
                <InfoItem
                  label="Volume"
                  value={
                    data?.jirigen?.volumeLiter
                      ? `${data.jirigen.volumeLiter} L`
                      : "-"
                  }
                />
                <InfoItem
                  label="Produksi"
                  value={formatDate(data?.jirigen?.productionDatetime)}
                />
              </div>
            </SectionCard>
          </div>

          {data?.jirigen?.notes ? (
            <SectionCard title="Catatan">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-[#34363B] dark:bg-[#1F2023] dark:text-slate-300">
                {data.jirigen.notes}
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </ModalDetail>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-[#34363B] dark:bg-[#26282D]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | number | null;
}) {
  const displayValue =
    value !== null && value !== undefined && value !== "" ? value : "-";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-[#34363B] dark:bg-[#1F2023]">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {icon ? <span className="text-slate-400 dark:text-slate-500">{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div className="mt-2 break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
        {displayValue}
      </div>
    </div>
  );
}
