"use client";

import { Modal } from "@/components/custom/modal";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { IAddOrUpdateInventoryItem, IInventoryItem } from "@/types/inventory-item";
import { useContext, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Globe, Pencil } from "lucide-react";
import { openSwal } from "@/lib/swal";
import { useLoading } from "@/context/loadingContext";
import { inventoryService, productService } from "@/services";

type Props = {
  isOpen: boolean;
  title: string;
  type: "create" | "edit" | "detail";
  detailData?: IInventoryItem | null;
  onClose: () => void;
  onCancel?: () => void;
  isGetData?: () => void;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const CATALOG_MAX_SIZE = 2_000_000;
const IMAGE_MAX_SIZE = 5_000_000;

export function ModalUpsertInventoryItems({
  isOpen,
  title,
  type,
  detailData,
  onClose,
  onCancel,
  isGetData,
}: Props) {
  const { isMobile } = useContext(MobileContext);
  const { setIsLoading } = useLoading();

  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [uom, setUom] = useState("");
  const [category, setCategory] = useState("");
  const [unitPrice, setUnitPrice] = useState("0");
  const [isDetailEditing, setIsDetailEditing] = useState(false);

  // Company profile / public URL fields
  const [isPublicActive, setIsPublicActive] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState("");
  const [catalogFile, setCatalogFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setItemCode(detailData?.itemCode ?? "");
    setItemName(detailData?.itemName ?? "");
    setUom(detailData?.uom ?? "");
    setCategory(detailData?.category ?? "");
    setUnitPrice(String(detailData?.unitPrice ?? 0));
    setIsPublicActive(detailData?.isPublicActive ?? false);
    setSlug(detailData?.slug ?? "");
    setSlugTouched(Boolean(detailData?.slug));
    setExcerpt(detailData?.excerpt ?? "");
    setContent(detailData?.content ?? "");
    setFeaturedFile(null);
    setCatalogFile(null);
    setIsDetailEditing(false);
  }, [detailData, isOpen]);

  useEffect(() => {
    if (!featuredFile) {
      setFeaturedPreview("");
      return;
    }
    const url = URL.createObjectURL(featuredFile);
    setFeaturedPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [featuredFile]);

  const isReadOnly = type === "detail" && !isDetailEditing;
  const isEditMode = type === "edit" || (type === "detail" && isDetailEditing);

  const clearInput = () => {
    setItemCode("");
    setItemName("");
    setUom("");
    setCategory("");
    setUnitPrice("0");
    setIsPublicActive(false);
    setSlug("");
    setSlugTouched(false);
    setExcerpt("");
    setContent("");
    setFeaturedFile(null);
    setCatalogFile(null);
    setIsDetailEditing(false);
    onClose();
  };

  const handleItemNameChange = (value: string) => {
    setItemName(value);
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
      openSwal({
        icon: "error",
        title: "Oops...",
        position: "top-right",
        toast: true,
        text: "Hanya file JPEG, PNG, atau WEBP yang diperbolehkan.",
      });
      return;
    }

    if (file.size > IMAGE_MAX_SIZE) {
      openSwal({
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
      openSwal({
        icon: "error",
        title: "Oops...",
        position: "top-right",
        toast: true,
        text: "Hanya file PDF yang diperbolehkan.",
      });
      return;
    }

    if (file.size > CATALOG_MAX_SIZE) {
      openSwal({
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

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (type === "detail" && !isDetailEditing) return;

    if (isPublicActive && !slug.trim()) {
      openSwal({
        icon: "error",
        title: "Slug wajib diisi jika Public URL aktif",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    openSwal({
      icon: "warning",
      text: isEditMode
        ? "Apakah anda ingin mengubah item?"
        : "Apakah anda ingin menambahkan item?",
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        setIsLoading(true);

        const payload: IAddOrUpdateInventoryItem = {
          itemCode,
          itemName,
          uom: uom || undefined,
          category: category || undefined,
          unitPrice: Number(unitPrice || 0),
          isPublicActive,
          slug: slug.trim() ? slugify(slug) : undefined,
          excerpt: excerpt,
          content: content,
        };

        if (featuredFile) {
          const formData = new FormData();
          formData.append("featuredImage", featuredFile);
          const uploadResponse = await productService.uploadFeaturedImage(formData);
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

        if (isEditMode) {
          await inventoryService.updateInventoryItem(String(detailData?.id), payload);
        } else {
          await inventoryService.createInventoryItem(payload);
        }

        await isGetData?.();
        openSwal({
          icon: "success",
          title: "Berhasil menyimpan item",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2000,
        });

        clearInput();
      } catch {
        openSwal({
          icon: "error",
          title: "Gagal menyimpan item",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2500,
        });
      } finally {
        setIsLoading(false);
      }
    });
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  const formatCurrency = (value?: number | null) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
  };

  const previewSrc = featuredPreview || detailData?.featuredImageBase64 || "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={`${isMobile ? "w-[95vw]" : "w-[760px]"}`}
      onSubmit={handleSubmit}
      onCancel={onCancel ?? onClose}
      showConfirmButton={type !== "detail" || isDetailEditing}
    >
      <div className="max-h-[85vh] overflow-y-auto p-5">
        <div className="flex flex-col gap-6">
          {type === "detail" && detailData && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Item Overview</h3>
                  <p className="text-sm text-slate-500">Informasi utama item yang sedang dipilih.</p>
                </div>

                {!isDetailEditing && (
                  <button
                    type="button"
                    onClick={() => setIsDetailEditing(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoCard label="Item Code" value={detailData.itemCode} />
                <InfoCard label="Item Name" value={detailData.itemName} />
                <InfoCard label="UOM" value={detailData.uom || "-"} />
                <InfoCard label="Category" value={detailData.category || "-"} />
                <InfoCard label="Harga Satuan" value={formatCurrency(detailData.unitPrice)} />
                <InfoCard label="Stock" value={detailData.stock ?? 0} />
                <InfoCard label="Status" value={detailData.isActive ? "active" : "inactive"} />
                <InfoCard
                  label="Public URL"
                  value={detailData.isPublicActive ? "Tampil di public URL" : "Tidak tampil"}
                />
                <InfoCard label="Slug" value={detailData.slug || "-"} />
                <InfoCard label="Created At" value={formatDate(detailData.createdAt)} />
                <InfoCard label="Updated At" value={formatDate(detailData.updatedAt)} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Item Code" required>
              <Input
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                placeholder="Masukkan kode item"
                disabled={isReadOnly}
                required
              />
            </Field>

            <Field label="Item Name" required>
              <Input
                value={itemName}
                onChange={(e) => handleItemNameChange(e.target.value)}
                placeholder="Masukkan nama item"
                disabled={isReadOnly}
                required
              />
            </Field>

            <Field label="UOM">
              <Input
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                placeholder="PCS"
                disabled={isReadOnly}
              />
            </Field>

            <Field label="Category">
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="CONTAINER"
                disabled={isReadOnly}
              />
            </Field>

            <Field label="Harga Satuan" required>
              <Input
                type="number"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="35000"
                disabled={isReadOnly}
                required
              />
            </Field>
          </div>

          {/* Public URL / Company Profile section */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-iprimary-blue/10 text-iprimary-blue">
                  <Globe className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Public URL (Company Profile)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Jika aktif, item ini akan muncul sebagai produk di halaman public
                    company profile.
                  </p>
                </div>
              </div>
              <Switch
                checked={isPublicActive}
                onCheckedChange={setIsPublicActive}
                disabled={isReadOnly}
              />
            </div>

            {isPublicActive && (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Slug" required>
                  <Input
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="nama-produk"
                    disabled={isReadOnly}
                  />
                </Field>

                <Field label="Ringkasan (Excerpt)">
                  <Input
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Ringkasan singkat produk"
                    disabled={isReadOnly}
                  />
                </Field>

                <Field label="Gambar Produk" className="md:col-span-2">
                  <Input
                    type="file"
                    accept=".jpeg,.jpg,.png,.webp"
                    onChange={handleFeaturedChange}
                    disabled={isReadOnly}
                  />
                  {previewSrc && (
                    <img
                      src={previewSrc}
                      alt="Featured preview"
                      className="mt-2 max-h-52 w-full rounded-md border object-contain"
                    />
                  )}
                </Field>

                <Field label="Catalog PDF" className="md:col-span-2">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleCatalogChange}
                    disabled={isReadOnly}
                  />
                  {catalogFile ? (
                    <div className="text-xs text-slate-600">File terpilih: {catalogFile.name}</div>
                  ) : detailData?.catalog ? (
                    <div className="text-xs text-slate-600">Catalog saat ini: {detailData.catalog}</div>
                  ) : null}
                </Field>

                <Field label="Konten" className="md:col-span-2">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    placeholder="Deskripsi lengkap produk untuk halaman public"
                    disabled={isReadOnly}
                  />
                </Field>
              </div>
            )}
          </div>

          {type === "detail" && !isDetailEditing ? (
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Tutup</Button>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value || "-"}</div>
    </div>
  );
}
