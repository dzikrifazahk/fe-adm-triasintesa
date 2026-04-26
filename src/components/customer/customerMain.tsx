"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getDictionary } from "../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { codeGeneratorService, customerService } from "@/services";
import {
  CustomerStatus,
  ICreateCustomerPayload,
  ICustomer,
  IUpdateCustomerPayload,
} from "@/types/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>["customer_page_dic"];
type ListPayload<T> = { data: T[]; meta?: unknown };

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

function statusClassName(status: CustomerStatus): string {
  return status === "aktif"
    ? "bg-emerald-600 text-white"
    : "bg-slate-500 text-white";
}

export default function CustomerMain({ dictionary }: { dictionary: Dictionary }) {
  const { setIsLoading } = useLoading();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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

  const activeCount = useMemo(
    () => customers.filter((item) => item.status === "aktif").length,
    [customers],
  );

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await customerService.getCustomers({
        page: 1,
        limit: 100,
        search: search || undefined,
        status: (statusFilter as CustomerStatus) || undefined,
      });
      const payload = unwrapData<ListPayload<ICustomer>>(response);
      setCustomers(Array.isArray(payload.data) ? payload.data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat customer",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      Swal.fire({
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
      Swal.fire({
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
      Swal.fire({
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
      Swal.fire({
        icon: "success",
        title: "Data customer berhasil disimpan",
        toast: true,
        position: "top-right",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan customer",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeCustomer = async (id: number) => {
    const confirm = await Swal.fire({
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
      Swal.fire({
        icon: "success",
        title: "Customer berhasil dihapus",
        toast: true,
        position: "top-right",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
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
      Swal.fire({
        icon: "error",
        title: "Gagal mengubah status customer",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-slate-600">{description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-slate-700 text-white">Total: {customers.length}</Badge>
            <Badge className="bg-emerald-600 text-white">Aktif: {activeCount}</Badge>
            <Badge className="bg-slate-500 text-white">
              Nonaktif: {customers.length - activeCount}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card className="h-full">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Daftar Customer</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchCustomers}>
                Refresh
              </Button>
              <Button
                className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
                onClick={openCreate}
              >
                Tambah Customer
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <Input
              placeholder="Cari kode, nama, atau PIC..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="h-10 rounded-md border border-slate-200 px-3 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
            <Button onClick={fetchCustomers}>Apply Filter</Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>PIC</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-20 text-center">
                      Tidak ada data customer.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.customerCode}</TableCell>
                      <TableCell>{customer.companyName}</TableCell>
                      <TableCell>{customer.contactPerson}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>
                        <Badge className={statusClassName(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button size="sm" variant="outline" onClick={() => openDetail(customer.id)}>
                            Detail
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEdit(customer)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => toggleStatus(customer)}>
                            {customer.status === "aktif" ? "Deactivate" : "Activate"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => removeCustomer(customer.id)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
              <Label>Kode Customer</Label>
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
              <Label>Nama Perusahaan</Label>
              <Input
                value={form.companyName}
                onChange={(event) => setField("companyName", event.target.value)}
                placeholder="PT Mitra Sejahtera"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={form.contactPerson}
                onChange={(event) => setField("contactPerson", event.target.value)}
                placeholder="Budi Santoso"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="purchase@company.co.id"
              />
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                placeholder="08123456789"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                value={form.status}
                onChange={(event) => setField("status", event.target.value as CustomerStatus)}
              >
                <option value="aktif">aktif</option>
                <option value="nonaktif">nonaktif</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Alamat</Label>
              <Textarea
                value={form.address}
                onChange={(event) => setField("address", event.target.value)}
                placeholder="Jl. Industri No. 45, Surabaya"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Catatan</Label>
              <Textarea
                value={form.notes}
                onChange={(event) => setField("notes", event.target.value)}
                placeholder="Catatan tambahan customer"
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
