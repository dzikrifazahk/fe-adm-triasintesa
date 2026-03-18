"use client";

import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IMeta } from "@/types/common";
import { useParams } from "next/navigation";
import { columnsDetail } from "./column-detail";
import { DataTableDetail } from "./data-table-detail";
import { columns } from "./column";
import Swal from "sweetalert2";
import useDebounce from "@/utils/useDebouncy";
import { IAcceptPurchase, IPurchase, IRejectPurchase } from "@/types/purchase";
import { purchaseService } from "@/services";
import { getDictionary } from "../../../../../get-dictionary";
import { DataTable } from "./data-table";
import { usePurchaseRefreshEffect } from "@/context/purchaseLoadingContext";
import { useLoading } from "@/context/loadingContext";
import DetailPurchaseModal from "@/components/purchase/detailModalPurchase";
import { toast } from "sonner";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["workspace"];
}

export default function PaymentRequestPageMain({ dictionary }: Props) {
  const dict = dictionary.purchase;
  const params = useParams();
  const { setIsLoading } = useLoading();
  const [data, setData] = useState<IPurchase[]>([]);
  const [detailData, setDetailData] = useState<IPurchase | null>(null);
  const [isOpenModalDetail, setIsOpenModalDetail] = useState(false);
  const [isOpenProductDetail, setIsOpenProductDetail] = useState(false);
  const [isOpenPrintResultModal, setIsOpenPrintResultModal] = useState(false);
  const [selectedDocNoSPB, setSelectedDocNoSPB] = useState<string | null>(null);
  const [dataDetail, setDataDetail] = useState<IPurchase>();
  const [modalAddPurchaseTitle, setModalAddPurchaseTitle] =
    useState<string>("");
  const [modalDetailTitle, setModalDetailTitle] = useState<string>("");
  const [detailModalMode, setDetailModalMode] = useState<
    "details" | "reject" | "verify" | "payment"
  >("details");
  const [isUpdatePurchase, setIsUpdatePurchase] = useState<"edit" | "activate">(
    "edit"
  );

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();
  const [selectedIdSPB, setSelectedIdPurchase] = useState<string | null>("");
  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const getPurchases = async (
    page?: number,
    pageSize?: number,
    projectId?: string,
    tabSPB?: number,

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
    if (tabSPB) {
      filterParams.tab = tabSPB;
    }
    if (projectId) {
      filterParams.project = projectId;
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
  useEffect(() => {
    setIsLoading(false);
    getPurchases(1, pageSize, String(params?.workspace ?? ""), 3);
  }, []);

  const handle = async () => {};

  const handlePrintResult = async (id: string) => {
    setSelectedDocNoSPB(id);
    setIsOpenPrintResultModal(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getPurchases(
      newPage,
      pageSize,
      String(params.workspace),
      3,
      debouncedSearch,
      filterPayload
    );
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    getPurchases(
      page,
      newPageSize,
      String(params.workspace),
      3,
      debouncedSearch,
      filterPayload
    );
  };

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 700);
  const [filterPayload, setFilterPayload] = useState("");
  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };
  const handleFilterChange = (payload: any) => {
    setFilterPayload(payload);
    getPurchases(
      page,
      pageSize,
      String(params?.workspace ?? ""),
      3,
      debouncedSearch,
      payload
    );
  };
  const handleDownload = async (id: string) => {
    try {
      const { data } = await purchaseService.generatePdf(id);
      window.open(data.url, "_blank");
    } catch (error) {
      toast.error("Terjadi Kesalahan");
    }
  };
  useEffect(() => {
    getPurchases(
      page,
      pageSize,
      String(params?.workspace ?? ""),
      3,
      debouncedSearch,
      filterPayload
    );
  }, [debouncedSearch]);

  usePurchaseRefreshEffect(
    "submission",
    () => {
      getPurchases(
        page,
        pageSize,
        String(params?.workspace ?? ""),
        3,
        debouncedSearch,
        filterPayload
      );
    },
    []
  );

  const handleIsClearPayload = () => {
    setFilterPayload("");
    setSearch("");
    getPurchases(1, pageSize, String(params?.workspace), 3);
  };

  const handleSelectedData = (data: IPurchase) => {
    setDataDetail(data);
  };

  const handleActions = async (
    id: string,
    actions: "details" | "reject" | "verify" | "payment"
  ) => {
    if (actions === "payment") {
      setModalDetailTitle("Payment Data Purchase");
    }
    setDetailModalMode(actions);
    await getDetailPurchase(id);
    setSelectedIdPurchase(id);
    setIsOpenDetailModal(true);
  };

  const handleUndoData = async (id: string) => {
    Swal.fire({
      icon: "warning",
      title: "Pengembalian data!",
      text: "Apakah anda ingin mengembalikan data ini ke tab terverifikasi?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          const { data, message } = await purchaseService.undoPurchase(id);
          getPurchases(
            page,
            pageSize,
            String(params.workspace),
            3,
            debouncedSearch,
            filterPayload
          );
          setIsOpenDetailModal(false);
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: "Data Berhasil Dikembalikan",
            text: `${message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (e) {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } else if (result.isConfirmed === false) {
        setIsLoading(false);
        Swal.fire({
          icon: "warning",
          title: "Batal",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handlePayment = async (id: string, payload: any) => {
    const fd = new FormData();

    fd.append(
      "tanggal_pembayaran_purchase",
      payload.tanggal_pembayaran_purchase
    );

    if (Array.isArray(payload.file_pembayaran)) {
      payload.file_pembayaran.forEach((file: File) => {
        if (file) {
          fd.append("file_pembayaran[]", file);
        }
      });
    }

    Swal.fire({
      icon: "warning",
      title: "Pembayaran!",
      text: "Apakah anda ingin melakukan pembayaran?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          const { data, message } = await purchaseService.paymentPurchase(
            id,
            fd
          );
          getPurchases(
            page,
            pageSize,
            String(params.workspace),
            3,
            debouncedSearch,
            filterPayload
          );
          setIsOpenDetailModal(false);
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: "Berhasil Mengajukan Pembayaran",
            text: `${message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (e) {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } else if (result.isConfirmed === false) {
        setIsLoading(false);
        Swal.fire({
          icon: "warning",
          title: "Batal",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  return (
    <>
      <div className="w-full h-full flex flex-col animate-fade-in rounded-xl">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="flex-1 min-w-0">
            <DataTable
              columns={columns({
                payment: handleActions,
                undoData: handleUndoData,
                viewDetailData: handleActions,
                download: handleDownload,
              })}
              data={data}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              metadata={metadata}
              selectedData={handleSelectedData}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              isClearPayload={handleIsClearPayload}
              searchValue={search}
              isLoading={isTableLoading}
            />
          </div>

          <div className="flex-1 min-w-0">
            <DataTableDetail
              columns={columnsDetail({
                editData: handle,
                deleteData: handle,
              })}
              data={dataDetail?.products ?? []}
              onPageChange={handle}
              onPageSizeChange={handle}
              metadata={metadata}
              viewDetailData={handle}
            />
          </div>
        </div>
      </div>

      <DetailPurchaseModal
        isOpen={isOpenDetailModal}
        title={modalDetailTitle}
        data={detailData}
        // loading={isSubmitting}
        onClose={() => setIsOpenDetailModal(false)}
        mode={detailModalMode}
        onPayment={handlePayment}
      />
    </>
  );
}
