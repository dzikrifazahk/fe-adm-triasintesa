export interface IAddOrUpdateInventoryLocation {
  locationCode: string;
  locationName: string;
  status: string;
  notes: string;
}

export interface IInventoryLocations {
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string;
  deletedBy: string;
  id: number;
  locationCode: string;
  locationName: string;
  status: string;
  notes: string;
}
