export interface ITank {
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string;
  deletedBy: string;
  id: number;
  tankCode: string;
  tankName: string;
  totalCapacity: string;
  currentVolume: string;
  location: string;
  status: string;
  lastRefillDate: string;
  lastUpdated: string;
  notes: string;
}

export interface ITankUpsert {
  tankCode: string;
  tankName: string;
  totalCapacity: number;
  location: string;
  status: string;
  notes: string;
}