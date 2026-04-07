"use client";
import { DataTable } from "./data-table";
import { useContext, useEffect, useState } from "react";
import { columns } from "./column";

import Swal from "sweetalert2";

import { IMeta } from "@/types/common";
import axios from "axios";
import useDebounce from "@/utils/useDebouncy";
import { getDictionary } from "../../../../get-dictionary";
import { Modal } from "@/components/custom/modal";
import { useLoading } from "@/context/loadingContext";
import { Input } from "@/components/ui/input";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { Card, CardContent } from "@/components/ui/card";
import { IRole } from "@/types/role";
import { ModalSetRolePermission } from "./modalSetRolePermission";
import { roleService } from "@/services";

export default function SettingsRolesMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_roles"];
}) {
  const { setIsLoading } = useLoading();
  const { isMobile } = useContext(MobileContext);

  const [data, setData] = useState<IRole[]>([]);
  const [detailData, setDetailData] = useState<IRole | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalOpenPermission, setModalOpenPermission] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<
    "create" | "edit" | "detail" | "assignPermission" | null
  >(null);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [isSystem, setIsSystem] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string,
  ): Promise<IRole[]> => {
    let filterParams: Record<string, any> = {};

    if (pageSize || page) {
      filterParams = { page: page, per_page: pageSize };
    }

    filterParams.search = search;

    const response = await roleService.getRoles(filterParams);
    setData(response.data);
    setMetadata(response.meta);

    return response.data;
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getData(page, pageSize, debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleGetData = async (id: string) => {
    const { data } = await roleService.getRole(id);

    setId(id);
    setName(data.name || "");
    setDisplayName(data.displayName || "");
    setDescription(data.description || "");
    setIsSystem(data.isSystem || false);
    setDetailData(data);
  };

  const handleCreateData = () => {
    setTitle("Tambah Role");
    setModalType("create");
    toggleModal();
  };

  const handleEditData = async (id: string) => {
    await handleGetData(id);
    setTitle("Ubah Role");
    setModalType("edit");
    toggleModal();
  };

  const handleAssignPermission = async (data: IRole) => {
    await handleGetData(data.id);
    setTitle("Assign Permission");
    setModalType("assignPermission");
    setModalOpenPermission(true);
  };

  const handleDeleteData = (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus Role ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);

        const response = await roleService.deleteRole(id);
        getData();

        setIsLoading(false);

        Swal.fire({
          icon: response.status_code === 200 ? "success" : "error",
          title: "Success",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  // ================= SUBMIT =================
  const handleSubmit = () => {
    let payload: any = {};

    if (modalType === "edit") {
      payload = {
        displayName: displayName || null,
        description: description || null,
      };
    } else {
      payload = {
        name: name,
        displayName: displayName,
        description: description,
        isSystem: false,
      };
    }

    const text =
      modalType === "edit"
        ? "Apakah anda ingin mengubah Role?"
        : "Apakah anda ingin menambahkan Role?";

    Swal.fire({
      icon: "warning",
      text: text,
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (!result.isConfirmed) return clearInput();

      try {
        setIsLoading(true);

        const response =
          modalType === "edit"
            ? await roleService.updateRole(id, payload)
            : await roleService.createRole(payload);

        getData();

        Swal.fire({
          icon: "success",
          title: response.message,
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const message = e.response?.data?.message ?? "";

          Swal.fire({
            icon: "error",
            title: `Error: ${JSON.stringify(message)}`,
            toast: true,
            position: "top-right",
          });
        }
      } finally {
        setIsLoading(false);
        clearInput();
      }
    });

    toggleModal();
  };

  // ================= UTIL =================
  const clearInput = () => {
    setModalOpen(false);
    setId("");
    setName("");
    setDisplayName("");
    setDescription("");
    setIsSystem(false);
  };

  const handleSearchChange = (val: string) => setSearch(val);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getData(newPage, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    getData(page, size);
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    await getData(page, pageSize, debouncedSearch);
    setIsLoading(false);

    Swal.fire({
      icon: "success",
      title: "Data berhasil di refresh",
      toast: true,
      position: "top-right",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  return (
    <div className="w-full h-full">
      <Modal
        isOpen={isModalOpen}
        onClose={clearInput}
        title={title}
        width={`${isMobile ? "w-[90vw]" : "w-[35vw]"}`}
        onSubmit={handleSubmit}
        onCancel={clearInput}
      >
        <div className="flex flex-col gap-4 p-5">
          {/* NAME */}
          <div>
            <span>
              Role Code <span className="text-red-500">*</span>
            </span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={modalType === "edit"}
            />
          </div>

          {/* DISPLAY NAME */}
          <div>
            <span>
              Display Name <span className="text-red-500">*</span>
            </span>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <span>Description</span>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Card className="h-full">
        <CardContent>
          <DataTable
            columns={columns({
              deleteData: handleDeleteData,
              editData: handleEditData,
              assignPermission: handleAssignPermission,
              dictionary,
            })}
            data={data}
            addData={handleCreateData}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            metadata={metadata}
            onSearchChange={handleSearchChange}
            dictionary={dictionary}
            isGetData={handleRefreshData}
          />
        </CardContent>
      </Card>

      <ModalSetRolePermission
        dictionary={dictionary}
        isGetData={getData}
        isOpen={isModalOpenPermission}
        onClose={() => setModalOpenPermission(false)}
        modalType={modalType}
        detailData={detailData}
        title={title}
      />
    </div>
  );
}
