"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { codeGeneratorService, qcCoaService, productionPlanService } from "@/services";
import { IQcInspection, IQcTemplate } from "@/types/qc-coa";
import { IProductionBatch } from "@/types/production";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import QcPagination from "@/components/qc/QcPagination";

type Dictionary = Awaited<
  ReturnType<typeof getDictionary>
>["quality_control_page_dic"];

type TemplateParameter = {
  parameter: string;
};

function toList<T>(response: unknown): T[] {
  const payload = response as {
    data?: {
      data?: T[];
    } | T[];
  };
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

function toMeta(
  response: unknown
): { totalPages?: number } | null {
  const payload = response as {
    meta?: { totalPages?: number };
    data?: { meta?: { totalPages?: number } };
  };
  return payload?.meta ?? payload?.data?.meta ?? null;
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

function statusBadge(value?: string) {
  if (!value) return "bg-slate-100 text-slate-700";
  if (value === "approved") return "bg-emerald-100 text-emerald-700";
  if (value === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function normalizeTemplateParameters(parameters: unknown): TemplateParameter[] {
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
          };
        }
        return { parameter: key };
      })
      .filter((item) => Boolean(item.parameter));
  }
  return [];
}

function getParameterFillStatus(inspection: IQcInspection): {
  label: string;
  isComplete: boolean | null;
} {
  const hasTemplateData =
    inspection.template &&
    Object.prototype.hasOwnProperty.call(inspection.template, "parameters");
  const templateParameters = normalizeTemplateParameters(
    inspection.template?.parameters
  );
  const results = inspection.results;

  if (!hasTemplateData || !Array.isArray(results)) {
    return { label: "-", isComplete: null };
  }

  const total = templateParameters.length;
  if (total === 0) {
    return { label: "0/0", isComplete: true };
  }

  const filled = templateParameters.filter((item) => {
    const row = results.find((result) => result.parameter === item.parameter);
    return Boolean(row?.result?.trim());
  }).length;

  return {
    label: `${filled}/${total}`,
    isComplete: filled === total,
  };
}

export default function QcInspectionList({
  dictionary,
}: {
  dictionary: Dictionary;
}) {
  const { setIsLoading } = useLoading();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "";
  const requestedBatchId = searchParams.get("batchId") ?? "";
  const requestedAction = searchParams.get("action") ?? "";
  const handledPrefillRef = useRef<string | null>(null);

  const [data, setData] = useState<IQcInspection[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    qcNumber: "",
    batchId: "",
    finalStatus: "",
  });

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [generatingQcNumber, setGeneratingQcNumber] = useState(false);

  const [batches, setBatches] = useState<IProductionBatch[]>([]);
  const [templates, setTemplates] = useState<IQcTemplate[]>([]);

  const [formState, setFormState] = useState({
    batchId: "",
    qcNumber: "",
    inspectionDate: "",
    inspectionTime: "",
    templateId: "",
    interpretationNotes: "",
  });

  const pageTitle = useMemo(
    () => dictionary?.title ?? "Kontrol Kualitas",
    [dictionary]
  );

  const clearCreateQueryParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("batchId");
    params.delete("action");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }, [searchParams, pathname, router]);

  const fetchInspections = useCallback(async (query: {
    page: number;
    limit: number;
    qcNumber?: string;
    batchId?: string;
    finalStatus?: string;
  }) => {
    setLoadingList(true);
    try {
      const response = await qcCoaService.getQcInspections(query);
      setData(toList<IQcInspection>(response));
      const meta = toMeta(response);
      if (meta?.totalPages) {
        setTotalPages(meta.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat QC inspections",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void fetchInspections({
      page,
      limit,
      qcNumber: filters.qcNumber || undefined,
      batchId: filters.batchId || undefined,
      finalStatus: filters.finalStatus || undefined,
    });
  }, [page, limit, fetchInspections, filters.qcNumber, filters.batchId, filters.finalStatus]);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      void fetchInspections({
        page: 1,
        limit,
        qcNumber: filters.qcNumber || undefined,
        batchId: filters.batchId || undefined,
        finalStatus: filters.finalStatus || undefined,
      });
    }, 500);
    return () => clearTimeout(delay);
  }, [filters, limit, fetchInspections]);

  useEffect(() => {
    if (requestedAction !== "create" || !requestedBatchId) {
      handledPrefillRef.current = null;
      return;
    }

    const requestKey = `${requestedAction}:${requestedBatchId}`;
    if (handledPrefillRef.current === requestKey) {
      return;
    }

    handledPrefillRef.current = requestKey;

    const openPrefilledCreate = async () => {
      setModalType("create");
      setCurrentId(null);
      setFormState({
        batchId: requestedBatchId,
        qcNumber: "",
        inspectionDate: "",
        inspectionTime: "",
        templateId: "",
        interpretationNotes: "",
      });

      const { batchOptions } = await loadFormOptions();
      const selectedBatch = batchOptions.find(
        (batch) => String(batch.id) === requestedBatchId
      );

      if (!selectedBatch) {
        Swal.fire({
          icon: "warning",
          title: "Batch tidak ditemukan",
          toast: true,
          position: "top-right",
          timer: 2200,
          showConfirmButton: false,
        });
        clearCreateQueryParams();
        return;
      }

      if (
        selectedBatch.productionStatus === "qc_approved" ||
        selectedBatch.hasApprovedQc
      ) {
        Swal.fire({
          icon: "info",
          title: "Batch ini sudah memiliki QC approved",
          toast: true,
          position: "top-right",
          timer: 2200,
          showConfirmButton: false,
        });
        clearCreateQueryParams();
        return;
      }

      setModalOpen(true);
      clearCreateQueryParams();
    };

    openPrefilledCreate();
  }, [requestedAction, requestedBatchId, clearCreateQueryParams]);

  const loadFormOptions = async () => {
    setFormLoading(true);
    try {
      const [batchResponse, templateResponse] = await Promise.all([
        productionPlanService.getProductionBatches({ limit: 100 }),
        qcCoaService.getQcTemplates({ limit: 100 }),
      ]);
      const batchOptions = toList<IProductionBatch>(batchResponse);
      const templateOptions = toList<IQcTemplate>(templateResponse);
      setBatches(batchOptions);
      setTemplates(templateOptions);
      return { batchOptions, templateOptions };
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat batch/template",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
      return { batchOptions: [], templateOptions: [] };
    } finally {
      setFormLoading(false);
    }
  };

  const openCreate = async (prefilledBatchId?: string) => {
    setModalType("create");
    setCurrentId(null);
    setFormState({
      batchId: prefilledBatchId ?? "",
      qcNumber: "",
      inspectionDate: "",
      inspectionTime: "",
      templateId: "",
      interpretationNotes: "",
    });
    await loadFormOptions();
    setModalOpen(true);
  };

  const openEdit = async (inspection: IQcInspection) => {
    setModalType("edit");
    setCurrentId(inspection.id);
    setFormState({
      batchId: inspection.batchId ? String(inspection.batchId) : "",
      qcNumber: inspection.qcNumber ?? "",
      inspectionDate: inspection.inspectionDate?.slice(0, 10) ?? "",
      inspectionTime: inspection.inspectionTime ?? "",
      templateId: inspection.templateId ? String(inspection.templateId) : "",
      interpretationNotes: inspection.interpretationNotes ?? "",
    });
    await loadFormOptions();
    setModalOpen(true);
  };

  const handleDelete = (inspectionId: number) => {
    Swal.fire({
      icon: "warning",
      text: "Hapus QC inspection ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        setIsLoading(true);
        await qcCoaService.deleteQcInspection(String(inspectionId));
        void fetchInspections({
          page,
          limit,
          qcNumber: filters.qcNumber || undefined,
          batchId: filters.batchId || undefined,
          finalStatus: filters.finalStatus || undefined,
        });
        Swal.fire({
          icon: "success",
          title: "QC inspection dihapus",
          toast: true,
          position: "top-right",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus QC inspection",
          toast: true,
          position: "top-right",
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleGenerateQcNumber = async () => {
    try {
      setGeneratingQcNumber(true);
      const response = await codeGeneratorService.preview("qc_inspection");
      if (!response?.value) {
        throw new Error("Invalid generated value");
      }
      setFormState((prev) => ({ ...prev, qcNumber: response.value }));
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal generate QC Number",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setGeneratingQcNumber(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (
      !formState.batchId ||
      !formState.templateId ||
      !formState.qcNumber ||
      !formState.inspectionDate ||
      !formState.inspectionTime
    ) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi semua field wajib",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const payload = {
      batchId: Number(formState.batchId),
      qcNumber: formState.qcNumber,
      inspectionDate: formState.inspectionDate,
      inspectionTime: formState.inspectionTime,
      templateId: Number(formState.templateId),
      interpretationNotes: formState.interpretationNotes || undefined,
    };

    try {
      setIsLoading(true);
      if (modalType === "create") {
        await qcCoaService.createQcInspection(payload);
      } else if (currentId) {
        await qcCoaService.updateQcInspection(String(currentId), payload);
      }
      setModalOpen(false);
      void fetchInspections({
        page,
        limit,
        qcNumber: filters.qcNumber || undefined,
        batchId: filters.batchId || undefined,
        finalStatus: filters.finalStatus || undefined,
      });
      Swal.fire({
        icon: "success",
        title: "QC inspection disimpan",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan QC inspection",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {pageTitle} - QC Inspections
        </h1>
        <p className="text-sm text-slate-500">
          Kelola inspeksi kualitas dan approval.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Inspection List</CardTitle>
            <p className="text-sm text-slate-500">
              Daftar QC inspection yang dibuat.
            </p>
          </div>
          <Button onClick={() => void openCreate()}>Tambah QC</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-3">
            <Input
              placeholder="QC Number"
              value={filters.qcNumber}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, qcNumber: e.target.value }))
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
              value={filters.finalStatus || undefined}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, finalStatus: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Final Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QC Number</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Status Parameter</TableHead>
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
                  data.map((item) => {
                    const parameterStatus = getParameterFillStatus(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.qcNumber}
                        </TableCell>
                        <TableCell>
                          {item.batch?.batchNumber ?? item.batchId}
                        </TableCell>
                        <TableCell>{formatDate(item.inspectionDate)}</TableCell>
                        <TableCell>
                          <Badge className={statusBadge(item.finalStatus)}>
                            {item.finalStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {parameterStatus.isComplete === null ? (
                            <span className="text-sm text-slate-500">-</span>
                          ) : (
                            <Badge
                              className={
                                parameterStatus.isComplete
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }
                            >
                              {parameterStatus.label}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/${locale}/dashboard/qc/inspections/${item.id}`}
                            >
                              <Button variant="outline" size="sm">
                                Detail
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEdit(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Belum ada QC inspection.
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === "create" ? "Tambah QC" : "Ubah QC"}
        width="w-[90vw] md:w-[56vw] xl:w-[48vw]"
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium">Batch</span>
              <Select 
                value={formState.batchId}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, batchId: value }))
                }
                disabled={formLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={String(batch.id)}>
                      {batch.batchNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <span className="text-sm font-medium">Template</span>
              <Select
                value={formState.templateId}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, templateId: value }))
                }
                disabled={formLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={String(template.id)}>
                      {template.templateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <span className="mb-1 block text-xs font-medium">QC Number</span>
              <div className="flex gap-2">
                <Input
                  className="h-8 text-sm"
                  value={formState.qcNumber}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      qcNumber: e.target.value,
                    }))
                  }
                />
                {modalType === "create" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    onClick={handleGenerateQcNumber}
                    disabled={generatingQcNumber}
                  >
                    {generatingQcNumber ? "Generating..." : "Generate"}
                  </Button>
                )}
              </div>
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium">Tanggal</span>
              <Input
                type="date"
                className="h-8 text-sm"
                value={formState.inspectionDate}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    inspectionDate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium">Waktu</span>
              <Input
                type="time"
                className="h-8 text-sm"
                value={formState.inspectionTime}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    inspectionTime: e.target.value,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <span className="mb-1 block text-xs font-medium">
                Interpretation Notes
              </span>
              <Textarea
                className="min-h-20 text-sm"
                value={formState.interpretationNotes}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    interpretationNotes: e.target.value,
                  }))
                }
                rows={2}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
