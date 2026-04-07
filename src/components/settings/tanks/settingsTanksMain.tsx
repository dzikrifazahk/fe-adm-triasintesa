"use client";
import { Card, CardContent } from "@/components/ui/card";
import { getDictionary } from "../../../../get-dictionary";
import { DataTable } from "./data-table";
import { columns } from "./column";
import { useContext, useEffect, useState } from "react";
import { IMeta } from "@/types/common";
import useDebounce from "@/utils/useDebouncy";
import { useLoading } from "@/context/loadingContext";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { ITank } from "@/types/tanks";
import { tanksService } from "@/services";
import Swal from "sweetalert2";
import { ModalUpsertTanks } from "./modalTanks";

export default function SettingsTanksMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_tanks"];
}) {
  const { setIsLoading } = useLoading();
  const { isMobile } = useContext(MobileContext);

  const [data, setData] = useState<ITank[]>([]);
  const [detailData, setDetailData] = useState<ITank | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalOpenPermission, setModalOpenPermission] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<
    "create" | "edit" | "detail" | null
  >(null);

  const [id, setId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string,
  ): Promise<ITank[]> => {
    let filterParams: Record<string, any> = {};

    if (pageSize || page) {
      filterParams = { page: page, limit: pageSize };
    }

    filterParams.search = search;

    const { data } = await tanksService.getTanks(filterParams);
    setData(data.data);
    setMetadata(data.meta);

    return data.data;
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
    const { data } = await tanksService.getTank(id);

    setDetailData(data);
    setId(id);
  };

  const handleDetailData = async (id: string) => {
    await handleGetData(id);
    setTitle("Detail Role");
    setModalType("detail");
    
    toggleModal();
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
        try {
          setIsLoading(true);
  
          const response = await tanksService.deleteTank(id);
          getData();
  
          setIsLoading(false);
  
          Swal.fire({
            icon: "success",
            title: "Success menghapus data tank",
            toast: true,
            position: "top-right",
            showConfirmButton: false,
            timer: 2000,
          });

        } catch {
          Swal.fire({
            icon: "error",
            title: "Gagal menghapus data tank",
            toast: true,
            position: "top-right",
            showConfirmButton: false,
            timer: 2000,
          });
          setIsLoading(false);
        }
      }
    });
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const clearInput = () => {
    setModalOpen(false);
    setId("");
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

  const handleIsGetData = async () => {
    setIsLoading(true);
    await getData(page, pageSize, debouncedSearch);
    setIsLoading(false);
  };

  return (
    <>
      <div className="w-full h-full">
        <Card className="h-full">
          <CardContent>
            <DataTable
              columns={columns({
                deleteData: handleDeleteData,
                editData: handleEditData,
                dictionary,
                viewDetailData: handleDetailData,
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

        <ModalUpsertTanks
          isOpen={isModalOpen}
          title={title}
          type={modalType || "create"}
          detailData={detailData || null}
          onClose={toggleModal}
          isGetData={handleIsGetData}
        />
      </div>
    </>
  );
}
