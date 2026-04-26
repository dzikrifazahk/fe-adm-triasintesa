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

export interface IInvJirigen {
  id: number;
  jirigenId: number;
  batchId: number;
  barcode: string;
  status: InventoryStatus;
  locationId: number;
  entryDate: string;
  entryBy: string;
  qcStatus: string;
  expiryDate?: string | null;
  lastUpdated?: string | null;
  location?: IInventoryLocation;
  batch?: {
    id: number;
    batchNumber?: string;
  };
}

export interface IInvMovement {
  id: number;
  jirigenId: number;
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
  barcode: string;
  locationId: number;
  qcStatus: string;
  expiryDate?: string;
}

export interface IReserveInvPayload {
  salesOrderId: number;
  notes?: string;
}
