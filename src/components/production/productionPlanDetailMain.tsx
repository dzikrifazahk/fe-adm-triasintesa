"use client";

import { Modal } from "@/components/custom/modal";
import { MobileContext } from "@/hooks/use-mobile-ssr";
import { productionPlanService } from "@/services";
import {
  IAddProductionBatch,
  IAddProductionJirigen,
  IProductionBatch,
  IProductionJirigen,
  IProductionPlan,
} from "@/types/production";
import { getDictionary } from "../../../get-dictionary";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ModalFilterProductionBatches,
  ProductionDateFilterPayload,
} from "./modalFilterProductionBatches";
import {
  ModalFilterProductionJirigen,
  ProductionJirigenFilterPayload,
} from "./modalFilterProductionJirigen";
import { ProductionBatchesSection } from "./productionBatchesSection";
import { ProductionJirigenSection } from "./productionJirigenSection";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Loader2, Pencil, X } from "lucide-react";
import Swal from "sweetalert2";

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["production_page_dic"];
  planId: string;
};

const initialBatchForm: IAddProductionBatch = {
  batchNumber: "",
  tankId: 0,
  planId: 0,
  startDate: "",
  endDate: "",
  rawMaterialVolume: 0,
  targetQuantityJirigen: 0,
  notes: "",
};

const initialJirigenForm: IAddProductionJirigen = {
  batchId: 0,
  jirigenNumber: 1,
  volumeLiter: 20,
  productionDatetime: "",
  notes: "",
};

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function formatNumber(value?: string | number | null) {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? "0" : parsed.toLocaleString("id-ID");
}

function normalizeNumber(value?: string | number | null) {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toList<T>(response: any): T[] {
  return response?.data?.data ?? response?.data ?? [];
}

function SectionEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-slate-500 dark:border-[#40454F] dark:text-slate-400">
      {text}
    </div>
  );
}

export default function ProductionPlanDetailMain({
  dictionary,
  planId,
}: Props) {
  const detailDictionary = dictionary.production_plan.detail;
  const layoutDictionary = dictionary.production_plan.layout;
  const formDictionary = dictionary.production_plan.form;
  const { isMobile } = useContext(MobileContext);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingJirigens, setLoadingJirigens] = useState(false);
  const [submittingBatch, setSubmittingBatch] = useState(false);
  const [submittingJirigen, setSubmittingJirigen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const [plan, setPlan] = useState<IProductionPlan | null>(null);
  const [batches, setBatches] = useState<IProductionBatch[]>([]);
  const [jirigens, setJirigens] = useState<IProductionJirigen[]>([]);

  const [batchForm, setBatchForm] =
    useState<IAddProductionBatch>(initialBatchForm);
  const [jirigenForm, setJirigenForm] =
    useState<IAddProductionJirigen>(initialJirigenForm);

  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isJirigenOpen, setIsJirigenOpen] = useState(false);
  const [hasLoadedBatches, setHasLoadedBatches] = useState(false);
  const [hasLoadedJirigens, setHasLoadedJirigens] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isJirigenModalOpen, setIsJirigenModalOpen] = useState(false);
  const [isBarcodePreviewOpen, setIsBarcodePreviewOpen] = useState(false);
  const [isBatchFilterModalOpen, setIsBatchFilterModalOpen] = useState(false);
  const [isJirigenFilterModalOpen, setIsJirigenFilterModalOpen] =
    useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchFilters, setBatchFilters] = useState<ProductionDateFilterPayload>(
    {},
  );
  const [jirigenFilters, setJirigenFilters] =
    useState<ProductionJirigenFilterPayload>({});
  const [selectedStatus, setSelectedStatus] = useState("");
  const [printingBarcodeId, setPrintingBarcodeId] = useState<string | null>(
    null,
  );
  const [barcodePreviewUrl, setBarcodePreviewUrl] = useState<string | null>(
    null,
  );
  const [loadingBarcodePreview, setLoadingBarcodePreview] = useState(false);
  const barcodePreviewFrameRef = useRef<HTMLIFrameElement | null>(null);

  const tankCurrentVolume = normalizeNumber(plan?.tank?.currentVolume);
  const tankTotalCapacity = normalizeNumber(plan?.tank?.totalCapacity);
  const tankVolumePercentage =
    tankTotalCapacity > 0
      ? Math.min(
          100,
          Math.max(0, Math.round((tankCurrentVolume / tankTotalCapacity) * 100)),
        )
      : 0;

  const statusOptions = [
    {
      value: "planned",
      label: layoutDictionary.status_planned,
    },
    {
      value: "in_progress",
      label: layoutDictionary.status_in_progress,
    },
    {
      value: "completed",
      label: layoutDictionary.status_completed,
    },
    {
      value: "cancel",
      label: layoutDictionary.status_cancel,
    },
  ];

  const loadPlan = async () => {
    try {
      setLoadingPlan(true);
      const planResponse =
        await productionPlanService.getProductionPlan(planId);
      const planData = planResponse?.data ?? null;
      setPlan(planData);
      setSelectedStatus(planData?.status ?? "");

      if (planData) {
        setBatchForm((prev) => ({
          ...prev,
          tankId: Number(planData.tankId) || 0,
          planId: Number(planData.id) || Number(planId),
          startDate: planData.startDate?.slice(0, 10) ?? "",
          endDate: planData.endDate?.slice(0, 10) ?? "",
        }));
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: detailDictionary.load_detail_error,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });
    } finally {
      setLoadingPlan(false);
    }
  };

  const loadBatches = async (filters?: ProductionDateFilterPayload) => {
    try {
      setLoadingBatches(true);
      const activeFilters = filters ?? batchFilters;
      const batchResponse =
        await productionPlanService.getProductionBatchesByPlanID(
          planId,
          activeFilters,
        );
      const batchData = toList<IProductionBatch>(batchResponse);
      setBatches(batchData);
      setHasLoadedBatches(true);

      setJirigenForm((prev) => ({
        ...prev,
        batchId: batchData[0]?.id ?? prev.batchId ?? 0,
        productionDatetime:
          prev.productionDatetime ||
          formatDateTimeLocal(new Date().toISOString()),
      }));
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: detailDictionary.load_batches_error,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });
    } finally {
      setLoadingBatches(false);
    }
  };

  const loadJirigens = async (filters?: ProductionJirigenFilterPayload) => {
    try {
      setLoadingJirigens(true);
      const activeFilters = filters ?? jirigenFilters;
      const jirigenResponse = await productionPlanService.getProductionJirigens(
        {
          planId,
          limit: 500,
          ...activeFilters,
        },
      );
      setJirigens(toList<IProductionJirigen>(jirigenResponse));
      setHasLoadedJirigens(true);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: detailDictionary.load_jirigens_error,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });
    } finally {
      setLoadingJirigens(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [planId]);

  useEffect(() => {
    return () => {
      if (barcodePreviewUrl) {
        URL.revokeObjectURL(barcodePreviewUrl);
      }
    };
  }, [barcodePreviewUrl]);

  const handleToggleBatches = async () => {
    const nextState = !isBatchOpen;
    setIsBatchOpen(nextState);
    if (nextState && !hasLoadedBatches) {
      await loadBatches();
    }
  };

  const handleToggleJirigens = async () => {
    const nextState = !isJirigenOpen;
    setIsJirigenOpen(nextState);
    if (nextState && !hasLoadedJirigens) {
      await loadJirigens();
    }
  };

  const handleOpenJirigenModal = async () => {
    if (!hasLoadedBatches) {
      await loadBatches();
    }
    setIsJirigenModalOpen(true);
  };

  const resetBatchForm = () => {
    setEditingBatchId(null);
    setBatchForm({
      ...initialBatchForm,
      tankId: Number(plan?.tankId) || 0,
      planId: Number(plan?.id) || Number(planId),
      startDate: plan?.startDate?.slice(0, 10) ?? "",
      endDate: plan?.endDate?.slice(0, 10) ?? "",
    });
  };

  const handleOpenCreateBatchModal = () => {
    resetBatchForm();
    setIsBatchModalOpen(true);
  };

  const handleEditBatch = (batch: IProductionBatch) => {
    setEditingBatchId(String(batch.id));
    setBatchForm({
      batchNumber: batch.batchNumber ?? "",
      tankId: Number(batch.tankId) || Number(plan?.tankId) || 0,
      planId: Number(batch.planId) || Number(plan?.id) || Number(planId),
      startDate: batch.startDate?.slice(0, 10) ?? "",
      endDate: batch.endDate?.slice(0, 10) ?? "",
      rawMaterialVolume: Number(batch.rawMaterialVolume) || 0,
      targetQuantityJirigen: Number(batch.targetQuantityJirigen) || 0,
      notes: batch.notes ?? "",
    });
    setIsBatchModalOpen(true);
  };

  const handleBatchSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !plan ||
      !batchForm.batchNumber ||
      !batchForm.startDate ||
      !batchForm.endDate
    ) {
      return;
    }

    try {
      setSubmittingBatch(true);
      const payload = {
        ...batchForm,
        tankId: Number(plan.tankId),
        planId: Number(plan.id),
        rawMaterialVolume: Number(batchForm.rawMaterialVolume),
        targetQuantityJirigen: Number(batchForm.targetQuantityJirigen),
      };

      if (editingBatchId) {
        await productionPlanService.updateProductionBatch(
          editingBatchId,
          payload,
        );
      } else {
        await productionPlanService.createProductionBatch(payload);
      }

      Swal.fire({
        icon: "success",
        title: editingBatchId
          ? detailDictionary.batch_update_success
          : detailDictionary.batch_create_success,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });

      resetBatchForm();
      setIsBatchModalOpen(false);
      setIsBatchOpen(true);
      await loadBatches();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: editingBatchId
          ? detailDictionary.batch_update_error
          : detailDictionary.batch_create_error,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });
    } finally {
      setSubmittingBatch(false);
    }
  };

  const handleJirigenSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!jirigenForm.batchId || !jirigenForm.productionDatetime) {
      return;
    }

    try {
      setSubmittingJirigen(true);
      await productionPlanService.createProductionJirigen({
        ...jirigenForm,
        batchId: Number(jirigenForm.batchId),
        jirigenNumber: Number(jirigenForm.jirigenNumber),
        volumeLiter: Number(jirigenForm.volumeLiter),
        productionDatetime: new Date(
          jirigenForm.productionDatetime,
        ).toISOString(),
      });

      Swal.fire({
        icon: "success",
        title: detailDictionary.jirigen_create_success,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });

      setJirigenForm((prev) => ({
        ...prev,
        jirigenNumber: Number(prev.jirigenNumber || 0) + 1,
        notes: "",
      }));
      setIsJirigenModalOpen(false);
      setIsJirigenOpen(true);
      await loadJirigens();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: detailDictionary.jirigen_create_error,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });
    } finally {
      setSubmittingJirigen(false);
    }
  };

  const handleApplyBatchFilters = async (
    payload: ProductionDateFilterPayload,
  ) => {
    setBatchFilters(payload);
    await loadBatches(payload);
    setIsBatchOpen(true);
  };

  const handleClearBatchFilters = async () => {
    const clearedFilters = {};
    setBatchFilters(clearedFilters);
    await loadBatches(clearedFilters);
    setIsBatchOpen(true);
  };

  const handleApplyJirigenFilters = async (
    payload: ProductionJirigenFilterPayload,
  ) => {
    setJirigenFilters(payload);
    await loadJirigens(payload);
    setIsJirigenOpen(true);
  };

  const handleClearJirigenFilters = async () => {
    const clearedFilters = {};
    setJirigenFilters(clearedFilters);
    await loadJirigens(clearedFilters);
    setIsJirigenOpen(true);
  };

  const handlePrintJirigenBarcode = async (jirigenId: string) => {
    try {
      setPrintingBarcodeId(jirigenId);
      setLoadingBarcodePreview(true);
      setIsBarcodePreviewOpen(true);

      if (barcodePreviewUrl) {
        URL.revokeObjectURL(barcodePreviewUrl);
        setBarcodePreviewUrl(null);
      }

      const pdfBlob =
        await productionPlanService.printProductionJirigenBarcode(jirigenId);
      const previewUrl = URL.createObjectURL(pdfBlob);
      setBarcodePreviewUrl(previewUrl);
    } catch (error) {
      console.error(error);
      setIsBarcodePreviewOpen(false);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat preview barcode",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });
    } finally {
      setPrintingBarcodeId(null);
      setLoadingBarcodePreview(false);
    }
  };

  const handlePrintBarcodePreview = () => {
    const iframeWindow = barcodePreviewFrameRef.current?.contentWindow;
    if (!iframeWindow) return;

    iframeWindow.focus();
    iframeWindow.print();
  };

  const handleUpdateStatus = async (status: string) => {
    if (!plan || plan.status === status) return;

    if (status === "completed" || status === "cancel") {
      const result = await Swal.fire({
        icon: "question",
        title:
          status === "completed"
            ? `${layoutDictionary.status_completed}?`
            : `${layoutDictionary.status_cancel}?`,
        text: formDictionary.confirm_update,
        showCancelButton: true,
        confirmButtonText: formDictionary.confirm_yes,
        cancelButtonText: formDictionary.confirm_cancel,
        confirmButtonColor: status === "cancel" ? "#DC2626" : "#2B59FF",
      });

      if (!result.isConfirmed) return;
    }

    try {
      setUpdatingStatus(true);
      await productionPlanService.updateProductionPlan(planId, {
        status,
        startDate: plan.startDate?.slice(0, 10) ?? "",
        endDate: plan.endDate?.slice(0, 10) ?? "",
        tankId: Number(plan.tankId) || 0,
        targetBatches: Number(plan.targetBatches) || 0,
        targetJirigenTotal: plan.targetJirigenTotal ?? 0,
        notes: plan.notes ?? "",
      });
      setPlan((prev) => (prev ? { ...prev, status } : prev));
      setSelectedStatus(status);
      setIsEditingStatus(false);

      Swal.fire({
        icon: "success",
        title: formDictionary.save_success_update,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: formDictionary.save_error,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2400,
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden rounded-lg border bg-white p-4 dark:border-[#34363B] dark:bg-[#26282D]">
      {loadingPlan ? (
        <SectionEmpty text={detailDictionary.loading} />
      ) : !plan ? (
        <SectionEmpty text={detailDictionary.not_found} />
      ) : (
        <div className="flex h-full min-h-0 flex-col gap-4">
          <div className="rounded-2xl border bg-slate-50 p-4 dark:border-[#34363B] dark:bg-[#1F2023]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {dictionary.title} {detailDictionary.title_suffix}
                </div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {detailDictionary.summary_prefix} {formatDate(plan.startDate)}{" "}
                  - {formatDate(plan.endDate)} •{" "}
                  {plan.targetJirigenTotal.toLocaleString("id-ID")}{" "}
                  {detailDictionary.summary_jirigen_suffix}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isEditingStatus ? "default" : "outline"}
                  size="sm"
                  className="shrink-0 gap-2"
                  onClick={() => {
                    if (isEditingStatus) {
                      void handleUpdateStatus(selectedStatus);
                      return;
                    }

                    setSelectedStatus(plan.status ?? "");
                    setIsEditingStatus(true);
                  }}
                  disabled={
                    updatingStatus ||
                    (isEditingStatus &&
                      (!selectedStatus || selectedStatus === plan.status))
                  }
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isEditingStatus ? (
                    "Save"
                  ) : (
                    <>
                      <Pencil className="h-4 w-4" />
                      Update Status
                    </>
                  )}
                </Button>

                {isEditingStatus ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-2"
                    disabled={updatingStatus}
                    onClick={() => {
                      setSelectedStatus(plan.status ?? "");
                      setIsEditingStatus(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border bg-white p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {detailDictionary.tank}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {plan.tank?.tankName || plan.tank?.tankCode || "-"}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tank Volume
                </div>
                <div className="mt-3">
                  <div className="mb-3 h-28 overflow-hidden rounded-2xl border bg-slate-100 dark:border-[#34363B] dark:bg-[#1F2023]">
                    <div className="flex h-full items-end justify-center px-6 pb-4">
                      <div className="relative h-full w-full max-w-16 overflow-hidden rounded-t-[20px] border-4 border-slate-300 bg-white dark:border-slate-600 dark:bg-[#26282D]">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500"
                          style={{ height: `${tankVolumePercentage}%` }}
                        />
                        <div className="absolute inset-x-0 top-2 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-300">
                          {tankVolumePercentage}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatNumber(plan.tank?.currentVolume)} /{" "}
                    {formatNumber(plan.tank?.totalCapacity)} L
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                      style={{ width: `${tankVolumePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border bg-white p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {detailDictionary.target_batch}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {plan.targetBatches}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {detailDictionary.target_jirigen}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {plan.targetJirigenTotal.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {detailDictionary.status}
                </div>
                {isEditingStatus ? (
                  <div className="mt-2">
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={detailDictionary.status} />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {statusOptions.find(
                      (option) => option.value === plan.status,
                    )?.label ??
                      plan.status?.replaceAll("_", " ") ??
                      "-"}
                  </div>
                )}
              </div>
              <div className="rounded-xl border bg-white p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Notes
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100">
                  {plan.notes?.trim() || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <ProductionBatchesSection
              dictionary={detailDictionary}
              isOpen={isBatchOpen}
              loading={loadingBatches}
              batches={batches}
              onToggle={handleToggleBatches}
              onCreate={handleOpenCreateBatchModal}
              onEdit={handleEditBatch}
              onOpenFilter={() => setIsBatchFilterModalOpen(true)}
              onRefresh={() => loadBatches()}
              formatDate={formatDate}
              renderEmpty={(text) => <SectionEmpty text={text} />}
            />

            <ProductionJirigenSection
              dictionary={detailDictionary}
              isOpen={isJirigenOpen}
              loading={loadingJirigens}
              jirigens={jirigens}
              batchesCount={batches.length}
              hasLoadedBatches={hasLoadedBatches}
              onToggle={handleToggleJirigens}
              onCreate={handleOpenJirigenModal}
              onPrintBarcode={handlePrintJirigenBarcode}
              printingBarcodeId={printingBarcodeId}
              onOpenFilter={() => setIsJirigenFilterModalOpen(true)}
              onRefresh={() => loadJirigens()}
              formatDate={formatDate}
              renderEmpty={(text) => <SectionEmpty text={text} />}
            />
          </div>
        </div>
      )}

      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          resetBatchForm();
        }}
        onCancel={() => {
          setIsBatchModalOpen(false);
          resetBatchForm();
        }}
        title={
          editingBatchId
            ? detailDictionary.batch_modal_title_edit
            : detailDictionary.batch_modal_title
        }
        width={`${isMobile ? "w-[95vw]" : "w-[920px]"}`}
        onSubmit={handleBatchSubmit}
        showConfirmButton={false}
      >
        <div className="max-h-[85vh] overflow-y-auto p-5">
          <div className="mb-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {editingBatchId
                ? detailDictionary.batch_modal_description_edit
                : detailDictionary.batch_modal_description}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="batchNumber">
                {detailDictionary.batch_number}
              </Label>
              <Input
                id="batchNumber"
                value={batchForm.batchNumber}
                onChange={(event) =>
                  setBatchForm((prev) => ({
                    ...prev,
                    batchNumber: event.target.value,
                  }))
                }
                placeholder="B-202603-001"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="batchStartDate">
                  {detailDictionary.batch_start_date}
                </Label>
                <Input
                  id="batchStartDate"
                  type="date"
                  value={batchForm.startDate}
                  onChange={(event) =>
                    setBatchForm((prev) => ({
                      ...prev,
                      startDate: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchEndDate">
                  {detailDictionary.batch_end_date}
                </Label>
                <Input
                  id="batchEndDate"
                  type="date"
                  value={batchForm.endDate}
                  onChange={(event) =>
                    setBatchForm((prev) => ({
                      ...prev,
                      endDate: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rawMaterialVolume">
                  {detailDictionary.batch_raw_material_volume}
                </Label>
                <Input
                  id="rawMaterialVolume"
                  type="number"
                  min={0}
                  value={batchForm.rawMaterialVolume}
                  onChange={(event) =>
                    setBatchForm((prev) => ({
                      ...prev,
                      rawMaterialVolume: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetQuantityJirigen">
                  {detailDictionary.batch_target_quantity_jirigen}
                </Label>
                <Input
                  id="targetQuantityJirigen"
                  type="number"
                  min={0}
                  value={batchForm.targetQuantityJirigen}
                  onChange={(event) =>
                    setBatchForm((prev) => ({
                      ...prev,
                      targetQuantityJirigen: Number(event.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNotes">{detailDictionary.batch_notes}</Label>
              <Textarea
                id="batchNotes"
                value={batchForm.notes}
                onChange={(event) =>
                  setBatchForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                placeholder={detailDictionary.batch_notes_placeholder}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-iprimary-blue text-white hover:bg-iprimary-blue/90"
              disabled={submittingBatch}
            >
              {submittingBatch
                ? editingBatchId
                  ? detailDictionary.batch_update_loading
                  : detailDictionary.batch_submit_loading
                : editingBatchId
                  ? detailDictionary.batch_update_submit
                  : detailDictionary.batch_submit}
            </Button>
          </div>
        </div>
      </Modal>

      <ModalFilterProductionBatches
        isOpen={isBatchFilterModalOpen}
        onClose={() => setIsBatchFilterModalOpen(false)}
        onSubmit={handleApplyBatchFilters}
        onClear={handleClearBatchFilters}
        dictionary={detailDictionary}
        title={detailDictionary.batch_filter_modal_title}
      />

      <Modal
        isOpen={isJirigenModalOpen}
        onClose={() => setIsJirigenModalOpen(false)}
        onCancel={() => setIsJirigenModalOpen(false)}
        title={detailDictionary.jirigen_modal_title}
        width={`${isMobile ? "w-[95vw]" : "w-[920px]"}`}
        onSubmit={handleJirigenSubmit}
        showConfirmButton={false}
      >
        <div className="max-h-[85vh] overflow-y-auto p-5">
          <div className="mb-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {detailDictionary.jirigen_modal_description}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="batchId">{detailDictionary.jirigen_batch}</Label>
              <Select
                value={
                  jirigenForm.batchId ? String(jirigenForm.batchId) : undefined
                }
                onValueChange={(value) =>
                  setJirigenForm((prev) => ({
                    ...prev,
                    batchId: Number(value),
                  }))
                }
              >
                <SelectTrigger id="batchId" className="w-full">
                  <SelectValue
                    placeholder={detailDictionary.jirigen_batch_placeholder}
                  />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={String(batch.id)}>
                      {batch.batchNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jirigenNumber">
                  {detailDictionary.jirigen_number}
                </Label>
                <Input
                  id="jirigenNumber"
                  type="number"
                  min={1}
                  value={jirigenForm.jirigenNumber}
                  onChange={(event) =>
                    setJirigenForm((prev) => ({
                      ...prev,
                      jirigenNumber: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volumeLiter">
                  {detailDictionary.jirigen_volume_liter}
                </Label>
                <Input
                  id="volumeLiter"
                  type="number"
                  min={0}
                  value={jirigenForm.volumeLiter}
                  onChange={(event) =>
                    setJirigenForm((prev) => ({
                      ...prev,
                      volumeLiter: Number(event.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productionDatetime">
                {detailDictionary.jirigen_production_datetime}
              </Label>
              <Input
                id="productionDatetime"
                type="datetime-local"
                value={jirigenForm.productionDatetime}
                onChange={(event) =>
                  setJirigenForm((prev) => ({
                    ...prev,
                    productionDatetime: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jirigenNotes">
                {detailDictionary.jirigen_notes}
              </Label>
              <Textarea
                id="jirigenNotes"
                value={jirigenForm.notes}
                onChange={(event) =>
                  setJirigenForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                placeholder={detailDictionary.jirigen_notes_placeholder}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-iprimary-blue text-white hover:bg-iprimary-blue/90"
              disabled={submittingJirigen || batches.length === 0}
            >
              {submittingJirigen
                ? detailDictionary.jirigen_submit_loading
                : detailDictionary.jirigen_submit}
            </Button>
          </div>
        </div>
      </Modal>

      <Dialog
        open={isBarcodePreviewOpen}
        onOpenChange={(open) => {
          setIsBarcodePreviewOpen(open);
          if (!open && barcodePreviewUrl) {
            URL.revokeObjectURL(barcodePreviewUrl);
            setBarcodePreviewUrl(null);
          }
        }}
      >
        <DialogContent className="flex h-[85vh] max-w-5xl flex-col" showCloseButton>
          <DialogHeader>
            <DialogTitle>Preview Barcode Jirigen</DialogTitle>
            <DialogDescription>
              Preview PDF barcode berdasarkan production jirigen terpilih.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handlePrintBarcodePreview}
              disabled={loadingBarcodePreview || !barcodePreviewUrl}
              className="bg-iprimary-blue text-white hover:bg-iprimary-blue/90"
            >
              Print PDF
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-slate-50 dark:border-[#34363B] dark:bg-[#1F2023]">
            {loadingBarcodePreview ? (
              <div className="flex h-full min-h-[60vh] items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                <Loader2 className="h-5 w-5 animate-spin" />
                Memuat preview barcode...
              </div>
            ) : barcodePreviewUrl ? (
              <iframe
                ref={barcodePreviewFrameRef}
                src={barcodePreviewUrl}
                title="Preview Barcode PDF"
                className="h-full min-h-[60vh] w-full"
              />
            ) : (
              <div className="flex h-full min-h-[60vh] items-center justify-center text-sm text-slate-500 dark:text-slate-300">
                Preview PDF belum tersedia.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ModalFilterProductionJirigen
        isOpen={isJirigenFilterModalOpen}
        onClose={() => setIsJirigenFilterModalOpen(false)}
        onSubmit={handleApplyJirigenFilters}
        onClear={handleClearJirigenFilters}
        dictionary={detailDictionary}
        title={detailDictionary.jirigen_filter_modal_title}
        batches={batches}
      />
    </div>
  );
}
