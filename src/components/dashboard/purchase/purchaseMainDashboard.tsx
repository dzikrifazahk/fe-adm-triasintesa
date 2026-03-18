"use client";
import { Card, CardContent } from "@/components/ui/card";
import { getDictionary } from "../../../../get-dictionary";
import { purchaseService } from "@/services";
import Swal from "sweetalert2";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaArrowRotateLeft, FaFilter } from "react-icons/fa6";
import { PurchaseSectionCard } from "./purchaseSectionCard";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { useLoading } from "@/context/loadingContext";
import { columns } from "./column";
import { IMeta } from "@/types/common";
import { getUser } from "@/services/base.service";
import { DataTable } from "./data-table";
import { IPurchase, IPurchaseCounting } from "@/types/purchase";
import { ModalFilterPurchaseDashboard } from "./modalFilterPurchaseDashboard";

interface Props {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["dashboard"];
}

const dictionary = {
  title: "Settings Projects",
  description:
    "List of Projects, Budgeting, and Workload (click to view detail project)",
  project_description: "Track your projects progress percentage with the data.",
  title_project_detail: "Budgeting And Workload",
  description_project_detail: "Budgeting And Workload Detail",
  projects: {
    button_add_project: "Add Project",
    search_project_placeholder: "Search Project",
  },
  budgeting: {
    title: "Budgeting",
    description: "List of Budgeting",
    button_add_budget: "Add Budget",
    search_budget_placeholder: "Search Budget",
  },
  column_filter: "Column Filter",
};

export default function PurchaseDashboardMain({}: Props) {
  const { isMobile } = useContext(MobileContext);
  const { setIsLoading } = useLoading();
  const [isOpenModalFilter, setIsOpenModalFilter] = useState(false);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [countingData, setCountingData] = useState<IPurchaseCounting>();

  const [filterPayload, setFilterPayload] = useState<any>({});

  const [purchaseData, setPurchaseData] = useState<IPurchase[]>([]);
  const [metadata, setMetadata] = useState<IMeta>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [cookies, setCookies] = useState<any>(null);

  const buildFinalPayload = () => {
    const payload: any = { ...(filterPayload || {}) };

    if (Array.isArray(payload.date) && payload.date.length === 2) {
      payload.date = `[${payload.date
        .map((d: string) => `'${d}'`)
        .join(", ")}]`;
    }

    return payload;
  };

  const getCounting = async (payloadOverride?: any) => {
    const finalPayload = payloadOverride ?? buildFinalPayload();

    const { data } = await purchaseService.getCountingPurchase(finalPayload);
    setCountingData(data);
  };

  const getPurchase = async (payloadOverride?: any) => {
    const finalPayload = payloadOverride ?? buildFinalPayload();

    const { data, meta } = await purchaseService.getPurchases(finalPayload);
    setPurchaseData(data);
    setMetadata(meta);
  };

  const handleFilterChange = (payload: any) => {
    setFilterPayload(payload || {});
    setIsOpenModalFilter(false);
  };

  const handleApplyFilter = async () => {
    const finalPayload = buildFinalPayload();

    try {
      setIsLoading(true);
      await Promise.all([getCounting(finalPayload), getPurchase(finalPayload)]);
      Swal.fire({
        icon: "success",
        title: "Filter diterapkan",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Gagal menerapkan filter",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleIsClearPayload = async () => {
    setFilterPayload({});
    setPage(1);

    try {
      setIsLoading(true);

      await Promise.all([getCounting({}), getPurchase({})]);
      Swal.fire({
        icon: "success",
        title: "Filter direset",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Gagal mereset filter",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewData = async (id: string) => {
    setSelectedProjectId(id);
    setIsModalDetailOpen(true);
  };

  const handleIsGetData = async () => {
    await handleApplyFilter();
  };

  useEffect(() => {
    const user = getUser();
    setCookies(user);
    getCounting();
    getPurchase();
  }, []);

  return (
    <>
      <div className="w-full h-full gap-5 flex flex-col">
        {/* FILTER BAR ATAS */}
        <Card className="ml-16 mt-5 mr-16">
          <CardContent className="w-full">
            <div className="flex w-full gap-2 items-end flex-wrap">
              {/* <div className="flex flex-col gap-2 w-full md:flex-1">
                <Label>Pilih Project</Label>
                <ComboboxPopoverCustom
                  data={projects}
                  selectedItem={selectedProject}
                  onSelect={setSelectedProject}
                  isOpen={isPopoverProjectOpen}
                  onOpenChange={setIsPopoverProjectOpen}
                  placeholder="Cari Proyek"
                  onInputChange={(q) => getProjectsFilter(q)}
                  height="h-10"
                />
              </div>

              <div className="flex flex-col gap-2 w-full md:flex-1">
                <Label>Pilih Pengguna</Label>
                <ComboboxPopoverCustom
                  data={users}
                  selectedItem={selectedUsers}
                  onSelect={setSelectedUsers}
                  isOpen={isPopoverUsersOpen}
                  onOpenChange={setIsPopoverUsersOpen}
                  placeholder="Cari Pengguna"
                  onInputChange={(q) => getUsersFilter(q)}
                  height="h-10"
                />
              </div> */}

              <div className="flex gap-2 justify-end w-full md:w-full">
                <Button
                  variant="outline"
                  className="shrink-0 h-10 cursor-pointer"
                  onClick={() => setIsOpenModalFilter(true)}
                  aria-label="Advanced filter"
                >
                  <FaFilter />
                </Button>
                <Button
                  variant="outline"
                  className="shrink-0 h-10 cursor-pointer"
                  onClick={handleIsClearPayload}
                  aria-label="Reset filter"
                >
                  <FaArrowRotateLeft />
                </Button>
                <Button
                  variant="default"
                  className="shrink-0 h-10 cursor-pointer bg-iprimary-blue hover:bg-iprimary-blue-tertiary text-white"
                  onClick={handleApplyFilter}
                  aria-label="Apply filter"
                >
                  Apply Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KARTU RINGKASAN */}
        <PurchaseSectionCard data={countingData} />

        {/* TABLE PROJECTS */}
        <div className="w-full pl-5 pr-5">
          <DataTable
            columns={columns({
              viewDetailData: handleViewData,
              cookies: cookies,
            })}
            data={purchaseData}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            metadata={metadata}
            isClearPayload={handleIsClearPayload}
            onFilterChange={handleFilterChange}
          />
        </div>

        <ModalFilterPurchaseDashboard
          isOpen={isOpenModalFilter}
          onClose={() => setIsOpenModalFilter(false)}
          title="Advance Filter"
          onSubmit={handleFilterChange}
          isClearPayload={() => handleIsClearPayload()}
          width={`${isMobile ? "w-[90vw]" : "w-[30vw]"} `}
        />
      </div>

      {/* {isModalDetailOpen && (
        <ModalDetailProject
          dictionary={dictionary}
          projectId={selectedProjectId || ""}
          isOpen={isModalDetailOpen}
          title="Detail Proyek"
          onClose={() => setIsModalDetailOpen(false)}
          isGetData={handleIsGetData}
        />
      )} */}
    </>
  );
}
