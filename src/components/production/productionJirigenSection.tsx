"use client";

import { IProductionJirigen } from "@/types/production";
import { getDictionary } from "../../../get-dictionary";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { FaArrowRotateLeft, FaFilter } from "react-icons/fa6";

type DetailDictionary = Awaited<
  ReturnType<typeof getDictionary>
>["production_page_dic"]["production_plan"]["detail"];

type Props = {
  dictionary: DetailDictionary;
  isOpen: boolean;
  loading: boolean;
  jirigens: IProductionJirigen[];
  batchesCount: number;
  hasLoadedBatches: boolean;
  onToggle: () => void;
  onCreate: () => void;
  onPrintBarcode: (jirigenId: string) => void;
  printingBarcodeId?: string | null;
  onOpenFilter: () => void;
  onRefresh: () => void;
  formatDate: (value?: string) => string;
  renderEmpty: (text: string) => ReactNode;
};

export function ProductionJirigenSection({
  dictionary,
  isOpen,
  loading,
  jirigens,
  batchesCount,
  hasLoadedBatches,
  onToggle,
  onCreate,
  onPrintBarcode,
  printingBarcodeId,
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
              {dictionary.jirigen_section_title}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {dictionary.jirigen_section_description}
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
          disabled={hasLoadedBatches ? batchesCount === 0 : false}
        >
          <Plus className="mr-2 h-4 w-4" />
          {dictionary.jirigen_button}
        </Button>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-2">
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
            renderEmpty(dictionary.jirigen_loading)
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
                    {dictionary.batch_id} {jirigen.batchId} •{" "}
                    {formatDate(jirigen.productionDatetime)}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-fit"
                  disabled={printingBarcodeId === String(jirigen.id)}
                  onClick={() => onPrintBarcode(String(jirigen.id))}
                >
                  {printingBarcodeId === String(jirigen.id) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Cetak Barcode"
                  )}
                </Button>
              </div>
            ))
          ) : (
            renderEmpty(dictionary.jirigen_empty)
          )}
        </div>
      ) : null}
    </div>
  );
}
