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

export interface ITankDecreasePayload {
  tankId: number;
  volumeReduced: number;
  notes?: string;
}

export interface ITankIncreasePayload {
  tankId: number;
  volumeAdded: number;
  notes?: string;
}

export interface ITankLog {
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string;
  deletedBy: string;
  id: number;
  tankId: number;
  refillDatetime: string;
  volumeAdded: string;
  operatorId: string;
  notes: string;
  tank: {
    id: number;
    tankCode: string;
    tankName: string;
    location: string;
    status: string;
  };
  operator: {
    id: string;
    username: string;
    email: string;
  };
  direction: string;
  volumeIn: number;
  volumeOut: number;
}
