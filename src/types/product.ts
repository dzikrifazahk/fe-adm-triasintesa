export interface IProduct {
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
  excerpt?: string;
  featuredImage?: string;
  featuredImageBase64?: string | null;
  featuredImageBase64Error?: string;
  isActive: boolean;
  publishedAt?: string;
}

export interface IProductUpsert {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  isActive?: boolean;
  publishedAt?: string;
}
