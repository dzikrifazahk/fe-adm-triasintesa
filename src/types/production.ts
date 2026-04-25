import { ITank } from "./tanks";
import { ICreator } from "./user";

export interface IProductionPlanQcSummary {
  totalBatches: number;
  approved: number;
  pending: number;
  rejected: number;
}

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
  qcSummary?: IProductionPlanQcSummary;
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
  productionStatus?: string;
  hasApprovedQc?: boolean;
  qcInspectionCount?: number;
  latestQcInspection?: {
    id: number;
    qcNumber: string;
    finalStatus: string;
    inspectionDate?: string;
  } | null;
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

export type IUpdateProductionBatch = IAddProductionBatch

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
