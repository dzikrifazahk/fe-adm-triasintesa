"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getDictionary } from "../../../get-dictionary";
import { useLoading } from "@/context/loadingContext";
import { inventoryService } from "@/services";
import {
  IInvJirigen,
  IInvMovement,
  IInventoryLocation,
  InventoryStatus,
  IScanInPayload,
} from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>["inventory_page_dic"];

type Envelope<T> = { data: T };
type ListPayload<T> = { data: T[]; meta?: unknown };

type ScanInForm = {
  barcode: string;
  locationId: string;
  qcStatus: string;
  expiryDate: string;
};

const emptyScanInForm: ScanInForm = {
  barcode: "",
  locationId: "",
  qcStatus: "PASS",
  expiryDate: "",
};

const statusOptions: InventoryStatus[] = [
  "available",
  "reserved",
  "shipped",
  "sold",
  "returned",
];

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
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID");
}

function statusClassName(status: InventoryStatus): string {
  if (status === "available") return "bg-emerald-600 text-white";
  if (status === "reserved") return "bg-amber-600 text-white";
  if (status === "shipped") return "bg-blue-600 text-white";
  if (status === "sold") return "bg-violet-600 text-white";
  return "bg-slate-600 text-white";
}

export default function InventoryMain({ dictionary }: { dictionary: Dictionary }) {
  const { setIsLoading } = useLoading();
  const [activeTab, setActiveTab] = useState("stock");
  const [stocks, setStocks] = useState<IInvJirigen[]>([]);
  const [movements, setMovements] = useState<IInvMovement[]>([]);
  const [locations, setLocations] = useState<IInventoryLocation[]>([]);

  const [searchBarcode, setSearchBarcode] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isScanInOpen, setIsScanInOpen] = useState(false);
  const [scanInForm, setScanInForm] = useState<ScanInForm>(emptyScanInForm);

  const title = dictionary?.title ?? "Inventory";
  const description =
    dictionary?.description ??
    "Kelola stok inventory jirigen, scan-in barang, dan monitor pergerakan inventory.";

  const fetchStocks = async () => {
    const response = await inventoryService.getInvJirigen({
      page: 1,
      limit: 100,
      barcode: searchBarcode || undefined,
      status: statusFilter || undefined,
    });
    const payload = unwrapData<ListPayload<IInvJirigen>>(response);
    setStocks(Array.isArray(payload?.data) ? payload.data : []);
  };

  const fetchMovements = async () => {
    const response = await inventoryService.getRecentInvMovements(30);
    const payload = unwrapData<IInvMovement[] | ListPayload<IInvMovement>>(response);
    if (Array.isArray(payload)) {
      setMovements(payload);
      return;
    }
    setMovements(Array.isArray(payload?.data) ? payload.data : []);
  };

  const fetchLocations = async () => {
    const response = await inventoryService.getInvLocations({
      page: 1,
      limit: 200,
      status: "aktif",
    });
    const payload = unwrapData<ListPayload<IInventoryLocation>>(response);
    setLocations(Array.isArray(payload?.data) ? payload.data : []);
  };

  const loadAll = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchStocks(), fetchMovements(), fetchLocations()]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data inventory",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredStockCount = useMemo(
    () => stocks.filter((item) => item.status === "available").length,
    [stocks],
  );

  const submitScanIn = async () => {
    if (!scanInForm.barcode || !scanInForm.locationId || !scanInForm.qcStatus) {
      Swal.fire({ icon: "warning", title: "Lengkapi barcode, lokasi, dan QC status." });
      return;
    }

    const payload: IScanInPayload = {
      barcode: scanInForm.barcode.trim(),
      locationId: toNumber(scanInForm.locationId),
      qcStatus: scanInForm.qcStatus.trim(),
      expiryDate: scanInForm.expiryDate || undefined,
    };

    try {
      setIsLoading(true);
      await inventoryService.scanIn(payload);
      setIsScanInOpen(false);
      setScanInForm(emptyScanInForm);
      await loadAll();
      Swal.fire({
        icon: "success",
        title: "Scan-in berhasil",
        toast: true,
        position: "top-right",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Scan-in gagal",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runReserve = async (row: IInvJirigen) => {
    const salesOrderResult = await Swal.fire({
      title: "Masukkan Sales Order ID",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return "Sales Order ID wajib diisi";
        if (!/^\d+$/.test(value)) return "Sales Order ID harus angka";
        return null;
      },
    });
    if (!salesOrderResult.isConfirmed || !salesOrderResult.value) return;

    const notesResult = await Swal.fire({
      title: "Catatan reservasi (opsional)",
      input: "text",
      inputValue: "",
      showCancelButton: true,
    });
    if (!notesResult.isConfirmed) return;

    try {
      setIsLoading(true);
      await inventoryService.reserveInvJirigen(row.id, {
        salesOrderId: toNumber(salesOrderResult.value),
        notes: notesResult.value || undefined,
      });
      await loadAll();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Reservasi gagal",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runShipOut = async (row: IInvJirigen) => {
    const deliveryOrderResult = await Swal.fire({
      title: "Masukkan Delivery Order ID",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return "Delivery Order ID wajib diisi";
        if (!/^\d+$/.test(value)) return "Delivery Order ID harus angka";
        return null;
      },
    });
    if (!deliveryOrderResult.isConfirmed || !deliveryOrderResult.value) return;

    try {
      setIsLoading(true);
      await inventoryService.shipOutInvJirigen(
        row.id,
        toNumber(deliveryOrderResult.value),
      );
      await loadAll();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Ship out gagal",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runMarkSold = async (row: IInvJirigen) => {
    try {
      const confirm = await Swal.fire({
        icon: "question",
        title: `Tandai barcode ${row.barcode} sebagai sold?`,
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
      });
      if (!confirm.isConfirmed) return;

      setIsLoading(true);
      await inventoryService.markInvJirigenAsSold(row.id);
      await loadAll();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Mark sold gagal",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runReturn = async (row: IInvJirigen) => {
    const locationResult = await Swal.fire({
      title: "Masukkan return Location ID",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return "Return Location ID wajib diisi";
        if (!/^\d+$/.test(value)) return "Return Location ID harus angka";
        return null;
      },
    });
    if (!locationResult.isConfirmed || !locationResult.value) return;

    try {
      setIsLoading(true);
      await inventoryService.returnInvJirigen(row.id, toNumber(locationResult.value));
      await loadAll();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Return gagal",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runUpdateStatus = async (row: IInvJirigen) => {
    const nextStatusResult = await Swal.fire({
      title: "Pilih status baru",
      input: "select",
      inputOptions: statusOptions.reduce<Record<string, string>>((acc, status) => {
        acc[status] = status;
        return acc;
      }, {}),
      inputValue: row.status,
      showCancelButton: true,
    });
    if (!nextStatusResult.isConfirmed || !nextStatusResult.value) return;
    const nextStatus = nextStatusResult.value as InventoryStatus;

    try {
      setIsLoading(true);
      await inventoryService.updateInvJirigenStatus(row.id, nextStatus);
      await loadAll();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update status gagal",
        text: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full space-y-4">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-slate-600">{description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-600 text-white">
              Available: {filteredStockCount}
            </Badge>
            <Badge className="bg-slate-700 text-white">Total Stock: {stocks.length}</Badge>
            <Badge className="bg-blue-600 text-white">
              Movement Today: {movements.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="movement">Movement</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Inventory Stock</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => loadAll()}>
                    Refresh
                  </Button>
                  <Button
                    className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
                    onClick={() => setIsScanInOpen(true)}
                  >
                    Scan In
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <Input
                  placeholder="Cari barcode..."
                  value={searchBarcode}
                  onChange={(event) => setSearchBarcode(event.target.value)}
                />
                <select
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">Semua Status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <Button onClick={() => fetchStocks()}>Apply Filter</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>QC</TableHead>
                      <TableHead>Entry</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-20 text-center">
                          Tidak ada data inventory.
                        </TableCell>
                      </TableRow>
                    ) : (
                      stocks.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.barcode}</TableCell>
                          <TableCell>{row.batch?.batchNumber || row.batchId}</TableCell>
                          <TableCell>
                            {row.location?.locationName || `Location #${row.locationId}`}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusClassName(row.status)}>{row.status}</Badge>
                          </TableCell>
                          <TableCell>{row.qcStatus}</TableCell>
                          <TableCell>{formatDate(row.entryDate)}</TableCell>
                          <TableCell>{formatDate(row.expiryDate)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap justify-end gap-1">
                              {row.status === "available" ? (
                                <Button size="sm" variant="outline" onClick={() => runReserve(row)}>
                                  Reserve
                                </Button>
                              ) : null}
                              {row.status === "reserved" ? (
                                <Button size="sm" onClick={() => runShipOut(row)}>
                                  Ship Out
                                </Button>
                              ) : null}
                              {row.status === "shipped" ? (
                                <Button size="sm" onClick={() => runMarkSold(row)}>
                                  Sold
                                </Button>
                              ) : null}
                              <Button size="sm" variant="outline" onClick={() => runReturn(row)}>
                                Return
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => runUpdateStatus(row)}>
                                Set Status
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
        </TabsContent>

        <TabsContent value="movement">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Movement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-20 text-center">
                          Belum ada movement.
                        </TableCell>
                      </TableRow>
                    ) : (
                      movements.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{formatDate(row.movementDatetime)}</TableCell>
                          <TableCell>{row.movementType}</TableCell>
                          <TableCell>{row.fromStatus}</TableCell>
                          <TableCell>{row.toStatus}</TableCell>
                          <TableCell>
                            {row.referenceType}
                            {row.referenceId ? ` #${row.referenceId}` : ""}
                          </TableCell>
                          <TableCell>{row.notes || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Locations (Active)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-20 text-center">
                          Tidak ada lokasi aktif.
                        </TableCell>
                      </TableRow>
                    ) : (
                      locations.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell>{location.id}</TableCell>
                          <TableCell>{location.locationCode}</TableCell>
                          <TableCell>{location.locationName}</TableCell>
                          <TableCell>{location.status}</TableCell>
                          <TableCell>{location.notes || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isScanInOpen} onOpenChange={setIsScanInOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan In Inventory</DialogTitle>
            <DialogDescription>
              Scan barcode hasil produksi untuk masuk ke inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label>Barcode</Label>
              <Input
                value={scanInForm.barcode}
                onChange={(event) =>
                  setScanInForm((prev) => ({ ...prev, barcode: event.target.value }))
                }
                placeholder="P202603001001"
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                value={scanInForm.locationId}
                onChange={(event) =>
                  setScanInForm((prev) => ({ ...prev, locationId: event.target.value }))
                }
              >
                <option value="">Pilih lokasi</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.locationCode} - {location.locationName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>QC Status</Label>
              <Input
                value={scanInForm.qcStatus}
                onChange={(event) =>
                  setScanInForm((prev) => ({ ...prev, qcStatus: event.target.value }))
                }
                placeholder="PASS"
              />
            </div>

            <div className="space-y-2">
              <Label>Expiry Date (opsional)</Label>
              <Input
                type="date"
                value={scanInForm.expiryDate}
                onChange={(event) =>
                  setScanInForm((prev) => ({ ...prev, expiryDate: event.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScanInOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-iprimary-blue text-white hover:bg-iprimary-blue-tertiary"
              onClick={submitScanIn}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
