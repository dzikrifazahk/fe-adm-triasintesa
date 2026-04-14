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
  const productionPlanDictionary = dictionary.production_plan;
  const formDictionary = productionPlanDictionary.form;
  const statusOptions = [
    {
      value: "planned",
      label: productionPlanDictionary.layout.status_planned,
    },
    {
      value: "in_progress",
      label: productionPlanDictionary.layout.status_in_progress,
    },
    {
      value: "completed",
      label: productionPlanDictionary.layout.status_completed,
    },
    {
      value: "cancel",
      label: productionPlanDictionary.layout.status_cancel,
    },
  ];
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
          title: formDictionary.load_error,
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
        title: formDictionary.required_warning,
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
        ? formDictionary.confirm_update
        : formDictionary.confirm_create,
      showCancelButton: true,
      confirmButtonText: formDictionary.confirm_yes,
      cancelButtonText: formDictionary.confirm_cancel,
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
          ? formDictionary.save_success_update
          : formDictionary.save_success_create,
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
        title: formDictionary.save_error,
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
      title: formDictionary.delete_confirm_title,
      text: formDictionary.delete_confirm_text,
      showCancelButton: true,
      confirmButtonText: formDictionary.delete_confirm_button,
      cancelButtonText: formDictionary.confirm_cancel,
      confirmButtonColor: "#DC2626",
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await productionPlanService.deleteProductionPlan(planId);

      Swal.fire({
        icon: "success",
        title: formDictionary.delete_success,
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
        title: formDictionary.delete_error,
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
            {planId ? formDictionary.update_title : formDictionary.create_title}
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
                <Label htmlFor="startDate">{formDictionary.field_start_date}</Label>
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
                <Label htmlFor="endDate">{formDictionary.field_end_date}</Label>
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
              <Label htmlFor="tankId">{formDictionary.field_tank}</Label>
              <Select
                value={form.tankId ? String(form.tankId) : undefined}
                onValueChange={(value) => handleChange("tankId", Number(value))}
                disabled={loading || submitting}
              >
                <SelectTrigger id="tankId" className="w-full">
                  <SelectValue placeholder={formDictionary.field_tank_placeholder} />
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
                <Label htmlFor="targetBatches">{formDictionary.field_target_batches}</Label>
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
                <Label htmlFor="targetJirigenTotal">{formDictionary.field_target_jirigen_total}</Label>
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
                <Label htmlFor="status">{formDictionary.field_status}</Label>
                <Select
                  value={form.status ?? "planned"}
                  onValueChange={(value) => handleChange("status", value)}
                  disabled={loading || submitting}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder={formDictionary.field_status_placeholder} />
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
              <Label htmlFor="notes">{formDictionary.field_notes}</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => handleChange("notes", event.target.value)}
                disabled={loading || submitting}
                placeholder={formDictionary.notes_placeholder}
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
                {formDictionary.button_back}
              </Button>
              {planId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={loading || submitting}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  {formDictionary.button_delete}
                </Button>
              )}
              <Button
                type="submit"
                className="bg-iprimary-blue text-white hover:bg-iprimary-blue/90"
                disabled={loading || submitting}
              >
                {submitting
                  ? formDictionary.button_submitting
                  : planId
                    ? formDictionary.button_update
                    : formDictionary.button_save}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="mb-4">
              <div className="text-base font-semibold text-slate-900">
                {formDictionary.overview_title}
              </div>
              <div className="text-sm text-slate-500">
                {formDictionary.overview_description}
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
                        {formDictionary.current_volume}
                      </div>
                      <div className="text-lg font-semibold text-slate-900">
                        {formatNumber(selectedTank.currentVolume)} L
                      </div>
                    </div>

                    <div className="rounded-xl border bg-slate-50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                        <Beaker className="h-4 w-4" />
                        {formDictionary.total_capacity}
                      </div>
                      <div className="text-lg font-semibold text-slate-900">
                        {formatNumber(selectedTank.totalCapacity)} L
                      </div>
                    </div>

                    <div className="rounded-xl border bg-slate-50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                        <Package2 className="h-4 w-4" />
                        {formDictionary.target_batches}
                      </div>
                      <div className="text-lg font-semibold text-slate-900">
                        {formatNumber(form.targetBatches)}
                      </div>
                    </div>

                    <div className="rounded-xl border bg-slate-50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                        <CalendarRange className="h-4 w-4" />
                        {formDictionary.target_jirigen}
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
                {formDictionary.empty_selected_tank}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
