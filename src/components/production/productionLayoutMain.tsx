"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  FaAngleLeft,
  FaAngleRight,
  FaArrowDownWideShort,
  FaPlus,
} from "react-icons/fa6";
import { DataTable } from "./data-table";
import { IProject } from "@/types/project";
import { productionPlanService, projectService } from "@/services";
import { IMeta } from "@/types/common";
import { useWorkspaceContext } from "@/context/workspaceContext";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import useDebounce from "@/utils/useDebouncy";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
// import { ModalFilterWorkspace } from "@/components/modals/workspace/modalFilterWorkspace";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { DateRangeCustom } from "../custom/dateRangeCustom";
import { getDictionary } from "../../../get-dictionary";
import { IProductionPlan } from "@/types/production";
import { Badge } from "../ui/badge";

export default function ProductionLayoutMain({
  children,
  dictionary,
}: {
  children: React.ReactNode;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["production_page_dic"];
}) {
  /* ---------- mobile detection ---------- */
  const { isMobile } = useContext(MobileContext);

  /* ---------- states ---------- */
  const [data, setData] = useState<IProductionPlan[]>([]);
  const [metadata, setMetadata] = useState<IMeta>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalProjectOpen, setIsModalProjectOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "detail">(
    "create",
  );
  const [detailData, setDetailData] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(false);

  const { isCollapsed, setIsCollapsed } = useWorkspaceContext();

  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  /* ---------- filter modal ---------- */
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterPayload, setFilterPayload] = useState("");

  /* ---------- skip initial render refs ---------- */
  const isFirstSearchRender = useRef(true);
  const isFirstDateRender = useRef(true);

  /* ---------- API calls ---------- */
  const getData = async (
    user_id?: string,
    page?: number,
    pageSize?: number,
    search?: string,
    selectedDate?: DateRange,
    payload?: any,
  ) => {
    try {
      setLoading(true);

      let queryParams: Record<string, any> = {};

      if (pageSize || page) {
        queryParams.page = page;
        queryParams.limit = pageSize;
      }

      queryParams.search = search;

      if (selectedDate?.from && selectedDate?.to) {
        queryParams.date = `[${format(
          selectedDate.from,
          "yyyy-MM-dd",
        )}, ${format(selectedDate.to, "yyyy-MM-dd")}]`;
      }

      if (payload) {
        queryParams = { ...queryParams, ...payload };
      }

      const { data } =
        await productionPlanService.getProductionPlans(queryParams);
      setData(data.data);
      setMetadata(data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- initial fetch ---------- */
  useEffect(() => {
    getData("", page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- fetch on search debounce ---------- */
  useEffect(() => {
    if (isFirstSearchRender.current) {
      isFirstSearchRender.current = false;
      return;
    }

    setPage(1);
    getData("", 1, pageSize, debouncedSearch, selectedDateRange, filterPayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  /* ---------- fetch on date change ---------- */
  useEffect(() => {
    if (isFirstDateRender.current) {
      isFirstDateRender.current = false;
      return;
    }

    setPage(1);
    getData("", 1, pageSize, search, selectedDateRange, filterPayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateRange]);

  /* ---------- pagination handlers ---------- */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getData("", newPage, pageSize, search, selectedDateRange, filterPayload);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    getData("", 1, newPageSize, search, selectedDateRange, filterPayload);
  };

  /* ---------- CRUD handlers (create/edit/delete) ---------- */
  const handleCreateProductionPlan = () => {
    setModalType("create");
    setIsModalProjectOpen(true);
  };

  const handleEditProject = async (id: string) => {
    setModalType("edit");
    const response = await projectService.getProject(id);
    setDetailData(response);
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

        getData("", page, pageSize, search, selectedDateRange, filterPayload);
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

  /* ---------- filter handlers ---------- */
  const handleOpenModalFilter = () => setIsFilterModalOpen(true);

  /* ---------- layout classes ---------- */
  const layoutWrapper = `flex h-full min-h-0 w-full flex-col gap-3 overflow-x-hidden ${
    !isMobile ? "xl:flex-row" : ""
  }`;

  const sidePanelWidth =
    isCollapsed && !isMobile
      ? "w-full xl:w-16"
      : "w-full xl:w-[360px] 2xl:w-[400px]";

  return (
    <div className="bg-card flex h-full min-h-0 w-full min-w-0 rounded-lg border p-2 shadow">
      <div className="h-full min-h-0 w-full">
        <div className={layoutWrapper}>
          <div
            className={`${sidePanelWidth} order-1 flex shrink-0 flex-col rounded-lg border border-[#E4E4E4] bg-white p-3 transition-all duration-300 max-xl:h-auto max-xl:overflow-visible xl:min-h-0 xl:overflow-y-auto`}
          >
            <div className="flex justify-between items-center">
              <div
                className={
                  isCollapsed || isMobile ? "hidden" : "text-lg font-bold"
                }
              >
                {dictionary.title}
              </div>

              {!isMobile && (
                <Button
                  onClick={() => setIsCollapsed((prev) => !prev)}
                  className="w-8 h-8 flex items-center justify-center bg-iprimary-blue border-2 border-secondary text-white rounded-full hover:bg-iprimary-blue/90 transition-all cursor-pointer"
                >
                  {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
                </Button>
              )}
            </div>

            {!isCollapsed && !isMobile && (
              <>
                {[
                  ["#D1E0FF", "Planned"],
                  ["#FFBE58", "In Progress"],
                  ["#21EB21", "Completed"],
                  ["#FF0000", "Cancel"],
                ].map(([clr, lbl]) => (
                  <div key={lbl} className="flex items-center gap-2">
                    <Badge
                      className="h-4 w-2"
                      style={{ background: clr, borderColor: clr }}
                    />
                    <span className="text-sm">{lbl}</span>
                  </div>
                ))}
              </>
            )}

            <div className="mt-3 w-full">
              <Button
                className="w-full rounded-lg bg-iprimary-blue cursor-pointer hover:bg-iprimary-blue/90 flex items-center justify-center gap-2"
                onClick={handleCreateProductionPlan}
              >
                {!isCollapsed || isMobile ? (
                  "Tambah Production Plan"
                ) : (
                  <FaPlus />
                )}
              </Button>
            </div>

            <div id="filter" className="mt-2 flex flex-col gap-2">
              {(!isCollapsed || isMobile) && (
                <>
                  <Button
                    className="cursor-pointer border border-iprimary-blue items-center h-auto flex justify-between text-sm"
                    onClick={handleOpenModalFilter}
                    variant="outline"
                  >
                    <span>Filter Berdasarkan</span>
                    <FaArrowDownWideShort className="text-iprimary-blue" />
                  </Button>

                  <DateRangeCustom
                    value={selectedDateRange}
                    onChange={setSelectedDateRange}
                    widthButton="w-full"
                    borderColor="border border-iprimary-blue"
                    placeHolder="Silahkan Pilih Tanggal"
                    className="cursor-pointer"
                  />
                </>
              )}
            </div>
            {!isCollapsed && (
              <DataTable
                data={data}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                metadata={metadata}
                loadingTable={loading}
                editData={handleEditProject}
                deleteData={handleDeleteProject}
              />
            )}
          </div>
          <div className="order-2 h-auto min-h-[520px] w-full min-w-0 overflow-x-auto rounded-lg max-xl:block xl:h-full xl:min-h-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
