"use client";

import { DateRangeCustom } from "@/components/custom/dateRangeCustom";
import { ModalFilter } from "@/components/custom/modalFilter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IProductionBatch } from "@/types/production";
import { getDictionary } from "../../../get-dictionary";
import { format } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { FaArrowRotateLeft } from "react-icons/fa6";
import Swal from "sweetalert2";

type DetailDictionary = Awaited<
  ReturnType<typeof getDictionary>
>["production_page_dic"]["production_plan"]["detail"];

export type ProductionJirigenFilterPayload = {
  date?: [string, string];
  batchId?: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ProductionJirigenFilterPayload) => void;
  onClear: () => void;
  dictionary: DetailDictionary;
  title: string;
  batches: IProductionBatch[];
};

export function ModalFilterProductionJirigen({
  isOpen,
  onClose,
  onSubmit,
  onClear,
  dictionary,
  title,
  batches,
}: Props) {
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const handleSubmit = () => {
    const payload: ProductionJirigenFilterPayload = {};

    if (selectedDateRange?.from && selectedDateRange?.to) {
      payload.date = [
        format(selectedDateRange.from, "yyyy-MM-dd"),
        format(selectedDateRange.to, "yyyy-MM-dd"),
      ];
    }

    if (selectedBatchId) {
      payload.batchId = Number(selectedBatchId);
    }

    Swal.fire({
      icon: "success",
      title: dictionary.filter_apply_success,
      position: "top-right",
      toast: true,
      showConfirmButton: false,
      timer: 2000,
    });

    onSubmit(payload);
    onClose();
  };

  const clearFilter = () => {
    setSelectedDateRange(undefined);
    setSelectedBatchId("");
    onClear();
    onClose();
  };

  return (
    <ModalFilter isOpen={isOpen} onClose={onClose} title={title} onCancel={onClose}>
      <div className="flex w-full flex-col gap-4 p-3">
        <div className="flex w-full flex-col gap-2">
          <span className="font-bold">{dictionary.filter_date_label}</span>
          <DateRangeCustom
            value={selectedDateRange}
            onChange={setSelectedDateRange}
            widthButton="w-full"
            className="w-full"
            placeHolder={dictionary.filter_date_placeholder}
          />
        </div>

        <div className="flex w-full flex-col gap-2">
          <span className="font-bold">{dictionary.jirigen_batch}</span>
          <Select
            value={selectedBatchId || "default"}
            onValueChange={(value) => {
              if (value === "default") {
                setSelectedBatchId("");
                return;
              }
              setSelectedBatchId(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={dictionary.jirigen_batch_placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem className="font-bold" value="default">
                  {dictionary.jirigen_batch_placeholder}
                </SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={String(batch.id)}>
                    {batch.batchNumber}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="sticky bottom-0 mt-4 flex justify-end gap-2 rounded-b-lg p-5">
        <Button
          className="bg-iprimary-blue text-white hover:bg-primary-light-two"
          onClick={handleSubmit}
        >
          {dictionary.filter_apply}
        </Button>
        <Button
          className="bg-yellow-500 text-white hover:bg-yellow-400"
          onClick={clearFilter}
        >
          <FaArrowRotateLeft />
        </Button>
        <Button
          className="bg-red-500 text-white hover:bg-red-600"
          onClick={onClose}
        >
          {dictionary.filter_cancel}
        </Button>
      </div>
    </ModalFilter>
  );
}
