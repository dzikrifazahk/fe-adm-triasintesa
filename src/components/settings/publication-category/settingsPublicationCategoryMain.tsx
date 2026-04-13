"use client";
import { DataTable } from "./data-table";
import { useContext, useEffect, useState } from "react";
import { columns } from "./column";

import Swal from "sweetalert2";

import useDebounce from "@/utils/useDebouncy";
import { getDictionary } from "../../../../get-dictionary";
import { Modal } from "@/components/custom/modal";
import { useLoading } from "@/context/loadingContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import {
  IPublicationCategory,
  IPublicationCategoryUpsert,
} from "@/types/publication-category";
import { publicationCategoryService } from "@/services";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

type PaginationMeta = {
  totalItems?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export default function SettingsPublicationCategoryMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_publication_category"];
}) {
  const { setIsLoading } = useLoading();
  const { isMobile } = useContext(MobileContext);

  const [data, setData] = useState<IPublicationCategory[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<"create" | "edit" | null>(null);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta>();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string
  ): Promise<IPublicationCategory[]> => {
    let filterParams: Record<string, unknown> = {};

    if (pageSize || page) {
      filterParams = { page: page, limit: pageSize };
    }

    if (search) {
      filterParams.search = search;
    }

    const response = await publicationCategoryService.getCategories(filterParams);
    const payload = response.data || {};

    setData(payload.data || []);
    setMeta(payload.meta || undefined);

    return payload.data || [];
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


  const handleCreateData = () => {
    setTitle(dictionary?.title_create ?? "Tambah Kategori");
    setModalType("create");
    setSlugTouched(false);
    toggleModal();
  };

  const handleEditData = (category: IPublicationCategory) => {
    setId(category.id);
    setName(category.name || "");
    setSlug(category.slug || "");
    setDescription(category.description || "");
    setSlugTouched(true);
    setTitle(dictionary?.title_edit ?? "Ubah Kategori");
    setModalType("edit");
    toggleModal();
  };

  const handleDeleteData = (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus kategori ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          await publicationCategoryService.deleteCategory(id);
          await getData(page, pageSize, debouncedSearch);

          Swal.fire({
            icon: "success",
            title: "Kategori berhasil dihapus",
            toast: true,
            position: "top-right",
            showConfirmButton: false,
            timer: 2000,
          });
        } catch {
          Swal.fire({
            icon: "error",
            title: "Gagal menghapus kategori",
            toast: true,
            position: "top-right",
            showConfirmButton: false,
            timer: 2000,
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: IPublicationCategoryUpsert = {
      name,
      slug,
    };

    if (description.trim().length > 0) {
      payload.description = description;
    }

    const text =
      modalType === "edit"
        ? "Apakah anda ingin mengubah kategori?"
        : "Apakah anda ingin menambahkan kategori?";

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

        if (modalType === "edit") {
          await publicationCategoryService.updateCategory(id, payload);
        } else {
          await publicationCategoryService.createCategory(payload);
        }

        await getData(page, pageSize, debouncedSearch);

        Swal.fire({
          icon: "success",
          title: "Success",
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

  const clearInput = () => {
    setModalOpen(false);
    setId("");
    setName("");
    setSlug("");
    setDescription("");
    setSlugTouched(false);
  };

  const handleSearchChange = (val: string) => setSearch(val);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getData(newPage, pageSize, debouncedSearch);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    getData(page, size, debouncedSearch);
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

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value);
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
          <div>
            <span>
              Nama <span className="text-red-500">*</span>
            </span>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div>
            <span>
              Slug <span className="text-red-500">*</span>
            </span>
            <Input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
            />
          </div>

          <div>
            <span>Deskripsi</span>
            <Textarea
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
              dictionary,
            })}
            data={data}
            addData={handleCreateData}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            lastPage={meta?.totalPages ?? 1}
            onSearchChange={handleSearchChange}
            dictionary={dictionary}
            isGetData={handleRefreshData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
