"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/custom/modal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash2, Upload, CheckCircle2, Circle } from "lucide-react";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";

import { IPurchase } from "@/types/purchase";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import { projectService, contactService, purchaseService } from "@/services";
import { IProject } from "@/types/project";
import { IContact } from "@/types/contact";
import { formatRupiah } from "@/utils/useCurrency";
import { getPurchaseCategoryIdByName } from "@/helpers/purchaseCategoryHelper";

interface ModalPurchaseProps {
  isOpen: boolean;
  title: string;
  detailData?: IPurchase | null;
  modalType: "create" | "edit";
  onClose: () => void;
  isGetData: (tableModal: string) => void;
  isLoading?: boolean;
  setIsLoading: (loading: boolean) => void;
}

const PURCHASE_ID_OPTIONS = [
  { label: "EVENT", value: "1" },
  { label: "OPERATIONAL", value: "2" },
];

const PURCHASE_CATEGORY_OPTIONS = [
  { label: "FLASH CASH", value: "1" },
  { label: "INVOICE", value: "2" },
  { label: "MAN POWER", value: "3" },
  { label: "EXPENSE", value: "4" },
  { label: "REIMBURSEMENT", value: "5" },
];

interface ProductRow {
  company_id: string; // vendor id
  product_name: string;
  harga: string; // tampil dalam format Rupiah (mis. 12.345,67)
  stok: number;
  ppn: number;
}

interface FormState {
  purchase_id: string;
  purchase_category_id: string;
  project_id: string;
  date: string;
  due_date: string;
  description: string;
  remarks: string;
  products: ProductRow[];
  attachments: File[];
}

export const ModalPurchase = ({
  isOpen,
  title,
  onClose,
  modalType,
  isGetData,
  detailData,
  isLoading = false,
  setIsLoading,
}: ModalPurchaseProps) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const totalSteps = 3;

  // Project combobox
  const [isPopoverProjectOpen, setPopoverProjectOpen] = useState(false);
  const [projects, setProjects] = useState<ComboboxItem<IProject>[]>([]);
  const [selectedProject, setSelectedProject] =
    useState<ComboboxItem<IProject> | null>(null);

  // Vendor combobox (per-row)
  const [vendors, setVendors] = useState<ComboboxItem<IContact>[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<
    (ComboboxItem<IContact> | null)[]
  >([]);
  const [openVendorIdx, setOpenVendorIdx] = useState<number | null>(null);

  const nextStep = () =>
    setCurrentStep((s) => (s < totalSteps ? ((s + 1) as 1 | 2 | 3) : s));
  const prevStep = () =>
    setCurrentStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));

  const buildDefaultForm = (): FormState => ({
    purchase_id: String(detailData?.purchase_type?.id ?? ""),
    purchase_category_id: getPurchaseCategoryIdByName(
      detailData?.doc_type ?? (detailData as any)?.purchase_category ?? ""
    ),
    project_id: detailData?.project?.id ?? "",
    date: (detailData as any)?.date ?? "",
    due_date: (detailData as any)?.due_date ?? "",
    description: (detailData as any)?.description ?? "",
    remarks: (detailData as any)?.remarks ?? "",
    products: (detailData as any)?.products?.length
      ? (detailData as any).products.map((p: any) => ({
          company_id: String(p.company_id ?? ""),
          product_name: String(p.product_name ?? ""),
          harga: formatRupiah(String(p.harga ?? "")),
          stok: Number(p.stok ?? 0),
          ppn: Number(p.ppn ?? 0),
        }))
      : [
          {
            company_id: "",
            product_name: "",
            harga: "",
            stok: 0,
            ppn: 0,
          },
        ],
    attachments: [],
  });

  const [form, setForm] = useState<FormState>(buildDefaultForm());

  useEffect(() => {
    if (detailData && modalType === "edit") {
      setForm(buildDefaultForm());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailData, modalType]);

  // ---------- Helpers Rupiah ----------
  // ubah "12.345,67" -> "12345.67" (string angka internasional)
  const unformatRupiahToNumberString = (v: string) => {
    if (!v) return "";
    const clean = String(v)
      .replace(/\./g, "")
      .replace(/[^0-9,]/g, "");
    return clean.replace(/,/g, ".");
  };

  // ---------- Project list + preselect ----------
  const getProjects = async (search?: string) => {
    const params = search ? { search } : (undefined as any);
    const { data } = await projectService.getAllProjects(params);
    setProjects(
      data.map((e: IProject) => ({
        value: e.id,
        label: e.name,
        icon: Circle,
      }))
    );
  };

  useEffect(() => {
    if (isOpen) getProjects();
  }, [isOpen]);

  useEffect(() => {
    if (form.project_id && projects.length) {
      const found = projects.find(
        (p) => String(p.value) === String(form.project_id)
      );
      if (found) setSelectedProject(found);
    }
  }, [projects, form.project_id]);

  useEffect(() => {
    if (selectedProject?.value) {
      setForm((prev) => ({
        ...prev,
        project_id: String(selectedProject.value),
      }));
    }
    if (!selectedProject) {
      setForm((prev) => ({ ...prev, project_id: "" }));
    }
  }, [selectedProject]);

  // ---------- Vendor list (shared) ----------
  const getVendors = async (search?: string) => {
    const params = search ? { search, contact_type: 1 } : { contact_type: 1 };
    const { data } = await contactService.getAllContacts(params);
    setVendors(
      data.map((c: IContact) => ({
        value: c.id,
        label: c.name,
        icon: Circle,
      }))
    );
  };

  useEffect(() => {
    if (isOpen) getVendors();
  }, [isOpen]);

  // Sinkronisasi selectedVendors (preselect saat edit) ketika vendors list / products berubah
  useEffect(() => {
    setSelectedVendors((prev) => {
      const next: (ComboboxItem<IContact> | null)[] = form.products.map(
        (p, idx) => {
          const prevItem = prev[idx];
          if (prevItem && String(prevItem.value) === String(p.company_id)) {
            return prevItem;
          }
          if (p.company_id && vendors.length) {
            const found = vendors.find(
              (v) => String(v.value) === String(p.company_id)
            );
            return found ?? null;
          }
          return null;
        }
      );
      return next;
    });
  }, [vendors, form.products.length]); // length cukup utk re-run saat add/remove

  // ---------- STEP VALIDATION ----------
  const canGoNext = useMemo(() => {
    if (currentStep === 1) {
      return (
        form.purchase_id &&
        form.purchase_category_id &&
        form.project_id &&
        form.date &&
        form.due_date &&
        form.description
      );
    }
    if (currentStep === 2) {
      return form.products.every((p) => {
        const hargaStr = unformatRupiahToNumberString(p.harga);
        return (
          p.company_id.trim() &&
          p.product_name.trim() &&
          hargaStr !== "" &&
          !Number.isNaN(Number(hargaStr)) &&
          !Number.isNaN(Number(p.stok)) &&
          !Number.isNaN(Number(p.ppn))
        );
      });
    }
    return true;
  }, [currentStep, form]);

  // ---------- NEXT & FINAL SUBMIT ----------
  const handleNext = () => {
    if (!canGoNext) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi data dulu",
        toast: true,
        showConfirmButton: false,
        timer: 1800,
        position: "top-right",
      });
      return;
    }
    nextStep();
  };

  const logFormData = (fd: FormData) => {
    const rows: Array<{ key: string; value: any }> = [];
    fd.forEach((value, key) => {
      if (value instanceof File) {
        rows.push({
          key,
          value: `File{name:"${value.name}", type:"${value.type}", size:${value.size}}`,
        });
      } else {
        rows.push({ key, value });
      }
    });

    console.groupCollapsed("[DEBUG] FormData");
    console.table(rows);
    // console.log("Raw entries:", Array.from(fd.entries()));
    console.groupEnd();
  };

  const handleFinalSubmit = async () => {
    try {
      setIsLoading(true);
      const fd = new FormData();
      // Step 1 & meta
      fd.append("purchase_id", form.purchase_id);
      fd.append("purchase_category_id", form.purchase_category_id);
      fd.append("project_id", form.project_id);
      fd.append("date", form.date);
      fd.append("due_date", form.due_date);
      fd.append("description", form.description ?? "");
      fd.append("remarks", form.remarks ?? "");

      // Step 2 — products (kirim angka bersih untuk harga)
      form.products.forEach((p, idx) => {
        fd.append(`products[${idx}][company_id]`, p.company_id);
        fd.append(`products[${idx}][product_name]`, p.product_name);
        fd.append(
          `products[${idx}][harga]`,
          unformatRupiahToNumberString(p.harga)
        );
        fd.append(`products[${idx}][stok]`, String(p.stok));
        fd.append(`products[${idx}][ppn]`, String(p.ppn));
      });

      // Step 3 — attachments
      form.attachments.forEach((file) => {
        fd.append("attachment_file[]", file);
      });

      const { data, message } = await purchaseService.createPurchase(fd);
      logFormData(fd);
      isGetData("purchase");
      setIsLoading(false);
      Swal.fire({
        icon: "success",
        title: message,
        toast: true,
        showConfirmButton: false,
        timer: 1800,
        position: "top-right",
      });
      //   onClose();
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- UI HELPERS ----------
  const StepBadge = ({ index, label }: { index: number; label: string }) => {
    const active = currentStep === index;
    const done = currentStep > index;
    return (
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium",
            active && "bg-iprimary-blue text-white",
            done && "bg-green-600 text-white border-green-600",
            !active && !done && "bg-muted text-foreground/70 border-muted"
          )}
        >
          {done ? <CheckCircle2 className="w-5 h-5" /> : index}
        </div>
        <div className={cn("text-sm font-medium", active ? "" : "opacity-70")}>
          {label}
        </div>
      </div>
    );
  };

  const Stepper = () => (
    <div className="flex justify-between items-center">
      <StepBadge index={1} label="Info Purchase" />
      <div className="flex-1 h-px bg-border mx-2" />
      <StepBadge index={2} label="Produk" />
      <div className="flex-1 h-px bg-border mx-2" />
      <StepBadge index={3} label="Lampiran" />
    </div>
  );

  // ---------- RENDER ----------
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      // jangan pasang onSubmit di Modal agar tidak auto-close saat Next
      onCancel={onClose}
      showConfirmButton={false}
    >
      <div className="space-y-6 p-5">
        {/* Stepper */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Purchase</CardTitle>
            <CardDescription>Isi data pembelian sesuai langkah</CardDescription>
          </CardHeader>
          <CardContent>
            <Stepper />
          </CardContent>
        </Card>

        {/* STEP 1: INFO PURCHASE */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Purchase</CardTitle>
              <CardDescription>Detail awal purchase</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipe Purchase */}
              <div className="space-y-2">
                <Label>
                  Tipe Purchase <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.purchase_id}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, purchase_id: v }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe Purchase" />
                  </SelectTrigger>
                  <SelectContent>
                    {PURCHASE_ID_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kategori */}
              <div className="space-y-2">
                <Label>
                  Kategori <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.purchase_category_id}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, purchase_category_id: v }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {PURCHASE_CATEGORY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* PROJECT (full width) */}
              <div className="col-span-full space-y-2">
                <Label>
                  Project <span className="text-red-500">*</span>
                </Label>
                <ComboboxPopoverCustom
                  data={projects}
                  selectedItem={selectedProject}
                  onSelect={setSelectedProject}
                  isOpen={isPopoverProjectOpen}
                  onOpenChange={setPopoverProjectOpen}
                  placeholder="Cari Proyek"
                  onInputChange={(q) => getProjects(q)}
                  height="h-10"
                />
                {selectedProject && (
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs mt-1">
                    <span className="font-medium">Terpilih:</span>
                    <span className="truncate max-w-[180px]">
                      {selectedProject.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProject(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* DATE & DUE DATE (1 line on md+) */}
              <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Tanggal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Jatuh Tempo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.due_date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, due_date: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div className="col-span-full space-y-2">
                <Label>
                  Deskripsi <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Catatan */}
              <div className="col-span-full space-y-2">
                <Label>Catatan</Label>
                <Textarea
                  value={form.remarks}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: PRODUK (Vendor combobox per row) */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Produk</CardTitle>
              <CardDescription>Tambah produk yang dibeli</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.products.map((row, idx) => (
                <div key={idx} className="p-4 rounded-md border space-y-4">
                  {/* Header row (title + delete) */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      Produk #{idx + 1}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        const nextProducts = form.products.filter(
                          (_, i) => i !== idx
                        );
                        const nextVendors = selectedVendors.filter(
                          (_, i) => i !== idx
                        );
                        setForm((prev) => ({
                          ...prev,
                          products: nextProducts,
                        }));
                        setSelectedVendors(nextVendors);
                      }}
                      disabled={form.products.length === 1}
                      className="shrink-0"
                      aria-label="Hapus produk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Row 1: Vendor - Nama Produk */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Vendor</Label>
                      <ComboboxPopoverCustom
                        data={vendors}
                        selectedItem={selectedVendors[idx] || null}
                        onSelect={(item) => {
                          setSelectedVendors((prev) => {
                            const next = [...prev];
                            next[idx] = item;
                            return next;
                          });
                          setForm((prev) => {
                            const next = [...prev.products];
                            next[idx] = {
                              ...next[idx],
                              company_id: String(item?.value ?? ""),
                            };
                            return { ...prev, products: next };
                          });
                        }}
                        isOpen={openVendorIdx === idx}
                        onOpenChange={(open) =>
                          setOpenVendorIdx(open ? idx : null)
                        }
                        placeholder="Cari Vendor"
                        onInputChange={(q) => getVendors(q)}
                        height="h-10"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Nama Produk</Label>
                      <Input
                        placeholder="Nama Produk"
                        value={row.product_name}
                        onChange={(e) => {
                          const next = [...form.products];
                          next[idx].product_name = e.target.value;
                          setForm((prev) => ({ ...prev, products: next }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 2: Harga - Stok - PPN */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Harga</Label>
                      <Input
                        placeholder="0"
                        inputMode="numeric"
                        value={row.harga}
                        onChange={(e) => {
                          const formatted = formatRupiah(e.target.value);
                          const next = [...form.products];
                          next[idx].harga = formatted;
                          setForm((prev) => ({ ...prev, products: next }));
                        }}
                        onBlur={(e) => {
                          // opsional: rapikan lagi saat blur
                          const formatted = formatRupiah(e.target.value);
                          const next = [...form.products];
                          next[idx].harga = formatted;
                          setForm((prev) => ({ ...prev, products: next }));
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Stok</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={row.stok}
                        onChange={(e) => {
                          const next = [...form.products];
                          next[idx].stok = Number(e.target.value);
                          setForm((prev) => ({ ...prev, products: next }));
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>PPN (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0"
                        value={row.ppn}
                        onChange={(e) => {
                          const next = [...form.products];
                          next[idx].ppn = Number(e.target.value);
                          setForm((prev) => ({ ...prev, products: next }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    products: [
                      ...prev.products,
                      {
                        company_id: "",
                        product_name: "",
                        harga: "",
                        stok: 0,
                        ppn: 0,
                      },
                    ],
                  }));
                  setSelectedVendors((prev) => [...prev, null]);
                }}
                className="gap-2 cursor-pointer bg-iprimary-blue hover:bg-iprimary-blue/90"
              >
                <Plus className="w-4 h-4" />
                Tambah Produk
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: LAMPIRAN */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Lampiran</CardTitle>
              <CardDescription>Upload bukti pembelian</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="file"
                multiple
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    attachments: e.target.files
                      ? Array.from(e.target.files)
                      : [],
                  }))
                }
              />
              {form.attachments.length > 0 && (
                <ul className="mt-2 text-sm text-muted-foreground">
                  {form.attachments.map((f, i) => (
                    <li key={i}>• {f.name}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* NAVIGATION */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="cursor-pointer"
          >
            Kembali
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              className="cursor-pointer bg-iprimary-blue"
            >
              Lanjut
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isLoading}
              className="bg-iprimary-blue cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              {modalType === "edit" ? "Update" : "Submit"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
