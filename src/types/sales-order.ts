export type SalesOrderStatus =
  | "pending_approval"
  | "approved"
  | "processing"
  | "ready_to_ship"
  | "shipped"
  | "completed"
  | "cancelled";

export interface ISalesOrderItem {
  id: number;
  itemCode: string;
  itemName: string;
  stock?: number;
}

export interface ISalesOrderCustomer {
  id: number;
  customerCode: string;
  companyName: string;
  contactPerson: string;
}

export interface ISalesOrderDetail {
  id: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  item?: ISalesOrderItem;
}

export interface ISalesOrderAllocation {
  id: number;
  salesOrderDetailId: number;
  barcode: string;
  allocatedAt: string;
  status: "allocated" | "picked" | "shipped";
}

export interface ISalesOrder {
  id: number;
  soNumber: string;
  customerId: number;
  orderDate: string;
  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  ppnAmount: number;
  shippingCost: number;
  grandTotal: number;
  paymentMethod: string;
  paymentTermDays?: number;
  paymentTermDetail?: unknown;
  status: SalesOrderStatus;
  shippingDate?: string;
  shippingAddress?: string;
  shippingNotes?: string;
  receivedByCustomer?: string;
  receivedAt?: string;
  notes?: string;
  customer?: ISalesOrderCustomer;
  details?: ISalesOrderDetail[];
  allocations?: ISalesOrderAllocation[];
}

export interface ISalesOrderDetailPayload {
  itemId: number;
  quantity: number;
  unitPrice: number;
}

export interface ICreateSalesOrderPayload {
  customerId: number;
  soNumber: string;
  orderDate: string;
  details: ISalesOrderDetailPayload[];
  paymentMethod: string;
  paymentTermDays?: number;
  paymentTermDetail?: unknown;
  discountAmount?: number;
  discountType?: "nominal" | "percentage";
  discountValue?: number;
  ppnPercentage?: number;
  shippingCost?: number;
  shippingAddress?: string;
  notes?: string;
}

export interface IUpdateSalesOrderPayload {
  customerId?: number;
  soNumber?: string;
  orderDate?: string;
  details?: ISalesOrderDetailPayload[];
  paymentMethod?: string;
  paymentTermDays?: number;
  paymentTermDetail?: unknown;
  discountAmount?: number;
  discountType?: "nominal" | "percentage";
  discountValue?: number;
  ppnPercentage?: number;
  shippingCost?: number;
  shippingAddress?: string;
  notes?: string;
}

export interface IProcessShipmentPayload {
  shippingDate: string;
  shippingNotes?: string;
}

export interface ICompleteSalesOrderPayload {
  receivedByCustomer: string;
  notes?: string;
}

export interface ICancelSalesOrderPayload {
  reason: string;
}

export interface ISalesOrderQuery {
  page?: number;
  limit?: number;
  soNumber?: string;
  customerId?: number;
  status?: SalesOrderStatus;
  orderDate?: string;
}

