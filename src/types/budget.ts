import { IAttendance } from "./attendance";
import { IPurchase } from "./purchase";

export interface IBudget {
  id: string;
  project: {
    id: string;
    name: string;
  };
  nama_budget: string;
  type: {
    id: string;
    type_budget: string;
  };
  total_nominal: number;
  has_items: boolean;
  budget_item?: IBudgetItem[];
  real_cost?: number;
  created_at: string;
  updated_at: string;
  children?: {
    id: number | string;
    title: string;
    type: string;
    total: number;
  }[];
}

export interface IAddOrUpdateBudget {
  project_id: string;
  nama_budget: string;
  type: string;
  total_nominal: number | null;
  items?: IBudgetItem[];
}

export interface IBudgetItem {
  name: string;
  unit: string;
  nominal_per_unit: number;
  qty: number;
  total_item_price?: number;
}
