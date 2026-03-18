"use client";

import { useContext, useEffect, useState } from "react";
import { getDictionary } from "../../../get-dictionary";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { IProject } from "@/types/project";
import { IMeta } from "@/types/common";
import useDebounce from "@/utils/useDebouncy";
import { DateRange } from "react-day-picker";
import { useWorkspaceContext } from "@/context/workspaceContext";
import { format } from "date-fns";
import { projectService } from "@/services";
import Swal from "sweetalert2";
import { FaAngleLeft, FaAngleRight, FaFilter, FaPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { DateRangeCustom } from "../custom/dateRangeCustom";
import { DataTable } from "./data-table";
import { columns } from "./column";
import { ModalProjects } from "../settings/projects/projects/modalProjects";
import { ModalFilterProject } from "../settings/projects/projects/modalFilterProject";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["menu_bar_settings"];
  children: React.ReactNode;
}

export function WorkspaceLayoutMain({ dictionary, children }: Props) {
  const { isMobile } = useContext(MobileContext);
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<IProject[]>([]);
  const [metadata, setMetadata] = useState<IMeta>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalProjectOpen, setIsModalProjectOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "detail">(
    "create"
  );
  const [detailData, setDetailData] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(false);

  const { isCollapsed, setIsCollapsed } = useWorkspaceContext();

  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterPayload, setFilterPayload] = useState("");

  const getProjectsByUser = async (
    user_id?: string,
    page?: number,
    pageSize?: number,
    search?: string,
    selectedDate?: DateRange,
    payload?: any
  ) => {
    try {
      setLoading(true);
      let queryParams: Record<string, any> = {};

      if (pageSize || page) {
        queryParams.page = page;
        queryParams.per_page = pageSize;
      }
      queryParams.search = search;

      if (selectedDate?.from && selectedDate?.to) {
        queryParams.date = `[${format(
          selectedDate.from,
          "yyyy-MM-dd"
        )}, ${format(selectedDate.to, "yyyy-MM-dd")}]`;
      }
      if (payload) queryParams = { ...queryParams, ...payload };

      const res = await projectService.getProjects(queryParams);
      setData(Array.isArray(res.data) ? res.data : []);
      setMetadata(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProjectsByUser("", page, pageSize);
    setMounted(true);
  }, []);

  useEffect(() => {
    getProjectsByUser(
      "",
      page,
      pageSize,
      debouncedSearch,
      selectedDateRange,
      filterPayload
    );
  }, [debouncedSearch]);

  useEffect(() => {
    if (selectedDateRange) {
      getProjectsByUser(
        "",
        page,
        pageSize,
        search,
        selectedDateRange,
        filterPayload
      );
    }
  }, [selectedDateRange]);

  // -------- Handlers --------
  const handleCreateProject = () => {
    setModalType("create");
    setIsModalProjectOpen(true);
  };

  const handleEditProject = async (id: string) => {
    setModalType("edit");
    const response = await projectService.getProject(id);
    setDetailData(JSON.parse(JSON.stringify(response)));
    setIsModalProjectOpen(true);
  };

  const handleDeleteProject = async (id: string) => {
    const confirm = await Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus Proyek ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        const res = await projectService.deleteProject(id);
        Swal.fire({
          icon: res.status_code === 200 ? "success" : "error",
          title: res.message,
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
        getProjectsByUser(
          "",
          page,
          pageSize,
          search,
          selectedDateRange,
          filterPayload
        );
      } catch {
        Swal.fire({
          icon: "error",
          title: "Terjadi Kesalahan Saat Menghapus Data",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenModalFilter = () => setIsFilterModalOpen(true);

  const handleSubmitFilter = (payload: any) => {
    setFilterPayload(payload);
    getProjectsByUser("", page, pageSize, search, selectedDateRange, payload);
    setIsFilterModalOpen(false);
  };

  const handleIsClearPayload = () => {
    setFilterPayload("");
    getProjectsByUser("", page, pageSize);
    Swal.fire({
      icon: "success",
      title: "Filter Berhasil Dihapus",
      position: "top-right",
      toast: true,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getProjectsByUser(
      "",
      newPage,
      pageSize,
      search,
      selectedDateRange,
      filterPayload
    );
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    getProjectsByUser(
      "",
      page,
      newPageSize,
      search,
      selectedDateRange,
      filterPayload
    );
  };

  // -------- Layout --------
  const layoutWrapper = isMobile
    ? "flex flex-col gap-3 h-full min-h-0 min-w-0"
    : "flex gap-3 h-full min-h-0 min-w-0 justify-center";

  const sidePanelWidth = isMobile ? "w-full" : isCollapsed ? "w-16" : "w-1/3";

  const tableColumns = columns({
    deleteData: handleDeleteProject,
    editData: handleEditProject,
  });

  return (
    <div className="flex h-full w-full min-h-0 min-w-0">
      <div className={layoutWrapper + " flex-1 min-w-0"}>
        {/* ------------ Side Panel ------------ */}
        <div
          className={`
            ${sidePanelWidth}
            flex flex-col h-full min-h-0
            rounded-lg border bg-background shadow-sm
            transition-all duration-300 dark:bg-card
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <h2
              className={`${
                isCollapsed || isMobile ? "hidden" : "text-lg font-bold"
              }`}
            >
              Status Proyek
            </h2>

            {!isMobile && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsCollapsed((prev) => !prev)}
                className={`${isCollapsed ? "w-7 h-7" : ""} cursor-pointer`}
              >
                {isCollapsed ? (
                  <FaAngleRight className={`${isCollapsed ? "w-4 h-4" : ""}`} />
                ) : (
                  <FaAngleLeft className={`${isCollapsed ? "w-4 h-4" : ""}`} />
                )}
              </Button>
            )}
          </div>

          {/* Content (scrollable) */}
          <div className="flex-1 min-h-0 flex flex-col gap-4 p-4 overflow-y-auto [-webkit-overflow-scrolling:touch] overscroll-contain">
            {/* Badges */}
            {!isCollapsed && !isMobile && (
              <div className="flex flex-col gap-1">
                {[
                  ["bg-amber-400", "Pending"],
                  ["bg-green-500", "Open"],
                  ["bg-blue-200", "Closed"],
                  ["bg-red-500", "Rejected / Cancel"],
                ].map(([cls, lbl]) => (
                  <div key={lbl} className="flex items-center gap-2">
                    <Badge className={`${cls} w-3 h-3 rounded-full`} />
                    <span className="text-sm">{lbl}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <Button
              className="w-full bg-iprimary-blue cursor-pointer hover:bg-iprimary-blue-tertiary"
              onClick={handleCreateProject}
              size="sm"
            >
              {!isCollapsed || isMobile ? "Tambah Proyek" : <FaPlus />}
            </Button>

            {(!isCollapsed || isMobile) && (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="flex items-center justify-between cursor-pointer"
                  onClick={handleOpenModalFilter}
                >
                  <span>Filter Berdasarkan</span>
                  <FaFilter />
                </Button>

                <DateRangeCustom
                  value={selectedDateRange}
                  onChange={setSelectedDateRange}
                  widthButton="w-full"
                  borderColor="border border-primary"
                  placeHolder="Silahkan Pilih Tanggal"
                />

                <Input
                  type="text"
                  placeholder="Cari Nama Proyek"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}

            {/* Data Table */}
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-h-0">
                <DataTable
                  columns={tableColumns}
                  data={data}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  metadata={metadata}
                  loadingTable={loading}
                />
              </div>
            )}
          </div>
        </div>

        {/* ------------ Main Content ------------ */}
        <div className="h-full w-full min-h-0 min-w-0 overflow-auto">
          {children}
        </div>

        {/* ------------ Modal ------------ */}
        <ModalProjects
          isOpen={isModalProjectOpen}
          title={modalType === "create" ? "Tambah Proyek" : "Edit Proyek"}
          modalType={"create"}
          onClose={() => setIsModalProjectOpen(false)}
          isGetData={() =>
            getProjectsByUser(
              "",
              page,
              pageSize,
              search,
              selectedDateRange,
              filterPayload
            )
          }
          detailData={detailData}
          isLoading={loading}
        />
        <ModalFilterProject
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          title="Advance Filter"
          onSubmit={handleSubmitFilter}
          isClearPayload={handleIsClearPayload}
        />
      </div>
    </div>
  );
}
