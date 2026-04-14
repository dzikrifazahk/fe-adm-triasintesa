"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getDictionary } from "../../../../get-dictionary";
import { DataTable } from "./data-table";
import { columns } from "./column";
import { useEffect, useState } from "react";
import { IMeta } from "@/types/common";
import useDebounce from "@/utils/useDebouncy";
import { useLoading } from "@/context/loadingContext";
import { IInventoryLocations } from "@/types/inventory-locations";
import { inventoryLocationsService } from "@/services";
import Swal from "sweetalert2";
import { ModalUpsertInventoryLocations } from "./modalInventoryLocations";

export default function InventoryLocationsMain({
  dictionary,
}: {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["inventory_location_page_dic"];
}) {
  const { setIsLoading } = useLoading();

  const [data, setData] = useState<IInventoryLocations[]>([]);
  const [detailData, setDetailData] = useState<IInventoryLocations | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<
    "create" | "edit" | "detail" | null
  >(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metadata, setMetadata] = useState<IMeta>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);

  const getData = async (
    nextPage?: number,
    nextPageSize?: number,
    nextSearch?: string,
  ): Promise<IInventoryLocations[]> => {
    const filterParams: Record<string, any> = {
      page: nextPage ?? page,
      limit: nextPageSize ?? pageSize,
      search: nextSearch ?? debouncedSearch ?? "",
    };

    const response =
      await inventoryLocationsService.getInventoryLocations(filterParams);
    const responseData = response?.data ?? {};

    setData(responseData.data ?? []);
    setMetadata(responseData.meta);

    return responseData.data ?? [];
  };

  useEffect(() => {
    getData(page, pageSize, debouncedSearch);
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const handleGetData = async (locationId: string) => {
    const response =
      await inventoryLocationsService.getInventoryLocationById(locationId);

    setDetailData(response?.data ?? null);
  };

  const handleDetailData = async (locationId: string) => {
    await handleGetData(locationId);
    setTitle(dictionary?.modal?.detail_title ?? "Detail Inventory Location");
    setModalType("detail");
    toggleModal();
  };

  const handleCreateData = () => {
    setDetailData(null);
    setTitle(dictionary?.modal?.create_title ?? "Tambah Inventory Location");
    setModalType("create");
    toggleModal();
  };

  const handleEditData = async (locationId: string) => {
    await handleGetData(locationId);
    setTitle(dictionary?.modal?.edit_title ?? "Ubah Inventory Location");
    setModalType("edit");
    toggleModal();
  };

  const handleDeleteData = (locationId: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus inventory location ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        setIsLoading(true);
        await inventoryLocationsService.deleteInventoryLocation(locationId);
        await getData(page, pageSize, debouncedSearch);
        Swal.fire({
          icon: "success",
          title: "Success menghapus inventory location",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2000,
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus inventory location",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    });
  };

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  const handleSearchChange = (value: string) => setSearch(value);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
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
    <div className="h-full w-full">
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

      <ModalUpsertInventoryLocations
        isOpen={isModalOpen}
        title={title}
        type={modalType || "create"}
        detailData={detailData}
        onClose={toggleModal}
        isGetData={handleIsGetData}
      />
    </div>
  );
}
