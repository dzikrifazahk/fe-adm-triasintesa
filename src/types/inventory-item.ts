export interface IAddOrUpdateInventoryItem {
  itemCode: string;
  itemName: string;
  uom?: string;
  category?: string;
  stock?: number;
}

export interface IInventoryItem {
  id: number;
  itemCode: string;
  itemName: string;
  uom?: string | null;
  category?: string | null;
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
