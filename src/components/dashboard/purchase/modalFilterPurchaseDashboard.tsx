"use client";

import { useEffect, useState } from "react";
import { FaArrowRotateLeft } from "react-icons/fa6";

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
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { DateRangeCustom } from "@/components/custom/dateRangeCustom";
import {
  ComboboxItem,
  ComboboxPopoverCustom,
} from "@/components/custom/comboboxProperCustom";
import { IProject } from "@/types/project";
import { projectService } from "@/services";
import { Circle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  onSubmit?: (payload: any) => void;
  onCancel?: () => void;
  isClearPayload: (payload: boolean) => void;
}

export const ModalFilterPurchaseDashboard = ({
  isOpen,
  onClose,
  title,
  width = "w-[30vw]",
  onSubmit,
  onCancel,
  isClearPayload,
}: ModalProps) => {
  // existing states
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [selectedPurchaseType, setSelectedPurchaseType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDocType, setSelectedDocType] = useState<string>("");

  // DATE & DUE DATE → single date (yyyy-MM-dd)
  const [date, setDate] = useState<string>(""); // payload.date
  const [dueDate, setDueDate] = useState<string>(""); // payload.due_date

  // PAYMENT DATE tetap range
  const [paymentDateRange, setPaymentDateRange] = useState<
    DateRange | undefined
  >(undefined);

  const [pphName, setPphName] = useState<string>(""); // Pph Pasal 4 Ayat 2
  const [search, setSearch] = useState<string>(""); // FCA-0015, dll

  const [isPopoverProjectOpen, setPopoverProjectOpen] = useState(false);
  const [projects, setProjects] = useState<ComboboxItem<IProject>[]>([]);
  const [selectedProject, setSelectedProject] =
    useState<ComboboxItem<IProject> | null>(null);

  const getProjects = async (search?: string) => {
    const params = search ? { search } : (undefined as any);
    const { data } = await projectService.getAllProjects(params);
    setProjects(
      data.map((e: IProject) => ({
        value: e.id,
        label: e.name,
        icon: Circle,
      }))
    );
  };

  const handleSubmit = () => {
    const payload: any = {};

    // TAB
    if (selectedTab) {
      payload.tab = selectedTab; // 1..4
    }

    // DATE (single date)
    if (date) {
      payload.date = date; // "yyyy-MM-dd"
    }

    // DUE DATE (single date)
    if (dueDate) {
      payload.due_date = dueDate; // "yyyy-MM-dd"
    }

    // PROJECT
    if (selectedProject) {
      payload.project = selectedProject.value; // GET ID PROJECT FROM API PROJECT
    }

    // PURCHASE TYPE
    if (selectedPurchaseType) {
      payload.purchase_id = selectedPurchaseType; // 1: EVENT, 2: OPERATIONAL
    }

    // STATUS
    if (selectedStatus) {
      payload.status = selectedStatus; // 1..6
    }

    // PPH NAME
    if (pphName) {
      payload.pph_name = pphName;
    }

    // DOC TYPE
    if (selectedDocType) {
      payload.doc_type = selectedDocType; // FLASH CASH, INVOICE, ...
    }

    // SEARCH
    if (search) {
      payload.search = search;
    }

    // TANGGAL PEMBAYARAN PURCHASE (range)
    if (paymentDateRange?.from && paymentDateRange.to) {
      const from = format(paymentDateRange.from, "yyyy-MM-dd");
      const to = format(paymentDateRange.to, "yyyy-MM-dd");
      payload.tanggal_pembayaran_purchase = [from, to];
    }

    onSubmit?.(payload);
  };

  const clearFilter = () => {
    setSelectedTab("");
    setSelectedPurchaseType("");
    setSelectedStatus("");
    setSelectedDocType("");
    setDate("");
    setDueDate("");
    setPaymentDateRange(undefined);
    setSelectedProject(null);
    setPphName("");
    setSearch("");

    isClearPayload(true);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      getProjects();
    }
  }, [isOpen]);

  return (
    <ModalFilter
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={width}
      onCancel={onCancel}
    >
      {/* BODY */}
      <div className="w-full flex flex-col gap-4 p-3 md:p-4">
        {/* Tab */}
        <div className="w-full flex flex-col gap-2">
          <span className="font-bold">Tab</span>
          <Select
            value={selectedTab || "default"}
            onValueChange={(value) =>
              value === "default" ? setSelectedTab("") : setSelectedTab(value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Tab" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="default" className="font-bold">
                  Pilih Tab
                </SelectItem>
                <SelectItem value="1">Submit</SelectItem>
                <SelectItem value="2">Verified</SelectItem>
                <SelectItem value="3">Payment Request</SelectItem>
                <SelectItem value="4">Paid</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Date + Due Date bersebelahan */}
        <div className="w-full flex flex-col md:flex-row gap-3">
          {/* Date (tanggal dokumen) */}
          <div className="flex-1 flex flex-col gap-2">
            <span className="font-bold">Tanggal Dokumen</span>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Due Date */}
          <div className="flex-1 flex flex-col gap-2">
            <span className="font-bold">Due Date</span>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Project */}
        <div className="w-full flex flex-col gap-2">
          <span className="font-bold">Project</span>
          <ComboboxPopoverCustom
            data={projects}
            selectedItem={selectedProject}
            onSelect={setSelectedProject}
            isOpen={isPopoverProjectOpen}
            onOpenChange={setPopoverProjectOpen}
            placeholder="Cari Proyek"
            onInputChange={(q) => getProjects(q)}
            height="h-10"
          />
        </div>

        {/* Purchase Type */}
        <div className="w-full flex flex-col gap-2">
          <span className="font-bold">Purchase Type</span>
          <Select
            value={selectedPurchaseType || "default"}
            onValueChange={(value) =>
              value === "default"
                ? setSelectedPurchaseType("")
                : setSelectedPurchaseType(value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Purchase Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="default" className="font-bold">
                  Pilih Purchase Type
                </SelectItem>
                <SelectItem value="1">Event</SelectItem>
                <SelectItem value="2">Operational</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="w-full flex flex-col gap-2">
          <span className="font-bold">Status</span>
          <Select
            value={selectedStatus || "default"}
            onValueChange={(value) =>
              value === "default"
                ? setSelectedStatus("")
                : setSelectedStatus(value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="default" className="font-bold">
                  Pilih Status
                </SelectItem>
                <SelectItem value="1">Awaiting</SelectItem>
                <SelectItem value="2">Open</SelectItem>
                <SelectItem value="3">Overdue</SelectItem>
                <SelectItem value="4">Due Date</SelectItem>
                <SelectItem value="5">Rejected</SelectItem>
                <SelectItem value="6">Paid</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* PPh Name */}
        <div className="w-full flex flex-col gap-2">
          <span className="font-bold">PPH Name</span>
          <Input
            type="text"
            placeholder="Contoh: Pph Pasal 4 Ayat 2"
            value={pphName}
            onChange={(e) => setPphName(e.target.value)}
          />
        </div>

        {/* Document Type */}
        <div className="w-full flex flex-col gap-2">
          <span className="font-bold">Document Type</span>
          <Select
            value={selectedDocType || "default"}
            onValueChange={(value) =>
              value === "default"
                ? setSelectedDocType("")
                : setSelectedDocType(value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih Tipe Dokumen" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="default" className="font-bold">
                  Pilih Tipe Dokumen
                </SelectItem>
                <SelectItem value="FLASH CASH">FLASH CASH</SelectItem>
                <SelectItem value="INVOICE">INVOICE</SelectItem>
                <SelectItem value="MAN POWER">MAN POWER</SelectItem>
                <SelectItem value="EXPENSE">EXPENSE</SelectItem>
                <SelectItem value="REIMBURSEMENT">REIMBURSEMENT</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="w-full flex flex-col gap-2">
          <span className="font-bold">Search</span>
          <Input
            type="text"
            placeholder="Cari nomor dokumen / vendor / dsb"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tanggal Pembayaran Purchase (range) */}
        <div className="w-full flex flex-col gap-2">
          <span className="font-bold">Tanggal Pembayaran Purchase</span>
          <DateRangeCustom
            value={paymentDateRange}
            onChange={setPaymentDateRange}
            widthButton="w-full"
            className="w-full"
          />
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      <div
        className="
          mt-4
          px-3 py-3 md:px-5 md:py-4
          flex flex-col-reverse sm:flex-row
          gap-2 sm:gap-3
          bg-muted
          border-t
        "
      >
        <Button
          className="cursor-pointer bg-iprimary-blue hover:bg-primary-light-two text-white w-full sm:w-auto"
          onClick={handleSubmit}
        >
          Terapkan Filter
        </Button>

        <Button
          className="cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-white w-full sm:w-auto"
          onClick={clearFilter}
        >
          <FaArrowRotateLeft className="mr-1" />
          Reset
        </Button>

        <Button
          className="cursor-pointer bg-red-500 text-white hover:bg-red-600 w-full sm:w-auto"
          onClick={onCancel ?? onClose}
        >
          Batal
        </Button>
      </div>
    </ModalFilter>
  );
};
