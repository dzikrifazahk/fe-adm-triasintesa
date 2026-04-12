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
  planDate: string;
  tankId: number;
  targetBatches: number;
  targetJirigenTotal: number;
  notes: string;
}
