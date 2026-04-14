"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { qcCoaService } from "@/services";
import {
  IQcApprovalStatus,
  IQcInspection,
  IQcInspectionResult,
} from "@/types/qc-coa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function normalizeTemplateParameters(parameters: any): TemplateItem[] {
  if (!parameters) return [];
  if (Array.isArray(parameters)) {
    return parameters
      .map((item) => ({
        parameter:
          item?.parameter ?? item?.name ?? item?.parameterName ?? "",
        testMethod: item?.testMethod ?? item?.method ?? item?.metodeUji,
        specification:
          item?.specification ?? item?.spec ?? item?.limit ?? item?.batas,
      }))
      .filter((item) => Boolean(item.parameter));
  }
  if (typeof parameters === "object") {
    return Object.entries(parameters)
      .map(([key, value]) => {
        if (value && typeof value === "object") {
          return {
            parameter: (value as any).parameter ?? key,
            testMethod:
              (value as any).testMethod ??
              (value as any).method ??
              (value as any).metodeUji,
            specification:
              (value as any).specification ??
              (value as any).spec ??
              (value as any).limit ??
              (value as any).batas,
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

function statusBadge(value?: string) {
  if (!value) return "bg-slate-100 text-slate-700";
  if (value === "approved") return "bg-emerald-100 text-emerald-700";
  if (value === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

export default function QcInspectionDetail({
  inspectionId,
  dictionary,
}: {
  inspectionId: string;
  dictionary: Dictionary;
}) {
  const { setIsLoading } = useLoading();
  const [inspection, setInspection] = useState<IQcInspection | null>(null);
  const [approvalStatus, setApprovalStatus] =
    useState<IQcApprovalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultRows, setResultRows] = useState<ResultRow[]>([]);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");

  const [direkturModalOpen, setDirekturModalOpen] = useState(false);
  const [direkturSignature, setDirekturSignature] = useState("");
  const [direkturFile, setDirekturFile] = useState<File | null>(null);

  const pageTitle = useMemo(
    () => dictionary?.title ?? "Kontrol Kualitas",
    [dictionary]
  );

  const loadInspection = async () => {
    setLoading(true);
    try {
      const response = await qcCoaService.getQcInspection(inspectionId);
      const data = response?.data ?? response;
      setInspection(data);

      const templateItems = normalizeTemplateParameters(
        data?.template?.parameters
      );
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
    } catch (error) {
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
  };

  const loadApprovalStatus = async () => {
    try {
      const response = await qcCoaService.getQcInspectionApprovalStatus(
        inspectionId
      );
      const data = response?.data ?? response;
      setApprovalStatus(data);
    } catch (error) {
      setApprovalStatus(null);
    }
  };

  useEffect(() => {
    loadInspection();
    loadApprovalStatus();
  }, [inspectionId]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleUpdateResult = (
    index: number,
    field: "result" | "notes",
    value: string
  ) => {
    setResultRows((prev) =>
      prev.map((row, idx) =>
        idx === index ? { ...row, [field]: value } : row
      )
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
    } catch (error) {
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
    const result = await Swal.fire({
      title: "Digital Signature (optional)",
      input: "text",
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);
      await qcCoaService.approvePjtQc(inspectionId, {
        digitalSignature: result.value || undefined,
      });
      await loadInspection();
      await loadApprovalStatus();
      Swal.fire({
        icon: "success",
        title: "Approved oleh PJT QC",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
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

  const handleApproveStaff = async () => {
    try {
      setIsLoading(true);
      await qcCoaService.approveStaffProduksi(inspectionId);
      await loadInspection();
      await loadApprovalStatus();
      Swal.fire({
        icon: "success",
        title: "Approved oleh Staff Produksi",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal approve Staff Produksi",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDirektur = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!direkturFile) {
      Swal.fire({
        icon: "warning",
        title: "Stamp file wajib diunggah",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setIsLoading(true);
      await qcCoaService.approveDirektur(
        inspectionId,
        direkturFile,
        direkturSignature || undefined
      );
      setDirekturModalOpen(false);
      setDirekturFile(null);
      setDirekturSignature("");
      await loadInspection();
      await loadApprovalStatus();
      Swal.fire({
        icon: "success",
        title: "Approved oleh Direktur",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal approve Direktur",
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
    } catch (error) {
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
    return <p className="text-sm text-slate-500">Memuat data QC...</p>;
  }

  if (!inspection) {
    return <p className="text-sm text-slate-500">Data tidak ditemukan.</p>;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {pageTitle} - QC Detail
        </h1>
        <p className="text-sm text-slate-500">
          {inspection.qcNumber} • Batch {inspection.batch?.batchNumber ?? "-"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan QC</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">QC Number</p>
            <p className="font-medium">{inspection.qcNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">QC Stage</p>
            <p className="font-medium">{inspection.qcStage}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Tanggal Inspeksi</p>
            <p className="font-medium">
              {formatDate(inspection.inspectionDate)} {inspection.inspectionTime}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Status</p>
            <Badge className={statusBadge(inspection.finalStatus)}>
              {inspection.finalStatus}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-slate-500">Test Result</p>
            <p className="font-medium">{inspection.testResult}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Template</p>
            <p className="font-medium">
              {inspection.template?.templateName ?? "-"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Hasil QC</CardTitle>
          <Button onClick={handleSaveResults}>Simpan Hasil</Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Spesifikasi</TableHead>
                  <TableHead>Hasil</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultRows.length ? (
                  resultRows.map((row, index) => (
                    <TableRow key={`${row.parameter}-${index}`}>
                      <TableCell>{row.parameter}</TableCell>
                      <TableCell>{row.testMethod ?? "-"}</TableCell>
                      <TableCell>{row.specification ?? "-"}</TableCell>
                      <TableCell>
                        <Input
                          value={row.result}
                          onChange={(e) =>
                            handleUpdateResult(index, "result", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.notes ?? ""}
                          onChange={(e) =>
                            handleUpdateResult(index, "notes", e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Template belum memiliki parameter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Status Approval</CardTitle>
          <div className="flex flex-wrap gap-2">
            {inspection.finalStatus !== "rejected" && !inspection.pjtQcApproved && (
              <Button onClick={handleApprovePjtQc}>Approve PJT QC</Button>
            )}
            {inspection.finalStatus !== "rejected" &&
              inspection.pjtQcApproved &&
              !inspection.staffProduksiApproved && (
              <Button onClick={handleApproveStaff}>
                Approve Staff Produksi
              </Button>
            )}
            {inspection.finalStatus !== "rejected" &&
              inspection.staffProduksiApproved &&
              !inspection.direkturApproved && (
                <Button onClick={() => setDirekturModalOpen(true)}>
                  Approve Direktur
                </Button>
              )}
            {inspection.finalStatus !== "approved" && (
              <Button variant="destructive" onClick={() => setRejectModalOpen(true)}>
                Reject
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-slate-500">Stage 1 - PJT QC</p>
              <p className="font-medium">
                {inspection.pjtQcApproved ? "Approved" : "Pending"}
              </p>
              <p className="text-xs text-slate-500">
                {inspection.pjtQcApprovedAt
                  ? formatDate(inspection.pjtQcApprovedAt)
                  : "-"}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-slate-500">Stage 2 - Staff Produksi</p>
              <p className="font-medium">
                {inspection.staffProduksiApproved ? "Approved" : "Pending"}
              </p>
              <p className="text-xs text-slate-500">
                {inspection.staffProduksiApprovedAt
                  ? formatDate(inspection.staffProduksiApprovedAt)
                  : "-"}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-slate-500">Stage 3 - Direktur</p>
              <p className="font-medium">
                {inspection.direkturApproved ? "Approved" : "Pending"}
              </p>
              <p className="text-xs text-slate-500">
                {inspection.direkturApprovedAt
                  ? formatDate(inspection.direkturApprovedAt)
                  : "-"}
              </p>
            </div>
          </div>

          {approvalStatus?.nextAction ? (
            <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">
              Next action: {approvalStatus.nextAction}
            </div>
          ) : null}

          {inspection.rejectionReason ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              Rejection reason: {inspection.rejectionReason}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject QC Inspection"
        width="w-[90vw] md:w-[40vw]"
        onSubmit={handleReject}
        onCancel={() => setRejectModalOpen(false)}
      >
        <div className="flex flex-col gap-4 p-5">
          <div>
            <span className="text-sm font-medium">Reason</span>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div>
            <span className="text-sm font-medium">Notes</span>
            <Textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={direkturModalOpen}
        onClose={() => setDirekturModalOpen(false)}
        title="Approve Direktur"
        width="w-[90vw] md:w-[40vw]"
        onSubmit={handleApproveDirektur}
        onCancel={() => setDirekturModalOpen(false)}
      >
        <div className="flex flex-col gap-4 p-5">
          <div>
            <span className="text-sm font-medium">Digital Signature (optional)</span>
            <Input
              value={direkturSignature}
              onChange={(e) => setDirekturSignature(e.target.value)}
              placeholder="base64 signature"
            />
          </div>
          <div>
            <span className="text-sm font-medium">Stamp File</span>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                setDirekturFile(e.target.files ? e.target.files[0] : null)
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
