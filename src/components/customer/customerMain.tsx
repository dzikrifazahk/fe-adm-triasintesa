"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { openSwal } from "@/lib/swal";
import { getDictionary } from "../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { codeGeneratorService, customerService } from "@/services";
import {
  CustomerStatus,
  ICreateCustomerPayload,
  ICustomer,
  IUpdateCustomerPayload,
} from "@/types/customer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import useDebounce from "@/utils/useDebouncy";
import { columns } from "./column";
import { DataTable } from "./data-table";
import { CustomerFilterPayload } from "./modalFilterCustomer";

import { useFormText } from "@/hooks/use-form-text";
type Dictionary = Awaited<ReturnType<typeof getDictionary>>["customer_page_dic"];
type ListPayload<T> = { data: T[]; meta?: { totalPages?: number } };

type FormState = {
  customerCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: CustomerStatus;
  notes: string;
};

const emptyForm: FormState = {
  customerCode: "",
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  status: "aktif",
  notes: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapData<T>(value: unknown): T {
  if (isRecord(value) && "data" in value) {
    return value.data as T;
  }
  return value as T;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
    if (isRecord(message)) return JSON.stringify(message);
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan";
}

export default function CustomerMain({ dictionary }: { dictionary: Dictionary }) {
  const t = useFormText();
  const { setIsLoading } = useLoading();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 800);
  const [filterPayload, setFilterPayload] = useState<CustomerFilterPayload>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lastPage, setLastPage] = useState(1);

  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGeneratingCustomerCode, setIsGeneratingCustomerCode] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const title = dictionary?.title ?? "Customer";
  const description =
    dictionary?.description ??
    "Kelola data customer untuk proses sales order, pengiriman, dan invoice.";

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await customerService.getCustomers({
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
        status: filterPayload.status,
      });
      const payload = unwrapData<ListPayload<ICustomer>>(response);
      setCustomers(Array.isArray(payload.data) ? payload.data : []);
      setLastPage(Math.max(payload.meta?.totalPages ?? 1, 1));
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal memuat customer",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, filterPayload, setIsLoading]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const handleFilterChange = (payload: CustomerFilterPayload) => {
    setFilterPayload(payload);
    setPage(1);
  };

  const handleClearPayload = () => {
    setFilterPayload({});
    setPage(1);
    openSwal({
      icon: "success",
      title: "Filter Berhasil Dihapus",
      position: "top-right",
      toast: true,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleRefreshData = async () => {
    await fetchCustomers();
    openSwal({
      icon: "success",
      title: "Data berhasil di refresh",
      position: "top-right",
      toast: true,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCreate = () => {
    setIsEditMode(false);
    setSelectedCustomer(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (customer: ICustomer) => {
    setIsEditMode(true);
    setSelectedCustomer(customer);
    setForm({
      customerCode: customer.customerCode || "",
      companyName: customer.companyName || "",
      contactPerson: customer.contactPerson || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      status: customer.status || "aktif",
      notes: customer.notes || "",
    });
    setIsFormOpen(true);
  };

  const openDetail = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await customerService.getCustomer(id);
      const payload = unwrapData<ICustomer>(response);
      setSelectedCustomer(payload);
      setIsDetailOpen(true);
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal memuat detail customer",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCustomerCode = async () => {
    try {
      setIsGeneratingCustomerCode(true);
      const response = await codeGeneratorService.preview("customer");
      setField("customerCode", response.value ?? "");
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal generate kode customer",
        text: getErrorMessage(error),
      });
    } finally {
      setIsGeneratingCustomerCode(false);
    }
  };

  const submitForm = async () => {
    const payload: ICreateCustomerPayload | IUpdateCustomerPayload = {
      customerCode: form.customerCode.trim(),
      companyName: form.companyName.trim(),
      contactPerson: form.contactPerson.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
    };

    if (!payload.customerCode || !payload.companyName) {
      openSwal({
        icon: "warning",
        title: "Field wajib belum lengkap",
        text: "Lengkapi kode customer dan nama perusahaan.",
      });
      return;
    }

    try {
      setIsLoading(true);

      if (isEditMode && selectedCustomer) {
        await customerService.updateCustomer(selectedCustomer.id, payload);
      } else {
        await customerService.createCustomer(payload as ICreateCustomerPayload);
      }

      setIsFormOpen(false);
      await fetchCustomers();
      openSwal({
        icon: "success",
        title: "Data customer berhasil disimpan",
        toast: true,
        position: "top-right",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal menyimpan customer",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeCustomer = async (id: number) => {
    const confirm = await openSwal({
      icon: "warning",
      title: "Hapus customer ini?",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsLoading(true);
      await customerService.deleteCustomer(id);
      await fetchCustomers();
      openSwal({
        icon: "success",
        title: "Customer berhasil dihapus",
        toast: true,
        position: "top-right",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal menghapus customer",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (customer: ICustomer) => {
    try {
      setIsLoading(true);
      if (customer.status === "aktif") {
        await customerService.deactivateCustomer(customer.id);
      } else {
        await customerService.activateCustomer(customer.id);
      }
      await fetchCustomers();
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal mengubah status customer",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full">
      <Card className="flex flex-col h-full">
        <CardContent className="flex-1 min-h-0 overflow-auto">
          <DataTable
            columns={columns({
              detailData: openDetail,
              editData: openEdit,
              toggleStatus,
              deleteData: removeCustomer,
            })}
            data={customers}
            title={title}
            description={description}
            addData={openCreate}
            page={page}
            pageSize={pageSize}
            lastPage={lastPage}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            search={search}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            isClearPayload={handleClearPayload}
            isGetData={handleRefreshData}
          />
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Customer" : "Tambah Customer"}</DialogTitle>
            <DialogDescription>Lengkapi data customer untuk kebutuhan sales order.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t.customer.code} <span className="ml-0.5 text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input
                  value={form.customerCode}
                  onChange={(event) => setField("customerCode", event.target.value)}
                  placeholder="CUST-202603-001"
                />
                {!isEditMode ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateCustomerCode}
                    disabled={isGeneratingCustomerCode}
                  >
                    {isGeneratingCustomerCode ? "Generating..." : "Generate"}
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.customer.companyName} <span className="ml-0.5 text-red-500">*</span></Label>
              <Input
                value={form.companyName}
                onChange={(event) => setField("companyName", event.target.value)}
                placeholder="PT Mitra Sejahtera"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.customer.contactPerson}</Label>
              <Input
                value={form.contactPerson}
                onChange={(event) => setField("contactPerson", event.target.value)}
                placeholder="Budi Santoso"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.common.email}</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="purchase@company.co.id"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.common.phone}</Label>
              <Input
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                placeholder="08123456789"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.common.status}</Label>
              <Combobox
                options={[
                  { value: "aktif", label: t.common.active },
                  { value: "nonaktif", label: t.common.inactive },
                ]}
                value={form.status}
                onValueChange={(value) => setField("status", value as CustomerStatus)}
                placeholder={t.common.selectStatus}
                searchPlaceholder={t.common.searchStatus}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t.common.address}</Label>
              <Textarea
                value={form.address}
                onChange={(event) => setField("address", event.target.value)}
                placeholder="Jl. Industri No. 45, Surabaya"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t.common.notes}</Label>
              <Textarea
                value={form.notes}
                onChange={(event) => setField("notes", event.target.value)}
                placeholder={t.customer.notesPlaceholder}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
              onClick={submitForm}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Kode:</strong> {selectedCustomer?.customerCode ?? "-"}
            </p>
            <p>
              <strong>Perusahaan:</strong> {selectedCustomer?.companyName ?? "-"}
            </p>
            <p>
              <strong>PIC:</strong> {selectedCustomer?.contactPerson ?? "-"}
            </p>
            <p>
              <strong>Email:</strong> {selectedCustomer?.email ?? "-"}
            </p>
            <p>
              <strong>Phone:</strong> {selectedCustomer?.phone ?? "-"}
            </p>
            <p>
              <strong>Status:</strong> {selectedCustomer?.status ?? "-"}
            </p>
            <p>
              <strong>Alamat:</strong> {selectedCustomer?.address ?? "-"}
            </p>
            <p>
              <strong>Catatan:</strong> {selectedCustomer?.notes ?? "-"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
