import { IBudget } from "./budget";
import { CommonColumn } from "./common";

export interface IPurchase {
  doc_no: string;
  doc_type: string;
  purchase_type: {
    id: number;
    name: string;
  };
  tab_purchase: {
    id: number;
    name: string;
  };
  status_purchase: {
    id: number;
    name: string;
    note?: string;
  };
  rejected_notification: string;
  log_purchase: {
    tab: {
      id: number;
      name: string;
    };
    status: {
      id: number;
      name: string;
    };
    name: string;
    note_reject: string;
    is_rejected: boolean;
    created_at: string;
  };
  description: string;
  remarks: string;
  file_bukti_pembelian_product_purchases: IEvidencePurchase[];
  date_start_create_purchase: string;
  due_date_end_purchase: string;
  status_exceeding_budget_project_purchase: string;
  budget: {
    budget_id: string;
    nama_budget: string;
    total_nominal_budget: number;
  };
  project_id: string;
  project: {
    id: string;
    name: string;
    budgets: IBudget[];
    total_nominal_budget_keseluruhan: string;
  };
  purchase_event_type: {
    id: number;
    name: string;
  };
  products: IProduct[];
  file_bukti_pembayaran_product_purchases: [];
  tanggal_pembayaran_purchase: null;
  sub_total_purchase: number;
  pph: {
    rate: number;
    amount: number;
  };
  total: number;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    name: string;
  };
  po_no?: string;
  reff?: string;
}

export interface IEvidencePurchase {
  id: number;
  name: string;
  link: string;
  type_file: string;
}

export interface IProduct {
  id: number;
  vendor: {
    id: number;
    name: string;
  };
  product_name: string;
  harga: number;
  stok: number;
  unit: string;
  subtotal_harga_product: number;
  ppn: {
    rate: number;
    amount: number;
  };
}

export interface VendorWithProducts {
  doc_no_spb?: string;
  vendor_name: string;
  vendor_id?: number;
  status_vendor?: string;
  payment_date?: string;
  file_payment?: string;
  products: IPurchase[];
}

export interface IAcceptPurchase {
  pph_id?: string;
}

export interface IRejectPurchase {
  note: string;
}

export interface IPurchaseCounting {
  submit: {
    count: number;
    total: number;
  };
  verified: {
    count: number;
    total: number;
  };
  payment_request: {
    count: number;
    total: number;
  };
  paid: {
    count: number;
    total: number;
  };
}
