"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { qcCoaService } from "@/services";
import {
  IQcApprovalStatus,
  IQcInspection,
  IQcInspectionResult,
} from "@/types/qc-coa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/custom/modal";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Dictionary = Awaited<
  ReturnType<typeof getDictionary>
>["quality_control_page_dic"];

type TemplateItem = {
  parameter: string;
  testMethod?: string;
  specification?: string;
};

type ResultRow = TemplateItem & {
  result: string;
  notes?: string;
};

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

function normalizeTemplateParameters(parameters: unknown): TemplateItem[] {
  const toOptionalString = (value: unknown): string | undefined => {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    return undefined;
  };

  if (!parameters) return [];
  if (Array.isArray(parameters)) {
    return parameters
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          parameter:
            toOptionalString(row.parameter) ??
            toOptionalString(row.name) ??
            toOptionalString(row.parameterName) ??
            "",
          testMethod:
            toOptionalString(row.testMethod) ??
            toOptionalString(row.method) ??
            toOptionalString(row.metodeUji),
          specification:
            toOptionalString(row.specification) ??
            toOptionalString(row.spec) ??
            toOptionalString(row.limit) ??
            toOptionalString(row.batas),
        };
      })
      .filter((item) => Boolean(item.parameter));
  }
  if (typeof parameters === "object") {
    return Object.entries(parameters)
      .map(([key, value]) => {
        if (value && typeof value === "object") {
          const row = value as Record<string, unknown>;
          return {
            parameter: toOptionalString(row.parameter) ?? key,
            testMethod:
              toOptionalString(row.testMethod) ??
              toOptionalString(row.method) ??
              toOptionalString(row.metodeUji),
            specification:
              toOptionalString(row.specification) ??
              toOptionalString(row.spec) ??
              toOptionalString(row.limit) ??
              toOptionalString(row.batas),
          };
        }
        return {
          parameter: key,
          specification: typeof value === "string" ? value : undefined,
        };
      })
      .filter((item) => Boolean(item.parameter));
  }
  return [];
}

function statusBadgeClass(value?: string) {
  if (!value) return "bg-slate-100 text-slate-600 border-slate-200";
  if (value === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (value === "rejected") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {children}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </h2>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function QcInspectionDetail({
  inspectionId,
  dictionary,
}: {
  inspectionId: string;
  dictionary: Dictionary;
}) {
  const { setIsLoading } = useLoading();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "";
  const [inspection, setInspection] = useState<IQcInspection | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<IQcApprovalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultRows, setResultRows] = useState<ResultRow[]>([]);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");

  const pageTitle = useMemo(
    () => dictionary?.title ?? "Kontrol Kualitas",
    [dictionary]
  );
  const totalParameters = resultRows.length;
  const filledParameters = useMemo(
    () => resultRows.filter((row) => row.result.trim()).length,
    [resultRows]
  );
  const missingParameters = Math.max(totalParameters - filledParameters, 0);
  const hasNoParameters = totalParameters === 0;
  const allParametersFilled = hasNoParameters || missingParameters === 0;

  const loadInspection = useCallback(async () => {
    setLoading(true);
    try {
      const response = await qcCoaService.getQcInspection(inspectionId);
      const data = response?.data ?? response;
      setInspection(data);

      const templateItems = normalizeTemplateParameters(data?.template?.parameters);
      const existingResults: IQcInspectionResult[] = data?.results ?? [];
      const rows = templateItems.map((item) => {
        const existing = existingResults.find(
          (result) => result.parameter === item.parameter
        );
        return {
          ...item,
          result: existing?.result ?? "",
          notes: existing?.notes ?? "",
        };
      });
      setResultRows(rows);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat QC inspection",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  const loadApprovalStatus = useCallback(async () => {
    try {
      const response = await qcCoaService.getQcInspectionApprovalStatus(inspectionId);
      const data = response?.data ?? response;
      setApprovalStatus(data);
    } catch {
      setApprovalStatus(null);
    }
  }, [inspectionId]);

  useEffect(() => {
    void loadInspection();
    void loadApprovalStatus();
  }, [loadApprovalStatus, loadInspection]);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const handleUpdateResult = (
    index: number,
    field: "result" | "notes",
    value: string
  ) => {
    setResultRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const handleSaveResults = async () => {
    if (resultRows.some((row) => !row.result.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi semua hasil uji",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setIsLoading(true);
      await qcCoaService.replaceQcResults(inspectionId, {
        results: resultRows.map((row) => ({
          parameter: row.parameter,
          result: row.result,
          notes: row.notes || undefined,
        })),
      });
      loadInspection();
      Swal.fire({
        icon: "success",
        title: "Hasil QC diperbarui",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan hasil",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePjtQc = async () => {
    if (!allParametersFilled) {
      Swal.fire({
        icon: "warning",
        title: "Approve hanya bisa jika semua parameter terisi",
        text: `Masih ada ${missingParameters} parameter yang belum diisi.`,
        toast: true,
        position: "top-right",
        timer: 2200,
        showConfirmButton: false,
      });
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "Konfirmasi Approve PJT QC",
      html: `
        <div style="text-align:left">
          <p>Status parameter terisi: <strong>${filledParameters}/${totalParameters}</strong></p>
          <p>${hasNoParameters ? "Template tidak memiliki parameter." : "Semua parameter sudah terisi."} Lanjutkan approve?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);
      await qcCoaService.approvePjtQc(inspectionId);
      await loadInspection();
      await loadApprovalStatus();
      Swal.fire({
        icon: "success",
        title: "Approved oleh PJT QC",
        text: "COA otomatis dibuat setelah QC disetujui.",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal approve PJT QC",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rejectReason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Reason wajib diisi",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setIsLoading(true);
      await qcCoaService.rejectQcInspection(inspectionId, {
        reason: rejectReason,
        notes: rejectNotes || undefined,
      });
      setRejectModalOpen(false);
      setRejectReason("");
      setRejectNotes("");
      await loadInspection();
      await loadApprovalStatus();
      Swal.fire({
        icon: "success",
        title: "QC inspection rejected",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal reject QC inspection",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400">Memuat data QC...</p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-400">Data tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {pageTitle} — QC Detail
        </h1>
        <p className="text-sm text-slate-400">
          {inspection.qcNumber} &bull; Batch {inspection.batch?.batchNumber ?? "-"}
        </p>
      </div>

      {/* Ringkasan QC */}
      <SectionCard title="Ringkasan QC">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-3">
          <InfoItem label="QC Number">{inspection.qcNumber}</InfoItem>
          <InfoItem label="Batch">
            {inspection.batch?.batchNumber ?? inspection.batchId}
          </InfoItem>
          <InfoItem label="Template">
            {inspection.template?.templateName ?? "-"}
          </InfoItem>
          <InfoItem label="Tanggal & Waktu">
            {formatDate(inspection.inspectionDate)}{" "}
            {inspection.inspectionTime ?? ""}
          </InfoItem>
          <InfoItem label="Status">
            <Badge
              className={`border text-xs font-medium ${statusBadgeClass(inspection.finalStatus)}`}
            >
              {inspection.finalStatus ?? "-"}
            </Badge>
          </InfoItem>
          <InfoItem label="Interpretation Notes">
            <span className="text-slate-500 dark:text-slate-400">
              {inspection.interpretationNotes?.trim() || "—"}
            </span>
          </InfoItem>
        </div>
      </SectionCard>

      {/* Hasil QC */}
      <SectionCard
        title="Hasil QC"
        action={
          <Button
            size="sm"
            className="h-8 bg-slate-900 px-4 text-xs font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            onClick={handleSaveResults}
          >
            Simpan Hasil
          </Button>
        }
      >
        {/* overflow-x-auto agar tabel bisa scroll horizontal di layar kecil */}
        <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700">
          <Table className="min-w-[640px] text-sm">
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800">
                <TableHead className="w-[16%] py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Parameter
                </TableHead>
                <TableHead className="w-[16%] py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Metode
                </TableHead>
                <TableHead className="w-[20%] py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Spesifikasi
                </TableHead>
                <TableHead className="w-[24%] py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Hasil
                </TableHead>
                <TableHead className="w-[24%] py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Catatan
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultRows.length ? (
                resultRows.map((row, index) => (
                  <TableRow
                    key={`${row.parameter}-${index}`}
                    className="border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                  >
                    <TableCell className="py-2.5 font-medium text-slate-700 dark:text-slate-200">
                      {row.parameter}
                    </TableCell>
                    <TableCell className="py-2.5 text-slate-500 dark:text-slate-400">
                      {row.testMethod ?? "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-slate-500 dark:text-slate-400">
                      {row.specification ?? "—"}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Input
                        value={row.result}
                        placeholder="Isi hasil..."
                        className="h-8 border-slate-200 bg-white text-sm focus-visible:ring-1 focus-visible:ring-slate-400 dark:border-slate-600 dark:bg-slate-800"
                        onChange={(e) =>
                          handleUpdateResult(index, "result", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Input
                        value={row.notes ?? ""}
                        placeholder="Catatan..."
                        className="h-8 border-slate-200 bg-white text-sm focus-visible:ring-1 focus-visible:ring-slate-400 dark:border-slate-600 dark:bg-slate-800"
                        onChange={(e) =>
                          handleUpdateResult(index, "notes", e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-sm text-slate-400"
                  >
                    Template belum memiliki parameter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Status Approval */}
      <SectionCard
        title="Status Approval"
        action={
          <div className="flex gap-2">
            {inspection.finalStatus !== "rejected" && !inspection.pjtQcApproved && (
              <Button
                size="sm"
                className="h-8 bg-slate-900 px-4 text-xs font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                onClick={handleApprovePjtQc}
                disabled={!allParametersFilled}
              >
                Approve PJT QC
              </Button>
            )}
            {inspection.finalStatus !== "approved" && (
              <Button
                size="sm"
                variant="destructive"
                className="h-8 px-4 text-xs font-medium"
                onClick={() => setRejectModalOpen(true)}
              >
                Reject
              </Button>
            )}
            {inspection.finalStatus === "approved" && (
              <Link href={`/${locale}/dashboard/qc/coa-certificates`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-4 text-xs font-medium"
                >
                  Lihat COA
                </Button>
              </Link>
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Approval boxes */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                PJT QC Approval
              </p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {inspection.pjtQcApproved ? "Approved" : "Pending"}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {inspection.pjtQcApprovedAt
                  ? formatDate(inspection.pjtQcApprovedAt)
                  : "—"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Final Status
              </p>
              <Badge
                className={`border text-xs font-medium ${statusBadgeClass(inspection.finalStatus)}`}
              >
                {inspection.finalStatus ?? "—"}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Status Hasil Parameter
            </p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {filledParameters}/{totalParameters} terisi
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {hasNoParameters
                ? "Template tidak memiliki parameter. Approve tetap diizinkan."
                : allParametersFilled
                  ? "Semua parameter sudah terisi."
                  : `Belum lengkap, kurang ${missingParameters} parameter.`}
            </p>
          </div>

          {/* Next action */}
          {approvalStatus?.nextAction && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              <span className="font-medium">Next action:</span>{" "}
              {approvalStatus.nextAction}
            </div>
          )}

          {/* Rejection reason */}
          {inspection.rejectionReason && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <span className="font-medium">Rejection reason:</span>{" "}
              {inspection.rejectionReason}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject QC Inspection"
        width="w-[90vw] md:w-[40vw]"
        onSubmit={handleReject}
        onCancel={() => setRejectModalOpen(false)}
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Reason <span className="text-rose-500">*</span>
            </label>
            <Input
              value={rejectReason}
              placeholder="Masukkan alasan penolakan..."
              className="border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-slate-400 dark:border-slate-600"
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Notes
            </label>
            <Textarea
              value={rejectNotes}
              placeholder="Catatan tambahan (opsional)..."
              rows={3}
              className="border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-slate-400 dark:border-slate-600"
              onChange={(e) => setRejectNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
