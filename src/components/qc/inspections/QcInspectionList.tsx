"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { qcCoaService, productionPlanService } from "@/services";
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

function toList<T>(response: any): T[] {
  return response?.data?.data ?? response?.data ?? [];
}

function toMeta(response: any) {
  return response?.meta ?? response?.data?.meta ?? null;
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

export default function QcInspectionList({
  dictionary,
}: {
  dictionary: Dictionary;
}) {
  const { setIsLoading } = useLoading();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "";

  const [data, setData] = useState<IQcInspection[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    qcNumber: "",
    batchId: "",
    qcStage: "",
    testResult: "",
    finalStatus: "",
  });

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [batches, setBatches] = useState<IProductionBatch[]>([]);
  const [templates, setTemplates] = useState<IQcTemplate[]>([]);

  const [formState, setFormState] = useState({
    batchId: "",
    qcNumber: "",
    inspectionDate: "",
    inspectionTime: "",
    templateId: "",
    qcStage: "",
    interpretationNotes: "",
    testResult: "PASS",
    qcBarcode: "",
  });

  const pageTitle = useMemo(
    () => dictionary?.title ?? "Kontrol Kualitas",
    [dictionary]
  );

  const fetchInspections = async () => {
    setLoadingList(true);
    try {
      const response = await qcCoaService.getQcInspections({
        page,
        limit,
        qcNumber: filters.qcNumber || undefined,
        batchId: filters.batchId || undefined,
        qcStage: filters.qcStage || undefined,
        testResult: filters.testResult || undefined,
        finalStatus: filters.finalStatus || undefined,
      });
      setData(toList<IQcInspection>(response));
      const meta = toMeta(response);
      if (meta?.totalPages) {
        setTotalPages(meta.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
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
  };

  useEffect(() => {
    fetchInspections();
  }, [page, limit]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchInspections();
    }, 500);
    return () => clearTimeout(delay);
  }, [filters]);

  const loadFormOptions = async () => {
    setFormLoading(true);
    try {
      const [batchResponse, templateResponse] = await Promise.all([
        productionPlanService.getProductionBatches({ limit: 100 }),
        qcCoaService.getQcTemplates({ limit: 100 }),
      ]);
      setBatches(toList<IProductionBatch>(batchResponse));
      setTemplates(toList<IQcTemplate>(templateResponse));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat batch/template",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const openCreate = async () => {
    setModalType("create");
    setCurrentId(null);
    setFormState({
      batchId: "",
      qcNumber: "",
      inspectionDate: "",
      inspectionTime: "",
      templateId: "",
      qcStage: "",
      interpretationNotes: "",
      testResult: "PASS",
      qcBarcode: "",
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
      qcStage: inspection.qcStage ? String(inspection.qcStage) : "",
      interpretationNotes: inspection.interpretationNotes ?? "",
      testResult: inspection.testResult ?? "PASS",
      qcBarcode: inspection.qcBarcode ?? "",
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
        fetchInspections();
        Swal.fire({
          icon: "success",
          title: "QC inspection dihapus",
          toast: true,
          position: "top-right",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (
      !formState.batchId ||
      !formState.templateId ||
      !formState.qcNumber ||
      !formState.inspectionDate ||
      !formState.inspectionTime ||
      !formState.qcStage ||
      !formState.testResult ||
      !formState.qcBarcode
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
      qcStage: Number(formState.qcStage),
      interpretationNotes: formState.interpretationNotes || undefined,
      testResult: formState.testResult,
      qcBarcode: formState.qcBarcode,
    };

    try {
      setIsLoading(true);
      if (modalType === "create") {
        await qcCoaService.createQcInspection(payload);
      } else if (currentId) {
        await qcCoaService.updateQcInspection(String(currentId), payload);
      }
      setModalOpen(false);
      fetchInspections();
      Swal.fire({
        icon: "success",
        title: "QC inspection disimpan",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
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
          <Button onClick={openCreate}>Tambah QC</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-5">
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
              value={filters.qcStage || undefined}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, qcStage: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="QC Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Stage 1</SelectItem>
                <SelectItem value="2">Stage 2</SelectItem>
                <SelectItem value="3">Stage 3</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.testResult || undefined}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, testResult: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Test Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PASS">PASS</SelectItem>
                <SelectItem value="FAIL">FAIL</SelectItem>
                <SelectItem value="CONDITIONAL">CONDITIONAL</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead>Stage</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingList ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : data.length ? (
                  data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.qcNumber}
                      </TableCell>
                      <TableCell>
                        {item.batch?.batchNumber ?? item.batchId}
                      </TableCell>
                      <TableCell>{formatDate(item.inspectionDate)}</TableCell>
                      <TableCell>{item.qcStage}</TableCell>
                      <TableCell>{item.testResult}</TableCell>
                      <TableCell>
                        <Badge className={statusBadge(item.finalStatus)}>
                          {item.finalStatus}
                        </Badge>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
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
        width="w-[90vw] md:w-[70vw]"
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
                <SelectTrigger>
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
                <SelectTrigger>
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
            <div>
              <span className="text-sm font-medium">QC Number</span>
              <Input
                value={formState.qcNumber}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    qcNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <span className="text-sm font-medium">QC Barcode</span>
              <Input
                value={formState.qcBarcode}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    qcBarcode: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <span className="text-sm font-medium">Tanggal Inspeksi</span>
              <Input
                type="date"
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
              <span className="text-sm font-medium">Waktu Inspeksi</span>
              <Input
                type="time"
                value={formState.inspectionTime}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    inspectionTime: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <span className="text-sm font-medium">QC Stage</span>
              <Select
                value={formState.qcStage}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, qcStage: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Stage 1</SelectItem>
                  <SelectItem value="2">Stage 2</SelectItem>
                  <SelectItem value="3">Stage 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-sm font-medium">Test Result</span>
              <Select
                value={formState.testResult}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, testResult: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih hasil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASS">PASS</SelectItem>
                  <SelectItem value="FAIL">FAIL</SelectItem>
                  <SelectItem value="CONDITIONAL">CONDITIONAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium">Interpretation Notes</span>
            <Textarea
              value={formState.interpretationNotes}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  interpretationNotes: e.target.value,
                }))
              }
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
