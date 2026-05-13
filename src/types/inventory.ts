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

export interface IReserveInvPayload {
  salesOrderId: number;
  notes?: string;
}
