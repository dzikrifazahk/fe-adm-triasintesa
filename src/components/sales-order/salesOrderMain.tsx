"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { openSwal } from "@/lib/swal";
import { getDictionary } from "../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { codeGeneratorService, salesOrderService } from "@/services";
import {
  ICancelSalesOrderPayload,
  ICompleteSalesOrderPayload,
  ICreateSalesOrderPayload,
  IProcessShipmentPayload,
  ISalesOrder,
  ISalesOrderCustomer,
  ISalesOrderItem,
  SalesOrderStatus,
  IUpdateSalesOrderPayload,
} from "@/types/sales-order";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Ban,
  Calculator,
  Check,
  CircleDollarSign,
  Edit3,
  Eye,
  MoreHorizontal,
  PackageCheck,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

type ListPayload<T> = {
  data: T[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
};

type DetailDraft = {
  itemId: string;
  quantity: string;
  unitPrice: string;
};

type FormState = {
  customerId: string;
  soNumber: string;
  orderDate: string;
  paymentMethod: string;
  paymentTermDays: string;
  discountType: "nominal" | "percentage";
  discountValue: string;
  ppnPercentage: string;
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
  discountType: "nominal",
  discountValue: "0",
  ppnPercentage: "11",
  shippingCost: "0",
  shippingAddress: "",
  notes: "",
  details: [{ itemId: "", quantity: "1", unitPrice: "0" }],
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

function detailSubtotal(detail: DetailDraft): number {
  const quantity = toNumber(detail.quantity);
  const unitPrice = toNumber(detail.unitPrice);
  if (quantity <= 0 || unitPrice < 0) return 0;
  return quantity * unitPrice;
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

function SummaryValue({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-md border bg-white px-3 py-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-sm ${strong ? "font-bold text-slate-950" : "font-semibold text-slate-800"}`}>
        {value}
      </p>
    </div>
  );
}

export default function SalesOrderMain({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["sales_order_page_dic"];
}) {
  const actionItemClassName =
    "cursor-pointer rounded-md border px-3 py-2 focus:bg-slate-50 dark:focus:bg-[#1F2023]";

  const { setIsLoading } = useLoading();

  const [orders, setOrders] = useState<ISalesOrder[]>([]);
  const [customers, setCustomers] = useState<ISalesOrderCustomer[]>([]);
  const [items, setItems] = useState<ISalesOrderItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

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

  const canManageDetails = useMemo(() => true, []);
  const itemById = useMemo(() => {
    return new Map(items.map((item) => [String(item.id), item]));
  }, [items]);
  const formItemOptions = useMemo(() => {
    const optionMap = new Map<string, ISalesOrderItem>();
    items.forEach((item) => optionMap.set(String(item.id), item));
    selectedOrder?.details?.forEach((detail) => {
      if (detail.item) {
        optionMap.set(String(detail.itemId), {
          ...detail.item,
          stock: detail.item.stock ?? 0,
          unitPrice: detail.unitPrice,
        });
      }
    });
    return Array.from(optionMap.values());
  }, [items, selectedOrder]);
  const allocationsByDetail = useMemo(() => {
    const grouped = new Map<number, NonNullable<ISalesOrder["allocations"]>>();
    if (!selectedOrder?.allocations?.length) return grouped;

    selectedOrder.allocations.forEach((allocation) => {
      const key = allocation.salesOrderDetailId;
      const current = grouped.get(key) ?? [];
      current.push(allocation);
      grouped.set(key, current);
    });

    return grouped;
  }, [selectedOrder]);
  const calculationPreview = useMemo(() => {
    const subtotal = form.details.reduce((sum, detail) => {
      return sum + detailSubtotal(detail);
    }, 0);

    const discountValue = toNumber(form.discountValue);
    const ppnPercentage = toNumber(form.ppnPercentage, 11);
    const shippingCost = toNumber(form.shippingCost);

    const rawDiscountAmount =
      form.discountType === "percentage"
        ? (subtotal * Math.max(0, discountValue)) / 100
        : Math.max(0, discountValue);
    const discountAmount = Math.min(rawDiscountAmount, subtotal);
    const dppAmount = subtotal - discountAmount;
    const ppnAmount = dppAmount * (Math.max(0, ppnPercentage) / 100);
    const grandTotal = dppAmount + ppnAmount + Math.max(0, shippingCost);

    return {
      subtotal,
      discountAmount,
      dppAmount,
      ppnAmount,
      shippingCost: Math.max(0, shippingCost),
      grandTotal,
    };
  }, [
    form.details,
    form.discountType,
    form.discountValue,
    form.ppnPercentage,
    form.shippingCost,
  ]);

  const fetchOrders = async (nextPage = page, nextPageSize = pageSize) => {
    try {
      setIsLoading(true);
      const response = await salesOrderService.getSalesOrders({
        page: nextPage,
        limit: nextPageSize,
        soNumber: search || undefined,
        status: (statusFilter as SalesOrderStatus) || undefined,
      });
      const payload = unwrapData<ListPayload<ISalesOrder>>(response);
      setOrders(Array.isArray(payload.data) ? payload.data : []);
      setPage(payload.meta?.current_page ?? nextPage);
      setPageSize(payload.meta?.per_page ?? nextPageSize);
      setLastPage(payload.meta?.last_page ?? 1);
      setTotalRows(payload.meta?.total ?? payload.data?.length ?? 0);
    } catch (error) {
      openSwal({
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
      const ItemResponse = await salesOrderService.getInventoryItems({
        page: 1,
        limit: 200,
      });
      const ItemPayload = unwrapData<ListPayload<ISalesOrderItem>>(ItemResponse);
      const availableItems = Array.isArray(ItemPayload.data)
        ? ItemPayload.data.filter((item) => (item.stock ?? 0) > 0)
        : [];
      setItems(availableItems);
    } catch {
      setItems([]);
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
    const discountType: "nominal" | "percentage" = "nominal";
    const discountValue = String(order.discountAmount ?? 0);
    const baseAmount = Number(order.subtotal ?? 0) - Number(order.discountAmount ?? 0);
    const ppnPercentage =
      baseAmount > 0 ? String((Number(order.ppnAmount ?? 0) / baseAmount) * 100) : "11";

    setForm({
      customerId: String(order.customerId ?? ""),
      soNumber: order.soNumber ?? "",
      orderDate: order.orderDate?.slice(0, 10) ?? "",
      paymentMethod: order.paymentMethod ?? "cash",
      paymentTermDays: order.paymentTermDays ? String(order.paymentTermDays) : "",
      discountType,
      discountValue,
      ppnPercentage,
      shippingCost: String(order.shippingCost ?? 0),
      shippingAddress: order.shippingAddress ?? "",
      notes: order.notes ?? "",
      details:
        order.details?.map((item) => ({
          itemId: String(item.itemId),
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
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
      openSwal({
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
      openSwal({
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

  const setDetailItem = (index: number, itemId: string) => {
    const selectedItem =
      itemById.get(itemId) ??
      formItemOptions.find((item) => String(item.id) === itemId);
    setForm((prev) => ({
      ...prev,
      details: prev.details.map((item, idx) =>
        idx === index
          ? {
              ...item,
              itemId,
              unitPrice: String(selectedItem?.unitPrice ?? 0),
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
        { itemId: "", quantity: "1", unitPrice: "0" },
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
    discountType: form.discountType,
    discountValue: toNumber(form.discountValue),
    ppnPercentage: toNumber(form.ppnPercentage, 11),
    shippingCost: toNumber(form.shippingCost),
    shippingAddress: form.shippingAddress.trim() || undefined,
    notes: form.notes.trim() || undefined,
    details: form.details.map((item) => ({
      itemId: toNumber(item.itemId),
      quantity: toNumber(item.quantity),
    })),
  });

  const buildUpdatePayload = (): IUpdateSalesOrderPayload => ({
    customerId: toNumber(form.customerId),
    soNumber: form.soNumber.trim(),
    orderDate: form.orderDate,
    details: form.details.map((item) => ({
      itemId: toNumber(item.itemId),
      quantity: toNumber(item.quantity),
    })),
    paymentMethod: form.paymentMethod,
    paymentTermDays: form.paymentTermDays ? toNumber(form.paymentTermDays) : undefined,
    discountType: form.discountType,
    discountValue: toNumber(form.discountValue),
    ppnPercentage: toNumber(form.ppnPercentage, 11),
    shippingCost: toNumber(form.shippingCost),
    shippingAddress: form.shippingAddress.trim() || undefined,
    notes: form.notes.trim() || undefined,
  });

  const validateCreatePayload = (payload: ICreateSalesOrderPayload): string | null => {
    if (!payload.customerId || !payload.soNumber || !payload.orderDate) {
      return "Customer, SO number, dan tanggal order wajib diisi.";
    }
    if (payload.paymentMethod === "termin" && (!payload.paymentTermDays || payload.paymentTermDays <= 0)) {
      return "Payment term (hari) wajib diisi untuk metode pembayaran termin.";
    }
    if ((payload.discountValue ?? 0) < 0 || (payload.shippingCost ?? 0) < 0) {
      return "Diskon dan biaya kirim tidak boleh bernilai negatif.";
    }
    if ((payload.ppnPercentage ?? 11) < 0 || (payload.ppnPercentage ?? 11) > 100) {
      return "PPN harus di antara 0 sampai 100 persen.";
    }

    if (!payload.details.length) {
      return "Minimal 1 detail order wajib diisi.";
    }

    const hasInvalid = payload.details.some(
      (item) =>
        !item.itemId || item.quantity <= 0,
    );
    if (hasInvalid) {
      return "Item dan quantity pada detail wajib valid.";
    }

    const hasUnsetPrice = form.details.some((detail) => toNumber(detail.unitPrice) <= 0);
    if (hasUnsetPrice) {
      return "Harga item belum diset di Inventory Item Master.";
    }

    const hasOverStock = payload.details.some((detail, index) => {
      const draft = form.details[index];
      const selectedItem = itemById.get(String(draft?.itemId || detail.itemId));
      if (!selectedItem) return false;
      const stock = selectedItem?.stock ?? 0;
      return detail.quantity > stock;
    });

    if (hasOverStock) {
      return "Quantity melebihi stok item yang tersedia.";
    }

    return null;
  };

  const validateUpdatePayload = (payload: IUpdateSalesOrderPayload): string | null => {
    if (!payload.customerId || !payload.soNumber || !payload.orderDate) {
      return "Customer, SO number, dan tanggal order wajib diisi.";
    }
    if (payload.paymentMethod === "termin" && (!payload.paymentTermDays || payload.paymentTermDays <= 0)) {
      return "Payment term (hari) wajib diisi untuk metode pembayaran termin.";
    }
    if ((payload.discountValue ?? 0) < 0 || (payload.shippingCost ?? 0) < 0) {
      return "Diskon dan biaya kirim tidak boleh bernilai negatif.";
    }
    if ((payload.ppnPercentage ?? 11) < 0 || (payload.ppnPercentage ?? 11) > 100) {
      return "PPN harus di antara 0 sampai 100 persen.";
    }

    if (!payload.details?.length) {
      return "Minimal 1 detail order wajib diisi.";
    }

    const hasInvalid = payload.details.some(
      (item) => !item.itemId || item.quantity <= 0,
    );
    if (hasInvalid) {
      return "Item dan quantity pada detail wajib valid.";
    }

    const hasUnsetPrice = form.details.some((detail) => toNumber(detail.unitPrice) <= 0);
    if (hasUnsetPrice) {
      return "Harga item belum diset di Inventory Item Master.";
    }

    const hasOverStock = payload.details.some((detail, index) => {
      const draft = form.details[index];
      const selectedItem = itemById.get(String(draft?.itemId || detail.itemId));
      if (!selectedItem) return false;
      const stock = selectedItem?.stock ?? 0;
      return detail.quantity > stock;
    });

    if (hasOverStock) {
      return "Quantity melebihi stok item yang tersedia.";
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
          openSwal({
            icon: "warning",
            title: validationError,
            toast: true,
            position: "top-right",
            timer: 2200,
            showConfirmButton: false,
          });
          return;
        }
        await salesOrderService.createSalesOrder(createPayload);
        openSwal({
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
        const validationError = validateUpdatePayload(updatePayload);
        if (validationError) {
          openSwal({
            icon: "warning",
            title: validationError,
            toast: true,
            position: "top-right",
            timer: 2200,
            showConfirmButton: false,
          });
          return;
        }
        await salesOrderService.updateSalesOrder(selectedOrder.id, updatePayload);
        openSwal({
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
      await fetchLookups();
    } catch (error) {
      openSwal({
        icon: "error",
        title: "Gagal menyimpan sales order",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrder = async (id: number) => {
    const confirmation = await openSwal({
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
      await fetchLookups();
      openSwal({
        icon: "success",
        title: "Sales order berhasil dihapus",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-right",
      });
    } catch (error) {
      openSwal({
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
        const shippingDateResult = await openSwal({
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

        const shippingNotesResult = await openSwal({
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
        const receivedByResult = await openSwal({
          title: "Diterima oleh",
          input: "text",
          showCancelButton: true,
          inputValidator: (value) => (!value ? "Nama penerima wajib diisi" : null),
        });
        if (!receivedByResult.isConfirmed || !receivedByResult.value) return;

        const notesResult = await openSwal({
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
        const reasonResult = await openSwal({
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
      await fetchLookups();
      openSwal({
        icon: "success",
        title: "Status sales order berhasil diperbarui",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-right",
      });
    } catch (error) {
      openSwal({
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
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
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
            <Button variant="outline" onClick={() => fetchOrders(1, pageSize)}>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open actions</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-center">
                                Actions
                              </DropdownMenuLabel>
                              <div className="flex flex-col gap-2 p-1">
                                <DropdownMenuItem
                                  className={`${actionItemClassName} border-slate-300`}
                                  onClick={() => openDetail(order.id)}
                                >
                                  <Eye className="text-slate-600" />
                                  Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={`${actionItemClassName} border-yellow-500`}
                                  onClick={() => openEdit(order)}
                                  disabled={
                                    order.status !== "pending_approval" &&
                                    order.status !== "approved"
                                  }
                                >
                                  <Edit3 className="text-yellow-500" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={`${actionItemClassName} border-emerald-500`}
                                  onClick={() => callStatusAction(order.id, "approve")}
                                  disabled={order.status !== "pending_approval"}
                                >
                                  <ShieldCheck className="text-emerald-600" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={`${actionItemClassName} border-blue-500`}
                                  onClick={() => callStatusAction(order.id, "accept")}
                                  disabled={order.status !== "approved"}
                                >
                                  <Check className="text-blue-500" />
                                  Accept
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={`${actionItemClassName} border-amber-500`}
                                  onClick={() => callStatusAction(order.id, "ready")}
                                  disabled={order.status !== "processing"}
                                >
                                  <PackageCheck className="text-amber-500" />
                                  Ready
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={`${actionItemClassName} border-cyan-500`}
                                  onClick={() => callStatusAction(order.id, "shipment")}
                                  disabled={order.status !== "ready_to_ship"}
                                >
                                  <Send className="text-cyan-500" />
                                  Shipment
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={`${actionItemClassName} border-emerald-600`}
                                  onClick={() => callStatusAction(order.id, "complete")}
                                  disabled={order.status !== "shipped"}
                                >
                                  <Check className="text-emerald-600" />
                                  Complete
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={`${actionItemClassName} border-slate-500`}
                                  onClick={() => callStatusAction(order.id, "cancel")}
                                  disabled={
                                    order.status === "completed" ||
                                    order.status === "cancelled"
                                  }
                                >
                                  <Ban className="text-slate-600" />
                                  Cancel
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={`${actionItemClassName} border-red-500`}
                                  onClick={() => deleteOrder(order.id)}
                                  disabled={order.status !== "pending_approval"}
                                >
                                  <Trash2 className="text-red-500" />
                                  Delete
                                </DropdownMenuItem>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {orders.length} dari total {totalRows} data
            </p>
            <div className="flex items-center gap-2">
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={String(pageSize)}
                onChange={(event) => {
                  const nextSize = Number(event.target.value);
                  setPage(1);
                  setPageSize(nextSize);
                  void fetchOrders(1, nextSize);
                }}
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} / halaman
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => void fetchOrders(page - 1, pageSize)}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <span className="text-sm">
                Halaman {page} / {lastPage}
              </span>
              <Button
                variant="outline"
                onClick={() => void fetchOrders(page + 1, pageSize)}
                disabled={page >= lastPage}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Ubah Sales Order" : "Tambah Sales Order"}</DialogTitle>
            <DialogDescription>Lengkapi data order sesuai kebutuhan operasional.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <section className="rounded-lg border bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-iprimary-blue" />
                <h3 className="text-sm font-semibold text-slate-900">Informasi Order</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer</Label>
                  <select
                    id="customerId"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
                    className="min-h-20"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(event) => setField("notes", event.target.value)}
                    className="min-h-20"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-lg border bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-iprimary-blue" />
                <h3 className="text-sm font-semibold text-slate-900">Pembayaran & Pajak</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
                    disabled={form.paymentMethod !== "termin"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType">Tipe Diskon</Label>
                  <select
                    id="discountType"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={form.discountType}
                    onChange={(event) => setField("discountType", event.target.value)}
                  >
                    <option value="nominal">Nominal (Rp)</option>
                    <option value="percentage">Persen (%)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Nilai Diskon {form.discountType === "percentage" ? "(%)" : "(Rp)"}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={form.discountValue}
                    onChange={(event) => setField("discountValue", event.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="ppnPercentage">PPN (%)</Label>
                  <Input
                    id="ppnPercentage"
                    type="number"
                    value={form.ppnPercentage}
                    onChange={(event) => setField("ppnPercentage", event.target.value)}
                  />
                </div>
              </div>
            </section>

            {canManageDetails && (
              <section className="rounded-lg border bg-white p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-iprimary-blue" />
                    <h3 className="text-sm font-semibold text-slate-900">Detail Item</h3>
                  </div>
                  <Button variant="outline" onClick={addDetailRow} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {form.details.map((detail, index) => (
                    <div key={`detail-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-800">Item #{index + 1}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => removeDetailRow(index)}
                          disabled={form.details.length === 1}
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                          aria-label="Hapus item"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                        <div className="space-y-2 md:col-span-5">
                          <Label>Item</Label>
                          <select
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            value={detail.itemId}
                            onChange={(event) => setDetailItem(index, event.target.value)}
                          >
                            <option value="">Pilih Item</option>
                            {formItemOptions.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.itemName} - stok {item.stock ?? 0} - {formatCurrency(item.unitPrice)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min={1}
                            value={detail.quantity}
                            onChange={(event) => setDetailField(index, "quantity", event.target.value)}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Harga Master</Label>
                          <div className="flex h-10 items-center rounded-md border bg-white px-3 text-sm font-medium text-slate-800">
                            {formatCurrency(toNumber(detail.unitPrice))}
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-3">
                          <Label>Subtotal</Label>
                          <div className="flex h-10 items-center rounded-md border bg-white px-3 text-sm font-semibold text-slate-900">
                            {formatCurrency(detailSubtotal(detail))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-lg border bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-iprimary-blue" />
                  <h3 className="text-sm font-semibold text-slate-900">Preview Perhitungan</h3>
                </div>
                <Badge variant="outline" className="bg-white text-xs">
                  Diskon: {form.discountType === "percentage" ? "Persen (%)" : "Nominal (Rp)"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                <SummaryValue label="Subtotal" value={formatCurrency(calculationPreview.subtotal)} />
                <SummaryValue label="Diskon" value={formatCurrency(calculationPreview.discountAmount)} />
                <SummaryValue label="DPP" value={formatCurrency(calculationPreview.dppAmount)} />
                <SummaryValue label="PPN" value={formatCurrency(calculationPreview.ppnAmount)} />
                <SummaryValue label="Biaya Kirim" value={formatCurrency(calculationPreview.shippingCost)} />
                <SummaryValue label="Grand Total" value={formatCurrency(calculationPreview.grandTotal)} strong />
              </div>
            </section>
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
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Alokasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.details?.length ? (
                      selectedOrder.details.map((detail) => (
                        <TableRow key={detail.id}>
                          <TableCell>{detail.item?.itemName ?? detail.itemId}</TableCell>
                          <TableCell>{detail.quantity}</TableCell>
                          <TableCell>{formatCurrency(detail.unitPrice)}</TableCell>
                          <TableCell>{formatCurrency(detail.subtotal)}</TableCell>
                          <TableCell>
                            {allocationsByDetail.get(detail.id)?.length ? (
                              <div className="space-y-1 text-xs">
                                {(allocationsByDetail.get(detail.id) ?? []).map((allocation) => (
                                  <div key={allocation.id} className="rounded border px-2 py-1">
                                    <p className="font-medium">{allocation.barcode}</p>
                                    <p className="text-muted-foreground">
                                      {allocation.status.replaceAll("_", " ")} - {formatDate(allocation.allocatedAt)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Belum ada alokasi</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
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
