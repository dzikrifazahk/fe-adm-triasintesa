"use client";
import { Card, CardContent } from "@/components/ui/card";
import { getDictionary } from "../../../../get-dictionary";
import { Label } from "@/components/ui/label";
import { projectService, userService } from "@/services";
import Swal from "sweetalert2";
import { useContext, useEffect, useState } from "react";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import { ICountingProject, IProject } from "@/types/project";
import { Circle } from "lucide-react";
import { IUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { FaArrowRotateLeft, FaFilter } from "react-icons/fa6";
import { ProjectSectionCards } from "./projectSectionCard";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { ModalFilterProjectDashboard } from "./modalFilterProjectDashboard";
import { useLoading } from "@/context/loadingContext";
import { ProjectsTable } from "./data-table";
import { columns } from "./column";
import { IMeta } from "@/types/common";
import { getUser } from "@/services/base.service";
import ModalDetailProject from "@/components/settings/projects/projects/modalDetailProject";

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
    button_show_real_cost: "Show Real Cost",
    button_hide_real_cost: "Hide Real Cost",
    search_budget_placeholder: "Search Budget",
  },
  column_filter: "Column Filter",
};

export default function ProjectDashboardMain({}: Props) {
  const { isMobile } = useContext(MobileContext);
  const { setIsLoading } = useLoading();

  const [projects, setProjects] = useState<ComboboxItem<IProject>[]>([]);
  const [isPopoverProjectOpen, setIsPopoverProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ComboboxItem<IProject> | null>(null);

  const [users, setUsers] = useState<ComboboxItem<IProject>[]>([]);
  const [isPopoverUsersOpen, setIsPopoverUsersOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] =
    useState<ComboboxItem<IProject> | null>(null);

  const [isOpenModalFilter, setIsOpenModalFilter] = useState(false);

  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [countingData, setCountingData] = useState<ICountingProject>();

  const [filterPayload, setFilterPayload] = useState<any>({});

  const [projectsData, setProjectsData] = useState<IProject[]>([]);
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

    if (selectedProject?.value) {
      payload.project = selectedProject.value;
    } else {
      delete payload.project;
    }

    if (selectedUsers?.value) {
      payload.marketing_id = selectedUsers.value;
    } else {
      delete payload.marketing_id;
    }

    return payload;
  };

  const getProjectsFilter = async (search?: string) => {
    const params = search ? { search } : (undefined as any);
    try {
      const { data } = await projectService.getAllProjects(params);
      setProjects(
        data.map((e: IProject) => ({
          value: e.id,
          label: e.name,
          icon: Circle,
        }))
      );
    } catch {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Gagal mendapatkan data proyek",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const getUsersFilter = async (search?: string) => {
    try {
      const params = search ? { search } : (undefined as any);
      const { data } = await userService.getUsers(params);
      setUsers(
        data.map((e: IUser) => ({
          value: e.id,
          label: e.name,
          icon: Circle,
        }))
      );
    } catch {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Gagal mendapatkan data pengguna",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const getCounting = async (payloadOverride?: any) => {
    const finalPayload = payloadOverride ?? buildFinalPayload();

    const response = await projectService.getCountingProject(finalPayload);
    setCountingData(response);
  };

  const getProjects = async (payloadOverride?: any) => {
    const finalPayload = payloadOverride ?? buildFinalPayload();

    const { data, meta } = await projectService.getProjects(finalPayload);
    setProjectsData(data);
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
      await Promise.all([getCounting(finalPayload), getProjects(finalPayload)]);
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
    setSelectedProject(null);
    setSelectedUsers(null);
    setPage(1);

    try {
      setIsLoading(true);

      await Promise.all([getCounting({}), getProjects({})]);
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
    getProjectsFilter();
    getUsersFilter();
    const user = getUser();
    setCookies(user);
    const payload = {
      request_status_owner: 2,
    };
    getProjects(payload);
    getCounting(payload);
    // handleIsClearPayload();
  }, []);

  return (
    <>
      <div className="w-full h-full gap-5 flex flex-col">
        {/* FILTER BAR ATAS */}
        <Card className="ml-16 mt-5 mr-16">
          <CardContent>
            <div className="flex w-full gap-2 items-end flex-wrap">
              <div className="flex flex-col gap-2 w-full md:flex-1">
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
              </div>

              <div className="flex gap-2 justify-end w-full md:w-auto">
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
        <ProjectSectionCards data={countingData} />

        {/* TABLE PROJECTS */}
        <div className="w-full pl-5 pr-5">
          <ProjectsTable
            columns={columns({
              viewDetailData: handleViewData,
              cookies: cookies,
            })}
            data={projectsData}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            metadata={metadata}
            isClearPayload={handleIsClearPayload}
          />
        </div>

        {/* MODAL FILTER ADVANCED */}
        <ModalFilterProjectDashboard
          isOpen={isOpenModalFilter}
          onClose={() => setIsOpenModalFilter(false)}
          title="Advance Filter"
          onSubmit={handleFilterChange}
          isClearPayload={() => handleIsClearPayload()}
          width={`${isMobile ? "w-[90vw]" : "w-[30vw]"} `}
          defaultValueProjectStatus="1"
        />
      </div>

      {/* MODAL DETAIL PROJECT */}
      {isModalDetailOpen && (
        <ModalDetailProject
          dictionary={dictionary}
          projectId={selectedProjectId || ""}
          isOpen={isModalDetailOpen}
          title="Detail Proyek"
          onClose={() => setIsModalDetailOpen(false)}
          isGetData={handleIsGetData}
        />
      )}
    </>
  );
}
