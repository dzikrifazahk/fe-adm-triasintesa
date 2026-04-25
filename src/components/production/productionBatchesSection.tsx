"use client";

import { IProductionBatch } from "@/types/production";
import { getDictionary } from "../../../get-dictionary";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import { ChevronDown, Pencil, Plus } from "lucide-react";
import { FaArrowRotateLeft, FaFilter } from "react-icons/fa6";

type DetailDictionary = Awaited<
  ReturnType<typeof getDictionary>
>["production_page_dic"]["production_plan"]["detail"];

type Props = {
  dictionary: DetailDictionary;
  isOpen: boolean;
  loading: boolean;
  batches: IProductionBatch[];
  onToggle: () => void;
  onCreate: () => void;
  onEdit: (batch: IProductionBatch) => void;
  onOpenQc: (batch: IProductionBatch) => void;
  onOpenQcDetail: (batch: IProductionBatch) => void;
  onOpenFilter: () => void;
  onRefresh: () => void;
  formatDate: (value?: string) => string;
  renderEmpty: (text: string) => ReactNode;
};

function getQcPresentation(batch: IProductionBatch) {
  if (batch.productionStatus === "qc_approved" || batch.hasApprovedQc) {
    return {
      label: "QC Approved",
      helper: "Batch sudah lolos QC",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    };
  }

  if (batch.productionStatus === "qc_rejected") {
    return {
      label: "QC Rejected",
      helper: "Batch perlu tindak lanjut QC",
      className:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    };
  }

  if (batch.productionStatus === "qc_pending") {
    return {
      label: "QC Pending",
      helper: "Menunggu proses QC",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    };
  }

  return {
    label: "QC Not Started",
    helper: "QC belum dijalankan",
    className:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
}

export function ProductionBatchesSection({
  dictionary,
  isOpen,
  loading,
  batches,
  onToggle,
  onCreate,
  onEdit,
  onOpenQc,
  onOpenQcDetail,
  onOpenFilter,
  onRefresh,
  formatDate,
  renderEmpty,
}: Props) {
  return (
    <div className="rounded-2xl border p-4 dark:border-[#34363B]">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-left dark:bg-[#1F2023]"
        >
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {dictionary.batch_section_title}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {dictionary.batch_section_description}
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-slate-500 transition-transform dark:text-slate-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <Button
          type="button"
          onClick={onCreate}
          className="bg-iprimary-blue text-white hover:bg-iprimary-blue/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {dictionary.batch_button}
        </Button>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onOpenFilter}
              aria-label={dictionary.filter_open}
            >
              <FaFilter />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onRefresh}
              aria-label={dictionary.filter_refresh}
            >
              <FaArrowRotateLeft />
            </Button>
          </div>

          {loading ? (
            renderEmpty(dictionary.batch_loading)
          ) : batches.length ? (
            batches.map((batch) => {
              const qc = getQcPresentation(batch);

              return (
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
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-500/40 dark:text-blue-300 dark:hover:bg-blue-500/10"
                        onClick={() => onOpenQc(batch)}
                      >
                        QC
                      </Button>
                      {batch.latestQcInspection ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                          onClick={() => onOpenQcDetail(batch)}
                        >
                          Detail QC
                        </Button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onEdit(batch)}
                        className="rounded-lg border border-yellow-500 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 transition hover:bg-yellow-100 dark:bg-[#2E3138] dark:text-blue-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${qc.className}`}
                    >
                      {qc.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {qc.helper}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {batch.qcInspectionCount ?? 0} inspection
                      {(batch.qcInspectionCount ?? 0) === 1 ? "" : "s"}
                    </span>
                    {batch.latestQcInspection?.qcNumber ? (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Last: {batch.latestQcInspection.qcNumber}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {dictionary.raw_material}:{" "}
                      <span className="font-semibold">
                        {Number(batch.rawMaterialVolume).toLocaleString("id-ID")} L
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {dictionary.target_quantity}:{" "}
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
              );
            })
          ) : (
            renderEmpty(dictionary.batch_empty)
          )}
        </div>
      ) : null}
    </div>
  );
}
