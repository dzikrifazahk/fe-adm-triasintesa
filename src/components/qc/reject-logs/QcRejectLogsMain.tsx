"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { qcCoaService } from "@/services";
import { IQcRejectLog } from "@/types/qc-coa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export default function QcRejectLogsMain({
  dictionary,
}: {
  dictionary: Dictionary;
}) {
  const { setIsLoading } = useLoading();
  const [data, setData] = useState<IQcRejectLog[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    batchId: "",
    qcInspectionId: "",
    rejectStage: "",
  });

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [formState, setFormState] = useState({
    batchId: "",
    qcInspectionId: "",
    rejectDate: "",
    rejectStage: "",
    reason: "",
    quantityRejected: "",
    notes: "",
  });

  const pageTitle = useMemo(
    () => dictionary?.title ?? "Kontrol Kualitas",
    [dictionary]
  );

  const fetchRejectLogs = async () => {
    setLoadingList(true);
    try {
      const response = await qcCoaService.getQcRejectLogs({
        page,
        limit,
        batchId: filters.batchId || undefined,
        qcInspectionId: filters.qcInspectionId || undefined,
        rejectStage: filters.rejectStage || undefined,
      });
      setData(toList<IQcRejectLog>(response));
      const meta = toMeta(response);
      if (meta?.totalPages) {
        setTotalPages(meta.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat reject logs",
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
    fetchRejectLogs();
  }, [page, limit]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchRejectLogs();
    }, 500);
    return () => clearTimeout(delay);
  }, [filters]);

  const openCreate = () => {
    setModalType("create");
    setCurrentId(null);
    setFormState({
      batchId: "",
      qcInspectionId: "",
      rejectDate: "",
      rejectStage: "",
      reason: "",
      quantityRejected: "",
      notes: "",
    });
    setModalOpen(true);
  };

  const openEdit = (log: IQcRejectLog) => {
    setModalType("edit");
    setCurrentId(log.id);
    setFormState({
      batchId: log.batchId ? String(log.batchId) : "",
      qcInspectionId: log.qcInspectionId ? String(log.qcInspectionId) : "",
      rejectDate: log.rejectDate?.slice(0, 10) ?? "",
      rejectStage: log.rejectStage ?? "",
      reason: log.reason ?? "",
      quantityRejected: log.quantityRejected
        ? String(log.quantityRejected)
        : "",
      notes: log.notes ?? "",
    });
    setModalOpen(true);
  };

  const handleDelete = (logId: number) => {
    Swal.fire({
      icon: "warning",
      text: "Hapus log ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        setIsLoading(true);
        await qcCoaService.deleteQcRejectLog(String(logId));
        fetchRejectLogs();
        Swal.fire({
          icon: "success",
          title: "Log dihapus",
          toast: true,
          position: "top-right",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus log",
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
      !formState.qcInspectionId ||
      !formState.rejectDate ||
      !formState.rejectStage ||
      !formState.reason ||
      !formState.quantityRejected
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
      qcInspectionId: Number(formState.qcInspectionId),
      rejectDate: formState.rejectDate,
      rejectStage: formState.rejectStage,
      reason: formState.reason,
      quantityRejected: Number(formState.quantityRejected),
      notes: formState.notes || undefined,
    };

    try {
      setIsLoading(true);
      if (modalType === "create") {
        await qcCoaService.createQcRejectLog(payload);
      } else if (currentId) {
        await qcCoaService.updateQcRejectLog(String(currentId), payload);
      }
      setModalOpen(false);
      fetchRejectLogs();
      Swal.fire({
        icon: "success",
        title: "Reject log disimpan",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan log",
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
          {pageTitle} - QC Reject Logs
        </h1>
        <p className="text-sm text-slate-500">Catatan reject QC inspection.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Reject Logs</CardTitle>
            <p className="text-sm text-slate-500">
              Daftar log reject QC.
            </p>
          </div>
          <Button onClick={openCreate}>Tambah Log</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-3">
            <Input
              placeholder="Batch ID"
              value={filters.batchId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, batchId: e.target.value }))
              }
            />
            <Input
              placeholder="QC Inspection ID"
              value={filters.qcInspectionId}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  qcInspectionId: e.target.value,
                }))
              }
            />
            <Select
              value={filters.rejectStage || undefined}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, rejectStage: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Reject Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bahan_baku">Bahan Baku</SelectItem>
                <SelectItem value="proses_1">Proses 1</SelectItem>
                <SelectItem value="proses_2">Proses 2</SelectItem>
                <SelectItem value="hasil_akhir">Hasil Akhir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Inspection</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Qty</TableHead>
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
                      <TableCell>{formatDate(item.rejectDate)}</TableCell>
                      <TableCell>
                        {item.batch?.batchNumber ?? item.batchId}
                      </TableCell>
                      <TableCell>{item.qcInspectionId}</TableCell>
                      <TableCell>{item.rejectStage}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell>{item.quantityRejected}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
                      Belum ada log.
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
        title={modalType === "create" ? "Tambah Reject Log" : "Ubah Reject Log"}
        width="w-[90vw] md:w-[50vw]"
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium">Batch ID</span>
              <Input
                value={formState.batchId}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    batchId: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <span className="text-sm font-medium">QC Inspection ID</span>
              <Input
                value={formState.qcInspectionId}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    qcInspectionId: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <span className="text-sm font-medium">Reject Date</span>
              <Input
                type="date"
                value={formState.rejectDate}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    rejectDate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <span className="text-sm font-medium">Reject Stage</span>
              <Select
                value={formState.rejectStage}
                onValueChange={(value) =>
                  setFormState((prev) => ({
                    ...prev,
                    rejectStage: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bahan_baku">Bahan Baku</SelectItem>
                  <SelectItem value="proses_1">Proses 1</SelectItem>
                  <SelectItem value="proses_2">Proses 2</SelectItem>
                  <SelectItem value="hasil_akhir">Hasil Akhir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-sm font-medium">Quantity Rejected</span>
              <Input
                type="number"
                value={formState.quantityRejected}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    quantityRejected: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <span className="text-sm font-medium">Reason</span>
              <Input
                value={formState.reason}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div>
            <span className="text-sm font-medium">Notes</span>
            <Textarea
              value={formState.notes}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
