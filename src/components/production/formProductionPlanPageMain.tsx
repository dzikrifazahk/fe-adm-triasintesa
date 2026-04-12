"use client";

import { productionPlanService, tanksService } from "@/services";
import { IAddOrUpdateProductionPlan, IProductionPlan } from "@/types/production";
import { ITank } from "@/types/tanks";
import { getDictionary } from "../../../get-dictionary";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
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
import { Beaker, CalendarRange, Droplets, Package2 } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["production_page_dic"];
  lang: string;
  planId?: string;
};

const initialForm: IAddOrUpdateProductionPlan = {
  startDate: "",
  endDate: "",
  tankId: 0,
  targetBatches: 0,
  targetJirigenTotal: 0,
  notes: "",
  // status: "planned",
};

const statusOptions = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancel", label: "Cancel" },
];

function normalizeNumber(value?: string | number | null) {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatNumber(value?: string | number | null) {
  return normalizeNumber(value).toLocaleString("id-ID");
}

export default function FormProductionPlanMain({
  dictionary,
  lang,
  planId,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<IAddOrUpdateProductionPlan>(initialForm);
  const [tanks, setTanks] = useState<ITank[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedTank = useMemo(
    () => tanks.find((tank) => tank.id === form.tankId) ?? null,
    [tanks, form.tankId],
  );

  const tankCurrentVolume = useMemo(
    () => normalizeNumber(selectedTank?.currentVolume),
    [selectedTank],
  );
  const tankTotalCapacity = useMemo(
    () => normalizeNumber(selectedTank?.totalCapacity),
    [selectedTank],
  );
  const tankVolumePercentage = useMemo(() => {
    if (tankTotalCapacity <= 0) return 0;
    return Math.min(
      100,
      Math.max(0, Math.round((tankCurrentVolume / tankTotalCapacity) * 100)),
    );
  }, [tankCurrentVolume, tankTotalCapacity]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [{ data: tankResponse }, planResponse] = await Promise.all([
          tanksService.getTanks({ limit: 100 }),
          planId
            ? productionPlanService.getProductionPlan(planId)
            : Promise.resolve(null),
        ]);

        setTanks(tankResponse.data ?? []);

        if (planResponse?.data) {
          const plan: IProductionPlan = planResponse.data;
          setForm({
            startDate: plan.startDate?.slice(0, 10) ?? "",
            endDate: plan.endDate?.slice(0, 10) ?? "",
            tankId: Number(plan.tankId) || 0,
            targetBatches: Number(plan.targetBatches) || 0,
            targetJirigenTotal: Number(plan.targetJirigenTotal) || 0,
            notes: plan.notes ?? "",
            // status: plan.status ?? "planned",
          });
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data production plan",
          toast: true,
          position: "top-right",
          showConfirmButton: false,
          timer: 2200,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [planId]);

  const handleChange = <K extends keyof IAddOrUpdateProductionPlan>(
    key: K,
    value: IAddOrUpdateProductionPlan[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.startDate || !form.endDate || !form.tankId) {
      Swal.fire({
        icon: "warning",
        title: "Tanggal dan tank wajib dipilih",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });
      return;
    }

    const payload: IAddOrUpdateProductionPlan = {
      startDate: form.startDate,
      endDate: form.endDate,
      tankId: Number(form.tankId),
      targetBatches: Number(form.targetBatches),
      targetJirigenTotal: Number(form.targetJirigenTotal),
      notes: form.notes,
      // status: form.status ?? "planned",
    };

    const result = await Swal.fire({
      icon: "question",
      title: planId
        ? "Simpan perubahan production plan?"
        : "Tambahkan production plan baru?",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2B59FF",
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);

      if (planId) {
        await productionPlanService.updateProductionPlan(planId, payload);
      } else {
        await productionPlanService.createProductionPlan(payload);
      }

      Swal.fire({
        icon: "success",
        title: planId
          ? "Production plan berhasil diperbarui"
          : "Production plan berhasil dibuat",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });

      router.push(`/${lang}/dashboard/production`);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan production plan",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2400,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!planId) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Hapus production plan ini?",
      text: "Data yang dihapus tidak dapat dikembalikan.",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#DC2626",
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await productionPlanService.deleteProductionPlan(planId);

      Swal.fire({
        icon: "success",
        title: "Production plan berhasil dihapus",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2200,
      });

      router.push(`/${lang}/dashboard/production`);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus production plan",
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2400,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full rounded-lg border bg-muted/30 p-2">
      <div className="flex h-full min-h-0 flex-col rounded-lg border bg-white shadow-sm">
        <div className="border-b px-4 py-3 sm:px-5">
          <div className="text-lg font-bold text-slate-900">
            {planId ? "Update Production Plan" : "Create Production Plan"}
          </div>
          <div className="text-sm text-slate-500">
            {dictionary.description}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:grid-cols-[minmax(0,1.3fr)_320px] sm:p-5"
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    handleChange("startDate", event.target.value)
                  }
                  disabled={loading || submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(event) =>
                    handleChange("endDate", event.target.value)
                  }
                  disabled={loading || submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tankId">Tank</Label>
              <Select
                value={form.tankId ? String(form.tankId) : undefined}
                onValueChange={(value) => handleChange("tankId", Number(value))}
                disabled={loading || submitting}
              >
                <SelectTrigger id="tankId" className="w-full">
                  <SelectValue placeholder="Pilih tank" />
                </SelectTrigger>
                <SelectContent>
                  {tanks.map((tank) => (
                    <SelectItem key={tank.id} value={String(tank.id)}>
                      {tank.tankName} ({tank.tankCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="targetBatches">Target Batches</Label>
                <Input
                  id="targetBatches"
                  type="number"
                  min={0}
                  value={form.targetBatches}
                  onChange={(event) =>
                    handleChange("targetBatches", Number(event.target.value))
                  }
                  disabled={loading || submitting}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetJirigenTotal">Target Jirigen Total</Label>
                <Input
                  id="targetJirigenTotal"
                  type="number"
                  min={0}
                  value={form.targetJirigenTotal}
                  onChange={(event) =>
                    handleChange(
                      "targetJirigenTotal",
                      Number(event.target.value),
                    )
                  }
                  disabled={loading || submitting}
                  placeholder="1000"
                />
              </div>
            </div>

            {planId && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status ?? "planned"}
                  onValueChange={(value) => handleChange("status", value)}
                  disabled={loading || submitting}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => handleChange("notes", event.target.value)}
                disabled={loading || submitting}
                placeholder="Produksi untuk minggu ini"
                className="min-h-32"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${lang}/dashboard/production`)}
                disabled={submitting}
              >
                Kembali
              </Button>
              {planId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={loading || submitting}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Hapus Production Plan
                </Button>
              )}
              <Button
                type="submit"
                className="bg-iprimary-blue text-white hover:bg-iprimary-blue/90"
                disabled={loading || submitting}
              >
                {submitting
                  ? "Menyimpan..."
                  : planId
                    ? "Update Production Plan"
                    : "Simpan Production Plan"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="mb-4">
              <div className="text-base font-semibold text-slate-900">
                Tank Volume Overview
              </div>
              <div className="text-sm text-slate-500">
                Visualisasi kapasitas tank yang dipilih untuk production plan.
              </div>
            </div>

            {selectedTank ? (
              <div className="space-y-4">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">
                        {selectedTank.tankName}
                      </div>
                      <div className="text-sm text-slate-500">
                        {selectedTank.tankCode} • {selectedTank.location || "-"}
                      </div>
                    </div>

                    <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                      {selectedTank.status?.replaceAll("_", " ") || "-"}
                    </div>
                  </div>

                  <div className="mb-3 h-48 overflow-hidden rounded-2xl border bg-slate-100">
                    <div className="flex h-full items-end justify-center px-10 pb-6">
                      <div className="relative h-full w-full max-w-28 overflow-hidden rounded-t-[28px] border-4 border-slate-300 bg-white">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500"
                          style={{ height: `${tankVolumePercentage}%` }}
                        />
                        <div className="absolute inset-x-0 top-3 text-center text-xs font-semibold text-slate-500">
                          {tankVolumePercentage}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border bg-slate-50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                        <Droplets className="h-4 w-4" />
                        Current Volume
                      </div>
                      <div className="text-lg font-semibold text-slate-900">
                        {formatNumber(selectedTank.currentVolume)} L
                      </div>
                    </div>

                    <div className="rounded-xl border bg-slate-50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                        <Beaker className="h-4 w-4" />
                        Total Capacity
                      </div>
                      <div className="text-lg font-semibold text-slate-900">
                        {formatNumber(selectedTank.totalCapacity)} L
                      </div>
                    </div>

                    <div className="rounded-xl border bg-slate-50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                        <Package2 className="h-4 w-4" />
                        Target Batches
                      </div>
                      <div className="text-lg font-semibold text-slate-900">
                        {formatNumber(form.targetBatches)}
                      </div>
                    </div>

                    <div className="rounded-xl border bg-slate-50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                        <CalendarRange className="h-4 w-4" />
                        Target Jirigen
                      </div>
                      <div className="text-lg font-semibold text-slate-900">
                        {formatNumber(form.targetJirigenTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed bg-white p-6 text-center text-sm text-slate-500">
                Pilih tank terlebih dahulu untuk melihat visual volume dan
                kapasitasnya.
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
