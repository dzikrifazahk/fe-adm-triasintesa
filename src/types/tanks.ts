export type TankType = "raw_material" | "softener" | "output_water";

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
  tankType: TankType;
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
  tankType: TankType;
  status: string;
  notes: string;
}
