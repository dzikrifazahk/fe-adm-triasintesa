"use client";
import { useEffect, useState } from "react";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { DataTable } from "./data-table";
import { columns } from "./column";
import Swal from "sweetalert2";
import { ICashAdvance, ICashAdvanceMutation } from "@/types/cash-advance";
import { IMeta } from "@/types/common";
import useDebounce from "@/utils/useDebouncy";
import { cashAdvanceService } from "@/services";
import { getUser } from "@/services/base.service";
import ModalApprovalCashAdvance from "@/components/man-power/cash-advance/modalApprovalCashAdvance";
import ModalCashAdvance from "./modalCashAdvance";
import ModalPaymentCashAdvance from "@/components/man-power/cash-advance/modalPaymentCashAdvance";
import ModalDetailCashAdvance from "./modalDetailCashAdvance";
import { MutationDataTable } from "./mutation/data-table";
import { cashAdvanceColumns } from "./mutation/column";

// shadcn tabs
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function CashAdvancehMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
}) {
  const { setIsLoading } = useLoading();
  const cookies = getUser();

  const [data, setData] = useState<ICashAdvance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<
    "create" | "edit" | "detail" | null
  >(null);
  const [detailData, setDetailData] = useState<ICashAdvance | null>(null);
  const [isApprovalModal, setIsApprovalModal] = useState(false);
  const [id, setId] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const [filterPayload, setFilterPayload] = useState("");

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  // mutation
  const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);
  const [mutationData, setMutationData] = useState<ICashAdvanceMutation[]>([]);

  // tabs
  const [activeTab, setActiveTab] = useState<"cash_advance" | "mutation">(
    "cash_advance"
  );

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string,
    payload?: any
  ): Promise<ICashAdvance[]> => {
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
    const { data, meta } = await cashAdvanceService.getCashAdvances(
      filterParams
    );
    setData(data);
    setMetadata(meta);
    return data;
  };

  const getDataMutation = async () => {
    const params = {
      sort_type: "desc",
      sort_by: "created_at",
    };

    try {
      setIsLoading(true);
      const { data } = await cashAdvanceService.getCashAdvanceMutations(params);
      setMutationData(data);
      setIsLoading(false);
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
      setIsLoading(false);
    }
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
    setTitle("Tambah Kontak");
    setModalType("create");
    toggleModal();
  };

  const handleDeleteData = (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus Peminjaman Tunai ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        try {
          const response = await cashAdvanceService.deleteCashAdvance(id);
          getData(page, pageSize, debouncedSearch, filterPayload);
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (error: any) {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: `${error.response?.data?.message ?? "Terjadi kesalahan"}`,
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

  const handleIsGetDetailCashAdvanceData = async (id: string) => {
    try {
      const { data } = await cashAdvanceService.getCashAdvance(id);
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
    await handleIsGetDetailCashAdvanceData(id);
    setIsModalOpen(true);
  };

  const handleIsGetData = () => {
    setIsModalOpen(false);
    getData(page, pageSize, debouncedSearch, filterPayload);
  };

  const handleApprovalData = async (id: string) => {
    setId(id);
    setIsApprovalModal(true);
  };

  const handlePaymentData = async (id: string) => {
    setId(id);
    setIsPaymentModalOpen(true);
  };

  const handleViewData = async (id: string) => {
    await handleIsGetDetailCashAdvanceData(id);
    setModalType("detail");
    setTitle("Detail Pinjaman");
    setDetailModalOpen(true);
  };

  useEffect(() => {
    setIsLoading(false);
    getData(page, pageSize);
    getDataMutation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // kalau mau refetch saat search berubah
  useEffect(() => {
    getData(page, pageSize, debouncedSearch, filterPayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={(val) =>
          setActiveTab(val as "cash_advance" | "mutation")
        }
        className="w-full"
      >
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="cash_advance" className="cursor-pointer">
            Cash Advance
          </TabsTrigger>
          <TabsTrigger value="mutation" className="cursor-pointer">
            Mutasi
          </TabsTrigger>
        </TabsList>

        {/* TAB CASH ADVANCE */}
        <TabsContent value="cash_advance" className="mt-0">
          <DataTable
            columns={columns({
              deleteData: handleDeleteData,
              editData: handleEditData,
              roleId: cookies?.roleId ?? "-",
              viewDetailData: handleViewData,
              dictionary: dictionary,
              approval: handleApprovalData,
              payment: handlePaymentData,
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
        </TabsContent>

        {/* TAB MUTATION */}
        <TabsContent value="mutation" className="mt-0">
          <MutationDataTable
            columns={cashAdvanceColumns({
              roleId: cookies?.roleId ?? "-",
              viewDetailData: handleViewData,
              dictionary: dictionary,
            })}
            data={mutationData}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            metadata={metadata}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            isClearPayload={handleClearPayload}
            dictionary={dictionary}
          />
        </TabsContent>
      </Tabs>

      {isModalOpen && (
        <ModalCashAdvance
          isOpen={isModalOpen}
          title={modalType === "create" ? "Tambah Pinjaman" : "Edit Pinjaman"}
          modalType={modalType ?? ""}
          onClose={() => setIsModalOpen(false)}
          isGetData={handleIsGetData}
          detailData={detailData}
          setIsLoading={setIsLoading}
        />
      )}

      {isApprovalModal && (
        <ModalApprovalCashAdvance
          isOpen={isApprovalModal}
          title="Approval"
          onClose={() => setIsApprovalModal(false)}
          id={id}
          isGetData={handleIsGetData}
        />
      )}

      <ModalPaymentCashAdvance
        isOpen={isPaymentModalOpen}
        title="Payment"
        onClose={() => setIsPaymentModalOpen(false)}
        id={id}
        isGetData={handleIsGetData}
      />

      <ModalDetailCashAdvance
        isOpen={isDetailModalOpen}
        title="Detail Data"
        onClose={() => setDetailModalOpen(false)}
        detailData={detailData}
        dictionary={dictionary}
      />
    </>
  );
}
