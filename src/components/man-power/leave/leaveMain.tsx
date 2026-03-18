"use client";
import { useEffect, useState } from "react";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { DataTable } from "./data-table";
import { columns } from "./column";
import { IOvertime } from "@/types/overtime";
import { IMeta } from "@/types/common";
import useDebounce from "@/utils/useDebouncy";
import Swal from "sweetalert2";
import { leaveService, overtimeService } from "@/services";
import { getUser } from "@/services/base.service";
import ModalDetailOvertime from "./modalLeaveDetail";
import { ILeave } from "@/types/leave";
import ModalLeave from "./modalLeave";
import ModalApprovalLeave from "./modalApprovalLeave";

type ModalType = "create" | "edit" | "detail";

export default function LeaveMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
}) {
  const { setIsLoading } = useLoading();
  const cookies = getUser();
  const [data, setData] = useState<ILeave[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<
    "create" | "edit" | "detail" | null
  >(null);
  const [detailData, setDetailData] = useState<ILeave | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const [filterPayload, setFilterPayload] = useState("");
  const [isApprovalModal, setIsApprovalModal] = useState(false);
  const [approvalId, setApprovalId] = useState<number>();
  const [approvalAction, setApprovalAction] = useState("");
  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string,
    payload?: any
  ): Promise<IOvertime[]> => {
    let filterParams: Record<string, any> = {};
    if (pageSize || page) {
      filterParams = { page: page, per_page: pageSize, paginate: true };
    }

    filterParams.search = search;

    if (payload) {
      filterParams = { ...filterParams, ...payload };
    }

    if (filterParams.date && Array.isArray(filterParams.date)) {
      filterParams.date = `[${filterParams.date.join(", ")}]`;
    }
    const { data, meta } = await leaveService.getAllLeave(filterParams);
    setData(data);
    setMetadata(meta);
    return data;
  };
  const handleIsGetData = () => {
    setIsApprovalModal(false);
    getData(page, pageSize);
  };
  const handleClearPayload = () => {
    setFilterPayload("");
    getData(page, pageSize);
    Swal.fire({
      icon: "success",
      title: "Filter Berhasil Dihapus",
      position: "top-right",
      toast: true,
      showConfirmButton: false,
      timer: 2000,
    });
  };
  const handleFilterChange = (payload: any) => {
    setFilterPayload(payload);
    getData(page, pageSize, debouncedSearch, payload);
  };
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getData(newPage, pageSize, debouncedSearch, filterPayload);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    getData(page, newPageSize, debouncedSearch, filterPayload);
  };
  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };
  const handleCreateData = () => {
    setTitle("Tambah Cuti");
    setModalType("create");
    toggleModal();
  };
  useEffect(() => {
    setIsLoading(false);
    getData(page, pageSize);
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleIsGetDetailOvertime = async (id: number) => {
    try {
      const { data } = await leaveService.getLeave(id);
      setDetailData(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Gagal mendapatkan data",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const handleEditData = async (id: number) => {
    setModalType("edit");
    await handleIsGetDetailOvertime(id);
    setModalOpen(true);
  };

  const handleApproval = async (id: number) => {
    setIsApprovalModal(true);
    setApprovalId(id);
  };

  const handleDeleteData = (id: number) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus cuti ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const response = await leaveService.deleteLeave(id);
        getData();
        setIsLoading(false);
        Swal.fire({
          icon: "success",
          title: `${response.message}`,
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      } else if (result.isConfirmed === false) {
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
  const handleViewData = async (id: number) => {
    await handleIsGetDetailOvertime(id);
    setModalType("detail");
    setTitle("Detail Cuti");
    setDetailModalOpen(true);
  };
  return (
    <>
      <DataTable
        columns={columns({
          deleteData: handleDeleteData,
          editData: handleEditData,
          viewDetailData: handleViewData,
          dictionary: dictionary,
          roleId: cookies?.roleId ?? "",
          approval: handleApproval,
        })}
        data={data}
        addData={handleCreateData}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        metadata={metadata}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        isClearPayload={handleClearPayload}
        dictionary={dictionary}
      />
      <ModalLeave
        isOpen={isModalOpen}
        title={modalType === "create" ? "Tambah Cuti" : "Edit Cuti"}
        modalType={modalType || "create"}
        onClose={() => setModalOpen(false)}
        isGetData={handleIsGetData}
        detailData={detailData}
        setIsLoading={setIsLoading}
        isNonAuthMode={true}
      />
      {isDetailModalOpen && (
        <ModalDetailOvertime
          dictionary={dictionary}
          isOpen={isDetailModalOpen}
          title="Detail Cuti"
          onClose={() => setDetailModalOpen(false)}
          detailData={detailData}
        />
      )}
      {isApprovalModal && (
        <ModalApprovalLeave
          isOpen={isApprovalModal}
          title="Approval Cuti"
          onClose={() => setIsApprovalModal(false)}
          id={approvalId}
          isGetData={handleIsGetData}
        />
      )}
    </>
  );
}
