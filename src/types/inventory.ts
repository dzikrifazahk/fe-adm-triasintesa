export type InventoryStatus =
  | "available"
  | "reserved"
  | "sold"
  | "shipped"
  | "returned";

export interface IInventoryLocation {
  id: number;
  locationCode: string;
  locationName: string;
  status: "active" | "inactive";
  notes?: string | null;
}

export interface IInventoryItemMaster {
  id: number;
  itemCode: string;
  itemName: string;
  uom?: string | null;
  category?: string | null;
  stock: number;
  isActive: boolean;
}

export interface IInvJirigen {
  id: number;
  itemId?: number | null;
  jirigenId?: number | null;
  batchId?: number | null;
  barcode: string;
  status: InventoryStatus;
  locationId: number;
  entryDate: string;
  entryBy: string;
  expiryDate?: string | null;
  lastUpdated?: string | null;
  location?: IInventoryLocation;
  item?: IInventoryItemMaster;
  batch?: {
    id: number;
    batchNumber?: string;
  };
}

export interface IInvMovement {
  id: number;
  itemId?: number | null;
  jirigenId?: number | null;
  invJirigenId?: number | null;
  movementType: string;
  fromStatus: string;
  toStatus: string;
  fromLocationId?: number | null;
  toLocationId?: number | null;
  quantity: number;
  referenceType: string;
  referenceId?: number | null;
  movedBy: string;
  movementDatetime: string;
  notes?: string | null;
  fromLocation?: IInventoryLocation;
  toLocation?: IInventoryLocation;
}

export interface IScanInPayload {
  itemId?: number;
  barcode: string;
  locationId: number;
  expiryDate?: string;
}

export interface IBarcodeInfo {
  barcode: string;
  source: "production" | "unknown";
  alreadyInInventory: boolean;
  inventory: {
    id: number;
    status: string;
    itemName?: string;
    itemCode?: string;
    uom?: string | null;
    locationName?: string;
    locationCode?: string;
    entryDate?: string | null;
    expiryDate?: string | null;
    movements: Array<{
      movementType: string;
      fromStatus: string;
      toStatus: string;
      referenceType: string;
      notes: string | null;
      movementDatetime: string;
      fromLocation?: string | null;
      toLocation?: string | null;
    }>;
  } | null;
  production: {
    jirigenId: number;
    jirigenNumber: number;
    sequence: number;
    volumeLiter: number;
    productionDatetime: string;
    isScanned: boolean;
    status: string;
    batchId: number;
    batchNumber: string;
    planId: number | null;
  } | null;
  item: { id: number; itemCode: string; itemName: string; uom?: string } | null;
  coa: { coaNumber: string; productName: string; expiryDate: string; conclusion: string } | null;
  qc: { qcNumber: string; finalStatus: string } | null;
  warnings: string[];
}

export interface IInventorySummary {
  totals: {
    inStock: number;
    available: number;
    reserved: number;
    expiringSoon: number;
    movementsToday: number;
  };
  locations: Array<{
    id: number;
    code: string;
    name: string;
    available: number;
    reserved: number;
    categories: Array<{ category: string; available: number; reserved: number }>;
  }>;
  categories: string[];
  activity: Array<{
    id: number;
    datetime: string;
    itemName: string | null;
    itemCode: string | null;
    barcode: string | null;
    location: string | null;
    movementType: string;
    fromStatus: string;
    toStatus: string;
    quantity: number;
    currentStatus: string;
  }>;
}

export type ManualStockInSource = "purchase" | "opening_stock" | "other";

export interface IManualStockInPayload {
  itemId: number;
  quantity: number;
  locationId: number;
  source: ManualStockInSource;
  referenceNo?: string;
  entryDate?: string;
  expiryDate?: string;
  notes?: string;
}

export interface IManualStockInResult {
  count: number;
  barcodes: string[];
}

export interface IReserveInvPayload {
  salesOrderId: number;
  notes?: string;
}
