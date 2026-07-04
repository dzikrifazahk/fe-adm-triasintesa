export interface IDashboardPeriod {
  from: string;
  to: string;
}

export interface IOrdersDashboardFilter {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  customerId?: string;
}

export interface IOrdersDashboard {
  period: IDashboardPeriod;
  orderVolume: {
    total: number;
    cancelled: number;
    series: { date: string; count: number }[];
  };
  fulfillmentRate: number;
  shippingLeadTimeAvgDays: number;
  deliveryStatusBreakdown: {
    pending: number;
    in_transit: number;
    delivered: number;
    returned: number;
    delayed: number;
  };
  revenue: number;
  revenueTrend: { month: string; revenue: number }[];
  approxCogs: number;
  profitMargin: number;
  cashFlow: {
    cashIn: number;
    cashOut: number;
    net: number;
  };
}

export interface IProductControlDashboardFilter {
  dateFrom?: string;
  dateTo?: string;
  tankId?: string;
}

export interface IProductControlDashboard {
  period: IDashboardPeriod;
  productionYield: {
    actual: number;
    target: number;
    efficiency: number;
    series: { date: string; actual: number; target: number }[];
  };
  qc: {
    breakdown: { pending: number; approved: number; rejected: number };
    passRate: number;
  };
  inventory: {
    movementCount: number;
    movementQuantity: number;
    totalStock: number;
    lowStockItems: {
      id: number;
      itemCode: string;
      itemName: string;
      stock: number;
      minStock: number;
    }[];
    lowStockCount: number;
  };
  tanks: {
    utilization: {
      id: number;
      tankCode: string;
      tankName: string;
      currentVolume: number;
      totalCapacity: number;
      utilizationPct: number;
    }[];
    volumeIn: number;
    volumeOut: number;
  };
}

export interface IFinancialDashboardFilter {
  dateFrom?: string;
  dateTo?: string;
  stage?: string;
  category?: string;
}

export interface IFinancialDashboard {
  period: IDashboardPeriod;
  recordsPerStage: {
    submission: number;
    payment_request: number;
    paid: number;
  };
  unpaidAmount: number;
  paidAmount: number;
  overdueAmount: number;
  categoryBreakdown: { category: string; amount: number }[];
}
