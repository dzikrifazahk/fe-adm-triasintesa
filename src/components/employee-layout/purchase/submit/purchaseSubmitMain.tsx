"use client";
import { useEffect, useState } from "react";
import { useLoading } from "@/context/loadingContext";
import { columns } from "./column";
import { IPayroll } from "@/types/payroll";
import { IMeta } from "@/types/common";
import useDebounce from "@/utils/useDebouncy";
import Swal from "sweetalert2";
import { payrollService, purchaseService } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { getUser } from "@/services/base.service";
import { getDictionary } from "../../../../../get-dictionary";
import { DataTable } from "./data-table";
import { IPurchase } from "@/types/purchase";

export default function PurchaseSubmitMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
}) {
  const { setIsLoading } = useLoading();
  const cookies = getUser();
  const [data, setData] = useState<IPurchase[]>([]);
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
      filterParams = { page: page, per_page: pageSize, tab: 1 };
    }

    filterParams.search = search;

    if (payload) {
      filterParams = { ...filterParams, ...payload };
    }

    if (filterParams.date && Array.isArray(filterParams.date)) {
      filterParams.date = `[${filterParams.date.join(", ")}]`;
    }
    const { data, meta } = await purchaseService.getPurchases(filterParams);
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
    setTitle("Tambah Purchase");
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

  return (
    <>
      <div className="w-full p-5">
        <div className="font-sans-bold text-3xl">Halaman Submit Pembelian</div>
        <div className="mt-1 font-sans text-gray-400 dark:text-white">
          Halaman submit pengeluaran proyek, reimbursment, invoice
        </div>
        <Card className="p-4 mt-5">
          <CardContent className="mt-5">
            <DataTable
              columns={columns({
                // deleteData: handleDeleteData,
                // editData: handleEditData,
                // viewDetailData: handleViewData,
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
    </>
  );
}
