"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Modal } from "../custom/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import axios from "axios";

import { IContact } from "@/types/contact";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "../custom/comboboxProperCustom";
import {
  budgetService,
  contactService,
  projectService,
  purchaseService,
} from "@/services";
import { Circle } from "lucide-react";

import { normalizeRupiah, useCurrencyInput } from "@/utils/useCurrency";
import { formatCurrencyIDR } from "@/utils/currencyFormatter";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import { IProject } from "@/types/project";
import { IBudget } from "@/types/budget";
import { IEvidencePurchase, IPurchase } from "@/types/purchase";
import { format } from "date-fns";

interface Props {
  isOpen: boolean;
  title: string;
  modalType: "create" | "edit" | "activate";
  onClose: () => void;
  isGetData: () => void; // refresh table
  setIsLoading: (loading: boolean) => void;
  isCustomProject?: boolean;
  detailData?: IPurchase | null;
}

/** ---------- Types ---------- */
type ProductRow = {
  id: number;
  company_id: string;
  vendor: ComboboxItem<IContact> | null;
  product_name: string;
  harga: string; // raw numeric string
  stok: string; // raw digits
  ppn: string; // raw digits (percent)
  unit?: string;
};

/** ---------- Harga Input (uses useCurrencyInput) ---------- */
const HargaInput: React.FC<{
  value: string;
  onChange: (raw: string) => void;
  inputId?: string;
  placeholder?: string;
}> = ({ value, onChange, inputId, placeholder }) => {
  const { setValue, formattedValueWithRp, handleChange } = useCurrencyInput();

  React.useEffect(() => {
    setValue(value ?? "");
  }, [value, setValue]);

  const onLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    const rawOnly = e.target.value.replace(/[^0-9,]/g, "");
    onChange(rawOnly);
  };

  return (
    <Input
      id={inputId}
      value={formattedValueWithRp}
      onChange={onLocalChange}
      placeholder={placeholder ?? "e.g., 3000000"}
      inputMode="numeric"
    />
  );
};

/** ---------- Helpers mapping ---------- */
const mapDocTypeToCategoryId = (docType?: string): string => {
  if (!docType) return "";
  const upper = docType.toUpperCase();
  if (upper === "FLASH CASH") return "1";
  if (upper === "INVOICE") return "2";
  if (upper === "MAN POWER") return "3";
  if (upper === "EXPENSE") return "4";
  return ""; // unknown
};

const isImageLink = (url: string, typeFile?: string) => {
  if (typeFile === "1") return true; // backend marks '1' = image
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() || "";
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext);
};

export default function ModalAddPurchase({
  isOpen,
  title,
  onClose,
  modalType,
  isGetData,
  setIsLoading,
  isCustomProject = false,
  detailData,
}: Props) {
  const isMobile = useIsMobile();
  const params = useParams();
  const MAX_FILES = 3;
  const MAX_BYTES = 3 * 1024 * 1024; // 3 MB
  const ALLOWED_EXT = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "bmp",
    "pdf",
    "xlsx",
    "xls",
    "csv",
  ];

  /** ---------- Base Fields ---------- */
  const [purchaseId, setPurchaseId] = React.useState<string>(""); // 1: EVENT, 2: OPERATIONAL
  const [purchaseCategoryId, setPurchaseCategoryId] =
    React.useState<string>(""); // 1..4 via doc_type
  const [projectId, setProjectId] = React.useState<string>("");
  const [date, setDate] = React.useState<string>("");
  const [dueDate, setDueDate] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [remarks, setRemarks] = React.useState<string>("");
  const [purchaseEventType, setPurchaseEventType] = React.useState<string>("");
  const [po_no, setPoNo] = React.useState("");
  const [reff, setReff] = React.useState("");

  // Existing evidences (for edit/activate)
  const [existingEvidencePurchases, setExistingEvidencePurchases] =
    React.useState<IEvidencePurchase[]>([]);

  // Combobox sources
  const [projects, setProjects] = React.useState<ComboboxItem<IProject>[]>([]);
  const [selectedProject, setSelectedProject] =
    React.useState<ComboboxItem<IProject> | null>(null);
  const [projectPopoverOpen, setProjectPopoverOpen] =
    React.useState<boolean>(false);

  const [budgets, setBugdets] = React.useState<ComboboxItem<IProject>[]>([]);
  const [selectedBudget, setSelectedBudget] =
    React.useState<ComboboxItem<IProject> | null>(null);
  const [budgetPopoverOpen, setBudgetPopoverOpen] =
    React.useState<boolean>(false);

  const isEvent = purchaseId === "1";
  const isFlashCash = purchaseCategoryId === "1";
  React.useEffect(() => {
    if (!isEvent) setPurchaseEventType("");
  }, [isEvent]);

  /** ---------- Vendor data & popover ---------- */
  const [vendors, setVendors] = React.useState<ComboboxItem<IContact>[]>([]);
  const [isPopoverVendorOpen, setIsPopoverVendorOpen] = React.useState<
    Record<number, boolean>
  >({});
  const handleOpenVendorChange = (rowId: number, open: boolean) => {
    setIsPopoverVendorOpen((prev) => ({ ...prev, [rowId]: open }));
  };

  const getVendors = async (search?: string) => {
    try {
      const filter = search
        ? { search: search, contact_type: 1 }
        : { contact_type: 1 };
      const { data } = await contactService.getAllContacts(filter);
      const mapped: ComboboxItem<IContact>[] = (data ?? []).map(
        (e: IContact) => ({
          value: String(e.id),
          label: e.name,
          icon: Circle,
          payload: e,
        })
      );
      setVendors(mapped);
    } catch (e) {
      console.error("getVendors error:", e);
      setVendors([]);
    }
  };

  /** ---------- Projects/Budgets bootstrap ---------- */
  React.useEffect(() => {
    if (!isCustomProject && params?.workspace) {
      setProjectId(String(params.workspace));
      getBudgets();
    }
    if (isCustomProject) {
      getProjects();
    }
    getVendors();
  }, []);

  const getProjects = async (search?: string) => {
    const filter = search ? { search } : {};
    const { data } = await projectService.getAllProjects(filter);
    setProjects(
      data.map((e: IProject) => ({
        value: e.id,
        label: e.name,
        icon: Circle,
      }))
    );
  };

  const getBudgets = async (search?: string) => {
    const filter = search
      ? { search, project_id: params.workspace }
      : { project_id: params.workspace, type: 2 };

    const { data } = await budgetService.getAllBudget(filter);
    setBugdets(
      data.map((e: IBudget) => ({
        value: e.id,
        label: e.nama_budget,
        icon: Circle,
      }))
    );
  };

  /** ---------- File input validations ---------- */
  const [files, setFiles] = React.useState<File[] | null>(null);
  const [errorFiles, setErrorFiles] = React.useState<string | null>(null);

  const handleChangeFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const selected = Array.from(e.target.files ?? []);

    if (selected.length > MAX_FILES) {
      setErrorFiles(`Maksimal ${MAX_FILES} file.`);
      setFiles(null);
      e.currentTarget.value = "";
      return;
    }

    const tooBig = selected.filter((f) => f.size > MAX_BYTES);
    if (tooBig.length) {
      setErrorFiles(
        `Ukuran per file maksimal 3 MB. Terlalu besar: ${tooBig
          .map((f) => f.name)
          .join(", ")}`
      );
      setFiles(null);
      e.currentTarget.value = "";
      return;
    }

    const invalidType = selected.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      const isImage = f.type.startsWith("image/");
      const isPdf = f.type === "application/pdf";
      const isExcelMime =
        f.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        f.type === "application/vnd.ms-excel" ||
        f.type === "text/csv";
      const isAllowedExt = ALLOWED_EXT.includes(ext);
      return !(isImage || isPdf || isExcelMime || isAllowedExt);
    });

    if (invalidType.length) {
      setErrorFiles(
        `Hanya boleh upload file gambar, PDF, atau Excel/CSV. File tidak valid: ${invalidType
          .map((f) => f.name)
          .join(", ")}`
      );
      setFiles(null);
      e.currentTarget.value = "";
      return;
    }

    setErrorFiles(null);
    setFiles(selected);
  };

  /** ---------- Products (array) ---------- */
  const nextRowId = React.useRef<number>(1);
  const newRow = (): ProductRow => ({
    id: nextRowId.current++,
    company_id: "",
    vendor: null,
    product_name: "",
    unit: "",
    harga: "",
    stok: "",
    ppn: "",
  });
  const [products, setProducts] = React.useState<ProductRow[]>([newRow()]);

  const addProduct = () => setProducts((prev) => [...prev, newRow()]);
  const removeProduct = (idx: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateProduct = (
    idx: number,
    field: keyof ProductRow,
    value: string | ComboboxItem<IContact> | null
  ) => {
    setProducts((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;

        if (field === "stok" || field === "ppn") {
          const raw =
            typeof value === "string" ? value.replace(/[^\d]/g, "") : "";
          return { ...p, [field]: raw } as ProductRow;
        }

        if (field === "harga") {
          return { ...p, harga: typeof value === "string" ? value : "" };
        }

        if (typeof value === "string") {
          return { ...p, [field]: value } as ProductRow;
        }

        return p;
      })
    );
  };

  const handleVendorChange = (
    idx: number,
    vendor: ComboboxItem<IContact> | null
  ) => {
    setProducts((prev) =>
      prev.map((p, i) =>
        i === idx
          ? {
              ...p,
              vendor,
              company_id: vendor?.value ? String(vendor.value) : "",
            }
          : p
      )
    );
  };

  /** ---------- Hydrate when editing/activating ---------- */
  React.useEffect(() => {
    if (
      (modalType === "edit" || modalType === "activate") &&
      detailData &&
      isOpen
    ) {
      // type & category
      setPurchaseId(String(detailData?.purchase_type?.id ?? ""));
      setPurchaseCategoryId(mapDocTypeToCategoryId(detailData?.doc_type));

      // existing evidences
      setExistingEvidencePurchases(
        detailData?.file_bukti_pembelian_product_purchases ?? []
      );

      // project
      const projId = detailData?.project?.id
        ? String(detailData.project.id)
        : "";
      setProjectId(projId);
      if (projId) {
        setSelectedProject({
          value: projId,
          label: detailData?.project?.name ?? "",
          icon: Circle,
        });
      } else {
        setSelectedProject(null);
      }

      // budget (optional)
      if (detailData?.budget?.budget_id) {
        setSelectedBudget({
          value: detailData.budget.budget_id,
          // @ts-ignore (API kamu: budget_name / nama_budget)
          label:
            (detailData.budget as any).budget_name ??
            (detailData.budget as any).nama_budget ??
            "-",
          icon: Circle,
        });
      } else {
        setSelectedBudget(null);
      }

      // dates, desc/remarks
      setDate(detailData?.date_start_create_purchase ?? "");
      setDueDate(detailData?.due_date_end_purchase ?? "");
      setDescription(detailData?.description ?? "");
      setRemarks(detailData?.remarks ?? "");

      // event type
      setPurchaseEventType(
        detailData?.purchase_event_type?.id
          ? String(detailData.purchase_event_type.id)
          : ""
      );

      setPoNo(detailData?.po_no ?? "");
      setReff(detailData?.reff ?? "");

      // products
      const mapped: ProductRow[] = (detailData?.products ?? []).map((p) => ({
        id: nextRowId.current++,
        company_id: p?.vendor?.id ? String(p.vendor.id) : "",
        vendor: p?.vendor?.id
          ? {
              value: String(p.vendor.id),
              label: p.vendor.name ?? "-",
              icon: Circle,
              payload: {
                id: p.vendor.id,
                name: p.vendor.name,
              } as any,
            }
          : null,
        product_name: p?.product_name ?? "",
        harga: String(p?.harga ?? ""),
        stok: String(p?.stok ?? ""),
        ppn: p?.ppn?.rate != null ? String(p.ppn.rate) : "",
      }));
      setProducts(mapped.length ? mapped : [newRow()]);
    }

    if (modalType === "create" && isOpen) {
      setPurchaseId("");
      setPurchaseCategoryId("1");
      setDate("");
      setDueDate("");
      setDescription("");
      setRemarks("");
      setPurchaseEventType("");
      setSelectedProject(null);
      setSelectedBudget(null);
      setExistingEvidencePurchases([]);
      setProducts([newRow()]);
    }
  }, [isOpen, modalType, detailData]);

  /** ---------- Delete existing evidence ---------- */
  const handleDeleteExisting = async (fileId: number) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Hapus file ini?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      showDenyButton: true,
      confirmButtonText: "Hapus",
      confirmButtonColor: "#E11D48",
      denyButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;

    try {
      setIsLoading(true);
      await purchaseService.deleteEvidencePurchase(fileId);

      setExistingEvidencePurchases((prev) =>
        prev.filter((f) => f.id !== fileId)
      );

      Swal.fire({
        toast: true,
        icon: "success",
        title: "File dihapus",
        timer: 1800,
        position: "top-right",
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({
        toast: true,
        icon: "error",
        title: "Gagal menghapus file",
        timer: 2000,
        position: "top-right",
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /** ---------- Submit ---------- */
  const submitByMode = async (fd: FormData) => {
    if (modalType === "create") {
      return purchaseService.createPurchase(fd);
    }
    if (!detailData?.doc_no) {
      throw new Error("doc_no tidak ditemukan untuk edit/activate.");
    }
    if (modalType === "edit") {
      isGetData();
      return purchaseService.updatePurchase(detailData.doc_no, fd);
    }
    // activate
    isGetData();
    return purchaseService.activatePurchase(detailData.doc_no, fd);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const effectiveDueDate = isFlashCash ? date : dueDate;

    const fd = new FormData();
    if (purchaseId) fd.append("purchase_id", purchaseId);
    if (purchaseCategoryId)
      fd.append("purchase_category_id", purchaseCategoryId);

    // project id:
    const projectToUse =
      isCustomProject && selectedProject?.value
        ? String(selectedProject.value)
        : projectId;
    if (projectToUse) fd.append("project_id", projectToUse);

    if (date) fd.append("date", date);
    if (effectiveDueDate) fd.append("due_date", effectiveDueDate);
    if (description) fd.append("description", description);
    if (remarks) fd.append("remarks", remarks);
    if (selectedBudget) fd.append("budget_id", String(selectedBudget.value));
    if (isEvent && purchaseEventType)
      fd.append("purchase_event_type", purchaseEventType);
    if (po_no) fd.append("po_no", po_no);
    if (reff) fd.append("reff_no", reff);

    products.forEach((p, i) => {
      if (p.company_id !== "")
        fd.append(`products[${i}][company_id]`, p.company_id);
      if (p.product_name !== "")
        fd.append(`products[${i}][product_name]`, p.product_name);
      if (p.harga !== "") fd.append(`products[${i}][harga]`, p.harga);
      if (p.stok !== "") fd.append(`products[${i}][stok]`, p.stok);
      if (p.ppn !== "") fd.append(`products[${i}][ppn]`, p.ppn);
      if (p.unit !== "") fd.append(`products[${i}][unit]`, p.unit || "");
    });

    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        fd.append("attachment_file[]", file, file.name);
      });
    }

    const labelAction =
      modalType === "create"
        ? "menyimpan"
        : modalType === "edit"
        ? "mengubah"
        : "mengaktifkan";
    const res = await Swal.fire({
      icon: "warning",
      text: `Apakah anda ingin ${labelAction} data?`,
      showDenyButton: true,
      confirmButtonText: "Ya",
      confirmButtonColor: "#493628",
      denyButtonText: "Tidak",
      position: "center",
      showConfirmButton: true,
    });
    if (!res.isConfirmed) {
      Swal.fire({
        icon: "warning",
        title: "Dibatalkan",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    try {
      setIsLoading(true);
      const { message } = await submitByMode(fd);
      isGetData();
      onClose();
      Swal.fire({
        icon: "success",
        title: message ?? "Berhasil",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const rawMessage = e.response?.data?.message;
        let errorMessages: string[] = [];

        if (typeof rawMessage === "string") {
          errorMessages.push(rawMessage);
        } else if (Array.isArray(rawMessage)) {
          errorMessages = rawMessage;
        } else if (typeof rawMessage === "object" && rawMessage !== null) {
          for (const field in rawMessage) {
            if (Object.prototype.hasOwnProperty.call(rawMessage, field)) {
              const fieldErrors = rawMessage[field];
              if (Array.isArray(fieldErrors)) {
                errorMessages.push(`${field}: ${fieldErrors.join(", ")}`);
              } else if (typeof fieldErrors === "string") {
                errorMessages.push(`${field}: ${fieldErrors}`);
              }
            }
          }
        } else {
          errorMessages.push("Terjadi kesalahan.");
        }

        Swal.fire({
          icon: "error",
          title: "Terjadi Kesalahan",
          html: errorMessages.join("<br>"),
          position: "top-right",
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /** ---------- UI ---------- */
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onSubmit={handleSubmit}
      width={isMobile ? "w-[95vw]" : "w-[90vw]"}
      onCancel={onClose}
    >
      <div className="space-y-6 p-4 sm:p-6">
        {/* ===== Banner merah saat ACTIVATE & rejected ===== */}
        {modalType === "activate" &&
        (detailData?.rejected_notification ||
          detailData?.log_purchase?.is_rejected) ? (
          <div className="rounded-xl border border-red-300 bg-red-50 text-red-800 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold">
                  !
                </span>
                <div>
                  <div className="font-semibold">Pengajuan Ditolak</div>
                  <div className="text-sm">
                    {detailData?.rejected_notification ??
                      "Purchase ini memiliki riwayat penolakan."}
                  </div>
                </div>
              </div>
              {detailData?.log_purchase?.status?.name ? (
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  {detailData.log_purchase.status.name}
                </span>
              ) : null}
            </div>

            {detailData?.log_purchase ? (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
                <div>
                  <span className="text-red-700/80">Ditolak oleh:</span>{" "}
                  <span className="font-medium">
                    {detailData.log_purchase.name ?? "-"}
                  </span>
                </div>
                <div>
                  <span className="text-red-700/80">Tab:</span>{" "}
                  <span className="font-medium">
                    {detailData.log_purchase.tab?.name ?? "-"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-red-700/80">Catatan:</span>{" "}
                  <span className="font-medium">
                    {detailData.log_purchase.note_reject?.trim() || "-"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-red-700/80">Waktu:</span>{" "}
                  <span className="font-medium">
                    {format(
                      detailData.log_purchase.created_at,
                      "dd MMM yyyy HH:mm"
                    ) ?? "-"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* ============== META ============== */}
        <div className="rounded-2xl border bg-background dark:bg-card shadow-sm">
          <div className="flex flex-col gap-2 border-b pl-4 pr-4 sm:p-5">
            <h3 className="text-base font-semibold">Purchase Details</h3>
            <p className="text-xs text-muted-foreground">
              Lengkapi tipe, kategori, dan detail tanggal pembelian.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 p-4 sm:p-5">
            {/* Purchase Type */}
            <div className="space-y-1.5">
              <Label htmlFor="purchase_id">
                Purchase Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={purchaseId}
                onValueChange={setPurchaseId}
                key={purchaseId}
              >
                <SelectTrigger id="purchase_id" className="w-full">
                  <SelectValue placeholder="Select purchase type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">EVENT</SelectItem>
                  <SelectItem value="2">OPERATIONAL</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="po_no">PO Number</Label>
                <Input
                  id="po_no"
                  type="text"
                  placeholder="Masukkan PO Number"
                  value={po_no}
                  onChange={(e) => setPoNo(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Purchase Category */}
            <div className="space-y-1.5">
              <Label htmlFor="purchase_category_id">
                Purchase Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={purchaseCategoryId}
                onValueChange={setPurchaseCategoryId}
                key={purchaseCategoryId}
              >
                <SelectTrigger id="purchase_category_id" className="w-full">
                  <SelectValue placeholder="Select purchase category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Flash Cash</SelectItem>
                  <SelectItem value="2">Invoice</SelectItem>
                  {purchaseId !== "2" && (
                    <SelectItem value="3">Man Power</SelectItem>
                  )}
                  <SelectItem value="4">Reimbursement</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="reff">Reference</Label>
                <Input
                  id="reff"
                  type="text"
                  placeholder="Masukkan Reference"
                  value={reff}
                  onChange={(e) => setReff(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* ====== DYNAMIC LAYOUT ====== */}
            {isCustomProject ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:col-span-2">
                  {isEvent && (
                    <div className="space-y-1.5">
                      <Label htmlFor="purchase_event_type">
                        Purchase Event Type
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={purchaseEventType}
                        onValueChange={setPurchaseEventType}
                      >
                        <SelectTrigger
                          id="purchase_event_type"
                          className="w-full"
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Material</SelectItem>
                          <SelectItem value="2">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div
                    className={
                      isEvent ? "space-y-1.5" : "space-y-1.5 md:col-span-2"
                    }
                  >
                    <Label htmlFor="project_id">
                      Project <span className="text-red-500">*</span>
                    </Label>
                    <ComboboxPopoverCustom
                      data={projects}
                      selectedItem={selectedProject}
                      onSelect={setSelectedProject}
                      isOpen={projectPopoverOpen}
                      onOpenChange={setProjectPopoverOpen}
                      placeholder="Cari Proyek"
                      onInputChange={(q) => getProjects(q)}
                      height="h-12 sm:h-10"
                    />
                  </div>
                </div>

                <div
                  className={`grid grid-cols-1 ${
                    !isFlashCash ? "sm:grid-cols-2" : ""
                  } gap-4 md:col-span-1`}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="date">
                      Date<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {!isFlashCash && (
                    <div className="space-y-1.5">
                      <Label htmlFor="due_date">
                        Due Date<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {isEvent ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:col-span-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="purchase_event_type">
                        Purchase Event Type
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={purchaseEventType}
                        onValueChange={setPurchaseEventType}
                      >
                        <SelectTrigger
                          id="purchase_event_type"
                          className="w-full"
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Material</SelectItem>
                          <SelectItem value="2">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div
                      className={`flex flex-col ${
                        !isFlashCash ? "sm:flex-row" : ""
                      } gap-4 w-full`}
                    >
                      <div className="space-y-1.5 w-full min-w-0">
                        <Label htmlFor="date">
                          Date<span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full max-w-full min-w-0"
                        />
                      </div>

                      {!isFlashCash && (
                        <div className="space-y-1.5 w-full min-w-0">
                          <Label htmlFor="due_date">
                            Due Date<span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="due_date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full max-w-full min-w-0"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`grid grid-cols-1 ${
                      !isFlashCash ? "sm:grid-cols-2" : ""
                    } gap-4 md:col-span-2`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <Label htmlFor="date">
                        Date<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full max-w-full min-w-0"
                      />
                    </div>

                    {!isFlashCash && (
                      <div className="space-y-1.5 min-w-0">
                        <Label htmlFor="due_date">
                          Due Date<span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full max-w-full min-w-0"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Budget (optional) */}
            {!isCustomProject && (
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="attachment">Klasifikasi Budget</Label>
                <ComboboxPopoverCustom
                  data={budgets}
                  selectedItem={selectedBudget}
                  onSelect={setSelectedBudget}
                  isOpen={budgetPopoverOpen}
                  onOpenChange={setBudgetPopoverOpen}
                  placeholder="Cari Budget"
                  onInputChange={(q) => getBudgets(q)}
                  height="h-12 sm:h-10"
                />
              </div>
            )}

            {/* Evidence uploader + existing gallery */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="attachment" className="flex items-center gap-2">
                Bukti Pembelian
                <span className="text-red-500 text-xs">
                  (Optional, max 3 files, max 3 MB)
                </span>
              </Label>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Kiri: uploader file baru */}
                <div className="rounded-lg border p-3">
                  <Input
                    id="attachment"
                    type="file"
                    multiple
                    accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.csv,application/vnd.ms-excel"
                    onChange={handleChangeFiles}
                  />
                  {errorFiles && (
                    <p className="text-xs text-red-600 mt-2">{errorFiles}</p>
                  )}
                  {files?.length ? (
                    <ul className="text-xs text-muted-foreground list-disc pl-5 mt-2">
                      {files.map((f, i) => (
                        <li key={i} className="truncate">
                          {f.name}{" "}
                          <span className="opacity-70">
                            ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">
                      Belum ada file baru dipilih.
                    </p>
                  )}
                </div>

                {/* Kanan: gallery file existing */}
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-muted-foreground">
                      File Terupload
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {existingEvidencePurchases.length} file
                    </span>
                  </div>

                  {existingEvidencePurchases.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Tidak ada file
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {existingEvidencePurchases.map((f) => {
                        const previewable = isImageLink(
                          f.link,
                          (f as any).type_file
                        );
                        return (
                          <div
                            key={f.id}
                            className="group rounded-md border overflow-hidden bg-card"
                          >
                            {/* Preview area */}
                            <div className="relative aspect-video bg-muted">
                              {previewable ? (
                                <img
                                  src={f.link}
                                  alt={f.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-4xl">
                                  📄
                                </div>
                              )}

                              {/* Hover actions (preview + delete) */}
                              <div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-2 bg-black/40">
                                <a
                                  href={f.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 text-xs rounded-md bg-white text-black hover:opacity-90"
                                  title="Buka di tab baru"
                                >
                                  Preview
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExisting(f.id)}
                                  className="px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                                  title="Hapus file"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {/* Caption */}
                            <div className="p-2">
                              <a
                                href={f.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[11px] leading-snug hover:underline truncate"
                                title={f.name}
                              >
                                {f.name}
                              </a>
                              <div className="mt-1 flex items-center justify-between">
                                <a
                                  href={f.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-blue-600 hover:underline"
                                >
                                  Open
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExisting(f.id)}
                                  className="text-[11px] text-red-600 hover:underline cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="description">
                Description<span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Deskripsi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24"
              />
            </div>

            {/* Remarks */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Catatan"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="min-h-20"
              />
            </div>
          </div>
        </div>

        {/* ============== PRODUCTS ============== */}
        <div className="rounded-2xl border bg-background shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b p-4 sm:p-5">
            <div>
              <h3 className="text-base font-semibold">Products</h3>
              <p className="text-xs text-muted-foreground">
                Isi detail produk, harga, qty, dan pajak. Total dihitung
                otomatis.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={addProduct}
              className="w-full sm:w-auto"
            >
              + Add Product
            </Button>
          </div>

          <div className="p-4 sm:p-5 space-y-5">
            {products.map((p, idx) => {
              const priceNum = normalizeRupiah(p.harga);
              const qtyNum = parseFloat(p.stok || "0") || 0;
              const ppnPct = parseFloat(p.ppn || "0") || 0;
              const totalPPN =
                ((priceNum || 0) * (qtyNum || 0) * (ppnPct || 0)) / 100;
              const totalPrice = priceNum * qtyNum + totalPPN;

              return (
                <div
                  key={p.id}
                  className="rounded-xl border bg-card p-4 sm:p-5 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Product #{idx + 1}
                    </span>
                    {products.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProduct(idx)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* GRID 3x3 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* ===== ROW 1 ===== */}

                    {/* Vendor */}
                    <div className="space-y-1.5">
                      <Label>
                        Vendor<span className="text-red-500">*</span>
                      </Label>
                      <ComboboxPopoverCustom
                        data={vendors}
                        selectedItem={p.vendor}
                        onSelect={(vendor) => handleVendorChange(idx, vendor)}
                        isOpen={isPopoverVendorOpen[p.id] || false}
                        onOpenChange={(open) =>
                          handleOpenVendorChange(p.id, open)
                        }
                        placeholder="Cari Vendor"
                        onInputChange={(q) => getVendors(q)}
                        height="h-9"
                      />
                    </div>

                    {/* Product Name */}
                    <div className="space-y-1.5">
                      <Label>
                        Product Name<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="e.g., Laptop"
                        value={p.product_name}
                        onChange={(e) =>
                          updateProduct(idx, "product_name", e.target.value)
                        }
                      />
                    </div>

                    {/* Unit */}
                    <div className="space-y-1.5">
                      <Label>Unit</Label>
                      <Input
                        placeholder="e.g., pcs, box, hari"
                        value={p.unit}
                        onChange={(e) =>
                          updateProduct(idx, "unit", e.target.value)
                        }
                      />
                    </div>

                    {/* ===== ROW 2 ===== */}

                    {/* Harga */}
                    <div className="space-y-1.5">
                      <Label>
                        Harga<span className="text-red-500">*</span>
                      </Label>
                      <HargaInput
                        value={p.harga}
                        onChange={(raw) => updateProduct(idx, "harga", raw)}
                      />
                    </div>

                    {/* Qty */}
                    <div className="space-y-1.5">
                      <Label>
                        Qty<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        inputMode="numeric"
                        placeholder="e.g., 1"
                        value={p.stok}
                        onChange={(e) =>
                          updateProduct(idx, "stok", e.target.value)
                        }
                      />
                    </div>

                    {/* PPN */}
                    <div className="space-y-1.5">
                      <Label>PPN (%)</Label>
                      <Input
                        inputMode="numeric"
                        placeholder="e.g., 11"
                        value={p.ppn}
                        onChange={(e) =>
                          updateProduct(idx, "ppn", e.target.value)
                        }
                      />
                    </div>

                    {/* ===== ROW 3 (ONLY 2 INPUTS) ===== */}

                    {/* Auto PPN */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        PPN{" "}
                        <span className="text-muted-foreground">(Auto)</span>
                      </Label>
                      <Input disabled value={formatCurrencyIDR(totalPPN)} />
                    </div>

                    {/* Auto Total */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Total{" "}
                        <span className="text-muted-foreground">(Auto)</span>
                      </Label>
                      <Input disabled value={formatCurrencyIDR(totalPrice)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
