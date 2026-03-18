"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/custom/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import clsx from "clsx";
import { IPurchase } from "@/types/purchase";
import PurchaseStatusBadge from "./purchaseStatusBadge";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import { Card, CardContent } from "../ui/card";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "../custom/comboboxProperCustom";
import { taxService } from "@/services";
import { ITax } from "@/types/tax";
import { Circle } from "lucide-react";
import { Input } from "../ui/input";

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

function safeFormat(dateLike?: string | Date | null, pattern = "dd/MM/yyyy") {
  if (!dateLike) return "-";
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  if (Number.isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  if (pattern === "dd/MM/yyyy") return `${dd}/${mm}/${yyyy}`;
  return d.toLocaleDateString();
}

type TaxComboItem = ComboboxItem<ITax> & { meta?: ITax };

type Props = {
  isOpen: boolean;
  title?: string;
  data: IPurchase | null;
  loading?: boolean;
  onClose: () => void;
  onAccept?: (id: string, payload?: any) => Promise<void> | void;
  onReject?: (id: string, reason: string) => Promise<void> | void;
  onPayment?: (id: string, payload?: any) => Promise<void> | void;
  mode: "details" | "reject" | "verify" | "payment";
};

export default function DetailPurchaseModal({
  isOpen,
  title = "Verifikasi Purchase",
  data,
  onClose,
  onAccept,
  onReject,
  loading = false,
  onPayment,
  mode,
}: Props) {
  const [rejectReason, setRejectReason] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [paymentFiles, setPaymentFiles] = useState<File[]>([]);
  const [paymentFileError, setPaymentFileError] = useState<string | null>(null);

  const exceedsBudget =
    data?.status_exceeding_budget_project_purchase === "exceeding the budget";

  const notExceedsBudget =
    data?.status_exceeding_budget_project_purchase ===
    "not exceeding the budget";
  const budgetTotal = Number(data?.budget?.total_nominal_budget || 0);
  const subTotal = Number(data?.sub_total_purchase || 0);
  const pphExisting = Number(data?.pph?.amount || 0);
  const totalExisting = Number(data?.total || 0);

  const attachmentsPembelian =
    data?.file_bukti_pembelian_product_purchases ?? [];
  const attachmentsPembayaran =
    data?.file_bukti_pembayaran_product_purchases ?? [];

  const [taxs, setTaxs] = useState<TaxComboItem[]>([]);
  const [selectedTax, setSelectedTax] = useState<TaxComboItem | null>(null);
  const [isPopoverTaxOpen, setPopoverTaxOpen] = useState(false);

  const clearInput = () => {
    setSelectedTax(null);
    setRejectReason("");
    setPopoverTaxOpen(false);
    setPaymentDate("");
    setPaymentFiles([]);
    setPaymentFileError(null);
  };

  const headerRight = useMemo(() => {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        {data?.doc_type ? (
          <Badge
            variant="outline"
            className={clsx(
              "border-dashed",
              data.doc_type.toUpperCase() === "FLASH CASH"
                ? "border-[#FDDF8A] text-[#F58101] bg-[#FFEFC7]"
                : "border-muted-foreground/30"
            )}
          >
            {data.doc_type}
          </Badge>
        ) : null}

        <PurchaseStatusBadge
          status={data?.status_purchase?.name ?? "-"}
          locale="en"
          className="min-w-[104px]"
        />
      </div>
    );
  }, [data]);

  const askApprove = async () => {
    const payload = selectedTax?.meta
      ? { pph_id: selectedTax.meta.id }
      : undefined;

    if (onAccept) await onAccept(data?.doc_no || "", payload);
  };

  const askReject = async () => {
    if (onReject) await onReject(data?.doc_no || "", rejectReason);
    clearInput();
  };

  const askPayment = async () => {
    if (!paymentDate) {
      Swal.fire({
        icon: "warning",
        title: "Tanggal pembayaran wajib diisi",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    if (paymentFiles.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Minimal 1 bukti pembayaran",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    if (onPayment) {
      await onPayment(data?.doc_no || "", {
        tanggal_pembayaran_purchase: paymentDate,
        file_pembayaran: paymentFiles,
      });
    }
  };

  const handleChangePaymentFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const MAX_FILES = 3;
    const MAX_BYTES = 3145728;

    if (selected.length > MAX_FILES) {
      setPaymentFileError(`Maksimal ${MAX_FILES} file.`);
      setPaymentFiles([]);
      e.currentTarget.value = "";
      return;
    }

    const tooBig = selected.filter((f) => f.size > MAX_BYTES);
    if (tooBig.length) {
      setPaymentFileError(
        `Ukuran per file maksimal 3 MB. Terlalu besar: ${tooBig
          .map((f) => f.name)
          .join(", ")}`
      );
      setPaymentFiles([]);
      e.currentTarget.value = "";
      return;
    }

    setPaymentFileError(null);
    setPaymentFiles(selected);
  };

  const getAllTax = async (search?: string) => {
    const filter = search ? { search } : {};
    const { data: rows } = await taxService.getTaxs(filter);
    setTaxs(
      rows.map((e: ITax) => ({
        value: e.id,
        label: e.name,
        icon: Circle,
        meta: e,
      }))
    );
  };

  useEffect(() => {
    if (mode === "verify") {
      setRejectReason("");
      getAllTax();
    } else if (mode === "payment") {
      setRejectReason("");
      setSelectedTax(null);
      setPopoverTaxOpen(false);
      setPaymentDate("");
      setPaymentFiles([]);
      setPaymentFileError(null);
    }
  }, [mode]);

  const simulatedPphPercent = useMemo(() => {
    const raw =
      (selectedTax?.meta as any)?.rate ??
      (selectedTax?.meta as any)?.percent ??
      0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [selectedTax]);

  const simulatedPphAmount = useMemo(() => {
    return Math.max(0, subTotal * (simulatedPphPercent / 100));
  }, [subTotal, simulatedPphPercent]);

  const simulatedGrandTotal = useMemo(() => {
    // sesuai permintaan: subtotal - selectedTax.percent
    return Math.max(0, subTotal - simulatedPphAmount);
  }, [subTotal, simulatedPphAmount]);

  useEffect(() => {
    if (isOpen) {
      clearInput();
    }
  }, [isOpen]);
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setRejectReason("");
        onClose();
      }}
      title={title}
      width="w-[96vw] md:w-[88vw] lg:w-[72vw]"
      showConfirmButton={false}
    >
      {!data ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          Memuat data…
        </div>
      ) : (
        <>
          <div className="p-4 md:p-6 space-y-6">
            {/* Header dalam body (karena title hanya string di modal) */}
            <Card>
              <CardContent className="">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex flex-col">
                    <div className="text-base font-semibold">{title}</div>
                    <div className="text-xs text-muted-foreground">
                      {data.doc_no ?? "-"}
                    </div>
                  </div>
                  {headerRight}
                </div>

                {/* Summary badges */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {exceedsBudget && (
                    <Badge variant="destructive">Melebihi Budget</Badge>
                  )}
                  {notExceedsBudget && (
                    <Badge variant="secondary">Tidak Melebihi Budget</Badge>
                  )}
                  {data?.purchase_type?.name && (
                    <Badge variant="secondary">{data.purchase_type.name}</Badge>
                  )}
                  {data?.purchase_event_type?.name && (
                    <Badge variant="secondary">
                      {data.purchase_event_type.name}
                    </Badge>
                  )}
                  {data?.tab_purchase?.name && (
                    <Badge variant="outline">{data.tab_purchase.name}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="detail">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="detail" className="cursor-pointer">
                  Informasi Detail
                </TabsTrigger>
                <TabsTrigger value="products" className="cursor-pointer">
                  Products
                </TabsTrigger>
                <TabsTrigger value="logs" className="cursor-pointer">
                  Logs / History
                </TabsTrigger>
              </TabsList>

              {/* ========= DETAIL ========= */}
              <TabsContent value="detail" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <KeyValue label="No. Dokumen" value={data.doc_no} />
                  <KeyValue label="Tipe Dokumen" value={data.doc_type} />
                  <KeyValue label="PO Number" value={data.po_no} />
                  <KeyValue label="Reference" value={data.reff} />

                  <KeyValue
                    label="Tab Purchase"
                    value={data.tab_purchase?.name}
                  />
                  <KeyValue
                    label="Status"
                    value={
                      <PurchaseStatusBadge
                        status={data.status_purchase?.name}
                        locale="en"
                      />
                    }
                  />
                  <KeyValue
                    label="Tanggal Buat"
                    value={safeFormat(data.created_at)}
                  />
                  <KeyValue
                    label="Tanggal Update"
                    value={safeFormat(data.updated_at)}
                  />
                  <KeyValue
                    label="Tanggal Mulai"
                    value={safeFormat(data.date_start_create_purchase)}
                  />
                  <KeyValue
                    label="Tanggal Akhir"
                    value={safeFormat(data.due_date_end_purchase)}
                  />
                  <KeyValue label="Dibuat Oleh" value={data.created_by?.name} />
                  <KeyValue
                    label="Purchase Type"
                    value={data.purchase_type?.name}
                  />
                  <KeyValue
                    label="Event Type"
                    value={data.purchase_event_type?.name}
                  />
                  <KeyValue label="Project" value={data.project?.name} />
                </div>

                {/* Description / Remarks */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">
                      Deskripsi
                    </Label>
                    <div className="rounded-md border p-3 text-sm min-h-[64px]">
                      {data.description || "-"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">
                      Catatan
                    </Label>
                    <div className="rounded-md border p-3 text-sm min-h-[64px]">
                      {data.remarks || "-"}
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Bukti Pembelian
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {attachmentsPembelian.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          Tidak ada file
                        </span>
                      ) : (
                        attachmentsPembelian.map((f: any, idx: number) => (
                          <a
                            key={`beli-${idx}`}
                            href={f.link}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs hover:bg-accent cursor-pointer"
                          >
                            📄 {f.name ?? `bukti-${idx + 1}`}
                          </a>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Bukti Pembayaran
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {attachmentsPembayaran.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          Tidak ada file
                        </span>
                      ) : (
                        attachmentsPembayaran.map((f: any, idx: number) => (
                          <a
                            key={`bayar-${idx}`}
                            href={f.url}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs hover:bg-accent"
                          >
                            📄 {f.name ?? `pembayaran-${idx + 1}`}
                          </a>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Budget vs Purchase */}
                <div className="mt-6 rounded-xl border">
                  <div className="flex items-center justify-between border-b p-4">
                    <div>
                      <div className="text-sm font-semibold">
                        Ringkasan Anggaran
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Bandingkan total purchase terhadap total budget project.
                      </div>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <KeyValue
                      label="Total Budget Purchase"
                      value={formatCurrencyIDR(budgetTotal)}
                    />
                    <KeyValue
                      label="Sub Total Purchase"
                      value={formatCurrencyIDR(subTotal)}
                    />
                    <KeyValue
                      label={`PPh`}
                      value={formatCurrencyIDR(pphExisting)}
                    />
                    <KeyValue
                      label="Grand Total"
                      value={formatCurrencyIDR(totalExisting)}
                    />
                  </div>
                  {exceedsBudget && (
                    <div className="px-4 pb-4">
                      <div className="rounded-lg border border-red-200 bg-red-50 text-red-600 p-3 text-xs">
                        Pengeluaran ini melebihi total anggaran project.
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ========= PRODUCTS ========= */}
              <TabsContent value="products" className="mt-4">
                <div className="rounded-xl border overflow-hidden">
                  <div className="flex items-center justify-between border-b p-4">
                    <div>
                      <div className="text-sm font-semibold">Daftar Produk</div>
                      <div className="text-xs text-muted-foreground">
                        Vendor, nama produk, qty, harga, dan PPN ditampilkan di
                        sini.
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[160px]">
                            Vendor
                          </TableHead>
                          <TableHead className="min-w-[180px]">
                            Nama Produk
                          </TableHead>
                          <TableHead className="text-right min-w-[120px]">
                            Qty
                          </TableHead>
                          <TableHead className="text-right min-w-[120px]">
                            Unit
                          </TableHead>
                          <TableHead className="text-right min-w-[160px]">
                            Harga
                          </TableHead>
                          <TableHead className="text-right min-w-[120px]">
                            PPN
                          </TableHead>
                          <TableHead className="text-right min-w-[160px]">
                            Subtotal
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data.products ?? []).length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center text-sm text-muted-foreground"
                            >
                              Tidak ada produk
                            </TableCell>
                          </TableRow>
                        ) : (
                          data.products.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell>{p.vendor?.name ?? "-"}</TableCell>
                              <TableCell>{p?.product_name ?? "-"}</TableCell>
                              <TableCell className="text-right">
                                {p?.stok ?? "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                {p?.unit ?? "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrencyIDR(p.harga)}
                              </TableCell>
                              <TableCell className="text-right">
                                {p.ppn?.rate
                                  ? `${formatCurrencyIDR(
                                      p.ppn.amount
                                    )} (${p.ppn.rate}%)`
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrencyIDR(p.subtotal_harga_product)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Footer total */}
                  <div className="flex items-center justify-end gap-6 border-t p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Sub Total:</span>
                      <span className="font-semibold">
                        {formatCurrencyIDR(subTotal)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">PPh:</span>
                      <span className="font-semibold">
                        {formatCurrencyIDR(pphExisting)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        Grand Total:
                      </span>
                      <span className="font-semibold">
                        {formatCurrencyIDR(totalExisting)}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ========= LOGS / HISTORY ========= */}
              <TabsContent value="logs" className="mt-4">
                <div className="rounded-xl border">
                  <div className="flex items-center justify-between border-b p-4">
                    <div>
                      <div className="text-sm font-semibold">
                        Logs / History
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Aktivitas dan perubahan status purchase.
                      </div>
                    </div>
                  </div>

                  {!data?.log_purchase ? (
                    <div className="p-6 text-sm text-muted-foreground">
                      Belum ada riwayat.
                    </div>
                  ) : (
                    (() => {
                      const log = Array.isArray(data.log_purchase)
                        ? data.log_purchase[0]
                        : data.log_purchase;

                      const rejected = !!log?.is_rejected;
                      const statusTone = rejected
                        ? "bg-[#FEE4E2] text-[#B42318] border-[#FECDCA]"
                        : "bg-[#D1FADF] text-[#067647] border-[#A6F0C6]";

                      return (
                        <div className="p-4 space-y-3">
                          <div className="rounded-lg border p-3 text-sm bg-card">
                            {/* header: judul + waktu */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-medium">
                                {log?.name ?? "(log)"}
                              </div>
                              <div className="text-xs text-muted-foreground shrink-0">
                                {safeFormat(log?.created_at)}
                                {log?.created_by ? ` • ${log.created_by}` : ""}
                              </div>
                            </div>

                            {/* pills info */}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {log?.tab?.name && (
                                <span className="inline-flex items-center rounded-full border bg-white px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                  Tab: {log.tab.name}
                                </span>
                              )}
                              {log?.status?.name && (
                                <span
                                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone}`}
                                >
                                  Status: {log.status.name}
                                </span>
                              )}
                              {rejected && (
                                <span className="inline-flex items-center rounded-full border border-[#FECACA] bg-[#FEE2E2] px-2.5 py-1 text-xs font-medium text-[#991B1B]">
                                  Ditolak
                                </span>
                              )}
                            </div>

                            {/* alasan reject */}
                            {rejected && log?.note_reject && (
                              <div className="mt-3 rounded-md border border-red-200 bg-white p-3 text-xs text-red-700">
                                <div className="font-extrabold mb-1">
                                  Alasan Penolakan
                                </div>
                                <div className="whitespace-pre-wrap">
                                  - {log.note_reject}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          {/* ===== Footer kustom (sticky dalam body) ===== */}
          <div className="border-t border-[#E4E4E4] bg-[#F9F9F9] p-4 md:p-5 rounded-lg sticky bottom-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {mode === "reject" && (
              <>
                <div className="flex-1 w-full">
                  <Label className="text-xs">
                    Alasan Penolakan (opsional, wajib jika klik Tolak)
                  </Label>
                  <Textarea
                    className="mt-1 resize-none"
                    placeholder="Tulis alasan penolakan di sini..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="w-full md:w-auto flex md:justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={loading}
                    onClick={askReject}
                    className="cursor-pointer w-full md:w-auto"
                  >
                    Tolak
                  </Button>
                </div>
              </>
            )}

            {mode === "verify" && (
              <div className="w-full md:w-auto flex flex-col md:flex-row md:items-center md:justify-end gap-3">
                {/* Label + combobox */}
                <div className="w-full md:w-auto flex flex-col gap-1">
                  <Label className="text-xs">
                    Apakah ada pajak? (opsional)
                  </Label>
                  <div className="w-full md:w-72">
                    <ComboboxPopoverCustom
                      data={taxs}
                      selectedItem={selectedTax}
                      onSelect={setSelectedTax}
                      isOpen={isPopoverTaxOpen}
                      onOpenChange={setPopoverTaxOpen}
                      placeholder="Cari Pajak"
                      onInputChange={(q) => getAllTax(q)}
                      height="h-12 sm:h-10"
                    />
                  </div>
                </div>

                {/* Preview perhitungan PPh yang dipilih */}
                <div className="w-full md:w-auto">
                  <div className="rounded-lg border bg-white p-3 text-xs md:text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {formatCurrencyIDR(subTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        PPh ({simulatedPphPercent}%)
                      </span>
                      <span className="font-medium">
                        - {formatCurrencyIDR(simulatedPphAmount)}
                      </span>
                    </div>
                    <div className="mt-1 border-t pt-1 flex justify-between gap-4">
                      <span className="font-medium">Total</span>
                      <span className="font-semibold">
                        {formatCurrencyIDR(simulatedGrandTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tombol approve */}
                <div className="w-full md:w-auto flex md:justify-end">
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={askApprove}
                    className="cursor-pointer bg-iprimary-blue hover:bg-iprimary-blue-secondary w-full md:w-auto"
                  >
                    Setujui
                  </Button>
                </div>
              </div>
            )}

            {mode === "payment" && (
              <div className="w-full flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                {/* Tanggal pembayaran */}
                <div className="w-full md:w-1/3 flex flex-col gap-1">
                  <Label className="text-xs">Tanggal Pembayaran</Label>
                  <Input
                    type="date"
                    className="h-10"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>

                {/* Upload multiple file bukti pembayaran */}
                <div className="w-full md:flex-1 flex flex-col gap-1">
                  <Label className="text-xs">
                    Bukti Pembayaran (boleh lebih dari satu file)
                  </Label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleChangePaymentFiles}
                    className="block w-full text-xs text-muted-foreground 
                   file:mr-3 file:py-2 file:px-3 
                   file:rounded-md file:border 
                   file:text-xs file:font-medium 
                   file:bg-white file:text-foreground 
                   hover:file:bg-accent"
                  />
                  {paymentFileError && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {paymentFileError}
                    </p>
                  )}

                  {paymentFiles.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                      {paymentFiles.map((f, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full border px-2 py-0.5"
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tombol submit pembayaran */}
                <div className="w-full md:w-auto flex md:justify-end">
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={askPayment}
                    className="cursor-pointer bg-iprimary-blue hover:bg-iprimary-blue-secondary w-full md:w-auto"
                  >
                    Simpan Pembayaran
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
