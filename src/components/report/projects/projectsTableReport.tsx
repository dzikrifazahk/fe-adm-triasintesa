"use client";

import { useContext, useEffect, useState } from "react";
import { getDictionary } from "../../../../get-dictionary";
import { columns } from "./column";
import { DataTable } from "./data-table";
import { projectService } from "@/services";
import { IProject } from "@/types/project";
import { IMeta } from "@/types/common";
import useDebounce from "@/utils/useDebouncy";
import { useLoading } from "@/context/loadingContext";
import { getUser } from "@/services/base.service";
import { ModalFilterProject } from "@/components/settings/projects/projects/modalFilterProject";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

export default function ProjectsTableReport({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["report"];
}) {
  const { setIsLoading } = useLoading();
  const { isMobile } = useContext(MobileContext);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [data, setData] = useState<IProject[]>([]);
  const [metadata, setMetadata] = useState<IMeta>();
  const [cookies, setCookies] = useState<any>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const [filterPayload, setFilterPayload] = useState<any>("");
  const [isOpenModalFilter, setIsOpenModalFilter] = useState(false);

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string,
    payload?: any
  ) => {
    try {
      let filterParams: Record<string, any> = {};

      if (pageSize || page) {
        filterParams.page = page;
        filterParams.per_page = pageSize;
      }

      filterParams.search = search;

      if (payload) {
        filterParams = { ...filterParams, ...payload };
      }

      if (filterParams.date && Array.isArray(filterParams.date)) {
        filterParams.date = `[${filterParams.date.join(", ")}]`;
      }

      const response = await projectService.getProjects(filterParams);
      setData(response.data);
      setMetadata(response.meta);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleViewData = async (id: string) => {
    setSelectedProjectId(id);
    setIsModalDetailOpen(true);
  };

  const handleIsGetData = async () => {
    getData(page, pageSize, debouncedSearch, filterPayload);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    getData(page, pageSize, debouncedSearch, filterPayload);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    getData(page, pageSize, debouncedSearch, filterPayload);
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
    getData(page, pageSize, searchValue, filterPayload);
  };

  const handleIsClearPayload = async () => {
    setFilterPayload("");
    setIsLoading(true);
    await getData(page, pageSize, debouncedSearch, "");
    setIsLoading(false);
    Swal.fire({
      icon: "success",
      title: "Berhasil Menghapus Filter",
      position: "top-right",
      toast: true,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  useEffect(() => {
    setIsLoading(false);
    const user = getUser();
    setCookies(user);
    getData(page, pageSize, debouncedSearch, filterPayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = async (payload: any) => {
    setFilterPayload(payload);
    setIsOpenModalFilter(false);
    setIsLoading(true);
    await getData(page, pageSize, debouncedSearch, payload);
    setIsLoading(false);
    Swal.fire({
      icon: "success",
      title: "Berhasil Menerapkan Filter",
      position: "top-right",
      toast: true,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleExportExcel = async () => {
    try {
      Swal.fire({
        title: "Export Excel",
        html: "Sedang mengambil data (0%)...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // base filter ikut kondisi table (search + filterPayload)
      let baseFilter: Record<string, any> = {};

      if (debouncedSearch) {
        baseFilter.search = debouncedSearch;
      }

      if (filterPayload) {
        baseFilter = { ...baseFilter, ...filterPayload };
      }

      if (baseFilter.date && Array.isArray(baseFilter.date)) {
        baseFilter.date = `[${baseFilter.date.join(", ")}]`;
      }

      const perPage = pageSize || 10;

      // Ambil page 1 dulu buat baca meta
      const firstResp = await projectService.getProjects({
        ...baseFilter,
        page: 1,
        per_page: perPage,
      });

      const allProjects: IProject[] = [...(firstResp.data || [])];
      const meta = firstResp.meta as any;
      const lastPage: number = meta?.last_page ?? 1;
      const total: number = meta?.total ?? allProjects.length;

      // Ambil page 2..lastPage
      for (let p = 2; p <= lastPage; p++) {
        const progressPercent = Math.round(((p - 1) / lastPage) * 100);
        Swal.update({
          html: `Sedang mengambil data (${progressPercent}%)...`,
        });

        const resp = await projectService.getProjects({
          ...baseFilter,
          page: p,
          per_page: perPage,
        });

        if (resp?.data?.length) {
          allProjects.push(...resp.data);
        }
      }

      if (!allProjects.length) {
        Swal.close();
        Swal.fire({
          icon: "warning",
          title: "Tidak ada data untuk di-export",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
        return;
      }

      Swal.update({
        html: "Sedang mengekstrak data ke Excel...",
      });

      // Mapping data ke bentuk flat utk Excel
      const rows = allProjects.map((p) => ({
        "ID Proyek": p.id,
        "Nama Proyek": p.name,
        Client: (p as any).client?.name ?? "",
        Tanggal: (p as any).date ?? "",
        Lokasi: (p as any).location ?? "",
        Billing: (p as any).billing ?? 0,
        Margin: (p as any).margin ?? 0,
        "Real Margin": (p as any).real_margin ?? 0,
        "Status Cost Progress":
          (p as any).cost_progress_project?.status_cost_progres ?? "",
        "Percent Cost Progress":
          (p as any).cost_progress_project?.percent ?? "",
        "Real Cost": (p as any).cost_progress_project?.real_cost ?? 0,
        "Purchase Cost": (p as any).cost_progress_project?.purchase_cost ?? 0,
        "Payroll Cost": (p as any).cost_progress_project?.payroll_cost ?? 0,
        "Status Owner": (p as any).request_status_owner?.name ?? "",
        "Tipe Termin Proyek": (p as any).type_termin_proyek?.name ?? "",
        "Sisa Pembayaran Termin": (p as any).sisa_pembayaran_termin ?? 0,
        "Total Harga Termin": (p as any).harga_total_termin_proyek ?? 0,
        "Tanggal Pembayaran Termin":
          (p as any).payment_date_termin_proyek ?? "",
        "Dibuat Oleh": (p as any).created_by?.name ?? "",
        "Diubah Oleh": (p as any).updated_by?.name ?? "",
      }));

      // Generate workbook dengan xlsx
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");

      // Auto width kolom (opsional)
      if (rows.length > 0) {
        const colWidths = Object.keys(rows[0]).map((key) => ({
          wch:
            Math.max(
              key.length,
              ...rows.map((r) => String((r as any)[key] ?? "").length)
            ) + 2,
        }));
        (worksheet as any)["!cols"] = colWidths;
      }

      const wbout = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `projects-report-${today}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Berhasil export Excel",
        text: `Total data: ${total} baris`,
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (error) {
      console.error("Export Excel error:", error);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Gagal export Excel",
        text: "Terjadi kesalahan saat mengambil atau mengekstrak data.",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  return (
    <div>
      <DataTable
        columns={columns({
          viewDetailData: handleViewData,
          cookies: cookies,
        })}
        data={data}
        isGetData={handleIsGetData}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        metadata={metadata}
        onSearchChange={handleSearchChange}
        isClearPayload={handleIsClearPayload}
        dictionary={dictionary}
        onOpenFilter={() => setIsOpenModalFilter(true)}
        isExportExcel={handleExportExcel}
      />

      <ModalFilterProject
        isOpen={isOpenModalFilter}
        onClose={() => setIsOpenModalFilter(false)}
        title="Advance Filter"
        onSubmit={handleFilterChange}
        isClearPayload={handleIsClearPayload}
        width={`${isMobile ? "w-[90vw]" : "w-[30vw]"} `}
      />
    </div>
  );
}
