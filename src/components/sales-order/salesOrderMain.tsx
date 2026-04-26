"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getDictionary } from "../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { codeGeneratorService, salesOrderService } from "@/services";
import {
  ICancelSalesOrderPayload,
  ICompleteSalesOrderPayload,
  ICreateSalesOrderPayload,
  IProcessShipmentPayload,
  ISalesOrder,
  ISalesOrderBatch,
  ISalesOrderCustomer,
  SalesOrderStatus,
  IUpdateSalesOrderPayload,
} from "@/types/sales-order";
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

type DetailDraft = {
  batchId: string;
  quantityJirigen: string;
  pricePerJirigen: string;
};

type FormState = {
  customerId: string;
  soNumber: string;
  orderDate: string;
  paymentMethod: string;
  paymentTermDays: string;
  discountAmount: string;
  shippingCost: string;
  shippingAddress: string;
  notes: string;
  details: DetailDraft[];
};

const emptyForm: FormState = {
  customerId: "",
  soNumber: "",
  orderDate: "",
  paymentMethod: "cash",
  paymentTermDays: "",
  discountAmount: "0",
  shippingCost: "0",
  shippingAddress: "",
  notes: "",
  details: [{ batchId: "", quantityJirigen: "1", pricePerJirigen: "0" }],
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

function formatCurrency(value?: number): string {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusClassName(status: SalesOrderStatus): string {
  if (status === "completed") return "bg-emerald-600 text-white";
  if (status === "cancelled") return "bg-red-600 text-white";
  if (status === "ready_to_ship") return "bg-amber-600 text-white";
  if (status === "shipped") return "bg-blue-600 text-white";
  return "bg-slate-600 text-white";
}

function statusLabel(status: SalesOrderStatus): string {
  return status.replaceAll("_", " ");
}

export default function SalesOrderMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["sales_order_page_dic"];
}) {
  const { setIsLoading } = useLoading();

  const [orders, setOrders] = useState<ISalesOrder[]>([]);
  const [customers, setCustomers] = useState<ISalesOrderCustomer[]>([]);
  const [batches, setBatches] = useState<ISalesOrderBatch[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGeneratingSoNumber, setIsGeneratingSoNumber] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ISalesOrder | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const title = dictionary?.title ?? "Sales Order";
  const description =
    dictionary?.description ??
    "Kelola sales order dari input hingga penyelesaian pengiriman.";

  const canCreate = useMemo(() => !isEditMode, [isEditMode]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await salesOrderService.getSalesOrders({
        page: 1,
        limit: 100,
        soNumber: search || undefined,
        status: (statusFilter as SalesOrderStatus) || undefined,
      });
      const payload = unwrapData<ListPayload<ISalesOrder>>(response);
      setOrders(Array.isArray(payload.data) ? payload.data : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat sales order",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const customerResponse = await salesOrderService.getCustomers({
        page: 1,
        limit: 100,
      });
      const customerPayload = unwrapData<ListPayload<ISalesOrderCustomer>>(customerResponse);
      setCustomers(Array.isArray(customerPayload.data) ? customerPayload.data : []);
    } catch {
      setCustomers([]);
    }

    try {
      const batchResponse = await salesOrderService.getProductionBatches({
        page: 1,
        limit: 200,
      });
      const batchPayload = unwrapData<ListPayload<ISalesOrderBatch>>(batchResponse);
      setBatches(Array.isArray(batchPayload.data) ? batchPayload.data : []);
    } catch {
      setBatches([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setIsEditMode(false);
    setSelectedOrder(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (order: ISalesOrder) => {
    setIsEditMode(true);
    setSelectedOrder(order);
    setForm({
      customerId: String(order.customerId ?? ""),
      soNumber: order.soNumber ?? "",
      orderDate: order.orderDate?.slice(0, 10) ?? "",
      paymentMethod: order.paymentMethod ?? "cash",
      paymentTermDays: order.paymentTermDays ? String(order.paymentTermDays) : "",
      discountAmount: String(order.discountAmount ?? 0),
      shippingCost: String(order.shippingCost ?? 0),
      shippingAddress: order.shippingAddress ?? "",
      notes: order.notes ?? "",
      details:
        order.details?.map((item) => ({
          batchId: String(item.batchId),
          quantityJirigen: String(item.quantityJirigen),
          pricePerJirigen: String(item.pricePerJirigen),
        })) ?? emptyForm.details,
    });
    setIsFormOpen(true);
  };

  const openDetail = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await salesOrderService.getSalesOrder(id);
      const detail = unwrapData<ISalesOrder>(response);
      setSelectedOrder(detail);
      setIsDetailOpen(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat detail sales order",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedOrder(null);
    setForm(emptyForm);
  };

  const handleGenerateSoNumber = async () => {
    try {
      setIsGeneratingSoNumber(true);
      const response = await codeGeneratorService.preview("sales_order");
      setField("soNumber", response.value ?? "");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal generate nomor SO",
        text: getErrorMessage(error),
      });
    } finally {
      setIsGeneratingSoNumber(false);
    }
  };

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setDetailField = (
    index: number,
    field: keyof DetailDraft,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      details: prev.details.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  };

  const addDetailRow = () => {
    setForm((prev) => ({
      ...prev,
      details: [
        ...prev.details,
        { batchId: "", quantityJirigen: "1", pricePerJirigen: "0" },
      ],
    }));
  };

  const removeDetailRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      details:
        prev.details.length <= 1
          ? prev.details
          : prev.details.filter((_, idx) => idx !== index),
    }));
  };

  const buildCreatePayload = (): ICreateSalesOrderPayload => ({
    customerId: toNumber(form.customerId),
    soNumber: form.soNumber.trim(),
    orderDate: form.orderDate,
    paymentMethod: form.paymentMethod,
    paymentTermDays: form.paymentTermDays ? toNumber(form.paymentTermDays) : undefined,
    discountAmount: toNumber(form.discountAmount),
    shippingCost: toNumber(form.shippingCost),
    shippingAddress: form.shippingAddress.trim() || undefined,
    notes: form.notes.trim() || undefined,
    details: form.details.map((item) => ({
      batchId: toNumber(item.batchId),
      quantityJirigen: toNumber(item.quantityJirigen),
      pricePerJirigen: toNumber(item.pricePerJirigen),
    })),
  });

  const buildUpdatePayload = (): IUpdateSalesOrderPayload => ({
    customerId: toNumber(form.customerId),
    soNumber: form.soNumber.trim(),
    orderDate: form.orderDate,
    paymentMethod: form.paymentMethod,
    paymentTermDays: form.paymentTermDays ? toNumber(form.paymentTermDays) : undefined,
    discountAmount: toNumber(form.discountAmount),
    shippingCost: toNumber(form.shippingCost),
    shippingAddress: form.shippingAddress.trim() || undefined,
    notes: form.notes.trim() || undefined,
  });

  const validateCreatePayload = (payload: ICreateSalesOrderPayload): string | null => {
    if (!payload.customerId || !payload.soNumber || !payload.orderDate) {
      return "Customer, SO number, dan tanggal order wajib diisi.";
    }

    if (!payload.details.length) {
      return "Minimal 1 detail order wajib diisi.";
    }

    const hasInvalid = payload.details.some(
      (item) =>
        !item.batchId || item.quantityJirigen <= 0 || item.pricePerJirigen <= 0,
    );
    if (hasInvalid) {
      return "Batch, quantity, dan price pada detail wajib valid.";
    }

    return null;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!isEditMode) {
        const createPayload = buildCreatePayload();
        const validationError = validateCreatePayload(createPayload);
        if (validationError) {
          Swal.fire({ icon: "warning", title: validationError });
          return;
        }
        await salesOrderService.createSalesOrder(createPayload);
        Swal.fire({
          icon: "success",
          title: "Sales order berhasil dibuat",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-right",
        });
      } else {
        if (!selectedOrder) return;
        const updatePayload = buildUpdatePayload();
        await salesOrderService.updateSalesOrder(selectedOrder.id, updatePayload);
        Swal.fire({
          icon: "success",
          title: "Sales order berhasil diperbarui",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-right",
        });
      }

      closeForm();
      await fetchOrders();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan sales order",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrder = async (id: number) => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Hapus sales order ini?",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });
    if (!confirmation.isConfirmed) return;

    try {
      setIsLoading(true);
      await salesOrderService.deleteSalesOrder(id);
      await fetchOrders();
      Swal.fire({
        icon: "success",
        title: "Sales order berhasil dihapus",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-right",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus sales order",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const callStatusAction = async (
    id: number,
    action: "approve" | "accept" | "ready" | "shipment" | "complete" | "cancel",
  ) => {
    try {
      setIsLoading(true);

      if (action === "approve") {
        await salesOrderService.approveByDirector(id);
      }

      if (action === "accept") {
        await salesOrderService.acceptByStaff(id);
      }

      if (action === "ready") {
        await salesOrderService.markReadyToShip(id);
      }

      if (action === "shipment") {
        const shippingDateResult = await Swal.fire({
          title: "Tanggal kirim (YYYY-MM-DD)",
          input: "text",
          inputValue: new Date().toISOString().slice(0, 10),
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) return "Tanggal kirim wajib diisi";
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Format tanggal harus YYYY-MM-DD";
            return null;
          },
        });
        if (!shippingDateResult.isConfirmed || !shippingDateResult.value) return;

        const shippingNotesResult = await Swal.fire({
          title: "Catatan pengiriman (opsional)",
          input: "text",
          inputValue: "",
          showCancelButton: true,
        });
        if (!shippingNotesResult.isConfirmed) return;

        const payload: IProcessShipmentPayload = {
          shippingDate: shippingDateResult.value,
          shippingNotes: shippingNotesResult.value || undefined,
        };
        await salesOrderService.processShipment(id, payload);
      }

      if (action === "complete") {
        const receivedByResult = await Swal.fire({
          title: "Diterima oleh",
          input: "text",
          showCancelButton: true,
          inputValidator: (value) => (!value ? "Nama penerima wajib diisi" : null),
        });
        if (!receivedByResult.isConfirmed || !receivedByResult.value) return;

        const notesResult = await Swal.fire({
          title: "Catatan penerimaan (opsional)",
          input: "text",
          inputValue: "",
          showCancelButton: true,
        });
        if (!notesResult.isConfirmed) return;

        const payload: ICompleteSalesOrderPayload = {
          receivedByCustomer: receivedByResult.value,
          notes: notesResult.value || undefined,
        };
        await salesOrderService.completeOrder(id, payload);
      }

      if (action === "cancel") {
        const reasonResult = await Swal.fire({
          title: "Alasan pembatalan",
          input: "text",
          showCancelButton: true,
          inputValidator: (value) => (!value ? "Alasan pembatalan wajib diisi" : null),
        });
        if (!reasonResult.isConfirmed || !reasonResult.value) return;
        const payload: ICancelSalesOrderPayload = { reason: reasonResult.value };
        await salesOrderService.cancelOrder(id, payload);
      }

      await fetchOrders();
      Swal.fire({
        icon: "success",
        title: "Status sales order berhasil diperbarui",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-right",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memproses status sales order",
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
              placeholder="Cari nomor SO"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">Semua status</option>
              <option value="pending_approval">pending approval</option>
              <option value="approved">approved</option>
              <option value="processing">processing</option>
              <option value="ready_to_ship">ready to ship</option>
              <option value="shipped">shipped</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
            <Button variant="outline" onClick={fetchOrders}>
              Refresh
            </Button>
            <Button className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary" onClick={openCreate}>
              Tambah Sales Order
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SO Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-20 text-center">
                      Tidak ada data sales order.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.soNumber}</TableCell>
                      <TableCell>{order.customer?.companyName ?? "-"}</TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell>
                        <Badge className={statusClassName(order.status)}>{statusLabel(order.status)}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(order.grandTotal)}</TableCell>
                      <TableCell className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openDetail(order.id)}>
                          Detail
                        </Button>
                        {(order.status === "pending_approval" || order.status === "approved") && (
                          <Button size="sm" variant="outline" onClick={() => openEdit(order)}>
                            Edit
                          </Button>
                        )}
                        {order.status === "pending_approval" && (
                          <Button size="sm" onClick={() => callStatusAction(order.id, "approve")}>
                            Approve
                          </Button>
                        )}
                        {order.status === "approved" && (
                          <Button size="sm" onClick={() => callStatusAction(order.id, "accept")}>
                            Accept
                          </Button>
                        )}
                        {order.status === "processing" && (
                          <Button size="sm" onClick={() => callStatusAction(order.id, "ready")}>
                            Ready
                          </Button>
                        )}
                        {order.status === "ready_to_ship" && (
                          <Button size="sm" onClick={() => callStatusAction(order.id, "shipment")}>
                            Shipment
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button size="sm" onClick={() => callStatusAction(order.id, "complete")}>
                            Complete
                          </Button>
                        )}
                        {order.status !== "completed" && order.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => callStatusAction(order.id, "cancel")}
                          >
                            Cancel
                          </Button>
                        )}
                        {order.status === "pending_approval" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteOrder(order.id)}
                          >
                            Delete
                          </Button>
                        )}
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
            <DialogTitle>{isEditMode ? "Ubah Sales Order" : "Tambah Sales Order"}</DialogTitle>
            <DialogDescription>Lengkapi data order sesuai kebutuhan operasional.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer</Label>
              <select
                id="customerId"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={form.customerId}
                onChange={(event) => setField("customerId", event.target.value)}
              >
                <option value="">Pilih customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="soNumber">SO Number</Label>
              <div className="flex gap-2">
                <Input
                  id="soNumber"
                  value={form.soNumber}
                  onChange={(event) => setField("soNumber", event.target.value)}
                />
                {!isEditMode ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateSoNumber}
                    disabled={isGeneratingSoNumber}
                  >
                    {isGeneratingSoNumber ? "Generating..." : "Generate"}
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                value={form.orderDate}
                onChange={(event) => setField("orderDate", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={form.paymentMethod}
                onChange={(event) => setField("paymentMethod", event.target.value)}
              >
                <option value="cash">cash</option>
                <option value="termin">termin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTermDays">Payment Term (hari)</Label>
              <Input
                id="paymentTermDays"
                type="number"
                value={form.paymentTermDays}
                onChange={(event) => setField("paymentTermDays", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountAmount">Diskon</Label>
              <Input
                id="discountAmount"
                type="number"
                value={form.discountAmount}
                onChange={(event) => setField("discountAmount", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingCost">Biaya Kirim</Label>
              <Input
                id="shippingCost"
                type="number"
                value={form.shippingCost}
                onChange={(event) => setField("shippingCost", event.target.value)}
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => setField("notes", event.target.value)}
              />
            </div>
          </div>

          {canCreate && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Detail Order</h3>
                <Button variant="outline" onClick={addDetailRow}>
                  Tambah Item
                </Button>
              </div>

              {form.details.map((detail, index) => (
                <div key={`detail-${index}`} className="grid grid-cols-1 gap-2 rounded-md border p-3 md:grid-cols-4">
                  <select
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={detail.batchId}
                    onChange={(event) => setDetailField(index, "batchId", event.target.value)}
                  >
                    <option value="">Pilih Batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchNumber}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="Qty Jirigen"
                    value={detail.quantityJirigen}
                    onChange={(event) => setDetailField(index, "quantityJirigen", event.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Harga/Jirigen"
                    value={detail.pricePerJirigen}
                    onChange={(event) => setDetailField(index, "pricePerJirigen", event.target.value)}
                  />
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => removeDetailRow(index)}
                    disabled={form.details.length === 1}
                  >
                    Hapus Item
                  </Button>
                </div>
              ))}
            </div>
          )}

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
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail Sales Order</DialogTitle>
            <DialogDescription>Ringkasan order dan item detail.</DialogDescription>
          </DialogHeader>

          {selectedOrder ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <p>
                  <span className="font-semibold">SO:</span> {selectedOrder.soNumber}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <Badge className={statusClassName(selectedOrder.status)}>
                    {statusLabel(selectedOrder.status)}
                  </Badge>
                </p>
                <p>
                  <span className="font-semibold">Customer:</span>{" "}
                  {selectedOrder.customer?.companyName ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">Order Date:</span>{" "}
                  {formatDate(selectedOrder.orderDate)}
                </p>
                <p>
                  <span className="font-semibold">Grand Total:</span>{" "}
                  {formatCurrency(selectedOrder.grandTotal)}
                </p>
                <p>
                  <span className="font-semibold">Shipping Date:</span>{" "}
                  {formatDate(selectedOrder.shippingDate)}
                </p>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.details?.length ? (
                      selectedOrder.details.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell>{detail.batch?.batchNumber ?? detail.batchId}</TableCell>
                          <TableCell>{detail.quantityJirigen}</TableCell>
                          <TableCell>{formatCurrency(detail.pricePerJirigen)}</TableCell>
                          <TableCell>{formatCurrency(detail.subtotal)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Tidak ada detail item.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
