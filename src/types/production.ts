import { ITank } from "./tanks";
import { ICreator } from "./user";

export interface IProductionPlan {
  version: number;
  startDate: string;
  endDate: string;
  tankId: number;
  targetBatches: number;
  targetJirigenTotal: number;
  notes: string;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedBy: string;
  deletedAt: string;
  id: number;
  tank: ITank;
  creator: ICreator;
}

export interface IAddOrUpdateProductionPlan {
  startDate: string;
  endDate: string;
  tankId: number;
  targetBatches: number;
  targetJirigenTotal: number;
  notes: string;
  status?: string;
}

export interface IProductionBatch {
  id: number;
  batchNumber: string;
  tankId: number;
  planId: number;
  startDate: string;
  endDate: string;
  rawMaterialVolume: number;
  targetQuantityJirigen: number;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAddProductionBatch {
  batchNumber: string;
  tankId: number;
  planId: number;
  startDate: string;
  endDate: string;
  rawMaterialVolume: number;
  targetQuantityJirigen: number;
  notes: string;
}

export interface IProductionJirigen {
  id: number;
  batchId: number;
  jirigenNumber: number;
  volumeLiter: number;
  productionDatetime: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAddProductionJirigen {
  batchId: number;
  jirigenNumber: number;
  volumeLiter: number;
  productionDatetime: string;
  notes: string;
}
