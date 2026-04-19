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
  onOpenFilter: () => void;
  onRefresh: () => void;
  formatDate: (value?: string) => string;
  renderEmpty: (text: string) => ReactNode;
};

export function ProductionBatchesSection({
  dictionary,
  isOpen,
  loading,
  batches,
  onToggle,
  onCreate,
  onEdit,
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
                  <button
                    type="button"
                    onClick={() => onEdit(batch)}
                    className="rounded-lg border border-yellow-500 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 transition hover:bg-yellow-100 dark:bg-[#2E3138] dark:text-blue-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
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
            ))
          ) : (
            renderEmpty(dictionary.batch_empty)
          )}
        </div>
      ) : null}
    </div>
  );
}
