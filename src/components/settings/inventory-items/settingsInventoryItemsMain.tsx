"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getDictionary } from "../../../../get-dictionary";
import { DataTable } from "./data-table";
import { columns } from "./column";
import { useEffect, useState } from "react";
import useDebounce from "@/utils/useDebouncy";
import { useLoading } from "@/context/loadingContext";
import { IInventoryItem } from "@/types/inventory-item";
import { inventoryService } from "@/services";
import Swal from "sweetalert2";
import { ModalUpsertInventoryItems } from "./modalInventoryItems";

type PaginationMeta = {
  totalItems?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  current_page?: number;
  last_page?: number;
};

export default function SettingsInventoryItemsMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["inventory_item_page_dic"];
}) {
  const { setIsLoading } = useLoading();

  const [data, setData] = useState<IInventoryItem[]>([]);
  const [detailData, setDetailData] = useState<IInventoryItem | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<"create" | "edit" | "detail" | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);

  const getData = async (
    nextPage?: number,
    nextPageSize?: number,
    nextSearch?: string,
  ): Promise<IInventoryItem[]> => {
    const pageParam = nextPage ?? page;
    const sizeParam = nextPageSize ?? pageSize;
    const searchParam = nextSearch ?? debouncedSearch ?? "";

    const params: Record<string, unknown> = {
      page: pageParam,
      limit: sizeParam,
      isActive: true,
    };

    if (searchParam.trim()) {
      params.itemName = searchParam.trim();
    }

    const response = await inventoryService.getInventoryItems(params);
    const payload = response?.data ?? response ?? {};

    setData(payload.data ?? []);
    setMeta(payload.meta ?? undefined);

    return payload.data ?? [];
  };

  useEffect(() => {
    getData(page, pageSize, debouncedSearch);
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const handleGetData = async (itemId: string) => {
    const response = await inventoryService.getInventoryItemById(itemId);
    setDetailData(response?.data ?? response ?? null);
  };

  const handleDetailData = async (itemId: string) => {
    await handleGetData(itemId);
    setTitle(dictionary?.modal?.detail_title ?? "Detail Master Item");
    setModalType("detail");
    toggleModal();
  };

  const handleCreateData = () => {
    setDetailData(null);
    setTitle(dictionary?.modal?.create_title ?? "Tambah Master Item");
    setModalType("create");
    toggleModal();
  };

  const handleEditData = async (itemId: string) => {
    await handleGetData(itemId);
    setTitle(dictionary?.modal?.edit_title ?? "Ubah Master Item");
    setModalType("edit");
    toggleModal();
  };

  const handleDeleteData = (itemId: string) => {
    Swal.fire({
      icon: "warning",
      text: dictionary?.toast?.delete_confirm ?? "Apakah anda ingin menonaktifkan item ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        setIsLoading(true);
        await inventoryService.deleteInventoryItem(itemId);
        await getData(page, pageSize, debouncedSearch);
        Swal.fire({
          icon: "success",
          title: dictionary?.toast?.delete_success ?? "Success menonaktifkan item",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2000,
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: dictionary?.toast?.delete_error ?? "Gagal menonaktifkan item",
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
      title: dictionary?.toast?.refresh_success ?? "Data berhasil di refresh",
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
            lastPage={meta?.totalPages ?? meta?.last_page ?? 1}
            onSearchChange={handleSearchChange}
            dictionary={dictionary}
            isGetData={handleRefreshData}
          />
        </CardContent>
      </Card>

      <ModalUpsertInventoryItems
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
