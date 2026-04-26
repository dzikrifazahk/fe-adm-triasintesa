"use client";
import { useEffect, useMemo, useState } from "react";
import { useLoading } from "@/context/loadingContext";
import { ITank, ITankLog } from "@/types/tanks";
import { tanksService } from "@/services";
import Swal from "sweetalert2";
import { getDictionary } from "../../../get-dictionary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Clock3, Droplets, Minus, Plus, RotateCw, User } from "lucide-react";
import { IMeta } from "@/types/common";

type RefillMode = "logs" | "increase" | "decrease";

type VolumeActionState = {
  open: boolean;
  tank: ITank | null;
  mode: RefillMode;
  amount: number;
  notes: string;
};

const initialActionState: VolumeActionState = {
  open: false,
  tank: null,
  mode: "logs",
  amount: 0,
  notes: "",
};

function normalizeNumber(value?: string | number | null) {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatNumber(value?: string | number | null) {
  return normalizeNumber(value).toLocaleString("id-ID");
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTankPercent(tank?: ITank | null) {
  const current = normalizeNumber(tank?.currentVolume);
  const total = normalizeNumber(tank?.totalCapacity);
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / total) * 100)));
}

function getStatusTone(status?: string) {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300";
    case "in_use":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
    case "maintenance":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

export default function TanksRefillMain({
  dictionary,
}: {
  dictionary: Awaited<
    ReturnType<typeof getDictionary>
  >["tanks_refill_page_dic"];
}) {
  const { setIsLoading } = useLoading();
  const [tanks, setTanks] = useState<ITank[]>([]);
  const [search, setSearch] = useState("");
  const [tankLogs, setTankLogs] = useState<ITankLog[]>([]);
  const [metaTankLogs, setMetaTankLogs] = useState<IMeta>();

  const [actionState, setActionState] =
    useState<VolumeActionState>(initialActionState);

  const getTanks = async () => {
    setIsLoading(true);
    try {
      const response = await tanksService.getTanks();
      setTanks(response?.data?.data ?? response?.data ?? []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: dictionary.toast.fetch_error_title,
        text: dictionary.toast.fetch_error_text,
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTankLogs = async (
    tankId: number,
    page: number = 1,
    pageSize: number = 10,
    search: string = "",
    payload: Record<string, any> = {},
  ) => {
    try {
      let filterParams: Record<string, any> = {};
      if (tankId) {
        filterParams.tankId = tankId;
      }
      
      if (page) {
        filterParams.page = page;
      }
      if (pageSize) {
        filterParams.limit = pageSize;
      }
      if (search) {
        filterParams.search = search;
      }
      filterParams = { ...filterParams, ...payload };

      setIsLoading(true);
      const response = await tanksService.tankLogs(filterParams);
      setTankLogs(response?.data?.data ?? response?.data ?? []);
      setMetaTankLogs(response?.data?.meta ?? null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: dictionary.toast.fetch_error_title,
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTanks();
  }, []);

  const filteredTanks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return tanks;

    return tanks.filter((tank) =>
      [tank.tankName, tank.tankCode, tank.location, tank.status]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [search, tanks]);

  const selectedTank = actionState.tank;
  const selectedTankCurrentVolume = normalizeNumber(
    selectedTank?.currentVolume,
  );
  const selectedTankTotalCapacity = normalizeNumber(
    selectedTank?.totalCapacity,
  );

  const projectedVolume = useMemo(() => {
    if (!selectedTank) return 0;

    const amount = normalizeNumber(actionState.amount);
    const base = selectedTankCurrentVolume;
    const total = selectedTankTotalCapacity;

    if (actionState.mode === "logs") {
      return base;
    }

    if (actionState.mode === "decrease") {
      return Math.max(0, base - amount);
    }

    return Math.min(total, base + amount);
  }, [
    actionState.amount,
    actionState.mode,
    selectedTank,
    selectedTankCurrentVolume,
    selectedTankTotalCapacity,
  ]);

  const openActionModal = (tank: ITank, mode: RefillMode) => {
    if (mode === "logs") {
      getTankLogs(tank.id, 1);
    }

    setActionState({
      open: true,
      tank,
      mode,
      amount: 0,
      notes: "",
    });
  };

  const closeActionModal = () =>
    setActionState((prev) => ({ ...prev, open: false }));

  const handleSubmitAction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTank) return;

    const pendingAction = { ...actionState };

    const amount = normalizeNumber(actionState.amount);
    const totalCapacity = normalizeNumber(selectedTank.totalCapacity);
    const currentVolume = normalizeNumber(selectedTank.currentVolume);

    let nextVolume = currentVolume;
    if (actionState.mode === "increase") {
      nextVolume = Math.min(totalCapacity, currentVolume + amount);
    } else if (actionState.mode === "decrease") {
      nextVolume = Math.max(0, currentVolume - amount);
    }

    if (actionState.mode === "logs") {
      closeActionModal();
      return;
    }

    if (amount <= 0) {
      Swal.fire({
        icon: "warning",
        title: dictionary.toast.amount_warning,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    const titleMap: Record<RefillMode, string> = {
      logs: dictionary.modal.logs_title,
      increase: dictionary.toast.increase_confirm,
      decrease: dictionary.toast.decrease_confirm,
    };

    closeActionModal();

    const confirm = await Swal.fire({
      icon: "question",
      title: titleMap[actionState.mode],
      text: `Volume akhir akan menjadi ${formatNumber(nextVolume)} Liter`,
      showCancelButton: true,
      confirmButtonText: dictionary.toast.confirm_button,
      cancelButtonText: dictionary.toast.cancel_button,
      confirmButtonColor: "#2B59FF",
    });

    if (!confirm.isConfirmed) {
      setActionState(pendingAction);
      return;
    }

    try {
      setIsLoading(true);
      if (pendingAction.mode === "increase") {
        await tanksService.increaseTankVolume({
          tankId: selectedTank.id,
          volumeAdded: amount,
          notes:
            pendingAction.notes || dictionary.modal.notes_increase_placeholder,
        });
      } else {
        await tanksService.decreaseTankVolume({
          tankId: selectedTank.id,
          volumeReduced: amount,
          notes:
            pendingAction.notes || dictionary.modal.notes_decrease_placeholder,
        });
      }

      await getTanks();

      Swal.fire({
        icon: "success",
        title: dictionary.toast.success_title,
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: dictionary.toast.error_title,
        text: dictionary.toast.error_text,
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#34363B] dark:bg-[#26282D]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {dictionary.title}
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {dictionary.description}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={dictionary.search_placeholder}
              className="sm:w-72"
            />
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={getTanks}
            >
              <RotateCw className="mr-2 h-4 w-4" />
              {dictionary.button_refresh}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {filteredTanks.length ? (
          filteredTanks.map((tank) => {
            const percent = getTankPercent(tank);
            const currentVolume = normalizeNumber(tank.currentVolume);
            const totalCapacity = normalizeNumber(tank.totalCapacity);

            return (
              <div
                key={tank.id}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-[#34363B] dark:bg-[#26282D]"
              >
                <div className="border-b border-slate-100 px-5 py-4 dark:border-[#34363B]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {tank.tankName}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {tank.tankCode} • {tank.location || "-"}
                      </div>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusTone(
                        tank.status,
                      )}`}
                    >
                      {(tank.status || "-").replaceAll("_", " ")}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-5 lg:grid-cols-[140px_minmax(0,1fr)]">
                  <div className="relative flex h-48 items-end justify-center overflow-hidden rounded-[28px] border-4 border-slate-200 bg-slate-50 px-5 pb-4 dark:border-[#434854] dark:bg-[#202228]">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600 via-sky-500 to-sky-300 transition-all duration-500"
                      style={{ height: `${percent}%` }}
                    />
                    <div className="relative rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm dark:bg-[#111318]/85 dark:text-slate-100">
                      {percent}%
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MetricCard
                        label={dictionary.current_volume}
                        value={`${formatNumber(currentVolume)} L`}
                      />
                      <MetricCard
                        label={dictionary.total_capacity}
                        value={`${formatNumber(totalCapacity)} L`}
                      />
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-[#1F2023]">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <Droplets className="h-4 w-4 text-sky-500" />
                        {dictionary.volume_status}
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-[#34363B]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {dictionary.last_refill}: {tank.lastRefillDate || "-"}
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-[#434854] dark:text-slate-200 dark:hover:bg-[#1F2023]"
                        onClick={() => openActionModal(tank, "logs")}
                      >
                        {dictionary.button_logs}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900 dark:text-green-300 dark:hover:bg-green-950/30"
                        onClick={() => openActionModal(tank, "increase")}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                        onClick={() => openActionModal(tank, "decrease")}
                      >
                        <Minus className="mr-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 dark:border-[#434854] dark:bg-[#26282D] dark:text-slate-400">
            {dictionary.empty_state}
          </div>
        )}
      </div>

      <Dialog
        open={actionState.open}
        onOpenChange={(open) => !open && closeActionModal()}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionState.mode === "logs"
                ? dictionary.modal.logs_title
                : actionState.mode === "increase"
                  ? dictionary.modal.increase_title
                  : dictionary.modal.decrease_title}
            </DialogTitle>
            <DialogDescription>
              {selectedTank
                ? `${selectedTank.tankName} (${selectedTank.tankCode})`
                : dictionary.modal.adjust_description}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAction} className="space-y-4">
            <div className="rounded-2xl border bg-slate-50 p-4 dark:border-[#34363B] dark:bg-[#1F2023]">
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label={dictionary.current_volume}
                  value={`${formatNumber(selectedTankCurrentVolume)} L`}
                />
                <MetricCard
                  label={dictionary.projected_volume}
                  value={`${formatNumber(projectedVolume)} L`}
                />
              </div>
            </div>

            {actionState.mode === "logs" ? (
              <div className="space-y-3">
                <div className="max-h-[450px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                  {tankLogs.length > 0 ? (
                    tankLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-[#34363B] dark:bg-[#26282D]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Clock3 className="h-3 w-3" />
                            {formatDate(log.refillDatetime)}
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            log.direction === 'IN' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {log.direction === 'IN' ? '+' : '-'}{formatNumber(log.direction === 'IN' ? log.volumeIn : log.volumeOut)} L
                          </span>
                        </div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {log.notes || "-"}
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400 border-t pt-2 dark:border-[#34363B]">
                          <User className="h-3 w-3" />
                          {log.operator?.username || 'System'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed p-10 text-center text-sm text-slate-500">
                      {dictionary.modal.empty_logs}
                    </div>
                  )}
                </div>

                {metaTankLogs && (metaTankLogs as any).totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-[#34363B]">
                    <div className="text-xs text-slate-500">
                      Halaman {(metaTankLogs as any).page} dari {(metaTankLogs as any).totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs cursor-pointer"
                        disabled={(metaTankLogs as any).page <= 1}
                        onClick={() => getTankLogs(selectedTank!.id, (metaTankLogs as any).page - 1)}
                      >
                        <ChevronLeft className="mr-1 h-3 w-3" />
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs cursor-pointer"
                        disabled={(metaTankLogs as any).page >= (metaTankLogs as any).totalPages}
                        onClick={() => getTankLogs(selectedTank!.id, (metaTankLogs as any).page + 1)}
                      >
                        Next
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer bg-red-500 text-white hover:bg-red-600 hover:text-white"
                  onClick={closeActionModal}
                >
                  {dictionary.modal.close}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="adjustAmount">
                    {dictionary.modal.amount_label}
                  </Label>
                  <Input
                    id="adjustAmount"
                    type="number"
                    min={0}
                    value={actionState.amount}
                    onChange={(event) =>
                      setActionState((prev) => ({
                        ...prev,
                        amount: Number(event.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refillNotes">
                    {dictionary.modal.notes_label}
                  </Label>
                  <Textarea
                    id="refillNotes"
                    value={actionState.notes}
                    onChange={(event) =>
                      setActionState((prev) => ({
                        ...prev,
                        notes: event.target.value,
                      }))
                    }
                    placeholder={
                      actionState.mode === "increase"
                        ? dictionary.modal.notes_increase_placeholder
                        : dictionary.modal.notes_decrease_placeholder
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-iprimary-blue text-white hover:bg-iprimary-blue/90 cursor-pointer"
                >
                  {dictionary.modal.submit}
                </Button>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-3 dark:border-[#34363B] dark:bg-[#26282D]">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}
