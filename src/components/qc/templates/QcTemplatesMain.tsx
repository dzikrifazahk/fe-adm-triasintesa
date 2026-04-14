"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { qcCoaService } from "@/services";
import { IQcTemplate } from "@/types/qc-coa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

type ParameterItem = {
  parameter: string;
  testMethod?: string;
  specification?: string;
};

function toList<T>(response: any): T[] {
  return response?.data?.data ?? response?.data ?? [];
}

function toMeta(response: any) {
  return response?.meta ?? response?.data?.meta ?? null;
}

function normalizeTemplateParameters(parameters: any): ParameterItem[] {
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

export default function QcTemplatesMain({
  dictionary,
}: {
  dictionary: Dictionary;
}) {
  const { setIsLoading } = useLoading();
  const [data, setData] = useState<IQcTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingList, setLoadingList] = useState(false);

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [parameters, setParameters] = useState<ParameterItem[]>([]);

  const pageTitle = useMemo(
    () => dictionary?.title ?? "Kontrol Kualitas",
    [dictionary]
  );

  const fetchTemplates = async () => {
    setLoadingList(true);
    try {
      const response = await qcCoaService.getQcTemplates({
        templateName: search || undefined,
        page,
        limit,
      });
      setData(toList<IQcTemplate>(response));
      const meta = toMeta(response);
      if (meta?.totalPages) {
        setTotalPages(meta.totalPages);
      } else if (meta?.total_items && meta?.per_page) {
        setTotalPages(Math.ceil(meta.total_items / meta.per_page));
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat template",
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
    fetchTemplates();
  }, [page, limit]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchTemplates();
    }, 500);
    return () => clearTimeout(delay);
  }, [search]);

  const openCreate = () => {
    setModalType("create");
    setCurrentId(null);
    setTemplateName("");
    setParameters([{ parameter: "", testMethod: "", specification: "" }]);
    setModalOpen(true);
  };

  const openEdit = async (template: IQcTemplate) => {
    setModalType("edit");
    setCurrentId(template.id);
    setTemplateName(template.templateName ?? "");
    setParameters(
      normalizeTemplateParameters(template.parameters) ?? [
        { parameter: "", testMethod: "", specification: "" },
      ]
    );
    setModalOpen(true);
  };

  const addParameterRow = () => {
    setParameters((prev) => [
      ...prev,
      { parameter: "", testMethod: "", specification: "" },
    ]);
  };

  const updateParameterRow = (
    index: number,
    field: keyof ParameterItem,
    value: string
  ) => {
    setParameters((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeParameterRow = (index: number) => {
    setParameters((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!templateName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nama template wajib diisi",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const normalizedParameters = parameters
      .map((item) => ({
        parameter: item.parameter?.trim(),
        testMethod: item.testMethod?.trim() || undefined,
        specification: item.specification?.trim() || undefined,
      }))
      .filter((item) => Boolean(item.parameter));

    if (normalizedParameters.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Minimal satu parameter harus diisi",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setIsLoading(true);
      if (modalType === "create") {
        await qcCoaService.createQcTemplate({
          templateName,
          parameters: normalizedParameters,
        });
      } else if (currentId) {
        await qcCoaService.updateQcTemplate(String(currentId), {
          templateName,
          parameters: normalizedParameters,
        });
      }
      setModalOpen(false);
      fetchTemplates();
      Swal.fire({
        icon: "success",
        title: "Template disimpan",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan template",
        toast: true,
        position: "top-right",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (templateId: number) => {
    Swal.fire({
      icon: "warning",
      text: "Hapus template ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        setIsLoading(true);
        await qcCoaService.deleteQcTemplate(String(templateId));
        fetchTemplates();
        Swal.fire({
          icon: "success",
          title: "Template dihapus",
          toast: true,
          position: "top-right",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus template",
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

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {pageTitle} - QC Templates
        </h1>
        <p className="text-sm text-slate-500">
          Kelola template parameter uji QC.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Template List</CardTitle>
            <p className="text-sm text-slate-500">
              Daftar template untuk inspeksi kualitas.
            </p>
          </div>
          <Button onClick={openCreate}>Tambah Template</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Cari template..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-sm"
            />
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Template</TableHead>
                  <TableHead>Jumlah Parameter</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingList ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : data.length ? (
                  data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.templateName}
                      </TableCell>
                      <TableCell>
                        {normalizeTemplateParameters(item.parameters).length}
                      </TableCell>
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
                    <TableCell colSpan={3} className="text-center">
                      Belum ada template.
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
        title={modalType === "create" ? "Tambah Template" : "Ubah Template"}
        width="w-[90vw] md:w-[70vw]"
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
      >
        <div className="flex flex-col gap-4 p-5">
          <div>
            <span className="text-sm font-medium">Nama Template</span>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Parameter Uji</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addParameterRow}
              >
                Tambah Baris
              </Button>
            </div>
            <div className="mt-3 space-y-3">
              {parameters.map((param, index) => (
                <div
                  key={`param-${index}`}
                  className="grid gap-2 rounded-lg border p-3 md:grid-cols-4"
                >
                  <Input
                    placeholder="Parameter"
                    value={param.parameter ?? ""}
                    onChange={(e) =>
                      updateParameterRow(index, "parameter", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Metode Uji"
                    value={param.testMethod ?? ""}
                    onChange={(e) =>
                      updateParameterRow(index, "testMethod", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Spesifikasi"
                    value={param.specification ?? ""}
                    onChange={(e) =>
                      updateParameterRow(
                        index,
                        "specification",
                        e.target.value
                      )
                    }
                  />
                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeParameterRow(index)}
                      disabled={parameters.length === 1}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
