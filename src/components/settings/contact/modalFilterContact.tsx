import { DateRangeCustom } from "@/components/custom/dateRangeCustom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { FaArrowRotateLeft } from "react-icons/fa6";
import { ModalFilter } from "@/components/custom/modalFilter";
import { getDictionary } from "../../../../get-dictionary";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  onSubmit?: (payload: any) => void;
  onCancel?: () => void;
  isClearPayload: (payload: boolean) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_contact"];
}

export const ModalFilterContact = ({
  isOpen,
  onClose,
  title,
  width = "w-[30vw]",
  onSubmit,
  onCancel,
  isClearPayload,
  dictionary
}: ModalProps) => {
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [selectedContactType, setSelectedContactType] = useState("");


  const handleSubmit = () => {
    const payload: any = {};
    if (selectedDateRange) {
      payload.date = [
        format(String(selectedDateRange.from), "yyyy-MM-dd"),
        format(String(selectedDateRange.to), "yyyy-MM-dd"),
      ];
    }
    if (selectedContactType) {
      payload.contact_type = selectedContactType;
    }
    // console.log(JSON.stringify(payload));
    if (onSubmit) {
      Swal.fire({
        icon: "success",
        title: "Berhasil Menerapkan Filter",
        position: "top-right",
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
      onSubmit(payload);
    }
  };

  const clearFilter = () => {
    setSelectedDateRange(undefined);
    setSelectedContactType("");
    isClearPayload(true);
    onClose();
  };

  return (
    <>
      <ModalFilter
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        width={width}
        onCancel={onCancel}
      >
        <div className="w-full flex flex-col gap-4 p-3">
          <div className="w-full flex flex-col gap-2">
            <span className="font-bold">Tanggal</span>
            <DateRangeCustom
              value={selectedDateRange}
              onChange={setSelectedDateRange}
              widthButton="w-full"
              className="w-full"
            />
          </div>
          <div className="w-full flex flex-col gap-2">
            <span className="font-bold">{dictionary.column.contact_type}</span>
            <Select
              value={selectedContactType || "default"}
              onValueChange={(value) => {
                if (value !== "default") setSelectedContactType(value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={dictionary.select_contact_type_placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem className="font-bold" value="default" disabled>
                    {dictionary.select_contact_type_placeholder}
                  </SelectItem>
                  <SelectItem value="1">Vendor</SelectItem>
                  <SelectItem value="2">Client</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 p-5 flex justify-end gap-2 rounded-b-lg sticky bottom-0">
          <Button
            className="btn bg-iprimary-blue hover:bg-primary-light-two text-white"
            onClick={handleSubmit}
          >
            {dictionary.apply_filter}
          </Button>
          <Button
            className="btn bg-yellow-500 hover:bg-yellow-400 text-white"
            onClick={clearFilter}
          >
            <FaArrowRotateLeft />
          </Button>
          <Button
            className="btn bg-red-500 text-white hover:bg-red-600"
            onClick={onCancel}
          >
            {dictionary.cancel}
          </Button>
        </div>
      </ModalFilter>
    </>
  );
};
