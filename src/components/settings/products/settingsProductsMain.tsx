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
import { IProduct, IProductUpsert } from "@/types/product";
import { productService } from "@/services";
import { Switch } from "@/components/ui/switch";

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

const CATALOG_MAX_SIZE = 2_000_000;

export default function SettingsProductsMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_products"];
}) {
  const { setIsLoading } = useLoading();
  const { isMobile } = useContext(MobileContext);

  const [data, setData] = useState<IProduct[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<"create" | "edit" | null>(null);

  const [id, setId] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [slugTouched, setSlugTouched] = useState(false);
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string>("");
  const [featuredBase64, setFeaturedBase64] = useState<string | null>(null);
  const [catalogFile, setCatalogFile] = useState<File | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta>();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string
  ): Promise<IProduct[]> => {
    let filterParams: Record<string, unknown> = {};

    if (pageSize || page) {
      filterParams = { page: page, limit: pageSize };
    }

    if (search) {
      filterParams.search = search;
    }

    const response = await productService.getProducts(filterParams);
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

  useEffect(() => {
    if (!featuredFile) {
      setFeaturedPreview("");
      return;
    }
    const url = URL.createObjectURL(featuredFile);
    setFeaturedPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [featuredFile]);

  const handleCreateData = () => {
    setTitle(dictionary?.title_create ?? "Tambah Produk");
    setModalType("create");
    setSlugTouched(false);
    toggleModal();
  };

  const handleEditData = (product: IProduct) => {
    setId(product.id);
    setProductTitle(product.title || "");
    setSlug(product.slug || "");
    setContent(product.content || "");
    setIsActive(product.isActive ?? true);
    setSlugTouched(true);
    setFeaturedFile(null);
    setFeaturedBase64(product.featuredImageBase64 || null);
    setCatalogFile(null);
    setTitle(dictionary?.title_edit ?? "Ubah Produk");
    setModalType("edit");
    toggleModal();
  };

  const handleDeleteData = (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus produk ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          await productService.deleteProduct(id);
          await getData(page, pageSize, debouncedSearch);

          Swal.fire({
            icon: "success",
            title: "Produk berhasil dihapus",
            toast: true,
            position: "top-right",
            showConfirmButton: false,
            timer: 2000,
          });
        } catch {
          Swal.fire({
            icon: "error",
            title: "Gagal menghapus produk",
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

    const payload: IProductUpsert = {
      title: productTitle,
      slug,
      isActive,
    };

    if (content.trim().length > 0) {
      payload.content = content;
    }

    const text =
      modalType === "edit"
        ? "Apakah anda ingin mengubah produk?"
        : "Apakah anda ingin menambahkan produk?";

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

        if (featuredFile) {
          const formData = new FormData();
          formData.append("featuredImage", featuredFile);
          const uploadResponse = await productService.uploadFeaturedImage(
            formData
          );
          const uploadData = uploadResponse.data || {};
          if (uploadData.path) {
            payload.featuredImage = uploadData.path;
          }
        }

        if (catalogFile) {
          const formData = new FormData();
          formData.append("catalog", catalogFile);
          const uploadResponse = await productService.uploadCatalog(formData);
          const uploadData = uploadResponse.data || {};
          if (uploadData.path) {
            payload.catalog = uploadData.path;
          }
        }

        if (modalType === "edit") {
          await productService.updateProduct(id, payload);
        } else {
          await productService.createProduct(payload);
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
    setProductTitle("");
    setSlug("");
    setContent("");
    setIsActive(true);
    setSlugTouched(false);
    setFeaturedFile(null);
    setFeaturedPreview("");
    setFeaturedBase64(null);
    setCatalogFile(null);
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

  const handleTitleChange = (value: string) => {
    setProductTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value);
  };

  const handleFeaturedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFeaturedFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        position: "top-right",
        toast: true,
        text: "Hanya file JPEG, PNG, atau WEBP yang diperbolehkan.",
      });
      return;
    }

    if (file.size > 5_000_000) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        position: "top-right",
        toast: true,
        text: "Ukuran file maksimal 5MB.",
      });
      return;
    }

    setFeaturedFile(file);
  };

  const handleCatalogChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setCatalogFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        position: "top-right",
        toast: true,
        text: "Hanya file PDF yang diperbolehkan.",
      });
      return;
    }

    if (file.size > CATALOG_MAX_SIZE) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        position: "top-right",
        toast: true,
        text: "Ukuran file maksimal 2MB.",
      });
      return;
    }

    setCatalogFile(file);
  };

  const previewSrc = featuredPreview || featuredBase64 || "";

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Modal
        isOpen={isModalOpen}
        onClose={clearInput}
        title={title}
        width={`${isMobile ? "w-[90vw]" : "w-[40vw]"}`}
        onSubmit={handleSubmit}
        onCancel={clearInput}
      >
        <div className="flex flex-col gap-4 p-5">
          <div>
            <span>
              {dictionary?.field?.title ?? "Judul"}{" "}
              <span className="text-red-500">*</span>
            </span>
            <Input
              value={productTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>

          <div>
            <span>
              {dictionary?.field?.slug ?? "Slug"}{" "}
              <span className="text-red-500">*</span>
            </span>
            <Input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <span>{dictionary?.field?.featured_image ?? "Gambar"}</span>
            <Input
              type="file"
              accept=".jpeg,.jpg,.png,.webp"
              className="file-input file-input-bordered file-input-primary w-full"
              onChange={handleFeaturedChange}
            />
            {previewSrc && (
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold">Preview</div>
                <img
                  src={previewSrc}
                  alt="Featured preview"
                  className="w-full max-h-64 object-contain rounded-md border"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span>{dictionary?.field?.catalog_pdf ?? "Catalog PDF"}</span>
            <Input
              type="file"
              accept=".pdf"
              className="file-input file-input-bordered file-input-primary w-full"
              onChange={handleCatalogChange}
            />
            {catalogFile && (
              <div className="text-xs text-gray-600">
                {dictionary?.field?.selected_file ?? "File terpilih"}:{" "}
                {catalogFile.name}
              </div>
            )}
          </div>

          <div>
            <span>{dictionary?.field?.content ?? "Konten"}</span>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span>{dictionary?.field?.status ?? "Status Aktif"}</span>
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

