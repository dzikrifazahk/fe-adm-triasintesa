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
import { IPublicationPost, IPublicationPostUpsert } from "@/types/publication-post";
import { publicationCategoryService, publicationService } from "@/services";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type CategoryOption = {
  value: string;
  label: string;
};

const NO_CATEGORY = "__none__";

const normalizeDateInput = (value?: string | Date | null) => {
  if (!value) return "";
  if (typeof value === "string") {
    return value.includes("T") ? value.split("T")[0] : value;
  }
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  return "";
};

export default function SettingsPublicationMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_publication"];
}) {
  const { setIsLoading } = useLoading();
  const { isMobile } = useContext(MobileContext);

  const [data, setData] = useState<IPublicationPost[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [modalType, setModalType] = useState<"create" | "edit" | null>(null);

  const [id, setId] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>(NO_CATEGORY);
  const [isActive, setIsActive] = useState(true);
  const [publishedAt, setPublishedAt] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string>("");
  const [featuredBase64, setFeaturedBase64] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta>();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);

  const getData = async (
    page?: number,
    pageSize?: number,
    search?: string
  ): Promise<IPublicationPost[]> => {
    let filterParams: Record<string, any> = {};

    if (pageSize || page) {
      filterParams = { page: page, limit: pageSize };
    }

    if (search) {
      filterParams.search = search;
    }

    const response = await publicationService.getPosts(filterParams);
    const payload = response.data || {};

    setData(payload.data || []);
    setMeta(payload.meta || undefined);

    return payload.data || [];
  };

  const getCategoryOptions = async () => {
    const response = await publicationCategoryService.getCategoryOptions({
      page: 1,
      limit: 1000,
    });
    const payload = response.data || {};
    setCategories(payload.data || []);
  };

  useEffect(() => {
    getData();
    getCategoryOptions();
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
    setTitle(dictionary?.title_create ?? "Tambah Post");
    setModalType("create");
    setSlugTouched(false);
    toggleModal();
  };

  const handleEditData = (post: IPublicationPost) => {
    setId(post.id);
    setPostTitle(post.title || "");
    setSlug(post.slug || "");
    setExcerpt(post.excerpt || "");
    setContent(post.content || "");
    setCategoryId(post.categoryId || NO_CATEGORY);
    setIsActive(post.isActive ?? true);
    setPublishedAt(normalizeDateInput(post.publishedAt));
    setSlugTouched(true);
    setFeaturedFile(null);
    setFeaturedBase64(post.featuredImageBase64 || null);
    setTitle(dictionary?.title_edit ?? "Ubah Post");
    setModalType("edit");
    toggleModal();
  };

  const handleDeleteData = (id: string) => {
    Swal.fire({
      icon: "warning",
      text: "Apakah anda ingin menghapus post ini?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          await publicationService.deletePost(id);
          await getData(page, pageSize, debouncedSearch);

          Swal.fire({
            icon: "success",
            title: "Post berhasil dihapus",
            toast: true,
            position: "top-right",
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (e) {
          Swal.fire({
            icon: "error",
            title: "Gagal menghapus post",
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

    const text =
      modalType === "edit"
        ? "Apakah anda ingin mengubah post?"
        : "Apakah anda ingin menambahkan post?";

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

        const payload: IPublicationPostUpsert = {
          title: postTitle,
          slug,
          isActive,
        };

        if (excerpt.trim().length > 0) payload.excerpt = excerpt;
        if (content.trim().length > 0) payload.content = content;
        if (publishedAt) payload.publishedAt = publishedAt;

        if (categoryId && categoryId !== NO_CATEGORY) {
          payload.categoryId = categoryId;
        } else if (categoryId === NO_CATEGORY) {
          payload.categoryId = null;
        }

        if (featuredFile) {
          const formData = new FormData();
          formData.append("featuredImage", featuredFile);
          const uploadResponse = await publicationService.uploadFeaturedImage(
            formData
          );
          const uploadData = uploadResponse.data || {};
          if (uploadData.path) {
            payload.featuredImage = uploadData.path;
          }
        }

        if (modalType === "edit") {
          await publicationService.updatePost(id, payload);
        } else {
          await publicationService.createPost(payload);
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
    setPostTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCategoryId(NO_CATEGORY);
    setIsActive(true);
    setPublishedAt("");
    setSlugTouched(false);
    setFeaturedFile(null);
    setFeaturedPreview("");
    setFeaturedBase64(null);
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
    setPostTitle(value);
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

  const previewSrc = featuredPreview || featuredBase64 || "";

  return (
    <div className="w-full h-full">
      <Modal
        isOpen={isModalOpen}
        onClose={clearInput}
        title={title}
        width={`${isMobile ? "w-[90vw]" : "w-[45vw]"}`}
        onSubmit={handleSubmit}
        onCancel={clearInput}
      >
        <div className="flex flex-col gap-4 p-5">
          <div>
            <span>
              Judul <span className="text-red-500">*</span>
            </span>
            <Input
              value={postTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
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
            <span>Kategori</span>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Kategori</SelectLabel>
                  <SelectItem value={NO_CATEGORY}>Tanpa kategori</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <span>Excerpt</span>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>

          <div>
            <span>Content</span>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span>Featured Image</span>
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

          <div>
            <span>Published At</span>
            <Input
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <span>Status Aktif</span>
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
