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
import { overtimeService } from "@/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ModalOvertime from "../../man-power/overtime/modalOvertime";
import { getUser } from "@/services/base.service";
import ModalApproval from "./modalApproval";

export default function OvertimeMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
}) {
  const { setIsLoading } = useLoading();
  const cookies = getUser();
  const [data, setData] = useState<IOvertime[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState<IOvertime | null>(null);
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
  const [isApprovalModal, setIsApprovalModal] = useState(false);
  const [approvalId, setApprovalId] = useState("");
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
    const { data, meta } = await overtimeService.getOvertimes(filterParams);
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
    setIsModalOpen(!isModalOpen);
  };
  const handleCreateData = () => {
    setTitle("Tambah Lembur");
    setModalType("create");
    setIsModalOpen(true);
  };
  const handleIsGetData = () => {
    setIsModalOpen(false);
    getData(page, pageSize);
  };
  const handleDeleteData = (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus pengajuan lembur ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const response = await overtimeService.deleteOvertime(id);
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
  const handleIsGetDetailOvertime = async (id: string) => {
    try {
      const { data } = await overtimeService.getOvertime(id);
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
  const handleEditData = async (id: string) => {
    setModalType("edit");
    await handleIsGetDetailOvertime(id);
    setIsModalOpen(true);
  };
  useEffect(() => {
    setIsLoading(false);
    getData(page, pageSize);
  }, []);

  const handleApproval = async (id: string, action: string) => {
    setIsApprovalModal(true);
    setApprovalId(id);
    setApprovalAction(action);
  };
  return (
    <>
      <div className="w-full p-5">
        <div className="font-sans-bold text-3xl">Lembur</div>
        <div className="mt-1 font-sans text-gray-400 dark:text-white">
          Daftar Lembur
        </div>
        <Card className="p-4 mt-5">
          <CardHeader>
            <CardTitle>Lembur</CardTitle>
            <CardDescription>Catatan Lembur Anda</CardDescription>
          </CardHeader>
          <CardContent className="">
            <DataTable
              columns={columns({
                deleteData: handleDeleteData,
                editData: handleEditData,
                // viewDetailData: handleViewData,
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
          </CardContent>
        </Card>
      </div>
      {isModalOpen && (
        <ModalOvertime
          isOpen={isModalOpen}
          title={modalType === "create" ? "Tambah Lembur" : "Edit Lembur"}
          modalType={modalType ?? "create"}
          onClose={() => setIsModalOpen(false)}
          isGetData={handleIsGetData}
          detailData={detailData}
          setIsLoading={setIsLoading}
        />
      )}
      {isApprovalModal && (
        <ModalApproval
          isOpen={isApprovalModal}
          title="Approval"
          onClose={() => setIsApprovalModal(false)}
          id={approvalId}
          action={approvalAction}
          isGetData={handleIsGetData}
        />
      )}
    </>
  );
}
