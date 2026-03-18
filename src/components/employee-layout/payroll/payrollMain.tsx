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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/services/base.service";
import ModalDetailPayroll from "@/components/man-power/payroll/modalDetailPayroll";

export default function PayrollEmpMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
}) {
  const { setIsLoading } = useLoading();
  const cookies = getUser();
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
    setTitle("Tambah Kontak");
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

  return (
    <>
      <div className="w-full p-5">
        <div className="font-sans-bold text-3xl">Penggajian</div>
        <div className="mt-1 font-sans text-gray-400 dark:text-white">
          Daftar Penggajian
        </div>
        <Card className="p-4 mt-5">
          <CardHeader>
            <CardTitle>Penggajian</CardTitle>
            <CardDescription>Daftar list penggajian</CardDescription>
          </CardHeader>
          <CardContent className="">
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
              roleId={cookies?.roleId ?? "-"}
            />
          </CardContent>
        </Card>
      </div>
      <ModalDetailPayroll
        isOpen={isDetailModalOpen}
        title={title}
        onClose={() => setDetailModalOpen(false)}
        detailData={detailData}
        dictionary={dictionary}
      />
    </>
  );
}
