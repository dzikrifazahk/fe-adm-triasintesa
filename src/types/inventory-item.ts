export interface IAddOrUpdateInventoryItem {
  itemCode: string;
  itemName: string;
  uom?: string;
  category?: string;
  stock?: number;
  unitPrice?: number;
  minStock?: number;
  // Company profile / public URL fields (merged from product module)
  isPublicActive?: boolean;
  slug?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  catalog?: string;
  publishedAt?: string;
}

export interface IInventoryItem {
  id: number;
  itemCode: string;
  itemName: string;
  uom?: string | null;
  category?: string | null;
  stock: number;
  unitPrice: number;
  minStock?: number;
  isActive: boolean;
  // Company profile / public URL fields (merged from product module)
  isPublicActive?: boolean;
  slug?: string | null;
  content?: string | null;
  excerpt?: string | null;
  featuredImage?: string | null;
  featuredImageBase64?: string | null;
  catalog?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
