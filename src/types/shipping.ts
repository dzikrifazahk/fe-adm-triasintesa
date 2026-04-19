import { ISalesOrder } from "./sales-order";

export type DeliveryOrderStatus = "pending" | "in_transit" | "delivered" | "returned";

export interface IDeliveryOrder {
  id: number;
  doNumber: string;
  salesOrderId: number;
  deliveryDate: string;
  deliveryTime: string;
  driverName: string;
  vehicleNumber: string;
  vehicleType: string;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  status: DeliveryOrderStatus;
  deliveredAt?: string;
  deliveryProofPhoto?: string;
  reminderSent?: boolean;
  reminderSentAt?: string;
  reminderSentTo?: string[];
  notes?: string;
  salesOrder?: ISalesOrder;
}

export interface IDeliveryOrderQuery {
  page?: number;
  limit?: number;
  doNumber?: string;
  salesOrderId?: number;
  status?: DeliveryOrderStatus;
  deliveryDate?: string;
  driverName?: string;
}

export interface ICreateDeliveryOrderPayload {
  salesOrderId: number;
  doNumber: string;
  deliveryDate: string;
  deliveryTime: string;
  driverName: string;
  vehicleNumber: string;
  vehicleType: string;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  notes?: string;
}

export interface ICreateDeliveryFromSalesOrderPayload {
  salesOrderId: number;
  deliveryDate: string;
  deliveryTime: string;
  driverName: string;
  vehicleNumber: string;
  vehicleType: string;
  shippingAddress?: string;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
}

export interface IUpdateDeliveryOrderPayload {
  salesOrderId?: number;
  doNumber?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  driverName?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  shippingAddress?: string;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
  status?: DeliveryOrderStatus;
}

export interface ISendDeliveryReminderPayload {
  recipients: string[];
  message?: string;
}

