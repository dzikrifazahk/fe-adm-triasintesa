"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getDictionary } from "../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { deliveryOrderService, salesOrderService } from "@/services";
import { ISalesOrder } from "@/types/sales-order";
import {
  DeliveryOrderStatus,
  ICreateDeliveryFromSalesOrderPayload,
  IDeliveryOrder,
  IUpdateDeliveryOrderPayload,
} from "@/types/shipping";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

type ListPayload<T> = {
  data: T[];
  meta?: unknown;
};

type DeliveryFormState = {
  salesOrderId: string;
  deliveryDate: string;
  deliveryTime: string;
  driverName: string;
  vehicleNumber: string;
  vehicleType: string;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  notes: string;
};

const emptyForm: DeliveryFormState = {
  salesOrderId: "",
  deliveryDate: "",
  deliveryTime: "10:00:00",
  driverName: "",
  vehicleNumber: "",
  vehicleType: "",
  shippingAddress: "",
  recipientName: "",
  recipientPhone: "",
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

function toNumber(value: string, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
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

function formatDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID");
}

function statusClassName(status: DeliveryOrderStatus): string {
  if (status === "delivered") return "bg-emerald-600 text-white";
  if (status === "returned") return "bg-red-600 text-white";
  if (status === "in_transit") return "bg-blue-600 text-white";
  return "bg-amber-600 text-white";
}

function statusLabel(status: DeliveryOrderStatus): string {
  return status.replaceAll("_", " ");
}

export default function ShippingMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["shipping_page_dic"];
}) {
  const { setIsLoading } = useLoading();

  const [deliveries, setDeliveries] = useState<IDeliveryOrder[]>([]);
  const [salesOrders, setSalesOrders] = useState<ISalesOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProofOpen, setIsProofOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedDelivery, setSelectedDelivery] = useState<IDeliveryOrder | null>(null);
  const [form, setForm] = useState<DeliveryFormState>(emptyForm);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofNotes, setProofNotes] = useState("");

  const title = dictionary?.title ?? "Shipping";
  const description =
    dictionary?.description ??
    "Kelola delivery order, proses pengiriman, dan bukti kirim.";

  const fetchDeliveries = async () => {
    try {
      setIsLoading(true);
      const response = await deliveryOrderService.getDeliveryOrders({
        page: 1,
        limit: 100,
        doNumber: search || undefined,
        status: (statusFilter as DeliveryOrderStatus) || undefined,
      });
      const payload = unwrapData<ListPayload<IDeliveryOrder>>(response);
      setDeliveries(Array.isArray(payload.data) ? payload.data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat delivery order",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalesOrderOptions = async () => {
    try {
      const response = await salesOrderService.getSalesOrders({
        page: 1,
        limit: 200,
      });
      const payload = unwrapData<ListPayload<ISalesOrder>>(response);
      setSalesOrders(Array.isArray(payload.data) ? payload.data : []);
    } catch {
      setSalesOrders([]);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchSalesOrderOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runQuickFilter = async (type: "all" | "pending" | "in_transit" | "today") => {
    try {
      setIsLoading(true);
      if (type === "all") {
        await fetchDeliveries();
        return;
      }

      if (type === "pending") {
        const response = await deliveryOrderService.getPendingDeliveries();
        const payload = unwrapData<IDeliveryOrder[]>(response);
        setDeliveries(Array.isArray(payload) ? payload : []);
      }

      if (type === "in_transit") {
        const response = await deliveryOrderService.getInTransitDeliveries();
        const payload = unwrapData<IDeliveryOrder[]>(response);
        setDeliveries(Array.isArray(payload) ? payload : []);
      }

      if (type === "today") {
        const response = await deliveryOrderService.getTodayDeliveries();
        const payload = unwrapData<IDeliveryOrder[]>(response);
        setDeliveries(Array.isArray(payload) ? payload : []);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat quick filter pengiriman",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setIsEditMode(false);
    setSelectedDelivery(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (delivery: IDeliveryOrder) => {
    setIsEditMode(true);
    setSelectedDelivery(delivery);
    setForm({
      salesOrderId: String(delivery.salesOrderId ?? ""),
      deliveryDate: delivery.deliveryDate?.slice(0, 10) ?? "",
      deliveryTime: delivery.deliveryTime ?? "10:00:00",
      driverName: delivery.driverName ?? "",
      vehicleNumber: delivery.vehicleNumber ?? "",
      vehicleType: delivery.vehicleType ?? "",
      shippingAddress: delivery.shippingAddress ?? "",
      recipientName: delivery.recipientName ?? "",
      recipientPhone: delivery.recipientPhone ?? "",
      notes: delivery.notes ?? "",
    });
    setIsFormOpen(true);
  };

  const openDetail = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await deliveryOrderService.getDeliveryOrder(id);
      const payload = unwrapData<IDeliveryOrder>(response);
      setSelectedDelivery(payload);
      setIsDetailOpen(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat detail delivery order",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedDelivery(null);
    setForm(emptyForm);
  };

  const setField = (field: keyof DeliveryFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validatePayload = (): string | null => {
    if (!form.salesOrderId || !form.deliveryDate || !form.deliveryTime) {
      return "Sales order, tanggal, dan waktu kirim wajib diisi.";
    }
    if (!form.driverName || !form.vehicleNumber || !form.vehicleType) {
      return "Data driver dan kendaraan wajib diisi.";
    }
    if (!form.shippingAddress || !form.recipientName || !form.recipientPhone) {
      return "Alamat dan penerima wajib diisi.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validatePayload();
    if (validationError) {
      Swal.fire({ icon: "warning", title: validationError });
      return;
    }

    try {
      setIsLoading(true);
      if (!isEditMode) {
        const payload: ICreateDeliveryFromSalesOrderPayload = {
          salesOrderId: toNumber(form.salesOrderId),
          deliveryDate: form.deliveryDate,
          deliveryTime: form.deliveryTime,
          driverName: form.driverName,
          vehicleNumber: form.vehicleNumber,
          vehicleType: form.vehicleType,
          shippingAddress: form.shippingAddress,
          recipientName: form.recipientName,
          recipientPhone: form.recipientPhone,
          notes: form.notes || undefined,
        };
        await deliveryOrderService.createFromSalesOrder(payload);
        Swal.fire({
          icon: "success",
          title: "Delivery order berhasil dibuat",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-right",
        });
      } else {
        if (!selectedDelivery) return;
        const payload: IUpdateDeliveryOrderPayload = {
          salesOrderId: toNumber(form.salesOrderId),
          deliveryDate: form.deliveryDate,
          deliveryTime: form.deliveryTime,
          driverName: form.driverName,
          vehicleNumber: form.vehicleNumber,
          vehicleType: form.vehicleType,
          shippingAddress: form.shippingAddress,
          recipientName: form.recipientName,
          recipientPhone: form.recipientPhone,
          notes: form.notes || undefined,
        };
        await deliveryOrderService.updateDeliveryOrder(selectedDelivery.id, payload);
        Swal.fire({
          icon: "success",
          title: "Delivery order berhasil diperbarui",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-right",
        });
      }
      closeForm();
      await fetchDeliveries();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan delivery order",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDelivery = async (id: number) => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Hapus delivery order ini?",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });
    if (!confirmation.isConfirmed) return;

    try {
      setIsLoading(true);
      await deliveryOrderService.deleteDeliveryOrder(id);
      await fetchDeliveries();
      Swal.fire({
        icon: "success",
        title: "Delivery order berhasil dihapus",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-right",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus delivery order",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const callAction = async (
    id: number,
    action: "in_transit" | "delivered" | "returned" | "reminder",
  ) => {
    try {
      setIsLoading(true);
      if (action === "in_transit") {
        await deliveryOrderService.markInTransit(id);
      }

      if (action === "delivered") {
        await deliveryOrderService.markDelivered(id);
      }

      if (action === "returned") {
        const reasonResult = await Swal.fire({
          title: "Alasan retur",
          input: "text",
          showCancelButton: true,
          inputValidator: (value) => (!value ? "Alasan retur wajib diisi" : null),
        });
        if (!reasonResult.isConfirmed || !reasonResult.value) return;
        await deliveryOrderService.markReturned(id, reasonResult.value);
      }

      if (action === "reminder") {
        const recipientsResult = await Swal.fire({
          title: "Recipients dipisah koma",
          input: "text",
          inputValue: "staff_gudang,direktur",
          showCancelButton: true,
          inputValidator: (value) => (!value ? "Minimal 1 recipient wajib diisi" : null),
        });
        if (!recipientsResult.isConfirmed || !recipientsResult.value) return;

        const recipients = recipientsResult.value
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);
        if (!recipients.length) return;

        const messageResult = await Swal.fire({
          title: "Pesan reminder (opsional)",
          input: "text",
          inputValue: "",
          showCancelButton: true,
        });
        if (!messageResult.isConfirmed) return;

        await deliveryOrderService.sendReminder(id, {
          recipients,
          message: messageResult.value || undefined,
        });
      }

      await fetchDeliveries();
      Swal.fire({
        icon: "success",
        title: "Aksi pengiriman berhasil diproses",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-right",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memproses aksi pengiriman",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openUploadProof = (delivery: IDeliveryOrder) => {
    setSelectedDelivery(delivery);
    setProofFile(null);
    setProofNotes("");
    setIsProofOpen(true);
  };

  const submitProof = async () => {
    if (!selectedDelivery) return;
    if (!proofFile) {
      Swal.fire({
        icon: "warning",
        title: "File bukti kirim wajib dipilih",
      });
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("proof", proofFile);
      if (proofNotes.trim()) {
        formData.append("notes", proofNotes.trim());
      }
      await deliveryOrderService.uploadProof(selectedDelivery.id, formData);
      setIsProofOpen(false);
      await fetchDeliveries();
      Swal.fire({
        icon: "success",
        title: "Bukti kirim berhasil di-upload",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-right",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal upload bukti kirim",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full">
      <Card className="h-full">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Input
              placeholder="Cari nomor DO"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Semua status</option>
              <option value="pending">pending</option>
              <option value="in_transit">in transit</option>
              <option value="delivered">delivered</option>
              <option value="returned">returned</option>
            </select>
            <Button variant="outline" onClick={fetchDeliveries}>
              Refresh
            </Button>
            <Button className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary" onClick={openCreate}>
              Tambah Delivery Order
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => runQuickFilter("all")}>
              Semua
            </Button>
            <Button variant="outline" onClick={() => runQuickFilter("pending")}>
              Pending
            </Button>
            <Button variant="outline" onClick={() => runQuickFilter("in_transit")}>
              In Transit
            </Button>
            <Button variant="outline" onClick={() => runQuickFilter("today")}>
              Hari Ini
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DO Number</TableHead>
                  <TableHead>Sales Order</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-20 text-center">
                      Tidak ada data delivery order.
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>{delivery.doNumber}</TableCell>
                      <TableCell>{delivery.salesOrder?.soNumber ?? delivery.salesOrderId}</TableCell>
                      <TableCell>{formatDate(delivery.deliveryDate)}</TableCell>
                      <TableCell>{delivery.driverName}</TableCell>
                      <TableCell>
                        <Badge className={statusClassName(delivery.status)}>
                          {statusLabel(delivery.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openDetail(delivery.id)}>
                          Detail
                        </Button>
                        {delivery.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => openEdit(delivery)}>
                              Edit
                            </Button>
                            <Button size="sm" onClick={() => callAction(delivery.id, "in_transit")}>
                              In Transit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteDelivery(delivery.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                        {delivery.status === "in_transit" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => openUploadProof(delivery)}>
                              Upload Proof
                            </Button>
                            <Button size="sm" onClick={() => callAction(delivery.id, "delivered")}>
                              Delivered
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => callAction(delivery.id, "returned")}
                            >
                              Returned
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => callAction(delivery.id, "reminder")}
                        >
                          Reminder
                        </Button>
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
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Ubah Delivery Order" : "Tambah Delivery Order"}</DialogTitle>
            <DialogDescription>
              Lengkapi data pengiriman untuk proses delivery order.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salesOrderId">Sales Order</Label>
              <select
                id="salesOrderId"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={form.salesOrderId}
                onChange={(event) => setField("salesOrderId", event.target.value)}
              >
                <option value="">Pilih sales order</option>
                {salesOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.soNumber}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Tanggal Kirim</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={form.deliveryDate}
                onChange={(event) => setField("deliveryDate", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryTime">Waktu Kirim (HH:mm:ss)</Label>
              <Input
                id="deliveryTime"
                value={form.deliveryTime}
                onChange={(event) => setField("deliveryTime", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverName">Nama Driver</Label>
              <Input
                id="driverName"
                value={form.driverName}
                onChange={(event) => setField("driverName", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Nomor Kendaraan</Label>
              <Input
                id="vehicleNumber"
                value={form.vehicleNumber}
                onChange={(event) => setField("vehicleNumber", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Tipe Kendaraan</Label>
              <Input
                id="vehicleType"
                value={form.vehicleType}
                onChange={(event) => setField("vehicleType", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="shippingAddress">Alamat Pengiriman</Label>
              <Textarea
                id="shippingAddress"
                value={form.shippingAddress}
                onChange={(event) => setField("shippingAddress", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientName">Nama Penerima</Label>
              <Input
                id="recipientName"
                value={form.recipientName}
                onChange={(event) => setField("recipientName", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientPhone">Telepon Penerima</Label>
              <Input
                id="recipientPhone"
                value={form.recipientPhone}
                onChange={(event) => setField("recipientPhone", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="deliveryNotes">Catatan</Label>
              <Textarea
                id="deliveryNotes"
                value={form.notes}
                onChange={(event) => setField("notes", event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeForm}>
              Batal
            </Button>
            <Button className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary" onClick={handleSubmit}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Delivery Order</DialogTitle>
            <DialogDescription>Detail status dan data pengiriman.</DialogDescription>
          </DialogHeader>

          {selectedDelivery ? (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <p>
                <span className="font-semibold">DO Number:</span> {selectedDelivery.doNumber}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <Badge className={statusClassName(selectedDelivery.status)}>
                  {statusLabel(selectedDelivery.status)}
                </Badge>
              </p>
              <p>
                <span className="font-semibold">Sales Order:</span>{" "}
                {selectedDelivery.salesOrder?.soNumber ?? selectedDelivery.salesOrderId}
              </p>
              <p>
                <span className="font-semibold">Delivery Date:</span>{" "}
                {formatDate(selectedDelivery.deliveryDate)}
              </p>
              <p>
                <span className="font-semibold">Delivery Time:</span> {selectedDelivery.deliveryTime}
              </p>
              <p>
                <span className="font-semibold">Driver:</span> {selectedDelivery.driverName}
              </p>
              <p>
                <span className="font-semibold">Vehicle:</span> {selectedDelivery.vehicleNumber} (
                {selectedDelivery.vehicleType})
              </p>
              <p>
                <span className="font-semibold">Recipient:</span> {selectedDelivery.recipientName} (
                {selectedDelivery.recipientPhone})
              </p>
              <p className="md:col-span-2">
                <span className="font-semibold">Alamat:</span> {selectedDelivery.shippingAddress}
              </p>
              <p className="md:col-span-2">
                <span className="font-semibold">Catatan:</span> {selectedDelivery.notes || "-"}
              </p>
              <p className="md:col-span-2">
                <span className="font-semibold">Proof:</span>{" "}
                {selectedDelivery.deliveryProofPhoto ? "Sudah ada" : "Belum ada"}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={isProofOpen} onOpenChange={setIsProofOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Bukti Kirim</DialogTitle>
            <DialogDescription>Upload foto bukti pengiriman sebelum mark delivered.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
            />
            <Textarea
              placeholder="Catatan bukti kirim (opsional)"
              value={proofNotes}
              onChange={(event) => setProofNotes(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProofOpen(false)}>
              Batal
            </Button>
            <Button className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary" onClick={submitProof}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
