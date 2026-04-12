export interface IPublicationCategory {
  version?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  id: string;
  name: string;
  description?: string;
  slug: string;
}

export interface IPublicationCategoryUpsert {
  name: string;
  slug: string;
  description?: string;
}
