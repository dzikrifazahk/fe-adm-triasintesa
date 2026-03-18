"use client";

import React from "react";
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
import ModalAddPurchase from "@/components/purchase/modalAddPurchase";
import { toast } from "sonner";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["workspace"];
}

export default function SubmissionPageMain({ dictionary }: Props) {
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
    "details" | "reject" | "verify"
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

  // loading khusus tabel (untuk skeleton)
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
    getPurchases(1, pageSize, String(params?.workspace ?? ""), 1);
  }, []);

  const handle = async () => {};

  const handlePrintResult = async (id: string) => {
    setSelectedDocNoSPB(id);
    setIsOpenPrintResultModal(true);
  };

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 700);
  const [filterPayload, setFilterPayload] = useState("");

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getPurchases(
      newPage,
      pageSize,
      String(params.workspace),
      1,
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
      1,
      debouncedSearch,
      filterPayload
    );
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  const handleFilterChange = (payload: any) => {
    setFilterPayload(payload);
    getPurchases(
      page,
      pageSize,
      String(params?.workspace ?? ""),
      1,
      debouncedSearch,
      payload
    );
  };

  useEffect(() => {
    getPurchases(
      page,
      pageSize,
      String(params?.workspace ?? ""),
      1,
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
        1,
        debouncedSearch,
        filterPayload
      );
    },
    []
  );

  const handleIsClearPayload = () => {
    setFilterPayload("");
    setSearch("");
    getPurchases(1, pageSize, String(params?.workspace), 1);
  };

  const handleDeletePurchase = (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus Data Ini?",
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
          const { data, message } = await purchaseService.deletePurchase(id);
          getPurchases(
            page,
            pageSize,
            String(params.workspace),
            1,
            debouncedSearch,
            filterPayload
          );
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: `${message}`,
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
          title: "Batal Hapus Data",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleAcceptPurchase = async (
    docNo: string,
    payload: IAcceptPurchase
  ) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menyetujui data ini?",
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
          const response = await purchaseService.acceptPurchase(docNo, payload);
          getPurchases(
            page,
            pageSize,
            String(params.workspace),
            1,
            debouncedSearch,
            filterPayload
          );
          setIsOpenDetailModal(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
          setIsLoading(false);
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
        Swal.fire({
          icon: "warning",
          title: "Batal Menyetujui",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleOnRejectData = async (id: string, reason: string) => {
    const payload: IRejectPurchase = {
      note: reason,
    };
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menolak data Ini?",
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
          const { data, message } = await purchaseService.rejectPurchase(
            id,
            payload
          );
          getPurchases(
            page,
            pageSize,
            String(params.workspace),
            1,
            debouncedSearch,
            filterPayload
          );
          setIsOpenDetailModal(false);
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: "Data Berhasil Ditolak",
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

  const handleSelectedData = (data: IPurchase) => {
    setDataDetail(data);
  };

  const handleActions = async (
    id: string,
    actions: "details" | "reject" | "verify"
  ) => {
    if (actions === "details") {
      setModalDetailTitle("Detail Data Purchase");
    }
    if (actions === "verify") {
      setModalDetailTitle("Verifikasi Data Purchase");
    }
    if (actions === "reject") {
      setModalDetailTitle("Tolak Data Purchase");
    }
    setDetailModalMode(actions);
    await getDetailPurchase(id);
    setSelectedIdPurchase(id);
    setIsOpenDetailModal(true);
  };

  const handleEditOrActivate = async (
    id: string,
    actions: "edit" | "activate"
  ) => {
    if (actions === "edit") {
      setModalAddPurchaseTitle("Edit Data Purchase");
    }
    if (actions === "activate") {
      setModalAddPurchaseTitle("Activate Data Purchase");
    }

    setIsUpdatePurchase(actions);
    await getDetailPurchase(id);
    setSelectedIdPurchase(id);
    setIsOpenUpdateModal(true);
  };

  const handleDownload = async (id: string) => {
    try {
      const { data } = await purchaseService.generatePdf(id);
      window.open(data.url, "_blank");
    } catch (error) {
      toast.error("Terjadi Kesalahan");
    }
  };

  const handleIsGetData = async () => {
    getPurchases(
      page,
      pageSize,
      String(params.workspace),
      1,
      debouncedSearch,
      filterPayload
    );
  };

  return (
    <>
      <div className="w-full h-full flex flex-col animate-fade-in rounded-xl">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="flex-1 min-w-0">
            <DataTable
              columns={columns({
                editData: handleEditOrActivate,
                viewDetailData: handleActions,
                verify: handleActions,
                deleteData: handleDeletePurchase,
                reject: handleActions,
                activate: handleEditOrActivate,
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
        onAccept={handleAcceptPurchase}
        onReject={handleOnRejectData}
      />

      <ModalAddPurchase
        isOpen={isOpenUpdateModal}
        title={modalAddPurchaseTitle}
        onClose={() => setIsOpenUpdateModal(false)}
        modalType={isUpdatePurchase}
        isGetData={handleIsGetData}
        setIsLoading={setIsLoading}
        detailData={detailData}
      />
    </>
  );
}
