import { IPublicationCategory } from "./publication-category";

export interface IPublicationPost {
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
  categoryId?: string | null;
  category?: IPublicationCategory | null;
}

export interface IPublicationPostUpsert {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  isActive?: boolean;
  publishedAt?: string;
  categoryId?: string | null;
}
