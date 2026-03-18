"use client";

import { useLoading } from "@/context/loadingContext";
import { useContext, useEffect, useState } from "react";
import { getDictionary } from "../../../../get-dictionary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectsTable } from "./projects/data-table";
import Swal from "sweetalert2";
import useDebounce from "@/utils/useDebouncy";
import { IProject, IProjectLocation } from "@/types/project";
import { IMeta } from "@/types/common";
import { columns } from "./projects/column";
import { budgetColumns } from "./budget/column";
import { taskColumns } from "./task/column";
import { budgetService, projectService, taskService } from "@/services";
import { ModalProjects } from "./projects/modalProjects";
import { BudgetTable } from "./budget/data-table";
import { TasksTable } from "./task/data-table";
import { getUser } from "@/services/base.service";
import { IBudget } from "@/types/budget";
import { ITasks } from "@/types/task";
import { ModalTask } from "./task/modalTask";
import { BudgetModal } from "./budget/modalBudget";
import { ModalProjectLocation } from "./projects/modalProjectLocation";
import ModalDetailProject from "./projects/modalDetailProject";
import { PaymentClientModal } from "./projects/paymentClient";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ModalFilterProject } from "./projects/modalFilterProject";
import { MobileContext } from "@/hooks/use-mobile-ssr";

type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;

export default function SettingsProjectsMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnOf<typeof getDictionary>>["settings_projects"];
}) {
  const { setIsLoading } = useLoading();
  const { isMobile } = useContext(MobileContext);

  // modal & detail states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalBudgetOpen, setIsModalBudgetOpen] = useState(false);
  const [isModalTaskOpen, setIsModalTaskOpen] = useState(false);
  const [isModalLocationOpen, setIsModalLocationOpen] = useState(false);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [openModalPayment, setOpenModalPayment] = useState(false);

  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [modalTypeTask, setModalTypeTask] = useState<"create" | "edit">(
    "create"
  );
  const [modalBudget, setModalBudget] = useState<"create" | "edit">("create");

  // data states
  const [data, setData] = useState<IProject[]>([]);
  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [tasks, setTasks] = useState<ITasks[]>([]);

  // detail entities
  const [detailData, setDetailData] = useState<IProject | null>(null);
  const [detailTaskData, setDetailTaskData] = useState<ITasks | null>(null);
  const [detailBudgetData, setDetailBudgetData] = useState<IBudget | null>(
    null
  );
  const [detailLocationData, setDetailLocationData] = useState<
    IProjectLocation[]
  >([]);

  // meta & UI
  const [metadata, setMetadata] = useState<IMeta>();
  const [loading, setLoading] = useState(false);
  const [cookies, setCookies] = useState<any>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);

  // paging & filter
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const [filterPayload, setFilterPayload] = useState<any>("");
  const [isOpenModalFilter, setIsOpenModalFilter] = useState(false);
  const [isShowRealCost, setIsShowRealCost] = useState(false);

  // mode & selection
  const [tableMode, setTableMode] = useState<"project" | "task" | "budget">(
    "project"
  );
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // arah slide: +1 = ke kanan (masuk task/budget), -1 = ke kiri (kembali ke project)
  const [slideDir, setSlideDir] = useState<1 | -1>(1);

  // kompatibilitas props lama
  const [opendBudgetingAndWorkload, setOpendBudgetingAndWorkload] =
    useState("");

  // ====== Animation presets ======
  const EASE = [0.22, 0.61, 0.36, 1] as const;
  const TABLE_VARIANTS: Variants = {
    initial: (dir: 1 | -1) => ({
      opacity: 0,
      x: dir * 40,
      filter: "blur(6px)",
    }),
    animate: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.28, ease: EASE },
    },
    exit: (dir: 1 | -1) => ({
      opacity: 0,
      x: -dir * 40,
      filter: "blur(6px)",
      transition: { duration: 0.22, ease: EASE },
    }),
  };

  // ====== handlers ======
  const handleCreateData = (newVal: boolean, tableModal: string) => {
    if (tableModal === "project") {
      setModalType("create");
      setIsModalOpen(newVal);
    } else if (tableModal === "budget") {
      setModalBudget("create");
      setIsModalBudgetOpen(newVal);
    } else if (tableModal === "task") {
      setModalTypeTask("create");
      setIsModalTaskOpen(newVal);
    }
  };

  const handleEditData = async (id: string, tableModal: string) => {
    if (tableModal === "project") {
      setModalType("edit");
      await handleIsGetDetailProjectData(id);
      setIsModalOpen(true);
    }
    if (tableModal === "budget") {
      setModalBudget("edit");
      await handleIsGetDetailBudgetData(id);
      setIsModalBudgetOpen(true);
    }
    if (tableModal === "task") {
      setModalTypeTask("edit");
      await handleIsGetDetailTaskData(id);
      setIsModalTaskOpen(true);
    }
  };

  const handleViewData = async (id: string) => {
    setSelectedProjectId(id);
    setIsModalDetailOpen(true);
  };

  const handleIsGetData = async (tableModal: string) => {
    if (tableModal === "project") {
      setIsModalOpen(false);
      getData(page, pageSize, debouncedSearch, filterPayload);
    } else if (tableModal === "is_refresh_project") {
      setIsLoading(true);
      setIsModalOpen(false);
      await getData(page, pageSize, debouncedSearch, filterPayload);
      Swal.fire({
        icon: "success",
        title: "Data berhasil di refresh",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      setIsLoading(false);
    } else if (tableModal === "budget") {
      setIsModalBudgetOpen(false);
      if (selectedProjectId) getBudgets(selectedProjectId, page, pageSize);
    } else if (tableModal === "task") {
      setIsModalTaskOpen(false);
      if (selectedProjectId) getTasks(selectedProjectId, page, pageSize);
    }
  };

  const handleIsGetDetailProjectData = async (id: string) => {
    try {
      const { data } = await projectService.getProject(id);
      setDetailData(data[0]);
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

  const handleIsGetDetailBudgetData = async (id: string) => {
    try {
      const response = await budgetService.getBudget(id);
      setDetailBudgetData(response);
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

  const handleIsGetDetailLocationData = async (projectId: string) => {
    setIsLoading(true);
    try {
      const { data } = await projectService.getProjectLocations(projectId);
      setDetailLocationData(data);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleIsGetDetailTaskData = async (id: string) => {
    try {
      const { data } = await taskService.getTask(id);
      setDetailTaskData(data);
    } catch (error) {
      // console.log(error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (tableMode === "project") {
      getData(newPage, pageSize, debouncedSearch, filterPayload);
    } else if (tableMode === "budget" && selectedProjectId) {
      getBudgets(selectedProjectId, newPage, pageSize);
    } else if (tableMode === "task" && selectedProjectId) {
      getTasks(selectedProjectId, newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    if (tableMode === "project") {
      getData(page, newPageSize, debouncedSearch, filterPayload);
    } else if (tableMode === "budget" && selectedProjectId) {
      getBudgets(selectedProjectId, page, newPageSize);
    } else if (tableMode === "task" && selectedProjectId) {
      getTasks(selectedProjectId, page, newPageSize);
    }
  };

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string,
    payload?: any
  ) => {
    try {
      // setIsLoading(true);
      let filterParams: Record<string, any> = {};

      if (pageSize || page) {
        filterParams.page = page;
        filterParams.per_page = pageSize;
      }

      filterParams.search = search;

      if (payload) {
        filterParams = { ...filterParams, ...payload };
      }

      if (filterParams.date && Array.isArray(filterParams.date)) {
        filterParams.date = `[${filterParams.date.join(", ")}]`;
      }

      const response = await projectService.getProjects(filterParams);
      setData(response.data);
      setMetadata(response.meta);
      // setIsLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus Proyek ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#2a56b8",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const response = await projectService.deleteProject(id);
        getData(page, pageSize, debouncedSearch, filterPayload);
        if (response.status_code === 200) {
          setIsLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          setIsLoading(true);
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan ${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
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

  const handleDeleteTask = async (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus pekerjaan ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#2a56b8",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const response = await taskService.deleteTask(id);
        if (selectedProjectId) getTasks(selectedProjectId, page, pageSize);
        if (response.status_code === 200) {
          setLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          setIsLoading(false);
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan ${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
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

  const handleDeleteBudget = async (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus anggaran ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#2a56b8",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        const response = await budgetService.deleteBudget(id);
        if (selectedProjectId) getBudgets(selectedProjectId, page, pageSize);
        if (response.status_code === 200) {
          setLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          setLoading(false);
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan ${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
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

  const handleAcceptProject = async (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menyetujui Proyek ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#2a56b8",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        const response = await projectService.acceptProject(id);
        getData(page, pageSize, debouncedSearch, filterPayload);
        if (response.status_code === 200) {
          setLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          setLoading(false);
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan ${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } else if (result.isConfirmed === false) {
        Swal.fire({
          icon: "warning",
          title: "Batal Menyetujui Proyek",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleRejectProject = async (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menolak Proyek ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#2a56b8",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        const response = await projectService.rejectProject(id);
        getData(page, pageSize, debouncedSearch, filterPayload);
        if (response.status_code === 200) {
          setLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          setLoading(false);
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan ${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } else if (result.isConfirmed === false) {
        Swal.fire({
          icon: "warning",
          title: "Batal Menolak Data",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleCancelProject = async (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin membatalkan Proyek ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#2a56b8",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        const response = await projectService.cancelProject(id);
        getData(page, pageSize, debouncedSearch, filterPayload);
        if (response.status_code === 200) {
          setLoading(false);
          Swal.fire({
            icon: "success",
            title: `${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          setLoading(false);
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan ${response.message}`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } else if (result.isConfirmed === false) {
        Swal.fire({
          icon: "warning",
          title: "Batal Membatalkan Proyek",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleCloseProject = async (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menutup Proyek ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#2a56b8",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const response = await projectService.closeProject(id);
          getData(page, pageSize, debouncedSearch, filterPayload);
          if (response.status_code === 200) {
            setLoading(false);
            Swal.fire({
              icon: "success",
              title: `${response.message}`,
              position: "top-right",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
          }
        } catch {
          Swal.fire({
            icon: "error",
            title: `Terjadi Kesalahan`,
            position: "top-right",
            toast: true,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      } else if (result.isConfirmed === false) {
        Swal.fire({
          icon: "warning",
          title: "Batal Menutup Data",
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleSearchChange = (searchValue: string) => setSearch(searchValue);

  const handlePaymentClient = async (id: string) => {
    setOpenModalPayment(true);
    await handleIsGetDetailProjectData(id);
  };

  const handleFilterChange = (payload: any) => {
    setFilterPayload(payload);
    setIsOpenModalFilter(false);
    if (tableMode === "project")
      getData(page, pageSize, debouncedSearch, payload);
    setIsLoading(false);
    Swal.fire({
      icon: "success",
      title: "Berhasil Menerapkan Filter",
      position: "top-right",
      toast: true,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleIsClearPayload = () => {
    setFilterPayload("");
    if (tableMode === "project") {
      getData(1, pageSize);
      Swal.fire({
        icon: "success",
        title: "Filter Berhasil Dihapus",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const handleProjectId = (id: string | null) => {
    const pid = id || "";
    setSelectedProjectId(pid);
    setOpendBudgetingAndWorkload(pid);
  };

  const getBudgets = async (
    projectId: string,
    page?: number,
    pageSize?: number,
    isShowRealCost?: boolean
  ) => {
    let filterParams: Record<string, any> = {};
    if (projectId) filterParams.project_id = projectId;
    filterParams.page = page;
    filterParams.pageSize = pageSize;
    filterParams.show_real_cost = isShowRealCost;
    setLoadingBudget(true);
    try {
      const { data } = await budgetService.getBudgets(filterParams);
      setBudgets(data);
    } catch (error) {
    } finally {
      setLoadingBudget(false);
    }
  };

  const getTasks = async (
    projectId: string,
    page?: number,
    pageSize?: number
  ) => {
    let filterParams: Record<string, any> = {};
    if (projectId) filterParams.project_id = projectId;
    filterParams.page = page;
    filterParams.pageSize = pageSize;
    const { data } = await taskService.getTasks(filterParams);
    setTasks(data);
  };

  useEffect(() => {
    if (tableMode === "project") {
      getData(1, pageSize, debouncedSearch, filterPayload);
    }
  }, [debouncedSearch, filterPayload, tableMode]);

  useEffect(() => {
    setIsLoading(false);
    const user = getUser();
    setCookies(user);
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    if (tableMode === "budget") {
      getBudgets(selectedProjectId, page, pageSize, isShowRealCost);
    } else if (tableMode === "task") {
      getTasks(selectedProjectId, page, pageSize);
    }
  }, [selectedProjectId, tableMode, page, pageSize, isShowRealCost]);

  const handleTableMode = async (
    mode: "project" | "task" | "budget",
    projectId?: string
  ) => {
    setIsLoading(true);
    await handleIsGetDetailProjectData(projectId || "");
    setIsLoading(false);
    setSlideDir(mode === "project" ? -1 : 1);
    setTableMode(mode);
    if (projectId) {
      setSelectedProjectId(projectId);
      setOpendBudgetingAndWorkload(projectId);
    }
  };

  const handleLocationProject = async (projectId: string) => {
    setSelectedProjectId(projectId);
    await handleIsGetDetailLocationData(projectId);
    setIsModalLocationOpen(true);
  };

  return (
    <>
      <div className="w-full h-full">
        <div className="flex flex-col gap-2 h-full min-h-0">
          {/* Tombol kembali muncul hanya saat bukan mode project */}
          <AnimatePresence initial={false} mode="wait">
            {(tableMode === "task" || tableMode === "budget") && (
              <motion.div
                key="back-button"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                className="flex justify-end shrink-0"
              >
                <div className="flex justify-between w-full items-center bg-white p-2 border rounded-xl">
                  <div className="text-lg font-semibold text-gray-700 dark:text-white ml-4">
                    {detailData?.name ?? "Memuat nama proyek..."}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleTableMode("project")}
                    className="cursor-pointer"
                  >
                    ← Kembali ke daftar proyek
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Konten kartu yang berganti dengan animasi */}
          <AnimatePresence initial={false} mode="wait">
            {tableMode === "project" && (
              <motion.div
                key={`table-${tableMode}`}
                layout
                initial="initial"
                animate="animate"
                exit="exit"
                variants={TABLE_VARIANTS}
                custom={slideDir}
                transition={{ layout: { duration: 0.3 } }}
                className="flex-1 min-h-0"
              >
                <Card className="flex flex-col h-full">
                  {/* <CardHeader>
                    <CardTitle>{dictionary.title}</CardTitle>
                    <CardDescription>
                      {dictionary.project_description}
                    </CardDescription>
                  </CardHeader> */}
                  <CardContent className="flex-1 min-h-0 overflow-auto">
                    <ProjectsTable
                      columns={columns({
                        editData: handleEditData,
                        deleteData: handleDelete,
                        viewDetailData: handleViewData,
                        acceptProject: handleAcceptProject,
                        rejectProject: handleRejectProject,
                        closeProject: handleCloseProject,
                        payment: handlePaymentClient,
                        cancelProject: handleCancelProject,
                        locationProject: handleLocationProject,
                        cookies: cookies,
                        tableMode: handleTableMode,
                      })}
                      data={data}
                      isGetData={handleIsGetData}
                      addData={(e) => handleCreateData(e, "project")}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      metadata={metadata}
                      onSearchChange={handleSearchChange}
                      isClearPayload={handleIsClearPayload}
                      dictionary={dictionary}
                      projectId={handleProjectId}
                      onOpenFilter={() => setIsOpenModalFilter(true)}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {tableMode === "budget" && selectedProjectId && (
              <motion.div
                key={`table-${tableMode}-${selectedProjectId}`}
                layout
                initial="initial"
                animate="animate"
                exit="exit"
                variants={TABLE_VARIANTS}
                custom={slideDir}
                transition={{ layout: { duration: 0.3 } }}
                className="flex-1 min-h-0"
              >
                <Card className="flex flex-col h-full">
                  <CardHeader>
                    <CardTitle>{dictionary.title_project_detail}</CardTitle>
                    <CardDescription>
                      {dictionary.description_project_detail}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0 overflow-auto">
                    <BudgetTable
                      columns={budgetColumns({
                        editData: handleEditData,
                        deleteData: handleDeleteBudget,
                        viewDetailData: handleViewData,
                        acceptProject: handleAcceptProject,
                        rejectProject: handleRejectProject,
                        closeProject: handleCloseProject,
                        payment: handlePaymentClient,
                        cancelProject: handleCancelProject,
                        cookies: cookies,
                        isShowRealCost: isShowRealCost,
                      })}
                      data={budgets}
                      addData={(e) => handleCreateData(e, "budget")}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      metadata={metadata}
                      onSearchChange={handleSearchChange}
                      onFilterChange={handleFilterChange}
                      isClearPayload={handleIsClearPayload}
                      dictionary={dictionary}
                      isShowRealCost={isShowRealCost}
                      setIsShowRealCost={setIsShowRealCost}
                      isLoading={loadingBudget}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {tableMode === "task" && selectedProjectId && (
              <motion.div
                key={`table-${tableMode}-${selectedProjectId}`}
                layout
                initial="initial"
                animate="animate"
                exit="exit"
                variants={TABLE_VARIANTS}
                custom={slideDir}
                transition={{ layout: { duration: 0.3 } }}
                className="flex-1 min-h-0"
              >
                <Card className="flex flex-col h-full">
                  <CardHeader>
                    <CardTitle>Pekerjaan</CardTitle>
                    <CardDescription>
                      Pekerjaan yang ada di dalam proyek ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0 overflow-auto">
                    <TasksTable
                      columns={taskColumns({
                        editData: handleEditData,
                        deleteData: handleDeleteTask,
                        viewDetailData: handleViewData,
                        acceptProject: handleAcceptProject,
                        rejectProject: handleRejectProject,
                        closeProject: handleCloseProject,
                        payment: handlePaymentClient,
                        cancelProject: handleCancelProject,
                        cookies: cookies,
                      })}
                      data={tasks}
                      addData={(e) => handleCreateData(e, "task")}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      metadata={metadata}
                      onSearchChange={handleSearchChange}
                      onFilterChange={handleFilterChange}
                      isClearPayload={handleIsClearPayload}
                      dictionary={dictionary}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODALS */}
          {isModalOpen && (
            <ModalProjects
              isOpen={isModalOpen}
              title={modalType === "create" ? "Tambah Proyek" : "Edit Proyek"}
              modalType={modalType}
              onClose={() => setIsModalOpen(false)}
              isGetData={handleIsGetData}
              detailData={detailData}
              isLoading={loading}
              // setIsLoading={setLoading}
            />
          )}

          {isModalTaskOpen && (
            <ModalTask
              isOpen={isModalTaskOpen}
              title={
                modalTypeTask === "create"
                  ? "Tambah Pekerjaan"
                  : "Edit Pekerjaan"
              }
              modalType={modalTypeTask}
              onClose={() => setIsModalTaskOpen(false)}
              isGetData={handleIsGetData}
              detailData={detailTaskData}
              isLoading={loading}
              setIsLoading={setLoading}
              projectId={selectedProjectId}
            />
          )}

          {isModalBudgetOpen && (
            <BudgetModal
              isOpen={isModalBudgetOpen}
              title={
                modalType === "create" ? "Tambah Anggaran" : "Edit Anggaran"
              }
              modalType={modalBudget}
              onClose={() => setIsModalBudgetOpen(false)}
              isGetData={(tableModal: string) => handleIsGetData(tableModal)}
              detailData={detailBudgetData}
              isLoading={loading}
              setIsLoading={setLoading}
              projectId={selectedProjectId}
            />
          )}

          {isModalLocationOpen && (
            <ModalProjectLocation
              isOpen={isModalLocationOpen}
              title="Lokasi Proyek"
              onClose={() => setIsModalLocationOpen(false)}
              isGetData={handleIsGetDetailLocationData}
              detailData={detailLocationData}
              projectId={selectedProjectId || ""}
            />
          )}

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

          <PaymentClientModal
            title="Pembayaran Klien"
            isOpen={openModalPayment}
            onClose={() => setOpenModalPayment(false)}
            detailData={detailData ?? null}
            width="w-[90vw]"
            isGetData={handleIsGetDetailProjectData}
          />

          {/* Modal Filter */}
          <ModalFilterProject
            isOpen={isOpenModalFilter}
            onClose={() => setIsOpenModalFilter(false)}
            title="Advance Filter"
            onSubmit={handleFilterChange}
            isClearPayload={handleIsClearPayload}
            width={`${isMobile ? "w-[90vw]" : "w-[30vw]"} `}
          />
        </div>
      </div>
    </>
  );
}
