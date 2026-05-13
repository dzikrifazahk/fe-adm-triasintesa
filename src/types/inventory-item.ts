export interface IAddOrUpdateInventoryItem {
  itemCode: string;
  itemName: string;
  uom?: string;
  category?: string;
}

export interface IInventoryItem {
  id: number;
  itemCode: string;
  itemName: string;
  uom?: string | null;
  category?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
