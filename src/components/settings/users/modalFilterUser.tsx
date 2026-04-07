import { DateRangeCustom } from "@/components/custom/dateRangeCustom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import { useEffect, useState } from "react";
import { IUser } from "@/types/user";
import { Circle } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { FaArrowRotateLeft } from "react-icons/fa6";
import { IDivision } from "@/types/division";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ModalFilter } from "@/components/custom/modalFilter";
import { Button } from "@/components/ui/button";
import { getDictionary } from "../../../../get-dictionary";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  onSubmit?: (payload: any) => void;
  onCancel?: () => void;
  isClearPayload: (payload: boolean) => void;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["settings_users"];
}

export const ModalFilterUser = ({
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
  const [roleId, setRoleId] = useState("");
  const [divisions, setDivisions] = useState<ComboboxItem<IUser>[]>([]);
  const [selectedDivision, setSelectedDivision] =
    useState<ComboboxItem<IDivision> | null>(null);
  const [isPopoverDivisionOpen, setPopoverDivisionOpen] = useState(false);
  const [statusUser, setStatusUser] = useState<"1" | "2" | "">("");

  const handleSubmit = () => {
    const payload: any = {};
    if (selectedDateRange) {
      payload.date = [
        format(String(selectedDateRange.from), "yyyy-MM-dd"),
        format(String(selectedDateRange.to), "yyyy-MM-dd"),
      ];
    }

    if (selectedDivision) {
      payload.divisi_name = selectedDivision.label;
    }

    if (roleId) {
      payload.role_id = roleId;
    }

    if (statusUser) {
      payload.status_users = parseInt(statusUser);
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
    setRoleId("");
    isClearPayload(true);
    onClose();
  };

  useEffect(() => {
    // getDivisions();
  }, []);
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
            <span className="font-bold">{dictionary.column.date}</span>
            <DateRangeCustom
              value={selectedDateRange}
              onChange={setSelectedDateRange}
              widthButton="w-full"
              className="w-full"
            />
          </div>
          <div className="w-full flex flex-col gap-2">
            <span className="font-bold">{dictionary.column.division}</span>
            <ComboboxPopoverCustom
              data={divisions}
              selectedItem={selectedDivision}
              onSelect={setSelectedDivision}
              isOpen={isPopoverDivisionOpen}
              onOpenChange={setPopoverDivisionOpen}
              placeholder={dictionary.select_division_placeholder}
            />
          </div>
          <div className="w-full flex flex-col gap-2">
            <span className="font-bold">Role Pengguna</span>
            <Select
              value={roleId || "default"}
              onValueChange={(value) => {
                if (value !== "default") setRoleId(value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem className="font-bold" value="default" disabled>
                    Role
                  </SelectItem>
                  <SelectItem value="1">Owner</SelectItem>
                  <SelectItem value="2">Admin</SelectItem>
                  <SelectItem value="3">Supervisor</SelectItem>
                  <SelectItem value="4">Karyawan</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full flex flex-col gap-2">
            <Label className="font-bold text-md">{dictionary.column.status}</Label>
            <RadioGroup
              value={statusUser}
              onValueChange={(value: "1" | "2") => setStatusUser(value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="aktif" />
                <Label htmlFor="aktif" className="text-sm font-medium">
                  {dictionary.opt_employee_status.active}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="tidak-aktif" />
                <Label htmlFor="tidak-aktif" className="text-sm font-medium">
                  {dictionary.opt_employee_status.inactive}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <div className="mt-10 p-5 flex justify-end gap-2 rounded-b-lg sticky bottom-0">
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
