"use client";

import { IProductionJirigen } from "@/types/production";
import { getDictionary } from "../../../get-dictionary";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import { CheckCircle2, ChevronDown, Eye, Loader2, Pencil, Plus, ScanLine } from "lucide-react";
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
  eligibleBatchesCount: number;
  hasLoadedBatches: boolean;
  onToggle: () => void;
  onCreate: () => void;
  onPrintBarcode: (jirigenId: string) => void;
  printingBarcodeId?: string | null;
  onScan: (jirigenId: string) => void;
  onDetail: (jirigen: IProductionJirigen) => void;
  onEdit: (jirigen: IProductionJirigen) => void;
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
  eligibleBatchesCount,
  hasLoadedBatches,
  onToggle,
  onCreate,
  onPrintBarcode,
  printingBarcodeId,
  onScan,
  onDetail,
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
          disabled={hasLoadedBatches ? eligibleBatchesCount === 0 : false}
        >
          <Plus className="mr-2 h-4 w-4" />
          {dictionary.jirigen_button}
        </Button>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-2">
          {hasLoadedBatches && batchesCount > 0 && eligibleBatchesCount === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Batch harus lolos QC terlebih dahulu sebelum production jirigen bisa dibuat.
            </div>
          ) : null}
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
                    {jirigen.jirigenNumber} jirigen × {Number(jirigen.volumeLiter)} L
                    <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
                      (total {(Number(jirigen.jirigenNumber) * Number(jirigen.volumeLiter)).toLocaleString("id-ID")} L)
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {jirigen.batch?.batchNumber ?? `Batch #${jirigen.batchId}`} •{" "}
                    {formatDate(jirigen.productionDatetime)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-fit"
                  onClick={() => onDetail(jirigen)}
                  aria-label="Lihat detail jirigen"
                >
                  <Eye className="mr-1.5 h-4 w-4" /> Detail
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-fit border-yellow-400 text-yellow-700 hover:bg-yellow-50 dark:text-yellow-300 dark:hover:bg-yellow-500/10"
                  onClick={() => onEdit(jirigen)}
                  aria-label="Edit jirigen"
                >
                  <Pencil className="mr-1.5 h-4 w-4" /> Edit
                </Button>
                {(jirigen.inStockCount ?? 0) >= Number(jirigen.jirigenNumber) ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Sudah masuk stok
                  </span>
                ) : (
                  <>
                    {(jirigen.inStockCount ?? 0) > 0 ? (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        {jirigen.inStockCount}/{jirigen.jirigenNumber} di stok
                      </span>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      className="w-fit bg-iprimary-blue text-white hover:bg-iprimary-blue/90"
                      onClick={() => onScan(String(jirigen.id))}
                    >
                      <ScanLine className="mr-2 h-4 w-4" />
                      Scan Produksi
                    </Button>
                  </>
                )}
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
