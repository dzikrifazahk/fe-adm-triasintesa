import { useState } from "react";
import { FaArrowRotateLeft } from "react-icons/fa6";
import { ModalFilter } from "@/components/custom/modalFilter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { openSwal } from "@/lib/swal";
import { CustomerStatus } from "@/types/customer";

import { useFormText } from "@/hooks/use-form-text";
export type CustomerFilterPayload = { status?: CustomerStatus };

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  onSubmit: (payload: CustomerFilterPayload) => void;
  isClearPayload: () => void;
}

export const ModalFilterCustomer = ({
  isOpen,
  onClose,
  title,
  width = "w-[30vw]",
  onSubmit,
  isClearPayload,
}: ModalProps) => {
  const t = useFormText();
  const [status, setStatus] = useState<CustomerStatus | "">("");

  const handleSubmit = () => {
    const payload: CustomerFilterPayload = {};
    if (status) payload.status = status;

    openSwal({
      icon: "success",
      title: "Berhasil Menerapkan Filter",
      position: "top-right",
      toast: true,
      showConfirmButton: false,
      timer: 2000,
    });
    onSubmit(payload);
  };

  const clearFilter = () => {
    setStatus("");
    isClearPayload();
    onClose();
  };

  return (
    <ModalFilter isOpen={isOpen} onClose={onClose} title={title} width={width}>
      <div className="w-full flex flex-col gap-4 p-3">
        <div className="w-full flex flex-col gap-2">
          <Label className="font-bold text-md">{t.common.status}</Label>
          <RadioGroup
            value={status}
            onValueChange={(value: CustomerStatus) => setStatus(value)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aktif" id="customer-aktif" />
              <Label htmlFor="customer-aktif" className="text-sm font-medium">
                {t.common.active}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nonaktif" id="customer-nonaktif" />
              <Label htmlFor="customer-nonaktif" className="text-sm font-medium">
                {t.common.inactive}
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      <div className="mt-10 p-5 flex flex-col gap-2 rounded-b-lg sticky bottom-0 sm:flex-row sm:justify-end">
        <Button
          className="btn w-full bg-iprimary-blue hover:bg-primary-light-two text-white sm:w-auto"
          onClick={handleSubmit}
        >
          Terapkan Filter
        </Button>
        <Button
          className="btn w-full bg-yellow-500 hover:bg-yellow-400 text-white sm:w-auto"
          onClick={clearFilter}
        >
          <FaArrowRotateLeft />
        </Button>
        <Button
          className="btn w-full bg-red-500 text-white hover:bg-red-600 sm:w-auto"
          onClick={onClose}
        >
          Batal
        </Button>
      </div>
    </ModalFilter>
  );
};
