"use client";
import { useEffect, useState } from "react";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { DataTable } from "./data-table";
import { columns } from "./column";
import useDebounce from "@/utils/useDebouncy";
import Swal from "sweetalert2";
import { IAttendance } from "@/types/attendance";
import { IMeta } from "@/types/common";
import { attendanceService } from "@/services";
import { getUser } from "@/services/base.service";
import ModalDetailAttendance from "@/components/man-power/attendance/modalDetailAttendance";
import { useParams } from "next/navigation";

export default function WorkspaceManPowerMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
}) {
  const { setIsLoading } = useLoading();
  const params = useParams();
  const cookies = getUser();
  const [data, setData] = useState<IAttendance[]>([]);
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
  const [detailData, setDetailData] = useState<IAttendance | null>(null);
  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string,
    payload?: any
  ): Promise<IAttendance[]> => {
    let filterParams: Record<string, any> = {};
    if (pageSize || page) {
      filterParams = {
        page: page,
        per_page: pageSize,
        project_id: params.workspace,
        paginate: true,
        sort_type: "desc",
        sort_by: "created_at",
      };
    }

    filterParams.search = search;

    if (payload) {
      filterParams = { ...filterParams, ...payload };
    }

    if (filterParams.date && Array.isArray(filterParams.date)) {
      filterParams.date = `[${filterParams.date.join(", ")}]`;
    }
    const { data, meta } = await attendanceService.getAttendances(filterParams);
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
    setTitle("Tambah Kontak");
    setModalType("create");
    toggleModal();
  };

  const handleViewData = async (id: string, data: IAttendance) => {
    try {
      const { data } = await attendanceService.getDetailAttendance(id);
      setDetailData(data);
      setTitle("Detail Absensi");
      setModalType("detail");
      setDetailModalOpen(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Terjadi kesalahan!",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  useEffect(() => {
    setIsLoading(false);
    getData(page, pageSize);
  }, []);

  return (
    <>
      <div className="w-full h-full">
        <DataTable
          columns={columns({
            // deleteData: handleDeleteData,
            // editData: handleEditData,
            viewDetailData: handleViewData,
            dictionary: dictionary,
            roleId: cookies?.roleId ?? "-",
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

        <ModalDetailAttendance
          isOpen={isDetailModalOpen}
          title={title}
          onClose={() => setDetailModalOpen(false)}
          dictionary={dictionary}
          detailData={detailData}
        />
      </div>
    </>
  );
}
