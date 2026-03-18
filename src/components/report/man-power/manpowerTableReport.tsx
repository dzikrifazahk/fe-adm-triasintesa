"use client";
import { useLoading } from "@/context/loadingContext";
import { getDictionary } from "../../../../get-dictionary";
import { IPurchase } from "@/types/purchase";
import { useEffect, useState } from "react";
import { IMeta } from "@/types/common";
import { purchaseService } from "@/services";
import useDebounce from "@/utils/useDebouncy";
import DetailPurchaseModal from "@/components/purchase/detailModalPurchase";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { AttendanceDataTable } from "./attendance/data-table";
import { attendanceColumns } from "./attendance/column";
import { IAttendance } from "@/types/attendance";

export default function ManPowerTableReport({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["report"];
}) {
  const { setIsLoading } = useLoading();
  const [data, setData] = useState<IAttendance[]>([]);
  const [detailData, setDetailData] = useState<IAttendance | null>(null);
  const [modalDetailTitle, setModalDetailTitle] = useState<string>("");
  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);
  const [dataDetail, setDataDetail] = useState<IAttendance>();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();
  const [isTableLoading, setIsTableLoading] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 700);
  const [filterPayload, setFilterPayload] = useState<any>("");
  const [isOpenFilter, setIsOpenFilter] = useState(false);

  const getPurchases = async (
    page?: number,
    pageSize?: number,
    search?: string,
    payload?: any
  ) => {
    let filterParams: Record<string, any> = {};

    if (page) {
      filterParams.page = page;
    }
    if (pageSize) {
      filterParams.per_page = pageSize;
    }
    if (search) {
      filterParams.search = search;
    }
    if (payload) {
      filterParams = { ...filterParams, ...payload };
    }

    try {
      setIsTableLoading(true);
      const { data, meta } = await purchaseService.getPurchases(filterParams);
      setData(data);
      setMetadata(meta);
    } finally {
      setIsTableLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getPurchases(newPage, pageSize, debouncedSearch, filterPayload);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    getPurchases(page, newPageSize, debouncedSearch, filterPayload);
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  const handleFilterChange = (payload: any) => {
    setFilterPayload(payload);
    getPurchases(page, pageSize, debouncedSearch, payload);
  };

  const getDetailPurchase = async (id: string) => {
    try {
      setIsLoading(true);
      const { data } = await purchaseService.getPurchase(id);
      setDetailData(data[0]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIsClearPayload = () => {
    setFilterPayload("");
    setSearch("");
    getPurchases(1, pageSize);
  };

  const handleViewData = async (id: string) => {
    setModalDetailTitle("Details Data Purchase");
    await getDetailPurchase(id);
    setIsOpenDetailModal(true);
  };

  const handleSelectedData = (data: IAttendance) => {
    setDataDetail(data);
  };

  useEffect(() => {
    getPurchases(page, pageSize, debouncedSearch, filterPayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    setIsLoading(false);
    getPurchases(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // base filter dari search + filterPayload yang aktif
      let baseFilter: Record<string, any> = {};

      if (debouncedSearch) {
        baseFilter.search = debouncedSearch;
      }

      if (filterPayload) {
        baseFilter = { ...baseFilter, ...filterPayload };
      }

      const perPage = pageSize || 10;

      // Ambil page 1 dulu untuk tahu meta paging
      const firstResp = await purchaseService.getPurchases({
        ...baseFilter,
        page: 1,
        per_page: perPage,
      });

      const allPurchases: IPurchase[] = [...(firstResp.data || [])];
      const meta = firstResp.meta as any;
      const lastPage: number = meta?.last_page ?? 1;

      // Ambil sisa page
      for (let p = 2; p <= lastPage; p++) {
        const progressPercent = Math.round(((p - 1) / lastPage) * 100);
        Swal.update({
          html: `Sedang mengambil data (${progressPercent}%)...`,
        });

        const resp = await purchaseService.getPurchases({
          ...baseFilter,
          page: p,
          per_page: perPage,
        });

        if (resp?.data?.length) {
          allPurchases.push(...resp.data);
        }
      }

      // === FLATTEN BERDASARKAN PRODUCTS (1 ROW = 1 PRODUCT) ===
      const rows = allPurchases.flatMap((p: any) => {
        const products = Array.isArray(p.products) ? p.products : [];
        if (!products.length) {
          // tidak ada product => skip, karena diminta berdasarkan products saja
          return [];
        }

        return products.map((pr: any, idx: number) => ({
          "Doc No": p.doc_no ?? "",
          "Doc Type": p.doc_type ?? "",
          "Purchase Type": p.purchase_type?.name ?? "",
          "Tab Purchase": p.tab_purchase?.name ?? "",
          "Status Purchase": p.status_purchase?.name ?? "",
          Description: p.description ?? "",
          Remarks: p.remarks ?? "",
          "Date Start Create Purchase": p.date_start_create_purchase ?? "",
          "Due Date End Purchase": p.due_date_end_purchase ?? "",
          "Status Exceeding Budget":
            p.status_exceeding_budget_project_purchase ?? "",
          "Budget Name": p.budget?.nama_budget ?? "",
          "Budget Total Nominal": p.budget?.total_nominal_budget ?? 0,
          "Project ID": p.project?.id ?? "",
          "Project Name": p.project?.name ?? "",
          "Purchase Event Type": p.purchase_event_type?.name ?? "",
          // === PRODUCT-LEVEL ===
          "Product ID": pr.id ?? "",
          "Product Name": pr.product_name ?? "",
          "Vendor Name": pr.vendor?.name ?? "",
          Harga: pr.harga ?? 0,
          Qty: pr.stok ?? 0,
          "Subtotal Harga Product": pr.subtotal_harga_product ?? 0,
          "PPN Rate": pr.ppn?.rate ?? 0,
          "PPN Amount": pr.ppn?.amount ?? 0,
          // === SUMMARY DI LEVEL PURCHASE (SAMA UNTUK TIAP PRODUCT DI PURCHASE tsb) ===
          "Sub Total Purchase": p.sub_total_purchase ?? 0,
          "PPH Rate": p.pph?.rate ?? 0,
          "PPH Amount": p.pph?.amount ?? 0,
          Total: p.total ?? 0,
          "Tanggal Pembayaran Purchase": p.tanggal_pembayaran_purchase ?? "",
          "Created At": p.created_at ?? "",
          "Updated At": p.updated_at ?? "",
          "Created By": p.created_by?.name ?? "",
        }));
      });

      if (!rows.length) {
        Swal.close();
        Swal.fire({
          icon: "warning",
          title: "Tidak ada data product untuk di-export",
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

      // Buat workbook dengan xlsx
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");

      // Auto width kolom biar rapi
      if (rows.length > 0) {
        const colWidths = Object.keys(rows[0]).map((key) => ({
          wch:
            Math.max(
              key.length,
              ...rows.map(
                (r: any) =>
                  String(r[key] === undefined || r[key] === null ? "" : r[key])
                    .length
              )
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
      link.download = `purchase-report-${today}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Berhasil export Excel",
        text: `Total baris (products): ${rows.length}`,
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
    <>
      <div>
        <AttendanceDataTable
          columns={attendanceColumns({
            viewDetailData: handleViewData,
            dictionary: (dictionary as any) ?? "-",
          })}
          data={data}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          metadata={metadata}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          isClearPayload={handleIsClearPayload}
          isExportExcel={handleExportExcel}
          dictionary={(dictionary as any) ?? "-"}
        />
      </div>
    </>
  );
}
