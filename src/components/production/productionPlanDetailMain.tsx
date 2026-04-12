"use client";

import { productionPlanService } from "@/services";
import {
  IAddProductionBatch,
  IAddProductionJirigen,
  IProductionBatch,
  IProductionJirigen,
  IProductionPlan,
} from "@/types/production";
import { getDictionary } from "../../../get-dictionary";
import { useEffect, useMemo, useState } from "react";
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
import Swal from "sweetalert2";
import { ChevronDown, Plus } from "lucide-react";

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
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingJirigens, setLoadingJirigens] = useState(false);
  const [submittingBatch, setSubmittingBatch] = useState(false);
  const [submittingJirigen, setSubmittingJirigen] = useState(false);

  const [plan, setPlan] = useState<IProductionPlan | null>(null);
  const [batches, setBatches] = useState<IProductionBatch[]>([]);
  const [jirigens, setJirigens] = useState<IProductionJirigen[]>([]);

  const [batchForm, setBatchForm] = useState<IAddProductionBatch>(initialBatchForm);
  const [jirigenForm, setJirigenForm] =
    useState<IAddProductionJirigen>(initialJirigenForm);

  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isJirigenOpen, setIsJirigenOpen] = useState(false);
  const [hasLoadedBatches, setHasLoadedBatches] = useState(false);
  const [hasLoadedJirigens, setHasLoadedJirigens] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isJirigenModalOpen, setIsJirigenModalOpen] = useState(false);

  const batchCounts = useMemo(() => {
    return jirigens.reduce<Record<number, number>>((acc, jirigen) => {
      acc[jirigen.batchId] = (acc[jirigen.batchId] ?? 0) + 1;
      return acc;
    }, {});
  }, [jirigens]);

  const loadPlan = async () => {
    try {
      setLoadingPlan(true);
      const planResponse = await productionPlanService.getProductionPlan(planId);
      const planData = planResponse?.data ?? null;
      setPlan(planData);

      if (planData) {
        setBatchForm((prev) => ({
          ...prev,
          tankId: Number(planData.tankId) || 0,
          planId: Number(planData.id) || Number(planId),
          startDate: planData.startDate?.slice(0, 10) ?? "",
          endDate: planData.startDate?.slice(0, 10) ?? "",
        }));
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat detail production plan",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });
    } finally {
      setLoadingPlan(false);
    }
  };

  const loadBatches = async () => {
    try {
      setLoadingBatches(true);
      const batchResponse = await productionPlanService.getProductionBatches({
        planId,
        limit: 100,
      });
      const batchData = toList<IProductionBatch>(batchResponse);
      setBatches(batchData);
      setHasLoadedBatches(true);

      setJirigenForm((prev) => ({
        ...prev,
        batchId: batchData[0]?.id ?? prev.batchId ?? 0,
        productionDatetime:
          prev.productionDatetime || formatDateTimeLocal(new Date().toISOString()),
      }));
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat production batches",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });
    } finally {
      setLoadingBatches(false);
    }
  };

  const loadJirigens = async () => {
    try {
      setLoadingJirigens(true);
      const jirigenResponse = await productionPlanService.getProductionJirigens({
        planId,
        limit: 500,
      });
      setJirigens(toList<IProductionJirigen>(jirigenResponse));
      setHasLoadedJirigens(true);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat production jirigen",
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

  const handleBatchSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!plan || !batchForm.batchNumber || !batchForm.startDate || !batchForm.endDate) {
      return;
    }

    try {
      setSubmittingBatch(true);
      await productionPlanService.createProductionBatch({
        ...batchForm,
        tankId: Number(plan.tankId),
        planId: Number(plan.id),
        rawMaterialVolume: Number(batchForm.rawMaterialVolume),
        targetQuantityJirigen: Number(batchForm.targetQuantityJirigen),
      });

      Swal.fire({
        icon: "success",
        title: "Batch produksi berhasil dibuat",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });

      setBatchForm((prev) => ({
        ...prev,
        batchNumber: "",
        rawMaterialVolume: 0,
        targetQuantityJirigen: 0,
        notes: "",
      }));
      setIsBatchModalOpen(false);
      setIsBatchOpen(true);
      await loadBatches();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal membuat batch produksi",
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
        title: "Production jirigen berhasil dibuat",
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
        title: "Gagal membuat production jirigen",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });
    } finally {
      setSubmittingJirigen(false);
    }
  };

  return (
    <div className="h-full w-full rounded-lg border bg-white p-4 dark:border-[#34363B] dark:bg-[#26282D]">
      {loadingPlan ? (
        <SectionEmpty text="Loading production detail..." />
      ) : !plan ? (
        <SectionEmpty text="Production plan tidak ditemukan." />
      ) : (
        <div className="flex h-full min-h-0 flex-col gap-4">
          <div className="rounded-2xl border bg-slate-50 p-4 dark:border-[#34363B] dark:bg-[#1F2023]">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {dictionary.title} Detail
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Plan {formatDate(plan.startDate)} - {formatDate(plan.endDate)} •{" "}
              {plan.targetJirigenTotal.toLocaleString("id-ID")} jirigen
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-xl border bg-white p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tank
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {plan.tank?.tankName || plan.tank?.tankCode || "-"}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Target Batch
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {plan.targetBatches}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Target Jirigen
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {plan.targetJirigenTotal.toLocaleString("id-ID")}
                </div>
              </div>
              <div className="rounded-xl border bg-white p-3 dark:border-[#34363B] dark:bg-[#26282D]">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </div>
                <div className="mt-1 text-sm font-semibold capitalize text-slate-900 dark:text-slate-100">
                  {plan.status?.replaceAll("_", " ") || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border p-4 dark:border-[#34363B]">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleToggleBatches}
                  className="flex flex-1 items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-left dark:bg-[#1F2023]"
                >
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Production Batches
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Lihat detail batch produksi untuk plan ini
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-500 transition-transform dark:text-slate-300 ${
                      isBatchOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <Button
                  type="button"
                  onClick={() => setIsBatchModalOpen(true)}
                  className="bg-iprimary-blue text-white hover:bg-iprimary-blue/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Batch
                </Button>
              </div>

              {isBatchOpen ? (
                <div className="mt-4 space-y-3">
                  {loadingBatches ? (
                    <SectionEmpty text="Loading production batches..." />
                  ) : batches.length ? (
                    batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="rounded-xl border bg-slate-50 p-4 dark:border-[#34363B] dark:bg-[#1F2023]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                              {batch.batchNumber}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                            </div>
                          </div>
                          <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-[#2E3138] dark:text-blue-300">
                            {batchCounts[batch.id] ?? 0} jirigen
                          </div>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            Raw material:{" "}
                            <span className="font-semibold">
                              {Number(batch.rawMaterialVolume).toLocaleString("id-ID")} L
                            </span>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            Target quantity:{" "}
                            <span className="font-semibold">
                              {Number(batch.targetQuantityJirigen).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                        {batch.notes ? (
                          <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {batch.notes}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <SectionEmpty text="Belum ada batch produksi untuk plan ini." />
                  )}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border p-4 dark:border-[#34363B]">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleToggleJirigens}
                  className="flex flex-1 items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-left dark:bg-[#1F2023]"
                >
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Production Jirigen
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Lihat hasil produksi jirigen dari batch yang tersedia
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-500 transition-transform dark:text-slate-300 ${
                      isJirigenOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <Button
                  type="button"
                  onClick={handleOpenJirigenModal}
                  className="bg-iprimary-blue text-white hover:bg-iprimary-blue/90"
                  disabled={hasLoadedBatches ? batches.length === 0 : false}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Jirigen
                </Button>
              </div>

              {isJirigenOpen ? (
                <div className="mt-4 space-y-2">
                  {loadingJirigens ? (
                    <SectionEmpty text="Loading production jirigen..." />
                  ) : jirigens.length ? (
                    jirigens.map((jirigen) => (
                      <div
                        key={jirigen.id}
                        className="flex flex-col gap-1 rounded-xl border bg-slate-50 p-3 dark:border-[#34363B] dark:bg-[#1F2023] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Jirigen #{jirigen.jirigenNumber}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Batch ID {jirigen.batchId} •{" "}
                            {formatDate(jirigen.productionDatetime)}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {Number(jirigen.volumeLiter).toLocaleString("id-ID")} L
                        </div>
                      </div>
                    ))
                  ) : (
                    <SectionEmpty text="Belum ada data hasil produksi jirigen." />
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Production Batch</DialogTitle>
            <DialogDescription>
              Tambahkan batch produksi baru untuk production plan ini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBatchSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
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
                <Label htmlFor="batchStartDate">Start Date</Label>
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
                <Label htmlFor="batchEndDate">End Date</Label>
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
                <Label htmlFor="rawMaterialVolume">Raw Material Volume</Label>
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
                  Target Quantity Jirigen
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
              <Label htmlFor="batchNotes">Notes</Label>
              <Textarea
                id="batchNotes"
                value={batchForm.notes}
                onChange={(event) =>
                  setBatchForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                placeholder="Batch produksi awal"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-iprimary-blue text-white hover:bg-iprimary-blue/90"
              disabled={submittingBatch}
            >
              {submittingBatch ? "Menyimpan batch..." : "Simpan Batch"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isJirigenModalOpen} onOpenChange={setIsJirigenModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Production Jirigen</DialogTitle>
            <DialogDescription>
              Tambahkan hasil produksi jirigen berdasarkan batch yang dipilih.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJirigenSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="batchId">Batch</Label>
              <Select
                value={jirigenForm.batchId ? String(jirigenForm.batchId) : undefined}
                onValueChange={(value) =>
                  setJirigenForm((prev) => ({
                    ...prev,
                    batchId: Number(value),
                  }))
                }
              >
                <SelectTrigger id="batchId" className="w-full">
                  <SelectValue placeholder="Pilih batch" />
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
                <Label htmlFor="jirigenNumber">Jirigen Number</Label>
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
                <Label htmlFor="volumeLiter">Volume Liter</Label>
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
              <Label htmlFor="productionDatetime">Production Datetime</Label>
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
              <Label htmlFor="jirigenNotes">Notes</Label>
              <Textarea
                id="jirigenNotes"
                value={jirigenForm.notes}
                onChange={(event) =>
                  setJirigenForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                placeholder="Produksi normal"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-iprimary-blue text-white hover:bg-iprimary-blue/90"
              disabled={submittingJirigen || batches.length === 0}
            >
              {submittingJirigen ? "Menyimpan jirigen..." : "Simpan Jirigen"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
