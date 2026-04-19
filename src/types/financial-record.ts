export type FlashCashStatus = "pending" | "approved" | "rejected";
export type InvoiceStatus =
  | "draft"
  | "issued"
  | "partial_paid"
  | "paid"
  | "overdue"
  | "cancelled";
export type ReimbursementStatus = "pending" | "approved" | "rejected";
export type ManPowerStatus = "pending" | "approved" | "rejected" | "paid";

export interface IFlashCashRecord {
  id: number;
  transactionDate: string;
  type: "in" | "out";
  category: string;
  amount: number;
  description: string;
  referenceType: string;
  referenceId?: number;
  requiresApproval?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface IReimbursementRecord {
  id: number;
  expenseDate: string;
  category: string;
  amount: number;
  description: string;
  receiptFile?: string;
  status: ReimbursementStatus;
  requestedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface IInvoiceRecord {
  id: number;
  invoiceNumber: string;
  salesOrderId: number;
  customerId: number;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: string;
  paymentTermDays?: number;
  status: InvoiceStatus;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
}

export interface IManPowerRecord {
  id: number;
  recordDate: string;
  recordType: string;
  amount: number;
  description: string;
  status: ManPowerStatus;
  notes?: string;
  paidAt?: string;
  rejectionReason?: string;
}

