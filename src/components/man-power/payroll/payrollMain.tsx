"use client";
import { useEffect, useState } from "react";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { DataTable } from "./data-table";
import { columns } from "./column";
import { IPayroll } from "@/types/payroll";
import { IMeta } from "@/types/common";
import useDebounce from "@/utils/useDebouncy";
import Swal from "sweetalert2";
import { payrollService } from "@/services";
import ModalAddPayroll from "./modalAddPayroll";
import ModalDetailPayroll from "./modalDetailPayroll";
import ModalApprovalPayroll from "./modalApprovalPayroll";

export default function PayrollMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
}) {
  const { setIsLoading } = useLoading();
  const [isApprovalModal, setIsApprovalModal] = useState(false);
  const [id, setId] = useState("");
  const [data, setData] = useState<IPayroll[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<
    "create" | "edit" | "detail" | null
  >(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const [filterPayload, setFilterPayload] = useState("");
  const [detailData, setDetailData] = useState<IPayroll | null>(null);
  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string,
    payload?: any
  ): Promise<IPayroll[]> => {
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
    const { data, meta } = await payrollService.getPayrolls(filterParams);
    setData(data);
    setMetadata(meta);
    return data;
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
    setTitle("Tambah Penggajian");
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
  const handleIsGetDetailPayroll = async (id: string) => {
    try {
      const { data } = await payrollService.getPayroll(id);
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
  const handleViewData = async (id: string) => {
    await handleIsGetDetailPayroll(id);
    setModalType("detail");
    setTitle("Detail Penggajian");
    setDetailModalOpen(true);
  };
  const handleApprovalData = async (id: string) => {
    setId(id);
    setIsApprovalModal(true);
  };
  const handleIsGetData = () => {
    setIsApprovalModal(false);
    setModalOpen(false);
    getData(page, pageSize);
  };

  const handleDeleteData = async (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus Penggajian ini?",
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
          const response = await payrollService.deletePayroll(id);
          getData(page, pageSize);
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (e) {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: "Terjadi Kesalahan",
            text: "Gagal menghapus data",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
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

  const handleDeleteDocument = async (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus document ini?",
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
          const response = await payrollService.deletePayrollDocument(id);
          getData(page, pageSize);
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (e) {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: "Terjadi Kesalahan",
            text: "Gagal menghapus data",
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
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

  return (
    <>
      <DataTable
        columns={columns({
          deleteData: handleDeleteData,
          // editData: handleEditData,
          approval: handleApprovalData,
          deleteDocument: handleDeleteDocument,
          viewDetailData: handleViewData,
          dictionary: dictionary,
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
      <ModalAddPayroll
        isOpen={isModalOpen}
        title={title}
        onClose={toggleModal}
        isGetData={getData}
      />
      <ModalDetailPayroll
        isOpen={isDetailModalOpen}
        title={title}
        onClose={() => setDetailModalOpen(false)}
        detailData={detailData}
        dictionary={dictionary}
      />
      <ModalApprovalPayroll
        isOpen={isApprovalModal}
        title="Approval"
        onClose={() => setIsApprovalModal(false)}
        id={id}
        isGetData={handleIsGetData}
      />
    </>
  );
}
