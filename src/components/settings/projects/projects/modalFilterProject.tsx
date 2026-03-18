import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contactService, divisionService, userService } from "@/services";
import { useEffect, useState } from "react";
import { IUser } from "@/types/user";
import { Circle } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { FaArrowRotateLeft } from "react-icons/fa6";
import { ModalFilter } from "@/components/custom/modalFilter";
import { DateRangeCustom } from "@/components/custom/dateRangeCustom";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import MultipleSelector, { Option } from "@/components/custom/multipleSelector";
import { Button } from "@/components/ui/button";
import { IContact } from "@/types/contact";
import { useLoading } from "@/context/loadingContext";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  onSubmit?: (payload: any) => void;
  onCancel?: () => void;
  isClearPayload: (payload: boolean) => void;
}

export const ModalFilterProject = ({
  isOpen,
  onClose,
  title,
  width = "w-[30vw]",
  onSubmit,
  onCancel,
  isClearPayload,
}: ModalProps) => {
  const { setIsLoading } = useLoading();
  const [marketings, setMarketings] = useState<ComboboxItem<IUser>[]>([]);
  const [selectedMarketing, setSelectedMarketing] =
    useState<ComboboxItem<IUser> | null>(null);
  const [isPopoverMarketingOpen, setPopoverMarketingOpen] = useState(false);

  const [clients, setClients] = useState<ComboboxItem<IUser>[]>([]);
  const [selectedClient, setSelectedClient] =
    useState<ComboboxItem<IUser> | null>(null);
  const [isPopoverClientOpen, setPopoverClientOpen] = useState(false);

  const [supervisors, setSupervisors] = useState<ComboboxItem<IUser>[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<ComboboxItem<IUser> | null>(null);
  const [isPopoverSupervisorOpen, setPopoverSupervisorOpen] = useState(false);

  const [divisions, setDivisions] = useState<Option[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<Option[]>([]);
  const [years, setYears] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCostProgressStatus, setSelectedCostProgressStatus] =
    useState("");
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [selectedProjectType, setSelectedProjectType] = useState("");

  const getMarketings = async () => {
    const filterParams = {
      role_id: "3",
    };

    const { data } = await userService.getAllUsers(filterParams);
    const mappedResponse = data.map((marketing: IUser) => ({
      value: marketing.id,
      label: marketing.name,
      icon: Circle,
    }));

    setMarketings(mappedResponse);
  };

  const getClients = async () => {
    const filterParams = {
      contact_type: 2,
    };

    const { data } = await contactService.getAllContacts(filterParams);
    const mappedResponse = data.map((e: IContact) => ({
      value: e.id,
      label: e.name,
      icon: Circle,
    }));

    setClients(mappedResponse);
  };

  const getSupervisors = async () => {
    const filterParams = {
      role_id: "4",
    };

    const { data } = await userService.getAllUsers(filterParams);
    const mappedResponse = data.map((supervisor: IUser) => ({
      value: supervisor.id,
      label: supervisor.name,
      icon: Circle,
    }));

    setSupervisors(mappedResponse);
  };

  const getDivisions = async () => {
    const { data } = await divisionService.getAllDivisions();
    const mappedResponse = data.map((division: IUser) => ({
      value: division.id,
      label: division.name,
    }));

    setDivisions(mappedResponse);
  };

  const handleSubmit = () => {
    setIsLoading(true);
    const payload: any = {};
    if (years) {
      payload.year = years;
    }
    if (docNumber) {
      payload.no_dokumen_project = docNumber;
    }
    if (selectedStatus) {
      payload.request_status_owner = selectedStatus;
    }
    if (selectedDivisions.length > 0) {
      payload.divisi_name = selectedDivisions
        .map((division) => division.label)
        .join(", ");
    }
    if (selectedMarketing) {
      payload.marketing_id = selectedMarketing?.value;
    }
    if (selectedSupervisor) {
      payload.supervisor_id = selectedSupervisor?.value;
    }
    if (selectedDateRange) {
      const fromDate = selectedDateRange.from
        ? format(new Date(selectedDateRange.from), "yyyy-MM-dd")
        : null;
      const toDate = selectedDateRange.to
        ? format(new Date(selectedDateRange.to), "yyyy-MM-dd")
        : null;

      if (fromDate && toDate) {
        payload.date = [fromDate, toDate];
      }
    }
    if (selectedProjectType) {
      payload.type_projects = selectedProjectType;
    }
    if (selectedClient) {
      payload.contact = selectedClient?.value;
    }
    if (selectedCostProgressStatus) {
      payload.status_cost_progres = selectedCostProgressStatus;
    }

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  const clearFilter = () => {
    setSelectedMarketing(null);
    setSelectedDivisions([]);
    setYears("");
    setDocNumber("");
    setSelectedStatus("");
    setSelectedDateRange(undefined);
    setSelectedProjectType("");
    setSelectedClient(null);
    setSelectedCostProgressStatus("");
    isClearPayload(true);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      getMarketings();
      getDivisions();
      getSupervisors();
      getClients();
    }
  }, [isOpen]);

  return (
    <>
      <ModalFilter
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        width={width}
        onCancel={onCancel}
      >
        {/* Body */}
        <div className="w-full flex flex-col gap-4 p-3 md:p-4">
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
            <span className="font-bold">Tahun</span>
            <Input
              type="text"
              placeholder="Contoh: 2025"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <span className="font-bold">No Dokumen Proyek</span>
            <Input
              type="text"
              placeholder="Contoh: DJ-123"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-full flex flex-col gap-2">
              <span className="font-bold">Project Status</span>
              <Select
                value={selectedStatus || "default"}
                onValueChange={(value) => {
                  if (value !== "default") setSelectedStatus(value);
                  else setSelectedStatus("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Status Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem className="font-bold" value="default">
                      Pilih Status Project
                    </SelectItem>
                    <SelectItem value="1">Pending</SelectItem>
                    <SelectItem value="2">Active</SelectItem>
                    <SelectItem value="3">Rejected</SelectItem>
                    <SelectItem value="4">Closed</SelectItem>
                    <SelectItem value="5">Cancel</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="w-full flex flex-col gap-2">
              <span className="font-bold">Status Cost Progress</span>
              <Select
                value={selectedCostProgressStatus || "default"}
                onValueChange={(value) => {
                  if (value !== "default") setSelectedCostProgressStatus(value);
                  else setSelectedCostProgressStatus("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Status Cost Progress" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem className="font-bold" value="default">
                      Pilih Status Cost Progress
                    </SelectItem>
                    <SelectItem value="OPEN">OPEN</SelectItem>
                    <SelectItem value="CLOSED">CLOSED</SelectItem>
                    <SelectItem value="NEED TO CHECK">NEED TO CHECK</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <span className="font-bold">Clients</span>
            <ComboboxPopoverCustom
              data={clients}
              selectedItem={selectedClient}
              onSelect={setSelectedClient}
              isOpen={isPopoverClientOpen}
              onOpenChange={setPopoverClientOpen}
              placeholder="Pilih Client"
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <span className="font-bold">Marketing</span>
            <ComboboxPopoverCustom
              data={marketings}
              selectedItem={selectedMarketing}
              onSelect={setSelectedMarketing}
              isOpen={isPopoverMarketingOpen}
              onOpenChange={setPopoverMarketingOpen}
              placeholder="Pilih Marketing"
            />
          </div>

          <div className="w-full flex flex-col gap-2">
            <span className="font-bold">Supervisor</span>
            <ComboboxPopoverCustom
              data={supervisors}
              selectedItem={selectedSupervisor}
              onSelect={setSelectedSupervisor}
              isOpen={isPopoverSupervisorOpen}
              onOpenChange={setPopoverSupervisorOpen}
              placeholder="Pilih Supervisor"
            />
          </div>

          {/* 
          <div className="w-full flex flex-col gap-2">
            <span className="font-bold">Divisi</span>
            <MultipleSelector
              selectFirstItem={false}
              defaultOptions={divisions}
              placeholder="Pilih Divisi"
              onChange={setSelectedDivisions}
              value={selectedDivisions}
              heightCardBox="h-32"
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                  no results found.
                </p>
              }
            />
          </div>
          */}
        </div>

        <div
          className="
            mt-6 
            px-3 py-3 md:px-5 md:py-4 
            flex flex-col-reverse sm:flex-row 
            gap-2 sm:gap-3 
            sticky bottom-0 
            bg-muted 
            border-t
          "
        >
          <Button
            className="cursor-pointer btn bg-iprimary-blue hover:bg-primary-light-two text-white w-full sm:w-auto"
            onClick={handleSubmit}
          >
            Terapkan Filter
          </Button>

          <Button
            className="cursor-pointer btn bg-yellow-500 hover:bg-yellow-400 text-white w-full sm:w-auto"
            onClick={clearFilter}
          >
            <FaArrowRotateLeft className="mr-1" />
            Reset
          </Button>

          <Button
            className="cursor-pointer btn bg-red-500 text-white hover:bg-red-600 w-full sm:w-auto"
            onClick={onCancel}
          >
            Batal
          </Button>
        </div>
      </ModalFilter>
    </>
  );
};
