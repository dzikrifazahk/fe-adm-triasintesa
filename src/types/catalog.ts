export type CatalogCategory = "PRODUCTS" | "SERVICES";

export interface ICatalog {
  version?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  id: string;
  title: string;
  content?: string;
  slug: string;
  featuredImage?: string;
  featuredImageBase64?: string | null;
  featuredImageBase64Error?: string;
  category?: CatalogCategory;
  isActive: boolean;
}

export interface ICatalogUpsert {
  title: string;
  slug: string;
  content?: string;
  featuredImage?: string;
  category?: CatalogCategory;
  isActive?: boolean;
}
