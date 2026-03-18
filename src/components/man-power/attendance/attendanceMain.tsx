"use client";

import { useEffect, useState } from "react";
import { getDictionary } from "../../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { DataTable } from "./data-table";
import { columns } from "./column";
import useDebounce from "@/utils/useDebouncy";
import Swal from "sweetalert2";
import { IAdjustmentAttendance, IAttendance } from "@/types/attendance";
import { IMeta } from "@/types/common";
import { adjusmentService, attendanceService } from "@/services";
import { getUser } from "@/services/base.service";
import ModalDetailAttendance from "./modalDetailAttendance";
import SyncSalaryModal from "./syncSalaryModal";
import AdjustmentAttendanceModal from "./adjustment/adjustmentAttendanceModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdjusmentTable } from "./adjustment/data-table";
import { adjustmentColumns } from "./adjustment/column";

export default function AttendanceMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["man_power"];
}) {
  const { setIsLoading } = useLoading();
  const cookies = getUser();

  const [activeTab, setActiveTab] = useState<"attendance" | "adjustment">(
    "attendance"
  );

  const [data, setData] = useState<IAttendance[]>([]);
  const [adjusmentData, setAdjusmentData] = useState<IAdjustmentAttendance[]>([]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isSyncSalaryModalOpen, setSyncSalaryModalOpen] = useState(false);
  const [isAdjusmentModalOpen, setAdjusmentModalOpen] = useState(false);

  const [detailAdjusmentData, setDetailAdjusmentData] =
    useState<IAttendance | null>(null);
  const [detailData, setDetailData] = useState<IAttendance | null>(null);

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
  ): Promise<IAttendance[]> => {
    let filterParams: Record<string, any> = {};
    if (pageSize || page) {
      filterParams = {
        page: page,
        per_page: pageSize,
        paginate: true,
        sort_type: "desc",
        sort_by: "created_at",
        show_overtime: 1,
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

  // --- FETCH ADJUSTMENT ---
  const getDataAdjusment = async (
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

    const { data, meta } = await adjusmentService.getAdjusments(filterParams);
    setAdjusmentData(data);
    setMetadata(meta);
    return data;
  };

  const handleClearPayload = () => {
    setFilterPayload("");

    if (activeTab === "attendance") {
      getData(page, pageSize);
    } else {
      getDataAdjusment(page, pageSize);
    }

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

    if (activeTab === "attendance") {
      getData(page, pageSize, debouncedSearch, payload);
    } else {
      getDataAdjusment(page, pageSize, debouncedSearch, payload);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (activeTab === "attendance") {
      getData(newPage, pageSize, debouncedSearch, filterPayload);
    } else {
      getDataAdjusment(newPage, pageSize, debouncedSearch, filterPayload);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    if (activeTab === "attendance") {
      getData(page, newPageSize, debouncedSearch, filterPayload);
    } else {
      getDataAdjusment(page, newPageSize, debouncedSearch, filterPayload);
    }
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

  const handleAdjustmentData = async (id: string, data: IAttendance) => {
    setDetailAdjusmentData(data);
    setAdjusmentModalOpen(true);
  };

  useEffect(() => {
    setIsLoading(false);
    getData(page, pageSize);
    getDataAdjusment(page, pageSize);
  }, []);

  useEffect(() => {
    if (activeTab === "attendance") {
      getData(page, pageSize, debouncedSearch, filterPayload);
    } else {
      getDataAdjusment(page, pageSize, debouncedSearch, filterPayload);
    }
  }, [debouncedSearch, activeTab]);

  return (
    <>
      <div className="w-full h-full">
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            const v = val as "attendance" | "adjustment";
            setActiveTab(v);
            if (v === "attendance") {
              getData(page, pageSize, debouncedSearch, filterPayload);
            } else {
              getDataAdjusment(page, pageSize, debouncedSearch, filterPayload);
            }
          }}
          className="w-full h-full flex flex-col"
        >
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="attendance" className="cursor-pointer">
              Attendance
            </TabsTrigger>
            <TabsTrigger value="adjustment" className="cursor-pointer">
              Adjustment
            </TabsTrigger>
          </TabsList>

          {/* TAB ATTENDANCE */}
          <TabsContent value="attendance" className="mt-0">
            <DataTable
              columns={columns({
                // deleteData: handleDeleteData,
                // editData: handleEditData,
                viewDetailData: handleViewData,
                dictionary: dictionary,
                roleId: cookies?.roleId ?? "-",
                adjusment: handleAdjustmentData,
              })}
              data={data}
              addData={handleCreateData}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              metadata={metadata}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              isClearPayload={handleClearPayload}
              isGetData={() => {
                getData(page, pageSize, debouncedSearch, filterPayload);
              }}
              dictionary={dictionary}
              syncGaji={() => {
                setSyncSalaryModalOpen(true);
              }}
            />
          </TabsContent>

          {/* TAB ADJUSTMENT */}
          <TabsContent value="adjustment" className="mt-0">
            <AdjusmentTable
              columns={adjustmentColumns({
                viewDetailData: handleViewData,
                dictionary: dictionary,
                roleId: cookies?.roleId ?? "-",
              })}
              data={adjusmentData}
              addData={handleCreateData}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              metadata={metadata}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              isClearPayload={handleClearPayload}
              dictionary={dictionary}
              syncGaji={() => {}}
            />
          </TabsContent>
        </Tabs>
        <ModalDetailAttendance
          isOpen={isDetailModalOpen}
          title={title}
          onClose={() => setDetailModalOpen(false)}
          dictionary={dictionary}
          detailData={detailData}
        />

        <SyncSalaryModal
          isOpen={isSyncSalaryModalOpen}
          title="Sync Gaji"
          onClose={() => setSyncSalaryModalOpen(false)}
          isGetData={() =>
            getData(page, pageSize, debouncedSearch, filterPayload)
          }
          setIsLoading={setIsLoading}
        />

        <AdjustmentAttendanceModal
          isOpen={isAdjusmentModalOpen}
          title="Adjusment Absen"
          onClose={() => setAdjusmentModalOpen(false)}
          isGetData={() =>
            getData(page, pageSize, debouncedSearch, filterPayload)
          }
          setIsLoading={setIsLoading}
          attendanceData={detailAdjusmentData}
        />
      </div>
    </>
  );
}
